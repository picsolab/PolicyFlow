let conf = require('../config.js');

let Conditions = Backbone.Model.extend({
    defaults: conf.models.conditions.defaults,
    initialize: () => {
    }
});

let PolicyModel = Backbone.Model.extend({
    url: () => {
        return conf.api.root + conf.api.policyBase + condition.get("policy");
    },
    populate: (conditions) => {
        let self = this;
        return $.get(self.url(conditions));
    }
});

let NetworkModel = Backbone.Model.extend({});

let StateModel = Backbone.Model.extend({});


module.exports = {
    Conditions: Conditions,
    PolicyModel: PolicyModel,
    NetworkModel: NetworkModel,
    StateModel: StateModel
};