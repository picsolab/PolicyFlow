let conf = require('../config.js');

let Conditions = Backbone.Model.extend({
    defaults: conf.models.conditions.defaults,
    initialize: () => {},
    setupCentralityValidity() {
        let validity = this.get("metadata") === "centrality" || this.get("sequence") === "centrality";
        this.set("cvalidity", validity);
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
        if (conditions.get("policy") === 'centrality') {
            _self.set({ "message": conf.bases.policy.default });
        } else {
            this.url = this.urlRoot + conditions.get("policy");
            $.getJSON(_self.url).done((data) => {
                _self.set(data);
            });
        }
    }
});

let NetworkModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.networkBase;
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
        $.getJSON(_self.url).done((data) => {
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
    NetworkModel: NetworkModel,
    ArcModel: ArcModel,
    DiffusionModel: DiffusionModel,
    StateModel: StateModel
};