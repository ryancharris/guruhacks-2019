import React, { Component } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import Delay from "react-delay";

import "./WorldMap.scss";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";

const projection = d3
  .geoMercator() // or geoEquirectangular
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath(projection);
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

  drawDot(name, coords, isOriginPoint) {
    const cn = isOriginPoint
      ? "origin-point origin-point--origin"
      : "origin-point origin-point--destination";

    const radius = isOriginPoint ? 3 : 1.5;
    return (
      <circle
        cx={projection(coords)[0]}
        cy={projection(coords)[1]}
        r={radius}
        className={cn}
      />
    );
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
            {roiOutput.map((event, index) => {
              const {
                dcity,
                dstate,
                dcountry,
                olon,
                olat,
                dlon,
                dlat,
                ocity,
                ostate,
                ocountry
              } = event;
              const originName = `${ocity ? ocity : null}${
                ocity ? "," : null
              } ${ostate ? ostate : null} ${ocountry ? ocountry : null}`;
              const destinationName = `${dcity ? dcity : null}${
                dcity ? "," : null
              } ${dstate ? dstate : null} ${dcountry ? dcountry : null}`;
              const originCoordinates = [olon, olat];
              const destinationCoordinates = [dlon, dlat];

              return (
                <Delay wait={index / 2}>
                  {this.drawLine(originCoordinates, destinationCoordinates)}
                  {this.drawDot(originName, originCoordinates, true)}
                  {this.drawDot(destinationName, destinationCoordinates, false)}
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
