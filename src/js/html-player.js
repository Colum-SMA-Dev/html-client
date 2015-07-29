'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');
var ImageMediaObject = require('./media-object/image-media-object');
var VideoMediaObject = require('./media-object/video-media-object');
var TextMediaObject = require('./media-object/text-media-object');
var AudioMediaObject = require('./media-object/audio-media-object');

var mediaObjectConstructors = [
    ImageMediaObject,
    VideoMediaObject,
    TextMediaObject,
    AudioMediaObject
];

inherits(HtmlPlayer, EventEmitter);
module.exports = HtmlPlayer;

function getMediaObjectConstructor (type) {
    return _.find(mediaObjectConstructors, function(cons) {
        return cons.typeName === type;
    });
}

function HtmlPlayer (stageElement) {
    var activeMediaObjects = {},
        self = this;

    this.show = function(data) {
        var moObj = data.mediaObject;
        var ops = _.pick(data, ['transitionDuration', 'displayDuration']);
        var Klass = getMediaObjectConstructor(moObj.type);
        var mediaObject = new Klass(moObj, ops);
        console.log(mediaObject);

        activeMediaObjects[moObj._id] = mediaObject;

        mediaObject.on('done', moDoneHandler);
        mediaObject.on('transition', moTransitionHandler);

        mediaObject.makeElement(function() {
            mediaObject.onReady(function() {
                if (mediaObject instanceof ImageMediaObject || mediaObject instanceof TextMediaObject) {
                    stageElement.appendChild(mediaObject.element);
                    placeAtRandomPosition(mediaObject.element);
                }
                

                mediaObject.play();
                if (! (mediaObject instanceof AudioMediaObject)) {
                    mediaObject.element.classList.add('show-media-object');
                }
            });

            if (mediaObject instanceof VideoMediaObject) {
                stageElement.appendChild(mediaObject.element);
                placeAtRandomPosition(mediaObject.element);    
            }
        });
    };

    function moDoneHandler (mediaObject) {
        mediaObject.removeListener('done', moDoneHandler);
        if (mediaObject.element) {
            if (mediaObject.element.parentElement === stageElement) {
                stageElement.removeChild(mediaObject.element);    
            } else {
                console.log('mediaObject.element is not currently on the stage, should not have triggered moDoneHandler');
                console.log('element parent is ', mediaObject.element.parentElement);
            }
        } else {
            console.log('moDoneHandler called on mediaObject without element, shouldnt happen....');
        }
        self.emit('mediaDone', mediaObject);
    }

    function moTransitionHandler (mediaObject) {
        mediaObject.removeListener('transition', moTransitionHandler);
        // sometimes things can still be loading so, make sure there's an element 
        if (mediaObject.element) {
            mediaObject.element.classList.remove('show-media-object');
        }

        self.emit('mediaTransitioning', mediaObject);
    }

    function placeAtRandomPosition(element) {
        element.style.left = calcDimension('clientWidth', element);
        element.style.top = calcDimension('clientHeight', element);
    }

    function calcDimension(dim, element) {
        var elementDimensionSize = element[dim];

        var randomNonOverlapPosition = Math.random() * (stageElement[dim] - elementDimensionSize);
        // allow potential overlap of up to 30% of element's dimension
        var potentialOverlap = _.random(-0.3, 0.3) * elementDimensionSize;

        
        return Math.round(randomNonOverlapPosition + potentialOverlap) + 'px';
    }
}