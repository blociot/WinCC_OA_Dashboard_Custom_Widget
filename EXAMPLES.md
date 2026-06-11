# Custom Chart Widget - ECharts Examples

How to adapt [Apache ECharts examples](https://echarts.apache.org/examples/en/) for the WinCC OA Dashboard Custom Chart widget.

## Overview

The Custom Chart widget lets you write JavaScript that returns an ECharts `option` object.
Your code runs inside a function with these variables available:

| Variable | Description |
|----------|-------------|
| `dp[0]` .. `dp[4]` | Datapoint objects (up to 5) |
| `dp[i].value` | Latest live value |
| `dp[i].name` | Datapoint address |
| `dp[i].history` | `{ values: [], timestamps: [] }` — client-side ring buffer |
| `animation` | Boolean — animation setting |
| `font` | Font family string |
| `bgColor` | Background color string |

## How to Convert an ECharts Example

ECharts examples on the website use this pattern:

```js
// Original ECharts example
option = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [150, 230, 224], type: 'line' }]
};
```

To use it in the Custom Chart widget:

1. **Remove** `option = ` — instead use `return { ... }`
2. **Replace** static `data` arrays with `dp[i].history` or `dp[i].value`
3. **Replace** static `xAxis.data` with timestamps from `dp[i].history.timestamps`
4. **Add** `animation`, `font`, `bgColor` for integration with dashboard settings
5. **Use** `type: 'time'` for xAxis when plotting live trends

---

## Line Chart Examples

### 1. Basic Line (1 DP)

Simple line chart showing one datapoint's history over time.

**Widget Settings:** Assign 1 datapoint. Set Time Range (e.g. `1h`).

```js
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
    smooth: false
  }]
};
```

---

### 2. Smooth Line (1 DP)

Same as basic but with smooth curve interpolation.

*ECharts original: [Smoothed Line Chart](https://echarts.apache.org/examples/en/editor.html?c=line-smooth)*

```js
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
};
```

---

### 3. Multi-Line / Stacked Line (3 DPs)

Shows multiple datapoints as separate lines on the same chart.

*ECharts original: [Stacked Line Chart](https://echarts.apache.org/examples/en/editor.html?c=line-stack)*

**Widget Settings:** Assign 3 datapoints. Set Time Range (e.g. `30m`).

```js
var series = [];

for (var i = 0; i < 3; i++) {
  var d = dp[i];
  if (d.value == null && d.history.values.length === 0) continue;

  var data = d.history.timestamps.map(function(t, j) {
    return [t, d.history.values[j]];
  });

  series.push({
    name: d.name || ('DP ' + (i + 1)),
    type: 'line',
    data: data,
    smooth: true
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'axis' },
  legend: { data: series.map(function(s) { return s.name; }) },
  xAxis: { type: 'time' },
  yAxis: { type: 'value' },
  series: series
};
```

To make it a **stacked** line chart, add `stack: 'total'` to each series:

```js
  series.push({
    name: d.name || ('DP ' + (i + 1)),
    type: 'line',
    stack: 'total',
    data: data,
    smooth: true
  });
```

---

### 4. Area Chart (1 DP)

Line chart with filled area underneath.

*ECharts original: [Basic Area Chart](https://echarts.apache.org/examples/en/editor.html?c=area-basic)*

```js
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
  xAxis: { type: 'time', boundaryGap: false },
  yAxis: { type: 'value' },
  series: [{
    name: d.name || 'Value',
    type: 'line',
    data: data,
    areaStyle: {},
    smooth: true
  }]
};
```

---

### 5. Stacked Area (3 DPs)

Multiple datapoints shown as stacked filled areas.

*ECharts original: [Stacked Area Chart](https://echarts.apache.org/examples/en/editor.html?c=area-stack)*

**Widget Settings:** Assign 3 datapoints.

```js
var series = [];

for (var i = 0; i < 3; i++) {
  var d = dp[i];
  if (d.value == null && d.history.values.length === 0) continue;

  var data = d.history.timestamps.map(function(t, j) {
    return [t, d.history.values[j]];
  });

  series.push({
    name: d.name || ('DP ' + (i + 1)),
    type: 'line',
    stack: 'total',
    areaStyle: {},
    data: data,
    smooth: true
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'axis' },
  legend: { data: series.map(function(s) { return s.name; }) },
  xAxis: { type: 'time', boundaryGap: false },
  yAxis: { type: 'value' },
  series: series
};
```

---

### 6. Step Line (1 DP)

Useful for digital/boolean signals or discrete state changes.

*ECharts original: [Step Line](https://echarts.apache.org/examples/en/editor.html?c=line-step)*

```js
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
    step: 'start',
    data: data
  }]
};
```

Step options: `'start'`, `'middle'`, `'end'` — controls where the step occurs between two points.

---

### 7. Multi-Line with Gradient Area (5 DPs)

All 5 datapoints with gradient-filled areas and different line styles.

**Widget Settings:** Assign up to 5 datapoints.

```js
var colors = [
  ['rgba(58,77,233,0.8)', 'rgba(58,77,233,0.1)'],
  ['rgba(255,112,67,0.8)', 'rgba(255,112,67,0.1)'],
  ['rgba(102,187,106,0.8)', 'rgba(102,187,106,0.1)'],
  ['rgba(171,71,188,0.8)', 'rgba(171,71,188,0.1)'],
  ['rgba(255,202,40,0.8)', 'rgba(255,202,40,0.1)']
];

var series = [];

for (var i = 0; i < 5; i++) {
  var d = dp[i];
  if (d.value == null && d.history.values.length === 0) continue;

  var data = d.history.timestamps.map(function(t, j) {
    return [t, d.history.values[j]];
  });

  series.push({
    name: d.name || ('DP ' + (i + 1)),
    type: 'line',
    smooth: true,
    data: data,
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: colors[i][0] },
          { offset: 1, color: colors[i][1] }
        ]
      }
    }
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'axis' },
  legend: {},
  xAxis: { type: 'time', boundaryGap: false },
  yAxis: { type: 'value' },
  series: series
};
```

---

### 8. Line with Markings (1 DP)

Line chart with min/max markers and an average reference line.

*ECharts original: [Line with Markpoint & Markline](https://echarts.apache.org/examples/en/editor.html?c=line-marker)*

```js
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
    smooth: true,
    markPoint: {
      data: [
        { type: 'max', name: 'Max' },
        { type: 'min', name: 'Min' }
      ]
    },
    markLine: {
      data: [
        { type: 'average', name: 'Average' }
      ]
    }
  }]
};
```

---

### 9. Dual Y-Axis (2 DPs)

Two datapoints with independent Y-axes — useful when DPs have different units/scales.

**Widget Settings:** Assign 2 datapoints.

```js
var data0 = [];
var data1 = [];

if (dp[0].history && dp[0].history.timestamps) {
  data0 = dp[0].history.timestamps.map(function(t, i) {
    return [t, dp[0].history.values[i]];
  });
}
if (dp[1].history && dp[1].history.timestamps) {
  data1 = dp[1].history.timestamps.map(function(t, i) {
    return [t, dp[1].history.values[i]];
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'axis' },
  legend: {},
  xAxis: { type: 'time' },
  yAxis: [
    { type: 'value', name: dp[0].name || 'DP 1' },
    { type: 'value', name: dp[1].name || 'DP 2' }
  ],
  series: [
    {
      name: dp[0].name || 'DP 1',
      type: 'line',
      data: data0,
      smooth: true
    },
    {
      name: dp[1].name || 'DP 2',
      type: 'line',
      yAxisIndex: 1,
      data: data1,
      smooth: true
    }
  ]
};
```

---

### 10. Line Race / Bump Chart (3 DPs)

Animated comparison of multiple datapoints with end labels.

*ECharts original: [Line Race](https://echarts.apache.org/examples/en/editor.html?c=line-race)*

**Widget Settings:** Assign 3 datapoints.

```js
var series = [];

for (var i = 0; i < 3; i++) {
  var d = dp[i];
  if (d.value == null && d.history.values.length === 0) continue;

  var data = d.history.timestamps.map(function(t, j) {
    return [t, d.history.values[j]];
  });

  series.push({
    name: d.name || ('DP ' + (i + 1)),
    symbolSize: 20,
    type: 'line',
    smooth: true,
    emphasis: { focus: 'series' },
    endLabel: {
      show: true,
      formatter: '{a}',
      distance: 20
    },
    lineStyle: { width: 4 },
    data: data
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  title: { text: 'Bump Chart' },
  tooltip: { trigger: 'item' },
  grid: {
    left: 30,
    right: 110,
    bottom: 30,
    containLabel: true
  },
  xAxis: {
    type: 'time',
    splitLine: { show: true },
    boundaryGap: false
  },
  yAxis: { type: 'value' },
  series: series
};
```

---

## Non-Line Chart Examples

### 11. Gauge — Current Value (1 DP)

Displays the latest value as a gauge meter. No history needed.

*ECharts original: [Gauge Basic](https://echarts.apache.org/examples/en/editor.html?c=gauge)*

```js
return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  series: [{
    type: 'gauge',
    detail: { formatter: '{value}' },
    data: [{
      value: dp[0].value || 0,
      name: dp[0].name || 'Value'
    }]
  }]
};
```

---

### 12. Gauge with Range Colors (1 DP)

Gauge with green/yellow/red zones.

```js
return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  series: [{
    type: 'gauge',
    axisLine: {
      lineStyle: {
        width: 15,
        color: [
          [0.3, '#67e0e3'],
          [0.7, '#37a2da'],
          [1, '#fd666d']
        ]
      }
    },
    pointer: { itemStyle: { color: 'auto' } },
    detail: {
      formatter: '{value}',
      fontSize: 24
    },
    data: [{
      value: dp[0].value || 0,
      name: dp[0].name || 'Value'
    }]
  }]
};
```

---

### 13. Bar Chart — Live Values (3 DPs)

Compares current values of multiple DPs as bars.

*ECharts original: [Bar Simple](https://echarts.apache.org/examples/en/editor.html?c=bar-simple)*

**Widget Settings:** Assign 3 datapoints.

```js
var names = [];
var values = [];

for (var i = 0; i < 3; i++) {
  if (dp[i].value == null) continue;
  names.push(dp[i].name || ('DP ' + (i + 1)));
  values.push(dp[i].value);
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: {},
  xAxis: { type: 'category', data: names },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: values,
    itemStyle: {
      color: function(params) {
        var colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
        return colors[params.dataIndex % colors.length];
      }
    }
  }]
};
```

---

### 14. Pie Chart — Live Values (5 DPs)

Pie chart showing proportions of all datapoint current values.

*ECharts original: [Basic Pie](https://echarts.apache.org/examples/en/editor.html?c=pie-simple)*

**Widget Settings:** Assign up to 5 datapoints.

```js
var data = [];

for (var i = 0; i < 5; i++) {
  if (dp[i].value == null) continue;
  data.push({
    name: dp[i].name || ('DP ' + (i + 1)),
    value: dp[i].value
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [{
    type: 'pie',
    radius: '60%',
    data: data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
};
```

---

### 15. Doughnut Chart (5 DPs)

Pie chart with a hole in the center showing the total.

*ECharts original: [Doughnut Chart](https://echarts.apache.org/examples/en/editor.html?c=pie-doughnut)*

```js
var data = [];
var total = 0;

for (var i = 0; i < 5; i++) {
  if (dp[i].value == null) continue;
  total += Number(dp[i].value);
  data.push({
    name: dp[i].name || ('DP ' + (i + 1)),
    value: dp[i].value
  });
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    label: { show: false, position: 'center' },
    emphasis: {
      label: { show: true, fontSize: 20, fontWeight: 'bold' }
    },
    data: data
  }]
};
```

---

### 16. Scatter Plot (2 DPs)

Plots DP 1 values vs DP 2 values as XY scatter points.

*ECharts original: [Basic Scatter](https://echarts.apache.org/examples/en/editor.html?c=scatter-simple)*

**Widget Settings:** Assign 2 datapoints. Values are paired by timestamp.

```js
var data = [];
var h0 = dp[0].history;
var h1 = dp[1].history;
var len = Math.min(h0.values.length, h1.values.length);

for (var i = 0; i < len; i++) {
  data.push([h0.values[i], h1.values[i]]);
}

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: {},
  xAxis: { name: dp[0].name || 'DP 1' },
  yAxis: { name: dp[1].name || 'DP 2' },
  series: [{
    type: 'scatter',
    symbolSize: 10,
    data: data
  }]
};
```

---

### 17. Heatmap — Value over Time (1 DP)

Shows value intensity bucketed by hour and minute.

*ECharts original: [Heatmap on Cartesian](https://echarts.apache.org/examples/en/editor.html?c=heatmap-cartesian)*

```js
var data = [];
var h = dp[0].history;

for (var i = 0; i < h.timestamps.length; i++) {
  var date = new Date(h.timestamps[i]);
  var hour = date.getHours();
  var min = Math.floor(date.getMinutes() / 10);
  data.push([hour, min, h.values[i]]);
}

var hours = [];
for (var i = 0; i < 24; i++) hours.push(i + ':00');
var mins = ['00','10','20','30','40','50'];

return {
  animation: animation,
  textStyle: { fontFamily: font },
  backgroundColor: bgColor,
  tooltip: { position: 'top' },
  xAxis: { type: 'category', data: hours, name: 'Hour' },
  yAxis: { type: 'category', data: mins, name: 'Minute' },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '0%'
  },
  series: [{
    type: 'heatmap',
    data: data,
    label: { show: false }
  }]
};
```

---

## Tips

- **Time Range:** Set in widget settings (e.g. `10m`, `1h`, `1d`). This controls how much history the ring buffer keeps.
- **Multiple DPs:** Use the "Additional Datapoints" collapsible section to add DPs 2-5.
- **Debugging:** If your chart shows nothing, check the red error overlay at the bottom of the widget for JavaScript errors.
- **Performance:** Keep `timeRange` reasonable. Very long ranges with frequent updates can accumulate thousands of points.
- **ECharts Docs:** Full option reference at https://echarts.apache.org/en/option.html
- **Testing:** After changing code, the chart updates immediately. No need to refresh the page.
