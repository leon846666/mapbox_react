module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.noParse = /(mapbox-gl)\.js$/;

      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      });
      
      
      return webpackConfig;
    }
  }
};