# Provenance

This project adapts reference wiring, build instructions and serial-console
usage from **C5VRX by Twotoz and the C5VRX contributors**.

- Canonical source: https://github.com/Twotoz/C5VRX
- Official website, web flasher and Discord invite: https://twotoz.github.io/C5VRX/
- Source revision: `b8d32b90f479feff7fbb34e6ca01cc9ba2d0d697`
- Reused findings: `README.md` hardware pinout, output network, architecture,
  console hotkeys and build procedure; `main/video.c` DAC GPIO order and
  diagnostic command handling; `.github/workflows/build.yml` SDK image version
- `firmware/C5VRX` is an unmodified Git submodule pointing at that revision
- Our additions: condensed English build guide, schematic-style wiring diagram,
  BOM, standalone Web Serial text console and transport tests
- Firmware changes: none

The receiver architecture and hardware research are C5VRX work; this repository
is an unofficial companion and does not imply endorsement. Upstream's hardware
results remain distinct from this companion's pending physical validation.

The root LICENSE is GPL-3.0-only, as is C5VRX's covered software. Preserve upstream
notices and third-party licenses when distributing firmware or adaptations.
C5VRX's branding is covered separately by its `assets/BRANDING.md`; this companion
uses the name descriptively and does not reuse its logos.
