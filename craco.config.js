module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.noParse = /(mapbox-gl)\.js$/;
      return webpackConfig;
    }
  }
};