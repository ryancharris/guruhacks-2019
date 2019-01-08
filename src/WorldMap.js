import React, { Component, Fragment } from "react";

import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.css";
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

    return <path d={pathString} stroke={"blue"} strokeWidth={1} />;
  }

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
            {roiOutput.map(event => {
              const originCoordinates = [event.olon, event.olat];
              const destinationCoordinates = [event.dlon, event.dlat];

              return (
                <Fragment>
                  <circle
                    cx={projection(originCoordinates)[0]}
                    cy={projection(originCoordinates)[1]}
                    r={2}
                    fill={"red"}
                    className="origin-point"
                  />
                  <circle
                    cx={projection(destinationCoordinates)[0]}
                    cy={projection(destinationCoordinates)[1]}
                    r={2}
                    fill={"purple"}
                    className="destination-point"
                  />
                  {this.drawLine(originCoordinates, destinationCoordinates)}
                </Fragment>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}

export default WorldMap;
