module.exports = function override(config, env) {
  // 为mapbox-gl添加一个新规则，以确保它不被babel-loader处理
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules\/mapbox-gl/,
    type: "javascript/auto"
  });

  // 查找babel-loader规则，并将mapbox-gl从其exclude列表中移除
  const babelLoaderFilter = (rule) =>
    rule.loader && rule.loader.includes('babel') &&
    rule.exclude && rule.exclude instanceof RegExp;
  
  let loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
  let babelLoader = loaders.find(babelLoaderFilter);
  
  if (babelLoader) {
    babelLoader.exclude = [/[/\\\\]node_modules[/\\\\](?!mapbox-gl)[/\\\\]/];
  }

  return config;
};
