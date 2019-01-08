import React, { Component } from "react";

import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.css";
import worldMap from "./json/worldMap.json";

const projection = d3.geoEquirectangular();
const path = d3.geoPath().projection(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

class WorldMap extends Component {
  projection() {
    return d3
      .geoEquirectangular()
      .scale(150)
      .translate([950 / 2, 500 / 2]);
  }

  componentDidMount() {
    console.log(worldMap);
  }

  render() {
    const coordinates = [-43.1729, -22.9068];

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
            <circle
              cx={this.projection()(coordinates)[0]}
              cy={this.projection()(coordinates)[1]}
              r={2}
            />
          </g>
        </svg>
      </div>
    );
  }
}

export default WorldMap;
