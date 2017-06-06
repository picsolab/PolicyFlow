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
        if (this.model.get("message") !== "success") {
            $("#policy-unselected-notitication").show();
            this.$el.hide();
        } else {
            $("#policy-unselected-notitication").hide();
            this.paint();
            this.$el.show();
        }
        return this;
    },
    paint() {
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
        colorMap = {};
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
            element.addClass("hovered-item");

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
            element.removeClass("hovered-item");
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

        $(_self.el).empty();

        var tip = d3tip()
            .attr('class', 'd3-tip-network')
            .offset([-10, 0])
            .html(function(d) {
                return "State: <span style='color:orangered; font-weight:bold'>" + d.stateName + "</span> <p>" + d.metaName + ": <span style='color:white'>" + d.metadata + "</span></p ><p>Adopted year: <span style='color:white'>" + (d.adoptedYear < 9999 ? d.adoptedYear : "Haven't adopted") + "</span></p >";
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
        /**
         * NOTES: modifications made:
         * 1. tip class name: d3-tip-network;
         * 2. color and opacity: locate by search:  .attr("fill", (d) => {
         * 3. move gradient definition to seperate function named defineGradient
         * 4. remove duplicated svg definition
         */
        var _self = this,
            nnodes = _self.model.get("detail");

        svg.call(tip);

        nnodes.forEach(function(d) {
            d.state_id = d.stateId;
            d.x = +d.longtitude;
            d.x = 15 * (180 + d.x) - 600;
            d.y = +d.latitude;
            d.y = 20 * (80 - d.y) - 400;
            d.gravity_x = d.x * 1.5;
            d.gravity_y = d.y;
            if (d.normalizedMetadata < 0) {
                d.r = 20;
            } else d.r = d.normalizedMetadata * 100;
        });

        nnodes = nnodes.slice(0, 50)

        force
            .nodes(nnodes)
            //.links(eedges)
            .start()
            .on("end", function(e) {
                var d3line = d3.svg.line()
                    .x(function(d) {
                        return d.x;
                    })
                    .y(function(d) {
                        return d.y;
                    });
                var fbundling = d3.ForceEdgeBundling().nodes(nnodes).edges(eedges);
                var results = fbundling();

                var defs = svg.append("defs");
                _self.defineGradient(defs);

                var texts = $("#svg-network-view text");
                // console.log("texts", texts[3].innerHTML);

                for (var i = 0; i < results.length; i++) {
                    // console.log("results", results[i]);

                    svg.append("svg:defs").selectAll("marker")
                        .data(["end"]) // Different link/path types can be defined here
                        .enter().append("svg:marker") // This section adds in the arrows
                        .attr("id", String)
                        .attr("viewBox", "0 -5 12 12")
                        .attr("refX", 0)
                        .attr("refY", 0)
                        .attr("markerWidth", 4)
                        .attr("markerHeight", 3)
                        .style("fill", "red")
                        .style('opacity', 0.3)
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5");

                    if (results[i][0].adoptedYear != 9999 && results[i][results[i].length - 1].adoptedYear != 9999) {
                        svg.append("path")
                            .attr("d", d3line(results[i]))
                            .attr("id", String(i))
                            .style("stroke-width", 10)
                            .attr('stroke-linecap', 'round')
                            .style("stroke", function(d) {
                                if (results[i][0].adoptedYear > results[i][results[i].length - 1].adoptedYear) {
                                    return "black";
                                } else if (results[i][0].x < results[i][results[i].length - 1].x) {
                                    return "url(#gradient_1)";
                                } else if (results[i][0].x >= results[i][results[i].length - 1].x) {
                                    return "url(#gradient_2)";
                                }
                            })
                            //.style("stroke", function(d) {if (results[i][0].adoptedYear < results[i][results[i].length-1].adoptedYear == -1)  {return "grey";} })
                            .style("fill", "none")
                            .style('stroke-opacity', 0.3)
                            .attr("marker-end", "url(#end)")

                        .on("mouseover", function() {
                            var temp = parseInt(d3.select(this).attr("id"));
                            var temp_len = results[temp].length;

                            $(_self.el).find("text").css("fill", "Silver");
                            d3.select(this).style('stroke-opacity', 1).style("stroke-width", 15);
                            d3.selectAll("marker").style("opacity", 1);
                            for (var j = 0; j < texts.length; j++) {
                                if (texts[j].innerHTML == results[temp][0].state_id) {
                                    d3.select(texts[j]).attr("font-size", 50).style("fill", "black").style("font-weight", "bold").moveToFront();
                                }
                                if (texts[j].innerHTML == results[temp][temp_len - 1].state_id) {
                                    d3.select(texts[j]).attr("font-size", 50).style("fill", "black").style("font-weight", "bold").moveToFront();
                                }
                            }
                        })

                        .on("mouseout", function() {
                            var temp = parseInt(d3.select(this).attr("id"));
                            var temp_len = results[temp].length;

                            $(_self.el).find("text").css("fill", "black");
                            d3.select(this).style('stroke-opacity', 0.4).style("stroke-width", 10);
                            d3.selectAll("marker").style("opacity", 0.3);
                            for (var j = 0; j < texts.length; j++) {
                                if (texts[j].innerHTML == results[temp][0].state_id) {
                                    d3.select(texts[j]).attr("font-size", 30);
                                }
                                if (texts[j].innerHTML == results[temp][temp_len - 1].state_id) {
                                    d3.select(texts[j]).attr("font-size", 30);
                                }
                            }
                        })
                    }
                }
            })
            .on("tick", function(e) {

                var k = e.alpha,
                    kg = k * .02,
                    spaceAround = 0.;

                nnodes.forEach(function(a, i) {
                    // Apply gravity forces.
                    a.x += (a.gravity_x - a.x) * kg;
                    a.y += (a.gravity_y - a.y) * kg;

                    a.overlapCount = 0;

                    nnodes.slice(i + 1).forEach(function(b) {

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
                    //node.for each braces
                })

                svg.selectAll("text")
                    .data(nnodes)
                    .attr("x", function(d) {
                        return d.x - d.r / 2;
                    })
                    .attr("y", function(d) {
                        return d.y - d.r / 2;
                    });

                svg.selectAll("circle")
                    .data(nnodes)
                    .attr("cx", function(d) {
                        return d.x - d.r / 2;
                    })
                    .attr("cy", function(d) {
                        return d.y - d.r / 2;
                    });
                //tick braces
            });

        //Run the FDEB algorithm using default values on the data 
        svg.selectAll('.node')
            .data(d3.entries(nnodes))
            .enter()
            .append('circle')
            .attr("opacity", 0.8)
            .attr("fill", (d) => {
                d = d.value;
                return d.valid ? colorMap[d.adoptedYear] : css_variables["--color-unadopted"];
            })
            .attr({
                'r': function(d) {
                    return d.value.r;
                }
            })
            .on("mouseover", function(d, i) {
                tip.show(d, i);
                d3.select(".d3-tip-network")
                    .style("opacity", 0.9);
            })
            .on('mouseout', tip.hide);

        svg.selectAll('.node')
            .data(d3.entries(nnodes))
            .enter()
            .append('text')
            .attr("fill", "black")
            .attr("font-size", function(d) {
                return 30;
            })
            .attr("font-family", "Trebuchet MS")
            .attr("text-anchor", "middle")
            .text(function(d, i) {
                return d.value.state_id;
            })
            .on("mouseover", function(d, i) {
                tip.show(d, i);
                d3.select(".d3-tip-network")
                    .style("opacity", 0.9);
            })
            .on('mouseout', tip.hide);
    },
    defineGradient(defs) {
        var gradient_1 = defs.append("linearGradient")
            .attr("id", "gradient_1")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        gradient_1.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "darkblue")
            .attr("stop-opacity", 0.15);

        gradient_1.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "grey")
            .attr("stop-opacity", 0.3);

        gradient_1.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        var gradient_2 = defs.append("linearGradient")
            .attr("id", "gradient_2")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        gradient_2.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        gradient_2.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "grey")
            .attr("stop-opacity", 0.3);

        gradient_2.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "darkblue")
            .attr("stop-opacity", 0.15);
    }

});

