const conf = require('../config.js');

let View = require('./view.js');
let Model = require('./model.js');
let Router = require('./router.js');
let Collection = require('./collection.js');

let appRouter = new Router.AppRouter();
let conditions = new Model.Conditions(),
    policyGroupModel = new Model.PolicyGroupModel(),
    // policyModel = new Model.PolicyModel(),
    policyDetailModel = new Model.PolicyDetailModel(),
    policyTrendModel = new Model.PolicyTrendModel(),
    geoModel = new Model.GeoModel(),
    ringModel = new Model.RingModel(),
    networkModel = new Model.NetworkModel(),
    // diffusionModel = new Model.DiffusionModel(),
    diffusionModel2 = new Model.DiffusionModel2(),
    dynamicNetworkModel = new Model.DynamicNetworkModel(),
    snapshotCollection = new Collection.SnapshotCollection();
let policyDetailView = new View.PolicyDetailView({
        model: policyDetailModel
    }),
    policyTrendView = new View.PolicyTrendView({
        model: policyTrendModel
    }),
    geoView = new View.GeoView({
        model: geoModel
    }),
    ringView = new View.RingView({
        model: ringModel
    }),
    networkView = new View.NetworkView({
        model: networkModel
    }),
    // diffusionView = new View.DiffusionView({
    //     model: diffusionModel
    // }),
    diffusionView2 = new View.DiffusionView2({
        model: diffusionModel2
    }),
    policyGroupView = new View.PolicyGroupView({
        model: policyGroupModel
    }),
    attributeDropdown = new View.DropdownController({
        el: "#metadata-dropdown"
    }),
    factorDropdown = new View.DropdownController({
        el: "#factor-dropdown"
    }),
    influenceDropdown = new View.DropdownController({
        el: "#centrality-dropdown"
    }),
    nodeRelevanceSwitch = new View.BootstrapSwitchView({
        el: "#node-relevance-switch"
    }),
    geoSwitch = new View.BootstrapSwitchView({
        el: "#geo-switch"
    });
    // sequenceSwitch = new View.BootstrapSwitchView({
    //     el: "#sequence-switch"
    // });
    // policyView = new View.PolicyView({
    //     model: policyModel
    // })

$(document).ready(() => {
    setupRenderingTriggers();

    setupRenderingControllers();

    initDom();

    bindDomEvents();

    bindCrossViewEvents();

    initRendering();

    Backbone.history.start();
});

function setupRenderingControllers() {
    conditions.on('change', () => {

        if (conditions.hasChanged('method')) {
            ringModel.populate(conditions);
            policyTrendModel.populate(conditions);
            if (!conditions.hasChanged('param')) {
                // force loading   
                policyGroupModel.populate(conditions);
                dynamicNetworkModel.populate(conditions);
            }
        }
        if (conditions.hasChanged('policy')) {
            setupNav(conditions);
            policyDetailModel.populate(conditions);
            // policyModel.populate(conditions);
            geoModel.populate(conditions);
            if (!conditions.hasChanged("param")) {
                policyGroupView.updateSelection(conditions);
            }
            if (!(conditions.hasChanged("param") ||
                    conditions.hasChanged("startYear") ||
                    conditions.hasChanged("endYear"))) {
                networkModel.populate(conditions);
                // diffusionModel.populate(conditions);
                diffusionModel2.populate(conditions);
            }
            //diffusionModel2.populate(conditions);
        
        } else {
            if (conditions.hasChanged('factor')) {
                console.log(conditions.get('factor'));
                diffusionView2.doSort();
            }
            if (conditions.hasChanged('centrality')) {
                // // the inspection view is disabled when no policy has been selected, so do not update it's sub-component.
                // if (conditions.get('policy') !== conf.bases.policy.default) {
                //     if (conditions.get('metadata') === "centrality") {
                //         diffusionView.doSort("metadata");
                //     }
                //     if (conditions.get('sequence') === "centrality") {
                //         diffusionView.doSort("sequence");
                //     }
                // }
                networkView.preRender();
                networkView.update();
            }
            if (conditions.hasChanged('metadata')) {
                //diffusionView.doSort("metadata");
                geoView.update();
                if (conditions.get("geoBase") === "state") {
                    networkView.preRender();
                    networkView.update();
                }
            }
            // if (conditions.hasChanged('sequence')) {
            //     diffusionView.doSort("sequence");
            // }
            if (conditions.hasChanged('metadata') ||
                conditions.hasChanged('sequence') ||
                (conditions.hasChanged('centrality') &&
                    conditions.get('policy') !== conf.bases.policy.default)) {
                // diffusionView.update();
                diffusionView2.update();
            }
        }
        if (conditions.hasChanged("param")) {
            policyTrendModel.populate(conditions);
        }
        if (conditions.hasChanged("param") ||
            conditions.hasChanged("startYear") ||
            conditions.hasChanged("endYear")) {
            policyGroupModel.populate(conditions);
            dynamicNetworkModel.populate(conditions);
        }
        if (conditions.hasChanged('policy') ||
            conditions.hasChanged('metadata') ||
            conditions.hasChanged('sequence')) {
            setupCentralityDropdown();
        }
        if (conditions.hasChanged('geoBase')) {
            geoView.toggleTract();
            networkView.preRender();
            networkView.update();
        }
        if (conditions.hasChanged('stateList') ||
            conditions.hasChanged('regionList')) {
            geoView.updateSelection();
            networkView.preRender();
            networkView.update();
        }
    });
}

