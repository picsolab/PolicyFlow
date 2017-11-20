let View = require('./view.js');
let Model = require('./model.js');

let AppRouter = Backbone.Router.extend({
    routes: {
        "playground": "showPlayground",
        "playground/:viewName": "activateView"
    },
    initialize() {
        this._views = {};
        this._models = {};
    },
    showPlayground() {
        let playgroundView = this._views.playgroundView || (this._views.playgroundView = new View.PlaygroundView()),
            policyNetworkModel = this._models.policyNetworkModel || (this._models.policyNetworkModel = new Model.PolicyNetworkModel()),
            policyNetworkView = this._views.policyNetworkView || (this._views.policyNetworkView = new View.PolicyNetworkView({
                model: policyNetworkModel
            }));
        playgroundView.put("policyNetworkView", policyNetworkView);
        playgroundView.render();
    },
    activateView(viewName) {
        try {
            let playgroundView = this._views.playgroundView,
                theView = playgroundView.get(viewName);
            playgroundView.renderView(theView);
        } catch (e) {
            this.navigate("playground", { trigger: true, replace: true });
        }
    }
});

module.exports = {
    AppRouter: AppRouter
};