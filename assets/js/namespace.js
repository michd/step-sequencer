/*global window: true */
(function (global) {
  "use strict";

  var STEPSEQUENCER = typeof global.STEPSEQUENCER !== 'undefined'
    ? global.STEPSEQUENCER : {};

  STEPSEQUENCER.namespace = function (ns_string) {
    var
      parts = ns_string.split('.'),
      parent = STEPSEQUENCER,
      i = 0,
      iMax = 0;

    if (parts[0] === 'STEPSEQUENCER') {
      parts = parts.slice(1); //remove redundant top level namespace
    }

    for (i = 0, iMax = parts.length; i < iMax; i += 1) {
      if (typeof parent[parts[i]] === 'undefined') {
        //only create new object if part does not yet exist
        parent[parts[i]] = {};
      }
      parent = parent[parts[i]];
    }

    return parent;
  };

  global.STEPSEQUENCER = STEPSEQUENCER; //make app global

}(window));