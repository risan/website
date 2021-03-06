const webpack = require('webpack');

const run = webpackConfig =>
  new Promise((resolve, reject) =>
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(stats.toJson().errors);
      }

      return resolve(stats);
    })
  );

const watch = (
  webpackConfig,
  { onError = () => {}, onSuccess = () => {} } = {}
) =>
  webpack(webpackConfig).watch(
    {
      ignored: /node_modules/
    },
    (err, stats) => {
      if (err) {
        return onError();
      }

      if (stats.hasErrors()) {
        return onError(stats.toJson().errors);
      }

      return onSuccess(stats);
    }
  );

const printStats = stats => {
  if (stats.hasWarnings()) {
    console.warn(stats.toJson().warnings);
  }

  console.log(
    stats.toString({
      cachedAssets: false,
      chunks: false,
      colors: true,
      modules: false
    })
  );
};

const printError = err => {
  console.error(err.stack || err);

  if (err.details) {
    console.error(err.details);
  }
};

module.exports = {
  run,
  watch,
  printStats,
  printError
};
