// SPDX-License-Identifier: GPL-3.0-only
import { SerialConsole, boundedLog } from "./serial.js";
const $ = (id) => document.getElementById(id);
let connection = null,
  busy = false,
  log = "",
  pending = false;
function controls() {
  const ready = connection && !connection.closed;
  $("connect").disabled = busy;
  $("connect").textContent = ready ? "Disconnect" : "Connect USB";
  document
    .querySelectorAll("[data-command]")
    .forEach((b) => (b.disabled = !ready || busy));
  $("download").disabled = !log;
}
function message(text) {
  $("message").textContent = text;
}
function append(text) {
  log = boundedLog(log, text);
  if (!pending) {
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      $("log").textContent = log;
      $("log").scrollTop = $("log").scrollHeight;
      controls();
    });
  }
}
async function close() {
  const c = connection;
  connection = null;
  await c?.close();
  $("state").textContent = "OFFLINE";
  $("state").className = "";
  controls();
}
async function fail(error) {
  await close();
  message(error.message || String(error));
}
$("connect").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  controls();
  try {
    if (connection) {
      await close();
      message(
        "Disconnected. Displayed log is retained from the previous session.",
      );
      return;
    }
    if (!navigator.serial || !window.isSecureContext)
      throw new Error("Use desktop Chrome or Edge on HTTPS or localhost");
    const port = await navigator.serial.requestPort();
    log = "";
    $("log").textContent = "";
    message("Opening USB port…");
    connection = new SerialConsole(append, (error) => {
      void fail(error);
    });
    await connection.open(port);
    $("state").textContent = "USB CONNECTED";
    $("state").className = "connected";
    message(
      "Read Diagnostics to confirm C5VRX firmware. USB connection does not confirm video reception.",
    );
  } catch (error) {
    if (error.name === "NotFoundError") message("No port selected");
    else await fail(error);
  } finally {
    busy = false;
    controls();
  }
});
for (const button of document.querySelectorAll("[data-command]"))
  button.addEventListener("click", async () => {
    if (busy || !connection) return;
    busy = true;
    controls();
    try {
      await connection.send(button.dataset.command);
      message("Command sent. Check the device output below for its result.");
    } catch (error) {
      await fail(error);
    } finally {
      busy = false;
      controls();
    }
  });
$("clear").addEventListener("click", () => {
  log = "";
  $("log").textContent = "";
  controls();
});
$("download").addEventListener("click", () => {
  if (!log) return;
  const url = URL.createObjectURL(new Blob([log], { type: "text/plain" })),
    a = document.createElement("a");
  a.href = url;
  a.download = `fpv-console-${Date.now()}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
if (!navigator.serial || !window.isSecureContext)
  message("USB console requires desktop Chrome or Edge on HTTPS or localhost");
controls();