function setupRenderingTriggers() {
    // policyModel.on('change', () => {
    //     policyView.render();
    // });

    networkModel.on('change', () => {
        networkView.preRender();
        networkView.render(conditions);
    });

    // diffusionModel.on("change", () => {
    //     diffusionView.preRender();
    //     diffusionView.render(conditions);
    // });

    diffusionModel2.on("change", () => {
        diffusionView2.render(conditions);
    });

    geoModel.on("change", () => {
        geoView.render(conditions);
    });

    ringModel.on("change", () => {
        ringView.render(conditions);
    });

    policyDetailModel.on("change", () => {
        policyDetailView.render(conditions);
    });

    policyTrendModel.on("change", () => {
        policyTrendView.render(conditions);
    });

    dynamicNetworkModel.on("change", () => {
        networkModel.populate(conditions, dynamicNetworkModel.get("edgesInStateIds"));
        // diffusionModel.populate(conditions, dynamicNetworkModel.get("edgesInIndices"));
        diffusionModel2.populate(conditions, dynamicNetworkModel.get("edgesInIndices"));
    });

    policyGroupModel.on("change", () => {
        policyGroupView.preRender();
        policyGroupView.render(conditions);
    });
}

function initRendering() {
    policyDetailView.render(conditions);
    ringModel.populate(conditions);
    policyTrendModel.populate(conditions);
    policyGroupModel.populate(conditions);
    // policyModel.populate(conditions);
    geoModel.populate(conditions);
    dynamicNetworkModel.populate(conditions);
    //diffusionModel2.populate(conditions);
}

function bindDomEvents() {
    // toggle ring view
    $("#method-tab-wrapper").find('a[data-toggle="tab"]').on('click', function(e) {
        let __target = $(e.target) // newly activated tab
        conditions.set({
            "method": __target.attr("value"),
            "policy": conf.bases.policy.default,
            "param": "0",
            "startYear": 0,
            "endYear": 9999
        });
    });

    policyGroupView.$el.on('check.bs.table', (row) => {
        let selectedPolicy = policyGroupView.$el.bootstrapTable('getSelections');
        conditions.set('policy', selectedPolicy[0]["policy_id"]);
    });

    document.getElementById("policy-detail-wrapper").addEventListener("click", function(e) {
        if (e.target && e.target.nodeName.toUpperCase() == "TD") {
            let __tr = $(e.target).parent(),
                policyId = __tr.attr("pid");
            if (policyId) {
                conditions.set('policy', policyId);
                policyGroupView.updateSelection(conditions);
            }
        }
    });

    $("#policy-group-uncheck-btn").on('click', () => {
        conditions.set('policy', conf.bases.policy.default);
        policyGroupView.updateSelection(conditions);
    });

    // policy-explore-nav events
    document.getElementById("overview-tab").addEventListener('click', function() {
        // change label of attributeDropdown to `Attribute`
        attributeDropdown.label("Attribute");
        attributeDropdown.enable();
        influenceDropdown.enable();
        factorDropdown.disable();
    });

    document.getElementById("policy-inspection-tab").addEventListener('click', function() {
        // change label of attributeDropdown to `x-axis`
        attributeDropdown.disable();
        factorDropdown.enable();
        influenceDropdown.disable();
    });

    // set conditions:centrality from centrality dropdown
    document.getElementById("centrality-dropdown").addEventListener("click", function(e) {
        let centrality = $(e.target).attr("aid");
        if (centrality) {
            influenceDropdown.pickOption(centrality);
            conditions.set("centrality", centrality);
        }
    });

    // set conditions:factor from factor dropdown
    document.getElementById("factor-dropdown").addEventListener("click", function(e) {
        let factor = $(e.target).attr("aid");
        if (factor) {
            factorDropdown.pickOption(factor);
            conditions.set("factor", factor);
        }
    });

    // set conditions:metadata from metadata dropdown
    document.getElementById("metadata-dropdown").addEventListener("click", function(e) {
        let metadata = $(e.target).attr("aid");
        if (metadata) {
            attributeDropdown.pickOption(metadata);
            conditions.set("metadata", metadata);
        }
    });

    // // setup x-seq to conditions
    // sequenceSwitch.$switch().on("switchChange.bootstrapSwitch", (e, state) => {
    //     if (state) {
    //         conditions.set("sequence", conf.bases.xAttributeList[0].id);
    //     } else {
    //         conditions.set("sequence", conf.bases.xAttributeList[1].id);
    //     }
    // });

    // policy-geo-controller
    geoSwitch.$switch().on("switchChange.bootstrapSwitch", (e, state) => setTimeout(geoSwitchHandler, 350, e, state));

    nodeRelevanceSwitch.$switch().on("switchChange.bootstrapSwitch", (e, state) => {
        if (state) {
            conditions.set("nodeRelevance", conf.bases.nodeRelevance[0].id);
        } else {
            conditions.set("nodeRelevance", conf.bases.nodeRelevance[1].id);
        }
    });

    // $("#add-snapshot").on("click", () => {
    //     snapshotCollection.add(diffusionView, conditions);
    // });

    document.getElementById("snapshot-wrapper").addEventListener('click', retrieveCascadeHandler, false);
}

