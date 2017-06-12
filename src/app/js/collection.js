let conf = require('../config.js');
let View = require('./view.js');
let Model = require('./model.js');

let ConditionsCollection = Backbone.Collection.extend({
    initialize() {
        this.views = [];
    },
    addNew(c) {

    },
    renderAll() {
        this;
    }
});

let SnapshotCollection = {
    conditionList: [],
    viewList: [],
    size: 0,
    container: "#snapshot-wrapper",
    initialize(diffusionView) {
        let _self = this,
            el = "#snapshot-view-0";
        $(_self.container).append('<svg id="' + _.trimStart(el, "#") + '" class="snapshot"></svg>');
        let itsConditions = diffusionView._attr.c,
            viewToBeAdded = new View.DiffusionView({
                el: "#snapshot-view-0",
                model: diffusionView.model
            });
        viewToBeAdded.render(itsConditions, false);
        this.viewList.push(viewToBeAdded);
        this.conditionList.push(itsConditions);
        this.size = 1;
    },
    add(theView, theConditions) {
        let _self = this,
            aModelCopy = theView.model.clone(),
            aConditionCopy = theConditions.clone();

        // unshift dom array
        _self.viewList.forEach((view, i) => {
            _self.viewList[i].$el.attr("id", "snapshot-view-" + (i + 1));
        });

        // prepend empty shapshot container
        $(_self.container).prepend('<svg id="snapshot-view-0" class="snapshot"></svg>');
        let newView = new View.DiffusionView({
            el: "#snapshot-view-0",
            model: aModelCopy
        });
        newView.render(aConditionCopy, false);

        // unshift a shadow copy of current condition, view at the front
        this.conditionList.unshift(aConditionCopy);
        this.viewList.unshift(newView);

        this.size++;
    },
    echo() {
        console.groupCollapsed("SnapshotCollection of size " + this.size);
        console.log(this.conditionList);
        console.log(this.viewList);
        this.conditionList.forEach((conditions) => {
            console.log(conditions.attributes);
        })
        console.groupEnd();
    }
}

module.exports = {
    ConditionsCollection: ConditionsCollection,
    SnapshotCollection: SnapshotCollection
}