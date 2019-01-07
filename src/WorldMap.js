import React, { Component } from "react";

import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.css";
import worldMap from "./json/worldMap.json";

const projection = d3.geoEquirectangular();
const path = d3.geoPath().projection(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

class WorldMap extends Component {
  render() {
    console.log(worldMap);
    return (
      <div className="WorldMap">
        <svg width={960} height={500}>
          <g>
            {countries.map(country => {
              console.log(country);
              return <path className="country" d={path(country)} />;
            })}
          </g>
        </svg>
      </div>
    );
  }
}

export default WorldMap;
