// event dispatcher component so we don't need jQuery for that
/*global window: true */
(function (App, Array) {
	"use strict";


	// ## Private variables

	/**
	 * Hash of event names and arrays of handler functions. Each function
	 * associated with an event name is called whenever that event is triggered
	 *
	 * Example:
	 * 'ui.channel.toggle': [
	 *   function,
	 *   function
	 * ]
	 *
	 * @type {Object}
	 */
	var eventSubscribers = {};


	// ## Private methods - however exposed through the public interface

	/**
	 * Triggers an event and sends it to all subscribers of that event
	 * If data is not an array, it will be wrapped in an array.
	 *
	 * @param  {String} eventName
	 * @param  {Array} data
	 * @param  {Object} context Will be available as `this` in callback
	 */
	function trigger(eventName, data, context) {
		var
			subscribers = eventSubscribers[eventName],
			i, iMax;

		// Arrayify data
		data = (data instanceof Array) ? data : [data];

		//Set a default value for `this` in the callback
		context = context || App;

		// No subscribers found for this event, don't bother.
		if (typeof subscribers === 'undefined') { return; }

		for (i = 0, iMax = subscribers.length; i < iMax; i += 1) {
			subscribers[i].apply(context, data);
		}
	}


	/**
	 * Add a callback function to the list of subscribers for this event
	 *
	 * @param  {String} eventName
	 * @param  {Function} callback
	 */
	function subscribe(eventName, callback) {
		var subscribers = eventSubscribers[eventName];

		if (typeof subscribers === 'undefined') {
			subscribers = eventSubscribers[eventName] = [];
		}

		subscribers.push(callback);
	}


	/**
	 * Remove a certain callback function from the subscribers
	 *
	 * The function provided mus be identical to the one passed to subscribe.
	 *
	 * @param  {String}
	 * @param  {Function} existingCallback
	 */
	function unsubscribe(eventName, existingCallback) {
		var
			subscribers = eventSubscribers[eventName],
			callbackIndex;

		// If we don't know this event, don't even worry about it.
		if (typeof subscribers === 'undefined') { return; }

		callbackIndex = subscribers.indexOf(existingCallback);

		// Not found among subscribers, don't even worry about it.
		if (callbackIndex === -1) { return; }

		//remove from subscribers
		subscribers.splice(callbackIndex, 1);
	}


	/**
	 * Unsubscribe all subscribers from an event
	 *
	 * @param  {String} eventName
	 */
	function unsubscribeAll(eventName) {
		delete eventSubscribers[eventName];
	}


	// ## Public interface

	App.eventDispatcher = {
		trigger:        trigger,
		subscribe:      subscribe,
		unsubscribe:    unsubscribe,
		unsubscribeAll: unsubscribeAll
	};

}(window.STEPSEQUENCER, window.Array));