/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const MaleMemojis = ({ person, skinTone, posture, className }) => {
  return (
    <div
      className={`relative top-10 left-10 w-64 h-64 bg-[url(/img/29-5.png)] bg-cover bg-[50%_50%] ${className}`}
    />
  );
};

MaleMemojis.propTypes = {
  person: PropTypes.oneOf(["mattew"]),
  skinTone: PropTypes.oneOf(["white"]),
  posture: PropTypes.oneOf(["one-happy"]),
};
