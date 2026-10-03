# Validation

Software transport checks and documentation checks are separate from physical
RF reception. No physical receiver has been validated for this companion.

Run `npm test` using Node.js 20+. Tests use deterministic serial test doubles;
these are excluded from the deployed website and are not reception evidence.

Before claiming a tested build, record the exact XIAO board revision, antenna,
firmware commit/release, OS/browser, wiring, display and test transmitter.

1. Check the six GPIO/resistor branches, the 200 Ω shunt, 470 pF filter and ground.
2. Confirm the device emits C5VRX diagnostic output over USB at 115200 baud.
3. Check the VIDEO signal under the actual display load; confirm sync and picture.
4. Match the channel to your own analog bench source. Record the observed result.
5. Exercise next-channel and gain controls on the bench. Confirm actual device
   output, not merely successful serial writes.
6. Unplug/replug USB and check disconnect recovery. Close the console and verify
   another tool can acquire the port.
7. Check a sustained run and document artifacts; do not infer calibrated range,
   flight suitability or performance across other boards from a single test.

The website displays raw received text and connected/disconnected status. It
cannot prove RF lock and does not implement spectrum or video acquisition.

## Instrument layout update

The frequency, channel and bandwidth parser is checked against pinned upstream diagnostic line formats and split USB chunks. Spectrum/waterfall panels intentionally remain empty: no FFT transport or renderer is implemented. Verify displayed snapshots on a physical board with Read device settings; use this again after external board changes. Disconnect must clear all snapshot fields.
