import React, { Component, Fragment } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import Delay from "react-delay";

import CityDot from "./CityDot";
import ConnectionLine from "./ConnectionLine";

import "./WorldMap.scss";
import worldMap from "./json/worldMap.json";
import roiOutput from "./json/roiOutput.json";

const projection = d3
  .geoMercator() // or geoEquirectangular
  .scale(150)
  .translate([950 / 2, 500 / 2]);
const path = d3.geoPath(projection);
const countries = feature(worldMap, worldMap.objects.countries).features;

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
  // createCityLabels(originCoords, destinationCoords) {
  //   return roiOutput.map(event => {
  //     const cityNames = createCityName(event);
  //     const { originName, destinationName } = cityNames;

  //     return (
  //       <Fragment>
  //         <text x={projection(originCoords)[0]} y={projection(originCoords)[1]}>
  //           {originName}
  //         </text>
  //         <text
  //           x={projection(destinationCoords)[0]}
  //           y={projection(destinationCoords)[1]}
  //         >
  //           {destinationName}
  //         </text>
  //       </Fragment>
  //     );
  //   });
  // }
  state = {
    worldMap: null,
    roiOutput: null
  };

  componentWillMount() {
    this.setState({ worldMap, roiOutput });
  }

  componentDidMount() {
    const countryNode = d3.select(this.refs.countriesRef);
    console.log("node", countryNode);
    countryNode.append("path").attr("class", "country");
  }

  drawLine(origin, destination) {
    const coordData = [
      [projection(origin)[0], projection(origin)[1]],
      [projection(destination)[0], projection(destination)[1]]
    ];
    const lineGenerator = d3.line();
    const pathString = lineGenerator(coordData);

    return <ConnectionLine pathString={pathString} />;
  }

  drawDot(name, coords, isOriginPoint) {
    return (
      <CityDot
        xCoord={projection(coords)[0]}
        yCoord={projection(coords)[1]}
        isOrigin={isOriginPoint}
      />
    );
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
            {/* <g className="countries">
              {countries.map(country => {
                return <path className="country" d={path(country)} />;
              })}
            </g> */}
            <g className="countries" ref="countriesRef" />
            <g className="markers">
              {roiOutput.map((event, index) => {
                const { olon, olat, dlon, dlat } = event;
                const cityNames = createCityName(event);
                const { originName, destinationName } = cityNames;
                const originCoordinates = [olon, olat];
                const destinationCoordinates = [dlon, dlat];

                return (
                  <Delay wait={index + 500}>
                    {this.drawLine(originCoordinates, destinationCoordinates)}
                    {this.drawDot(originName, originCoordinates, true)}
                    {this.drawDot(
                      destinationName,
                      destinationCoordinates,
                      false
                    )}
                    {/* {this.createCityLabels(
                      originCoordinates,
                      destinationCoordinates
                    )} */}
                  </Delay>
                );
              })}
            </g>
          </svg>
        </div>
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
