var webpack = require('webpack')
var path = require('path')
const VersioningPlugin = require('versioning-webpack-plugin')


// Naming and path settings
var appName = 'app';
var entryPoint = './src/app.js';
var exportPath = path.resolve(__dirname, './dist');

// Enviroment flag
var plugins = [
    new VersioningPlugin({
        cleanup: true,                      // should it remove old files?
        basePath: './',                     // manifest.json base path
        manifestFilename: 'manifest.json'   // name of the manifest file
    }),
    function(compiler) {
        this.plugin("done", function(stats) {
            require("fs").writeFileSync(
                path.join(__dirname, "stats.json"),
                JSON.stringify(stats.toJson().assetsByChunkName));
        });
    }
];
var env = process.env.WEBPACK_ENV;

// Differ settings based on production flag
if (env === 'production') {
  var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

  plugins.push(new UglifyJsPlugin({ minimize: true }));
  plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }
  ));

  appName = appName + '.min.js';
} else {
  appName = appName + '.js';
}

// Main Settings config
module.exports = {
  entry: entryPoint,
  output: {
    path: exportPath,
    filename: appName
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
          options: {
              loaders: {
                  js: {
                      loader: 'babel-loader',
                      options: {
                          presets: ['es2015']
                      }
                  },
              }
          }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins
};
