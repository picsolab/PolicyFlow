var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
    entry: {
        app: './src/main.js',
        vendor: './src/vendor.js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [{
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader' })
            },
            {
                test: /\.html$/,
                include: helpers.root('src', 'app', 'templates'),
                loader: "underscore-template-loader",
                query: {
                    engine: 'lodash',
                }
            }
        ]
    },

    plugins: [

        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor'],
            minChunks: Infinity
        }),
        new HtmlWebpackPlugin({
            filename: helpers.root('app', 'templates', 'index.html'),
            template: 'src/app/index.html'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'lodash',
            d3: 'd3',
            dc: 'dc',
            crossfilter: 'crossfilter',
            Backbone: 'backbone',
            d3tip: 'd3-tip',
            topojson: 'topojson'
        }),
        new CopyWebpackPlugin([{
            from: helpers.root('src', 'data'),
            to: 'data'
        }, {
            from: helpers.root('src', 'assets/images/favicon.ico')
        }, {
            from: helpers.root('src', 'assets/images/ellipsis.gif'),
            to: 'assets/ellipsis.gif'
        }])

    ]
};