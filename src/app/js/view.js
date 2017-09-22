let conf = require('../config.js');
let css_variables = require('!css-variables-loader!../css/variables.css');
let gs = require('./graphSettings.js');
let utils = require('./utils.js');
let GRank = require('./grank.js');
const printDiagnoseInfo = false;

let colorList = [],
    colorMap = {};
let color7 = [
        css_variables['--color-cb-a'],
        css_variables['--color-cb-b'],
        css_variables['--color-cb-c'],
        css_variables['--color-cb-d'],
        css_variables['--color-cb-e'],
        css_variables['--color-cb-f'],
        css_variables['--color-cb-g']
    ],
    color15 = color7.concat([
        css_variables['--color-cb-0'],
        css_variables['--color-cb-2'],
        css_variables['--color-cb-4'],
        css_variables['--color-cb-6'],
        css_variables['--color-cb-8'],
        css_variables['--color-cb-10'],
        css_variables['--color-a'],
        css_variables['--color-d']
    ]),
    color21 = color15.concat([
        css_variables['--color-f'],
        css_variables['--color-j'],
        css_variables['--color-cb-1'],
        css_variables['--color-cb-3'],
        css_variables['--color-cb-5'],
        css_variables['--color-cb-9']
    ]);

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

let PolicyDetailView = Backbone.View.extend({
    el: "#policy-detail-wrapper",
    template: require('../templates/policy-detail-template.html'),
    render(conditions) {
        let _self = this;
        if (conditions.get("policy") === conf.bases.policy.default) {
            this.$el.html(require('../templates/policy-detail-empty-template.html'));
        } else {
            this.$el.html(_self.template(_self.model.attributes));
        }
    }
});

let PolicyTrendView = Backbone.View.extend({
    el: "#policy-trend-wrapper",
    initialize() {
        this._attr = {};
    },
    render(conditions) {
        let _self = this,
            _attr = this._attr,
            adoptionList = this.model.get("list").map(e => {
                return {
                    "year": new Date(e.year, 0, 1),
                    "count": +e.count
                };
            }),
            yearList = adoptionList.map(e => e.year),
            countList = adoptionList.map(e => e.count),
            yearDomain = [_.min(yearList), _.max(yearList)],
            countDomain = [_.min(countList), _.max(countList)];

        let _width = gs.t.margin.left + gs.t.margin.right + gs.t.size.width,
            _height = gs.t.margin.top + gs.t.margin.bottom + gs.t.size.height;

        let xScale = d3.time.scale()
            .domain(yearDomain),
            yScale = d3.scale.linear()
            .domain(countDomain),
            yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(gs.t.config.yTickNumber);

        let ndx = crossfilter(adoptionList),
            dimension = ndx.dimension(d => d.year),
            group = dimension.group().reduceSum(d => d.count);

        let chart = dc.barChart(_self.el)
            .width(_width)
            .height(_height)
            .useViewBoxResizing(true)
            .margins(gs.t.margin)
            .x(xScale)
            .yAxis(yAxis)
            .round(d3.time.year.round)
            .xUnits(d3.time.years)
            .dimension(dimension)
            .group(group);

        $.extend(_attr, {
            chart: chart,
            ndx: ndx,
            c: conditions
        });

        chart.render();

        _self.bindTriggers();
    },
    bindTriggers() {
        let _self = this,
            _attr = _self._attr,
            chart = _attr.chart,
            __target = $(_self.el);
        __target.off();
        __target.on('mouseup', () => {
            let startYearDate = chart.dimension().bottom(1)[0].year,
                startYear = startYearDate.getFullYear(),
                endYearDate = chart.dimension().top(1)[0].year,
                endYear = endYearDate.getFullYear(),
                dataList = chart.group().all(),
                length = dataList.length,
                totalCount = 0;

            _attr.c.set({
                "startYear": startYear,
                "endYear": endYear,
                "policy": conf.bases.policy.default
            });
        });
    }
});

