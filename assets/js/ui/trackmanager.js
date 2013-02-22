// TrackManager
// Responsibility: manage tracks (table rows) in the UI
// Create and remove tracks
// Keep references to tracks stored
// Set up add/remove buttons and event listeners for them
// Send out events when a track is added or removed

/*global window: true*/
(function (App, $) {
  "use strict";

  var
    events = App.eventDispatcher,
    instance;

  App.namespace('ui');


  /**
   * Singleton, manages ui.Track entries and directs relevant entries to actions
   * for the correct track.
   *
   * @param {String} gridSelector Selector for the table where tracks get added.
   * @param {String} controlsSelector Selector for element to add buttons to
   * @param {Object} options See defaultOptions
   */
  App.ui.TrackManager = function (gridSelector, controlsSelector, options) {

    // ## Private properties

    var
      /**
       * Constant number of steps that make up a whole note
       * @type {Number}
       */
      STEPS_PER_NOTE = 16,

      /**
       * Holds all App.ui.Track objects
       * @type {Array}
       */
      tracks = [],

      /**
       * Quick trackId: tracks array index lookup hash
       * @type {Object}
       */
      trackIndex = {},

      /**
       * Keep track of time signature for when creating new tracks
       * @type {Number}
       */
      beatsPerMeasure = 4,

      /**
       * Keep track of time signature for when creating new tracks
       * @type {Number}
       */
      stepsPerBeat = 4,

      /**
       * Keep track of number of measures for when creating new tracks
       * @type {Number}
       */
      measures = 1,

      /**
       * Reference to button used for adding a new track
       * @type {jQuery}
       */
      $addButton = $(),

      /**
       * Reference to button used for clearing the pattern
       * @type {[type]}
       */
      $clearButton = $(),

      /**
       * Container for any track management control buttons (addButton)
       * @type {jQuery}
       */
      $controls = $(controlsSelector || '#trackmanager'),

      /**
       * The table for all these tracks
       * @type {jQuery}
       */
      $grid = $(gridSelector || '#sequence'),

      /**
       * Eventual options object (from defaultOptions and options overrides)
       * @type {Object}
       */
      opts = {},

      /**
       * Default options the options parameter extends from
       * @type {Object}
       */
      defaultOptions = {
        trackClass:     'track',
        controlsClass:  'controls',
        patternClass:   'pattern',
        toggleClass:    'toggle',
        volumeClass:    'volume',
        indicatorClass: 'indicator',
        removeClass:    'remove',
        replaceClass:   'replace',
        measureClass:   'measure',
        beatClass:      'beat',
        stepClass:      'step',
        onClass:        'on',
        disabledClass:  'disabled',
        triggeredClass: 'triggered',

        icons: {
          'remove':  'icon-remove',
          'replace': 'icon-exchange'
        }
      };




    // Force instatiation before continuing

    if (this.constructor !== App.ui.TrackManager) {
      return new App.ui.TrackManager();
    }


    // ## Private methods

    /**
     * Ensures the trackIndex lookup dictionary is up to date with
     * the tracks array
     */
    function rehashTrackIndex() {

      var i;

      // Empty current index
      trackIndex = {};

      // Fill with current data
      for (i = 0; i < tracks.length; i += 1) {
        trackIndex[tracks[i].getTrackId()] = i;
      }
    }


    /**
     * Retrieve a ui track object from the track array by its unique ID
     *
     * @param {Number} trackId
     * @return {App.ui.Track}
     */
    function getTrackById(trackId) {

      if (typeof trackIndex[trackId] === 'undefined') { return false; }

      if (typeof tracks[trackIndex[trackId]] === 'undefined') {
        return false;
      }

      return tracks[trackIndex[trackId]];
    }


    /**
     * Event listener hook for when a new channel is added.
     * Creates a new UI track for said new channel.
     *
     * @param {Number} trackId Unique identifier for the channel/track
     * @param {String} label
     * @param {Number} volume (0-1)
     * @param {Boolean} on Whether this channel is currently enabled
     */
    function channelAdded(trackId, sampleUrl, label, volume, on) {

      var newTrack = getTrackById(trackId);

      if (newTrack === false) {

        // Track not found yet, so create it and add to index
        newTrack = new App.ui.Track(trackId);
        tracks.push(newTrack);
        rehashTrackIndex();

        newTrack.getUI().hide();
        // Add to the grid
        $grid.append(newTrack.getUI());

        newTrack.getUI().fadeIn(250, 'swing');
      }

      // Set correct UI values
      newTrack
        .setSampleUrl(sampleUrl)
        .setLabel(label)
        .setVolume(volume)
        .setBeatsPerMeasure(beatsPerMeasure)
        .setStepsPerBeat(stepsPerBeat)
        .setMeasures(measures)
        .toggle(on);

      stepsChanged();
    }


    /**
     * Event listener hook for when a channel gets removed.
     * Removes the ui Track from the DOM as well as the tracks array.
     *
     * @param {Number} trackId Unique ID
     */
    function channelRemoved(trackId) {

      var
        index = trackIndex[trackId],
        trackToRemove;

      //Not found?
      if (typeof index === 'undefined') { return; }

      // Remove from array
      trackToRemove = tracks.splice(index, 1)[0];
      rehashTrackIndex();

      // Remove from grid
      trackToRemove.getUI().animate({
        height: 0,
        opacity: 0
      },
        200,
        'swing',
        function () {
          $(this).remove();
        });
    }


    /**
     * Event listener hook for when a channel gets toggled.
     * This calls the toggle method on the corresponding Track instance.
     *
     * @param {Number} trackId
     * @param {Boolean} on
     */
    function channelToggled(trackId, on) {

      var track = getTrackById(trackId);

      if (track === false) { return; }

      track.toggle(on);
    }


    /**
     * Event listener hook for when a channel's sample gets played
     * This highlights the corresponding track
     *
     * @param  {Number} trackId
     */
    function channelTriggered(trackId) {

      var track = getTrackById(trackId);

      if (track === false) { return; }

      track.trigger();
    }


    /**
     * Event listener hook for when a channel's volume changes.
     * This calls the volume change method on the corresponding Track instance.
     *
     * @param {Number} trackId
     * @param {Number} newVolume (0-1)
     */
    function volumeChanged(trackId, newVolume) {

      var track = getTrackById(trackId);

      if (track === false) { return; }

      track.setVolume(newVolume);
    }


    /**
     * Event listener hook for when a channel's sample changes.
     * Updates the label on the corresponding Track instance.
     *
     * @param  {Number} trackId   [description]
     * @param  {String} sampleUrl (unused here)
     * @param  {String} label File name minus extension
     */
    function sampleChanged(trackId, sampleUrl, label) {

      var track = getTrackById(trackId);

      if (track === false) { return; }

      track.setSampleUrl(sampleUrl).setLabel(label);
    }


    /**
     * Event listener hook for when a step on a track gets toggled.
     * This calls the step toggle method on the corresponding Track instance.
     *
     * @param {Number} trackId
     * @param {Number} stepIndex
     * @param {Boolean} on
     */
    function stepToggled(trackId, stepIndex, on) {

      var track = getTrackById(trackId);

      if (track === false) { return; }

      track.toggleStep(stepIndex, on);
    }


    /**
     * Event listener hook when we tick another step.
     * Triggers the tick method on all tracks
     *
     * @param  {Number} stepIndex
     */
    function stepTick(stepIndex) {

      var
        $tracks = $grid.find('.' + opts.trackClass),
        $allSteps = $tracks.find('.' + opts.stepClass),
        $steps = $tracks.find('.' + opts.stepClass + ':eq(' + stepIndex.toString() + ')');

      $allSteps.not($steps).removeClass('triggered');
      $steps.addClass(opts.triggeredClass);
    }

    /**
     * Adjusts width when the steps have changed (measures or time sig)
     */
    function stepsChanged() {
      var
        $tracks = $grid.find('.' + opts.trackClass),
        $patterns = $tracks.find('.' + opts.patternClass),
        $controls = $tracks.find('.' + opts.controlsClass);

      $patterns.width(measures * ($patterns.find('.' + opts.measureClass + ':first-child').outerWidth()));
      $tracks.width($controls.outerWidth() + $patterns.outerWidth());
    }


    /**
     * Events listener hook when the time signature changes.
     *
     * @param  {Number} newBeatsPerMeasure
     */
    function beatsPerMeasureChanged(newBeatsPerMeasure) {
      var i;

      beatsPerMeasure = newBeatsPerMeasure;

      for (i = 0; i < tracks.length; i += 1) {
        tracks[i].setBeatsPerMeasure(newBeatsPerMeasure);
      }

      stepsChanged();
    }


    /**
     * Event listener hook for when the time signature changes.
     *
     * @param  {Number} newBeatLength
     */
    function beatLengthChanged(newBeatLength) {
      var
        i;

      stepsPerBeat = Math.round(STEPS_PER_NOTE / newBeatLength);

      for (i = 0; i < tracks.length; i += 1) {
        tracks[i].setStepsPerBeat(stepsPerBeat);
      }

      stepsChanged();
    }


    /**
     * Event listener hook for when the number of measures changes.
     *
     * @param  {Number} newMeasures
     */
    function measuresChanged(newMeasures) {
      var i;

      measures = newMeasures;

      for (i = 0; i < tracks.length; i += 1) {
        tracks[i].setMeasures(newMeasures);
      }

      stepsChanged();
    }

    /**
     * Event listener hook for when the tempo is stopped
     */
    function stopped() {
      var i;

      for (i = 0; i < tracks.length; i += 1) {
        tracks[i].clearTriggered();
      }
    }


    // ## Initialization

    // Store instance in this file's closure for retrieval in case it gets
    // overridden.
    instance = this;
    App.ui.trackManager = instance;

    // Load options properly
    opts = $.extend({}, defaultOptions, options);


    $addButton = $('<button>', {'class': 'icon-plus', title: 'Add channel'})
      .html(' Add channel')
      .click(function () {

        App.ui.SamplePicker({
          content: 'Select a sample for the new channel',

          onClose: function (result) {

            if (result === false) { return; }

            events.trigger('ui.channel.add.requested', result, instance);
          }
        });

      });

    $clearButton = $('<button>', {'class': 'icon-trash'})
      .html(' Clear pattern')
      .click(function () {

        // Confirm dialog
        App.ui.dialogs.OkCancel({
          content: 'Are you sure you want to clear the pattern? You can not undo this.',
          okButtonText: 'Yes',
          cancelButtonText: 'No',
          onClose: function (confirmed) {
            var i;

            if (confirmed) {
              events.trigger('ui.pattern.clear');

              for (i = 0; i < tracks.length; i += 1) {
                tracks[i].clearSteps();
              }
            }
          }
        }).spawn();

      });

    $controls.append($addButton, $clearButton);

    stepsChanged();


    // Subscribe to some mothereffin events
    events.subscribe({
      'channel.added':     channelAdded,
      'channel.removed':   channelRemoved,
      'channel.toggled':   channelToggled,
      'channel.triggered': channelTriggered,
      'volume.changed':    volumeChanged,
      'sample.changed':    sampleChanged,
      'step.toggled':      stepToggled,
      'tempo.step':        stepTick,
      'tempo.stopped':     stopped,
      'tempo.timesignature.beatspermeasure.changed': beatsPerMeasureChanged,
      'tempo.timesignature.beatlength.changed': beatLengthChanged,
      'tempo.measures.changed': measuresChanged
    });


    /**
     * Overriding constructor for TrackManager,
     * so it returns the existing instance.
     * Also make App.trackManager point at the instance
     *
     * @return {App.TrackManager}
     */
    App.ui.TrackManager = function () {
      if (App.ui.trackManager !== instance) {
        App.ui.trackManager = instance;
      }

      return instance;
    };
  };

}(window.STEPSEQUENCER, window.jQuery));
