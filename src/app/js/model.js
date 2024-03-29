let conf = require('../config.js');
let initialNetworkData = require('../../data/initial_network.json');

let Conditions = Backbone.Model.extend({
    defaults: {
        subject: conf.bases.subject.default,
        policy: conf.bases.policy.default,
        metadata: conf.bases.yAttributeList[0].id,
        sequence: conf.bases.xAttributeList[0].id,
        centrality: conf.bases.centralityList[0].id,
        factor: conf.bases.factorList[0].id,
        cvalidity: true,
        geoBase: 'state',
        regionList: [],
        stateList: [],
        method: "subject",
        param: conf.pipe.subjectToId[conf.bases.subject.default],
        startYear: 0,
        endYear: 9999,
        networkIters: 50,
        nodeRelevance: conf.bases.nodeRelevance[0].id
    },
    initialize: () => {},
    setupCentralityValidity() {
        // either is on "centrality"
        let validity = (this.get("metadata") === conf.bases.yAttributeList[0].id ||
            this.get("sequence") === conf.bases.xAttributeList[0].id);
        this.set("cvalidity", validity);
        return this;
    },
    /**
     * modify selected states according to use's selection.
     * @param {string} tract state id string    
     */
    toggleTractList(tract) {
        let theListName = this.getTractListName(),
            theList = this.getTractList();
        if (_.indexOf(theList, tract) === -1) {
            // append the selected state to corresponding list if it does not exist
            this.set(theListName, _.concat(theList, tract));
        } else {
            // remove the selected state from the list if it exists
            this.set(theListName, _.filter(theList, (o) => o !== tract));
        }
    },
    /**
     * Retrieve current selection of states as a list.
     * @returns {Array<string>} state list in their IDs.
     */
    getSelectedIds() {
        let _self = this;
        if ((this.get("regionList").length === 0 && this.get("stateList").length === 0)) {
            return _.flatMap(conf.static.regions);
        }
        switch (this.get("geoBase")) {
            case "state":
                return this.get("stateList");
            case "region":
                return _.flatten(_self.get("regionList").map(region => conf.static.regions[region]))
            default:
                //shouldn't happen
        }
    },
    getTractList() {
        return this.get(this.getTractListName());
    },
    getTractListName() {
        return this.get("geoBase") + "List";
    },
    setSubject(subjectStr) {
        this.set({
            "subject": subjectStr,
            "method": "subject",
            "param": conf.pipe.subjectToId[subjectStr]
        });
    }
});

let PolicyOptionsModel = Backbone.Model.extend({
    url: '/api/subjects',
    parse(response) {
        this.set({
            "pipe": response.pipe,
            "policies": $.extend({ "All": response.all }, response.policies)
        });
    }
});

let PolicyModel = Backbone.Model.extend({
    idAttribute: "policyId",
    initialize() {
        this.urlRoot = conf.api.root + conf.api.policyBase;
        this.url = this.urlRoot + conf.bases.policy.default;
    },
    populate(conditions) {
        let _self = this;
        if (conditions.get("policy") === conf.bases.policy.default) {
            _self.set({ "message": conf.bases.policy.default });
        } else {
            this.url = this.urlRoot + conditions.get("policy");
            $.getJSON(_self.url).done((data) => {
                _self.set(data);
            });
        }
    }
});

let PolicyDetailModel = Backbone.Model.extend({
    initialize() {
        this.url = conf.api.root + conf.api.policyBase + conf.api.policyDetailBase;
    },
    populate(conditions) {
        let _self = this;
        return $.getJSON(_self.url, {
            "method": conditions.get("method"),
            "param": conditions.get("param"),
            "start_year": conditions.get("startYear"),
            "end_year": conditions.get("endYear"),
            "policy": conditions.get("policy")
        }).done(data => {
            //** Add subject name of similar policies (get subject name from given subject id)
            // For content similarities
            let similarContentPolicies = data.text_similarities;
            similarContentPolicies.forEach(function(policy){
                let subjectId = policy.policy_subject_id;
                let subjectName = conf.pipe.subjectIdToName[subjectId];

                policy.policy_subject_name = subjectName;   // Assign new property
            });
            data.text_similarities = similarContentPolicies;

            // For cascade similarities
            let similarCascadePolicies = data.cascade_similarities;
            similarCascadePolicies.forEach(function(policy){
                let subjectId = policy.policy_subject_id;
                let subjectName = conf.pipe.subjectIdToName[subjectId];

                policy.policy_subject_name = subjectName;   // Assign new property
            });
            data.cascade_similarities = similarCascadePolicies;

            this.set(data);
            this.trigger('change');
        });
    }
});