let GeoView = Backbone.View.extend({
    el: '#svg-geo-view',
    initialize() {
        this._attr = {};
    },
    render(conditions) {
        let _self = this,
            _attr = this._attr,
            stateTopo = this.model.get("topo"),
            nodes = _self.model.get("nodes"),
            stat = _self.model.get("stat"),
            projection = d3.geo.albersUsa().scale([1150]),
            pathBuilder = d3.geo.path().projection(projection),
            regionDef = conf.static.regions,
            stateFeatures = topojson.feature(stateTopo, stateTopo.objects.states).features,
            stateBorder = topojson.mesh(stateTopo, stateTopo.objects.states, (a, b) => a !== b),
            regionTopo = {},
            regionFeatures = [],
            regionGeos = [],
            regionBorder = {},
            regionColorMap = gs.g.config.regionColorMap,
            _altIndexForWest = 47;

        // TO FIND OUT INDEX FOR UT
        //  - use centroid of NV as alternative for west region
        // stateFeatures.forEach((feature, i) => {
        //     feature.properties.id === "UT" && console.log(i);
        // });

        _.forEach(regionDef, (theRegion, key) => {
            let theGeo = topojson.merge(stateTopo, stateTopo.objects.states.geometries.filter((d) => d3.set(theRegion).has(d.properties.id)));
            regionGeos.push(theGeo);
            regionFeatures.push({
                type: "Feature",
                geometry: theGeo,
                id: key
            });
        });
        regionTopo = topojson.topology(regionGeos);
        regionBorder = topojson.mesh(regionTopo);

        $(_self.el).empty();

        let _width = gs.g.margin.left + gs.g.margin.right + gs.g.size.mapWidth,
            _height = gs.g.margin.top + gs.g.margin.bottom + gs.g.size.mapHeight;

        // dom element and groups
        let svg = _attr.svg = d3.select(_self.el)
            .attr({
                'preserveAspectRatio': 'xMidYMid meet',
                'viewBox': ("0 0 " + _width + " " + _height + ""),
                'class': 'svg-content-responsive'
            }),
            legendG = svg.append('g').attr({
                id: 'geo-legend-group',
                class: 'legend',
                transform: "translate(" + (gs.g.margin.left + gs.g.margin.legendXShift) + "," + gs.g.margin.top + ")"
            }),
            stateTractG = svg.append('g').attr({
                id: 'state-tract-group',
                class: 'tract-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            stateBorderG = svg.append('g').attr({
                id: 'state-border-group',
                class: 'border-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            stateLabelG = svg.append('g').attr({
                id: 'state-label-group',
                class: 'label-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            regionTractG = svg.append('g').attr({
                id: 'region-tract-group',
                class: 'tract-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            regionBorderG = svg.append('g').attr({
                id: 'region-border-group',
                class: 'border-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            regionLabelG = svg.append('g').attr({
                id: 'region-label-group',
                class: 'label-group',
                transform: "translate(" + gs.g.margin.left + "," + gs.g.margin.top + ")"
            }),
            defs = svg.append('defs');

        $.extend(_attr, {
            legendG: legendG,
            stateTractG: stateTractG,
            stateBorderG: stateBorderG,
            stateLabelG: stateLabelG,
            regionTractG: regionTractG,
            regionBorderG: regionBorderG,
            regionLabelG: regionLabelG,
            defs: defs,
            regionColorMap: regionColorMap,
            c: conditions,
            nodes: nodes,
            stat: stat
        });

        let states = _attr.stateTractG.selectAll("path")
            .data(stateFeatures),
            regions = regionTractG.selectAll("path")
            .data(regionFeatures);

        states.enter()
            .append("path")
            .attr({
                class: "tract state-tract",
                d: pathBuilder,
                title: (d) => {
                    return d.stateId = d.properties.id;
                }
            })
            .style({
                fill: (d) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                    } else {
                        return d3.rgb(css_variables["--color-unadopted"]);
                    }
                },
                opacity: css_variables["--opacity-state"]
            })
            .append("title")
            .text((d) => d.properties.id);

        stateLabelG.selectAll("text")
            .data(stateFeatures).enter()
            .append("text")
            .filter(d => {
                d.centroid = pathBuilder.centroid(d);
                return _.isFinite(d.centroid[0]);
            })
            .text(d => d.properties.id)
            .attr({
                x: d => d.centroid[0],
                y: d => d.centroid[1]
            })

        stateBorderG.append("path")
            .datum(stateBorder)
            .attr({
                id: 'geo-state-border',
                class: "tract-border state-tract-border",
                d: pathBuilder
            });

        regions.enter()
            .append("path")
            .attr({
                class: "tract region-tract",
                d: pathBuilder,
                title: (d) => d.id
            })
            .style({
                fill: (d) => regionColorMap[d.id],
                opacity: css_variables["--opacity-region"]
            })
            .append("title")
            .text((d) => d.id);

        regionBorderG.append("path")
            .datum(regionBorder)
            .attr({
                id: 'geo-region-border',
                class: "tract-border region-tract-border",
                d: pathBuilder
            });

        regionLabelG.selectAll("text")
            .data(regionFeatures).enter()
            .append("text")
            .text(d => {
                let feature = (d.id !== "west" ? d : stateFeatures[_altIndexForWest]),
                    bbox = topojson.bbox(topojson.topology(feature)),
                    centroid = [_.mean([bbox[0], bbox[2]]), _.mean([bbox[1], bbox[3]])];
                d.centroid = projection(centroid);
                return d.id;
            })
            .attr({
                x: d => d.centroid[0],
                y: d => d.centroid[1]
            });

        this.createLegendGradient();

        this.update();
        this.bindTriggers();
        this.toggleTract({ silent: true });
        return this;
    },
    update() {
        let _self = this,
            _attr = _self._attr,
            meta = 'centrality',
            colorNeeded = (_attr.c.get("metadata") !== 'centrality') && (_attr.c.get("policy") !== 'unselected'),
            colorScale;

        $(this.el).find("#geo-legend-group").empty();

        if (colorNeeded) {
            meta = conf.pipe.metaToId[_attr.c.get("metadata")];
            let valueDomain = [_attr.stat.min[meta], _attr.stat.max[meta]],
                colorRange = [css_variables["--color-value-out"], css_variables["--color-value-in"]]
            colorScale = d3.scale.linear()
                .domain(valueDomain)
                .interpolate(d3.interpolateRgb)
                .range(colorRange);

            // render a legend
            let legendScale = d3.scale.linear()
                .domain(valueDomain)
                .range([0, gs.g.size.legendWidth]),
                legendAxis = d3.svg.axis()
                .scale(legendScale)
                .orient("bottom")
                .ticks(gs.g.config.legendTickNumber)
                .tickSize(gs.g.size.legendTickSize)
                .tickFormat(d3.format(".2f"))
                .tickPadding(gs.g.margin.legendTickPadding);

            _attr.legendG.append('rect')
                .attr({
                    id: 'geo-legend-bar',
                    height: gs.g.size.legendHeight,
                    width: gs.g.size.legendWidth
                })
                .style({
                    fill: "url(#geo-legend-linear-gradient)"
                });

            _attr.legendG.call(legendAxis).select(".domain").remove();
        }

        let stateTracts = $("#state-tract-group path");
        stateTracts.each(i => {
            let __tract = $(stateTracts[i]),
                title = __tract.attr("title");
            __tract.css("fill", () => {
                if (title === "NE") {
                    return d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                } else if (colorNeeded) {
                    let node = _attr.nodes[title];
                    if (!d3.set(conf.static.states).has(title) || _self.isNodeDefault(node)) {
                        return css_variables["--color-unadopted"];
                    } else {
                        return node.valid ? colorScale(node["metadata"][meta]) : css_variables["--color-unadopted"];
                    }
                } else if (meta === 'centrality') {
                    return d3.rgb(css_variables["--color-unadopted"]);
                }
            });
        });
        return this;
    },
    isNodeDefault(node) {
        return node.valid && node.adoptedYear === 9999;
    },
    bindTriggers() {
        let _self = this,
            _attr = this._attr,
            __svg = $(this.el);

        let regionTractClickHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target);
                if (_curr.hasClass("region-tract")) {
                    _attr.c.toggleTractList(_curr.attr("title"));
                }
            },
            stateTractClickHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target);
                if (_curr.hasClass("state-tract")) {
                    _attr.c.toggleTractList(_curr.attr("title"));
                }
            };

        __svg.off();

        __svg.on('click', regionTractClickHandler);
        __svg.on('click', stateTractClickHandler);
    },
    toggleTract() {
        let c = this._attr.c;
        switch (c.get("geoBase")) {
            case "state":
                if (arguments.length !== 0 && arguments[0].silent) {
                    $("#region-tract-group").hide();
                    $("#region-label-group").hide();
                    $("#state-tract-group").show();
                    $("#state-label-group").show();
                } else {
                    $("#region-tract-group").fadeOut();
                    $("#region-label-group").fadeOut();
                    $("#state-tract-group").fadeIn();
                    $("#state-label-group").fadeIn();
                }
                $("#geo-legend-group").show();
                c.set("stateList", []);
                $("#region-tract-group path").removeClass("hovered-item");
                break;
            case "region":
                if (arguments.length !== 0 && arguments[0].silent) {
                    $("#region-tract-group").show();
                    $("#region-label-group").show();
                    $("#state-tract-group").hide();
                    $("#state-label-group").hide();
                } else {
                    $("#region-tract-group").fadeIn();
                    $("#region-label-group").fadeIn();
                    $("#state-tract-group").fadeOut();
                    $("#state-label-group").fadeOut();
                }
                $("#geo-legend-group").hide();
                c.set("regionList", []);
                $("#state-tract-group path").removeClass("hovered-item");
                break;
            default:
                console.log("[invalid geoBase] - Congratulations on toggling a bug!");
        }
    },
    updateSelection() {
        let c = this._attr.c,
            theListName = c.getTractListName(),
            theList = c.getTractList(),
            geoBase = c.get("geoBase"),
            previousList = c.previousAttributes()[theListName],
            currentList = c.get(theListName),
            isAppendingNewElement = previousList.length < currentList.length,
            theTract = (isAppendingNewElement ?
                _.difference(currentList, previousList)[0] :
                _.difference(previousList, currentList)[0]),
            __tractG = $("#" + geoBase + "-tract-group"),
            __domElement = __tractG.find("path[title=" + theTract + "]");

        if (isAppendingNewElement) {
            __domElement.addClass("hovered-item");
        } else {
            __domElement.removeClass("hovered-item");
        }
    },
    createLegendGradient() {
        let grad = this._attr.defs.append("linearGradient")
            .attr({
                id: "geo-legend-linear-gradient",
                x1: 0,
                x2: 1,
                spreadMethod: "pad"
            });

        grad.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", css_variables["--color-value-out"])
            .attr("stop-opacity", 1);

        grad.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", css_variables["--color-value-in"])
            .attr("stop-opacity", 1);

        return grad;
    }
});

