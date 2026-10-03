# Physical build

Reference design adapted from [C5VRX by Twotoz and contributors](https://github.com/Twotoz/C5VRX/tree/b8d32b90f479feff7fbb34e6ca01cc9ba2d0d697).
Use the [official website](https://twotoz.github.io/C5VRX/) for the original
flasher and community Discord invite.

## Wire the DAC

Disconnect power while assembling. This is the Seeed Studio XIAO ESP32-C5 pin
mapping, not a generic ESP32 header mapping. Six independent resistor branches
join at VIDEO; they are not a chain of resistors in series.

| Board label | GPIO | DAC bit | Resistor to VIDEO |
| --- | --- | --- | --- |
| D4 | 23 | 0, least significant | 8.2 kΩ |
| D5 | 24 | 1 | 3.9 kΩ |
| D6 | 11 | 2 | 2.0 kΩ |
| D7 | 12 | 3 | 1.0 kΩ |
| D8 | 8 | 4 | 470 Ω |
| D9 | 9 | 5, most significant | 240 Ω |

Add 200 Ω from VIDEO to GND and 470 pF from VIDEO to GND. Connect VIDEO to the
monitor's composite signal input, and GND to signal ground. A typical RCA
composite input uses the centre contact for VIDEO and the outer contact for
GND; check your actual connector/goggles cable pinout. Do not assume a 3.5 mm
AV connector follows a universal pinout.

Keep wires short, inspect bridges, and check continuity before USB power. The
monitor's 75 Ω input termination changes the loaded amplitude. Confirm the
level and sync on your build; the values above reproduce the upstream reference
network, not a guarantee for every display.

Use a compatible analog camera/transmitter as your bench source. Attach its
specified antenna before power, and use its specified power supply separately.
No drone or flight is needed to test video reception.

## Install firmware

The simplest route is the [official C5VRX web flasher](https://twotoz.github.io/C5VRX/)
in desktop Chrome or Edge. Select the exact board/port, follow the board's download
mode procedure if needed, and install a stable release. Flashing replaces the
existing board program. Close the flasher to release USB before opening our console.

At preparation time the upstream latest stable release was v3.26.0. The flasher
may advance independently. Record the actual installed version; the pinned source
revision below is the reference for this companion, not a promise about what
“latest” will install later.

## Build the pinned firmware

After cloning this companion with submodules, enter `firmware/C5VRX`.
The pinned upstream workflow uses `espressif/idf:v6.0.2`:

```sh
cd firmware/C5VRX
docker run --rm -v "${PWD}:/workspace" -w /workspace espressif/idf:v6.0.2 idf.py build
```

Alternatively use an activated ESP-IDF v6.0.2 environment and run `idf.py build`.
For flashing, use that environment and the actual board port:

```sh
idf.py -p /dev/ttyACM0 flash
```

Replace `/dev/ttyACM0` with your port. Using `idf.py flash` applies the build's
flash arguments; do not confuse individual binary offsets with a merged image.
We do not redistribute a new firmware binary or claim to have completed this
build locally. Upstream's source, build workflow and installer remain authoritative.

## First picture

1. Power the receiver and display; select the display's composite input.
2. Power your compatible analog test source with its antenna connected.
3. Match its channel using a short BOOT press or the console's Next channel button.
4. Read Diagnostics to inspect the board's actual settings and detected video
   standard. The console does not invent RF-lock or video-quality indicators.
5. Check the picture directly on the monitor. Record the firmware version and
   wiring before experimenting with settings.
