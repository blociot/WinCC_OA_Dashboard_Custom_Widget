# Custom Chart Widget for WinCC OA Dashboard

## Overview

This project adds a single **Custom Chart** widget to the WinCC OA Dashboard. Users write JavaScript code that returns an Apache ECharts options object, giving full flexibility to create any chart type — bar, line, heatmap, radar, treemap, or anything else ECharts supports.

Chart code is edited via the Dashboard's built-in settings sidebar (textarea), and errors are shown in a red overlay on the widget.

---

## Architecture

### How WinCC OA Dashboard Widgets Work

The Dashboard is a web application built on **Lit** web components and **Apache ECharts**. Each widget is composed of:

1. **Widget descriptor** (`*.widget.json`) — declares the widget type, label, supported data types, default settings, minimum grid size, SVG icon path, and references to the component tag name, JSON schema, and UI schema.

2. **JSON schema** (`*-json-schema.json`) — defines the data model for the widget's configurable properties.

3. **UI schema** (`*-ui-schema.json`) — defines the settings form layout shown in the Dashboard editor.

4. **JavaScript module** — a Lit web component class registered via `customElements.define()`, extending `WuiEcharts`.

5. **SVG icon** — a 34x34px icon displayed in the widget picker.

### Module Loading via Import Maps

The Dashboard uses JavaScript **import maps** (`<script type="importmap">` in `index.html`) to resolve module specifiers. The custom widget resolves to `./entry/custom-widgets.js`, which imports the base class from the standard library via the same import map.

Only one `<script type="importmap">` tag is allowed per HTML page. To add custom entries, the entire `index.html` from the WinCC OA installation must be copied to the project's `data/dashboard-wc/` directory and modified.

### Widget Discovery

The Dashboard discovers widgets by calling the API `etm.widget.list` with `{path: "/widgets-v2/", pattern: "*.widget"}`. WinCC OA's file resolution merges the installation path and project path, so widgets placed under the project's `data/WebUI/widgets-v2/` directory are discovered alongside standard library widgets.

### Project Override Mechanism

WinCC OA resolves web files by checking the **project path first**, then falling back to the **installation path**. No installation files are modified.

---

## Project File Structure

```
Dashboard_CustomWidgets/
└── data/
    ├── dashboard-wc/
    │   ├── index.html                          # Overridden (added import map entry)
    │   └── entry/
    │       └── custom-widgets.js               # Custom Chart Lit web component
    │
    └── WebUI/
        ├── svg/
        │   └── custom-chart.svg                # Widget picker icon (34x34px)
        │
        └── widgets-v2/
            └── StandardLibrary/
                └── Charts/
                    ├── custom-chart.widget.json        # Widget descriptor
                    ├── custom-chart-json-schema.json   # Data schema
                    └── custom-chart-ui-schema.json     # Settings form layout
```

---

## How the Widget Works

### User Flow

1. User adds **Custom Chart** from the widget picker (Standard Library > Charts).
2. The widget renders a default stacked area chart example.
3. User clicks the widget's edit icon to open the Dashboard settings sidebar.
4. In the **Content** tab, the user edits the JavaScript code in the **Chart Code** textarea.
5. The code must return a valid ECharts options object.
6. Changes are applied when the settings are saved — the chart updates accordingly.

### Code Execution

User code is executed via `new Function("dp", "animation", "font", "bgColor", code)`. The available variables are:

| Variable | Type | Description |
|---|---|---|
| `dp` | object | The bound datapoint (`{ value, name, ... }`) |
| `animation` | boolean | Whether animations are enabled |
| `font` | string | The widget's font family |
| `bgColor` | string | The widget's background color |

The code must end with a `return` statement returning a valid ECharts options object. Errors are shown in a red overlay at the bottom of the chart panel.

### Settings Panel

The widget's settings panel (shown in the Dashboard editor sidebar) provides:
- **Content tab**: DataPoint selector + a textarea for the chart code
- **Formatting tab**: "Show Tooltip" checkbox

---

## WinCC OA Version Compatibility

- Developed for **WinCC OA 3.21**
- The `index.html` override is version-specific — if the installation's `index.html` changes after an update, the project copy must be re-synchronized