let NetworkView = Backbone.View.extend({
    el: "#svg-network-view",
    initialize() {
        this._attr = {};
    },
    render(conditions) {
        let _self = this,
            _attr = this._attr,
            nodes = this.model.get("nodes"),
            edges = this.model.get("edges"),
            stat = this.model.get("stat"),
            cstat = this.model.get("cstat");

        // clear the canvas
        $(_self.el).empty();

        // compute actual full canvas size
        let _width = gs.n.margin.left + gs.n.margin.right + gs.n.size.width,
            _height = gs.n.margin.top + gs.n.margin.bottom + gs.n.size.height,
            _legendXOffset = gs.n.margin.left + gs.n.size.width - gs.n.size.legendWidth;

        // dom element and groups
        let svg = _attr.svg = d3.select(_self.el)
            .attr({
                'preserveAspectRatio': 'xMidYMid meet',
                'viewBox': ("0 0 " + _width + " " + _height + ""),
                'class': 'svg-content-responsive'
            }),
            edgeG = svg.append('g').attr({
                'id': 'network-edge-group',
                'class': 'edge-group',
                'transform': "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"
            }),
            nodeG = svg.append('g').attr({
                'id': 'network-node-group',
                'class': 'node-group',
                'transform': "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"
            }),
            labelG = svg.append('g').attr({
                'id': 'network-label-group',
                'class': 'label-group',
                'transform': "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"
            }),
            legendG = svg.append('g').attr({
                'id': 'network-legend-group',
                'class': 'label-group',
                'transform': "translate(" + _legendXOffset + "," + gs.n.margin.top + ")"
            }),
            defs = svg.append('defs');

        // create force layout 
        let force = d3.layout.force()
            .size([_width, _height])
            .linkDistance(100)
            .charge(-500)
            .gravity(0.4)
            .friction(0.9);

        // expose variables to the view class
        $.extend(_attr, {
            svg: svg,
            edgeG: edgeG,
            nodeG: nodeG,
            labelG: labelG,
            legendG: legendG,
            defs: defs,
            c: conditions,
            nodes: nodes,
            edges: edges,
            stat: stat,
            cstat: cstat,
            force: force
        });

        this.prepareMarker();

        this.drawLegend();

        return this.update();
    },
    update() {
        let _self = this,
            _attr = this._attr,
            nodes = _attr.nodes,
            edges = _attr.edges,
            stat = _attr.stat,
            cstat = _attr.cstat,
            geoBase = _attr.c.get("geoBase"), // {"state", "region"}
            metaType = _attr.c.get("metadata"), // {conf.bases.yAttributeList[i].id} "centrality" or other attributes
            cType = _attr.c.get("centrality"), // {conf.bases.centralityList[i].id} centrality type
            selectedIdList = d3.set(_self.getSelectedIds(_attr.c)), // selected states
            filteredNodes = {},
            filteredEdges = [],
            isSpecificNetwork = _attr.c.get("policy") !== conf.bases.policy.default,
            colorNeeded = (geoBase === "state" ?
                (metaType !== 'centrality') && isSpecificNetwork :
                true),
            opacity = css_variables["--opacity-state"],
            meta = 'centrality',
            colorScale;

        // config `colorScale` and default `opacity` that'd be applied to render the map according to `geoBase`
        if (colorNeeded) {
            meta = conf.pipe.metaToId[_attr.c.get("metadata")];
            switch (geoBase) {
                case "state":
                    let valueDomain = [_attr.stat.min[meta], _attr.stat.max[meta]],
                        colorRange = [css_variables["--color-value-out"], css_variables["--color-value-in"]];
                    colorScale = d3.scale.linear()
                        .domain(valueDomain)
                        .interpolate(d3.interpolateRgb)
                        .range(colorRange);
                    break;
                case "region":
                    colorScale = gs.g.config.regionColorMap
                    opacity = css_variables["--opacity-region"]
                    break;
                default:
                    // won't happen
            }
        }

        let sizeScale = d3.scale.linear()
            .domain([cstat.min[cType], cstat.max[cType]])
            .range(gs.n.config.circleSizeRange),
            force = _attr.force.on("tick", tick),
            drag = force.drag()
            .on("dragstart", dragstart);

        // iterate `edges` with `nodes` to filter and generate nodes and edges that are actually need to be rendered
        edges.forEach(edge => {
            if (isAValidEdge(edge)) {
                let newEdge = {
                    source: filteredNodes[edge.source] || (filteredNodes[edge.source] = nodes[edge.source]),
                    target: filteredNodes[edge.target] || (filteredNodes[edge.target] = nodes[edge.target])
                }
                $.extend(newEdge, {
                    validity: _self.isFollowingNetworkRule(newEdge),
                    name: newEdge.source.stateId + "-" + newEdge.target.stateId
                })
                filteredEdges.push(newEdge);
            }
        });

        // terminate rendering for empty network
        if (filteredEdges.length === 0) {
            $("#unable-to-process-network-notitication").show();
            $("#policy-network-wrapper .loader-img").hide();
            return;
        } else {
            $("#unable-to-process-network-notitication").hide();
        }

        // toggle legend for specific network
        if (isSpecificNetwork) {
            $("#network-legend-group").show();
        } else {
            $("#network-legend-group").hide();
        }

        // expose filtered edges and nodes to the view class
        $.extend(_attr, {
            filteredEdges: filteredEdges,
            filteredNodes: filteredNodes,
            graph: new GRank.Graph()
        });

        // update graph according to filteredNodes and filteredEdges
        // and compute similarities for mouse event
        let graph = _attr.graph
            .nodes(_.map(filteredNodes, node => node.stateId))
            .edges(_.map(filteredEdges, edge => {
                return (edge.validity ? {
                    source: edge.source.stateId,
                    target: edge.target.stateId
                } : {
                    source: edge.target.stateId,
                    target: edge.source.stateId
                });
            }));

        setTimeout(() => { graph.doPrank(); }, 350);

        // config force layout with filtered nodes and edges
        force.nodes(d3.values(filteredNodes))
            .links(filteredEdges)
            .start();

        // create element groups with filtered nodes and edges
        let links = _attr.edgeG.selectAll("path")
            .data(force.links(), (d) => d.name),
            circles = _attr.nodeG.selectAll(".network-node")
            .data(force.nodes(), (d) => d.stateId),
            texts = _attr.labelG.selectAll("text")
            .data(force.nodes(), (d) => d.stateId);

        // remove elements that are no longer need to display at current update
        links.exit().remove();
        circles.exit().transition()
            .attr("r", 0).remove();
        texts.exit().remove();

        // add and render elements within current selection
        links.enter().append("path")
            .attr({
                "class": d => "network-link " + _self.getLinkValidityClass(d),
                "marker-end": "url(#edge-marker)"
            });

        circles.enter().append("circle")
            .attr({
                class: "network-node",
                title: (d) => d.stateId
            })
            .on("dblclick", dblclick)
            .on("mouseover", circleOverHandler)
            .on("mouseleave", circleLeaveHandler)
            .call(drag);

        circles.attr({
                r: d => sizeScale(nodes[d.stateId].centralities[cType])
            })
            .style({
                fill: (d) => {
                    switch (geoBase) {
                        case "state":
                            if (d.stateId === "NE") {
                                d.fill = d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                            } else if (colorNeeded) {
                                let node = _attr.nodes[d.stateId];
                                if (!d3.set(conf.static.states).has(d.stateId) || _self.isNodeDefault(node)) {
                                    d.fill = css_variables["--color-unadopted"];
                                } else {
                                    d.fill = node.valid ? colorScale(node["metadata"][meta]) : css_variables["--color-unadopted"];
                                }
                            } else if (meta === 'centrality') {
                                d.fill = d3.rgb(css_variables["--color-unadopted"]);
                            }
                            break;
                        case "region":
                            d.fill = colorScale[conf.pipe.regionOf[d.stateId]];
                            break;
                        default:
                            // won't ever happen
                    }
                    return d.fill;
                },
                stroke: (d) => d3.rgb(d.fill).darker(1),
                opacity: opacity
            });

        texts.enter().append("text")
            .attr({
                "y": ".31em"
            })
            .text(d => d.stateId);

        texts.attr({
            "x": d => {
                let r = sizeScale(nodes[d.stateId].centralities[cType]);
                if (r > 10) {
                    return -5;
                } else {
                    return gs.n.margin.labelXShift + r;
                }
            }
        });

        // this is MAGIC
        while (!gs.n.config.animationSwitch && force.alpha() > 1e-5) { force.tick(); }

        /**
         * An edge is valid iff:
         *  both source and target nodes have adopted current policy, and 
         *  at lease one of two nodes are selected to show when render state-wise map, or
         *  both source and target nodes are selected to show when render regional map.
         */
        function isAValidEdge(edge) {
            return (nodes[edge.source].valid && nodes[edge.target].valid) &&
                (geoBase === "state" ?
                    selectedIdList.has(edge.source) || selectedIdList.has(edge.target) :
                    selectedIdList.has(edge.source) && selectedIdList.has(edge.target));
        }

        // Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
            links.attr({
                d: (d) => {
                    let dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                },
                x1: (d) => d.source.x,
                y1: (d) => d.source.y,
                x2: (d) => d.target.x,
                y2: (d) => d.target.y
            });
            circles.attr({
                cx: (d) => d.x,
                cy: (d) => d.y
            });
            texts.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
        }

        function dragstart(d) {
            d3.select(this).classed("fixed", d.fixed = true);
        }

        function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
        }

        // pop up similar nodes when mouseover a node
        function circleOverHandler() {
            let simList = graph.getSimilarNodes("prank", $(this).attr("title"));

            if (simList.length !== 0) {
                simList.forEach(sim => {
                    let __circle = $("#network-node-group").find("circle[title=" + sim.name + "]");
                    __circle.addClass("fixed");
                });
            }
        }
        // clear pop up status on nodes when mouseleave
        function circleLeaveHandler() {
            let simList = graph.getSimilarNodes("prank", $(this).attr("title"));

            if (simList.length !== 0) {
                simList.forEach(sim => {
                    let __circle = $("#network-node-group").find("circle[title=" + sim.name + "]");
                    __circle.removeClass("fixed");
                });
            }
        }

        _self.postRender();
        return this;
    },
    /**
     * Retrieve current selection of states as a list.
     * @param {Backbone.Model} conditions 
     * @returns {Array<string>} state list in their IDs.
     */
    getSelectedIds(conditions) {
        if ((conditions.get("regionList").length === 0 && conditions.get("stateList").length === 0) ||
            conditions.get("policy") === "unselected") {
            return _.flatMap(conf.static.regions);
        }
        switch (conditions.get("geoBase")) {
            case "state":
                return conditions.get("stateList");
            case "region":
                return _.flatten(conditions.get("regionList").map(region => conf.static.regions[region]))
            default:
                //shouldn't happen
        }
    },
    getLinkValidityClass(edge) {
        return (edge.validity ?
            "follow-the-rule" :
            "violate-the-rule");
    },
    isFollowingNetworkRule(edge) {
        let nodes = this._attr.nodes;
        return +edge.source.adoptedYear <= +edge.target.adoptedYear;
    },
    isNodeDefault(node) {
        return node.valid && node.adoptedYear === 9999;
    },
    prepareMarker() {
        this._attr.defs.append("marker")
            .attr({
                "id": "edge-marker",
                "viewBox": "0 -5 10 10",
                "refX": 15,
                "refY": -1.5,
                "markerWidth": 6,
                "markerHeight": 6,
                "orient": "auto"
            })
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        this._attr.defs.append("marker")
            .attr({
                "id": "triangle-marker",
                "viewBox": "0 -5 10 10",
                "refX": 0,
                "refY": 0,
                "markerWidth": 6,
                "markerHeight": 6,
                "orient": "auto"
            })
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");
    },
    drawLegend() {
        this._attr.legendG.selectAll("path")
            .data(["follow-the-rule", "violate-the-rule"])
            .enter().append("path")
            .attr({
                d: (d, i) => "M0," + (i * gs.n.margin.legendYShift) + "L20," + (i * gs.n.margin.legendYShift),
                class: d => "network-link " + d,
                "marker-end": "url(#triangle-marker)"
            });

        this._attr.legendG.selectAll("text")
            .data(["Expected Cascades", "Deviant Cascades"])
            .enter().append("text")
            .attr({
                x: 30,
                y: (d, i) => gs.n.margin.legendYShift * i + gs.n.margin.legendTextShift
            })
            .text(d => d);

    },
    preRender() {
        this.$el.hide();
        $("#unable-to-process-network-notitication").hide();
        $("#policy-network-wrapper .loader-img").show();
    },
    postRender() {
        $("#policy-network-wrapper .loader-img").hide();
        this.$el.show();
    }
});

