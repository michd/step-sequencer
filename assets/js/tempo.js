/*global window: true*/
(function (App, Date, setTimeout, clearTimeout) {
  "use strict";

  var
    /**
     * Storage for the single App.Tempo instance once it's initialized
     * @type {App.Tempo}
     */
    instance,

    events = App.eventDispatcher;


  /**
   * Utility function used when sanitizing time signature input
   *
   * @param  {Number} numerator Assumed integer
   * @param  {Number} denominator Assumed integer
   * @return {Number} closest denominator that results in an integer quotient
   */
  function nearestIntResultDenominator(numerator, denominator) {

    var closest, i;

    //search lower than denominator
    for (i = denominator; i >= 1; i -= 1) {
      if (numerator % i === 0) {
        closest = i;
        break;
      }
    }

    // Search higher than denominator,
    // only as far as it isn't further off than the lower closest denominator
    for (i = denominator;
        i <= numerator &&
          Math.abs(denominator - i) < Math.abs(denominator - closest);
        i += 1
        ) {
      if (numerator % i === 0) {
        closest = i;
        break;
      }
    }

    //figure out which is closer
    return closest;
  }


  /**
   * Singleton tempo module, triggering steps at the correct interval, based on
   * beats per minute (BPM) tempo and time signatures. A step is a 16th note.
   *
   * Tempo will force instantiation and enforce single instance by overwriting
   * this constructor.
   *
   * @param {Function} stepCallback callback function run every step to init with
   * @todo Refactor so this module just triggers a tempo.tick event instead of
   * taking a callback
   * @todo Make this listen for ui play/pause/stop events to replace
   * public interface
   * @todo Make this listen for ui bpm change events to replace public interface
   */
  App.Tempo = function (stepCallback) {


    // ## Private properties

    var

      /**
       * Minimum value for bpm (beats per minute)
       * @type {Number}
       */
      MIN_BPM = 40,

      /**
       * Maximum value for bpm (beats per minute)
       * @type {Number}
       */
      MAX_BPM = 600,

      /**
       * Minimum value for the top part of the time signature
       * 1 is a functional minimum (unusable when less than that)
       * @type {Number}
       */
      MIN_BEATS_PER_MEASURE = 1,

      /**
       * Maximum value for the top part of the time signature.
       * This is pretty aribtrary, but 24 should be plenty.
       * @type {Number}
       */
      MAX_BEATS_PER_MEASURE = 24,

      /**
       * In how many usable steps should a whole note be divided?
       * Or:  what is the shortest note we can sequence?
       * @type {Number}
       */
      STEPS_PER_WHOLE_NOTE = 16,


      /**
       * Top part of the time signature, number of beats each measure consists of
       * @type {Number}
       */
      beatsPerMeasure = 4,

      /**
       * Bottom part of the time signature:
       * denominator of a whole note, to indicate how long a single beat lasts.
       * Example: 4 indicates a quarter note, 2 indicates half a note.
       * @type {Number}
       */
      beatLength = 4,

      /**
       * The tempo used in beats per minute
       * @type {Number}
       */
      bpm = 140,

      /**
       * Calculated time interval between steps in ms.
       * This value is calculated based on beatLength and bpm.
       * @type {Number}
       */
      stepInterval,

      /**
       * Whether or not the sequencer is currently playing, to know whether to
       * set new timeouts and trigger the callback function.
       * @type {Boolean}
       */
      isPlaying = false,

      /**
       * Timer storage for step delays, allowing clearing
       * @type {Number}
       */
      stepTimeout = null,

      /**
       * Function called every time step is executed, to interface with whatever
       * uses this module.
       * @type {Function}
       */
      callback = function () {},

      /**
       * Reference to self for in functions
       * @type {App.Tempo}
       */
      self = this;


    // Force instantiation before continuing

    if (this.constructor !== App.Tempo) {
      return new App.Tempo(stepCallback);
    }


    // ## Private methods

    /**
     * Updates the ms value of stepInterval based on bpm and beat length
     */
    function updateStepInterval() {
      stepInterval = ((60 * 1000) / bpm) / (STEPS_PER_WHOLE_NOTE / beatLength);
    }

    /**
     * Triggered every (STEPS_PER_WHOLE_NOTE)th note.
     * Runs the callback function if provided
     * and retriggers timeout if isPlaying is still true
     */
    function step() {

      if (isPlaying) {
        stepTimeout = setTimeout(step, stepInterval);
      }

      events.trigger('tempo.step');

      callback.call();
    }


    /**
     * Begin playing by setting the flag and triggering step, which will retrigger
     */
    function start() {
      isPlaying = true;
      step();
      events.trigger('tempo.started');
    }


    /**
     * Stop playing by unsetting the flag and clearing the timeout
     */
    function stop() {
      isPlaying = false;
      clearTimeout(stepTimeout);
      events.trigger('tempo.paused');
    }



    // ## Public interface methods

    /**
     * Update the bpm setting after sanitizing and limiting.
     *
     * @param {Number} newBpm
     * @return {App.Tempo} self
     */
    this.setBpm = function (newBpm) {

      if (typeof newBpm !== 'number') {
        throw new TypeError(
          'setTempo: newBpm should be of type Number, ' +
            typeof newBpm + ' given.'
        );
      }

      newBpm = Math.max(MIN_BPM, Math.min(newBpm, MAX_BPM));
      bpm = newBpm;
      updateStepInterval();

      events.trigger('tempo.updated', bpm);

      return self;
    };


    /**
     * Update beatsPerMeasure and newBeatLength, and the update the step interval
     *
     * @param {Number} newBeatsPerMeasure Top part of time signature
     * @param {Number} newBeatLength Bottom part of time signature
     * @return {App.Tempo} self
     */
    this.setTimeSignature = function (newBeatsPerMeasure, newBeatLength) {

      if (typeof newBeatsPerMeasure !== 'number') {
        throw new TypeError(
          'setTimeSignature: newBeatsPerMeasure should of type Number, ' +
            typeof newBeatsPerMeasure + ' given.'
        );
      }

      if (typeof newBeatLength !== 'number') {
        throw new TypeError(
          'setTimeSignature: newBeatLength should of type Number, ' +
            typeof newBeatLength + ' given.'
        );
      }

      //Sanitize the value
      beatsPerMeasure = Math.max(
        MIN_BEATS_PER_MEASURE,
        Math.min(Math.round(newBeatsPerMeasure), MAX_BEATS_PER_MEASURE)
      );

      events.trigger(
        'tempo.timesignature.beatspermeasure.changed',
        beatsPerMeasure
      );

      // Sanitize / correct beatLength so it works properly with this system
      beatLength = nearestIntResultDenominator(
        STEPS_PER_WHOLE_NOTE,
        Math.max(1, Math.min(Math.round(newBeatLength), STEPS_PER_WHOLE_NOTE))
      );

      events.trigger(
        'tempo.timesignature.beatlength.changed',
        beatLength
      );

      updateStepInterval();

      return self;
    };


    /**
     * Specify a new function to be called everytime step is triggered.
     * Pass null to not do anything.
     *
     * @param {Function|Null} newCallback [description]
     */
    this.setStepCallback = function (newCallback) {

      if (typeof newCallback !== 'null' && typeof newCallback !== 'function') {
        throw new TypeError(
          'setStepCallback: newCallback should of type Function or Null, ' +
            typeof newCallback + ' given.'
        );
      }

      callback = newCallback || function () {};
      return self;
    };


    /**
     * Switch the tempo ticker on or off.
     *
     * @param  {Boolean} on
     * @return {App.Tempo} self
     */
    this.toggle = function (on) {

      var newState = (typeof on !== 'undefined') ? !!on : !isPlaying;

      // No change, don't trigger anything
      if (newState === isPlaying) {
        return self;
      }

      if (newState) {
        start();
      } else {
        stop();
      }

      return self;
    };


    /**
     * Get the tempo in Beats per minute currently set
     *
     * @return {Number}
     */
    this.getBpm = function () {
      return bpm;
    };


    /**
     * Get the current time signature as an object, including a simple string
     * representation
     *
     * @return {Object}
     */
    this.getTimeSignature = function () {
      return {
        beatsPerMeasure: beatsPerMeasure,
        beatLength:      beatLength,
        simple:          beatsPerMeasure.toString() + '/' + beatLength.toString()
      };
    };


    /**
     * Retrieve whether or not the component is currently active and ticking
     *
     * @return {Boolean}
     */
    this.isPlaying = function () {
      return isPlaying;
    };



    // ## Initialization

    // If a step callback function was passed in the constructor, use the setter
    if (typeof stepCallback === 'function') {
      this.setStepCallback(stepCallback);
    }

    // Store instance in this file's closure for retrieval in case it gets
    // overridden.
    instance = this;
    App.tempo = instance;

    // Subscribe to some mothereffin events
    events.subscribe({
      'ui.transport.play': function () { self.toggle(true); },
      'ui.transport.pause': function () { self.toggle(false); },
      'ui.transport.stop': function () { self.toggle(false); },
      'ui.transport.tempo.change': this.setBpm,
      'ui.transport.timesignature.change': this.setTimeSignature
    });

    // Initialize step interval
    updateStepInterval();


    /**
     * Overriding constructor for Tempo, so it returns the existing instance.
     * Also makes sure App.tempo points at the instance.
     *
     * @return {App.Tempo}
     */
    App.Tempo = function () {

      if (App.tempo !== instance) {
        App.tempo = instance;
      }

      return instance;
    };
  };

}(window.STEPSEQUENCER, window.Date, window.setTimeout, window.clearTimeout));
