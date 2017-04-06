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
    initDom();

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

    initRendering();
});

function initRendering() {

    // BEGIN: for demo
    stateModel.set('detail', conf.mock.bar);
    networkModel.set('detail', conf.mock.net);
    // END: for demo

    policyModel.fetch();
    policyOptionsModel.fetch();
}

function bindEvents() {
    // selected subject to conditions
    $('#subject-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set('subject', conf.bases.subject.list[clickedIndex]);
        // console.log($(event.target).find('option')[clickedIndex].value);
    });

    // selected policy to conditions
    $('#policy-select').on('changed.bs.select', (event, clickedIndex, newValue, oldValue) => {
        conditions.set('policy', conf.bases.policy.list[clickedIndex]);
    });

    // selected metadata to conditions
    $("#metadata-radio label").click((event) => {
        conditions.set("metadata", $(event.target).find('input').val());
    });
}

function initDom() {
    // headers
    let headerStr = conf.pipe.policy[conf.bases.policy.default] + "&nbsp;<small>" + conf.bases.subject.default+"</small>";
    $('#page-header').html(headerStr);

    // subject select drop down
    conf.bases.subject.list.forEach(option => {
        $('#subject-select').append("<option value='" + option + "'>" + option + "</option>");
    });
    $('#subject-select').val(conf.bases.subject.default);
    $('#subject-select').selectpicker('refresh');

    // policy select drop down
    conf.bases.policy.list.forEach(option => {
        $('#policy-select').append("<option value='" + option + "'>" + conf.pipe.policy[option] + "</option>");
    });
    $('#policy-select').val(conf.bases.policy.default);
    $('#policy-select').selectpicker('refresh');

    bindEvents();
}

/*
 # Utils
 */

// Update page header when conditions change
function updateHeader() {
    let headerStr = conf.pipe.policy[conditions.get("policy")] + "&nbsp;<small>" + conditions.get("subject") + "</small>";
    $('#page-header').html(headerStr);
}