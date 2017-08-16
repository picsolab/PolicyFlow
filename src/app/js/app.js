const conf = require('../config.js');
let utils = require('./utils.js');

let View = require('./view.js');
let Model = require('./model.js');
let Collection = require('./collection.js');
let Router = require('./router.js');

let conditions = new Model.Conditions(),
    policyOptionsModel = new Model.PolicyOptionsModel(),
    policyGroupModel = new Model.PolicyGroupModel(),
    policyModel = new Model.PolicyModel(),
    geoModel = new Model.GeoModel(),
    ringModel = new Model.RingModel(),
    networkModel = new Model.NetworkModel(),
    diffusionModel = new Model.DiffusionModel(),
    dynamicNetworkModel = new Model.DynamicNetworkModel(),
    sc = Collection.SnapshotCollection,
    appRouter = new Router.AppRouter();
let policyView = new View.PolicyView({
        model: policyModel
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
        // updateHeader();

        if (conditions.hasChanged('method')) {
            ringModel.populate(conditions);
        }
        if (conditions.hasChanged('policy')) {
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
        if (conditions.hasChanged("param") ||
            conditions.hasChanged("startYear") ||
            conditions.hasChanged("endYear")) {
            preLoading();
            dynamicNetworkModel.populate(conditions);
            policyGroupModel.populate(conditions);
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

    policyOptionsModel.on("change", () => {
        updateSubjectAndPolicy(policyOptionsModel, conf.bases.subject.default, conf.bases.policy.default);
    });

    dynamicNetworkModel.on("change", () => {
        networkModel.set("edges", dynamicNetworkModel.get("edgesInStateIds"), { silent: true });
        diffusionModel.set("edges", dynamicNetworkModel.get("edgesInIndices"), { silent: true });
        networkModel.populate(conditions);
        diffusionModel.populate(conditions);
    });

    policyGroupModel.on("change", () => {
        policyGroupView.render(conditions);
    });
}

function initRendering() {
    ringModel.populate(conditions);
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
            "param": "0"
        });
        // policyGroupView.clear();
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

    // selected metadata to conditions
    $('#metadata-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set("metadata", conf.bases.yAttributeList[clickedIndex - 1].id);
    });

    // selected x-seq to conditions
    $('#sequence-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set("sequence", conf.bases.xAttributeList[clickedIndex - 1].id);
    });

    // selected centrality type to condition
    $('#centrality-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set("centrality", conf.bases.centralityList[clickedIndex - 1].id);
    });

    $("#add-snapshot").on("click", (event) => {
        sc.add(diffusionView, conditions);
    });

    $("#policy-geo-controller-wrapper").on('click', (event) => {
        conditions.set("geoBase", $(event.target).find('input').val());
    })

    document.getElementById("snapshot-wrapper").addEventListener('click', retrieveCascadeHandler, false);
}

function initDom() {
    // attributes select drop down
    initDropdowns($('#metadata-select'), "metadata-option", conf.bases.yAttributeList);

    // diffusion select drop down
    initDropdowns($('#sequence-select'), "sequence-option", conf.bases.xAttributeList);

    // centrality select drop down
    initDropdowns($("#centrality-select"), "centrality-option", conf.bases.centralityList);
    setupCentralityDropdown();
}

function preLoading() {
    networkView.$el.hide();
    diffusionView.$el.hide();
    $("#policy-network-wrapper .loader-img").show();
    $("#diffusion-wrapper .loader-img").show();
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

/** 
 * Utils
 */

function recoverDomBy(conditions) {
    // recover subject and policy dropdown
    // updateSubjectAndPolicy(policyOptionsModel, conditions.get("subject"), conditions.get("policy"));

    // recover method tab, ring view
    $("#method-tab-wrapper a[value=" + conditions.get("method") + "]").tab('show');

    // recover centrality dropdown
    $("#centrality-select").selectpicker('val', conditions.get("centrality"), { silent: true });

    // recover metadata and sequence
    $('#sequence-select').selectpicker('val', conditions.get("sequence"), { silent: true });
    $('#metadata-select').selectpicker('val', conditions.get("metadata"), { silent: true });

    setupCentralityDropdown();

}

// Update page header when conditions change
function updateHeader() {
    let headerStr = conditions.get("policy") === conf.bases.policy.default ?
        "Select a policy to get started." :
        policyOptionsModel.get("pipe")[conditions.get("policy")] + "<br/><small>" + conditions.get("subject") + "</small>";
    $('#page-header').html(headerStr);
}

function initDropdowns($element, className, attrList) {
    attrList.forEach((attr, index) => {
        $element.append("<option class='" + className + "' id='" + attr.domId + "' value='" + attr.id + "'>" + attr.description + "</option>");
    });
    $element.val(attrList[0].id);
    $element.prop('disabled', false);
    $element.selectpicker('refresh');
}

function setupCentralityDropdown() {
    let isPolicyUnselected = conditions.get("policy") === conf.bases.policy.default;
    if (isPolicyUnselected) {
        if ($('#sequence-select').selectpicker('val') !== "centrality") {
            $('#sequence-select').val("centrality");
            conditions.set('sequence', "centrality");
        }
    } else {
        conditions.setupCentralityValidity();
        let eitherCentralitySelected = conditions.get("cvalidity");
        $('#centrality-select').prop('disabled', !eitherCentralitySelected);
        $('#centrality-select').selectpicker('refresh');
    }
    $('#sequence-select').prop('disabled', isPolicyUnselected);
    $('#sequence-select').selectpicker('refresh');
}