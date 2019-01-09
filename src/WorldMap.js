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
    worldMap: null,
    roiOutput: null,
    title: "Content ROI Events"
  };

  componentWillMount() {
    this.setState({ worldMap, roiOutput });
  }

  componentDidMount() {
    this.renderCountries();
    this.renderOriginPoints();
    this.renderDestinationPoints();
    // this.renderConnectionLines();
    this.renderCurvedLines();
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

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    roiOutput.forEach(event => {
      const { olon, olat } = event;
      const originCoordinates = [olon, olat];
      const type = "origin";

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
    });
  }

  renderDestinationPoints() {
    const citiesNode = d3.select(this.refs.citiesRef);
    const type = "destination";

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    roiOutput.forEach(event => {
      const { dlon, dlat } = event;
      const destCoords = [dlon, dlat];

      citiesNode
        .append("circle")
        .attr("cx", projection(destCoords)[0])
        .attr("cy", projection(destCoords)[1])
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
    });
  }

  // renderConnectionLines() {
  //   const linesNode = d3.select(this.refs.connectionLinesRef);

  //   roiOutput.forEach(event => {
  //     const { olon, olat, dlon, dlat } = event;
  //     const origin = [olon, olat];
  //     const destination = [dlon, dlat];

  //     const coordData = [
  //       [projection(origin)[0], projection(origin)[1]],
  //       [projection(destination)[0], projection(destination)[1]]
  //     ];
  //     const lineGenerator = d3.line();
  //     const pathString = lineGenerator(coordData);

  //     linesNode
  //       .append("path")
  //       .attr("d", pathString)
  //       .attr("class", "connection-line")
  //       .on("mouseover", function() {
  //         this.classList.add("connection-line--hover");
  //       })
  //       .on("mouseout", function() {
  //         this.classList.remove("connection-line--hover");
  //       });
  //   });
  // }

  renderCurvedLines() {
    const linesNode = d3.select(this.refs.connectionLinesRef);
    roiOutput.forEach(event => {
      const { olon, olat, dlon, dlat } = event;
      const origin = [olon, olat];
      const dest = [dlon, dlat];
      const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

      const curveoffset = 5;
      const midcurve = [mid[0] + curveoffset, mid[1] - curveoffset];
      // the scalar variable is used to scale the curve's derivative into a unit vector
      const scalar = Math.sqrt(
        Math.pow(projection(dest)[0], 2) -
          2 * projection(dest)[0] * projection(midcurve)[0] +
          Math.pow(projection(midcurve)[0], 2) +
          Math.pow(projection(dest)[1], 2) -
          2 * projection(dest)[1] * projection(midcurve)[1] +
          Math.pow(projection(midcurve)[1], 2)
      );

      // const coordData = [
      //   [projection(origin)[0], projection(origin)[1]],
      //   [projection(dest)[0], projection(dest)[1]]
      // ];
      // const lineGenerator = d3.line();
      // const pathString = lineGenerator(coordData);
      // M281.2749980133244,133.05247801290298L182.36666570403014,133.42598440095506
      const pathString =
        "M" +
        projection(origin)[0] +
        "," +
        projection(origin)[1] +
        // smooth curve to offset midpoint
        "S" +
        projection(midcurve)[0] +
        "," +
        projection(midcurve)[1] +
        //smooth curve to destination
        "," +
        projection(dest)[0] +
        "," +
        projection(dest)[1] +
        // straight line towards original curve along scaled orthogonal vector (creates notched arrow head)
        "l" +
        (0.3 * (-projection(dest)[1] + projection(midcurve)[1])) / scalar +
        "," +
        (0.3 * (projection(dest)[0] - projection(midcurve)[0])) / scalar +
        // smooth curve to midpoint
        "S" +
        projection(midcurve)[0] +
        "," +
        projection(midcurve)[1] +
        //smooth curve to origin
        "," +
        projection(origin)[0] +
        "," +
        projection(origin)[1];

      // console.log("pathString", pathString);

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
    this.setState({
      title: "Guru Card Events"
    });
  };

  handleContentClick = () => {
    this.setState({
      title: "Content ROI Events"
    });
  };

  render() {
    const { title } = this.state;
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
        <div className="WorldMap__footer">
          <h1 className="WorldMap__title">{title}</h1>
          <h2 className="WorldMap__sub-title">December 2018</h2>
          <div className="WorldMap__buttons">
            <button className="WorldMap__btn" onClick={this.handleContentClick}>
              Content ROI
            </button>
            <button className="WorldMap__btn" onClick={this.handleCardClick}>
              Card Events
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default WorldMap;
