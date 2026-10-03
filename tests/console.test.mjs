import test from "node:test";
import assert from "node:assert/strict";
import { SerialConsole, boundedLog } from "../web/serial.js";
import { readFileSync } from "node:fs";
class Port {
  sent = [];
  async open(options) {
    this.options = options;
    this.readable = new ReadableStream({ start: (c) => (this.input = c) });
    this.writable = new WritableStream({
      write: (b) => this.sent.push(new TextDecoder().decode(b)),
    });
  }
  async setSignals() {}
  async close() {
    this.isClosed = true;
  }
}
test("console uses 115200, receives actual bytes and serializes documented keys", async () => {
  const p = new Port();
  let text = "";
  const c = new SerialConsole((t) => (text += t));
  await c.open(p);
  assert.equal(p.options.baudRate, 115200);
  assert.equal(text, "");
  p.input.enqueue(new TextEncoder().encode("C5VRX diagnostics\n"));
  await new Promise(setImmediate);
  assert.equal(text, "C5VRX diagnostics\n");
  await Promise.all([
    c.send("diagnostics"),
    c.send("channel"),
    c.send("gainUp"),
    c.send("gainDown"),
  ]);
  assert.deepEqual(p.sent, ["d", "c", "+", "-"]);
  await c.close();
  assert.ok(p.isClosed);
});
test("rejects unknown commands and commands without a connected device", async () => {
  const c = new SerialConsole();
  await assert.rejects(c.send("reboot"), /Unsupported/);
  await assert.rejects(c.send("diagnostics"), /Connect/);
});
test("USB stream loss marks connection closed and reports it", async () => {
  const p = new Port();
  let error;
  const c = new SerialConsole(
    () => {},
    (e) => (error = e),
  );
  await c.open(p);
  p.input.close();
  await new Promise(setImmediate);
  assert.ok(c.closed);
  assert.match(error.message, /closed/);
  await c.close();
});
test("retains a bounded tail of the received log", () =>
  assert.equal(boundedLog("abcdef", "ghij", 5), "fghij"));
test("published pin table and BOM retain every upstream DAC mapping", () => {
  const guide = readFileSync(
      new URL("../docs/BUILD.md", import.meta.url),
      "utf8",
    ),
    bom = readFileSync(new URL("../docs/bom.csv", import.meta.url), "utf8");
  for (const [pin, gpio, r] of [
    ["D4", 23, "8.2"],
    ["D5", 24, "3.9"],
    ["D6", 11, "2.0"],
    ["D7", 12, "1.0"],
    ["D8", 8, "470"],
    ["D9", 9, "240"],
  ]) {
    assert.ok(guide.includes(`| ${pin} | ${gpio} |`));
    assert.ok(bom.includes(`${pin} GPIO${gpio} to VIDEO`));
    assert.ok(bom.includes(r));
  }
});
