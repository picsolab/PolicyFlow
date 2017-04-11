var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

module.exports = webpackMerge(commonConfig, {
    // devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root('app/static'),
        publicPath: 'http://localhost:50005/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin('[name].bundle.css')
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal'
    }
});