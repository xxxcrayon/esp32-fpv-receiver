// SPDX-License-Identifier: GPL-3.0-only
// Parse only the pinned firmware's complete diagnostic lines. No inferred RF data.
export function parseDiagnosticLine(line) {
  let match = line.match(/^\s*Tuned Frequency:\s+(\d{4})\.(\d{3}) MHz \(Offset:/);
  if (match) return { frequency: Number(match[1]) * 1000000 + Number(match[2]) * 1000 };
  match = line.match(/^\s*Receiver Channel:\s+([ARBF][1-8]) \((\d+) MHz\)/);
  if (match) return { channel: match[1] };
  match = line.match(/^\s*RF Bandwidth:\s+mode=\S+ active=BW(20|40)\s*$/);
  if (match) return { bandwidth: `${match[1]} MHz` };
  return {};
}
export class DiagnosticReader {
  constructor(onReport) { this.onReport = onReport; this.tail = ''; }
  feed(text) {
    const lines = (this.tail + text).split('\n');
    this.tail = lines.pop().slice(-4096);
    for (const line of lines) {
      const report = parseDiagnosticLine(line);
      if (Object.keys(report).length) this.onReport(report);
    }
  }
  reset() { this.tail = ''; }
}
