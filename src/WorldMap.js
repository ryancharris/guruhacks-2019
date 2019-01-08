import React, { Component } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import Delay from "react-delay";

import "./WorldMap.scss";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";

const projection = d3
  .geoEquirectangular()
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath().projection(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

class WorldMap extends Component {
  drawLine(origin, destination) {
    const coordData = [
      [projection(origin)[0], projection(origin)[1]],
      [projection(destination)[0], projection(destination)[1]]
    ];
    const lineGenerator = d3.line();
    const pathString = lineGenerator(coordData);

    return (
      <path
        className="connection-line"
        d={pathString}
        stroke={"#29cc96"}
        strokeWidth={0.7}
      />
    );
  }

  drawDot(origin) {
    return (
      <circle
        cx={projection(origin)[0]}
        cy={projection(origin)[1]}
        r={3}
        fill={"#e62e6b"}
        className="origin-point"
      />
    );
  }

  myFunc() {}

  render() {
    return (
      <div className="WorldMap">
        <svg
          id="mapSvg"
          viewBox="0 0 950 500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="countries">
            {countries.map(country => {
              return <path className="country" d={path(country)} />;
            })}
          </g>
          <g className="markers">
            {roiOutput.map((event, index) => {
              const originCoordinates = [event.olon, event.olat];
              const destinationCoordinates = [event.dlon, event.dlat];

              return (
                <Delay wait={index * 10}>
                  {this.drawLine(originCoordinates, destinationCoordinates)}
                  {this.drawDot(originCoordinates)}
                </Delay>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}

export default WorldMap;
