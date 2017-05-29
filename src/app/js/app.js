require('bootstrap-select');

const conf = require('../config.js');
let utils = require('./utils.js');

let View = require('./view.js');
let Model = require('./model.js');
let Router = require('./router.js');

let conditions = new Model.Conditions(),
    policyOptionsModel = new Model.PolicyOptionsModel(),
    policyModel = new Model.PolicyModel(),
    networkModel = new Model.NetworkModel(),
    stateModel = new Model.StateModel(),
    arcModel = new Model.ArcModel(),
    diffusionModel = new Model.DiffusionModel(),
    appRouter = new Router.AppRouter();
let policyView = new View.PolicyView({
        model: policyModel
    }),
    networkView = new View.NetworkView({
        model: networkModel
    }),
    statBarView = new View.StatBarView({
        model: stateModel
    }),
    arcView = new View.ArcView({
        model: arcModel
    }),
    diffusionView = new View.DiffusionView({
        model: diffusionModel
    }),
    policyOptionsView = new View.PolicyOptionsView({
        model: policyOptionsModel
    });

$(document).ready(() => {

    policyModel.on('change', () => {
        policyView.render();
    });

    // stateModel.on('change', () => {
    //     statBarView.render();
    // });

    networkModel.on('change', () => {
        let arcViewSelected = $($("#view-selection-radio label")[0]).hasClass("active");
        if (arcViewSelected) {
            arcModel.set("nodes", networkModel.get("detail"));
        } else {
            networkView.render();
        }
    });

    diffusionModel.on("change", () => {
        diffusionView.render(0);
    });

    arcModel.on("change", () => {
        arcView.empty();
        arcView.render(conf.pipe.sortMethodId[$("#select-sort").val()]);
    });

    conditions.on('change', () => {
        updateHeader();
        if (conditions.hasChanged('policy')) {
            policyModel.populate(conditions);
        }
        if (conditions.hasChanged('policy') || conditions.hasChanged('metadata')) {
            networkModel.populate(conditions);
            diffusionModel.populate(conditions);
        }
    });

    initDom();
    initRendering();
});

function initRendering() {
    // stateModel.fetch();
    policyModel.populate(conditions);
    networkModel.fetch();
    // diffusionModel.fetch();
}

function bindEvents() {
    // selected subject to conditions
    $('#subject-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        let subjectList = Object.keys(policyOptionsModel.get("policies")),
            selectedSubject = $(event.target).find('option')[clickedIndex].value,
            policies = policyOptionsModel.get("policies"),
            pipe = policyOptionsModel.get("pipe");

        conditions.set('subject', subjectList[clickedIndex - 1], { silent: true });
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

    // select view
    $("#view-selection-wrapper label").click((event) => {
        _svgArc = $("#svg-arc-view").hide();
        _svgNetwork = $("#svg-network-view").hide();
        switch ($(event.target).find('input').val()) {
            case "arc":
                arcView.empty();
                arcView.render(conf.pipe.sortMethodId[$("#select-sort").val()]);
                _svgArc.show();
                $("#select-sort").show();
                break;
            case "network":
                $("#select-sort").hide();
                networkView.render();
                _svgNetwork.show();
                break;
            default:
                break;
        }
    });

    $("#select-sort").on("change", (event) => {
        arcView.render(event.target.selectedIndex);
    });
}

function initDom() {

    // attributes select drop down
    initDropdowns($('#metadata-select'), "metadata-option", conf.bases.yAttributeList);

    // diffusion select drop down
    initDropdowns($('#sequence-select'), "sequence-option", conf.bases.xAttributeList);

    policyOptionsModel.fetch({
        success(model, response, options) {

            let policies = model.get("policies")
            let pipe = model.get("pipe");

            // subject select drop down
            Object.keys(policies).forEach(subjectName => {
                $('#subject-select').append("<option data-subtext=(" + policies[subjectName].length + ") value='" + subjectName + "'>" + (subjectName) + "</option>");
            });
            $('#subject-select').val(conf.bases.subject.default);
            $('#subject-select').prop('disabled', false);
            $('#subject-select').selectpicker('refresh');

            // policy select drop down
            appendPolicyDefault();
            policies[conf.bases.subject.default].forEach(policyId => {
                $('#policy-select').append("<option class='policy-option' value='" + policyId + "'>" + pipe[policyId] + "</option>");
            });
            $('#policy-select').val(conf.bases.policy.default);
            $('#policy-select').prop('disabled', false);
            $('#policy-select').selectpicker('refresh');

            // headers
            updateHeader();
        }
    });

    bindEvents();
}

/*
 # Utils
 */

// Update page header when conditions change
function updateHeader() {
    let headerStr = conditions.get("policy") === conf.bases.policy.default ?
        "Select a policy to get started." :
        policyOptionsModel.get("pipe")[conditions.get("policy")] + "&nbsp;<small>" + conditions.get("subject") + "</small>";
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