const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, 'todo.ts'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /.(jsx?|tsx?)$/,
      include: [
        path.resolve(__dirname, '')
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_components')
      ],
      loader: 'ts-loader'
      // ,
      // query: {
      //   presets: ['es2015']
      // }
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.tsx']
  },
  devtool: 'inline-source-map',
  devServer: {
    publicPath: path.join('/dist/')
  }
};

// // sample ts-loader config
// {
//   mode: "development",
//   devtool: "inline-source-map",
//   entry: "./app.ts",
//   output: {
//     filename: "bundle.js"
//   },
//   resolve: {
//     // Add `.ts` and `.tsx` as a resolvable extension.
//     extensions: [".ts", ".tsx", ".js"]
//   },
//   module: {
//     rules: [
//       // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
//       { test: /\.tsx?$/, loader: "ts-loader" }
//     ]
//   }
// };