function bindCrossViewEvents() {
    // // lightup DiffusionView strokes from PolicyView
    // policyView.$el.on('mouseover', e => {
    //     let __target = $(e.target);
    //     if (__target.hasClass("state")) {
    //         // if __target is a rect
    //         let stateIndex = conf.pipe.statesToIndices[__target.attr("value")];
    //         diffusionView.lightUpStrokes(stateIndex);
    //     } else if (__target.hasClass("text-tip")) {
    //         // if __target is a `text`
    //         let stateIndex = conf.pipe.statesToIndices[__target[0].classList[2]];
    //         diffusionView.lightUpStrokes(stateIndex);
    //     }
    // });

    // // turnoff DiffusionVies strokes from PolicyView
    // policyView.$el.on('mouseout', e => {
    //     let __target = $(e.target);
    //     if (__target.hasClass("state")) {
    //         // if __target is a rect
    //         let stateIndex = conf.pipe.statesToIndices[__target.attr("value")];
    //         diffusionView.turnOffStrokes(stateIndex);
    //     } else if (__target.hasClass("text-tip")) {
    //         // if __target is a `text`
    //         let stateIndex = conf.pipe.statesToIndices[__target[0].classList[2]];
    //         diffusionView.turnOffStrokes(stateIndex);
    //     }
    // });

    // // lightup PolicyView squares from DiffusionView
    // diffusionView.$el.on('mouseover', e => {
    //     let __target = $(e.target);
    //     if (__target.hasClass("diffusion-strokes")) {
    //         // if __target is a stroke
    //         let sourceIndex = __target.attr("source"),
    //             targetIndex = __target.attr("target"),
    //             sourceNode = conf.static.states[+sourceIndex],
    //             targetNode = conf.static.states[+targetIndex];
    //         [sourceNode, targetNode].forEach(node => {
    //             policyView.lightUp(policyView.getRect(node));
    //         });
    //     }
    // });

    // // turnoff PolicyView squares from DiffusionView
    // diffusionView.$el.on('mouseout', e => {
    //     let __target = $(e.target);
    //     if (__target.hasClass("diffusion-strokes")) {
    //         // if __target is a stroke
    //         let sourceIndex = __target.attr("source"),
    //             targetIndex = __target.attr("target"),
    //             sourceNode = conf.static.states[+sourceIndex],
    //             targetNode = conf.static.states[+targetIndex];
    //         [sourceNode, targetNode].forEach(node => {
    //             policyView.turnOff(policyView.getRect(node));
    //         });
    //     }
    // });

    networkView.$el.on('mouseover', e => $(e.target).hasClass("network-node") && geoView.lightUp($(e.target).attr("title")));
    networkView.$el.on('mouseout', e => $(e.target).hasClass("network-node") && geoView.turnOff($(e.target).attr("title")));
    geoView.$el.on('mouseover', e => $(e.target).hasClass("state-tract") && networkView.lightUp($(e.target).attr("title")));
    geoView.$el.on('mouseout', e => $(e.target).hasClass("state-tract") && networkView.turnOff($(e.target).attr("title")));
}

