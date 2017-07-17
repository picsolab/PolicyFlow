let conf = require('../config.js');

let Conditions = Backbone.Model.extend({
    defaults: conf.models.conditions.defaults,
    initialize: () => {},
    setupCentralityValidity() {
        let validity = this.get("metadata") === "centrality" || this.get("sequence") === "centrality";
        this.set("cvalidity", validity);
    },
    toggleTractList(tract) {
        let theListName = this.getTractListName(),
            theList = this.getTractList();
        if (_.indexOf(theList, tract) !== -1) {
            this.set(theListName, _.filter(theList, (o) => o !== tract));
        } else {
            this.set(theListName, _.concat(theList, tract));
        }
    },
    getTractList() {
        return this.get(this.getTractListName());
    },
    getTractListName() {
        return this.get("geoBase") + "List";
    }
});

let PolicyOptionsModel = Backbone.Model.extend({
    url: '/api/subjects'
});

let PolicyModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.policyBase;
        this.url = this.urlRoot + conf.bases.policy.default;
    },
    populate(conditions) {
        let _self = this;
        if (conditions.get("policy") === 'unselected') {
            _self.set({ "message": conf.bases.policy.default });
        } else {
            this.url = this.urlRoot + conditions.get("policy");
            $.getJSON(_self.url).done((data) => {
                _self.set(data);
            });
        }
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

let NetworkModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.networkBase;
        this.url = this.urlRoot + conf.models.conditions.defaults.policy;
    },
    populate(conditions) {
        let _self = this;
        this.url = this.urlRoot + conditions.get("policy");
        return $.getJSON(_self.url).done((data) => {
            // console.log(_self.url);
            _self.set({
                edges: conf.static.edgesInStateIds,
                nodes: data.nodes,
                stat: data.stat
            });
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
    populate(conditions) {
        let _self = this,
            centralities = conf.static.centrality.centralities,
            centralityStat = conf.static.centrality.stat;
        this.url = this.urlRoot + conditions.get("policy");
        return $.getJSON(_self.url).done((data) => {
            // console.log(_self.url);
            let nodes = data.nodes;
            nodes.forEach((node, i) => {
                nodes[i]["centralities"] = centralities[node.stateId];
            });
            _self.set({
                "nodes": nodes,
                "stat": data.stat,
                "cstat": centralityStat
            });
        });
    }
});


module.exports = {
    Conditions: Conditions,
    PolicyModel: PolicyModel,
    PolicyOptionsModel: PolicyOptionsModel,
    GeoModel: GeoModel,
    NetworkModel: NetworkModel,
    ArcModel: ArcModel,
    DiffusionModel: DiffusionModel,
    StateModel: StateModel
};