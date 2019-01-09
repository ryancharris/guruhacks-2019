import React from "react";
import PropTypes from "prop-types";

function ConnectionLine(props) {
  const { pathString } = props;

  return <path className="connection-line" d={pathString} />;
}

export default ConnectionLine;

ConnectionLine.propTypes = {
  pathString: PropTypes.string.isRequired
};
