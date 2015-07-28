'use strict';
/*jshint browser: true */

var io = require('socket.io-client');
var queryString = require('query-string');

var params = queryString.parse(location.search);

var socket = io(params.controller, {
    forceNew: true
});

function handleError (err) {
    if (err) {
        throw err;
    }
}

socket.on('connect', function() {
    console.log('socket connected');

    socket.on('showMedia', function(data) {
        console.log(data);
    });

    socket.emit('loadScene', params.sceneId, function(err, scene) {
        handleError(err);
        if (! scene) {
            handleError('invalid sceneId passed in url parameters');
        }
        socket.emit('playScene', scene._id);
    });
});

socket.on('connect_error', handleError);
socket.on('reconnect_error', handleError);
socket.on('connect_error', handleError);




// var React = require('react');
// var Router = require('./viewer-router.jsx');
// var HubSendActions = require('./actions/hub-send-actions');

// HubSendActions.tryTokenLogin();

