// event dispatcher component so we don't need jQuery for that
/*global window: true */
(function (App, Array, console) {
  "use strict";


  // ## Private variables

  var
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
    eventSubscribers = {},

    /**
     * Whether or not to console.log events as they are triggered
     * @type {Boolean}
     */
    logEvents = false,

    logIgnoredEvents = [];


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
      i, iMax,
      logThis = (logEvents && logIgnoredEvents.indexOf(eventName) === -1);

    // Arrayify data
    data = (data instanceof Array) ? data : [data];

    //Set a default value for `this` in the callback
    context = context || App;

    // No subscribers found for this event, don't bother.
    if (typeof subscribers === 'undefined') {

      if (logThis) {
        console.log('[EventDispatcher] No current subscribers for {' + eventName + '}');
      }

      return;
    }

    // Do some logging
    if (logThis) {
      console.log(
        '[EventDispatcher] {' +  eventName + '} triggered with data: ',
        data,
        ' and sent to {' + subscribers.length + '} subscribers.'
      );
    }

    for (i = 0, iMax = subscribers.length; i < iMax; i += 1) {
      subscribers[i].callback.apply(context, data);
    }

  }

  /**
   * Add a single subscribtion: callback function to list of subscribers
   * for eventName
   *
   * @param  {String}   eventName
   * @param  {Function} callback
   * @param  {Number} priority
   */
  function subscribeSingle(eventName, callback, priority) {

    var subscribers = eventSubscribers[eventName];

    priority = parseInt(priority || 0, 10);

    if (typeof subscribers === 'undefined') {
      subscribers = eventSubscribers[eventName] = [];
    }

    subscribers.push({callback: callback, priority: priority});

    // Re-sort subscribers so highest priority is first
    subscribers = subscribers.sort(function(a, b) {
      return b.priority - a.priority
    });
  }


  /**
   * Subscribe to a set of events with object syntax:
   * eventName: callback pairs
   *
   * @param  {Object} eventHash [description]
   */
  function subscribeHash(eventHash, priority) {

    var eventName;

    for (eventName in eventHash) {
      if (eventHash.hasOwnProperty(eventName)) {
        subscribeSingle(eventName, eventHash[eventName], priority);
      }
    }
  }


  /**
   * Add a callback function to the list of subscribers for this event
   *
   * @param  {String|Object} eventNameOrHash
   * @param  {Function} callback
   * @param {Number} priority
   */
  function subscribe(eventNameOrHash, callback, priority) {

    if (typeof eventNameOrHash === 'object') {
      return subscribeHash(eventNameOrHash);
    }

    return subscribeSingle(eventNameOrHash, callback);
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


  function toggleLogging(on) {
    logEvents = (typeof on === 'undefined') ? !logEvents : !!on;
  }


  // ## Intialize

  // Make sure console.log is a thing.
  if (typeof console === 'undefined') {
    console = {log: function () {}};
  }

  if (typeof console.log !== 'function') {
    console.log = function () {};
  }


  // ## Public interface

  App.eventDispatcher = {
    trigger:        trigger,
    subscribe:      subscribe,
    unsubscribe:    unsubscribe,
    unsubscribeAll: unsubscribeAll,
    enableLogging:  function () { toggleLogging(true); },
    disableLogging: function () { toggleLogging(false); },
    dontLog:        function (eventName) {
      if (logIgnoredEvents.indexOf(eventName) === -1) {
        logIgnoredEvents.push(eventName);
      }
    }
  };

}(window.STEPSEQUENCER, window.Array, window.console));