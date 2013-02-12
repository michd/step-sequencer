/*global window: true*/
// user interface track module
// Governs a single track (row) in the user interface
(function (App, $, setTimeout) {
  "use strict";

  var events = App.eventDispatcher;


  App.namespace('ui').Track = function (trackId) {


    // ## Private properties

    var
      /**
       * jQuery object containing the table row that is this track
       * @type {jQuery}
       */
      $tr = $('<tr>', {'data-track': trackId}),

      /**
       * Array containing step html elements (individual step squares)
       * @type {Array}
       */
      stepsCollection = [],

      /**
       * The number of steps to be displayed as a single beat (in one table cell)
       * @type {Number}
       */
      stepsPerBeat = 4,

      /**
       * How many beat td's should be in one measure
       * @type {Number}
       */
      beatsPerMeasure = 4,

      /**
       * How many measures should be displayed
       * @type {Number}
       */
      measures = 1,

      /**
       * Label for this track
       * @type {String}
       */
      trackName = 'Track #' + trackId,

      /**
       * Keep track of the full url of the sample for sample picking
       * @type {String}
       */
      sampleUrl,

      /**
       * Options for jQuery Kontrol's dial, used for the volume control
       * @type {Object}
       */
      dialOptions = {
        flatMouse: true,
        width: 45,
        height: 25,
        displayInput: true,
        bgColor: '#CDA28F',
        fgColor: '#240C00',
        angleOffset: -90,
        angleArc: 180
      },

      /**
       * Reference to self for in functions
       * @type {App.ui.Track}
       */
      self = this;


    // Force instantiation before continuing

    if (this.constructor !== App.ui.Track) {
      return new App.ui.Track(trackId);
    }


    // ## Private methods

    /**
     * Get the index value given a step html element
     *
     * @param  {HtmlElement} step
     * @return {Number}
     */
    function getStepIndex(step) {
      return stepsCollection.indexOf(step);
    }


    /**
     * Ensures the stepCollection is at the correct number of steps
     * The correct number of steps = stepsPerBeat * beatsPerMeasure * measures
     *
     * This is done by adding or removing steps to/from the array
     *
     */
    function correctStepsCollection() {

      var
        stepsNeeded = stepsPerBeat * beatsPerMeasure * measures,
        i, iMax;

      // If we already have the right amount of steps, don't bother.
      if (stepsNeeded === stepsCollection.length) { return; }

      // Add or remove steps as appropriate
      if (stepsNeeded >= stepsCollection.length) {

        // Add the current mismatch number in steps
        iMax = stepsNeeded - stepsCollection.length;
        for (i = 0; i < iMax; i += 1) {
          stepsCollection.push(
            $('<div>', {'class': 'step'})[0]
          );
        }

      } else {

        // Remote the current mismatch number off the end of the array
        // and from the tree.
        iMax = stepsCollection.length - stepsNeeded;
        for (i = 0; i < iMax; i += 1) {
          $(stepsCollection.pop()).remove();
        }
      }
    }


    /**
     * Redraws the row's contents to organize the steps, beats, and measures
     * correctly.
     */
    function redraw() {

      var
        iSteps,
        iBeats,
        iMeasures,
        evenMeasure,
        stepIndex = 0,
        $curTd;

      //Ensure we have the correct number of steps to spread through the row
      correctStepsCollection();

      // Remove existing td before adding new ones
      $tr.find('td').remove();

      // Build structure inside table row
      for (iMeasures = 0; iMeasures < measures; iMeasures += 1) {
        evenMeasure = (iMeasures % 2 !== 0);
        for (iBeats = 0; iBeats < beatsPerMeasure; iBeats += 1) {

          $curTd = $('<td>', {"class": (evenMeasure ? 'measure-even' : '')});

          for (iSteps = 0; iSteps < stepsPerBeat; iSteps += 1) {
            $curTd.append(stepsCollection[stepIndex]);
            stepIndex += 1;
          }

          $tr.append($curTd);
        }
      }

    }


    /**
     * Trigger volume changed event
     *
     * @param {Number} value
     */
    function updateVolume(value) {

      events.trigger(
        'ui.volume.changed',
        [trackId, value / 100],
        $tr.find('th .volume')[0]
      );
    }


    /**
     * Initializes the table row for the first time
     *
     * Sets up the th with toggle, volume control and label for the first time,
     * Sets up the steps divided over beats and measures through redraw()
     *
     * @todo Switch to using a template instead of ugly jQuery element creation
     * @todo (low priority) allow changing the track name
     */
    function initRow() {

      dialOptions.change = updateVolume;

      //set up row heading
      $tr.html(
        $('<th>').append(
          $('<input>', {type: 'checkbox', checked: 'checked'}),
          $('<input>', {type: 'text', 'class': 'volume', value: 100})
            .dial(dialOptions),
          $('<label>').html(trackName),
          $('<button>', {'class': 'remove'}).html('Remove'),
          $('<button>', {'class': 'replace'}).html('Replace')
        )
      );

      redraw();
    }


    // Internal UI event listeners using jQuery

    // Step clicked
    $tr.on('click', '.step', function () {

      var on = $(this).toggleClass('on').hasClass('on');

      // Trigger event on main event dispatcher
      events.trigger(
        'ui.step.toggled', // Event name
        [trackId, getStepIndex(this), on], // Params
        this // Context
      );

    });


    // Checkbox toggled
    $tr.on('change', 'th input[type=checkbox]', function () {

      var on = $(this).is(':checked');

      $tr.toggleClass('disabled', !on);

      events.trigger('ui.track.toggled', [trackId, on], this);

    });


    // Label clicked (edit)
    $tr.on('click', 'th label', function () {

      $(this).replaceWith(
        $('<input>', {type: 'text', value: $(this).html(), autofocus: 'autofocus'})
          .keypress(function (event) {

            // commit
            if (event.keyCode === 13) {
              trackName = $(this).val();
              $(this).replaceWith($('<label>').html(trackName));
              events.trigger('ui.label.updated', [trackId, $(this).val()]);
            }

            // cancel
            if (event.keyCode === 27) {
              $(this).replaceWith($('<label>').html(trackName));
            }
          })
          .blur(function (event) {
            $(this).replaceWith($('<label>').html(trackName));
          })
      );
    });

    // Replace button clicked
    $tr.on('click', 'th .replace', function () {

      App.ui.SamplePicker({
        content: 'Replace sample #' + (trackId + 1) + ' for ' + trackName,

        presetSample: sampleUrl,

        onChange: function (testSample) {
          events.trigger('ui.sample.try', [trackId, testSample]);
        },

        onClose: function (result) {
          if (result === false) {
            events.trigger('ui.sample.reset', trackId);
          } else {
            events.trigger('ui.sample.changed', [trackId, result]);
          }
        }
      });

    });

    // Remove button clicked
    $tr.on('click', 'th .remove', function () {

      App.ui.dialogs.OkCancel({

        content:          'Remove channel \'' + trackName + '\'?',
        okButtonText:     'Yes',
        cancelButtonText: 'No',

        onClose: function (removeConfirmed) {

          if (removeConfirmed) {
            events.trigger('ui.channel.removed', trackId);
          }
        }

      }).spawn();

    });


    // ## Public interface methods

    /**
     * Updates how many steps are displayed as part of one beat
     *
     * @param {Number} newStepsPerBeat
     */
    this.setStepsPerBeat = function (newStepsPerBeat) {

      if (typeof newStepsPerBeat !== 'number') {
        throw new TypeError(
          'setStepsPerBeat: newStepsPerBeat should of type Number, ' +
            typeof newStepsPerBeat + ' given.'
        );
      }

      stepsPerBeat = Math.round(newStepsPerBeat);
      redraw();
      return self;
    };


    /**
     * Updates how many beats one measure consists of (for display)
     *
     * @param {Number} newBeatsPerMeasure
     */
    this.setBeatsPerMeasure = function (newBeatsPerMeasure) {

      if (typeof newBeatsPerMeasure !== 'number') {
        throw new TypeError(
          'setBeatsPerMeasure: newBeatsPerMeasure should of type Number, ' +
            typeof newBeatsPerMeasure + ' given.'
        );
      }

      beatsPerMeasure = Math.round(newBeatsPerMeasure);
      redraw();
      return self;
    };


    /**
     * Updates how many measures should be displayed
     * @param {Number} newMeasures
     */
    this.setMeasures = function (newMeasures) {

      if (typeof newMeasures !== 'number') {
        throw new TypeError(
          'setBeatsPerMeasure: newMeasures should of type Number, ' +
            typeof newMeasures + ' given.'
        );
      }

      measures = Math.round(newMeasures);
      redraw();
      return self;
    };


    /**
     * Updates the label for this track
     *
     * @param {String} newLabel
     * @return {App.ui.Track} self
     */
    this.setLabel = function (newLabel) {
      trackName = newLabel;
      $tr.find('th label').html(trackName);
      return self;
    };


    /**
     * Updates the sample url for this track/channel
     *
     * @param {String} newSampleUrl
     * @return {App.ui.Track} self
     */
    this.setSampleUrl = function (newSampleUrl) {
      sampleUrl = newSampleUrl;
      return self;
    };


    /**
     * Updates the step component in the UI with the new on status
     *
     * @param {Number} stepIndex
     * @param {Boolean} on Whether the step is on in its new state
     * @return {App.ui.Track} self
     */
    this.toggleStep = function (stepIndex, on) {
      $(stepsCollection[stepIndex]).toggleClass('on', on);
      return self;
    };


    /**
     * Briefly highlight current step in the track.
     * If this step is active (plays its sample), briefly highlight the channel
     * name
     *
     * @param {Number} stepIndex
     * @return {App.ui.Track} self
     */
    this.stepTick = function (stepIndex) {
      var
        $step = $(stepsCollection[stepIndex]),
        on = $step.hasClass('on'),
        trackEnabled  = !$tr.hasClass('disabled');

      if (trackEnabled) {
        $tr.removeClass('flash').toggleClass('triggered', on);
      }

      $tr.find('.step').not($step).removeClass('triggered');
      $step.addClass('triggered');

      if (on && trackEnabled) {
        setTimeout(function () {
          $tr.addClass('flash').removeClass('triggered');
        }, 0);
      }

      return self;
    };


    /**
     * Update volume input value if external volume change comes through
     *
     * @param {Number} value
     * @return {App.ui.Track} self
     */
    this.setVolume = function (value) {

      var volumeInput = $tr.find('th .volume')[0];

      // We triggered this, so ignore
      if (this === volumeInput) { return self; }

      $(volumeInput).val(Math.round(value * 100));

      return self;
    };


    /**
     * Updates the disabled/enabled state of the track after making sure the
     * event did not originate here.
     *
     * @param {Boolean} on
     * @return {App.ui.Track} self
     */
    this.toggle = function (on) {

      var trackCheckbox = $tr.find('th input[type=checkbox]')[0];

      // Make sure the event doesn't originate from here
      if (trackCheckbox === this) { return self; }

      $(trackCheckbox).prop('checked', on); // (Un)check checkbox

      $tr.toggleClass('disabled', !on); // Enable or disable the row

      return self;
    };


    /**
     * Return the unique track identifier
     * @return {Number}
     */
    this.getTrackId = function () { return trackId; };


    /**
     * Get the jQuery row object for this track
     *
     * @return {jQuery}
     */
    this.getRow = function () {
      return $tr;
    };


    // ## Initialization

    initRow();
  };

}(window.STEPSEQUENCER, window.jQuery, window.setTimeout));
