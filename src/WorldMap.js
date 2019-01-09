import React, { Component, Fragment } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.scss";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";

const projection = d3
  .geoMercator() // or geoEquirectangular
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath(projection);

function createCityName(event) {
  const { dcity, dstate, dcountry, ocity, ostate, ocountry } = event;
  const destination = `${dcity}, ${dstate} ${dcountry}`;
  const origin = `${ocity}, ${ostate} ${ocountry}`;
  const cleanedOrigin = origin.replace(/"/g, "");

  return {
    destinationName: destination,
    originName: cleanedOrigin
  };
}

class WorldMap extends Component {
  state = {
    worldMap: null,
    roiOutput: null
  };

  componentWillMount() {
    this.setState({ worldMap, roiOutput });
  }

  componentDidMount() {
    this.renderCountries();
    this.renderOriginPoints();
    this.renderDestinationPoints();
    this.renderConnectionLines();
  }

  renderCountries() {
    const countryNode = d3.select(this.refs.countriesRef);
    countryNode
      .append("path")
      .datum(feature(worldMap, worldMap.objects.countries))
      .attr("d", path)
      .attr("class", "country");
  }

  renderOriginPoints() {
    const citiesNode = d3.select(this.refs.citiesRef);
    // const tooltip = d3.select(this.refs.tooltip);

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    roiOutput.forEach(event => {
      const { olon, olat } = event;
      const originCoordinates = [olon, olat];

      citiesNode
        .append("circle")
        .attr("cx", projection(originCoordinates)[0])
        .attr("cy", projection(originCoordinates)[1])
        .attr("r", 3)
        .attr("class", "origin-point origin-point--origin")
        .on("mouseover", () => {
          console.log("mouseover", event);
          div
            .transition()
            .duration(200)
            .style("opacity", 0.9);
          div
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          console.log("mouseout");
          div
            .transition()
            .duration(500)
            .style("opacity", 0);
        });
    });
  }

  renderDestinationPoints() {
    const citiesNode = d3.select(this.refs.citiesRef);

    roiOutput.forEach(event => {
      const { dlon, dlat } = event;
      const destCoords = [dlon, dlat];

      citiesNode
        .append("circle")
        .attr("cx", projection(destCoords)[0])
        .attr("cy", projection(destCoords)[1])
        .attr("r", 1.5)
        .attr("class", "origin-point origin-point--destination");
    });
  }

  renderConnectionLines() {
    const linesNode = d3.select(this.refs.connectionLinesRef);

    roiOutput.forEach(event => {
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

  render() {
    return (
      <Fragment>
        <div className="WorldMap">
          <svg
            id="mapSvg"
            viewBox="0 0 950 500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="countries" ref="countriesRef" />
            <g className="cities" ref="citiesRef" />
            <g className="connection-lines" ref="connectionLinesRef" />
          </svg>
        </div>
        {/* <div className="tooltip" ref="tooltipRef" /> */}
        <div className="WorldMap__footer">
          <h1 className="WorldMap__title">
            Global Content Tracking Consumption
          </h1>
          <h2 className="WorldMap__sub-title">December 2018</h2>
        </div>
      </Fragment>
    );
  }
}

export default WorldMap;