let PolicyTrendModel = Backbone.Model.extend({
    initialize() {
        this.urlBase = conf.api.root + conf.api.policyBase + conf.api.policyTrendBase;
    },
    populate(conditions) {
        let _self = this;
        _self.url = _self.urlBase + conditions.get("method") + "/" + conditions.get("param");
        return $.getJSON(_self.url, (data) => {
            _self.set(data);
        });
    }
});

let GeoModel = Backbone.Model.extend({
    initialize() {
        this.topoUrl = './static/data/states.p1.topo.json';
        this.urlRoot = conf.api.root + conf.api.geoBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
    },
    fetchTopo() {
        let _self = this;
        return $.getJSON(_self.topoUrl);
    },
    fetchValues(conditions) {
        let _self = this;
        this.url = this.urlRoot + conditions.get("policy");
        return $.getJSON(_self.url);
    },
    populate(conditions) {
        let _self = this;
        return $.when(_self.fetchTopo(), _self.fetchValues(conditions)).done((topo, geo) => {
            _self.set({
                "topo": topo[0],
                "nodes": geo[0].nodes,
                "stat": geo[0].stat
            });
        })
    }
});

let DynamicNetworkModel = Backbone.Model.extend({
    initialize() {
        this.url = conf.api.root + conf.api.networkBase
    },
    populate(conditions) {
        let _self = this;

        // When initial rendering, get the inferred network from static file "initial_network.json"
        if (conditions === "initial_rendering"){
            let data = initialNetworkData;

            let edgesInIndices = [];
            if (data.length !== 0) {
                edgesInIndices = _.map(data, edge => {
                    return {
                        "source": conf.pipe.statesToIndices[edge.source],
                        "target": conf.pipe.statesToIndices[edge.target],
                        "value": edge.value
                    };
                });
            }
            _self.set({
                "edgesInStateIds": data,
                "edgesInIndices": edgesInIndices
            }, { silent: true });
            _self.trigger("change");

            return "initial_network_rendering_done";
        }

        return $.getJSON(_self.url, {
            "method": conditions.get("method"),
            "param": conditions.get("param"),
            "iters": conditions.get("networkIters"),
            "start_year": conditions.get("startYear"),
            "end_year": conditions.get("endYear")
        }).done(data => {
            console.log("to grab initial network data: ", data);
            let edgesInIndices = [];
            if (data.length !== 0) {
                edgesInIndices = _.map(data, edge => {
                    return {
                        "source": conf.pipe.statesToIndices[edge.source],
                        "target": conf.pipe.statesToIndices[edge.target],
                        "value": edge.value
                    };
                });
            }
            _self.set({
                "edgesInStateIds": data,
                "edgesInIndices": edgesInIndices
            }, { silent: true });
            _self.trigger("change");
        });
    }
});

let NetworkModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.networkBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
    },
    populate() {
        let _self = this,
            centralities = conf.static.centrality.centralities,
            centralityStat = conf.static.centrality.stat,
            conditions = arguments[0],
            edges = (arguments.length === 2 ?
                arguments[1] :
                this.get("edges"));
        this.url = this.urlRoot + conditions.get("policy");
        return $.getJSON(_self.url).done((data) => {
            let nodes = data.nodes;
            _.mapValues(nodes, (node) => node["centralities"] = centralities[node.stateId]);
            _self.set({
                edges: edges,
                nodes: nodes,
                stat: data.stat,
                cstat: centralityStat
            }, { silent: true });
            _self.trigger("change");
        });
    }
});

let PolicyNetworkModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.policyBase + conf.api.networkBase;
        this.url = this.urlRoot;
    },
    populate() {
        let _self = this;
        $.getJSON(_self.url).done(data => {
            _self.set(data);
        });
    }
});

let StateModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = '/api/root/';
        this.url = this.urlRoot + conf.pipe.subjectToId[conf.bases.subject.default];
    },
    populate(conditions) {
        let _self = this;
        this.url = this.urlRoot + conf.pipe.subjectToId[conditions.get("subject")];
        $.getJSON(_self.url).done((data) => {
            _self.set(data);
        });
    }
});

let ArcModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.arcBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.metadata + "/" + conf.models.conditions.defaults.policy;
    },
    populate(conditions) {
        let _self = this;
        this.url = this.urlRoot + conditions.get("metadata") + "/" + conditions.get("policy");
        $.getJSON(_self.url).done((data) => {
            _self.set(data);
        });
    }
});

let DiffusionModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.diffusionBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
    },
    populate() {
        let _self = this,
            centralities = conf.static.centrality.centralities,
            centralityStat = conf.static.centrality.stat,
            conditions = arguments[0],
            edges = (arguments.length === 2 ?
                arguments[1] :
                this.get("edges"));
        this.url = this.urlRoot + conditions.get("policy");
        return $.getJSON(_self.url).done((data) => {
            // console.log(_self.url);
            let nodes = data.nodes;
            nodes.forEach((node, i) => {
                nodes[i]["centralities"] = centralities[node.stateId];
            });
            _self.set({
                "nodes": nodes,
                "edges": edges,
                "stat": data.stat,
                "cstat": centralityStat
            }, { silent: true });
            _self.trigger("change");
        });
    }
});

let PolicyGroupModel = Backbone.Model.extend({
    initialize() {
        this.url = conf.api.root + conf.api.policyGroupBase;
    },
    populate(conditions) {
        let _self = this;
        return $.getJSON(_self.url, {
            "method": conditions.get("method"),
            "param": conditions.get("param"),
            "start_year": conditions.get("startYear"),
            "end_year": conditions.get("endYear")
        }).done(data => {
            this.set(data, { silent: true });
            this.trigger("change");
        });
    }
});

let RingModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.ringBase;
    },
    toggleUrl(conditions) {
        this.url = this.urlRoot + conditions.get("method");
        return this.url;
    },
    populate(conditions) {
        let _self = this;
        this.toggleUrl(conditions);
        return $.getJSON(_self.url).done(data => {
            this.set({ "cluster": data });
        });
    }
});

