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
    appRouter = new Router.AppRouter();
let policyView = new View.PolicyView({
        model: policyModel
    }),
    networkView = new View.NetworkView({
        model: networkModel
    }),
    statBarView = new View.StatBarView({
        model: stateModel
    });

$(document).ready(() => {

    policyModel.on('change', () => {
        policyView.render();
    });

    stateModel.on('change', () => {
        statBarView.render();
    });

    networkModel.on('change', () => {
        networkView.render();
    })

    conditions.on('change', () => {
        updateHeader();
        if (conditions.hasChanged('policy')) {
            policyModel.populate(conditions);
        }
    });

    initDom();
    initRendering();
});

function initRendering() {

    // BEGIN: for demo
    stateModel.set('detail', conf.mock.bar);
    networkModel.set('detail', conf.mock.net);
    // END: for demo

    policyModel.fetch();
}

function bindEvents() {
    // selected subject to conditions
    $('#subject-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        console.log(clickedIndex);
        let subjectList = Object.keys(policyOptionsModel.get("policies")),
            selectedSubject = $(event.target).find('option')[clickedIndex].value,
            policies = policyOptionsModel.get("policies"),
            pipe = policyOptionsModel.get("pipe");

        conditions.set('subject', subjectList[clickedIndex - 1], { silent: true });

        // reload policy select drop down
        $('#policy-select option').remove();
        policies[selectedSubject].forEach(policyId => {
            $('#policy-select').append("<option value='" + policyId + "'>" + pipe[policyId] + "</option>");
        });
        $('#policy-select').selectpicker('val', policies[selectedSubject][0]);
        conditions.set('policy', policies[selectedSubject][0]);
        console.log(conditions.attributes);

    });

    // selected policy to conditions
    $('#policy-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set('policy', policyOptionsModel.get("policies")[conditions.get("subject")][clickedIndex]);
    });

    // selected metadata to conditions
    $("#metadata-radio label").click((event) => {
        conditions.set("metadata", $(event.target).find('input').val());
    });
}

function initDom() {

    policyOptionsModel.fetch({
        success(model, response, options) {
            console.log(model);
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
            policies[conf.bases.subject.default].forEach(policyId => {
                $('#policy-select').append("<option value='" + policyId + "'>" + pipe[policyId] + "</option>");
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
    let headerStr = policyOptionsModel.get("pipe")[conditions.get("policy")] + "&nbsp;<small>" + conditions.get("subject") + "</small>";
    $('#page-header').html(headerStr);
}