let PolicyGroupView = Backbone.View.extend({
    el: "#policy-group-table",
    initialize() {
        $(this.el).bootstrapTable({
            sortClass: "relevance",
            height: 400,
            pagination: true,
            onlyInfoPagination: false,
            pageSize: 20,
            pageList: [10, 25, 50, 100, "All"],
            selectItemName: "policy_id",
            search: true,
            strictSearch: false,
            showColumns: true,
            showToggle: true,
            showPaginationSwitch: true,
            minimumCountColumns: 10,
            idField: "policy_id",
            searchAlign: 'left',
            paginationVAlign: "bottom",
            clickToSelect: true,
            singleSelect: true,
            maintainSelected: true,
            columns: [{
                radio: true
            }, {
                field: 'policy_id',
                title: 'Policy ID',
                sortable: true,
                searchable: true,
                clickToSelect: true,
                visible: false
            }, {
                field: 'policy_name',
                title: 'Policy Name',
                sortable: true,
                searchable: true,
                clickToSelect: true
            }, {
                field: 'subject',
                title: 'Subject',
                titleTooltip: 'Subject to which a policy belongs.',
                sortable: true,
                searchable: false,
                clickToSelect: true,
                order: 'asc'
            }, {
                field: 'policy_start',
                title: 'First Adopt',
                titleTooltip: 'The year that the first adoption occurred.',
                sortable: true,
                searchable: false,
                clickToSelect: true,
                order: 'asc'
            }, {
                field: 'policy_end',
                title: 'Last Adopt',
                titleTooltip: 'The year that the last adoption occurred.',
                sortable: true,
                searchable: false,
                clickToSelect: true,
                order: 'asc'
            }],
            formatLoadingMessage: () => 'Loading policies, please wait...',
            formatNoMatches: () => 'Oops! No matching policies. Please try to adjust your time range.',
            formatShowingRows: (pageFrom, pageTo, totalRows) => 'Showing ' + pageFrom + ' to ' + pageTo + ' of ' + totalRows + ' policies'
        });

        $('#policy-group-wrapper .fixed-table-toolbar .columns').append('<button id="policy-group-uncheck-btn" class="btn btn-default" type="button" name="Uncheck" title="Uncheck selection">Uncheck</button>');
        $(this.el).bootstrapTable('showLoading');
    },
    render(conditions) {
        let _self = this,
            policies = this.model.get("policies"),
            __table = $(_self.el);
        __table.bootstrapTable('load', policies);
        __table.bootstrapTable('hideLoading');
        __table.bootstrapTable('resetSearch', "");
        __table.bootstrapTable('selectPage', 1);
        _self.updateSelection(conditions);
    },
    updateSelection(conditions) {
        this.$el.bootstrapTable("uncheckAll");
        if (conditions.get("policy") !== conf.bases.policy.default) {
            this.$el.bootstrapTable("checkBy", { field: "policy_id", values: [conditions.get("policy")] });
        }
    },
    clear() {
        this.$el.bootstrapTable('removeAll');
    },
    preRender() {
        this.$el.bootstrapTable('showLoading');
    }
});

