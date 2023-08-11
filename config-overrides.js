module.exports = function override(config, env) {
  // 为mapbox-gl添加一个新规则，以确保它不被babel-loader处理
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules\/mapbox-gl/,
    type: "javascript/auto"
  });

// 查找默认的babel-loader规则
const babelLoaderRule = config.module.rules[1].oneOf.find(
  rule => /babel-loader/.test(rule.loader)
);

// 确保mapbox-gl不被这个规则处理
if (babelLoaderRule && babelLoaderRule.exclude) {
  babelLoaderRule.exclude.push(/node_modules[/\\]mapbox-gl/);
}

  return config;
};
