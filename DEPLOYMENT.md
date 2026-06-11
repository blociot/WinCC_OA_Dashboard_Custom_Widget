# Deployment Guide — Custom Chart Widget for WinCC OA Dashboard

## Prerequisites

- WinCC OA 3.21 installed
- A target WinCC OA project with the Dashboard feature enabled
- File system access to the target project directory

---

## Files to Distribute

The widget consists of **5 files** across 3 directories:

```
data/
├── dashboard-wc/
│   ├── index.html                              # Modified Dashboard page with import map entry
│   └── entry/
│       └── custom-widgets.js                   # Custom Chart web component
│
└── WebUI/
    ├── svg/
    │   └── custom-chart.svg                    # Widget picker icon
    │
    └── widgets-v2/
        └── StandardLibrary/
            └── Charts/
                ├── custom-chart.widget.json
                ├── custom-chart-json-schema.json
                └── custom-chart-ui-schema.json
```

---

## Installation

### Fresh Project (No Existing Customizations)

1. Copy the `data/` directory into the target project root:

   ```
   xcopy /E /I "source\data" "TARGET_PROJECT\data"
   ```

2. Restart the WinCC OA web server.

3. Open the Dashboard — **Custom Chart** should appear under **Standard Library > Charts**.

### Project With Existing `index.html` Customizations

#### Step 1 — Copy Widget Files

```
xcopy /E /I "source\data\WebUI" "TARGET_PROJECT\data\WebUI"
xcopy /I "source\data\dashboard-wc\entry\custom-widgets.js" "TARGET_PROJECT\data\dashboard-wc\entry\"
```

#### Step 2 — Merge Import Map Entry

Open the target project's `data/dashboard-wc/index.html` and add this entry to the `imports` object in the `<script type="importmap">` block:

```json
"@etm-professional-control/wui-widgets/wui-widget-custom-chart/wui-widget-custom-chart.js": "./entry/custom-widgets.js"
```

If the target project does not have a custom `index.html` yet, copy the installation's original first:

```
copy "C:\Program Files\Siemens\WinCC_OA\3.21\data\dashboard-wc\index.html" "TARGET_PROJECT\data\dashboard-wc\index.html"
```

#### Step 3 — Restart and Verify

Restart the WinCC OA web server and clear the browser cache (Ctrl+Shift+R).

---

## Verification

1. Open the Dashboard in a browser
2. Create or edit a dashboard
3. Click **Add Widget** — expand **Standard Library > Charts**
4. **Custom Chart** should appear with its icon
5. Drag it onto the grid — a default area chart should render
6. Click the widget's edit icon to open the settings sidebar
7. Modify the JavaScript code in the **Chart Code** textarea — the chart should update

---

## Troubleshooting

### Widget doesn't appear in the picker

- Verify `data/dashboard-wc/index.html` exists in the project and contains the import map entry for `wui-widget-custom-chart`
- Clear browser cache (Ctrl+Shift+R) — the Dashboard is a PWA with a service worker
- Check that all 3 JSON files exist in `data/WebUI/widgets-v2/StandardLibrary/Charts/`

### Widget appears but chart is blank

- Open DevTools (F12) and check the console for import errors
- Navigate to `https://<host>:<port>/dashboard/entry/custom-widgets.js` directly — it should load without 404

### Chart code errors

- Open the widget settings sidebar and check the JavaScript code for syntax errors
- Runtime errors are shown in a red overlay at the bottom of the chart

---

## WinCC OA Version Upgrade

When upgrading WinCC OA:

1. Copy the **new** installation's `index.html` to the project directory
2. Re-add the single custom import map entry
3. Test that the widget still functions

The widget descriptor, schemas, icon, and `custom-widgets.js` are forward-compatible as long as the Dashboard uses the same Lit + ECharts architecture.

---

## Uninstallation

1. Delete `data\dashboard-wc\entry\custom-widgets.js`
2. Delete the 3 JSON files from `data\WebUI\widgets-v2\StandardLibrary\Charts\custom-chart*`
3. Delete `data\WebUI\svg\custom-chart.svg`
4. Either delete `data\dashboard-wc\index.html` (to revert to installation default) or remove the import map entry
5. Restart the web server and clear browser cache