let DiffusionModel2 = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.diffusionBase2;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
        
    },
    populate() {
        let _self = this,
            centralities = conf.static.centrality.centralities,
            centralityStat = conf.static.centrality.stat,
            conditions = arguments[0],
            edges = (arguments.length === 2 ?
                arguments[1] :
                this.get("edges"));
        this.url = this.urlRoot + conditions.get("policy");

        return $.getJSON(_self.url).done(data => {
            let nodes = data.nodes,
                edgesData = _self.setData(edges, nodes),
                nodesWithEdge = nodes.filter(function(d) { return d.adoptedYear !== 9999; });

            nodes.forEach((node, i) => {
                nodes[i]["centralities"] = centralities[node.stateId];
            });

            _self.set({
                "rawData": data,
                "nodes": nodes,
                "edges": edges,
                "data": edgesData,
                "nodesWithEdge": nodesWithEdge,
                "stateYear": _self.setStateYearData(nodes),
                "yearCount": _self.setYearCountData(nodesWithEdge),
                "dMatrix": _self.setMatrixData(nodes, edgesData),
                "stat": data.stat,
                "cstat": centralityStat,
                "conformingScore": _self.calculateConformingScore(edgesData)
                //"geoCorrelation": _self.calculateGeoCorrelation(edgesData)
            });
        });
    },
    setData: function(edgesData, nodes) {

        edgesData.map(function(edge) {
            edge.sourceStateInfo = {};
            edge.targetStateInfo = {};

            nodes.forEach(function(node) {
                if (edge.source == node.stateIndex) {
                    edge.sourceStateInfo.adoptedYear = node.adoptedYear;
                    edge.sourceStateInfo.metadata = node.metadata;
                    edge.sourceName = node.stateId;
                    edge.sourceCentralities = node.centralities;
                }
                if (edge.target == node.stateIndex) {
                    edge.targetStateInfo.adoptedYear = node.adoptedYear;
                    edge.targetStateInfo.metadata = node.metadata;
                    edge.targetName = node.stateId;
                    edge.targetCentralities = node.centralities;
                }
            });

            return edge;
        });

        return edgesData;
    },
    // For the coordinates of pcView
    setStateYearData: function(nodes) {
        var stateYear = {};
        nodes.filter(function(d, i) {
                return d.adoptedYear != 9999;
            })
            .forEach(function(d) { stateYear[d.stateId] = d.adoptedYear; });

        return stateYear;
    },
    setNodesWithEdges: function() {
        var _self = this;

        return _self.nodes.filter(function(d) { 
            return d.adoptedYear != 9999; 
        });
    },
    setYearCountData: function(nodesWithEdge) {
        var yearCount = [];

        nodesWithEdge.forEach(function(node) {
            var year_overlaps = yearCount.filter(function(d) { 
                    return node.adoptedYear == d.year; 
                });
            // if year_count does not have a year
            if (year_overlaps.length == 0 || year_overlaps == "undefined") {
                yearCount.push({
                    "year": node.adoptedYear,
                    "count": 1
                });
            } else { // If a year exists
                yearCount.forEach(function(d) {
                    if (d.year == node.adoptedYear) {
                        d.count += 1;
                    }
                });
            }
        });

        return yearCount;
    },
    calculateConformingScore: function(edgesData) {  // For each policy, How conforming and deviating edges are proportioned
        var conformingEdgeCount = 0, 
            deviatingEdgeCount = 0,
            wholeEdgeCount = edgesData.length,
            conformingScore = 0;

        edgesData.forEach(function(edge) {
            var sourceYear, targetYear;
            sourceYear = edge.sourceStateInfo.adoptedYear;
            targetYear = edge.targetStateInfo.adoptedYear;

            if(sourceYear <= targetYear)
                conformingEdgeCount = conformingEdgeCount + 1;
            else
                deviatingEdgeCount = deviatingEdgeCount + 1;
        });

        conformingScore = conformingEdgeCount / wholeEdgeCount;

        return conformingScore;
    },
    calculateGeoCorrelation: function(edgesData) {  // correlation between edge weight and geo-proximity
        var edgeWeights = [],
            geoDistances = [],
            edgeWeightsNormalized, geoDistancesNormalized;

        if(edgesData === undefined)
            return "None";

        edgesData.forEach(function(edge){
            // distance between source and target geo coordinates
            var geoDistance = Math.sqrt(
                                Math.pow(edge.gcoords.x1 - edge.gcoords.x2, 2)
                              + Math.pow(edge.gcoords.y1 - edge.gcoords.y2, 2)
                            );
            edgeWeights.push(edge.value);
            geoDistances.push(geoDistance);
        });

        // Normalize two arrays
        edgeWeightsNormalized = normalize(edgeWeights);
        geoDistancesNormalized = normalize(geoDistances);

        // console.log("edgeWeightsNormalized", edgeWeightsNormalized);
        // console.log("geoDistanceNormalized", geoDistancesNormalized);

        return "Okay";

        function normalize(arr) {
            // find the max value
            var m = 0;
            for(var x=0; x<arr.length; x++) m = Math.max(m, arr[x]);
            // find the ratio
            var r = max / m;
            // normalize the array
            for(var x=0; x<arr.length; x++) arr[x] = arr[x] * r;
            
            return arr;
        }
    },
    setMatrixData: function(nodes, edgesData) {
        var dMatrix = [];
        var years = nodes.filter(function(d){ return d.adoptedYear != 9999; })
                                .map(function(d){ return d.adoptedYear; });
        var yearArray = [];

        var minYear = d4.min(years),
            maxYear = d4.max(years);

        for(var i=minYear-1; i<=maxYear; i++){  // Start from minYear-1 for a dummy year as the leftmost dummy column
            yearArray.push(i);
        }

        edgesData = edgesData.filter(function(d){ return d.sourceStateInfo.adoptedYear != 9999 && d.targetStateInfo.adoptedYear != 9999; });

        // Initialize matrix
        nodes.forEach(function(node){
            yearArray.forEach(function(year){
               // Identify edges that are connected to the corresponding cell
               // sourceEdges = edges from sources to this node
               var inEdgeMatch = edgesData.filter(function(edge){
                   return edge.targetName == node.stateId
                       && edge.targetStateInfo.adoptedYear == year
                       && edge.sourceStateInfo.adoptedYear != 9999
                       && edge.targetStateInfo.adoptedYear != 9999; });

               // targetEdge = edges from this node to target
               var outEdgeMatch = edgesData.filter(function(edge){
                   return edge.sourceName == node.stateId
                       && edge.sourceStateInfo.adoptedYear == year
                       && edge.sourceStateInfo.adoptedYear != 9999
                       && edge.targetStateInfo.adoptedYear != 9999; });

               var cellArray = []; 

               cellArray.push({
                   isSource: false,
                   isTarget: false,
                   node: node.stateId,
                   year: year,
                   month: 0,
                   day: 1,
                   outEdges: [],  // this node is a source node, and the edge goes from this node
                   inEdges: []       // this node is a target node, and the edge goes to this node
               });

               // Add a dummy cell if year range is short enough to be equal to or less than 5
               // Don't assign dummy columns for the last year
               if (maxYear - minYear <= 5 && year !== yearArray[yearArray.length - 1]) {
                    cellArray.push({
                       isSource: false,
                       isTarget: false,
                       node: node.stateId,
                       year: year,
                       month: 2,
                       day: 1,
                       outEdges: [],
                       inEdges: []
                   });
                    cellArray.push({
                       isSource: false,
                       isTarget: false,
                       node: node.stateId,
                       year: year,
                       month: 4,
                       day: 1,
                       outEdges: [],
                       inEdges: []
                   });
                    cellArray.push({
                       isSource: false,
                       isTarget: false,
                       node: node.stateId,
                       year: year,
                       month: 6,
                       day: 1,
                       outEdges: [],
                       inEdges: []
                   });
                    cellArray.push({
                        isSource: false,
                        isTarget: false,
                        node: node.stateId,
                        year: year,
                        month: 8,
                        day: 1,
                        outEdges: [],
                        inEdges: []
                    });
                    cellArray.push({
                        isSource: false,
                        isTarget: false,
                        node: node.stateId,
                        year: year,
                        month: 10,
                        day: 1,
                        outEdges: [],
                        inEdges: []
                    });
               }
               else if (maxYear - minYear >= 5 && maxYear - minYear <= 10 && year !== yearArray[yearArray.length - 1]) {
                    cellArray.push({
                        isSource: false,
                        isTarget: false,
                        node: node.stateId,
                        year: year,
                        month: 3,
                        day: 1,
                        outEdges: [],
                        inEdges: []
                    });
                    cellArray.push({
                        isSource: false,
                        isTarget: false,
                        node: node.stateId,
                        year: year,
                        month: 6,
                        day: 1,
                        outEdges: [],
                        inEdges: []
                    });
                    cellArray.push({
                        isSource: false,
                        isTarget: false,
                        node: node.stateId,
                        year: year,
                        month: 9,
                        day: 1,
                        outEdges: [],
                        inEdges: []
                    });
            }
            else if (maxYear - minYear > 10 && maxYear - minYear <= 15 && year !== yearArray[yearArray.length - 1]) {
                cellArray.push({
                    isSource: false,
                    isTarget: false,
                    node: node.stateId,
                    year: year,
                    month: 4,
                    day: 1,
                    outEdges: [],
                    inEdges: []
                });
                cellArray.push({
                    isSource: false,
                    isTarget: false,
                    node: node.stateId,
                    year: year,
                    month: 8,
                    day: 1,
                    outEdges: [],
                    inEdges: []
                });
        }

               if(inEdgeMatch && inEdgeMatch.length != 0){
                   cellArray[0].isTarget = true;
                   cellArray[0].inEdges = inEdgeMatch;
               }
               if(outEdgeMatch && outEdgeMatch.length != 0){
                   cellArray[0].isSource = true;
                   cellArray[0].outEdges = outEdgeMatch;
               }

               dMatrix.push.apply(dMatrix, cellArray);
           });
        });

        return dMatrix;
    }
});
/**
 * Calculate and display the correlation between influence(attribute) ranking and socio-economic status(metadata) ranking for the selected policy
 */
let MetadataDropdownModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.diffusionBase2;  // 
        this.urlRootCorr = conf.api.root + conf.api.policyBase + conf.api.policyCorrelationBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
    },
    populate() {
        let _self = this,
            centralities = conf.static.centrality.centralities,
            centralityStat = conf.static.centrality.stat,
            conditions = arguments[0],
            edges = (arguments.length === 2 ?
                arguments[1] :
                this.get("edges"));
        this.url = this.urlRoot + conditions.get("policy");
        this.urlCorr = this.urlRootCorr + conditions.get("policy");

        return $.ajax({
            url: _self.urlCorr,
            type: "POST",
            dataType: "json",
            data: { centralities: centralities,
                    currentCentrality: conditions.get("centrality") 
            }
          }).done(data => {
                this.set(data);
                this.trigger('change');
            });
    }
});

module.exports = {
    Conditions: Conditions,
    PolicyModel: PolicyModel,
    PolicyOptionsModel: PolicyOptionsModel,
    PolicyDetailModel: PolicyDetailModel,
    PolicyTrendModel: PolicyTrendModel,
    PolicyNetworkModel: PolicyNetworkModel,
    GeoModel: GeoModel,
    NetworkModel: NetworkModel,
    DynamicNetworkModel: DynamicNetworkModel,
    ArcModel: ArcModel,
    DiffusionModel: DiffusionModel,
    StateModel: StateModel,
    PolicyGroupModel: PolicyGroupModel,
    RingModel: RingModel,
    DiffusionModel2: DiffusionModel2,
    MetadataDropdownModel: MetadataDropdownModel
};