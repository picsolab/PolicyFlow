let conf = require('../config.js');

let Conditions = Backbone.Model.extend({
    defaults: conf.models.conditions.defaults,
    initialize: () => {}
});

let PolicyOptionsModel = Backbone.Model.extend({
    url: '/api/policies'
});

let PolicyModel = Backbone.Model.extend({
    initialize() {
        this.urlRoot = conf.api.root + conf.api.policyBase;
        this.url = this.urlRoot + conf.bases.policy.default;
    },
    populate(conditions) {
        let _self = this;
        this.url = this.urlRoot + conditions.get("policy");
        $.getJSON(_self.url).done((data) => {
            _self.set(data);
        });
    }
});

let NetworkModel = Backbone.Model.extend({});

let StateModel = Backbone.Model.extend({});


module.exports = {
    Conditions: Conditions,
    PolicyModel: PolicyModel,
    PolicyOptionsModel: PolicyOptionsModel,
    NetworkModel: NetworkModel,
    StateModel: StateModel
};