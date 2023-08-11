const { override, babelExclude } = require("customize-cra");

module.exports = override(
  babelExclude([/node_modules\/mapbox-gl/])
);