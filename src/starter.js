import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 20, right: 10, bottom: 120, left: 120 };

// scale
const yScale = d3
  .scaleBand()
  .range([margin.top + 80, height - margin.bottom + 100])
  .paddingInner(0.1);

const colorScale = d3
  .scaleSequential()
  .domain([0.8, -0.8])
  .interpolator(d3.interpolateRgbBasis(["red", "white", "blue"]));

const yLegendScale = d3
  .scaleBand()
  .range([height / 2 - 140, height / 2 + 140])
  .paddingInner(0.1);

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data

let rects;
let data = [];
let yAxis;
let legendData;
let legendRects, legendLabels;

d3.csv("data/temperature-anomaly-data.csv").then((raw_data) => {
  //   console.log(raw_data);

  data = raw_data
    .filter((d) => d.Entity == "Global")
    .map((d) => d)
    .map((d) => {
      const obj = {};
      obj.year = parseInt(d.Year);
      obj.avg = +d["Global average temperature anomaly relative to 1961-1990"];
      return obj;
    });

  legendData = d3.range(
    d3.min(data, (d) => d.avg),
    d3.max(data, (d) => d.avg),
    0.2
  );

  data.reverse();

  yScale.domain(data.map((d) => d.year));

  yAxis = d3
    .axisRight(yScale)
    .tickValues(yScale.domain().filter((d) => !(d % 10)));
  // d(연도 데이터)를 10으로 나눴을 때 0이면 거짓, 0이 아니면 참이고 참일 때 데이터가 나옴
  // 그래서 10년 단위로 x바가 나오게 하기 위해 !()로 반전시켜주는 것

  //axis --> axis 다시 설정해보기
  // const yAxisGroup = svg
  //   .append("g")
  //   .attr("transform", `translate(${width - margin.right}, ${margin.top})`)
  //   // .attr("x", width - margin.right)
  //   .attr("class", "y-axis")
  //   .call(yAxis);

  // yAxisGroup.selectAll("text").attr("x", -100).attr("dy", -15);

  // heatmap
  rects = svg
    .selectAll("rects")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", margin.left + 5)
    .attr("y", (d) => yScale(d.year))
    .attr("width", width - margin.left - margin.right - 50 - 60)
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.avg));

  yLegendScale.domain(legendData.map((d, i) => i));

  // legend
  legendData.reverse();

  legendRects = svg
    .selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("y", (d, i) => yLegendScale(i) + 40)
    .attr("x", width - margin.right - 50)
    .attr("width", yLegendScale.bandwidth())
    .attr("height", 40)
    .attr("fill", (d) => colorScale(d));

  legendLabels = svg
    .selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("y", (d, i) => yLegendScale(i) + yLegendScale.bandwidth() / 2 + 48)
    .attr("x", width - margin.right - 35)
    .text((d) => d3.format("0.1f")(d))
    .attr("class", "legend-labels")
    .style("fill", (d) => (d <= -0.3 ? "#fff" : "#111"));

  //resize
  function resize() {
    width = parseInt(d3.select("#svg-container").style("width"));
    height = parseInt(d3.select("#svg-container").style("height"));

    // Update the scale range
    yScale.range([margin.top + 80, height - margin.bottom + 100]);
    yLegendScale.range([height / 2 - 140, height / 2 + 140]);

    // Update the SVG width and height attributes
    svg.attr("width", width).attr("height", height);

    // Update the position and size of the axis
    svg
      .select(".y-axis")
      .attr("transform", `translate(${width - margin.right}, ${margin.top})`);
    yAxisGroup.selectAll("text").attr("x", -100).attr("dy", -15);

    // Update the position and size of the heatmap rects
    rects.attr("width", width - margin.left - margin.right - 50 - 60);

    // Update the position and size of the legend rects
    legendRects.attr("x", width - margin.right - 50);

    // Update the position of the legend labels
    legendLabels.attr("x", width - margin.right - 35);
  }

  // Call resize() initially to set the SVG size
  resize();

  // Call resize() whenever the window is resized
  window.addEventListener("resize", resize);
});
