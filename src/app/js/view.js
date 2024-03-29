let conf = require('../config.js');
let css_variables = require('!css-variables-loader!../css/variables.css');
let gs = require('./graphSettings.js');
let utils = require('./utils.js');
let GRank = require('./grank.js');
let _graph = new GRank.Graph();
let GRankWorker = require("./workers/grank.worker.js");
let tSNEWorker = require("./workers/tsne.worker.js");
const printDiagnoseInfo = false;
// vector computation
let sylvester = require('../../assets/lib/sylvester');

let colorList = [],
    colorMap = {};
let color7 = [
        css_variables['--color-a'],
        css_variables['--color-b'],
        css_variables['--color-c'],
        css_variables['--color-d'],
        css_variables['--color-e'],
        css_variables['--color-f'],
        css_variables['--color-g']
    ],
    color15 = [
        css_variables['--color-a'],
        css_variables['--color-b'],
        css_variables['--color-c'],
        css_variables['--color-d'],
        css_variables['--color-e'],
        css_variables['--color-f'],
        css_variables['--color-g'],
        css_variables['--color-h'],
        css_variables['--color-i'],
        css_variables['--color-j'],
        css_variables['--color-cb-0'],
        css_variables['--color-cb-1'],
        css_variables['--color-cb-2'],
        css_variables['--color-cb-3'],
        css_variables['--color-cb-4']
    ],
    color21 = [
        css_variables['--color-1'],
        css_variables['--color-2'],
        css_variables['--color-3'],
        css_variables['--color-4'],
        css_variables['--color-5'],
        css_variables['--color-6'],
        css_variables['--color-7'],
        css_variables['--color-8'],
        css_variables['--color-9'],
        css_variables['--color-10'],
        css_variables['--color-11'],
        css_variables['--color-12'],
        css_variables['--color-13'],
        css_variables['--color-14'],
        css_variables['--color-15'],
        css_variables['--color-16'],
        css_variables['--color-17'],
        css_variables['--color-18'],
        css_variables['--color-19'],
        css_variables['--color-20'],
        css_variables['--color-21']
    ];
let DiffusionView = Backbone.View.extend({
    render(conditions){
        let _self = this;
    }
});

