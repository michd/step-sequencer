/*global window: true*/
(function (App, $) {
  "use strict";

  var
    /**
     * Storage for the single App.ui.Transport instance once it's initialized
     * @type {App.ui.Transport}
     */
    instance,

    events = App.eventDispatcher;

  App.namespace('ui');

  App.ui.Transport = function (containerSelector) {

    // ## Private properties

    var
      /**
       * Container which will hold all the buttons and whatnot
       * @type {jQuery}
       */
      $container = $(containerSelector || '#transport'),

      /**
       * Button to use for play as well as pause
       * @type {jQuery}
       */
      $playPauseButton = $('<button>', {'class': 'play icon-play'}),

      /**
       * Button for stopping playback
       * @type {jQuery}
       */
      $stopButton = $('<button>', {'class': 'stop icon-stop'}),

      /**
       * Input for BPM
       * @type {jQuery}
       */
      $tempoField = $('<input>', {
        'class': 'tempo',
        type: 'text',
        title: 'Tempo (BPM)',
        value: 140
      }),

      /**
       * Top field of the time signature
       * @type {jQuery}
       */
      $timeSigBeatsPerMeasure = $('<input>', {
        'class': 'time-sig',
        type: 'text',
        title: 'Time signature top number',
        value: 4
      }),

      /**
       * Bottom field of the time signature
       * @type {jQuery}
       */
      $timeSigBeatLength = $('<input>', {
        'class': 'time-sig',
        type: 'text',
        title: 'Time signature bottom number',
        value: 4
      }),

      /**
       * Field to set the number of measures
       * @type {jQuery}
       */
      $measures = $('<input>', {
        'class': 'measures',
        type: 'text',
        title: 'Number of measures to play with',
        value: 1
      });


    // Force instatiation before continuing
    if (this.constructor !== App.ui.Transport) {
      return new App.ui.Transport(containerSelector);
    }


    // ## Private methods

    /**
     * Event listener hook for when playback was started externally
     */
    function playStarted() {
      $playPauseButton.addClass('pause icon-pause').removeClass('play icon-play');
    }


    /**
     * Event listener hook for when the sequencer is paused/stopped externally
     */
    function pausedOrStopped() {
      $playPauseButton.addClass('play icon-play').removeClass('pause icon-pause');
    }


    /**
     * Event listener hook for when the tempo updates externally
     *
     * @param  {Number} newTempo
     */
    function tempoUpdated(newTempo) {
      $tempoField.val(newTempo);
    }


    /**
     * Event listener hook for when the time signature updates externally
     *
     * @param  {Number} newBeatsPerMeasure
     */
    function timeSignatureBeatsPerMeasureChanged(newBeatsPerMeasure) {
      $timeSigBeatsPerMeasure.val(newBeatsPerMeasure);
    }


    /**
     * Event listener hook for when the time signature updates externally
     *
     * @param  {Number} newBeatLength
     */
    function timeSignatureBeatLengthChanged(newBeatLength) {
      $timeSigBeatLength.val(newBeatLength);
    }


    /**
     * Event listener hook for when the measure count changes externally
     *
     * @param  {Number} newMeasureCount
     */
    function measuresChanged(newMeasureCount) {
      $measures.val(newMeasureCount);
    }

    // ## Public methods

    // ## Initialization

    // Store instance in this file's closure for retrieval in case it gets
    // overridden.
    instance = this;
    App.ui.transport = instance;


    // Set up bunch of event listeners for our jQuery components

    // Play / pause button
    $playPauseButton.click(function () {

      if ($(this).hasClass('play')) {
        events.trigger('ui.transport.play');
      } else {
        events.trigger('ui.transport.pause');
      }

    });

    // Stop button
    $stopButton.click(function () {
      events.trigger('ui.transport.stop');
    });

    // Tempo change
    $tempoField.change(function () {
      events.trigger('ui.transport.tempo.change', parseInt($(this).val(), 10));
    });

    // Time signature: Beats per measure
    $timeSigBeatsPerMeasure.change(function () {
      events.trigger(
        'ui.transport.timesignature.change',
        [parseInt($(this).val(), 10), parseInt($timeSigBeatLength.val(), 10)]
      );
    });

    // Time signature: Beat length
    $timeSigBeatLength.change(function () {
      events.trigger(
        'ui.transport.timesignature.change',
        [parseInt($timeSigBeatsPerMeasure.val(), 10), parseInt($(this).val(), 10)]
      );
    });

    // Number of measures
    $measures.change(function () {
      events.trigger('ui.transport.measures.change', parseInt($(this).val(), 10));
    });


    // Append these controls to the container
    $container.append(
      $playPauseButton,
      $stopButton,
      $('<label>', {'class': 'tempo'}).append(
        'Tempo: ',
        $tempoField,
        'BPM'
      ),
      $('<label>', {'class': 'time-sig'}).append(
        'Time signature: ', 
        $timeSigBeatsPerMeasure
      ),
      $('<label>', {'class': 'time-sig'}).append(' / ', $timeSigBeatLength),
      $('<label>', {'class': 'measures'}).append(
        'Measures: ',
        $measures
      )
    );


    // Subscribe to some mothereffin events
    events.subscribe({
      'tempo.started': playStarted,
      'tempo.paused':  pausedOrStopped,
      'tempo.stopped': pausedOrStopped,
      'tempo.updated': tempoUpdated,
      'tempo.timesignature.beatspermeasure.changed': timeSignatureBeatsPerMeasureChanged,
      'tempo.timesignature.beatlength.changed':      timeSignatureBeatLengthChanged,
      'pattern.measures.changed':                    measuresChanged
    });


    /**
     * Overriding constructor for ui.Transport,
     * so it returns the existing instance.
     * Also make App.ui.Transport point at the instance
     *
     * @return {App.ui.Transport}
     */
    App.ui.Transport = function () {

      if (App.ui.transport !== instance) {
        App.ui.transport = instance;
      }

      return instance;
    };
  };

}(window.STEPSEQUENCER, window.jQuery));