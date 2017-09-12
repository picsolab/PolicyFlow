const conf = require('../config.js');
let utils = require('./utils.js');

let View = require('./view.js');
let Model = require('./model.js');
let Collection = require('./collection.js');
let Router = require('./router.js');

let conditions = new Model.Conditions(),
    policyGroupModel = new Model.PolicyGroupModel(),
    policyModel = new Model.PolicyModel(),
    policyDetailModel = new Model.PolicyDetailModel(),
    policyTrendModel = new Model.PolicyTrendModel(),
    geoModel = new Model.GeoModel(),
    ringModel = new Model.RingModel(),
    networkModel = new Model.NetworkModel(),
    diffusionModel = new Model.DiffusionModel(),
    dynamicNetworkModel = new Model.DynamicNetworkModel(),
    sc = new Collection.SnapshotCollection(),
    appRouter = new Router.AppRouter();
let policyView = new View.PolicyView({
        model: policyModel
    }),
    policyDetailView = new View.PolicyDetailView({
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
    diffusionView = new View.DiffusionView({
        model: diffusionModel
    }),
    policyGroupView = new View.PolicyGroupView({
        model: policyGroupModel
    });

$(document).ready(() => {
    setupRenderingTriggers();

    setupRenderingControllers();

    initDom();

    bindDomEvents();

    initRendering();
});

function setupRenderingControllers() {
    conditions.on('change', () => {

        if (conditions.hasChanged('method')) {
            ringModel.populate(conditions);
            policyTrendModel.populate(conditions);
            if (!conditions.hasChanged('param')) {
                // force loading   
                policyGroupView.preRender();
                networkView.preRender();
                diffusionView.preRender();
                policyGroupModel.populate(conditions);
                dynamicNetworkModel.populate(conditions);
            }
        }
        if (conditions.hasChanged('policy')) {
            policyDetailModel.populate(conditions);
            policyModel.populate(conditions);
            geoModel.populate(conditions);
            if (!conditions.hasChanged("param")) {
                policyGroupView.updateSelection(conditions);
            }
            if (!(conditions.hasChanged("param") ||
                    conditions.hasChanged("startYear") ||
                    conditions.hasChanged("endYear"))) {
                networkModel.populate(conditions);
                diffusionModel.populate(conditions);
            }
        } else {
            if (conditions.hasChanged('centrality')) {
                if (conditions.get('metadata') === "centrality") {
                    diffusionView.doSort("metadata");
                }
                if (conditions.get('sequence') === "centrality") {
                    diffusionView.doSort("sequence");
                }
                networkView.update();
            }
            if (conditions.hasChanged('metadata')) {
                diffusionView.doSort("metadata");
                geoView.update();
                if (conditions.get("geoBase") === "state") {
                    networkView.update();
                }
            }
            if (conditions.hasChanged('sequence')) {
                diffusionView.doSort("sequence");
            }
            if (conditions.hasChanged('metadata') ||
                conditions.hasChanged('sequence') ||
                conditions.hasChanged('centrality')) {
                diffusionView.update();
            }
        }
        if (conditions.hasChanged("param")) {
            policyTrendModel.populate(conditions);
        }
        if (conditions.hasChanged("param") ||
            conditions.hasChanged("startYear") ||
            conditions.hasChanged("endYear")) {
            policyGroupView.preRender();
            networkView.preRender();
            diffusionView.preRender();
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
            networkView.update();
        }
        if (conditions.hasChanged('stateList') ||
            conditions.hasChanged('regionList')) {
            geoView.updateSelection();
            networkView.update();
        }
    });
}

function setupRenderingTriggers() {
    policyModel.on('change', () => {
        policyView.render();
    });

    networkModel.on('change', () => {
        networkView.render(conditions);
    });

    diffusionModel.on("change", () => {
        diffusionView.render(conditions);
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
        diffusionModel.populate(conditions, dynamicNetworkModel.get("edgesInIndices"));
    });

    policyGroupModel.on("change", () => {
        policyGroupView.render(conditions);
    });
}

function initRendering() {
    policyDetailView.render(conditions);
    ringModel.populate(conditions);
    policyTrendModel.populate(conditions);
    policyGroupModel.populate(conditions);
    policyModel.populate(conditions);
    geoModel.populate(conditions);
    dynamicNetworkModel.populate(conditions);
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

    // ring view click, update policy group
    $(ringView.el).on('click', e => {
        let seq = $(e.target).attr("seq"),
            seqList = seq.split("-");
        switch (conditions.get("method")) {
            case "subject":
                let subjectId = (seqList.length === 1 ?
                        conf.bases.subject.id :
                        seqList[1]),
                    subjectName = conf.pipe.subjectIdToName[subjectId];
                conditions.set({
                    "subject": subjectName,
                    "param": seq,
                    "policy": conf.bases.policy.default
                });
                break;
            case "text":
                conditions.set({
                    "param": seq,
                    "policy": conf.bases.policy.default
                });
                break;
            default:
                break;
        }
    });

    $("#policy-group-table").on('check.bs.table', (row) => {
        let selectedPolicy = $("#policy-group-table").bootstrapTable('getSelections');
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

    // set conditions:centrality from centrality dropdown
    document.getElementById("centrality-dropdown").addEventListener("click", function(e) {
        let __target = $(e.target),
            centrality = __target.attr("aid");
        if (centrality) {
            setupDropdown("#centrality-dropdown", centrality);
            conditions.set("centrality", centrality);
        }
    });

    // set conditions:metadata from metadata dropdown
    document.getElementById("metadata-dropdown").addEventListener("click", function(e) {
        let __target = $(e.target),
            metadata = __target.attr("aid");
        if (metadata) {
            setupDropdown("#metadata-dropdown", metadata);
            conditions.set("metadata", metadata);
        }
    });

    // setup x-seq to conditions
    $("#sequence-checkbox").on("switchChange.bootstrapSwitch", (e, state) => {
        if (state) {
            conditions.set("sequence", conf.bases.xAttributeList[0].id);
        } else {
            conditions.set("sequence", conf.bases.xAttributeList[1].id);
        }
    });

    $("#add-snapshot").on("click", (event) => {
        sc.add(diffusionView, conditions);
    });

    // policy-geo-controller
    $("#geo-controller-checkbox").on("switchChange.bootstrapSwitch", (e, state) => setTimeout(geoSwitchHandler, 350, e, state));

    document.getElementById("snapshot-wrapper").addEventListener('click', retrieveCascadeHandler, false);
}

function initDom() {
    // attributes drop down
    setupDropdown("#metadata-dropdown", conf.bases.yAttributeList[0].id);

    // centrality drop down
    setupDropdown("#centrality-dropdown", conf.bases.centralityList[0].id);

    // sequence switch
    $("#sequence-checkbox").bootstrapSwitch({
        size: "mini",
        onText: "Influence",
        offText: "AdoptionYear",
        onColor: "primary",
        offColor: "primary"
    });

    // geo switch
    $("#geo-controller-checkbox").bootstrapSwitch({
        size: "mini",
        onText: "State-wise",
        offText: "Regional",
        onColor: "primary",
        offColor: "primary"
    });

    setupCentralityDropdown();
}

/**
 * EventHandlers
 */

function retrieveCascadeHandler(e) {
    e.stopPropagation();
    let _curr = $(e.target),
        className = _curr.attr("class"),
        domId = _curr.attr("id"),
        isASnapshot = domId.includes("snapshot-view");

    if (isASnapshot) {
        let conditionId = +domId.split("-")[2],
            aConditionCopy = sc.conditionList[conditionId].clone();
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

/**
 * clear selection on dropdown specified by idSelector
 * @return {string} id field
 */
function clearDropdownSelection(idSelector) {
    let __activeOption = $(idSelector + " ul").find("li[class='active']");
    __activeOption.removeClass("active");
    return __activeOption.find("a").attr("class");
}

/**
 * mark corresponding option specified by `aid` at dropdown specified by `idSelector`
 * @param {strint} idSelector 
 * @param {string} aid 
 */
function markDropdownSelection(idSelector, aid) {
    let __element = $(idSelector + " ul").find("a[aid=" + aid + "]");
    __element.parent().addClass("active");
}

function recoverDomBy(conditions) {
    // recover method tab, ring view
    $("#method-tab-wrapper a[value=" + conditions.get("method") + "]").tab('show');

    // recover centrality dropdown
    setupDropdown("#centrality-dropdown", conditions.get("centrality"));

    // recover metadata dropdown
    setupDropdown("#metadata-dropdown", conditions.get("metadata"));

    // recover sequence switch
    switch (conditions.get("sequence")) {
        // centrality
        case conf.bases.xAttributeList[0].id:
            $("#sequence-checkbox").bootstrapSwitch("state", true);
            break;
        case conf.bases.xAttributeList[1].id:
            $("#sequence-checkbox").bootstrapSwitch("state", false);
            break;
        default:
            //none
            break;
    }

    setupCentralityDropdown();
}

function setupDropdown(idSelector, aid) {
    let toSelect = clearDropdownSelection(idSelector);
    if (toSelect !== aid) {
        markDropdownSelection(idSelector, aid);
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
        if (!$("#sequence-checkbox").bootstrapSwitch("state")) {
            // set it to true: "centrality"
            $("#sequence-checkbox").bootstrapSwitch("state", true);
            conditions.set('sequence', conf.bases.xAttributeList[0].id);
        }
    } else {
        conditions.setupCentralityValidity();
        let eitherCentralitySelected = conditions.get("cvalidity");
        if (eitherCentralitySelected) {
            $('#centrality-dropdown').removeClass("disabled");
        } else {
            $('#centrality-dropdown').addClass("disabled");
        }
    }
    $("#sequence-checkbox").bootstrapSwitch("disabled", isPolicyUnselected);
}