function initDom() {
    // attributes drop down
    attributeDropdown.pickOption(conf.bases.yAttributeList[0].id);

    // centrality drop down
    influenceDropdown.pickOption(conf.bases.centralityList[0].id);

    // // sequence switch
    // sequenceSwitch
    //     .label("X-Axis")
    //     .align("right")
    //     .render({
    //         size: "mini",
    //         state: true,
    //         onText: "Influence",
    //         offText: "AdoptionYear",
    //         onColor: "primary",
    //         offColor: "primary"
    //     });

    // geo switch
    geoSwitch
        .align("right")
        .render({
            size: "mini",
            state: true,
            onText: "State-wise",
            offText: "Regional",
            onColor: "primary",
            offColor: "primary"
        });

    // relevant nodes switch
    nodeRelevanceSwitch
        .label("Hover")
        .align("left")
        .render({
            size: "mini",
            state: true,
            onText: conf.bases.nodeRelevance[0].description,
            offText: conf.bases.nodeRelevance[1].description,
            onColor: "primary",
            offColor: "primary"
        });

    setupCentralityDropdown();

    setupNav(conditions);
}

/**
 * EventHandlers
 */

function retrieveCascadeHandler(e) {
    e.stopPropagation();
    let __curr = $(e.target),
        domId = __curr.attr("id"),
        isASnapshot = domId.includes("snapshot-view");

    if (isASnapshot) {
        let conditionId = +domId.split("-")[2],
            aConditionCopy = snapshotCollection.conditionList[conditionId].clone();
        conditions.set(aConditionCopy.attributes);
        recoverDomBy(conditions);
    }
}

function geoSwitchHandler(e, state) {
    if (state) {
        conditions.set("geoBase", "state");
    } else {
        conditions.set("geoBase", "region");
    }
}

/** 
 * Utils
 */

function recoverDomBy(conditions) {
    // recover method tab, ring view
    $("#method-tab-wrapper a[value=" + conditions.get("method") + "]").tab('show');

    // recover factor dropdown
    factorDropdown.pickOption(conditions.get("factor"));

    // recover metadata dropdown
    attributeDropdown.pickOption(conditions.get("metadata"));

    // recover centrality dropdown
    influenceDropdown.pickOption(conditions.get("centrality"));

    // // recover sequence switch
    // switch (conditions.get("sequence")) {
    //     // centrality
    //     case conf.bases.xAttributeList[0].id:
    //         $("#sequence-checkbox").bootstrapSwitch("state", true);
    //         break;
    //     case conf.bases.xAttributeList[1].id:
    //         $("#sequence-checkbox").bootstrapSwitch("state", false);
    //         break;
    //     default:
    //         //none
    //         break;
    // }

    setupCentralityDropdown();
}

function setupNav(conditions) {
    if (conditions.get("policy") === conf.bases.policy.default) {
        // display `Overview` tab
        $('#policy-explore-wrapper>ul a[href="#network-views-wrapper"]').tab('show');
        // disable `Policy Inspection` tab
        $("#policy-inspection-tab").addClass("disabled");
        // disable `Attribute` dropdown
        attributeDropdown.disable();
        factorDropdown.disable();
    } else {
        // enable `Policy Inspection` tab
        $("#policy-inspection-tab").removeClass("disabled");
        // enable attributeDropdown
        attributeDropdown.enable();
    }
}

/**
 * Setup centrality dropdown and sequence switch according to current `conditions`.
 */
function setupCentralityDropdown() {
    let isPolicyUnselected = (conditions.get("policy") === conf.bases.policy.default);

    // if no policy has been selected, `sequence` can only be "centrality"
    if (isPolicyUnselected) {
        // if sequence switch is on AdoptionYear
        // if (!$("#sequence-checkbox").bootstrapSwitch("state")) {
        //     // set it to true: "centrality"
        //     $("#sequence-checkbox").bootstrapSwitch("state", true);
        //     conditions.set('sequence', conf.bases.xAttributeList[0].id);
        // }
    } else {
        if (conditions.setupCentralityValidity().get("cvalidity")) {
            // either attributeDropdown or the sequence switch is on 'centrality'
            influenceDropdown.enable();
        } else {
            // neither is on 'centrality'
            influenceDropdown.disable();
        }
    }
    // $("#sequence-checkbox").bootstrapSwitch("disabled", isPolicyUnselected);
}