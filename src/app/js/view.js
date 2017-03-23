let d3 = require('d3');
let conf = require('../config.js');
let css_variables = require('!css-variables-loader!../css/variables.css');

let PolicyView = Backbone.View.extend({
    el: '#svg-cascade-view',
    render: () => {
    }
});

let NetworkView = Backbone.View.extend({
    el: '#svg-network-view',
    render: () => {
    }
});

let StatBarView = Backbone.View.extend({
    el: '#svg-stat-bar-view',
    render: () => {
    }
});

module.exports = {
    PolicyView: PolicyView,
    NetworkView: NetworkView,
    StatBarView: StatBarView
};