'use strict';
/*jshint browser: true */

var io = require('socket.io-client');
var queryString = require('query-string');
var HtmlPlayer = require('./html-player');

var params = queryString.parse(location.search);

if (params.controller && params.sceneId) {
    connect(params.controller, params.sceneId);
} else {
    showForm();
}

function connect (controllerUrl, sceneId) {
    var socket = io(controllerUrl, {
        forceNew: true
    });

    var player = new HtmlPlayer(document.querySelector('#main'));

    player.on('mediaTransitioning', function(mediaObject) {
        socket.emit('mediaTransitioning', mediaObject.getId());
    });
    player.on('mediaDone', function(mediaObject) {
        socket.emit('mediaDone', mediaObject.getId());
    });

    function handleError (err) {
        if (err) {
            throw err;
        }
    }

    socket.on('connect', function() {
        console.log('socket connected');

        socket.on('showMedia', player.show.bind(player));

        socket.emit('playScene', params.sceneId);
    });

    socket.on('connect_error', handleError);
    socket.on('reconnect_error', handleError);
    socket.on('connect_error', handleError);
}

function showForm () {
    document.querySelector('#connection').classList.add('show');
    
    var form = document.querySelector('#connectionForm');
    ['controller', 'sceneId'].forEach(function(input) {
        form[input].value = params[input] || '';
    });
    
}