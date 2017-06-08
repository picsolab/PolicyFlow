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

    networkModel.on('change', () => {
        networkView.render();
    });

    diffusionModel.on("change", () => {
        diffusionView.render();
    });

    conditions.on('change', () => {
        updateHeader();
        if (conditions.hasChanged('policy')) {
            policyModel.populate(conditions);
            diffusionModel.populate(conditions);
        }
        if (conditions.hasChanged('policy') || conditions.hasChanged('metadata')) {
            networkModel.populate(conditions);
        }
        if (conditions.hasChanged('metadata')) {
            diffusionView.doSort("metadata");
            diffusionView.update();
        }
        if (conditions.hasChanged('sequence')) {
            diffusionView.doSort("sequence");
            diffusionView.update();
        }
        if (conditions.hasChanged('metadata') || conditions.hasChanged('sequence')) {
            setupCentralityDropdown();
        }
        if (conditions.hasChanged('centrality')) {
            if (conditions.get('metadata') === "centrality") {
                diffusionView.doSort("metadata");
            }
            if (conditions.get('sequence') === "centrality") {
                diffusionView.doSort("sequence");
            }
            diffusionView.update();
        }
    });

    initDom();
    initRendering();
});

function initRendering() {
    // stateModel.fetch();
    policyModel.populate(conditions);
    networkModel.fetch();
    diffusionModel.populate(conditions);
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

    // selected centrality type to condition
    $('#centrality-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set("centrality", conf.bases.centralityList[clickedIndex - 1].id);
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

    // centrality select drop down
    initDropdowns($("#centrality-select"), "centrality-option", conf.bases.centralityList);
    setupCentralityDropdown();

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

function setupCentralityDropdown() {
    conditions.setupCentralityValidity();
    let eitherCentralitySelected = conditions.get("cvalidity")
    $('#centrality-select').prop('disabled', !eitherCentralitySelected);
    $('#centrality-select').selectpicker('refresh');
}