let DiffusionView = Backbone.View.extend({
    el: "#svg-diffusion-view",
    initialize() {
        this._attr = {};
    },
    render(conditions) {
        let _self = this,
            _attr = this._attr, // closure vars
            isSnapshot = arguments.length !== 1;

        // toggle notification jumbotron and stop rendering
        if (conditions.get("policy") === conf.bases.policy.default) {
            this.postRender(conditions);
            return this;
        }

        this.$el.empty();

        let _height = gs.d.margin.top + gs.d.size.pathHeight + gs.d.margin.bottom,
            _width = gs.d.margin.left + gs.d.size.barWidth + gs.d.size.labelWidth + gs.d.size.pathWidth + gs.d.margin.right,
            pathXShift = gs.d.margin.left + gs.d.size.barWidth + gs.d.size.labelWidth, // min x of pathG
            pathYMid = gs.d.margin.top,
            circleXShift = pathXShift,
            circleYShift = gs.d.margin.top + gs.d.size.pathHeight / 2,
            yLabelXShift = gs.d.margin.left + gs.d.size.barWidth;

        // _width *= isSnapshot ? gs.d.multiplier.snapshot : 1;
        // _height *= isSnapshot ? gs.d.multiplier.snapshot : 1;

        let svg = _attr.svg = d3.select(_self.el)
            .attr('preserveAspectRatio', 'xMidYMin meet')
            .attr('viewBox', ("0 0 " + _width + " " + _height + ""))
            .classed('svg-content-responsive', true);

        let idPrefix = isSnapshot ? Math.random().toString(36).substr(2, 8) + "-" : '',
            guidanceLineG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-guidance-line-group',
                'class': 'guidances',
                'transform': "translate(" + (pathXShift) + "," + (gs.d.margin.top) + ")"
            }),
            circleG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-circle-group',
                'class': 'circles',
                'transform': "translate(" + (circleXShift) + "," + (circleYShift) + ")"
            }),
            pathG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-path-group',
                'class': 'paths',
                'transform': "translate(" + (pathXShift) + "," + (gs.d.margin.top) + ")"
            }),
            xLabelG = circleG.append('g').attr({
                'id': idPrefix + 'diffusion-x-label-group',
                'class': 'x-labels',
                'transform': "translate(" + (0) + "," + (0) + ")"
            }),
            upBarG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-up-bar-group',
                'class': 'bars',
                'transform': "translate(" + (gs.d.margin.left) + "," + (gs.d.margin.top) + ")"
            }),
            bottomBarG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-bottom-bar-group',
                'class': 'bars',
                'transform': "translate(" + (gs.d.margin.left) + "," + (gs.d.margin.top) + ")"
            }),
            yLabelG = svg.append('g').attr({
                'id': idPrefix + 'diffusion-y-label-group',
                'class': 'y-labels',
                'transform': "translate(" + (yLabelXShift) + "," + (gs.d.margin.top) + ")"
            }),
            refLineG = pathG.append('g').attr({
                'id': idPrefix + 'diffusion-ref-line-group',
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
            links = _self.model.get("edges"),
            stat = _self.model.get("stat"),
            cstat = _self.model.get("cstat"),
            _colorMap = utils.getColorMap(nodes, css_variables["--color-trans-out"], css_variables["--color-trans-in"]);

        $.extend(_attr, {
            getPrefix: () => {
                return (isSnapshot ? idPrefix : "");
            },
            isSnapshot: isSnapshot,
            pathG: pathG,
            circleG: circleG,
            xLabelG: xLabelG,
            upBarG: upBarG,
            bottomBarG: bottomBarG,
            yLabelG: yLabelG,
            refLineG: refLineG,
            guidanceLineG: guidanceLineG,
            defs: defs,
            nodes: nodes,
            links: links,
            stat: stat,
            cstat: cstat,
            xScale: xScale,
            yTopScale: yTopScale,
            yBottomScale: yBottomScale,
            c: conditions,
            _colorMap: _colorMap
        });

        // do init sort
        _self.doInitSort();

        _self.update();

        !isSnapshot && _self.bindTriggers();

        return this;
    },
    update() {
        // console.log("updating diffusion...");
        let _self = this,
            _attr = this._attr,
            stat = this.model.get("stat"),
            cstat = this.model.get("cstat"),
            nodes = _attr.nodes,
            links = _attr.links;

        // define radius scale for circles
        let xSeq = _attr.c.get("centrality"),
            radiusScale = d3.scale.linear()
            .domain([cstat.min[xSeq], cstat.max[xSeq]])
            .range(gs.d.size.circle);

        let paths = _attr.pathG.selectAll('path')
            .data(links),
            guids = _attr.guidanceLineG.selectAll('path')
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
                    n = _self.processCoordinates(nodes, cstat, _attr.c, d, i),
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

                    if (nodes[d.source].valid && nodes[d.target].valid) {
                        let x = d.coords.x1 < d.coords.x2,
                            y = d.coords.y1 < d.coords.y2,
                            x1 = x ? "0" : "1",
                            x2 = x ? "1" : "0",
                            y1 = y ? "0" : "1",
                            y2 = y ? "1" : "0",
                            gradientIdentifier = _attr.getPrefix() + "gradient-" + nodes[d.source].stateId + nodes[d.target].stateId;

                        $("#" + gradientIdentifier).attr("x1", x1);
                        $("#" + gradientIdentifier).attr("x2", x2);
                        $("#" + gradientIdentifier).attr("y1", y1);
                        $("#" + gradientIdentifier).attr("y2", y2);
                    }
                    return _self.linkBuilder(d);
                }
            });

        guids.transition()
            .duration(gs.d.config.transitionTime)
            .attrTween("d", (d, i) => {
                let c = d.gcoords,
                    n = _self.processCoordinates(nodes, cstat, _attr.c, d, i),
                    interpolateX1 = d3.interpolate(c.x1, n.x1),
                    interpolateX2 = d3.interpolate(c.x2, n.x2),
                    interpolateXMid = d3.interpolate(c.xMid, n.xMid),
                    interpolateY1 = d3.interpolate(c.y1, n.y1),
                    interpolateY2 = d3.interpolate(c.y2, n.y2),
                    interpolateYM1 = d3.interpolate(c.ym1, n.ym1);

                return function(t) {
                    d.gcoords.x1 = interpolateX1(t);
                    d.gcoords.x2 = interpolateX2(t);
                    d.gcoords.xMid = interpolateXMid(t);
                    d.gcoords.y1 = interpolateY1(t);
                    d.gcoords.y2 = interpolateY2(t);
                    d.gcoords.ym1 = interpolateYM1(t);

                    return _self.guidanceBuilder(d);
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
            .attrTween("r", (d, i) => {
                let interpolateR = d3.interpolate(d.circleR, radiusScale(d.centralities[xSeq]));
                return function(t) {
                    return d.circleR = interpolateR(t);
                }
            });

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
                    d.circleR = radiusScale(d.centralities[xSeq]);
                    return d.circleR;
                },
                class: "diffusion-circles",
                id: (d, i) => _attr.getPrefix() + "diffusion-node-" + i,
                nodeId: (d, i) => i
            })
            .style({
                fill: (d) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                    } else {
                        if (_self.isNodeDefault(d)) {
                            return css_variables["--color-unadopted"];
                        } else {
                            return d.valid ? _attr._colorMap[d.adoptedYear] : css_variables["--color-unadopted"];
                        }
                    }
                },
                stroke: (d, i) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).darker(1);
                    } else {
                        if (_self.isNodeDefault(d)) {
                            return d3.rgb(css_variables["--color-unadopted"]).darker(1);
                        } else {
                            return d.valid ? d3.rgb(_attr._colorMap[d.adoptedYear]).darker(1) : d3.rgb(css_variables["--color-unadopted"]).darker(1);
                        }
                    }
                }
            });

        xlabels.transition()
            .duration(gs.d.config.transitionTime)
            .attrTween("transform", (d) => {
                let interpolateX = d3.interpolate(d.labelX, _attr.xScale(d.sequenceOrder) - gs.d.size.circle[0]);
                return function(t) {
                    d.labelX = interpolateX(t);
                    return "translate(" + d.labelX + "," + d.labelY + ") rotate(90)";
                }
            });

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
                    d.coords = _self.processCoordinates(nodes, cstat, _attr.c, d, i);
                    return _self.linkBuilder(d);
                },
                class: (d, i) => {
                    let source = nodes[d.source],
                        target = nodes[d.target],
                        isFollowingNetworkRule = _self.isFollowingNetworkRule(d);

                    d.isValid = source.valid && target.valid;

                    if (printDiagnoseInfo) {
                        console.groupCollapsed("Source: node-" + d.source + "\t" + source.stateId, "Target: node-" + d.target + "\t" + target.stateId + "\t" + isValid + "\t" + isFollowingNetworkRule)
                        if (isValid) {
                            console.log("Both valid.");
                        } else {
                            console.log("Source " + (source.valid ? "valid." : "invalid."));
                            console.log("Target " + (target.valid ? "valid." : "invalid."));
                        }
                        console.log((isFollowingNetworkRule ? "Following " : "Violating ") + "rule.");
                        console.groupEnd();
                    }

                    if (d.isValid) {
                        _self.createGradient(source, target);
                        if (isFollowingNetworkRule) {
                            return "diffusion-strokes follow-the-rule";
                        } else {
                            return "diffusion-strokes violate-the-rule";
                        }
                    } else {
                        return "diffusion-strokes invalid-arc";
                    }
                },
                source: (d) => d.source,
                target: (d) => d.target,
                id: (d, i) => _attr.getPrefix() + "diffusion-path-" + i
            })
            .style({
                fill: (d) => _self.getPathColor(nodes[d.source], nodes[d.target]),
                stroke: (d) => _self.getPathColor(nodes[d.source], nodes[d.target]),
                opacity: (d) => (_self.isNodeDefault(nodes[d.source]) && _self.isNodeDefault(nodes[d.target]) ?
                    0.25 :
                    0.6)
            });

        guids.enter()
            .append('path')
            .attr({
                d: (d, i) => {
                    d.gcoords = _self.processCoordinates(nodes, cstat, _attr.c, d, i);
                    return _self.guidanceBuilder(d);
                },
                class: (d, i) => {
                    let isValid = nodes[d.source].valid && nodes[d.target].valid,
                        isFollowingNetworkRule = _self.isFollowingNetworkRule(d);

                    if (isValid) {
                        if (isFollowingNetworkRule) {
                            return "diffusion-guidances follow-the-rule";
                        } else {
                            return "diffusion-guidances violate-the-rule";
                        }
                    } else {
                        return "diffusion-guidances invalid-arc";
                    }
                }
            });

        upBars.transition()
            .duration(gs.d.config.transitionTime)
            .call(_self.barTween, _attr, "up");
        _self.createBars(upBars, "up");

        bottomBars.transition()
            .duration(gs.d.config.transitionTime)
            .call(_self.barTween, _attr, "bottom");
        _self.createBars(bottomBars, "bottom");
        _self.postRender(_attr.c);
        return this;
    },
    preRender() {
        this.$el.hide();
        $("#diffusion-wrapper").find(".bootstrap-switch-id-sequence-checkbox").hide();
        $("#diffusiion-policy-unselected-notitication").hide();
        $("#diffusion-wrapper").find(".loader-img").show();
    },
    postRender(conditions) {
        $("#diffusion-wrapper").find(".loader-img").hide();
        if (conditions.get("policy") === conf.bases.policy.default) {
            $("#diffusiion-policy-unselected-notitication").show();
        } else {
            $("#diffusion-wrapper").find(".bootstrap-switch-id-sequence-checkbox").show();
            this.$el.show();
        }
    },
    getPathColor(source, target) {
        if (this.isNodeDefault(source) && this.isNodeDefault(target)) {
            return css_variables["--color-default-black"];
        } else {
            let gradientIdentifier = this._attr.getPrefix() + "gradient-" + source.stateId + target.stateId;
            return "url(#" + gradientIdentifier + ")";
        }
    },
    isNodeDefault(node) {
        return node.valid && node.adoptedYear === 9999;
    },
    createBars(bars, section) {
        let _attr = this._attr,
            stat = this.model.get("stat"),
            cstat = this.model.get("cstat"),
            isSortingByCentrality = (_attr.c.get('metadata') === "centrality"),
            actualStat = isSortingByCentrality ? cstat : stat,
            ySeq = (isSortingByCentrality ?
                _attr.c.get('centrality') :
                conf.pipe.metaToId[_attr.c.get('metadata')]),
            rectScale = d3.scale.linear()
            .domain([actualStat.min[ySeq], actualStat.max[ySeq]])
            .range(gs.d.size.rect);

        bars.enter()
            .append('rect')
            .attr({
                width: (d) => {
                    d.meta = (isSortingByCentrality ?
                        d.centralities[ySeq] :
                        d.metadata[ySeq]);
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
                class: (d, i) => "bar-" + i
            })
            .style({
                fill: (d) => {
                    if (d.stateId === "NE") {
                        return d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                    } else {
                        if (this.isNodeDefault(d)) {
                            return css_variables["--color-unadopted"];
                        } else {
                            return d.valid ?
                                _attr._colorMap[d.adoptedYear] :
                                css_variables["--color-unadopted"];
                        }
                    }
                }
            });
    },
    barTween(transition, _attr, section) {
        transition.attrTween("width", (d) => {
                let stat = _attr.stat,
                    cstat = _attr.cstat,
                    isSortingByCentrality = (_attr.c.get("metadata") === "centrality"),
                    actualStat = isSortingByCentrality ? cstat : stat,
                    ySeq = (isSortingByCentrality ?
                        _attr.c.get("centrality") :
                        conf.pipe.metaToId[_attr.c.get("metadata")]);

                d.meta = (isSortingByCentrality ?
                    d.centralities[ySeq] :
                    d.metadata[ySeq]);

                d.rectScale = d3.scale.linear()
                    .domain([actualStat.min[ySeq], actualStat.max[ySeq]])
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
    createGradient(source, target) {
        let _self = this,
            isFollowingNetworkRule = +source.adoptedYear <= +target.adoptedYear,
            x = source.sequenceOrder < target.sequenceOrder,
            y = (isFollowingNetworkRule ?
                source.metadataOrder < target.metadataOrder :
                source.metadataOrder > target.metadataOrder),
            x1 = x ? "0" : "1",
            x2 = x ? "1" : "0",
            y1 = y ? "0" : "1",
            y2 = y ? "1" : "0",
            prefix = _self._attr.getPrefix();

        let grad = this._attr.defs.append("linearGradient")
            .attr({
                id: prefix + "gradient-".concat(source.stateId, target.stateId),
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
                spreadMethod: "pad"
            });

        grad.append("stop")
            .attr("offset", "5%")
            .attr("stop-color", _self._attr._colorMap[source.adoptedYear])
            .attr("stop-opacity", 1);

        grad.append("stop")
            .attr("offset", "95%")
            .attr("stop-color", _self._attr._colorMap[target.adoptedYear])
            .attr("stop-opacity", 1);

        return grad;
    },
    guidanceBuilder(d) {
        let _attr = this._attr,
            xScale = _attr.xScale,
            yTopScale = _attr.yTopScale,
            yBottomScale = _attr.yBottomScale,
            isFollowingNetworkRule = this.isFollowingNetworkRule(d),
            yScale = isFollowingNetworkRule ? yTopScale : yBottomScale,
            c = d.gcoords;

        let interpolate = d3.svg.line().interpolate("monotone"); // monotone, linear

        return interpolate([
            [xScale(c.x1), yScale(c.y1)],
            [xScale(c.xMid), yScale(c.ym1)],
            [xScale(c.x2), yScale(c.y2)]
        ]);
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
    processCoordinates(nodes, cstat, c, d, i) {
        const divider = 0.3,
            yPartition1 = 0.25,
            yPartition2 = 0.75,
            centralityType = c.get("centrality"),
            thicknessParam = nodes[d.source].centralities[centralityType],
            standardizedThickness = this.standardized(thicknessParam, cstat.min[centralityType], cstat.max[centralityType]),
            ySeq = conf.pipe.metaToId[c.get("metadata")],
            xSeq = conf.pipe.metaToId[c.get("sequence")];

        let x1 = nodes[d.source].sequenceOrder,
            x2 = nodes[d.target].sequenceOrder,
            y1 = nodes[d.source].metadataOrder,
            y2 = nodes[d.target].metadataOrder,
            xMid = x1 + (x2 - x1) * divider,
            // tan = (y2 - y1) / (x2 - x1),
            // fullShift = (x2 - x1) * divider * tan,
            // ym1 = y1 + yPartition1 * fullShift,
            // ym2 = ym1 + standardizedThickness * (yPartition2 - yPartition1) * fullShift;
            unitGap = gs.d.size.labelHeight / 150,
            ym1 = y1,
            ym2 = ym1 + (y1 > y2 ? -1 : 1) * unitGap * standardizedThickness;

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
    lightUpBars(validityCategory, nodeId) {
        switch (validityCategory) {
            case "follow-the-rule":
                $(this._attr.upBarG[0]).find(".bar-" + nodeId).addClass("hovered-item");
                break;
            case "violate-the-rule":
                $(this._attr.bottomBarG[0]).find(".bar-" + nodeId).addClass("hovered-item");
                break;
            default:
                console.log("Congrats on seeing a bug!");
                break;
        }
    },
    bindTriggers() {
        let _self = this,
            _attr = this._attr,
            __svg = $(this.el);

        let pathOverHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target),
                    pathId = _curr.attr("id"),
                    className = _curr.attr("class"),
                    classNameList = className.split(' '),
                    isStroke = (classNameList[0] === 'diffusion-strokes'),
                    isValidPath = e.target && e.target.nodeName.toUpperCase() === "PATH" && !className.includes("invalid-arc");

                if (isStroke && isValidPath) {

                    let validityCategory = classNameList[1];

                    [_curr.attr("source"), _curr.attr("target")].forEach((nodeId) => {
                        // add ref lines
                        _self.drawRefLines(+nodeId, validityCategory);

                        // light up bars
                        _self.lightUpBars(validityCategory, nodeId);

                        // light up circles
                        $("#diffusion-node-" + nodeId).addClass("hovered-item");

                        // move mouseovered nodes to front
                        // d3.select("#diffusion-node-" + nodeId).moveToFront();
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
                    classNameList = className.split(' '),
                    isStroke = (classNameList[0] === 'diffusion-strokes'),
                    isValidPath = e.target && e.target.nodeName.toUpperCase() === "PATH" && !className.includes("invalid-arc");

                if (isStroke && isValidPath) {
                    let _curr = $(e.target);

                    // remove ref lines
                    $("#diffusion-ref-line-group").empty();

                    [_curr.attr("source"), _curr.attr("target")].forEach((nodeId) => {

                        // recover lighted bars
                        $(".bar-" + nodeId).removeClass("hovered-item");

                        // recover up circles
                        $("#diffusion-node-" + nodeId).removeClass("hovered-item");
                    });

                    // recover lighted path
                    _curr.removeClass("hovered-item");

                }
            },
            circleOverHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target),
                    className = _curr.attr("class"),
                    isCircle = (className === "diffusion-circles");
                if (isCircle) {
                    let nodeId = _curr.attr("nodeId"),
                        _pathG = $("#diffusion-path-group"),
                        _asSource = _pathG.find("path[source=" + nodeId + "]"),
                        _asTarget = _pathG.find("path[target=" + nodeId + "]");

                    let nodeMap = {},
                        targetMap = {};
                    nodeMap[nodeId] = true;

                    _asSource.each((i) => {
                        let _theStroke = $(_asSource[i]);
                        if (!_theStroke.hasClass("invalid-arc")) {
                            nodeMap[_theStroke.attr("target")] = true;
                            _theStroke.addClass("hovered-item");

                            [_theStroke.attr("source"), _theStroke.attr("target")].forEach((nodeId) => {
                                let validityCategory = _theStroke.attr("class").split(' ')[1];
                                // add ref lines
                                _self.drawRefLines(+nodeId, validityCategory);
                                // light up bars
                                _self.lightUpBars(validityCategory, nodeId);
                            });
                        }
                    });

                    _asTarget.each((i) => {
                        let _theStroke = $(_asTarget[i]);
                        if (!_theStroke.hasClass("invalid-arc")) {
                            nodeMap[_theStroke.attr("source")] = true;
                            _theStroke.addClass("hovered-item");

                            [_theStroke.attr("source"), _theStroke.attr("target")].forEach((nodeId) => {
                                let validityCategory = _theStroke.attr("class").split(' ')[1];
                                // add ref lines
                                _self.drawRefLines(+nodeId, validityCategory);
                                // light up bars
                                _self.lightUpBars(validityCategory, nodeId);
                            });
                        }
                    });

                    Object.keys(nodeMap).forEach((nodeId) => {
                        $("#diffusion-node-" + nodeId).addClass("hovered-item");
                    });
                }
            },
            circleOutHandler = function(e) {
                e.stopPropagation();
                let _curr = $(e.target),
                    className = _curr.attr("class"),
                    classNameList = className.split(' '),
                    isCircle = (classNameList.length != 1 && classNameList[0] === "diffusion-circles");

                if (isCircle) {
                    let nodeId = _curr.attr("nodeId"),
                        _pathG = $("#diffusion-path-group"),
                        _asSource = _pathG.find("path[source=" + nodeId + "]"),
                        _asTarget = _pathG.find("path[target=" + nodeId + "]");

                    let nodeMap = {},
                        targetMap = {};
                    nodeMap[nodeId] = true;

                    _asSource.each((i) => {
                        let _theStroke = $(_asSource[i]);
                        if (!_theStroke.hasClass("invalid-arc")) {
                            nodeMap[_theStroke.attr("target")] = true;
                            _theStroke.removeClass("hovered-item");
                            // recover lighted bars
                            [_theStroke.attr("source"), _theStroke.attr("target")].forEach((nodeId) => {
                                $(".bar-" + nodeId).removeClass("hovered-item");
                            });
                        }
                    });

                    _asTarget.each((i) => {
                        let _theStroke = $(_asTarget[i]);
                        if (!_theStroke.hasClass("invalid-arc")) {
                            nodeMap[_theStroke.attr("source")] = true;
                            _theStroke.removeClass("hovered-item");
                            // recover lighted bars
                            [_theStroke.attr("source"), _theStroke.attr("target")].forEach((nodeId) => {
                                $(".bar-" + nodeId).removeClass("hovered-item");
                            });
                        }
                    });

                    // remove ref lines
                    $("#diffusion-ref-line-group").empty();

                    Object.keys(nodeMap).forEach((nodeId) => {
                        $("#diffusion-node-" + nodeId).removeClass("hovered-item");
                    });
                }
            };

        __svg.off();

        // mouseover events
        __svg.on('mouseover', pathOverHandler);
        __svg.on('mouseover', circleOverHandler);

        // mouseout events
        __svg.on('mouseout', pathOutHandler);
        __svg.on('mouseout', circleOutHandler);

    },
    drawRefLines(nodeId, validityCategory) {

        let _self = this,
            _attr = this._attr,
            nodes = _attr.nodes,
            xScale = _attr.xScale,
            yTopScale = _attr.yTopScale,
            yBottomScale = _attr.yBottomScale,
            refLineG = _attr.refLineG;

        let y = (validityCategory.includes("follow-the-rule") ?
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
            c = this._attr.c,
            nodeMap = [],
            identifier = axis + "Order",
            isSortingByCentrality = c.get(axis) === "centrality";

        nodes.forEach((node, i) => {
            nodeMap.push($.extend({ index: i }, node));
        });

        if (axis === "metadata") {
            let selectedAttrId = (isSortingByCentrality ?
                c.get("centrality") :
                conf.pipe.metaToId[c.get("metadata")]);
            if (isSortingByCentrality) {
                nodeMap.sort((a, b) => b['centralities'][selectedAttrId] - a['centralities'][selectedAttrId]);
            } else {
                nodeMap.sort((a, b) => b['metadata'][selectedAttrId] - a['metadata'][selectedAttrId]);
            }
        } else {
            let selectedAttr = c.get("sequence");
            switch (selectedAttr) {
                case "adoptionYear":
                    nodeMap.sort((a, b) => {
                        let diff = a.adoptedYear - b.adoptedYear;
                        return (diff !== 0 ?
                            diff :
                            a.stateName.localeCompare(b.stateName));
                    });
                    break;
                default:
                    let selectedAttrId = c.get("centrality");
                    nodeMap.sort((a, b) => {
                        let diff = b['centralities'][selectedAttrId] - a['centralities'][selectedAttrId];
                        return (diff !== 0 ?
                            diff :
                            a.stateName.localeCompare(b.stateName));
                    });
                    break;
            }
        }

        nodeMap.forEach((node, i) => {
            nodes[node.index][identifier] = i;
        });

        return nodes;
    }
});

let RingView = Backbone.View.extend({
    el: "#svg-ring-view",
    initialize() {
        this._attr = {};
        $(this.el).on('mouseleave', () => {
            $("#ring-tooltip").css("opacity", 0);
        });
    },
    render(conditions) {
        let _self = this,
            _attr = this._attr,
            clusterObj = _self.model.get("cluster"),
            method = clusterObj.name,
            nameDomain = _.concat(method, clusterObj.children.map((d) => d.name)),
            colorSchema = d3.scale.ordinal()
            .domain(nameDomain)
            .range(method === "subject" ? color15 : color21),
            ldaTerms = conf.static.ldaTerms;

        $(_self.el).empty();
        $("#ring-tooltip").remove();

        let _width = gs.r.margin.left + gs.r.margin.right + gs.r.size.width,
            _height = gs.r.margin.top + gs.r.margin.bottom + gs.r.size.height;

        let svg = _attr.svg = d3.select(_self.el)
            .attr({
                'preserveAspectRatio': 'xMidYMid meet',
                'viewBox': ("0 0 " + _width + " " + _height + ""),
                'class': 'svg-content-responsive'
            }),
            ringG = svg.append('g').attr({
                id: 'ring-group',
                class: 'ring',
                transform: "translate(" + (_width / 2) + "," + (_height / 2) + ")"
            }),
            labelG = svg.append('g').attr({
                id: 'ring-label-group',
                class: 'label-group',
                transform: "translate(" + (_width / 2) + "," + (_height / 2) + ")"
            });

        let partition = d3.layout.partition()
            .sort((a, b) => a.size - b.size)
            .size(method === "subject" ? [2 * Math.PI, 2 * gs.r.size.r] : [2 * Math.PI, gs.r.size.r * gs.r.size.r])
            .value(d => d.size),
            arc = (method === "subject" ?
                d3.svg.arc()
                .startAngle(d => d.x)
                .endAngle(d => d.x + d.dx)
                .innerRadius(d => d.depth * d.y / 2)
                .outerRadius(d => (d.depth * (d.y) + d.dy) / 2) :
                d3.svg.arc()
                .startAngle(d => d.x)
                .endAngle(d => d.x + d.dx)
                .innerRadius(d => Math.sqrt(d.y))
                .outerRadius(d => Math.sqrt(d.y + d.dy))),
            tooltip = d3.select("body")
            .append("div")
            .attr("id", "ring-tooltip");

        let paths = ringG.datum(clusterObj).selectAll("path")
            .data(partition.nodes),
            labels = labelG.datum(clusterObj).selectAll("text")
            .data(partition.nodes);

        $.extend(_attr, {
            ringG: ringG,
            labelG: labelG
        });

        paths.enter().append("path")
            .attr({
                d: arc,
                seq: d => getFullSeqStr(d)
            })
            .style({
                stroke: "#fff",
                fill: d => {
                    if (d.depth === 0 || d.depth === 1) {
                        return colorSchema(d.name);
                    } else {
                        return d3.rgb(colorSchema(d.parent.name)).brighter(d.depth / 8);
                    }
                },
                "fill-rule": "evenodd"
            })
            .on("mouseover", mouseOverArc)
            .on("mousemove", mouseMoveArc)
            .on("mouseout", mouseOutArc)
            .on("click", mouseClickArc);

        labels.enter().append("text")
            .attr({
                transform: d => "rotate(" + computeTextRotation(d) + ")",
                x: d => (method === "subject" ?
                    d.depth * d.y / 2 :
                    Math.sqrt(d.y)),
                dx: 6, // margin
                dy: ".35em"
            }) // vertical-align
            .text(d => displayText(d));

        function computeTextRotation(d) {
            let shift = (d.depth === 0 ? 180 : -90);
            return (d.x + d.dx / 2) * 180 / Math.PI + shift;
        };

        function getSeqStr(d) {
            let seq = "",
                curr = d;
            while (curr.depth !== 0) {
                seq = "-" + (method === "subject" ? curr.id : curr.name) + seq;
                curr = curr.parent;
            }
            return _.trimStart(seq, "-");
        };

        function getFullSeqStr(d) {
            return d.depth ? "0-" + getSeqStr(d) : "0";
        };

        function getHead(d) {
            if (d.depth) {
                if (method === "subject") {
                    return d.name;
                } else if (method === "text") {
                    return getSeqStr(d);
                }
            } else {
                return "all";
            }
        };

        function displayText(d) {
            let text = getHead(d),
                thickness = (method === "subject" ?
                    (d.dy) / 2 :
                    Math.sqrt(d.y + d.dy) - Math.sqrt(d.y));
            if (text.length * 8 < thickness) {
                return text;
            } else {
                return text.split(" ")[0] + " ..."
            }
        };

        function formatDescription(d) {
            let ldaTerm = "";
            if (method === "text") {
                let seq = getFullSeqStr(d);
                if (seq !== "0") {
                    let termArr = ldaTerms[seq].split(',');
                    ldaTerm += "<b>Terms:&nbsp;</b>"
                    for (let i in termArr) {
                        ldaTerm += termArr[i] + ", ";
                        if ((+i + 1) % 5 === 0) {
                            ldaTerm += "</br>";
                        }
                    }
                    ldaTerm = ldaTerm.replace(/<\/br>+$/, "").trim().replace(/,+$/, "") + '</br>'; // replace tailing and break
                }
            }
            return '<b>' + (method === "text" ? "Cluster" : "Subject") + ':&nbsp;</b>' + getHead(d) + '</br>' +
                ldaTerm +
                "<b>Total:&nbsp;</b>" + d.size + '&nbsp;policies';
        };

        function mouseOverArc(d) {
            d3.select(this).style("stroke", "black");
            tooltip.html(formatDescription(d));
            return tooltip.style("opacity", 0.9);
        };

        function mouseOutArc() {
            d3.select(this).style("stroke", "");
            return tooltip.style("opacity", 0);
        };

        function mouseMoveArc(d) {
            return tooltip.style({
                top: (d3.event.pageY + gs.r.margin.tShiftY) + "px",
                left: (d3.event.pageX + gs.r.margin.tShiftX) + "px"
            });
        };

        function mouseClickArc() {
            let __target = $(d3.event.target),
                __prevSelected = $("#ring-group .hovered-item");
            $("#ring-group path").removeClass("hovered-item");
            if (__prevSelected[0] !== __target[0]) {
                __target.addClass("hovered-item");
            }
        };

        // this.bindTriggers();
        return this;
    },
    bindTriggers() {
        let __svg = $(this.el);
        __svg.off();
        __svg.on("mouseout", () => {
            d3.select("#ring-tooltip").style("opacity", 0);
        });
    }
});

/**
 * Dropdowns
 * Customized dropdown menu that:
 * - can be disabled/enabled entirely or patially
 * - has a changeable label
 */
let DropdownController = Backbone.View.extend({
    render(conditions) {
        let _self = this;
    },
    /**
     * set dropdown label text.
     * @param {string} labelString to be set to the dropdown.
     */
    label(labelString) {
        this.$el.find(".dropdown-toggle").contents().first().replaceWith(labelString);
        return this;
    },
    /**
     * disable the dropdown.
     */
    disable() {
        this.$el.addClass("disabled");
        return this;
    },
    /**
     * enable the dropdown.
     */
    enable() {
        this.$el.removeClass("disabled");
    },
    /**
     * disable single or multiple options
     * @param {string|Array<string>} arguments one single aid or an aid array.
     */
    disableOption() {
        let __lis = this.$el.find(".dropdown-menu");
        if (typeof arguments[0] === "string") {
            // single option
            __lis.find("a[aid=" + arguments[0] + "]").parent().addClass("disabled");
        } else {
            // multi-option
            for (let aid of arguments[0]) {
                __lis.find("a[aid=" + aid + "]").parent().addClass("disabled");
            }
        }
    },
    /**
     * enable one single option or multiple options or all option.
     * @param {string|Array<string>|null} arguments one single aid to enable, or aid array to enable, or null to enable all options.
     */
    enableOption() {
        let __lis = this.$el.find(".dropdown-menu");
        if (!arguments.length) {
            // enable all options
            __lis.each(() => {
                // @this current <li>
                $(this).removeClass("disabled");
            })
        } else if (typeof arguments[0] === "string") {
            // enable one single option
            __lis.find("a[aid=" + arguments[0] + "]").parent().removeClass("disabled");
        } else {
            // enable multiple options
            for (let aid of arguments[0]) {
                __lis.find("a[aid=" + aid + "]").parent().removeClass("disabled");
            }
        }
    },
    /**
     * pick one or multiple options.
     * @param {string|Array<string>} arguments one single aid or an aid array.
     */
    pickOption() {
        this.clearOption();
        if (typeof arguments[0] === "string") {
            // single selection
            this.$el.find("ul a[aid=" + arguments[0] + "]").parent().addClass("active");
        } else {
            // multi-selection
            console.log("//TODO");
        }
    },
    /**
     * clear one or all selections.
     * @param {string|null} arguments one single aid to be cleared or null to clear all selections.
     */
    clearOption() {
        if (!arguments.length) {
            // clear all selection
            this.$el.find("ul>li[class='active']").removeClass("active");
        } else {
            // clear selection specified by arguments[0]
            this.$el.find("ul>li[aid=" + arguments[0] + "]").removeClass("active");
        }
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
    PolicyDetailView: PolicyDetailView,
    PolicyTrendView: PolicyTrendView,
    GeoView: GeoView,
    RingView: RingView,
    NetworkView: NetworkView,
    DiffusionView: DiffusionView,
    PolicyGroupView: PolicyGroupView,
    DropdownController: DropdownController
};