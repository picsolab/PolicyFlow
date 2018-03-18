let conf = require('../config.js');
let View = require('./view.js');
let Model = require('./model.js');
const gs = require('./graphSettings.js');

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

let SnapshotCollection = function() {
    this.conditionList = [];
    this.viewList = [];
    this.size = 0;
    this.container = "#snapshot-wrapper";
}

SnapshotCollection.prototype = Object.create({
    initialize(diffusionView) {
        let _self = this,
            el = "#snapshot-view-0";
        console.log("intialized?"); 
        $(_self.container).append('<svg id="' + _.trimStart(el, "#") + '" class="snapshot"></svg>');
        let itsConditions = diffusionView._attr.c,
            viewToBeAdded = new View.DiffusionView2({
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
            let _svg = _self.viewList[i].$el,
                _svgWrapper = _svg.parent();
            console.log("svgWrapper:", _svgWrapper);
            _svg.attr("id", "snapshot-view-" + (i + 1));
            _svgWrapper.attr("id", "snapshot-wrapper-" + (i + 1))
        });

        let rawHeight = gs.d.size.barHeight + gs.d.margin.top + gs.d.margin.bottom,
            rawWidth = gs.d.margin.left + gs.d.size.barWidth + gs.d.size.labelWidth + gs.d.size.pathWidth + gs.d.margin.right,
            scaledHeight = rawHeight * gs.d.multiplier.snapshot,
            scaledWidth = rawWidth * gs.d.multiplier.snapshot;

        // prepend empty shapshot container
        console.log("self.container", $(_self.container));
        $(_self.container).prepend('<div id="snapshot-wrapper-0" class="snapshot-wrapper"></div>');
        // let _svgWrapper = $(_self.container).find("#snapshot-wrapper-0");
        // _svgWrapper.prepend('<svg id="snapshot-view-0" class="snapshot"></svg>');
        let newView = new View.DiffusionView2({
            el: "#snapshot-wrapper-0",
            model: aModelCopy
        });
        newView.render(aConditionCopy, false);
        console.log(newView);
        console.log(aConditionCopy);

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
});

module.exports = {
    ConditionsCollection: ConditionsCollection,
    SnapshotCollection: SnapshotCollection
}