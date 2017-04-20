let conf = require('../config.js');
let css_variables = require('!css-variables-loader!../css/variables.css');
let gs = require('./graphSettings.js');
let utils = require('./utils.js');
const eedges = conf.static.edges;

let colorList = [],
    colorMap = {};
let PolicyView = Backbone.View.extend({
    el: '#svg-cascade-view',
    render() {
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
        yearList.forEach((year, index) => {
            colorMap[year] = colorList[index];
        });

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
        var _self = this;

        d3.select(_self.el).selectAll('g').remove();

        var tip = d3tip()
            .attr('class', 'd3-tip-network')
            .offset([-10, 0])
            .html(function(d) {
                return "State: <span style='color:orangered; font-weight:bold'>" + d.stateName + "</span> <p>" + d.metaName + ": <span style='color:white'>" + d.metadata + "</span></p ><p>Adopted year: <span style='color:white'>" + (d.adoptedYear > 0 ? d.adoptedYear : "Haven't adopted") + "</span></p >";
            });

        var force = d3.layout.force()
            .charge(-100)
            .gravity(0)
            .size([1500, 600]);

        var svg = d3.select(_self.el)
            .attr("width", 850)
            .attr("height", 600)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("-300 -300 2200 1200"));

        _self.udpate(svg, tip, force);
    },
    udpate(svg, tip, force) {
        var _self = this,
            nodes = _self.model.get("detail");

        svg.call(tip);

        nodes.forEach(function(d) {
            d.state_id = d.stateId;
            d.x = +d.longtitude;
            d.x = 15 * (180 + d.x) - 600;
            d.y = +d.latitude;
            d.y = 20 * (80 - d.y) - 400
            d.gravity_x = d.x * 1.8;
            d.gravity_y = d.y;
            if (d.normalizedMetadata < 0) { d.r = 20; } else d.r = d.normalizedMetadata * 150;
        });

        nodes = nodes.slice(0, 50)

        force
            .nodes(nodes)
            .start()
            .on("tick", function(e) {
                var k = e.alpha,
                    kg = k * .02,
                    spaceAround = 0.;

                nodes.forEach(function(a, i) {
                    // Apply gravity forces.
                    a.x += (a.gravity_x - a.x) * kg;
                    a.y += (a.gravity_y - a.y) * kg;

                    a.overlapCount = 0;

                    nodes.slice(i + 1).forEach(function(b) {

                        dx = (a.x - b.x)
                        dy = (a.y - b.y)

                        adx = Math.abs(dx)
                        ady = Math.abs(dy)

                        mdx = (1 + spaceAround) * (a.r + b.r) / 2
                        mdy = (1 + spaceAround) * (a.r + b.r) / 2

                        if (adx < mdx && ady < mdy) {
                            l = Math.sqrt(dx * dx + dy * dy)

                            lx = (adx - mdx) / l * k
                            ly = (ady - mdy) / l * k

                            // choose the direction with less overlap
                            if (lx > ly && ly > 0) lx = 0;
                            else if (ly > lx && lx > 0) ly = 0;

                            dx *= lx;
                            dy *= ly;
                            a.x -= dx;
                            a.y -= dy;
                            b.x += dx;
                            b.y += dy;

                            a.overlapCount++;
                        }
                    });
                });

                svg.selectAll("circle")
                    .attr("cx", function(d) { return d.x - d.r / 2; })
                    .attr("cy", function(d) { return d.y - d.r / 2; });

                svg.selectAll("text")
                    .attr("x", function(d) { return d.x - d.r / 2; })
                    .attr("y", function(d) { return d.y - d.r / 2; });
            });

        var g = svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("transform", "translate(100,100),scale(0.5)")
            .call(force.drag);

        g.append("circle")
            .attr("opacity", 0.8)
            .attr("fill", function(d) {
                if (+d.adoptedYear === -1) {
                    return css_variables["--color-unadopted"];
                } else {
                    return colorMap[d.adoptedYear];
                }
            })
            .attr("cx", function(d) { return d.x - d.r / 2; })
            .attr("cy", function(d) { return d.y - d.r / 2; })
            .attr("r", function(d) { return d.r; })
            .on("mouseover", function(d, i) {
                tip.show(d, i);
                d3.select(".d3-tip-network")
                    .style("opacity", 0.9);
            })
            .on('mouseout', tip.hide);

        g.append("text")
            .attr("x", function(d) { return d.x - d.r / 2; })
            .attr("y", function(d) { return d.y - d.r / 2; })
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", function(d) { return 30; })
            .attr("font-family", "sans-serif")
            .attr("font-weight", function(d) { return d.r; })
            .text(function(d) { return d["state_id"]; });
    }

});

let StatBarView = Backbone.View.extend({
    el: '#svg-stat-bar-view',
    render() {
        //prepare params
        let _self = this,
            data = _self.model.get("detail");

        var tip = d3tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span style='color:red'>" + d.state_name + "</span><strong> root number:</strong> <span style='color:black'>" + d.num + "</span>";
            });

        // set the dimensions of the canvas
        var svg = d3.select(_self.el)
            .attr("height", "100")
            .attr("width", "1200");

        svg.call(tip);

        // load the data
        data.forEach(function(d) {
            d.state_id = d.state_id;
            d.num = +d.num;
            d.state_name = d.state_name;
        });

        // Add bar chart
        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", "20")
            .attr("x", function(d, i) { return (i * 22) })
            .attr("y", "0")
            .attr("fill", "#bcbddc")
            .attr("height", function(d, i) { return (d.num * 3) })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) { return d.state_id; })
            .attr("x", function(d, i) { return (i * 22) })
            .attr("y", function(d, i) { return (10 + d.num * 3) })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");

    }
});

// util definition
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

module.exports = {
    PolicyView: PolicyView,
    NetworkView: NetworkView,
    StatBarView: StatBarView
};