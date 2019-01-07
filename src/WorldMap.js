import React, { Component } from "react";

import * as d3 from "d3";
import { feature } from "topojson-client";

import "./WorldMap.css";
import worldMap from "./json/worldMap.json";

const projection = d3.geoEquirectangular();
const path = d3.geoPath().projection(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

class WorldMap extends Component {
  componentDidMount() {
    console.log(worldMap);

    d3.select("mapSvg")
      .data([100, 100])
      .enter()
      .append("circle")
      .attr("cx", d => {
        return projection(d)[0];
      })
      .attr("cy", d => {
        return projection(d)[1];
      })
      .attr("r", "3px")
      .attr("fill", "red");
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
          {/* <g className="markers">
            <circle cx={40.7651} cy={-73.9858} r={3} />
          </g> */}
        </svg>
      </div>
    );
  }
}

export default WorldMap;
