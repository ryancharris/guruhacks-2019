import React, { Component, Fragment } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import get from "lodash.get";

import "./WorldMap.scss";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";
import cardData from "./json/createViewData.json";

const projection = d3
  .geoMercator() // or geoEquirectangular
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath(projection);

function createCityName(event, type) {
  const { dcity, dstate, dcountry, ocity, ostate, ocountry } = event;
  const destination = `${dcity}, ${dstate} ${dcountry}`;
  const origin = `${ocity}, ${ostate} ${ocountry}`;
  const cleanedOrigin = origin.replace(/"/g, "");
  const location = type === "origin" ? cleanedOrigin : destination;

  return location;
}

class WorldMap extends Component {
  state = {
    worldMap: worldMap,
    data: null,
    title: "guruHacks 2019",
    subtitle: "by Lisa, Pete & Ryan H."
  };

  componentDidMount() {
    // Select outermost <div> and append an <svg> to it
    const worldMapNode = d3.select("#worldMapRef");
    worldMapNode
      .append("svg")
      .attr("id", "mapSvg")
      .attr("viewBox", "0 0 950 500")
      .attr("xmlns", "http://www.w3.org/2000/svg");

    // Select the <svg> and add three <g> to it for SVG element rendering
    const svg = d3.select("#mapSvg");
    svg
      .append("g")
      .attr("class", "countries")
      .attr("id", "countriesRef");
    svg
      .append("g")
      .attr("class", "cities")
      .attr("id", "citiesRef");
    svg
      .append("g")
      .attr("class", "connection-lines")
      .attr("id", "connectionLinesRef");

    this.renderCountries();
  }

  componentDidUpdate() {
    this.renderCityDots();
    this.renderConnectionLines();
  }

  createOriginPoint(event, originCoordinates) {
    const citiesNode = d3.select("#citiesRef");
    const type = "origin";

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    citiesNode
      .append("circle")
      .attr("cx", projection(originCoordinates)[0])
      .attr("cy", projection(originCoordinates)[1])
      .attr("r", 3)
      .attr("class", "origin-point origin-point--origin")
      .on("mouseover", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html(`<p>${createCityName(event, type)}</p>`)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  createDestinationPoint(event, destinationCoordinates) {
    const citiesNode = d3.select("#citiesRef");
    const type = "origin";

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    citiesNode
      .append("circle")
      .attr("cx", projection(destinationCoordinates)[0])
      .attr("cy", projection(destinationCoordinates)[1])
      .attr("r", 1.5)
      .attr("class", "origin-point origin-point--destination")
      .on("mouseover", () => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html(`<p>${createCityName(event, type)}</p>`)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  renderCountries() {
    const countryNode = d3.select("#countriesRef");
    countryNode
      .append("path")
      .datum(feature(worldMap, worldMap.objects.countries))
      .attr("d", path)
      .attr("class", "country");
  }

  renderCityDots() {
    const { data } = this.state;

    data.forEach(event => {
      const { dlon, dlat, olon, olat } = event;
      const eventType = get(event, "type", null);
      const originCoordinates = [olon, olat];
      const destinationCoordinates = [dlon, dlat];

      if (eventType === "create") {
        // Card create events
        this.createOriginPoint(event, originCoordinates);
      } else if (eventType === "view") {
        // Card view events
        this.createDestinationPoint(event, destinationCoordinates);
      } else if (!eventType) {
        // ROI events
        this.createOriginPoint(event, originCoordinates);
        this.createDestinationPoint(event, destinationCoordinates);
      }
    });
  }

  renderConnectionLines() {
    const { data } = this.state;
    const linesNode = d3.select("#connectionLinesRef");

    data.forEach(event => {
      const eventType = get(event, "type", null);
      if (eventType === "create") {
        return;
      }

      const { olon, olat, dlon, dlat } = event;
      const origin = [olon, olat];
      const destination = [dlon, dlat];

      const coordData = [
        [projection(origin)[0], projection(origin)[1]],
        [projection(destination)[0], projection(destination)[1]]
      ];
      const lineGenerator = d3.line();
      const pathString = lineGenerator(coordData);

      linesNode
        .append("path")
        .attr("d", pathString)
        .attr("class", "connection-line")
        .on("mouseover", function() {
          this.classList.add("connection-line--hover");
        })
        .on("mouseout", function() {
          this.classList.remove("connection-line--hover");
        });
    });
  }

  handleCardClick = () => {
    d3.selectAll(".connection-line").remove();
    d3.selectAll(".origin-point").remove();

    this.setState({
      title: "Guru Card Events",
      subtitle: "Dec. 1, 2018 to Dec. 7, 2018",
      data: cardData
    });
  };

  handleContentClick = () => {
    d3.selectAll(".connection-line").remove();
    d3.selectAll(".origin-point").remove();

    this.setState({
      title: "Content ROI Events",
      subtitle: "All Time",
      data: roiOutput
    });
  };

  render() {
    const { subtitle, title } = this.state;
    return (
      <Fragment>
        <div className="WorldMap" id="worldMapRef" />
        <div className="WorldMap__footer">
          <h1 className="WorldMap__title">{title}</h1>
          <h2 className="WorldMap__sub-title">{subtitle}</h2>
          <div className="WorldMap__buttons">
            <button className="WorldMap__btn" onClick={this.handleContentClick}>
              Content ROI
            </button>
            <button className="WorldMap__btn" onClick={this.handleCardClick}>
              Card Events
            </button>
          </div>
        </div>
        <div className="WorldMap__legend">
          <h1>hey</h1>
        </div>
      </Fragment>
    );
  }
}

export default WorldMap;
