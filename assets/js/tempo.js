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
   */
  App.Tempo = function () {


    // ## Private properties

    var

      // Constants

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
       * Minimum number of measures
       * @type {Number}
       */
      MIN_MEASURES = 1,

      /**
       * Maximum number of measures
       * @type {Number}
       */
      MAX_MEASURES = 16,


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
       * How many measures we're dealing with in the pattern
       * @type {Number}
       */
      measures = 1,

      /**
       * Total number of steps to iterate over
       * @type {Number}
       */
      totalSteps = measures * beatsPerMeasure * Math.round(STEPS_PER_WHOLE_NOTE / beatLength),

      /**
       * Current location in the pattern
       * @type {Number}
       */
      currentStep = -1,

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
       * Reference to self for in functions
       * @type {App.Tempo}
       */
      self = this;


    // Force instantiation before continuing

    if (this.constructor !== App.Tempo) {
      return new App.Tempo();
    }


    // ## Private methods

    /**
     * Updates the ms value of stepInterval based on bpm and beat length
     */
    function updateStepInterval() {
      stepInterval = ((60 * 1000) / bpm) / (STEPS_PER_WHOLE_NOTE / beatLength);
    }


    /**
     * Updates how many steps there are in the whole pattern,
     * triggers an event if it changed.
     */
    function updateSteps() {

      var newTotalSteps = measures * beatsPerMeasure *
          Math.round(STEPS_PER_WHOLE_NOTE / beatLength);

      if (totalSteps !== newTotalSteps) {
        events.trigger('tempo.totalsteps.change', newTotalSteps);
      }

      totalSteps = newTotalSteps;
    }


    /**
     * Triggered every (STEPS_PER_WHOLE_NOTE)th note.
     * Increases the current step and triggers tempo.step with that value
     */
    function step() {

      if (isPlaying) {
        stepTimeout = setTimeout(step, stepInterval);
      }

      currentStep += 1;

      if (currentStep > (totalSteps - 1)) {
        currentStep = 0;
      }

      events.trigger('tempo.step', currentStep);
    }


    // Event listener hooks

    /**
     * Begin playing from where-ever we left off.
     */
    function play() {
      isPlaying = true;
      step();
      events.trigger('tempo.started');
    }


    /**
     * Stop playing, but keep position.
     */
    function pause() {
      isPlaying = false;
      clearTimeout(stepTimeout);
      events.trigger('tempo.paused');
    }


    /**
     * Stop playing, reset position to start
     */
    function stop() {
      isPlaying = false;
      clearTimeout(stepTimeout);
      currentStep = -1; //reset
      events.trigger('tempo.stopped');
    }


    /**
     * Update the bpm setting after sanitizing and limiting.
     *
     * @param {Number} newBpm
     */
    function tempoChange(newBpm) {

      if (typeof newBpm !== 'number') {
        throw new TypeError(
          'tempoChange: newBpm should be of type Number, ' +
            typeof newBpm + ' given.'
        );
      }

      newBpm = Math.max(MIN_BPM, Math.min(newBpm, MAX_BPM));
      bpm = newBpm;
      updateStepInterval();

      events.trigger('tempo.updated', bpm);
    }



    /**
     * Update beatsPerMeasure and newBeatLength, and the update the step interval
     *
     * @param {Number} newBeatsPerMeasure Top part of time signature
     * @param {Number} newBeatLength Bottom part of time signature
     */
    function timeSignatureChange(newBeatsPerMeasure, newBeatLength) {

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
      // TODO: allow for more interesting time signatures, like having 3 steps per beat.
      beatLength = nearestIntResultDenominator(
        STEPS_PER_WHOLE_NOTE,
        Math.max(1, Math.min(Math.round(newBeatLength), STEPS_PER_WHOLE_NOTE))
      );

      events.trigger(
        'tempo.timesignature.beatlength.changed',
        beatLength
      );

      updateStepInterval();
      updateSteps();
    }


    /**
     * Event listener for when the UI decides we need more ore less measures
     * @param  {[type]} newMeasures [description]
     * @return {[type]}             [description]
     */
    function measuresChange(newMeasures) {

      measures = Math.min(
        MAX_MEASURES,
        Math.max(MIN_MEASURES, parseInt(newMeasures, 10))
      );

      updateSteps();

      events.trigger('tempo.measures.changed', measures);
    }


    // ## Initialization


    // Store instance in this file's closure for retrieval in case it gets
    // overridden.
    instance = this;
    App.tempo = instance;

    // Subscribe to some mothereffin events
    events.subscribe({
      'ui.transport.play':                 play,
      'ui.transport.pause':                pause,
      'ui.transport.stop':                 stop,
      'ui.transport.tempo.change':         tempoChange,
      'ui.transport.timesignature.change': timeSignatureChange,
      'ui.transport.measures.change':      measuresChange
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
