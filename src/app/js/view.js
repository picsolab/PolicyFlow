let conf = require('../config.js');
let css_variables = require('!css-variables-loader!../css/variables.css');
let gs = require('./graphSettings.js');
let utils = require('./utils.js');

let colorList = [];
let PolicyView = Backbone.View.extend({
    el: '#svg-cascade-view',
    render() {
        console.log("policy view rendering...");

        // prepare params
        // - use Jan 1st to represent the year.
        let _self = this,
            yearOffset = Math.ceil((+_self.model.get('policyEnd') - +_self.model.get('policyStart')) * 0.1),
            startYear = new Date(+_self.model.get('policyStart') - yearOffset, 0, 1),
            endYear = new Date(+_self.model.get('policyEnd') + yearOffset, 0, 1),
            yearList = Object.keys(_self.model.get("detail")),
            gWidth = gs.p.size.width - (gs.p.margin.left + gs.p.margin.right),
            gHeight = gs.p.size.height - (gs.p.margin.top + gs.p.margin.bottom);

        // compute color list based on length of year list
        colorList = utils.generateColor(css_variables["--color-trans-out"], css_variables["--color-trans-in"], yearList.length);

        // this.initParams();

        // clear the canvas
        d3.select(_self.el).selectAll('g').remove();

        // create svg element
        let svg = d3.select(_self.el)
            .attr('width', gs.p.size.width)
            .attr('height', gs.p.size.height)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("0 0 " + gs.p.size.width + " " + gs.p.size.height + ""))
            .classed('svg-content-responsive', true)
            .append('g')
            .attr('class', "graph")
            .attr('transform', "translate(" + gs.p.margin.left + "," + gs.p.margin.top + ")");

        // create axes group
        let axesG = svg.append('g')
            .attr('class', "axes");

        // define x-axis scale - liner
        let xScale = d3.scale.ordinal()
            .domain(Array.apply(null, { length: gs.p.config.xMaxTick }).map(Number.call, Number))
            .rangeBands([0, gWidth], gs.p.margin.xPadding, gs.p.margin.xOuterPadding);

        // define x-axis with xScale
        let xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('top')
            .ticks(gs.p.config.xMaxTick);

        // create y-axis scale - time
        let yScale = d3.time.scale()
            .domain([startYear, endYear])
            .range([0, gHeight]);

        // define y-axis with yScale
        let yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .ticks(gs.p.config.yMaxTick)
            .tickFormat(utils.axisTimeFormat);

        // render axes
        axesG.append('g')
            .attr({
                class: 'x-axis'
            })
            .call(xAxis);

        axesG.append('g')
            .attr({
                class: "y-axis",
            })
            .call(yAxis);

        // create palette group
        let paletteG = svg.append('g')
            .attr('class', "palette");

        yearList.forEach((year, index) => {
            // prepare data and params
            let forTheYear = _self.model.get("detail")[year].sort(),
                numberOfLines = Math.ceil(forTheYear.length / gs.p.config.xMaxTick),
                height = numberOfLines * xScale.rangeBand() + (numberOfLines - 1) * gs.p.margin.yPadding;

            // create group wrapper
            let partialWrapper = paletteG.append('g')
                .attr({
                    'class': "partial wrapper-level-" + index,
                    'transform': "translate(0," + (-height / 2) + ")"
                });

            // draw rects
            partialWrapper.selectAll("state")
                .data(forTheYear)
                .enter()
                .append('rect')
                .attr({
                    class: "state level-" + index + " " + year,
                    value: (d) => d,
                    fill: () => colorList[index],
                    stroke: "#fff",
                    width: xScale.rangeBand() - gs.p.margin.xPadding,
                    height: xScale.rangeBand() - gs.p.margin.xPadding,
                    x: (d, i) => xScale(i % gs.p.config.xMaxTick),
                    y: (d, i) => yScale(new Date(+year, 0, 1)),
                    rx: 2,
                    ry: 2,
                    transform: (d, i) => "translate(0," + Math.floor(i / gs.p.config.xMaxTick) * (xScale.rangeBand() + gs.p.margin.yPadding) + ")"
                });

            // append text
            partialWrapper.selectAll("text-tip ")
                .data(forTheYear)
                .enter()
                .append('text')
                .text((d) => (" - " + d))
                .attr({
                    class: (d) => "text-tip " + year + " " + d,
                    x: (d, i) => xScale(i % gs.p.config.xMaxTick),
                    y: (d, i) => yScale(new Date(+year, 0, 1)),
                    transform: (d, i) => "translate(" + (xScale.rangeBand() + gs.p.margin.textXShift) + "," + (Math.floor(i / gs.p.config.xMaxTick) * (xScale.rangeBand() + gs.p.margin.yPadding) + gs.p.margin.textYShift) + ")"
                });
        });

        _self.bindTriggers(yScale);

        return this;
    },
    bindTriggers(yScale) {
        let element, year, tickList = [];
        this.$el.find(".y-axis .tick text").map((index, element) => tickList.push(element.textContent));

        $(".partial").on('mouseover', (e) => {
            if (e.target.nodeName === 'rect') {
                element = $(e.target);
                year = e.target.classList[2];
            } else {
                element = $(e.target.parentElement).find("rect[value=" + e.target.classList[2] + "]");
                year = e.target.classList[1];
            }
            element.attr("fill", css_variables["--color-pop-up"]);

            d3.select("#svg-cascade-view .y-axis").selectAll("tempTick")
                .data([year])
                .enter()
                .append('text')
                .text(tickList.indexOf("" + year) === -1 ? (year + " ►") : " ►")
                .attr({
                    class: "temp-tick",
                    y: yScale(new Date(+year, 0, 1)),
                    transform: () => tickList.indexOf("" + year) === -1 ? "translate(-37,4)" : "translate(-8,4)"
                });

        });

        $(".partial").on('mouseout', (e) => {
            let index = e.target.parentElement.classList[1].split("-")[2];
            if (e.target.nodeName === "rect") {
                element = $(e.target);
                year = e.target.classList[2];
            } else {
                element = $(e.target.parentElement).find("rect[value=" + e.target.classList[2] + "]");
                year = e.target.classList[1];
            }
            element.attr("fill", colorList[index]);
            $(".temp-tick").remove();
        });
    },
    initParams() {
        let detail = this.model.get("detail"),
            maxTickCount = 0,
            totalCount = 0;

        // compute total number of states and the maximum number of state across all those years
        _.each(detail, (year, stateList) => {
            let count = stateList.length;
            totalCount += count;
            if (count > maxTickCount) {
                maxTickCount = count;
            }
        });

    }
});

let NetworkView = Backbone.View.extend({
    el: '#svg-network-view',
    render() {}
});

let StatBarView = Backbone.View.extend({
    el: '#svg-stat-bar-view',
    render() {}
});

module.exports = {
    PolicyView: PolicyView,
    NetworkView: NetworkView,
    StatBarView: StatBarView
};