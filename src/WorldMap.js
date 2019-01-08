import React, { Component, Fragment } from "react";

import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.css";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";

const mapCenter = d3.geoCentroid(feature(worldMap, worldMap.objects.countries));
const projection = d3
  .geoEquirectangular()
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath().projection(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

class WorldMap extends Component {
  render() {
    return (
      <div className="WorldMap">
        <svg
          id="mapSvg"
          // width="950"
          // height="500"
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
                </Fragment>
              );
            })}
            {/* <circle
              cx={this.projection()(coordinates)[0]}
              cy={this.projection()(coordinates)[1]}
              r={2}
            /> */}
          </g>
        </svg>
      </div>
    );
  }
}

export default WorldMap;
