// SPDX-License-Identifier: GPL-3.0-only
// Transport for the documented C5VRX single-key console, not an RF decoder.
export const COMMANDS = Object.freeze({
  diagnostics: "d",
  channel: "c",
  gainUp: "+",
  gainDown: "-",
});
export class SerialConsole {
  constructor(onText = () => {}, onClose = () => {}) {
    this.onText = onText;
    this.onClose = onClose;
    this.closed = true;
    this.queue = Promise.resolve();
  }
  async open(port) {
    this.port = port;
    await port.open({
      baudRate: 115200,
      flowControl: "none",
      bufferSize: 8192,
    });
    this.closed = false;
    try {
      await port.setSignals?.({
        dataTerminalReady: false,
        requestToSend: false,
      });
      this.reader = port.readable.getReader();
      this.writer = port.writable.getWriter();
      this.reading = this.read();
    } catch (error) {
      await this.close();
      throw error;
    }
  }
  async read() {
    const decoder = new TextDecoder();
    let error = null;
    try {
      while (!this.closed) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) this.onText(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if (!this.closed) error = e;
    } finally {
      const unexpected = !this.closed;
      this.closed = true;
      this.reader?.releaseLock();
      if (unexpected) this.onClose(error || new Error("USB connection closed"));
    }
  }
  send(name) {
    if (!Object.hasOwn(COMMANDS, name))
      return Promise.reject(new Error("Unsupported console command"));
    const task = this.queue.then(async () => {
      if (this.closed || !this.writer)
        throw new Error("Connect a receiver first");
      await this.writer.write(new TextEncoder().encode(COMMANDS[name]));
    });
    this.queue = task.catch(() => {});
    return task;
  }
  async close() {
    this.closed = true;
    try {
      await this.reader?.cancel();
    } catch {}
    await this.reading;
    try {
      await this.queue;
    } catch {}
    try {
      this.writer?.releaseLock();
    } catch {}
    try {
      await this.port?.close();
    } catch {}
    this.reader = null;
    this.writer = null;
  }
}
export function boundedLog(previous, next, maximum = 60000) {
  return (previous + next).slice(-maximum);
}
