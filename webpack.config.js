const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js'
  },

  resolve: {
    alias: {
      'lib/timeliner': path.join(__dirname, 'lib/timeliner/src'),
      'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js')
    }
  },

  plugins:[
    new webpack.ProvidePlugin({
      'THREE': 'three'
    })
  ]
}
