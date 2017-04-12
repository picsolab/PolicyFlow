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

        let zoom = d3.behavior.zoom()
            .y(yScale)
            .scaleExtent([1, 10]);

        // create svg element
        let svg = d3.select(_self.el)
            .attr('width', gs.p.size.width)
            .attr('height', gs.p.size.height)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("0 0 " + gs.p.size.width + " " + gs.p.size.height + ""))
            .classed('svg-content-responsive', true)
            .append('g')
            .attr('class', "graph")
            .attr('transform', "translate(" + gs.p.margin.left + "," + gs.p.margin.top + ")")
            .call(zoom);

        // create axes group
        let axesG = svg.append('g')
            .attr('class', "axes");

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

        _self.renderPalette(paletteG, yearList, xScale, yScale);
        _self.bindTriggers(yScale);

        zoom.on('zoom', (e) => {
            $(".temp-tick").remove();
            d3.select(_self.el).select(".y-axis").call(yAxis);
            _self.renderPalette(paletteG, yearList, xScale, yScale);
            _self.bindTriggers(yScale);
        });

        return this;
    },
    renderPalette(paletteG, yearList, xScale, yScale) {
        let _self = this;
        paletteG.selectAll('g').remove();

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
    render() {
        console.log("network view rendering...");
        var _self = this,
            data = this.model.get("detail");
        //var diameter = 500, //max size of the bubbles
        var color = d3.scale.category20b(); //color category

        var bubble = d3.layout.pack()
            .sort(null)
            //  .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select(_self.el)
            .attr("width", 850)
            .attr("height", 600)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', ("0 0 850 850"))
            .attr("class", "bubble");

        var projection = d3.geo.albersUsa();

        //setup the chart
        var bubbles = svg.append("g")
            .selectAll(".bubble")
            //.data(nodes)
            .data(data)
            .enter();

        //create the bubbles
        bubbles.append("circle")
            .attr("r", function(d) { return d.rpcpinc * 10; })
            .attr("fill", "DodgerBlue")
            .attr("opacity", 0.7)
            .attr("cx", function(d) { return 15 * (180 + d.long) - 600; })
            .attr("cy", function(d) { return 20 * (80 - d.lat) - 400; });
        //.style("fill", function(d) { return color(d.value); });

        //format the text for each bubble
        bubbles.append("text")
            .attr("x", function(d) { return 15 * (180 + d.long) - 600; })
            .attr("y", function(d) { return 20 * (80 - d.lat) - 400; })
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", function(d) { return d.rpcpinc * 5; })
            .attr("font-family", "sans-serif")
            .attr("font-weight", function(d) { return d.rpcpinc * 100; })
            .text(function(d) { return d["state_id"]; });

    }
});

let StatBarView = Backbone.View.extend({
    el: '#svg-stat-bar-view',
    render() {
        //prepare params
        let _self = this,
            data = _self.model.get("detail");

        // set the dimensions of the canvas
        var svg = d3.select(_self.el)
            .attr("height", "100")
            .attr("width", "1200");

        // load the data
        data.forEach(function(d) {
            d.state = d.state;
            d.num = +d.num;
        });

        // Add bar chart
        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .attr("width", "20")
            .attr("x", function(d, i) { return (i * 22) })
            .attr("y", "0")
            .attr("fill", "#bcbddc")
            .attr("height", function(d, i) { return (d.num * 6) });

        svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) { return d.state; })
            .attr("x", function(d, i) { return (i * 22) })
            .attr("y", function(d, i) { return (10 + d.num * 6) })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");

    }
});

module.exports = {
    PolicyView: PolicyView,
    NetworkView: NetworkView,
    StatBarView: StatBarView
};