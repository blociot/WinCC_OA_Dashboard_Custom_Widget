// Custom Chart Widget for WinCC OA Dashboard
// Copyright 2025 BlocIoT - https://github.com/BlocIoT
// Licensed under Apache License 2.0
// YouTube: https://www.youtube.com/@blociot | LinkedIn: https://www.linkedin.com/company/blociot/

import { WuiEcharts } from "@etm-professional-control/wui-widgets/wui-echarts/wui-echarts.js";
import { html, css } from "lit";

const MAX_DPS = 5;
const VALUE_PROPS = ["value", "value2", "value3", "value4", "value5"];

const DEFAULT_CHART_CODE = `// Write JavaScript that returns an ECharts options object.
// Available variables:
//   dp[0].value, dp[1].value ...  - latest values (up to 5 datapoints)
//   dp[0].history   - {values: [], timestamps: []} buffered locally
//   dp[0].name      - datapoint name
//   animation, font, bgColor, chart (ECharts instance)
//
// Example: Single line trend (uses first datapoint)

var data = [];
var d = dp[0];
if (d.history && d.history.timestamps) {
  data = d.history.timestamps.map(function(t, i) {
    return [t, d.history.values[i]];
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'time' },
  yAxis: { type: 'value' },
  series: [{
    name: d.name || 'Value',
    type: 'line',
    data: data,
    smooth: true
  }]
};`;

function parseTimeRange(str) {
  if (!str || typeof str !== "string") return 3600000;
  const m = str.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!m) return 3600000;
  const n = parseInt(m[1], 10);
  switch (m[2].toLowerCase()) {
    case "s": return n * 1000;
    case "m": return n * 60000;
    case "h": return n * 3600000;
    case "d": return n * 86400000;
    default: return 3600000;
  }
}

export class WuiWidgetCustomChart extends WuiEcharts {
  static properties = {
    ...WuiEcharts.properties,
    chartCode: { type: String },
    timeRange: { type: String },
    value: {},
    value2: {},
    value3: {},
    value4: {},
    value5: {},
  };

  static styles = [
    ...(WuiEcharts.styles || []),
    css`
      :host { display: block; width: 100%; height: 100%; }
      #echarts { width: 100%; height: 100%; }
      .error-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: rgba(211, 47, 47, 0.9); color: white;
        padding: 6px 10px; font-size: 12px; font-family: monospace;
        z-index: 5; max-height: 30%; overflow: auto;
      }
    `,
  ];

  constructor() {
    super();
    this.chartCode = DEFAULT_CHART_CODE;
    this.timeRange = "1h";
    this._lastError = null;
    this._buffers = [];
    this._dpNames = [];
    for (let i = 0; i < MAX_DPS; i++) {
      this._buffers.push({ values: [], timestamps: [] });
      this._dpNames.push("");
    }
  }

  render() {
    return html`
      <div id="echarts" data-testid="echarts"></div>
      ${this._lastError ? html`<div class="error-overlay">${this._lastError}</div>` : ""}
    `;
  }

  _pushToBuffer(index, val) {
    if (val == null) return;
    const buf = this._buffers[index];
    buf.values.push(val);
    buf.timestamps.push(Date.now());
    this._pruneBuffer(index);
  }

  _pruneBuffer(index) {
    const maxAge = parseTimeRange(this.timeRange);
    const cutoff = Date.now() - maxAge;
    const buf = this._buffers[index];
    while (buf.timestamps.length > 0 && buf.timestamps[0] < cutoff) {
      buf.timestamps.shift();
      buf.values.shift();
    }
  }

  _buildDpArray() {
    const arr = [];
    for (let i = 0; i < MAX_DPS; i++) {
      const val = this[VALUE_PROPS[i]];
      const buf = this._buffers[i];
      arr.push({
        value: val != null ? val : null,
        name: this._dpNames[i] || ("DP " + (i + 1)),
        history: {
          values: buf.values.slice(),
          timestamps: buf.timestamps.slice(),
        },
      });
    }
    return arr;
  }

  _executeChartCode() {
    const code = this.chartCode;
    if (!code || !code.trim()) {
      this._lastError = null;
      return { series: [] };
    }

    try {
      const dp = this._buildDpArray();
      const fn = new Function("dp", "animation", "font", "bgColor", "chart", code);
      const result = fn(
        dp,
        this.animation ?? true,
        this.font || "sans-serif",
        this.backgroundColor || "transparent",
        this.echartInstance
      );
      this._lastError = null;
      return result || { series: [] };
    } catch (e) {
      this._lastError = e.message;
      return { series: [] };
    }
  }

  chartOptions() {
    const result = this._executeChartCode();
    if (result && typeof result.then === "function") {
      return { series: [] };
    }
    return result;
  }

  _applyChartOptions() {
    if (!this.echartInstance) return;
    const result = this._executeChartCode();

    if (result && typeof result.then === "function") {
      this.echartInstance.showLoading("default", {
        text: "Loading...",
        maskColor: "rgba(0,0,0,0.4)",
        textColor: "#fff",
      });
      result
        .then((option) => {
          this._lastError = null;
          this.echartInstance.hideLoading();
          if (option) {
            this.echartInstance.setOption(option, { notMerge: true });
          }
          this.requestUpdate();
        })
        .catch((e) => {
          this._lastError = e.message;
          this.echartInstance.hideLoading();
          this.requestUpdate();
        });
    } else {
      this.echartInstance.setOption(result, { notMerge: true });
    }
  }

  firstUpdated() {
    super.firstUpdated();
    this._applyChartOptions();
  }

  updated(changedProperties) {
    let needsUpdate = false;

    for (let i = 0; i < MAX_DPS; i++) {
      if (changedProperties.has(VALUE_PROPS[i])) {
        this._pushToBuffer(i, this[VALUE_PROPS[i]]);
        needsUpdate = true;
      }
    }

    if (changedProperties.has("timeRange")) {
      for (let i = 0; i < MAX_DPS; i++) {
        this._pruneBuffer(i);
      }
      needsUpdate = true;
    }

    if (changedProperties.has("chartCode")) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      this._applyChartOptions();
    }
  }

  handleResize() {
    super.handleResize();
  }
}

customElements.define("wui-widget-custom-chart", WuiWidgetCustomChart);