// @Deprecated
let StatBarView = Backbone.View.extend({
    el: '#svg-stat-bar-view',
    render() {
        //prepare params
        let _self = this,
            data = _self.model.get("detail");

        $(_self.el).empty();

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

let PolicyOptionsView = Backbone.View.extend({

});

// @Deprecated
let ArcView = Backbone.View.extend({
    el: "#svg-arc-view",
    render(sortMethod) {
        // console.log("rendering arc: " + sortMethod);
        let _self = this,
            nodes = this.model.get("nodes"),
            links = conf.static.edges,
            τ = 2 * Math.PI; // http://tauday.com/tau-manifesto

        let svg = d3.select(_self.el)
            .attr("width", gs.a.size.width)
            .attr("height", gs.a.size.height)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("0 0 " + gs.a.size.width + " " + gs.a.size.height + ""))
            .classed('svg-content-responsive', true);

        // Set each node's value to the sum of all incoming and outgoing link values
        let nodeValMin = 100000000,
            nodeValMax = 0;
        for (i = 0; i < nodes.length; i++) {
            nodes[i].displayOrder = i;
        }
        for (i = 0; i < nodes.length; i++) {
            nodeValMin = Math.min(nodeValMin, nodes[i].metadata);
            nodeValMax = Math.max(nodeValMax, nodes[i].metadata);
        }

        // define arc builder
        let arcBuilder = d3.svg.arc()
            .startAngle(-τ / 4)
            .endAngle(τ / 4);

        arcBuilder.setRadii = function(d) {
            let arcHeight = 0.5 * Math.abs(d.x2 - d.x1);
            this.innerRadius(arcHeight - d.thickness / 2)
                .outerRadius(arcHeight + d.thickness / 2);
        };

        nodes = this.doSort(nodes, sortMethod);

        let pathG = svg.select('.arcs'),
            circleG = svg.select('.circles'),
            labelG = svg.select('.labels');

        // DATA JOIN
        let path = pathG.selectAll("path")
            .data(links);

        // UPDATE
        path.transition()
            .duration(gs.a.transitionTime)
            .call(_self.pathTween, this, arcBuilder, nodes);

        // ENTER
        path.enter()
            .append("path")
            .attr({
                "transform": (d, i) => {
                    d.x1 = _self.nodeDisplayX(nodes[d.target]);
                    d.x2 = _self.nodeDisplayX(nodes[d.source]);
                    return _self.arcTranslation(d);
                },
                "d": (d, i) => {
                    d.thickness = gs.a.margin.arcThickness;
                    arcBuilder.setRadii(d);
                    return arcBuilder();
                },
                class: (d, i) => {
                    let isValid = nodes[d.source].valid && nodes[d.target].valid,
                        isFollowingNetworkRule = +nodes[d.source].adoptedYear < +nodes[d.target].adoptedYear;
                    if (isValid) {
                        if (isFollowingNetworkRule) {
                            return "follow-the-rule";
                        } else {
                            return "violate-the-rule";
                        }
                    } else {
                        return "invalid-arc";
                    }
                },
                target: (d) => d.target,
                source: (d) => d.source
            });

        // DATA JOIN
        let circle = circleG.selectAll("circle")
            .data(nodes);

        // UPDATE
        circle.transition()
            .duration(gs.a.transitionTime)
            .attr("cx", (d, i) => _self.nodeDisplayX(d));

        // ENTER
        circle.enter()
            .append("circle")
            .attr({
                cy: gs.a.nodeY,
                cx: (d, i) => _self.nodeDisplayX(d),
                r: (d, i) => _self.mapRange(d.metadata, nodeValMin, nodeValMax, gs.a.multiplier.outMin, gs.a.multiplier.outMax),
                fill: (d, i) => d.valid ? colorMap[d.adoptedYear] : css_variables["--color-unadopted"],
                stroke: (d, i) => d.valid ? d3.rgb(colorMap[d.adoptedYear]).darker(1) : d3.rgb(css_variables["--color-unadopted"]).darker(1),
                id: (d, i) => "node_" + i
            });

        // DATA JOIN
        let text = labelG.selectAll("text")
            .data(nodes);
        // UPDATE
        text.transition()
            .duration(gs.a.transitionTime)
            .attr({
                x: (d, i) => _self.nodeDisplayX(d),
                transform: (d, i) => _self.textTransform(d)
            });
        // ENTER
        text.enter()
            .append("text")
            .attr({
                y: gs.a.nodeY + gs.a.margin.textYShift,
                x: (d, i) => _self.nodeDisplayX(d),
                transform: (d, i) => _self.textTransform(d)
            })
            .text((d, i) => d.stateName);

        _self.bindTriggers(nodes);

    },
    pathTween(transition, _self, arcBuilder, nodes) {
        transition.attrTween("d", (d) => {
            let interpolateX1 = d3.interpolate(d.x1, _self.nodeDisplayX(nodes[d.target])),
                interpolateX2 = d3.interpolate(d.x2, _self.nodeDisplayX(nodes[d.source]));
            return function(t) {
                d.x1 = interpolateX1(t);
                d.x2 = interpolateX2(t);
                arcBuilder.setRadii(d);
                return arcBuilder();
            };
        });

        transition.attrTween("transform", (d) => {
            let interpolateX1 = d3.interpolate(d.x1, _self.nodeDisplayX(nodes[d.target]));
            let interpolateX2 = d3.interpolate(d.x2, _self.nodeDisplayX(nodes[d.source]));
            return function(t) {
                d.x1 = interpolateX1(t);
                d.x2 = interpolateX2(t);
                return _self.arcTranslation(d);
            };
        });
    },
    doSort(nodes, sortMethod) {
        let nodeMap = [],
            sortFunciton;

        nodes.forEach((node, i) => {
            nodeMap.push($.extend({ index: i }, node));
        });

        if (sortMethod == 0) {
            // ADOPTION YEAR
            sortFunction = (a, b) => {
                return b.adoptedYear - a.adoptedYear;
            };
        } else if (sortMethod == 1) {
            // METADATA
            sortFunction = (a, b) => {
                return b.metadata - a.metadata;
            };
        } else if (sortMethod == 2) {
            // NAME
            sortFunction = (a, b) => {
                return a.stateName.localeCompare(b.stateName)
            };
        }

        nodeMap.sort(sortFunction);
        nodeMap.forEach((node, i) => {
            nodes[node.index].displayOrder = i;
        });

        return nodes;
    },
    bindTriggers(nodes) {
        let _self = this,
            _arrow = d3.select(_self.el).append('g').attr("class", "arrow"),
            _indicator = d3.svg.symbol().type('triangle-down'),
            nodeMap = {};

        $("#svg-arc-view .arcs path").on("mouseover", (event) => {
            if (!$(event.target).hasClass("invalid-arc")) {
                let x = _self.nodeDisplayX(nodes[+$(event.target).attr("target")]),
                    _sourceNode = $("#node_" + $(event.target).attr("source")),
                    _targetNode = $("#node_" + $(event.target).attr("target"));
                _arrow.append("path")
                    .attr({
                        d: _indicator,
                        transform: "translate(" + x + "," + (gs.a.nodeY - gs.a.margin.arrowYShift) + ")",
                        fill: $(event.target).hasClass("follow-the-rule") ? css_variables['--color-follow-the-rule'] : css_variables['--color-violate-the-rule']
                    });
                _sourceNode.addClass("hovered-item");
                _targetNode.addClass("hovered-item");
            }
        });

        $("#svg-arc-view .arcs path").on("mouseout", (event) => {
            let _sourceNode = $("#node_" + $(event.target).attr("source")),
                _targetNode = $("#node_" + $(event.target).attr("target"));
            $("#svg-arc-view .arrow path").remove();
            _sourceNode.removeClass("hovered-item");
            _targetNode.removeClass("hovered-item");
        });

        $("#svg-arc-view .circles circle").on("mouseover", (event) => {
            let nodeId = event.target.id.split('_')[1],
                _arcG = $("#svg-arc-view .arcs"),
                _asSource = _arcG.find("path[source=" + nodeId + "]"),
                _asTarget = _arcG.find("path[target=" + nodeId + "]");
            nodeMap = {};
            targetMap = {};
            nodeMap[nodeId] = true;

            _asSource.each((i) => {
                let arc = _asSource[i];
                if (!$(arc).hasClass("invalid-arc")) {
                    nodeMap[$(arc).attr("target")] = true;
                    $(arc).addClass($(arc).hasClass("follow-the-rule") ? "hovered-follow-the-rule" : "hovered-violate-the-rule");

                    let x = _self.nodeDisplayX(nodes[$(arc).attr("target")]);
                    _arrow.append("path")
                        .attr({
                            d: _indicator,
                            transform: "translate(" + x + "," + (gs.a.nodeY - gs.a.margin.arrowYShift) + ")",
                            fill: $(arc).hasClass("follow-the-rule") ? css_variables['--color-follow-the-rule'] : css_variables['--color-violate-the-rule']
                        });
                }
            });

            let existArcFollowTheRule = true;

            _asTarget.each((i) => {
                let arc = _asTarget[i];
                if (!$(arc).hasClass("invalid-arc")) {
                    nodeMap[$(arc).attr("source")] = true;
                    existArcFollowTheRule = $(arc).hasClass("follow-the-rule");
                    $(arc).addClass(existArcFollowTheRule ? "hovered-follow-the-rule" : "hovered-violate-the-rule");
                }
            });

            if (_asTarget.length > 0 && !$(_asTarget[0]).hasClass("invalid-arc")) {
                _arrow.append("path")
                    .attr({
                        d: _indicator,
                        transform: "translate(" + _self.nodeDisplayX(nodes[nodeId]) + "," + (gs.a.nodeY - gs.a.margin.arrowYShift) + ")",
                        fill: existArcFollowTheRule ? css_variables['--color-follow-the-rule'] : css_variables['--color-violate-the-rule']
                    });
            }

            Object.keys(nodeMap).forEach((nodeId) => {
                $("#node_" + nodeId).addClass("hovered-item");
            });
        });

        $("#svg-arc-view .circles circle").on("mouseout", (event) => {
            let nodeId = event.target.id.split('_')[1],
                _arcG = $("#svg-arc-view .arcs"),
                _asSource = _arcG.find("path[source=" + nodeId + "]"),
                _asTarget = _arcG.find("path[target=" + nodeId + "]");

            _asSource.each((i) => {
                let arc = _asSource[i];
                if (!$(arc).hasClass("invalid-arc")) {
                    $(arc).removeClass($(arc).hasClass("follow-the-rule") ? "hovered-follow-the-rule" : "hovered-violate-the-rule");
                }
            });

            _asTarget.each((i) => {
                let arc = _asTarget[i];
                if (!$(arc).hasClass("invalid-arc")) {
                    $(arc).removeClass($(arc).hasClass("follow-the-rule") ? "hovered-follow-the-rule" : "hovered-violate-the-rule");
                }
            });

            $("#svg-arc-view .arrow path").remove();

            Object.keys(nodeMap).forEach((nodeId) => {
                $("#node_" + nodeId).removeClass("hovered-item");
            });
        });


    },
    mapRange(value, inMin, inMax, outMin, outMax) {
        let inVal = Math.min(Math.max(value, inMin), inMax);
        return outMin + (outMax - outMin) * ((inVal - inMin) / (inMax - inMin));
    },
    arcTranslation(d) {
        return "translate(" + (d.x1 + d.x2) / 2 + "," + gs.a.nodeY + ")";
    },
    nodeDisplayX(node) {
        return node.displayOrder * gs.a.margin.spacing + gs.a.margin.margin;
    },
    textTransform(node) {
        return ("rotate(90 " + (this.nodeDisplayX(node) - 5) + " " + (gs.a.nodeY + 12) + ")");
    },
    empty() {
        this.$el.empty();
        let _self = this,
            svg = d3.select(_self.el);
        svg.append('g')
            .attr('class', 'arcs');
        svg.append('g')
            .attr('class', 'circles');
        svg.append('g')
            .attr('class', 'labels');
    }
});

let DiffusionView = Backbone.View.extend({
    el: "#svg-diffusion-view",
    initialize() {
        this._attr = {};
    },
    render() {
        // console.log("rendering diffusion...");
        let _self = this,
            _attr = this._attr; // closure vars

        $(_self.el).empty();

        let _height = gs.d.margin.top + gs.d.size.pathHeight + gs.d.margin.bottom,
            _width = gs.d.margin.left + gs.d.size.barWidth + gs.d.size.labelWidth + gs.d.size.pathWidth + gs.d.margin.right,
            pathXShift = gs.d.margin.left + gs.d.size.barWidth + gs.d.size.labelWidth, // min x of pathG
            pathYMid = gs.d.margin.top,
            circleXShift = pathXShift,
            circleYShift = gs.d.margin.top + gs.d.size.pathHeight / 2,
            yLabelXShift = gs.d.margin.left + gs.d.size.barWidth;

        let svg = _attr.svg = d3.select(_self.el)
            .attr("width", _width)
            .attr("height", _height)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("0 0 " + _width + " " + _height + ""))
            .classed('svg-content-responsive', true);

        let pathG = svg.append('g').attr({
                'id': 'diffusion-path-group',
                'class': 'paths',
                'transform': "translate(" + (pathXShift) + "," + (gs.d.margin.top) + ")"
            }),
            circleG = svg.append('g').attr({
                'id': 'diffusion-circle-group',
                'class': 'circles',
                'transform': "translate(" + (circleXShift) + "," + (circleYShift) + ")"
            }),
            xLabelG = circleG.append('g').attr({
                'id': 'diffusion-x-label-group',
                'class': 'x-labels',
                'transform': "translate(" + (0) + "," + (0) + ")"
            }),
            upBarG = svg.append('g').attr({
                'id': 'diffusion-up-bar-group',
                'class': 'bars',
                'transform': "translate(" + (gs.d.margin.left) + "," + (gs.d.margin.top) + ")"
            }),
            bottomBarG = svg.append('g').attr({
                'id': 'diffusion-bottom-bar-group',
                'class': 'bars',
                'transform': "translate(" + (gs.d.margin.left) + "," + (gs.d.margin.top) + ")"
            }),
            yLabelG = svg.append('g').attr({
                'id': 'diffusion-y-label-group',
                'class': 'y-labels',
                'transform': "translate(" + (yLabelXShift) + "," + (gs.d.margin.top) + ")"
            }),
            refLineG = pathG.append('g').attr({
                'id': 'diffusion-ref-line-group',
                'class': 'refs',
                'transform': "translate(" + (0) + "," + (0) + ")"
            }),
            defs = svg.append('defs');

        let xScale = d3.scale.linear()
            .domain([0, 49])
            .range([0, gs.d.size.pathWidth]),
            yTopScale = d3.scale.linear()
            .domain([0, 49])
            .range([0, gs.d.size.pathHeight / 2]),
            yBottomScale = d3.scale.linear()
            .domain([0, 49])
            .range([gs.d.size.pathHeight, gs.d.size.pathHeight / 2]);

        // data join
        let nodes = _self.model.get("nodes"),
            links = conf.static.edges,
            stat = _self.model.get("stat");

        $.extend(_attr, {
            pathG: pathG,
            circleG: circleG,
            xLabelG: xLabelG,
            upBarG: upBarG,
            bottomBarG: bottomBarG,
            yLabelG: yLabelG,
            refLineG: refLineG,
            defs: defs,
            nodes: nodes,
            links: links,
            stat: stat,
            xScale: xScale,
            yTopScale: yTopScale,
            yBottomScale: yBottomScale
        });

        // generate gradient
        _self.processGradient();

        // do init sort
        _self.doInitSort();

        _self.update();

        _self.bindTriggers();

        return this;
    },
    update() {
        // console.log("updating diffusion...");
        let _self = this,
            _attr = this._attr,
            stat = this.model.get("stat"),
            nodes = _attr.nodes,
            links = _attr.links;

        // define radius scale for circles
        let xSeq = conf.pipe.metaToId[$('#sequence-select').selectpicker('val')],
            // let xSeq = gs.d.config.radiusDefault,
            radiusScale = d3.scale.linear()
            .domain([stat.min[xSeq], stat.max[xSeq]])
            .range(gs.d.size.circle);

        let paths = _attr.pathG.selectAll('path')
            .data(links),
            circles = _attr.circleG.selectAll('circle')
            .data(nodes),
            xlabels = _attr.xLabelG.selectAll('text')
            .data(nodes),
            upBars = _attr.upBarG.selectAll('rect')
            .data(nodes),
            bottomBars = _attr.bottomBarG.selectAll('rect')
            .data(nodes);

        paths.transition()
            .duration(gs.d.config.transitionTime)
            .attrTween("d", (d, i) => {
                let c = d.coords,
                    n = _self.processCoordinates(nodes, stat, d, i),
                    interpolateX1 = d3.interpolate(c.x1, n.x1),
                    interpolateX2 = d3.interpolate(c.x2, n.x2),
                    interpolateXMid = d3.interpolate(c.xMid, n.xMid),
                    interpolateY1 = d3.interpolate(c.y1, n.y1),
                    interpolateY2 = d3.interpolate(c.y2, n.y2),
                    interpolateYM1 = d3.interpolate(c.ym1, n.ym1),
                    interpolateYM2 = d3.interpolate(c.ym2, n.ym2);

                return function(t) {
                    d.coords.x1 = interpolateX1(t);
                    d.coords.x2 = interpolateX2(t);
                    d.coords.xMid = interpolateXMid(t);
                    d.coords.y1 = interpolateY1(t);
                    d.coords.y2 = interpolateY2(t);
                    d.coords.ym1 = interpolateYM1(t);
                    d.coords.ym2 = interpolateYM2(t);

                    return _self.linkBuilder(d);
                }
            });

        circles.transition()
            .duration(gs.d.config.transitionTime)
            .attrTween("cx", (d, i) => {
                let interpolateX = d3.interpolate(d.circleX, _attr.xScale(d.sequenceOrder));
                return function(t) {
                    return d.circleX = interpolateX(t);
                }
            })

        // enter
        circles.enter()
            .append('circle')
            .attr({
                cy: 0,
                cx: (d) => {
                    d.circleX = _attr.xScale(d.sequenceOrder);
                    return d.circleX;
                },
                r: (d) => {
                    let meta = d.metadata[xSeq];
                    if (typeof meta === "undefined") {
                        return gs.d.size.circle[0];
                    }
                    return radiusScale(meta);
                },
                fill: (d) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).darker(1);
                    } else {
                        return d.valid ? colorMap[d.adoptedYear] : css_variables["--color-unadopted"];
                    }
                },
                stroke: (d, i) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).darker(2);
                    } else {
                        return d.valid ? d3.rgb(colorMap[d.adoptedYear]).darker(1) : d3.rgb(css_variables["--color-unadopted"]).darker(1);
                    }
                },
                id: (d, i) => "diffusion_node_" + i
            });

        xlabels.transition()
            .duration(gs.d.config.transitionTime)
            .attrTween("transform", (d) => {
                let interpolateX = d3.interpolate(d.labelX, _attr.xScale(d.sequenceOrder) - gs.d.size.circle[0]);
                return function(t) {
                    d.labelX = interpolateX(t);
                    return "translate(" + d.labelX + "," + d.labelY + ") rotate(90)";
                }
            })

        xlabels.enter()
            .append('text')
            .attr({
                class: "text-tip"
            })
            .text((d) => " - " + d.stateId)
            .attr({
                transform: (d) => {
                    d.labelX = _attr.xScale(d.sequenceOrder) - gs.d.size.circle[0];
                    d.labelY = gs.d.size.circle[1];
                    return "translate(" + d.labelX + "," + d.labelY + ") rotate(90)";
                }
            })
            .style({
                opacity: 0.5
            });

        paths.enter()
            .append('path')
            .attr({
                d: (d, i) => {
                    d.coords = _self.processCoordinates(nodes, stat, d, i);
                    return _self.linkBuilder(d);
                },
                class: (d, i) => {
                    let isValid = nodes[d.source].valid && nodes[d.target].valid,
                        isFollowingNetworkRule = _self.isFollowingNetworkRule(d);

                    console.groupCollapsed("Source: node-" + d.source + "\t" + nodes[d.source].stateId, "Target: node-" + d.target + "\t" + nodes[d.target].stateId + "\t" + isValid + "\t" + isFollowingNetworkRule)
                    if (isValid) {
                        console.log("Both valid.");
                    } else {
                        console.log("Source " + (nodes[d.source].valid ? "valid." : "invalid."));
                        console.log("Target " + (nodes[d.target].valid ? "valid." : "invalid."));
                    }
                    console.log((isFollowingNetworkRule ? "Following " : "Violating ") + "rule.");
                    console.groupEnd();

                    if (isValid) {
                        if (isFollowingNetworkRule) {
                            return "follow-the-rule";
                        } else {
                            return "violate-the-rule";
                        }
                    } else {
                        return "invalid-arc";
                    }
                },
                source: (d) => d.source,
                target: (d) => d.target,
                id: (d, i) => "diffusion_path_" + i
            })
            .style({
                fill: (d) => "url(#gradient-".concat(nodes[d.source].adoptedYear, nodes[d.target].adoptedYear, ")"),
                stroke: (d) => "url(#gradient-".concat(nodes[d.source].adoptedYear, nodes[d.target].adoptedYear, ")"),
                opacity: 0.6
            });

        upBars.transition()
            .duration(gs.d.config.transitionTime)
            .call(_self.barTween, _attr, "up");
        _self.createBars(upBars, "up");

        bottomBars.transition()
            .duration(gs.d.config.transitionTime)
            .call(_self.barTween, _attr, "bottom");
        _self.createBars(bottomBars, "bottom");

        return this;
    },
    createBars(bars, section) {
        let _attr = this._attr,
            stat = this.model.get("stat"),
            ySeq = conf.pipe.metaToId[$('#metadata-select').selectpicker('val')],
            rectScale = d3.scale.linear()
            .domain([stat.min[ySeq], stat.max[ySeq]])
            .range(gs.d.size.rect);

        bars.enter()
            .append('rect')
            .attr({
                width: (d) => {
                    d.meta = d.metadata[ySeq];
                    d.width = typeof d.meta === "undefined" ?
                        gs.d.size.rect[0] :
                        rectScale(d.meta);
                    return d.width;
                },
                height: gs.d.size.rectHeight,
                x: (d) => {
                    d.pad = typeof d.meta === "undefined" ?
                        gs.d.size.rect[0] :
                        rectScale(d.meta);
                    return gs.d.size.barWidth - d.pad;
                },
                y: (d) => {
                    if (section === "up") {
                        d.upY = _attr.yTopScale(d.metadataOrder);
                        return d.upY;
                    } else {
                        d.bottomY = _attr.yBottomScale(d.metadataOrder);
                        return d.bottomY;
                    }
                },
                fill: (d) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).darker(1);
                    } else {
                        return d.valid ?
                            colorMap[d.adoptedYear] :
                            css_variables["--color-unadopted"];
                    }
                },
                class: (d, i) => "bar-" + i
            });
    },
    barTween(transition, _attr, section) {
        transition.attrTween("width", (d) => {
                let ySeq = conf.pipe.metaToId[$('#metadata-select').selectpicker('val')];
                d.meta = d.metadata[ySeq];

                d.rectScale = d3.scale.linear()
                    .domain([_attr.stat.min[ySeq], _attr.stat.max[ySeq]])
                    .range(gs.d.size.rect);
                let newWidth = typeof d.meta === "undefined" ?
                    gs.d.size.rect[0] :
                    d.rectScale(d.meta),
                    interpolateWidth = d3.interpolate(d.width, newWidth);
                return function(t) {
                    d.width = interpolateWidth(t);
                    return d.width;
                }
            })
            .attrTween("x", (d) => {
                let newPad = (typeof d.meta === "undefined" ?
                        gs.d.size.rect[0] :
                        d.rectScale(d.meta)),
                    interpolatePad = d3.interpolate(d.pad, newPad);

                return function(t) {
                    d.pad = interpolatePad(t);
                    return gs.d.size.barWidth - d.pad;
                }
            })
            .attrTween("y", (d) => {
                let interpolateY;
                if (section === "up") {
                    interpolateY = d3.interpolate(d.upY, _attr.yTopScale(d.metadataOrder));
                    return function(t) {
                        d.upY = interpolateY(t);
                        return d.upY;
                    }
                } else {
                    interpolateY = d3.interpolate(d.bottomY, _attr.yBottomScale(d.metadataOrder));
                    return function(t) {
                        d.bottomY = interpolateY(t);
                        return d.bottomY;
                    }
                }
            });
    },
    processGradient() {
        let yearList = Object.keys(colorMap);

        yearList.forEach((year, index) => {
            for (loop = index + 1; loop < yearList.length; loop++) {
                let curr = this._attr.defs.append("linearGradient")
                    .attr({
                        id: "gradient-".concat(year, yearList[loop]),
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "100%",
                        spreadMethod: "pad"
                    });

                curr.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", colorMap[year])
                    .attr("stop-opacity", 1);

                curr.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", colorMap[yearList[loop]])
                    .attr("stop-opacity", 1);

                let reverse = this._attr.defs.append("linearGradient")
                    .attr({
                        id: "gradient-".concat(yearList[loop], year),
                        x1: "0%",
                        y1: "0%",
                        x2: "100%",
                        y2: "100%",
                        spreadMethod: "pad"
                    });

                reverse.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", colorMap[yearList[loop]])
                    .attr("stop-opacity", 1);

                reverse.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", colorMap[year])
                    .attr("stop-opacity", 1);
            }
        });
    },
    linkBuilder(d) {
        let _attr = this._attr,
            xScale = _attr.xScale,
            yTopScale = _attr.yTopScale,
            yBottomScale = _attr.yBottomScale,
            isFollowingNetworkRule = this.isFollowingNetworkRule(d),
            yScale = isFollowingNetworkRule ? yTopScale : yBottomScale,
            c = d.coords;

        let interpolate = d3.svg.line().interpolate("monotone"); // monotone, linear

        return interpolate([
            [xScale(c.x1), yScale(c.y1)],
            [xScale(c.xMid), yScale(c.ym1)],
            [xScale(c.x2), yScale(c.y2)],
            [xScale(c.xMid), yScale(c.ym2)],
            [xScale(c.x1), yScale(c.y1)]
        ]);
    },
    processCoordinates(nodes, stat, d, i) {
        const divider = 0.3,
            yPartition1 = 0.25,
            yPartition2 = 0.75,
            thicknessParam = nodes[d.source].metadata[gs.d.config.thicknessDefault],
            standardizedThickness = this.standardized(thicknessParam, stat.min[gs.d.config.thicknessDefault], stat.max[gs.d.config.thicknessDefault]),
            ySeq = conf.pipe.metaToId[$('#metadata-select').selectpicker('val')],
            xSeq = conf.pipe.metaToId[$('#sequence-select').selectpicker('val')];


        let x1 = nodes[d.source].sequenceOrder,
            x2 = nodes[d.target].sequenceOrder,
            y1 = nodes[d.source].metadataOrder,
            y2 = nodes[d.target].metadataOrder,
            xMid = x1 + (x2 - x1) * divider,
            tan = (y2 - y1) / (x2 - x1),
            ym1 = y1 + yPartition1 * (x2 - x1) * divider * tan,
            ym2 = y1 + yPartition2 * (x2 - x1) * divider * tan * standardizedThickness;
        // unitGap = gs.d.size.labelHeight / 100,
        // ym1 = y1,
        // ym2 = y1 + tan / Math.abs(tan) * unitGap * standardizedThickness;

        return {
            x1: x1,
            x2: x2,
            xMid: xMid,
            y1: y1,
            y2: y2,
            ym1: ym1,
            ym2: ym2
        }
    },
    bindTriggers() {
        let _self = this,
            _attr = this._attr;

        let pathOverHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target),
                    pathId = _curr.attr("id"),
                    className = _curr.attr("class"),
                    isValidPath = e.target && e.target.nodeName.toUpperCase() === "PATH" && !className.includes("invalid-arc");

                if (isValidPath) {
                    // why does it firing twice ???????
                    // console.log(e);
                    // console.log(e.type);
                    // console.log(className);

                    [_curr.attr("source"), _curr.attr("target")].forEach((nodeId) => {
                        // add ref lines
                        _self.drawRefLines(+nodeId, className);

                        // light up bars
                        switch (className) {
                            case "follow-the-rule":
                                $(_attr.upBarG[0]).find(".bar-" + nodeId).addClass("hovered-item");
                                break;
                            case "violate-the-rule":
                                $(_attr.bottomBarG[0]).find(".bar-" + nodeId).addClass("hovered-item");
                                break;

                        }

                        // light up circles
                        $("#diffusion_node_" + nodeId).addClass("hovered-item");

                        // move mouseovered nodes to front
                        // d3.select("#diffusion_node_" + nodeId).moveToFront();
                    });

                    // light up mouseovered path
                    _curr.addClass("hovered-item");

                    // move mouseovered to front
                    // d3.select("#" + pathId).moveToFront();

                }
            },
            pathOutHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target),
                    className = _curr.attr("class"),
                    isValidPath = e.target && e.target.nodeName.toUpperCase() === "PATH" && !className.includes("invalid-arc");

                if (isValidPath) {
                    let _curr = $(e.target);

                    // remove ref lines
                    $("#diffusion-ref-line-group").empty();

                    [_curr.attr("source"), _curr.attr("target")].forEach((nodeId) => {

                        // recover lighted bars
                        $(".bar-" + nodeId).removeClass("hovered-item");

                        // recover up circles
                        $("#diffusion_node_" + nodeId).removeClass("hovered-item");
                    });

                    // recover lighted path
                    _curr.removeClass("hovered-item");

                }
            };

        this.el.removeEventListener('mouseover', pathOverHandler, false);
        this.el.removeEventListener('mouseout', pathOutHandler, false);

        // mouseover paths
        this.el.addEventListener('mouseover', pathOverHandler, false);

        // mouseout paths
        this.el.addEventListener('mouseout', pathOutHandler, false);

    },
    drawRefLines(nodeId, className) {

        let _self = this,
            _attr = this._attr,
            nodes = _attr.nodes,
            xScale = _attr.xScale,
            yTopScale = _attr.yTopScale,
            yBottomScale = _attr.yBottomScale,
            refLineG = _attr.refLineG;

        let y = (className.includes("follow-the-rule") ?
            yTopScale(nodes[nodeId].metadataOrder) :
            yBottomScale(nodes[nodeId].metadataOrder));

        refLineG.append('line')
            .attr({
                x1: xScale(nodes[nodeId].sequenceOrder),
                y1: gs.d.size.pathHeight / 2,
                x2: xScale(nodes[nodeId].sequenceOrder),
                y2: y,
                class: "reference-line vertical"
            });

        refLineG.append('line')
            .attr({
                x1: xScale(nodes[nodeId].sequenceOrder),
                y1: y,
                x2: 0,
                y2: y,
                class: "reference-line horizontal"
            });

    },
    isFollowingNetworkRule(d) {
        let nodes = this._attr.nodes;
        return +nodes[d.source].adoptedYear <= +nodes[d.target].adoptedYear;
    },
    standardized(curr, min, max) {
        return (curr - min) / (max - min);
    },
    doInitSort() {
        this.doSort("metadata");
        this.doSort("sequence");
    },
    doSort(axis) {
        let nodes = this._attr.nodes,
            nodeMap = [],
            identifier = axis + "Order";

        nodes.forEach((node, i) => {
            nodeMap.push($.extend({ index: i }, node));
        });

        if (axis === "metadata") {
            let selectedAttrId = conf.pipe.metaToId[$('#metadata-select').selectpicker('val')];
            nodeMap.sort((a, b) => b['metadata'][selectedAttrId] - a['metadata'][selectedAttrId]);
        } else {
            let selectedAttr = $('#sequence-select').selectpicker('val');
            switch (selectedAttr) {
                case "adoptionYear":
                    nodeMap.sort((a, b) => {
                        let diff = a.adoptedYear - b.adoptedYear;
                        if (diff !== 0) {
                            return diff;
                        } else {
                            return a.stateName.localeCompare(b.stateName);
                        }
                    });
                    break;
                default:
                    let selectedAttrId = conf.pipe.metaToId[selectedAttr];
                    nodeMap.sort((a, b) => {
                        let diff = b['metadata'][selectedAttrId] - a['metadata'][selectedAttrId];
                        if (diff !== 0) {
                            return diff;
                        } else {
                            return a.stateName.localeCompare(b.stateName);
                        }
                    });
                    break;
            }
        }

        nodeMap.forEach((node, i) => {
            nodes[node.index][identifier] = i;
        });

        return nodes;
    },
    configGroups() {

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
    StatBarView: StatBarView,
    ArcView: ArcView,
    DiffusionView: DiffusionView,
    PolicyOptionsView: PolicyOptionsView
};