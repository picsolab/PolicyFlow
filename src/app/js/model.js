let conf = require('../config.js');

let Conditions = Backbone.Model.extend({
    defaults: {
        subject: conf.bases.subject.default,
        policy: conf.bases.policy.default,
        metadata: conf.bases.yAttributeList[0].id,
        sequence: conf.bases.xAttributeList[0].id,
        centrality: conf.bases.centralityList[0].id,
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
        return $.getJSON(_self.url, {
            "method": conditions.get("method"),
            "param": conditions.get("param"),
            "iters": conditions.get("networkIters"),
            "start_year": conditions.get("startYear"),
            "end_year": conditions.get("endYear")
        }).done(data => {
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
            // console.log(_self.url);
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
    RingModel: RingModel
};