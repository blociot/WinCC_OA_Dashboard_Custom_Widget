# Custom Chart Widget for WinCC OA Dashboard

WInCC OA has a new web [dashbaord](https://www.winccoa.com/documentation/WinCCOA/latest/en_US/Dashboard/topics/Dashboard_Basics.html) but the available widgets are limited. Use this custom widget widget to add **any** [Apache ECharts](https://echarts.apache.org/) visualization to your WinCC OA Dashboard with a single custom widget (make sure you perform a complete testing before deploying it in a production environment. This project is intended for training purposes only).

Write JavaScript that returns an ECharts options object — the widget handles rendering, resizing, theming, datapoint binding, and history buffering automatically.

[![Live Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://blociot.github.io/WinCC_OA_Dashboard_Custom_Widget/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green)](LICENSE)

> An open-source project by **[BlocIoT](https://github.com/BlocIoT)**

---

## Features

- **Any ECharts chart** — line, bar, gauge, pie, scatter, heatmap, graph, treemap, sunburst, radar, funnel, and more
- **Datapoint binding** — connect up to 5 WinCC OA datapoints with automatic history buffering
- **Async support** — return a `Promise` to load external data (fetch JSON, binary files, etc.)
- **ECharts instance access** — use `chart.appendData()`, `chart.on()`, `chart.getZr()` for advanced interactions
- **Zero build step** — pure ES module, works with the stock WinCC OA web server
- **Error overlay** — runtime errors are shown directly on the widget

## Quick Start

1. Copy the `data/` folder into your WinCC OA project directory
2. Restart the WinCC OA web server
3. Open Dashboard — **Custom Chart** appears under **Standard Library > Charts**
4. Drag it onto your dashboard and start writing ECharts code

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed installation instructions.

## Documentation

**[View the full documentation with 17+ live examples](https://blociot.github.io/WinCC_OA_Dashboard_Custom_Widget/)**

The documentation page includes interactive previews of:
- Line charts, area charts, bar charts
- Gauges, pie charts, radar charts
- Heatmaps, treemaps, sunburst charts
- Scatter plots (including large-scale GPS data)
- Force-directed graph visualization
- And more...

## How It Works

The widget executes your JavaScript code and passes the result to ECharts:

```javascript
// Available variables:
//   dp[0..4].value   — latest datapoint values
//   dp[0..4].history — {values: [], timestamps: []} buffered locally
//   dp[0..4].name    — datapoint name
//   animation        — animation setting (boolean)
//   font             — font family (string)
//   bgColor          — background color (string)
//   chart            — the live ECharts instance

return {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'time' },
  yAxis: { type: 'value' },
  series: [{
    type: 'line',
    data: dp[0].history.timestamps.map((t, i) => [t, dp[0].history.values[i]]),
    smooth: true
  }]
};
```

## Project Structure

```
data/
├── dashboard-wc/
│   ├── index.html                    # Dashboard page with import map
│   ├── entry/
│   │   └── custom-widgets.js         # Custom Chart web component
│   └── assets/                       # Example data files
│       ├── npmdep.json
│       └── gps/
│
└── WebUI/
    ├── svg/
    │   └── custom-chart.svg          # Widget picker icon
    └── widgets-v2/
        └── StandardLibrary/
            └── Charts/
                ├── custom-chart.widget.json
                ├── custom-chart-json-schema.json
                └── custom-chart-ui-schema.json

docs/
└── index.html                        # Documentation (GitHub Pages)
```

## Requirements

- WinCC OA 3.21+
- A project with the Dashboard feature enabled

## Support BlocIoT

If you find this project useful, please support us:

- **YouTube**: [youtube.com/@blociot](https://www.youtube.com/@blociot) — Subscribe for tutorials and demos
- **LinkedIn**: [linkedin.com/company/blociot](https://www.linkedin.com/company/blociot/) — Follow for updates
- **GitHub**: Star this repo and share it with your colleagues

## License

Licensed under the [Apache License 2.0](LICENSE).

This project uses [Apache ECharts](https://echarts.apache.org/), which is also licensed under the Apache License 2.0.

---

Made with care by [BlocIoT](https://github.com/BlocIoT)
