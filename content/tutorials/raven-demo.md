# Raven - OTIO Viewer

An experimental re-write of [OpenTimelineIO](https://opentimeline.io)'s `otioview` timeline viewer application.

This tool aims to replace [otioview](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/tree/main/src/opentimelineview) but it is missing a few essential features (see "Help Wanted" and "To Do" below). Contributions are welcome!

[![build](https://github.com/OpenTimelineIO/raven/actions/workflows/build.yaml/badge.svg)](https://github.com/OpenTimelineIO/raven/actions/workflows/build.yaml)

![screenshot](screenshot.png)

![demo](demo.gif)

## Dependencies

## 1. First step

## 2. Second step

macOS:
- Standard Apple developer toolchain (installed with Xcode)
- A recent version of CMake
  - You can get this via `brew install cmake` or by downloading from https://cmake.org/download/

Windows:
- Standard Microsoft developer toolchain (installed with Visual Studio)
- A recent version of [CMake](https://cmake.org/download/)

Linux (Ubuntu, or similar):
- `sudo apt-get install libglfw3-dev libgtk-3-dev`
- A recent version of CMake
  - You can get this via `sudo snap install cmake` or by downloading from https://cmake.org/download/

__Note__: Before building, please ensure that you clone this project with the `--recursive` flag. 
This will also clone and initialize all of the submodules that this project depends on.

## Building (macOS, Windows, Linux)

Spin up your favourite terminal and follow these steps:

```shell
  git submodule update --init --recursive
  mkdir build
  cd build
  cmake ..
  cmake --build . -j
  ./raven ../example.otio
```

## Building (WASM via Emscripten)

You will need to install the [Emscripten toolchain](https://emscripten.org) first.

```shell
  git submodule update --init --recursive
  mkdir build-web
  cd build-web
  emcmake cmake ..
  cmake --build .
  emrun ./raven.html
```

See also: `serve.py` as an alternative to `emrun`, and as
a reference for which HTTP headers are needed to host the WASM build.

You can load a file into WASM Raven a few ways:
- Add a JSON string to Module.otioLoadString in the HTML file
- Add a URL to Module.otioLoadURL in the HTML file
- Call Module.LoadString(otio_data) at runtime
- Call Module.LoadURL(otio_url) at runtime

Note: The WASM build of raven is missing some features - see the Help Wanted section below.

## Troubleshooting

If you have trouble building, these hints might help...

You might need to init/update submodules:
```
% git submodule init
% git submodule update
```

You might be missing some dependencies (see above).

See also [`.github/workflows/build.yaml`](https://github.com/OpenTimelineIO/raven/blob/main/.github/workflows/build.yaml) for a working example of building on each of the platforms listed above.

## Example files

The `examples` folder contains some example `.otio` files for testing.

The El Fuente and Meridian [examples provided by Netflix](https://opencontent.netflix.com/) (under the
Creative Commons Attribution 4.0 International Public License) were [converted to OTIO, along with several
other examples here](https://github.com/darbyjohnston/otio-oc-examples).


## To Do

- Feature parity with `otioview`:
  - Show media reference details in the Inspector
  - Double-click to expand/collapse nested compositions
  - Arrow keys to navigate by selection
    - This sort of works already via ImGui's navigation system, but it is too easy to get stuck on a marker, or to walk out of the timeline.
    - Can this be rectified by turning off keyboard navigation on the widgets outside the timeline?
  - Multiple timelines in separate tabs or windows?
    - Look at ImGui document-based demo code for reference.
    - Might be fine to just open multiple instances of the app.
  - Add support for adapters
    - Use embedded Python, or run `otioconvert` via pipe?
    - Constraint: We want to ensure this tool stays light weight, and works in the browser.
- Enhancements:
  - Double-click a Clip to expand/collapse it's media reference
  - Show time-warped ruler inside media reference or nested composition
- Performance optimization:
  - Avoid rendering tracks outside the scroll region
  - Avoid rendering items smaller than a tiny sliver
  - Experiment with drawing the timeline without using a Dear ImGui table
    - Results so far: aligning multiple scroll regions causes 1-frame lag which is ugly
- Inspector:
  - Show summarized timing information (ala `otiotool --inspect`)
  - Range slider could be useful:
    - https://github.com/ocornut/imgui/issues/76#issuecomment-288304286
  - Per-schema inspector GUI
    - Items:
      - enable/disable
    - Clips:
      - show media_reference(s)
      - adjust available_range of media reference
      - edit target_url
    - Transitions:
      - nicer GUI for adjusting in/out offsets
      - avoid extending beyond range of adjacent Items
      - avoid overlap with adjacent Transitions
    - Markers:
      - color picker
    - Compositions:
      - show source_range limits in the timeline
    - LinearTimeWarp:
      - time_scale graph could be nicer
    - FreezeFrame:
    - UnknownSchema:
      - Can we show properties via SerializableObject's introspection?