let DiffusionView3 = Backbone.View.extend({
    el: "#new-diffusion-view",
    initialize() {
        this._attr = {};
    },
    /**
     * render and prepare static elements that do not change according to different `conditions`, including
     * - svg groups
     * - some of scales
     * - labels
     * - and so on.
     * @param {object} conditions Backbone.Model 
     */
    render(conditions){
        let _self = this,
            _attr = this._attr,
            isSnapshot = arguments.length !== 1;

        // // toggle notification jumbotron and stop rendering
        // if (conditions.get("policy") === conf.bases.policy.default) {
        //     this.postRender(conditions);
        //     return this;
        // }

        if(conditions.get("policy") === conf.bases.policy.default) return;

        this.$el.empty();

        // All layout specs
        let cellSideLength,
            matrixWidth;

        var plot = d4.select("#"+_self.el.id),
            svg = plot
                .append("svg")
                //.attr('preserveAspectRatio', 'xMidYMin meet')
                //.attr('viewBox', ("0 0 " + gs.p.size.width + " " + gs.p.size.height + ""))
                .attr("width", gs.f.size.width)
                .attr("height", gs.f.size.height)
                .style("border-bottom", "#d1d1d1 1px solid");

        // Data
        var dMatrix = _self.model.get("dMatrix"),
            nodes = _self.model.get("nodes"),
            nodesWithEdge = _self.model.get("nodesWithEdge"),
            yearCount = _self.model.get("yearCount"),
            stat = _self.model.get("stat"),
            cstat = _self.model.get("cstat"),
            conformingScore = _self.model.get("conformingScore");
            //geoCorrelation = _self.model.get("geoCorrelation");

        //console.log("geoCorrelation: ", geoCorrelation);
            
        // Define scales and axes
        let xScale = d4.scaleTime(),     // xScale.range is dynamic according to the length of yearly timeline
            yScale = d4.scaleBand()
                .range([gs.f.size.height - 100, gs.f.size.upperPaneHeight + 10]);

        // Timeline bar
        let yScale_timeline = d4.scaleLinear()
                .domain([d4.max(yearCount, function(d) { return d.count; }), 0])
                .rangeRound([gs.f.size.upperPaneHeight, 0]),
            timeline_colorScale = d4.scaleLinear()
                .domain(d4.extent(yearCount, function(d){ return d.count; }))
                .range(["lavender", "mediumpurple", "indigo"]),
            attrGraph_xScale = d4.scaleLinear(),
            attrGraph_yScale = d4.scaleBand(),
            attrGraph_colorScale = d4.scaleLinear();

        // Calculate xAxis
        var minYear = d4.min(nodesWithEdge, function(d) { return d.adoptedYear; }),
            maxYear = d4.max(nodesWithEdge, function(d) { return d.adoptedYear; }),
            yearRange = maxYear - minYear,
            ticks = [],
            xAxisSettingTop, xAxisSettingBottom;

        // Set tick values
        if(yearRange <= 5) {
            // If yearRange is less than 5, mark all years
            for(var i=minYear - 1; i<=maxYear; i++){ // minYear - 1 because there is a dummy year as the leftmost column
                ticks.push(new Date(i, 0, 1));
            }
            xAxisSettingTop = d4.axisTop(xScale).tickSize(0).tickValues(ticks);
            xAxisSettingBottom = d4.axisBottom(xScale).tickSize(0);
        }
        else if (yearRange <= 15){
            // for(var i=minYear - 1; i<=maxYear; i++){ // minYear - 1 because there is a dummy year as the leftmost column
            //     ticks.push(new Date(i, 0, 1));
            // }
            xScale.nice();
            xAxisSettingTop = d4.axisTop(xScale).tickSize(0);
            xAxisSettingBottom = d4.axisBottom(xScale).tickSize(0);
        }
        else{
            xScale.nice();
            xAxisSettingTop = d4.axisTop(xScale).tickSize(0);
            xAxisSettingBottom = d4.axisBottom(xScale).tickSize(0);
        }

        xScale.domain([new Date(minYear - 1, 0, 1),
                        new Date(maxYear, 0, 1)
                        ]);

        yScale.domain(nodes.sort(function(a, b){ 
            return d4.ascending(a.adoptedYear, b.adoptedYear); }).map(function(d){ return d.stateId; }));

        cellSideLength = yScale.bandwidth();
        matrixWidth = cellSideLength * (dMatrix.length/yScale.domain().length) + cellSideLength;

        xScale.rangeRound([0, matrixWidth]);

        // All groups and axes
        let g_matrix = svg.append("g")
                .attr("class", "g_matrix")
                .attr("transform", "translate(" + gs.f.padding + "," + gs.f.size.upperPaneHeight + ")"),
            g_legend = svg.append("g")
                .attr("class", "g_legend")
                .attr("transform", "translate(10, 70)"),
            g_mouseover = svg.append("g")
                .attr("class", "mouseover-group")
                .attr("transform", "translate(" + gs.f.padding + "," + gs.f.size.upperPaneHeight + ")"),
            g_nodes = svg.append("g")
                .attr("class", "g_nodes")
                .attr("transform", "translate(" + gs.f.padding + "," + gs.f.size.upperPaneHeight + ")"),
            g_attrGraph = svg.append("g")
                .attr("class", "g_attrGraph")
                .attr("transform", "translate(" + (gs.f.padding + matrixWidth + 35) + "," + (gs.f.size.upperPaneHeight) + ")")
                .style("fill", "green"),
            g_chart = svg.append("g")
                .attr("class", "bar_chart")
                .attr("transform", "translate(" + gs.f.padding + ",15)");

        let xAxisBottom = g_matrix.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + (gs.f.size.height - 100) + ")")
                .call(xAxisSettingBottom)
                .selectAll("text")
                .attr("class", "x-label")
                .attr("transform", "translate(-4.5,8)rotate(-45)")
                .style("font-size", "9px")
                .style("text-anchor","middle"),
            xAxisTop = g_matrix.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + (gs.f.size.upperPaneHeight + 10) + ")")
                .call(xAxisSettingTop)
                .selectAll("text")
                .attr("class", "x-label")
                .attr("transform", "translate(-4.5,-8)rotate(45)")
                .style("font-size", "9px")
                .style("text-anchor","middle"),
            yAxis = g_matrix.append("g")
                .attr("class", "yAxis")
                .attr("transform", "translate(" + (matrixWidth+cellSideLength) + ",0)")
                .call(d4.axisRight(yScale).tickSize(0))
                .selectAll("text")
                .attr("class", "y-label")
                .style("text-anchor","middle")
                .style("font-size", "9px")
                .attr("dx","1em");
        
        // Change axis path border line color
        d4.select("path.domain").attr("stroke", "#ccc");
        // xAxisBottom.select("path.domain").style("stroke", "#ccc");
        // yAxis.select("path.domain").style("stroke", "#ccc");

        // Define arrows
        let markerEnd = svg.append("defs")
                .append("marker")
                .attr("id", "arrow")
                .attr("refX", 3)
                .attr("refY", 3)
                .attr("markerWidth", 20)
                .attr("markerHeight", 20)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,6L6,3L0,0")
                .style("stroke-width", 1)
                .style("stroke", "gray")
                .style("fill", "none"),
            markerEndMouseOverFromSource = svg.append("defs")
                .append("marker")
                .attr("id", "arrow-mouseover-from-source")
                .attr("refX", 3)
                .attr("refY", 3)
                .attr("markerWidth", 20)
                .attr("markerHeight", 20)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,6L6,3L0,0")
                .style("stroke-width", 2)
                .style("stroke", "mediumpurple")
                .style("fill", "none"),
            markerEndMouseOverToTarget = svg.append("defs")
                .append("marker")
                .attr("id", "arrow-mouseover-to-target")
                .attr("refX", 3)
                .attr("refY", 3)
                .attr("markerWidth", 20)
                .attr("markerHeight", 20)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,6L6,3L0,0")
                .style("stroke-width", 1.5)
                .style("stroke", "indigo")
                .style("fill", "none");

        //***** For legend
        // Arc for halfcircle node.. will be reused below again
        var circleArc = d4.arc()
            .innerRadius(0)
            .outerRadius(cellSideLength / 2)
            .startAngle(0)
            .endAngle(Math.PI);
        // legend border
        g_legend.append("rect")
            .attr("class", "legend")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 180)
            .attr("height", 160)
            .style("fill", "none")
            .style('shape-rendering','crispEdges')
            .style("stroke", "#EAECEE")
            .style("stroke-width", 1.5);
        // State in the year (node)
        g_legend.append("path")
            .attr("class", "legend_node")
            .attr("d", circleArc)
            .attr("transform", "translate(10, 12) rotate(0)")
            .style("fill", "mediumpurple");
        g_legend.append("text")
            .attr("x", 20)
            .attr("y", 15)
            .text("State (Name on the y-label)")
            .style("font-size", "10px");
        // on the way forward
        g_legend.append("rect")
            .attr("class", "legend_rect")
            .attr("x", 5)
            .attr("y", 25)
            .attr("width", cellSideLength*3)
            .attr("height", cellSideLength)
            .style("fill", "mediumpurple")
            .style("opacity", 0.15);
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 33)
            .text("Compliant cascade to the state")
            .style("font-size", "10px");
        // on the way backward
        g_legend.append("rect")
            .attr("class", "legend_rect")
            .attr("x", 5)
            .attr("y", 40)
            .attr("width", cellSideLength*3)
            .attr("height", cellSideLength)
            .style("fill", "pink")
            .style("opacity", 0.4);
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 48)
            .text("Deviant cascade to the state")
            .style("font-size", "10px");
        // text: mouseover
        g_legend.append("text")
            .attr("x", 10)
            .attr("y", 68)
            .text("Mouseover")
            .style("font-size", "10px");
        // source node to target nodes
        g_legend.append("path")
            .attr("class", "legend_path_from_source_to_targets")
            .attr("d", "M10,82L30,82")
            .style("stroke", "gray")
            .style("stroke-width", 1)
            .style("stroke-opacity", 0.6)
            .style("marker-end", "url(#arrow)")
            .style("fill", "none")
            .attr("opacity", 1);
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 85)
            .text("All influenced states of")
            .style("font-size", "10px");
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 95)
            .text("the influencing nodes")
            .style("font-size", "10px");
        g_legend.append("path")
            .attr("class", "legend_path_to_targets")
            .attr("d", "M10,110L30,110")
            .style("stroke", "indigo")
            .style("stroke-width", 2)
            .style("stroke-opacity", 0.6)
            .style("marker-end", "url(#arrow-mouseover-to-target)")
            .style("fill", "none")
            .attr("opacity", 1);
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 115)
            .text("To the influenced state")
            .style("font-size", "10px");
        g_legend.append("path")
            .attr("class", "legend_path_from_source")
            .attr("d", "M10,125L30,125")
            .style("stroke", "mediumpurple")
            .style("stroke-width", 2)
            .style("stroke-opacity", 0.6)
            .style("marker-end", "url(#arrow-mouseover-from-source)")
            .style("fill", "none")
            .attr("opacity", 1);
        g_legend.append("text")
            .attr("x", 40)
            .attr("y", 130)
            .text("From the influencing state")
            .style("font-size", "10px");
        //***** end of For legend
        // Conforming score below the legend

        g_legend.append("text")
            .attr("x", 10)
            .attr("y", 180)
            .text("Conforming score: " + conformingScore.toString())
            .style("font-size", "12px");
        
        $.extend(_attr, {
            // getPrefix: () => {
            //     return (isSnapshot ? idPrefix : "");
            // },
            isSnapshot: isSnapshot,
            svg: svg,
            cellSideLength: cellSideLength,
            dMatrix: dMatrix,
            nodes: nodes,
            nodesWithEdge: nodesWithEdge,
            stat: stat,
            cstat: cstat,
            yearCount: yearCount,
            g_matrix: g_matrix,
            g_mouseover: g_mouseover,
            g_nodes: g_nodes,
            g_attrGraph: g_attrGraph,
            g_chart: g_chart,
            xScale: xScale,
            yScale: yScale,
            attrGraph_xScale: attrGraph_xScale,
            attrGraph_yScale: attrGraph_yScale,
            attrGraph_colorScale: attrGraph_colorScale,
            yScale_timeline: yScale_timeline,
            timeline_colorScale: timeline_colorScale,
            circleArc: circleArc,
            markerEnd: markerEnd,
            markerEndMouseOverFromSource: markerEndMouseOverFromSource,
            markerEndMouseOverToTarget: markerEndMouseOverToTarget,
            c: conditions
        });

        _self.update();

        return this;
    },
    update() {
        let _self = this,
            _attr = this._attr,
            cstat = this.model.get("cstat"),
            cType = _attr.c.get("centrality"),
            nodes = _attr.nodes;

        //*** Lines to source and targets

        _attr.g_matrix
            .data(_attr.dMatrix);
        _attr.g_chart
            .data(_attr.yearCount);

        // Attribute bar
        _attr.attrGraph_xScale = d4.scaleLinear()
            .domain([0, d4.max(_attr.nodes, function(d){ return d.centralities[cType]; })])
            .range([0, gs.f.size.rightPaneWidth]),
        _attr.attrGraph_yScale = d4.scaleBand()
            .domain(_attr.nodes.map(function(d){ return d.stateId; }))
            .range([gs.f.size.height - 100, gs.f.size.upperPaneHeight + 10]),
        _attr.attrGraph_colorScale = d4.scaleLinear()
            .domain(d4.extent(_attr.nodes, function(d){ return d.centralities[cType]; }))
            .range(["lavender", "mediumpurple", "indigo"]);

        let gcells = _attr.g_matrix.selectAll(".gcell")
                .data(_attr.dMatrix)
                .enter().append("g")
                .attr("class", function(d){ return "gcell " + d.node; })
                .attr("transform", function(d){
                    return "translate(" + _attr.xScale(new Date(d.year, d.month, d.day)) + "," + _attr.yScale(d.node) + ")";
                });

        // Draw source node rectangles of the cell node
        // Changed to arrow at this point
        gcells.append("circle")
            .filter(function(d){
                return d.isTarget == true; })
            .attr("class", function(d){
                return "circle_source " + "circle_source_" + d.inEdges[0].sourceName + " " + d.node;
            })
            .attr("cx", function(d){
                var sourceYear = d.inEdges[0].sourceStateInfo.adoptedYear;
                return _attr.xScale(new Date(sourceYear, 0, 1)) - _attr.xScale(new Date(d.year, 0, 1)) + (_attr.cellSideLength / 2);
            })
            .attr("cy", _attr.cellSideLength / 2)
            .attr("r", _attr.cellSideLength / 2)
            .style("fill", "#E9CFEC");
            // .style("shape-rendering", "crispEdges")
            // .style("stroke", "black")
            // .style("stroke-width", 0.5);

        // Draw target node rectangles of the cell node
        gcells
            .filter(function(d){
                return d.isSource == true; })
            .each(function(d){
                var gcell = d4.select(this);
                d.outEdges.forEach(function(outEdge){
                    gcell.append("circle")
                        .attr("class", function(d){
                            return "circle_target " + "circle_target_" + outEdge.targetName + " " + + outEdge.node;
                        })
                        .attr("cx", _attr.xScale(new Date(outEdge.targetStateInfo.adoptedYear, 0, 1)) - _attr.xScale(new Date(d.year, 0, 1)) + (_attr.cellSideLength / 2))
                        .attr("cy", _attr.cellSideLength / 2)
                        .attr("r", _attr.cellSideLength / 2)
                        .style("fill", "none")
                        //.style("shape-rendering", "crispEdges")
                        .style("stroke", "indigo")
                        .style("stroke-width", 1);
                });
            });

        // Rectangles in the background
        gcells.append("rect")
            .attr("class", function(d){
                return "rect rect_" + d.node;
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", _attr.cellSideLength)
            .attr("height", _attr.cellSideLength)
            .style("fill", "none")
            .style('shape-rendering','crispEdges')
            .style("stroke", "#EAECEE")
            .style("stroke-dasharray", "3, 3")
            .style("stroke-opacity", 0.5);

        // Draw half circle heading the arc toward what it goes
        _attr.g_nodes
            .selectAll("path")
            .data(_attr.dMatrix.filter(function(d){
                return d.isSource === true || d.isTarget === true;
            }))
            .enter().append("path")
            .attr("class", function(d){
                return "rect_node rect_node_" + d.node + " " + d.node;
            })
            .attr("d", _attr.circleArc)
            .attr("transform", function(d){
                let nodeYear, sourceYear, targetYear;
                let rotate = "";

                // Take care three cases (when a node is source or target or source&target)
                if (d.isSource === true && d.isTarget === false){ // If node is a source
                    sourceYear = d.year;
                    targetYear = d.outEdges[0].targetStateInfo.adoptedYear;
                } else if (d.isTarget === true){
                    sourceYear = d.inEdges[0].sourceStateInfo.adoptedYear;
                    targetYear = d.year;
                }

                // Arc heading to the right if the adoption
                if(sourceYear <= targetYear) {
                    rotate = "rotate(0)";
                    return "translate(" + (_attr.xScale(new Date(d.year, 0, 1)) + 5) + "," + (_attr.yScale(d.node) + _attr.cellSideLength/2) + ") " + rotate;
                }else {
                    rotate = "rotate(180)";
                    return "translate(" + (_attr.xScale(new Date(d.year, 0, 1)) + 5) + "," + (_attr.yScale(d.node) + _attr.cellSideLength/2) + ") " + rotate;
                }
            })
            //.style("stroke", "black")
            .style("fill", "mediumpurple")
            //.style("stroke-width", 1);

        // Draw rects between source and node
        _self.colorRectsBetween();

        let tooltip = d3.select("body")
            .append("div")
            .attr("id", "ring-tooltip");

        //***** Mouseover, Mouseout
        // Mouseover the node
        _attr.svg.selectAll(".rect_node")
            .on("mouseover", function(d){
                var sourceNode, targetNodes,
                    sourceCircle, targetRects,
                    gSourceNode, dataSourceNode;
                var relevantNodes = {};  // { node: "CA", source: "DE", targets: ["WA", "NC", ...], targetsOfSource: ["CT", "MN", ...] }
                // Select source nodes => Highlight source node row
                if(d.inEdges && d.inEdges.length){
                    sourceNode = d.inEdges;
                    dataSourceNode = d4.select(".rect_node_" + sourceNode[0].sourceName).datum();

                    // Go to source node row and Highlight source node
                    // from source to target of the source node
                    _attr.g_mouseover
                        .selectAll(".mouseover_path_from_source_to_targets")
                        .data(dataSourceNode.outEdges)
                        .enter().append("path")
                        .attr("class", "mouseover_path_from_source_to_targets")
                        .attr("d", drawPathToTargets)
                        //.style("shape-rendering", "crispEdges")
                        .style("stroke", "gray")
                        .style("stroke-width", 1)
                        .style("stroke-opacity", 0.6)
                        .style("marker-end", "url(#arrow)")
                        .style("fill", "none")
                        .attr("opacity", 1);

                    // from source to node
                    _attr.g_mouseover
                        .selectAll(".mouseover_path_from_source")
                        .data(sourceNode)
                        .enter().append("path")
                        .attr("class", "mouseover_path_from_source")
                        .attr("d", drawPathFromSource)
                        //.style("shape-rendering", "crispEdges")
                        .style("stroke", "mediumpurple")
                        .style("stroke-width", 2.5)
                        .style("marker-end", "url(#arrow-mouseover-from-source)")
                        .style("fill", "none")
                        .attr("opacity", 1);
                }

                if(d.outEdges && d.outEdges.length){
                    targetNodes = d.outEdges;
                        
                    _attr.g_mouseover
                        .selectAll(".mouseover_path_from_node_to_targets")
                        .data(targetNodes)
                        .enter().append("path")
                        .attr("class", "mouseover_path_from_node_to_targets")
                        .attr("d", drawPathToTargets2)
                        //.style("shape-rendering", "crispEdges")
                        .style("stroke", "indigo")
                        .style("stroke-width", 2.5)
                        .style("marker-end", "url(#arrow-mouseover-to-target)")
                        .style("fill", "none")
                        .attr("opacity", 1);
                }

                function drawPathFromSource(inEdge){
                    // let _self = this,
                    //     _attr = _self._attr,
                    let xScale = _attr.xScale,
                        yScale = _attr.yScale,
                        cellSideLength = _attr.cellSideLength;

                    // point 1: sourceRectangle, point 2: perpendicular to the node, point 3: the node
                    let sourceData = inEdge,
                        sourceName = inEdge.sourceName,
                        sourceYear = inEdge.sourceStateInfo.adoptedYear,
                        nodeName = inEdge.targetName,  // node is the mouseovered node, which acts as target in this context
                        nodeYear = inEdge.targetStateInfo.adoptedYear,
                        x1, y1, x2, y2, x3, y3;
                    
                    let points = [];
                        
                    let line = d4.line()
                        .x( function(point) { return point.lx; })
                        .y( function(point) { return point.ly; })
                        .curve(d4.curveBasis);

                    if(sourceYear === nodeYear) {   // If they are in the same year, the arrow should shape just like vertical line
                        x1 = xScale(new Date(sourceYear, 0, 1)) + (cellSideLength / 2);
                        y1 = yScale(sourceName);
                        x2 = x1;
                        if(yScale(sourceName) < yScale(nodeName)) { // If the arrow goes down
                            y2 = yScale(nodeName) - cellSideLength*1/2;
                        } else {
                            y2 = yScale(nodeName) + cellSideLength*2;
                        }

                        points.push({lx: x1, ly: y1}, {lx: x2, ly: y2});
                    }
                    else {
                        x1 = xScale(new Date(sourceYear, 0, 1)) + (cellSideLength / 2);
                        y1 = yScale(sourceName);
                        x2 = x1;
                        y2 = yScale(nodeName) + cellSideLength / 2;
                        if (sourceYear <= nodeYear) { // If it is forward edge,
                            x3 = xScale(new Date(nodeYear, 0, 1)) - cellSideLength/2; 
                        } else {
                            if(sourceYear - nodeYear === 1){  // if the year difference is only 1,
                                x3 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                            else {
                                x3 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                        }
                        y3 = yScale(nodeName) + cellSideLength / 2;

                        points.push(
                            {lx: x1, ly: y1},
                            {lx: x2, ly: y2},
                            {lx: x3, ly: y3}
                        );
                    }

                    return line(points);
                }
                function drawPathToTargets(outEdge){  // d is an outEdge within outEdges data
                    // let _self = this,
                    //     _attr = _self._attr,
                    //     xScale = _attr.xScale,
                    //     yScale = _attr.yScale,
                    let xScale = _attr.xScale,
                        yScale = _attr.yScale,
                        cellSideLength = _attr.cellSideLength;

                    let targetData = outEdge,
                        targetName = outEdge.targetName,
                        targetYear = outEdge.targetStateInfo.adoptedYear,
                        nodeName = outEdge.sourceName,  // node is the mouseovered node, which acts as source in this context
                        nodeYear = outEdge.sourceStateInfo.adoptedYear,
                        x1, y1, x2, y2, x3, y3, // point 1: sourceRectangle, point 2: perpendicular to the node, point 3: the node
                        points = [];

                    var line = d4.line()
                        .x( function(point) { return point.lx; })
                        .y( function(point) { return point.ly; });

                    if(targetYear === nodeYear) {
                        x1 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength / 2;
                        y1 = yScale(nodeName) + cellSideLength / 2;
                        x2 = x1;
                        if(yScale(nodeName) < yScale(targetName)) {  // If the arrow goes down
                            y2 = yScale(targetName) - cellSideLength / 2;
                        } else {
                            y2 = yScale(targetName) + cellSideLength*2.5/2;
                        }

                        points = [
                            {lx: x1, ly: y1},
                            {lx: x2, ly: y2}
                        ];
                    } else {

                        x1 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength / 2;
                        y1 = yScale(nodeName) + cellSideLength / 2;
                        x2 = x1;
                        y2 = yScale(targetName) + (cellSideLength / 2);

                        if(nodeYear <= targetYear){ // If it is forward edge,
                            x3 = xScale(new Date(targetYear, 0, 1)) - cellSideLength/2;
                        } else {  
                            if(nodeYear - targetYear === 1){  // if the year difference is only 1,
                                x3 = xScale(new Date(targetYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                            else {
                                x3 = xScale(new Date(targetYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                        }
                        y3 = y2;

                        points = [
                            {lx: x1, ly: y1},
                            {lx: x2, ly: y2},
                            {lx: x3, ly: y3}
                        ];
                    }

                    return line(points);
                }
                function drawPathToTargets2(outEdge){  // d is an outEdge within outEdges data
                    // let _self = this,
                    //     _attr = _self._attr,
                    //     xScale = _attr.xScale,
                    //     yScale = _attr.yScale,
                    let xScale = _attr.xScale,
                        yScale = _attr.yScale,
                        cellSideLength = _attr.cellSideLength;

                    var targetData = outEdge,
                        targetName = outEdge.targetName,
                        targetYear = outEdge.targetStateInfo.adoptedYear,
                        nodeName = outEdge.sourceName,  // node is the mouseovered node, which acts as source in this context
                        nodeYear = outEdge.sourceStateInfo.adoptedYear,
                        x1, y1, x2, y2, x3, y3, // point 1: sourceRectangle, point 2: perpendicular to the node, point 3: the node
                        points = [];

                    var line = d4.line()
                        .x( function(point) { return point.lx; })
                        .y( function(point) { return point.ly; })
                        .curve(d4.curveBasis);

                    if(targetYear === nodeYear) {
                        x1 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength / 2;
                        y1 = yScale(nodeName) + cellSideLength / 2;
                        x2 = x1;
                        if(yScale(nodeName) < yScale(targetName)) {
                            y2 = yScale(targetName) - cellSideLength / 2;
                        } else {
                            y2 = yScale(targetName) + cellSideLength / 2;
                        }

                        points = [
                            {lx: x1, ly: y1},
                            {lx: x2, ly: y2}
                        ];
                    } else {

                        x1 = xScale(new Date(nodeYear, 0, 1)) + cellSideLength / 2;
                        y1 = yScale(nodeName) + cellSideLength / 2;
                        x2 = x1;
                        y2 = yScale(targetName) + (cellSideLength / 2);

                        if(nodeYear <= targetYear){ // If it is forward edge,
                            x3 = xScale(new Date(targetYear, 0, 1)) - cellSideLength/2;
                        } else {  
                            if(nodeYear - targetYear === 1){  // if the year difference is only 1,
                                x3 = xScale(new Date(targetYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                            else {
                                x3 = xScale(new Date(targetYear, 0, 1)) + cellSideLength/2*2.5;
                            }
                        }
                        y3 = y2;

                        points = [
                            {lx: x1, ly: y1},
                            {lx: x2, ly: y2},
                            {lx: x3, ly: y3}
                        ];
                    }

                    return line(points);
                }
                relevantNodes.node = d.node;
                relevantNodes.targetsOfSource = [];
                if(sourceNode !== null){
                    relevantNodes.source = sourceNode[0].sourceName;
                    // and also add target nodes the source node
                    var targetNamesOfSourceNode = dataSourceNode.outEdges.map(function(e){
                        return e.targetName; });

                    targetNamesOfSourceNode.forEach(function(targetName){
                        relevantNodes.targetsOfSource.push(targetName); 
                    });
                }
                if(targetNodes && targetNodes.length){
                    var targetNodeNames = targetNodes.map(function(d){ return d.targetName; });
                    relevantNodes.targets = targetNodeNames;
                }

                // Highlight the row
                _attr.g_matrix.selectAll(".rect")
                        .style("fill", function(e){  
                            if(relevantNodes.node === e.node){ return "#FFE87C"; }
                            if(relevantNodes.source !== null){
                                if(relevantNodes.source === e.node){ return "lightyellow"; }
                                if(relevantNodes.targetsOfSource.indexOf(e.node) > -1){ return "ghostwhite"; }
                            }
                            if(relevantNodes.targets && relevantNodes.targets.length){
                                if(relevantNodes.targets.indexOf(e.node) > -1){ return "lightyellow"; }
                            }
                            
                            return "none";
                        })
                        .style("opacity", function(e){
                            var allRelevantNodes = Object.keys(relevantNodes).map(function(key){ return relevantNodes.key; })
                            if(allRelevantNodes.indexOf(e.node) > -1){ return 0.1; }
                            return 1;
                        });

                // Highlight the year column by adding rects
                _attr.g_mouseover.selectAll(".mouseover_rect_year_highlight")
                        .data(_attr.nodes)
                        .enter().append("rect")
                        .attr("class", "mouseover_rect_year_highlight")
                        .attr("x", function(e){ return _attr.xScale(new Date(d.year, 0, 1)); })
                        .attr("y", function(e){ return _attr.yScale(e.stateId); })
                        .attr("width", _attr.cellSideLength)
                        .attr("height", _attr.cellSideLength)
                        .style("fill", "lightgoldenrodyellow");

                _attr.g_mouseover.selectAll(".mouseover_rect_year_highlight")
                            .each(function(d){ 
                                var firstChild = this.parentNode.firstChild;
                                this.parentNode.insertBefore(this, firstChild); });

                // Highlight the year bar and the attribute bar
                // store the previous color
                _attr.g_chart.select("." + d.node).style("fill", "gold");
                _attr.g_attrGraph.select("." + d.node).style("fill", "gold");
                _attr.g_chart.select(".bar_" + d.year).style("fill", "gold");

                // Color the node rects
                d4.selectAll(".rect_node")
                        .style("fill", function(e){  
                            if(relevantNodes.node === e.node){ return "gold"; }
                            if(relevantNodes.source !== null){
                                if(relevantNodes.source === e.node){ return "lavender"; }
                                if(relevantNodes.targetsOfSource.indexOf(e.node) > -1){ return "mediumpurple"; }
                            }
                            if(relevantNodes.targets && relevantNodes.targets.length){
                                if(relevantNodes.targets.indexOf(e.node) > -1){ return "indigo"; }
                            }
                            
                            return "none";
                        })
                        .style("opacity", function(e){
                            var allRelevantNodes = Object.keys(relevantNodes).map(function(key){ return relevantNodes.key; })
                            if(allRelevantNodes.indexOf(e.node) > -1){ return 0.1; }
                            
                            return 1;
                        })
                        .style("shape-rendering", function(e){
                            if(relevantNodes.node === e.node ||
                                (relevantNodes.source !== null && relevantNodes.source === e.node) ||
                                (relevantNodes.targets && relevantNodes.targets.length && relevantNodes.targets.indexOf(e.node) > -1)) {
                                return "none";
                            }
                            return "none";
                        })
                        .style("stroke", function(e){
                            if(relevantNodes.node === e.node ||
                                (relevantNodes.source !== null && relevantNodes.source === e.node) ||
                                (relevantNodes.targets && relevantNodes.targets.length && relevantNodes.targets.indexOf(e.node) > -1)) {
                                return "black";
                            }
                            return "white";
                        })
                        .style("stroke-width", function(e){
                            if(relevantNodes.node === e.node ||
                                (relevantNodes.source !== null && relevantNodes.source === e.node) ||
                                (relevantNodes.targets && relevantNodes.targets.length && relevantNodes.targets.indexOf(e.node) > -1)) {
                                return 1;
                            }
                            return 0.3;
                        });

                // // Put the nodes on top so that it doesn't get hidden by arrows
                // d4.selectAll(".rect_node")
                //     .each(function(d){ this.parentNode.appendChild(this); });
                // Hide source arrow
                // d4.selectAll("path.arrow_source")
                //         .style("opacity", function(e){
                //             console.log(e);
                //             if(relevantNodes.indexOf(e.node) > -1){ return 1; }
                //             return 0; });
                // Hide target rects
                _attr.g_matrix.selectAll(".circle_target").style("opacity", 0);
                _attr.g_matrix.selectAll(".path_from_source").style("opacity", 0);
                _attr.g_matrix.selectAll(".path_to_targets").style("opacity", 0);
                _attr.g_matrix.selectAll(".circle_source").style("opacity", 0);

                // Highlight the label
                var mouseovered_tick = d4.selectAll(".y-label")
                    .filter(function(e){ 
                        var label = d4.select(this).text();
                        return (label == d.node); })
                    .style("font-weight", "bold");
                var label_highlight = d4.select(mouseovered_tick.node().parentNode)
                    .append("rect")
                    .attr("class", "label_highlight_rect")
                    .attr("x", 4)
                    .attr("y", -5)
                    .attr("width", _attr.cellSideLength*2)
                    .attr("height", _attr.cellSideLength)
                    .style("fill", "#FFE87C");

                label_highlight
                    .each(function(e){
                        var firstChild = this.parentNode.firstChild;
                        this.parentNode.insertBefore(this, firstChild); 
                    });

            })
            //***- end of mouseover
            //***- mouseout
            .on("mouseout", function(d){
                _attr.svg.selectAll(".mouseover_path_from_source").remove();
                _attr.svg.selectAll(".mouseover_path_from_source_to_targets").remove();
                _attr.svg.selectAll(".mouseover_path_from_node_to_targets").remove();
                _attr.svg.selectAll(".mouseover_rect_year_highlight").remove();

                // Dehighlight the selected row
                _attr.g_matrix.selectAll(".rect:not(.rect_node)").style("fill", "none");
                // Get all nodes back
                _attr.g_matrix.selectAll(".circle_source, .path_from_source, .path_to_targets, .rect_node, .circle_target").style("opacity", 1);
                _attr.g_nodes.selectAll(".rect_node")
                    .style("fill", "mediumpurple")
                    .style("shape-rendering", "unset")
                    .style("stroke", "white")
                    .style("stroke-width", 0.3);
                // Get the between-rects back
                _self.colorRectsBetween();
                // Dehighlight the label
                // Remove the label highlight rect
                d4.selectAll(".y-label").style("font-weight", "normal");
                d4.selectAll(".label_highlight_rect").remove();
                // Get back to the original color of attribute bar
                _attr.g_attrGraph.select("." + d.node).style("fill", function(d){
                    return _attr.attrGraph_colorScale(d.centralities[cType]); });
                _attr.g_chart.select(".bar_" + d.year).style("fill", function(d){
                    return _attr.timeline_colorScale(d.count); });
            });
            //***- end of mouseout
         //***** end of Mouseover

        //************* Attribute graph
        _attr.g_attrGraph.selectAll(".attrRect")
            .data(_attr.nodes)
            .enter().append("rect")
            .attr("class", function(d){
                return "attrRect " + d.stateId;
            })
            .attr("x", 0)
            .attr("y", function(d){
                return _attr.attrGraph_yScale(d.stateId)-1; })
            .attr("width", function(d){ return _attr.attrGraph_xScale(d.centralities[cType]); })
            .attr("height", _attr.attrGraph_yScale.bandwidth())
            .style("fill", function(d){
                return _attr.attrGraph_colorScale(d.centralities[cType]);
            })
            .style("stroke", "white")
            .style("stroke-width", 2);

        //************* Yearly timeline
        var rects = _attr.g_chart.selectAll(".bar")
            .data(_attr.yearCount)
            .enter().append("rect")
            .attr("class", function(d){ return "year_bar bar_" + d.year; })
            .attr("x", function(d) { return _attr.xScale(new Date(d.year, 0, 1)) + 1; })
            .attr("y", function(d) { return (gs.f.size.upperPaneHeight - _attr.yScale_timeline(d.count)); })
            .attr("width", _attr.cellSideLength - 1)
            .attr("height", function(d) { return _attr.yScale_timeline(d.count); })
            .style("fill", function(d) { return _attr.timeline_colorScale(d.count); });
        
        // Mouseover year bars
        _attr.g_chart.selectAll(".year_bar")
        .on("mouseover", function(d){
            return tooltip.html("<b>Year:</b>&nbsp;" + d.year + 
                                "</br>" +
                                "<b>Frequency:</b>&nbsp;" + d.count)
                            .style("opacity", 0.9);
        })
        .on("mousemove", function(d){
            return tooltip.style({
                top: (d4.event.pageY + gs.r.margin.tShiftY) + "px",
                left: (d4.event.pageX + gs.r.margin.tShiftX) + "px"
            });
        })
        .on("mouseout", function(d){
            return tooltip.style("opacity", 0);
        });

        d4.selectAll(".circle_source").remove();
        d4.selectAll(".circle_target").remove();
    },
    addLineFromSource(d){
        let _self = this,
            _attr = _self._attr,
            xScale = _attr.xScale,
            yScale = _attr.yScale;

        var x1, y1, x2, y2,
            inEdge = d.inEdges,
            sourceYear;

        var line = d4.line()
            .x( function(point) { return point.lx; })
            .y( function(point) { return point.ly; });

        sourceYear = inEdge[0].sourceStateInfo.adoptedYear;
        x1 = xScale(new Date(sourceYear, 0, 1)) - xScale(new Date(d.year, 0, 1)) + (cellSideLength / 2);
        if(sourceYear > d.year){ // If it is backward edge,
            x2 = cellSideLength * 2;
        }else{
            x2 = -cellSideLength;
        }
        y1 = y2 = cellSideLength / 2;

        var points = [
            {lx: x1, ly: y1},
            {lx: x2, ly: y2}
        ];

        return line(points);
    },
    addLineToTargets(d){
        let _self = this,
            _attr = _self._attr,
            xScale = _attr.xScale,
            yScale = _attr.yScale;

        var x1, y1, x2, y2,
            outEdges, targetYears, minTargetYear, maxTargetYear;
        var line = d4.line()
            .x( function(point) { return point.lx; })
            .y( function(point) { return point.ly; });

        outEdges = d.outEdges;
        targetYears = outEdges.map(function(d){ return d.targetStateInfo.adoptedYear; });
        minTargetYear = d4.min(targetYears);
        maxTargetYear = d4.min(targetYears);

        if(maxTargetYear < d.year){  // If it is backward edge,
            x1 = 0;
            x2 = xScale(new Date(minTargetYear, 0, 1)) - xScale(new Date(d.year, 0, 1)) + (cellSideLength*2);
        }
        if(minTargetYear > d.year){
            x1 = cellSideLength;
            x2 = xScale(new Date(minTargetYear, 0, 1)) - xScale(new Date(d.year, 0, 1)) - cellSideLength;
        }
        
        y1 = y2 = cellSideLength / 2;

        points = [
            {lx: x1, ly: y1},
            {lx: x2, ly: y2}
        ];

        return line(points);
    },
    doSort() {
        let centralityList = ['centrality', 'outdegree', 'pageRank', 'betweenness', 'hit', 'close'],
            metadataList = ['perCapitaIncome', 'minorityDiversity', 'legislativeProfessionalism', 'citizenIdeology', 'totalPopulation', 'populationDensity'];

        let _self = this,
            _attr = _self._attr,
            c = _attr.c,
            isSortingByCentrality;

            if (centralityList.includes(c.get('factor'))){
                isSortingByCentrality = true;
            }
            else if (metadataList.includes(c.get('factor'))){
                isSortingByCentrality = false;
            }
            else if (c.get('factor') === 'adoptionYear'){
                isSortingByCentrality = true;

            }
            
            
        let selectedAttr = (isSortingByCentrality ?
                                c.get("factor") : 
                                conf.pipe.metaToId[c.get("factor")]);

        if (selectedAttr == 'adoptionYear')
            selectedAttr = 'outdegree';

        var transition = _attr.svg.transition().duration(750),
            transition2 = _attr.g_attrGraph.transition().duration(750),
            sortedNodes;
        
        

        if (isSortingByCentrality) {
            _attr.nodes.sort(function(a, b){
                return d4.ascending(a.centralities[selectedAttr], b.centralities[selectedAttr]);
            });
        } else {
            _attr.nodes.sort(function(a, b){
                if(b['metadata'][selectedAttr] === 'undefined'){
                    b['metadata'][selectedAttr] = 0
                }
                if(a['metadata'][selectedAttr] === 'undefined'){
                    a['metadata'][selectedAttr] = 0
                }
                return d4.ascending(a.metadata[selectedAttr], b.metadata[selectedAttr]);
            });
        }

        _attr.yScale.domain(_attr.nodes.map(function(d){ return d.stateId; }));
        transition.select(".yAxis").call(d4.axisRight(_attr.yScale).tickSize(0));

        transition.selectAll(".gcell")
                .attr("transform", function(d){
                    return "translate(" + _attr.xScale(new Date(d.year, d.month, d.day)) + "," + _attr.yScale(d.node) + ")";
                });
        transition.selectAll(".rect_node")
                .attr("transform", function(d){
                    // console.log("rect_node / d: ", d);
                    // console.log("rect_node / inEdges: ", d.inEdges[0]);
                    // console.log("rect_node / sourceStateInfo: ", d.inEdges[0].sourceStateInfo);
                    
                    var nodeYear, sourceYear;

                    // Take care three cases (when a node is source or target or source&target)
                    if (d.isSource === true && d.isTarget === false){ // If node is a source
                        sourceYear = d.year;
                        nodeYear = d.outEdges[0].targetStateInfo.adoptedYear;
                    } else if (d.isTarget === true){
                        sourceYear = d.inEdges[0].sourceStateInfo.adoptedYear;
                        nodeYear = d.year;
                    }

                    console.log("source/target year: ", sourceYear, nodeYear);
                    
                    var rotate = "";

                    if(sourceYear <= nodeYear) {
                        rotate = "rotate(0)";
                        return "translate(" + (_attr.xScale(new Date(d.year, d.month, d.day)) + 5) + "," + (_attr.yScale(d.node) + _attr.cellSideLength/2) + ") " + rotate;
                    }else {
                        rotate = "rotate(180)";
                        return "translate(" + (_attr.xScale(new Date(d.year, d.month, d.day)) + 5) + "," + (_attr.yScale(d.node) + _attr.cellSideLength/2) + ") " + rotate;
                    }
                });
        
        

        // Sort the attribute bars
        if (isSortingByCentrality) {
            _attr.attrGraph_xScale.domain([0, d4.max(_attr.nodes, function(d){ return d.centralities[selectedAttr]; })]);
            _attr.attrGraph_yScale.domain(_attr.nodes.map(function(d){ return d.stateId; }));
            _attr.attrGraph_colorScale.domain(d4.extent(_attr.nodes, function(d){ return d.centralities[selectedAttr]; }));
            transition2.selectAll("rect")
                    .attr("y", function(d){ return _attr.attrGraph_yScale(d.stateId); })
                    .attr("width", function(d){ return _attr.attrGraph_xScale(d.centralities[selectedAttr]); })
                    .style("fill", function(d){ return _attr.attrGraph_colorScale(d.centralities[selectedAttr]); });
        }
        else {
            _attr.attrGraph_xScale.domain([0, d4.max(_attr.nodes, function(d){ return d.metadata[selectedAttr]; })]);
            _attr.attrGraph_yScale.domain(_attr.nodes.map(function(d){ return d.stateId; }));
            _attr.attrGraph_colorScale.domain(d4.extent(_attr.nodes, function(d){ return d.metadata[selectedAttr]; }));
            transition2.selectAll("rect")
                    .attr("y", function(d){ return _attr.attrGraph_yScale(d.stateId); })
                    .attr("width", function(d){ 
                        return _attr.attrGraph_xScale(d.metadata[selectedAttr]); 
                    })
                    .style("fill", function(d){ 
                        return _attr.attrGraph_colorScale(d.metadata[selectedAttr]); 
                    });
        }
    },
    colorRectsBetween() {
        let _self = this,
            nodes = _self.model.get("nodes");

        // Color the way from source to target
        nodes.forEach(function(d){
            var nodeSelection = d4.select(".rect_node_" + d.stateId);
            if(!nodeSelection.empty()){
                var nodeData = d4.selectAll(".rect_node_" + d.stateId).datum();
                if(nodeData.isTarget == true){
                    var nodeName = nodeData.node,
                        nodeYear = nodeData.year,
                        sourceYear = nodeData.inEdges[0].sourceStateInfo.adoptedYear;
                    // Select rects on the way from source to target
                    if (sourceYear > nodeYear) {  // If it goes backward
                        d4.selectAll(".rect_" + nodeName)
                            .filter(function(e){
                                return nodeYear == e.year ? e.month!=0 : (sourceYear > e.year)&&(nodeYear < e.year);
                            })
                            .style("fill", "pink")
                            .style("opacity", 0.35);
                    } else if (sourceYear < nodeYear) {
                        d4.selectAll(".rect_" + nodeName)
                            .filter(function(e){
                                return sourceYear == e.year ? e.month!=0 : (sourceYear < e.year)&&(nodeYear > e.year);
                            })
                            .style("fill", "mediumpurple")
                            .style("opacity", 0.15);
                    }
                }
            }
        });
    }
});

/**
 * Primary view that holds experimental views.
 */
let PlaygroundView = Backbone.View.extend({
    el: "#playground",
    initialize() {
        this._views = {};
    },
    template: require('../templates/playground-template.html'),
    put(viewName, viewObject) {
        this._views[viewName] = viewObject;
    },
    get(viewName) {
        return this._views[viewName];
    },
    renderView(aView) {
        let __containter = this.$("#playground-view"),
            __loading = this.$("#playground-notification-badge");
        aView.listenTo(aView.model, "change", () => {
            __containter.empty();
            __loading.html("computing...").show();
            __containter.html(aView.render().el);
            __loading.hide();
        });
        __loading.html("data loading...").show();
        aView.model.populate();
    },
    render() {
        this.$el.empty();
        if (Object.keys(this._views) !== 0) {
            this.$el.html(this.template({ views: this._views }));
        }
        return this;
    }
});

/**
 * PolicyView: adoption sequence
 * - to display states in the order of the year that they adopt one specific policy.
 */
let PolicyView = Backbone.View.extend({
    el: '#svg-cascade-view',
    initialize() {
        this._attr = {
            tickList: []
        };
    },
    render() {
        // prevent rendering and show notification panel when no policy has been selected
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
            .attr({
                'class': "palette",
                'id': 'policy-palette'
            });

        $.extend(_self._attr, {
            axesG: axesG,
            paletteG: paletteG,
            xScale: xScale,
            yScale: yScale,
            yearList: yearList
        });

        _self.renderPalette();
        _self.bindTriggers();

        // bind zooming fuction
        zoom.on('zoom', () => {
            $(".temp-tick").remove();
            d3.select(_self.el).select(".y-axis").call(yAxis);
            _self.renderPalette();
            _self.bindTriggers();
        });
    },
    /**
     * do the major rendering work.
     */
    renderPalette() {
        let _self = this,
            _attr = this._attr,
            paletteG = _attr.paletteG,
            xScale = _attr.xScale,
            yScale = _attr.yScale;
        paletteG.selectAll('g').remove();

        _attr.yearList.forEach((year, index) => {
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
                    y: () => yScale(new Date(+year, 0, 1)),
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
                    y: () => yScale(new Date(+year, 0, 1)),
                    transform: (d, i) => "translate(" + (xScale.rangeBand() + gs.p.margin.textXShift) + "," + (Math.floor(i / gs.p.config.xMaxTick) * (xScale.rangeBand() + gs.p.margin.yPadding) + gs.p.margin.textYShift) + ")"
                });
        });
    },
    getRect(stateId) {
        let _self = this;
        return $("#" + _self._attr.paletteG.attr('id')).find("rect[value=" + stateId + "]");
    },
    lightUp(__target) {
        __target.addClass("hovered-item");
        let _self = this,
            year = __target.attr("class").split(" ")[2],
            tickList = this._attr.tickList;

        d3.select("#svg-cascade-view .y-axis").selectAll("tempTick")
            .data([year])
            .enter()
            .append('text')
            .text(tickList.indexOf("" + year) === -1 ? (year + " ►") : " ►")
            .attr({
                class: "temp-tick",
                y: _self._attr.yScale(new Date(+year, 0, 1)),
                transform: () => tickList.indexOf("" + year) === -1 ? "translate(-37,4)" : "translate(-8,4)"
            });
    },
    turnOff(__target) {
        __target.removeClass("hovered-item");
        $(".temp-tick").remove();
    },
    bindTriggers() {
        let tickList = [],
            yScale = this._attr.yScale,
            _self = this;
        _self._attr.tickList = tickList;
        this.$el.find(".y-axis .tick text").map((index, element) => tickList.push(element.textContent));

        // color the hovered square, and
        // show "year ►" next to the y-axis to indicate the adoption year when mouseover a state
        $(".partial").on('mouseover', (e) => {
            let __target = (void 0);
            if (e.target.nodeName === 'rect') {
                __target = $(e.target);
            } else {
                __target = $(e.target.parentElement).find("rect[value=" + e.target.classList[2] + "]");
            }
            _self.lightUp(__target);
        });

        // reverse changes made by mouseover event
        $(".partial").on('mouseout', (e) => {
            let __target = (void 0);
            if (e.target.nodeName === "rect") {
                __target = $(e.target);
            } else {
                __target = $(e.target.parentElement).find("rect[value=" + e.target.classList[2] + "]");
            }
            this.turnOff(__target);
        });
    }
});

/**
 * MetadataDropdownView:
 * - to display metadata dropdown menu, and correlation scores for a selected policy
 *  + please refer to the template file.
 */

/**
 * PolicyDetailView:
 * - to display detail information for a selected policy, including:
 *  + please refer to the template file.
 */
let PolicyDetailView = Backbone.View.extend({
    el: "#policy-detail-wrapper",
    template: require('../templates/policy-detail-template.html'),
    render(conditions) {
        let _self = this,
            colorSchema = d3.scale.ordinal()
            .domain(conf.static.subjectNames)
            .range(color15);

        if (conditions.get("policy") === conf.bases.policy.default) {
            this.$el.html(require('../templates/policy-detail-empty-template.html'));
        } else {
            this.$el.html(_self.template(_self.model.attributes));
        }

        d3.selectAll("span.policy_subject_name")
            .style("background-color", function(d){
                return colorSchema(d3.select(this).text());
            });
    }
});

/**
 * PolicyTrendView: time filter
 * - to display the aggreated policy adoption occurrence by year as a bar-chart, which also
 * - used as a filter to create time window 
 */
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

        // create crossfilter
        let ndx = crossfilter(adoptionList),
            dimension = ndx.dimension(d => d.year),
            group = dimension.group().reduceSum(d => d.count);

        // setup the bar-chart with dc.js
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

        // set time window information to `conditions` model, which triggers relevant data fetching and rendering events
        __target.on('mouseup', () => {
            let startYearDate = chart.dimension().bottom(1)[0].year,
                startYear = startYearDate.getFullYear(),
                endYearDate = chart.dimension().top(1)[0].year,
                endYear = endYearDate.getFullYear();

            _attr.c.set({
                "startYear": startYear,
                "endYear": endYear,
                "policy": conf.bases.policy.default
            });
        });
    }
});

/**
 * GeoView:
 * - with multiple functionalities (you know it).
 */
let GeoView = Backbone.View.extend({
    el: '#svg-geo-view',
    initialize() {
        this._attr = {};
        $.extend(this._attr, {
            _graph: _graph
        });
        this.bindTriggers();
    },
    /**
     * render and prepare static elements that do not change according to different `conditions`, including
     * - svg groups
     * - some of scales
     * - labels
     * - and so on.
     * @param {object} conditions Backbone.Model 
     */
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

        // generate regional border data
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
        // mute utill network rendered 
        this.$el.css("pointer-events", "none");

        // compute actual full canvas size
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

        // expose variables for modular access
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

        // data binding
        let states = _attr.stateTractG.selectAll("path")
            .data(stateFeatures),
            regions = regionTractG.selectAll("path")
            .data(regionFeatures);

        // create state tracts
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
            .on("mouseover", d => _self.lightUp(d.stateId))
            .on("mouseleave", d => _self.turnOff(d.stateId))
            .append("title")
            .text((d) => d.properties.id);

        // add labels to state tracts
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

        // add state border to the map
        stateBorderG.append("path")
            .datum(stateBorder)
            .attr({
                id: 'geo-state-border',
                class: "tract-border state-tract-border",
                d: pathBuilder
            });

        // create regional tract
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

        // add regional border to the map 
        regionBorderG.append("path")
            .datum(regionBorder)
            .attr({
                id: 'geo-region-border',
                class: "tract-border region-tract-border",
                d: pathBuilder
            });

        // add labels to region tracts
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

        // create color gradient that'll be applied to the legend
        this.createLegendGradient();

        // to render the rest elements
        this.update();

        // toggle state-wise/regional layer according to user's interaction
        this.toggleTract({ silent: true });
        return this;
    },
    /**
     * update color on tracts according to metadata selected.
     */
    update() {
        let _self = this,
            _attr = _self._attr,
            meta = conf.bases.yAttributeList[0].id,
            // to color tract iff:
            // - one of six `metadata` options is chosen, and 
            // - a policy is specified
            isColorNeeded = (_attr.c.get("metadata") !== conf.bases.yAttributeList[0].id) && (_attr.c.get("policy") !== conf.bases.policy.default),
            colorScale;

        // clear previous legend
        $(this.el).find("#geo-legend-group").empty();

        // apply gradient color to tracts and render the legend 
        if (isColorNeeded) {
            meta = conf.pipe.metaToId[_attr.c.get("metadata")];
            let valueDomain = [_attr.stat.min[meta], _attr.stat.max[meta]],
                colorRange = [css_variables["--color-value-out"], css_variables["--color-value-in"]]

            // bind color scale to domain of `metadata` selected
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

        // color each state tract
        let __stateTracts = $("#state-tract-group path");
        __stateTracts.each(i => {
            let __tract = $(__stateTracts[i]),
                title = __tract.attr("title");
            __tract.css("fill", () => {
                // to proceed only when the title string is from one of 50 states,
                // this validation is due to mismatch between state set from geo shape file and our database
                if (d3.set(conf.static.states).has(title)) {
                    if (title === "NE") {
                        // special case: no data for NE 
                        return d3.rgb(css_variables["--color-unadopted"]).brighter(1);
                    } else {
                        let node = _attr.nodes[title];
                        if (isColorNeeded && node.valid) {
                            // return corresponding color for one states that adopted current policy
                            return colorScale(node["metadata"][meta]);
                        } else {
                            // return default color otherwise
                            return d3.rgb(css_variables["--color-unadopted"]);
                        }
                    }
                }
            });
        });
        return this;
    },
    /**
     * @deprecated
     * given a node, check whether its a default network or not.
     * "default network" is an equivalence to situation that no policy has been selected. 
     * @param {object} node 
     */
    isNodeDefault(node) {
        return node.valid && node.adoptedYear === 9999;
    },
    bindTriggers() {
        let _self = this,
            _attr = this._attr;

        // to modify the list of selected states according to use's interaction.
        let regionTractClickHandler = function(e) {
                let __curr = $(e.target);
                if (__curr.hasClass("region-tract")) {
                    _attr.c.toggleTractList(__curr.attr("title"));
                }
            },
            stateTractClickHandler = function(e) {
                let __curr = $(e.target);
                if (__curr.hasClass("state-tract")) {
                    let stateId = __curr.attr("title");
                    _self.turnOff(stateId);
                    _attr.c.toggleTractList(stateId);
                }
            };

        this.$el.on('click', regionTractClickHandler);
        this.$el.on('click', stateTractClickHandler);
    },
    /**
     * light up relevant tracts.
     * @param {string} stateId stateId of the target tract
     */
    lightUp(stateId) {
        try {
            this.findTractById(stateId).addClass("hovered");
            switch (this._attr.c.get("nodeRelevance")) {
                case conf.bases.nodeRelevance[1].id:
                    // similar
                    let nodeList = this._attr._graph.getSimilarNodes("prank", stateId);
                    this.lightUpTracts(nodeList, "in-nodes");
                    break;
                case conf.bases.nodeRelevance[0].id:
                    // connected
                    let inNodeList = this._attr._graph.getInNodes(stateId),
                        outNodeList = this._attr._graph.getOutNodes(stateId);
                    this.lightUpTracts(inNodeList, "in-nodes");
                    this.lightUpTracts(outNodeList, "out-nodes");
                    break;
            }
        } catch (e) {
            // ignore exceptions raised when user trigger events that require information from this._attr._graph which hasn't been initialized yet.
        }
    },
    /**
     * turn off relevant tracts.
     * @param {string} stateId stateId of the target tract
     */
    turnOff(stateId) {
        try {
            this.findTractById(stateId).removeClass("hovered");
            switch (this._attr.c.get("nodeRelevance")) {
                case conf.bases.nodeRelevance[1].id:
                    // similar
                    let nodeList = this._attr._graph.getSimilarNodes("prank", stateId);
                    this.turnOffTracts(nodeList, "in-nodes");
                    break;
                case conf.bases.nodeRelevance[0].id:
                    // connected
                    let inNodeList = this._attr._graph.getInNodes(stateId),
                        outNodeList = this._attr._graph.getOutNodes(stateId);
                    this.turnOffTracts(inNodeList, "in-nodes");
                    this.turnOffTracts(outNodeList, "out-nodes");
                    break;
            }
        } catch (e) {
            // ignore exceptions raised when user trigger events that require information from this._attr._graph which hasn't been initialized yet.
        }
    },
    /**
     * apply colorClass to tracts with ids in tractList.
     * @param {Array} tractList array of object <name, value>
     * @param {string} colorClass class name that is going to apply
     */
    lightUpTracts(tractList, colorClass) {
        let _self = this;
        tractList.length !== 0 && tractList.forEach(tract => _self.findTractById(tract.name).addClass(colorClass));
    },
    /**
     * remove colorClass from tract with ids in tractList.
     * @param {Array} tractList tractList: array of object <name, value>
     * @param {string} colorClass class name that is going to remove
     */
    turnOffTracts(tractList, colorClass) {
        let _self = this;
        tractList.length !== 0 && tractList.forEach(tract => _self.findTractById(tract.name).removeClass(colorClass));
    },
    findTractById(stateId) {
        return $("#state-tract-group").find("path[title=" + stateId + "]");
    },
    /**
     * toggle state-wise/regional layer according to user's interaction
     */
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
    /**
     * update UI according to the list of selected states.
     */
    updateSelection() {
        let c = this._attr.c,
            theListName = c.getTractListName(),
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
    /**
     * create gradient color settings that'll be used to render legend
     */
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

/**
 * NetworkView:
 * - with multiple functionalities (you know it).
 */
let NetworkView = Backbone.View.extend({
    el: "#svg-network-view",
    initialize() {
        this._attr = {};
        $.extend(this._attr, {
            _graph: _graph
        });
    },
    /**
     * render and prepare static elements that do not change according to different `conditions`, including
     * - svg groups
     * - some of scales
     * - labels
     * - and so on.
     * @param {object} conditions Backbone.Model 
     */
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
        // sorry i really cannot see the point in removing the feature in d3v4 that set multiple attributes 
        // with hash for a selection.
        let svg = d4.select(_self.el)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('viewBox', ("0 0 " + _width + " " + _height + ""))
            .attr('class', 'svg-content-responsive'),
            edgeG = svg.append('g')
            .attr('id', 'network-edge-group')
            .attr('class', 'edge-group')
            .attr('transform', "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"),
            nodeG = svg.append('g')
            .attr('id', 'network-node-group')
            .attr('class', 'node-group')
            .attr('transform', "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"),
            labelG = svg.append('g')
            .attr('id', 'network-label-group')
            .attr('class', 'label-group')
            .attr('transform', "translate(" + gs.n.margin.left + "," + gs.n.margin.top + ")"),
            legendG = svg.append('g')
            .attr('id', 'network-legend-group')
            .attr('class', 'label-group')
            .attr('transform', "translate(" + _legendXOffset + "," + gs.n.margin.top + ")"),
            defs = svg.append('defs');

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
            cstat: cstat
        });

        // create the triangle symbol applied to arrows
        this.prepareMarker();

        this.drawLegend();

        return this.update();
    },
    update() {
        let _self = this,
            _attr = this._attr,
            nodes = _attr.nodes,
            edges = _attr.edges,
            cstat = _attr.cstat,
            geoBase = _attr.c.get("geoBase"), // {"state", "region"}
            metaType = _attr.c.get("metadata"), // {conf.bases.yAttributeList[i].id} "centrality" or other attributes
            cType = _attr.c.get("centrality"), // {conf.bases.centralityList[i].id} centrality type
            meta = conf.bases.yAttributeList[0].id,
            opacity = css_variables["--opacity-state"];

        let colorScale = (void 0),
            sizeScale = d4.scaleLinear()
            .domain([cstat.min[cType], cstat.max[cType]])
            .range(gs.n.config.circleSizeRange),
            xScale = d3.scale.linear()
            .range([gs.n.margin.left, gs.n.margin.left + gs.n.size.width]),
            yScale = d3.scale.linear()
            .range([gs.n.margin.top, gs.n.margin.top + gs.n.size.height]);

        let isSpecificNetwork = _attr.c.get("policy") !== conf.bases.policy.default,
            isColorNeeded = (geoBase === "state" ?
                (metaType !== conf.bases.yAttributeList[0].id) && isSpecificNetwork :
                true);

        // config `colorScale` and default `opacity` that'd be applied to render the map according to `geoBase`
        if (isColorNeeded) {
            meta = conf.pipe.metaToId[_attr.c.get("metadata")];
            switch (geoBase) {
                case "state":
                    let valueDomain = [_attr.stat.min[meta], _attr.stat.max[meta]],
                        colorRange = [css_variables["--color-value-out"], css_variables["--color-value-in"]];
                    colorScale = d4.scaleLinear()
                        .domain(valueDomain)
                        .interpolate(d4.interpolateRgb)
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

        let filteredNodes = {},
            filteredEdges = [];

        // iterate `edges` with `nodes` to filter and generate nodes and edges that are actually need to be rendered
        edges.forEach(edge => {
            if (_self.isAValidEdge(edge)) {
                let newEdge = {
                    source: filteredNodes[edge.source] || (filteredNodes[edge.source] = nodes[edge.source]),
                    target: filteredNodes[edge.target] || (filteredNodes[edge.target] = nodes[edge.target])
                }
                let validity = _self.isFollowingNetworkRule(newEdge);
                $.extend(newEdge, {
                    validity: validity,
                    name: (validity ?
                        newEdge.source.stateId + "-" + newEdge.target.stateId :
                        newEdge.target.stateId + "-" + newEdge.source.stateId)
                });
                filteredEdges.push(newEdge);
            }
        });

        // terminate rendering for empty network
        // could caused by either of following three
        // - too few policies to generate general network
        // - current selected policy does not match the general network
        // - selected states from geo view does not involved in current policy
        if (filteredEdges.length === 0) {
            $("#unable-to-process-network-notitication").show();
            $("#policy-network-wrapper .loader-img").hide();
            this.$el.hide();
            return;
        } else {
            $("#unable-to-process-network-notitication").hide();
        }

        let filteredNodeList = _.values(filteredNodes);

        // create element groups with filtered nodes and edges
        let links = _attr.edgeG.selectAll("path")
            .data(filteredEdges, d => d.name),
            circles = _attr.nodeG.selectAll(".network-node")
            .data(filteredNodeList, d => d.stateId),
            texts = _attr.labelG.selectAll("text")
            .data(filteredNodeList, d => d.stateId);

        // remove elements that are no longer need to display at current update
        // and keep the exiting links connected to the moving remaining nodes.
        links.exit()
            .transition()
            .attr("stroke-opacity", 0)
            .attrTween("d", d => {
                let dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return () => "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
            })
            .attrTween("x1", d => () => d.source.x)
            .attrTween("y1", d => () => d.source.y)
            .attrTween("x2", d => () => d.source.x)
            .attrTween("y2", d => () => d.source.y)
            .remove();

        circles.exit()
            .transition().attr("r", 0)
            .remove();

        texts.exit().transition().remove();

        // add and render elements within current selection
        links = links.enter().append("path")
            .call(links => links.transition().attr("stroke-opacity", 1))
            .attr("class", d => "network-link " + _self.getLinkValidityClass(d))
            .attr("marker-end", "url(#edge-marker)")
            .attr("edge-name", d => d.name)
            .merge(links);

        circles = circles.enter().append("circle")
            .attr("class", "network-node")
            .attr("title", d => d.stateId)
            .style("opacity", opacity)
            .on("mouseover", d => _self.lightUp(d.stateId))
            .on("mouseleave", d => _self.turnOff(d.stateId))
            .merge(circles)
            .call(d4.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .call(circles => circles.transition().attr("r", d => sizeScale(nodes[d.stateId].centralities[cType])))
            .style("fill", d => {
                return d.fill = getColor(d);
            })
            .style("stroke", d => d4.rgb(d.fill).darker(1));

        texts = texts.enter().append("text")
            .attr("y", ".31em")
            .merge(texts)
            .attr("x", d => {
                let r = sizeScale(nodes[d.stateId].centralities[cType]);
                if (r > 10) {
                    return -5;
                } else {
                    return gs.n.margin.labelXShift + r;
                }
            })
            .text(d => d.stateId);

        // apply simulations
        let centerX = gs.n.margin.left + gs.n.size.width / 2,
            centerY = gs.n.margin.top + gs.n.size.height / 2,
            forceLink = d4.forceLink().distance(100),
            forceCenter = d4.forceCenter(centerX, centerY),
            forceCollide = d4.forceCollide()
            .radius(d => gs.n.margin.collisionMargin + sizeScale(nodes[d.stateId].centralities[cType]));

        let simulation = d4.forceSimulation()
            .force('link', forceLink)
            .force('center', forceCenter)
            .force('collide', forceCollide);

        // toggle legend and setup force
        if (isSpecificNetwork) {
            $("#network-legend-group").show();

            let dists = filteredNodeList.map(d => filteredNodeList.map(e => Math.abs(d.adoptedYear - e.adoptedYear))),
                tsne = new tsnejs.tSNE({
                    dim: 2,
                    perplexity: 10
                });

            tsne.initDataDist(dists);
            let forceTsne = function(alpha) {
                tsne.step();
                let pos = tsne.getSolution();

                xScale.domain(d4.extent(pos, d => d[0]));
                yScale.domain(d4.extent(pos, d => d[1]));

                filteredNodeList.forEach((d, i) => {
                    d.vx += alpha * (xScale(pos[i][0]) - d.x);
                    d.vy += alpha * (yScale(pos[i][1]) - d.y);
                });
            }

            // create tsne layout for specific network
            simulation.force('tsne', forceTsne);
        } else {
            $("#network-legend-group").hide();

            // create manyBody force layout for general network
            let forceCharge = d4.forceManyBody()
                .strength(-30)
                .distanceMin(gs.n.config.circleSizeRange[1])
                .distanceMax(gs.n.size.width / 4);

            simulation.force('charge', forceCharge);
        }

        // update and restart the simulation.
        simulation.nodes(filteredNodeList);
        simulation.force("link").links(filteredEdges);
        simulation.on("tick", ticked);
        simulation.on("end", _self.postRender.bind(_self));
        simulation.alpha(0.2).restart();

        // compute node similarity
        let graph = _attr._graph,
            nodeList = _.map(filteredNodes, node => node.stateId),
            edgeList = _.map(filteredEdges, edge => {
                return (edge.validity ? {
                    source: edge.source.stateId,
                    target: edge.target.stateId
                } : {
                    source: edge.target.stateId,
                    target: edge.source.stateId
                });
            });

        // setup grank graph
        graph.nodes(nodeList)
            .edges(edgeList)
            .init();

        // update graph according to filteredNodes and filteredEdges
        // and compute similarities for mouse event
        if (true && conf.enableWebWorker && window.Worker) {
            // if Web Worker supported
            // show info span and mute pointer event
            $("#computing-node-similarity-span").show();
            this.$el.css("pointer-events", "none");
            let grankWorker = new GRankWorker();
            grankWorker.postMessage({ nodes: nodeList, edges: edgeList });
            grankWorker.onmessage = function(e) {
                graph.setPrank(e.data.prank);
                // hide info span and recover pointer event
                $("#computing-node-similarity-span").hide();
                $(_self.el).css("pointer-events", "");
                // muted at geoView.render()
                $("#svg-geo-view").css("pointer-events", "");
            }
        } else {
            // if Web Worker not enabled or not supported
            // add an interval to delay UI blocking caused by network computation
            setTimeout(() => { graph.doPrank(); }, 350);
        }

        function getColor(d) {
            let fillColor = (void 0);
            switch (geoBase) {
                case "state":
                    // to proceed only when the title string is from one of 50 states,
                    // this validation is due to mismatch between state set from geo shape file and our database
                    if (d4.set(conf.static.states).has(d.stateId)) {
                        if (d.stateId === "NE") {
                            // special case: no data for NE 
                            fillColor = d4.rgb(css_variables["--color-unadopted"]).brighter(1);
                        } else {
                            let node = _attr.nodes[d.stateId];
                            if (isColorNeeded && node.valid) {
                                // return corresponding color for one states that adopted current policy
                                fillColor = colorScale(node["metadata"][meta]);
                            } else {
                                // return default color otherwise
                                fillColor = css_variables["--color-unadopted"];
                            }
                        }
                    }
                    break;
                case "region":
                    fillColor = colorScale[conf.pipe.regionOf[d.stateId]];
                default:
                    // won't ever happen
            }
            return fillColor;
        }

        // Use elliptical arc path segments to doubly-encode directionality.
        function ticked() {
            links
                .attr("d", d => {
                    let dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                })
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            circles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            texts
                .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
        }

        function dragstarted(d) {
            if (!d4.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d4.event.x;
            d.fy = d4.event.y;
        }

        function dragended(d) {
            if (!d4.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }

        // expose filtered edges and nodes to the view class
        $.extend(_attr, {
            filteredEdges: filteredEdges,
            filteredNodes: filteredNodes
        });

        return this;
    },
    /**
     * light up relevant nodes.
     * @param {string} stateId stateId of the target node
     */
    lightUp(stateId) {
        try {
            this.findNodeById(stateId).addClass("hovered");
            switch (this._attr.c.get("nodeRelevance")) {
                case conf.bases.nodeRelevance[1].id:
                    // similar
                    let nodeList = this._attr._graph.getSimilarNodes("prank", stateId);
                    this.lightUpNodes(nodeList, "in-nodes");
                    break;
                case conf.bases.nodeRelevance[0].id:
                    // connected
                    let inNodeList = this._attr._graph.getInNodes(stateId),
                        outNodeList = this._attr._graph.getOutNodes(stateId);
                    this.lightUpNodes(inNodeList, "in-nodes");
                    this.lightUpNodes(outNodeList, "out-nodes");
                    this.lightUpEdges(this.getEdgeNameList(inNodeList, stateId), "in-nodes");
                    this.lightUpEdges(this.getEdgeNameList(stateId, outNodeList), "out-nodes");
                    break;
            }
        } catch (e) {
            // ignore exceptions raised when user trigger events that require information from this._attr._graph which hasn't been initialized yet.
        }

    },
    /**
     * turn off relevant nodes.
     * @param {string} stateId stateId of the target node
     */
    turnOff(stateId) {
        try {
            this.findNodeById(stateId).removeClass("hovered");
            switch (this._attr.c.get("nodeRelevance")) {
                case conf.bases.nodeRelevance[1].id:
                    // similar
                    let nodeList = this._attr._graph.getSimilarNodes("prank", stateId);
                    this.turnOffNodes(nodeList, "in-nodes");
                    break;
                case conf.bases.nodeRelevance[0].id:
                    // connected
                    let inNodeList = this._attr._graph.getInNodes(stateId),
                        outNodeList = this._attr._graph.getOutNodes(stateId);
                    this.turnOffNodes(inNodeList, "in-nodes");
                    this.turnOffNodes(outNodeList, "out-nodes");
                    this.turnOffEdges(this.getEdgeNameList(inNodeList, stateId), "in-nodes");
                    this.turnOffEdges(this.getEdgeNameList(stateId, outNodeList), "out-nodes");
                    break;
            }
        } catch (e) {
            // ignore exceptions raised when user trigger events that require information from this._attr._graph which hasn't been initialized yet.
        }
    },
    /**
     * apply colorClass to circles with ids in nodeList.
     * @param {Array} nodeList stateId list of nodes that need to light up
     * @param {string} colorClass class name that is going to apply
     */
    lightUpNodes(nodeList, colorClass) {
        let _self = this;
        nodeList.length !== 0 && nodeList.forEach(node => _self.findNodeById(node.name).addClass(colorClass));
    },
    /**
     * remove colorClass from circles with ids in nodeLists.
     * @param {Array} nodeList stateId list of nodes that need to turn off
     * @param {string} colorClass class name that is going to remove
     */
    turnOffNodes(nodeList, colorClass) {
        let _self = this;
        nodeList.length !== 0 && nodeList.forEach(node => _self.findNodeById(node.name).removeClass(colorClass));
    },
    lightUpEdges(edgeList, colorClass) {
        let _self = this;
        edgeList.length !== 0 && edgeList.forEach(edgeName => _self.findEdgeByName(edgeName).addClass(colorClass));
    },
    turnOffEdges(edgeList, colorClass) {
        let _self = this;
        edgeList.length !== 0 && edgeList.forEach(edgeName => _self.findEdgeByName(edgeName).removeClass(colorClass));
    },
    findNodeById(stateId) {
        return $("#network-node-group").find("circle[title=" + stateId + "]");
    },
    findEdgeByName(edgeName) {
        return $("#network-edge-group").find("path[edge-name=" + edgeName + "]");
    },
    /**
     * create edge name list.
     * @param {Array<string>} sourceNodeNameList
     * @param {string} targetNode
     * OR
     * @param {string} sourceNode
     * @param {Array<string>} targetNodeNameList
     */
    getEdgeNameList() {
        let edgeNameList = []
        try {
            if (Array.isArray(arguments[0])) {
                edgeNameList = arguments[0].map(sourceNode => sourceNode.name + "-" + arguments[1]);
            } else {
                edgeNameList = arguments[1].map(targetNode => arguments[0] + "-" + targetNode.name);
            }
        } catch (e) {
            console.log("invalid edge args.");
        } finally {
            return edgeNameList;
        }
    },
    /**
     * An edge is valid iff:
     *  both source and target nodes have adopted current policy, and 
     *  at lease one of two nodes are selected to show when render state-wise map, or
     *  both source and target nodes are selected to show when render regional map.
     */
    isAValidEdge(edge) {
        let _attr = this._attr,
            selectedIdList = d4.set(_attr.c.getSelectedIds()); // selected states
        return (_attr.nodes[edge.source].valid && _attr.nodes[edge.target].valid) &&
            (_attr.c.get("geoBase") === "state" ?
                selectedIdList.has(edge.source) || selectedIdList.has(edge.target) :
                selectedIdList.has(edge.source) && selectedIdList.has(edge.target));
    },
    getLinkValidityClass(edge) {
        return (edge.validity ?
            "follow-the-rule" :
            "violate-the-rule");
    },
    isFollowingNetworkRule(edge) {
        return +edge.source.adoptedYear <= +edge.target.adoptedYear;
    },
    isNodeDefault(node) {
        return node.valid && node.adoptedYear === 9999;
    },
    prepareMarker() {
        this._attr.defs.append("marker")
            .attr("id", "edge-marker")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        this._attr.defs.append("marker")
            .attr("id", "triangle-marker")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");
    },
    drawLegend() {
        this._attr.legendG.selectAll("path")
            .data(["follow-the-rule", "violate-the-rule"])
            .enter().append("path")
            .attr("d", (d, i) => "M0," + (i * gs.n.margin.legendYShift) + "L20," + (i * gs.n.margin.legendYShift))
            .attr("class", d => "network-link " + d)
            .attr("marker-end", "url(#triangle-marker)");

        this._attr.legendG.selectAll("text")
            .data(["Expected Cascades", "Deviant Cascades"])
            .enter().append("text")
            .attr("x", 30)
            .attr("y", (d, i) => gs.n.margin.legendYShift * i + gs.n.margin.legendTextShift)
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

let PolicyNetworkView = Backbone.View.extend({
    id: 'new-policy-network-view',
    tagName: 'div',
    initialize() {
        this._attr = {};
    },
    render() {
        let _self = this,
            _width = gs.pn.margin.left + gs.pn.margin.right + gs.pn.size.width,
            _height = gs.pn.margin.top + gs.pn.margin.bottom + gs.pn.size.height;

        let containter = this.el,
            meter = document.querySelector('#playground-progress'),
            canvas = document.createElement("canvas");
        canvas.setAttribute('width', _width);
        canvas.setAttribute('height', _height);
        containter.appendChild(canvas);
        let context = canvas.getContext('2d');

        let nodes = this.model.get("policies");
        if (conf.enableWebWorker && window.Worker) {
            let tsneWorker = new tSNEWorker();
            tsneWorker.postMessage({
                nodes: nodes,
                xRange: [gs.pn.margin.left, gs.pn.margin.left + gs.pn.size.width],
                yRange: [gs.pn.margin.top, gs.pn.margin.top + gs.pn.size.height],
                dists: this.model.get("text_similarities")
            });
            tsneWorker.onmessage = function(event) {
                switch (event.data.type) {
                    case "tick":
                        return ticked(event.data);
                    case "end":
                        return ended(event.data);
                }
            }
        }

        function ticked(data) {
            let progress = data.progress;
            meter.style.width = 100 * progress + "%";
        }

        function ended(data) {
            var nodes = data.nodes;
            meter.style.display = "none";

            context.clearRect(0, 0, _width, _height);
            context.save();

            context.beginPath();
            nodes.forEach(drawNode);
            context.fill();
            context.strokeStyle = "#fff";
            context.stroke();

            context.restore();
        }

        function drawNode(d) {
            context.moveTo(d.x + 3, d.y);
            context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
        }

        return this;
    }
});

/**
 * PolicyGroupView: (Policy table)
 * Policy table reveals more information about the filtered policies, which also let users to: 
 * - select one policy to begin inspection,
 * - search policies by keywords,
 * - and so on.
 */
let PolicyGroupView = Backbone.View.extend({
    el: "#policy-group-table",
    initialize() {
        this.$el.bootstrapTable({
            sortName: "adoption_count",
            sortOrder: "desc",
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
                visible: false
            }, {
                field: 'policy_name',
                title: 'Policy Name',
                sortable: true,
                searchable: true,
                order: 'asc'
            }, {
                field: 'adoption_count',
                title: 'Adoptions',
                titleTooltip: 'Number of states that adopted this policy.',
                sortable: true,
                searchable: false,
                order: 'desc'
            }, {
                field: 'subject',
                title: 'Subject',
                titleTooltip: 'Subject to which a policy belongs.',
                sortable: true,
                searchable: false,
                order: 'asc'
            }, {
                field: 'policy_start',
                title: 'First Adopt',
                titleTooltip: 'The year that the first adoption occurred.',
                sortable: true,
                searchable: false,
                order: 'asc'
            }, {
                field: 'policy_end',
                title: 'Last Adopt',
                titleTooltip: 'The year that the last adoption occurred.',
                sortable: true,
                searchable: false,
                order: 'asc'
            }, {
                field: 'has_full_text',
                title: 'Full Text',
                titleTooltip: "Whether there's full text available or not.",
                sortable: true,
                searchable: false,
                formatter: function(value, row, index) {
                    return value ?
                        '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>' :
                        '<span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>';
                }
            }],
            formatLoadingMessage: () => 'Loading policies, please wait...',
            formatNoMatches: () => 'Oops! No matching policies. Please try to adjust your time window.',
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

/**
 * RingView:
 * - to display policy cluster
 * - to reveal cluster detail in tooltip when hovered
 * - to have a cluster selected when clicked
 */
let RingView = Backbone.View.extend({
    el: "#svg-ring-view",
    initialize() {
        this._attr = {};
    },
    events: {
        'click': 'switchCluster'
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

        // compute full canvas size
        let _width = gs.r.margin.left + gs.r.margin.right + gs.r.size.width,
            _height = gs.r.margin.top + gs.r.margin.bottom + gs.r.size.height;

        // create svg element and groups for ring and label
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

        // create layout and arc generator
        let partition = d3.layout.partition()
            .sort((a, b) => a.size - b.size)
            .size([2 * Math.PI, 2 * gs.r.size.r])
            .value(d => d.size),
            arc = (d3.svg.arc()
                .startAngle(d => d.x)
                .endAngle(d => d.x + d.dx)
                .innerRadius(d => d.depth * d.y / 2)
                .outerRadius(d => (d.depth * (d.y) + d.dy) / 2)),

            tooltip = d3.select("body")
            .append("div")
            .attr("id", "ring-tooltip");

        // data binding
        let paths = ringG.datum(clusterObj).selectAll("path")
            .data(partition.nodes),
            labels = labelG.datum(clusterObj).selectAll("text")
            .data(partition.nodes);

        // expose variables for modular access
        $.extend(_attr, {
            ringG: ringG,
            labelG: labelG,
            c: conditions
        });

        // create paths (arcs) and bind events
        paths.enter().append("path")
            .attr({
                d: arc,
                seq: d => getFullSeqStr(d),
                id: d => getElementId(d) // Add id to each path
            })
            .style({
                stroke: "", // No stroke as default
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

        // create labels
        labels.enter().append("text")
            .attr({
                transform: d => "rotate(" + computeTextRotation(d) + ")",
                x: d => (d.depth * d.y / 2),
                dx: 6, // margin
                dy: ".35em",
                id: d => getElementId(d) // Add id to each text, corresponds to path id
            }) // vertical-align
            .text(d => displayText(d));

        // Inital ring
        initialStroke();

        /**
         * get ID for each element.
         * @param {object} d current node
         */
        function getElementId(d) {
            if (d.depth === 0) {
                return "node";
            } else {
                return method === "subject" ? d.id : d.name;
            }
        };

        /**
         * compute rotation angle for each label.
         * @param {object} d current node
         */
        function computeTextRotation(d) {
            let shift = (d.depth === 0 ? 180 : -90);
            return (d.x + d.dx / 2) * 180 / Math.PI + shift;
        };

        /**
         * retrieve cluster identifier from node object.
         * @param {object} d current node
         */
        function getSeqStr(d) {
            let seq = "",
                curr = d;
            while (curr.depth !== 0) {
                seq = "-" + (method === "subject" ? curr.id : curr.name) + seq;
                curr = curr.parent;
            }
            return _.trimStart(seq, "-");
        };

        /**
         * add leading '0' to form the key to retrieve cluster terms.
         * @param {object} d current node
         */
        function getFullSeqStr(d) {
            return d.depth ? "0-" + getSeqStr(d) : "0";
        };

        /**
         * to generate label on the arcs.
         * @param {object} d current node
         */
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
        /**
         * adjust the label to fit in thickness of arcs.
         * @param {object} d current node
         */
        function displayText(d) {
            let text = getHead(d),
                thickness = ((d.dy) / 2);
            if (text.length * 8 < thickness) {
                return text;
            } else {
                return text.split(" ")[0] + " ..."
            }
        };

        /**
         * to generate tooltip text.
         * @param {object} d current node
         */
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

        /* event handlers */

        function mouseOverArc(d) {
            // d3.select(this).style("stroke", "black");

            // Change corresponding text color to red
            if (d.depth === 0) {
                d3.select('g#ring-label-group').selectAll("text").filter(d => d.depth === 0).style("fill", "red");
            } else {
                d3.select('g#ring-label-group').selectAll("text").filter(d => (method === "subject" ? d.id : d.name) === parseInt(d3.select(this).attr("id"))).style("fill", "red");
            }
            tooltip.html(formatDescription(d));
            return tooltip.style("opacity", 0.9);
        };

        function mouseOutArc(d) {
            // d3.select(this).style("stroke", "white");

            // Change all text color to black
            d3.select('g#ring-label-group').selectAll("text").style("fill", "black");
            return tooltip.style("opacity", 0);
        };

        function mouseMoveArc() {
            return tooltip.style({
                top: (d3.event.pageY + gs.r.margin.tShiftY) + "px",
                left: (d3.event.pageX + gs.r.margin.tShiftX) + "px"
            });
        };

        function mouseClickArc() {
            d3.select(this).moveToFront();
            let __target = $(d3.event.target),
                __prevSelected = $("#ring-group .clicked-item");
            if (__prevSelected[0] !== __target[0]) {
                $("#ring-group path").removeClass("clicked-item");
                __target.addClass("clicked-item");
            }
        };

        function initialStroke() {
            d3.select('#node').moveToFront();
            $("#ring-group #node").addClass("clicked-item");
        };

        return this;
    },
    /**
     * ring view click, update policy group
     * @param {object} e event
     */
    switchCluster(e) {
        let seq = $(e.target).attr("seq"),
            seqList = seq.split("-"),
            conditions = this._attr.c;
        switch (conditions.get("method")) {
            case "subject":
                let subjectId = (seqList.length === 1 ?
                        conf.bases.subject.id :
                        seqList[1]),
                    subjectName = conf.pipe.subjectIdToName[subjectId];
                conditions.set({
                    "subject": subjectName,
                    "param": seq,
                    "policy": conf.bases.policy.default
                });
                break;
            case "text":
                conditions.set({
                    "param": seq,
                    "policy": conf.bases.policy.default
                });
                break;
            default:
                break;
        }
    }
});

/**
 * Dropdowns
 * Customized dropdown menu that:
 * - can be disabled/enabled entirely or patially
 * - has a changeable label
 */
let DropdownController = Backbone.View.extend({
    templateForMetadataDropdown: require('../templates/metadata-dropdown-template.html'),
    renderMetadataDropdown(conditions) {
        let _self = this;
        if (conditions.get("policy") === conf.bases.policy.default) {
            this.$el.html(require('../templates/metadata-dropdown-empty-template.html'));
        } else {
            this.$el.html(_self.templateForMetadataDropdown(_self.model.attributes));
        }
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

/**
 * Switchs
 * Customized switch component that:
 * - can append a label as title
 * - can apply two alignment
 */
let BootstrapSwitchView = Backbone.View.extend({
    initialize() {
        this.$el.hide();
        this.$el.addClass("bs-switch-wrapper");
        this.$el.append("<span></span>", "<input type='checkbox'>");
    },
    label(labelString) {
        this.$el.find("span").html(labelString + "&nbsp;");
        return this;
    },
    align(alignment) {
        switch (alignment) {
            case "right":
                this.$el.addClass("bootstrap-switch-right");
                break;
            case "left":
                this.$el.addClass("bootstrap-switch-left");
                break;
        }
        return this;
    },
    render(opts) {
        this.$el.find("input").bootstrapSwitch(opts);
        this.$el.show();
        return this;
    },
    $switch() {
        return this.$el.find(".bootstrap-switch");
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
    PolicyNetworkView: PolicyNetworkView,
    GeoView: GeoView,
    RingView: RingView,
    NetworkView: NetworkView,
    PolicyGroupView: PolicyGroupView,
    DropdownController: DropdownController,
    BootstrapSwitchView: BootstrapSwitchView,
    PlaygroundView: PlaygroundView,
    DiffusionView: DiffusionView,
    DiffusionView2: DiffusionView3
};