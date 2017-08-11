require('bootstrap-select');

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

    policyOptionsModel.on("change", () => {
        updateSubjectAndPolicy(policyOptionsModel, conf.bases.subject.default, conf.bases.policy.default);
    });

    dynamicNetworkModel.on("change", () => {
        networkModel.set("edges", dynamicNetworkModel.get("edgesInStateIds"), { silent: true });
        diffusionModel.set("edges", dynamicNetworkModel.get("edgesInIndices"), { silent: true });
        networkModel.populate(conditions);
        diffusionModel.populate(conditions);
    });

    conditions.on('change', () => {
        updateHeader();

        if (conditions.hasChanged('policy')) {
            policyModel.populate(conditions);
            networkModel.populate(conditions);
            diffusionModel.populate(conditions);
            geoModel.populate(conditions);
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
        if (conditions.hasChanged('policy') || conditions.hasChanged('metadata') || conditions.hasChanged('sequence')) {
            setupCentralityDropdown();
        }
        if (conditions.hasChanged('geoBase')) {
            geoView.toggleTract();
            networkView.update();
        }
        if (conditions.hasChanged('stateList') || conditions.hasChanged('regionList')) {
            geoView.updateSelection();
            networkView.update();
        }
        if (conditions.hasChanged("param") || conditions.hasChanged("startYear") || conditions.hasChanged("endYear")) {
            networkView.$el.hide();
            diffusionView.$el.hide();
            $("#policy-network-wrapper .loader-img").show();
            $("#diffusion-wrapper .loader-img").show();
            dynamicNetworkModel.populate(conditions);
        }
    });

    initDom();

    initRendering();
});

function initRendering() {
    // stateModel.fetch();
    policyModel.populate(conditions);
    geoModel.populate(conditions);
    dynamicNetworkModel.populate(conditions);
}

function bindEvents() {
    // selected subject to conditions
    $('#subject-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        let subjectList = Object.keys(policyOptionsModel.get("policies")),
            selectedSubject = $(event.target).find('option')[clickedIndex].value,
            policies = policyOptionsModel.get("policies"),
            pipe = policyOptionsModel.get("pipe");

        conditions.setSubject(subjectList[clickedIndex - 1]);
        // stateModel.populate(conditions);

        // reload policy select drop down
        $('#policy-select option.policy-option').remove();
        appendPolicyDefault();
        policies[selectedSubject].forEach(policyId => {
            $('#policy-select').append("<option class='policy-option' value='" + policyId + "'>" + pipe[policyId] + "</option>");
        });
        $('#policy-select').selectpicker('refresh');
        $('#policy-select').selectpicker('val', conf.bases.policy.default);
        conditions.set('policy', conf.bases.policy.default);
    });

    // selected policy to conditions
    $('#policy-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        let selectedPolicy = clickedIndex == 1 ? conf.bases.policy.default : policyOptionsModel.get("policies")[conditions.get("subject")][clickedIndex - 2]
        conditions.set('policy', selectedPolicy);
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

    $("#select-sort").on("change", (event) => {
        arcView.render(event.target.selectedIndex);
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

    policyOptionsModel.fetch();

    bindEvents();
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
    updateSubjectAndPolicy(policyOptionsModel, conditions.get("subject"), conditions.get("policy"));

    // recover centrality dropdown
    $("#centrality-select").selectpicker('val', conditions.get("centrality"), { silent: true });

    // recover metadata and sequence
    $('#sequence-select').selectpicker('val', conditions.get("sequence"), { silent: true });
    $('#metadata-select').selectpicker('val', conditions.get("metadata"), { silent: true });

    setupCentralityDropdown();

}

function updateSubjectAndPolicy(policyOptionsModel, subjectSelected, policySelected) {
    let pipe = policyOptionsModel.get("pipe"),
        policies = policyOptionsModel.get("policies");

    // subject select drop down
    $('#subject-select option.subject-option').remove();
    Object.keys(policies).forEach(subjectName => {
        $('#subject-select').append("<option class='subject-option' data-subtext=(" + policies[subjectName].length + ") value='" + subjectName + "'>" + (subjectName) + "</option>");
    });
    $('#subject-select').val(subjectSelected);
    $('#subject-select').prop('disabled', false);
    $('#subject-select').selectpicker('refresh');

    // policy select drop down
    $('#policy-select option.policy-option').remove();
    appendPolicyDefault();
    policies[subjectSelected].forEach(policyId => {
        $('#policy-select').append("<option class='policy-option' value='" + policyId + "'>" + pipe[policyId] + "</option>");
    });
    $('#policy-select').val(policySelected);
    $('#policy-select').prop('disabled', false);
    $('#policy-select').selectpicker('refresh');

    // headers
    updateHeader();
}

// Update page header when conditions change
function updateHeader() {
    let headerStr = conditions.get("policy") === conf.bases.policy.default ?
        "Select a policy to get started." :
        policyOptionsModel.get("pipe")[conditions.get("policy")] + "<br/><small>" + conditions.get("subject") + "</small>";
    $('#page-header').html(headerStr);
}

function appendPolicyDefault() {
    $('#policy-select').append("<option class='policy-option' value='" + conf.bases.policy.default+"'>" + conf.bases.policy.description + "</option>");
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
    let isPolicyUnselected = conditions.get("policy") === "unselected";
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