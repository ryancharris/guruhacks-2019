import React from "react";
import PropTypes from "prop-types";

function CityDot(props) {
  const { xCoord, yCoord, isOrigin } = props;
  const radius = isOrigin ? 3 : 1.5;
  const cn = isOrigin
    ? "origin-point origin-point--origin"
    : "origin-point origin-point--destination";

  return <circle cx={xCoord} cy={yCoord} r={radius} className={cn} />;
}

export default CityDot;

CityDot.propTypes = {
  xCoord: PropTypes.number.isRequired,
  yCoord: PropTypes.number.isRequired,
  isOrigin: PropTypes.bool.isRequired
};
