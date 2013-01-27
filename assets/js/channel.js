/*global window: true */
(function (App, document) {
  "use strict";

  /**
   * Defines a single channel in the sequencer, comprising of one audio sample.
   *
   * This can play with multiple audio instances to achieve polyphony.
   * Maximum number of voices can be set, as well as volume.
   *
   * @param {String} initSampleUrl URL of audio sample to initialize with
   */
  App.Channel = function (initSampleUrl) {

    // ## Private properties

    var
      /**
       * URL to sample loaded into this channel's audio instances
       * @type {String}
       */
      sampleUrl = (typeof initSampleUrl === 'string') ? initSampleUrl : '',

      /**
       * Label for display in the UI
       * @type {String}
       */
      label = '',

      /**
       * Maximum number of audio instances playing simultaneously
       * This also simply means the number of instances for the
       * audioInstances array
       * @type {Number}
       */
      maxPolyphony = 16,

      /**
       * Holds all the HtmlAudioElement instances, most recently triggered first
       * @type {Array}
       */
      audioInstances = [],

      /**
       * Volume value set for the audio instances for this channel.
       * Ranges from 0.0 to 1.0
       * @type {Number}
       */
      volume = 1,

      /**
       * Whether or not this channel should play at all.
       * @type {Boolean}
       */
      enabled = true,

      /**
       * Reference to self for in functions
       * @type {App.Channel}
       */
      self = this;


    // Force instation before continuing

    if (this.constructor !== App.Channel) {
      return new App.Channel(initSampleUrl);
    }


    // ## Private methods

    /**
     * Creates and returns a new HtmlAudioElement with the current
     * channel settings (sampleUrl, volume)
     *
     * @return {HtmlAudioElement}
     */
    function createAudioInstance() {

      var audio = document.createElement('audio');

      audio.src        = sampleUrl;
      audio.volume     = volume;
      audio.preload    = "auto";
      audio.autobuffer = "autobuffer";

      return audio;
    }


    /**
     * Semantic wrapper to check whether an audio instance is playing
     *
     * @param  {HtmlAudioElement} audioInstance
     * @return {Boolean}
     */
    function isPlaying(audioInstance) {
      return !audioInstance.paused;
    }


    /**
     * Finds and returns the next audio instance that is not currently playing.
     * If all of them are playing, returns the one that started playing longest
     * ago.
     *
     * @return {HtmlAudioElement}
     */
    function getNextAudioInstance() {

      var i;

      for (i = 0; i < audioInstances.length; i += 1) {
        if (!isPlaying(audioInstances[i])) {
          return audioInstances[i];
        }
      }

      // No non-playing instances found, return bottom of the list,
      // as that started the longest ago
      return audioInstances[i - 1];

    }


    function setMostRecentAudioInstance(audioInstance) {

      // Remove the audioInstance from its current position in the array
      audioInstances.splice(
        audioInstances.indexOf(audioInstance),
        1
      );

      // Add it onto the beginning of the array
      audioInstances.unshift(audioInstance);

    }


    /**
     * Trigger play on a given audio instance.
     * If the audio instance was already playing, restarts playback from 0.
     *
     * @param  {HtmlAudioElement} audioInstance
     */
    function play(audioInstance) {

      if (isPlaying(audioInstance)) {
        // Reset to start
        audioInstance.currentTime = 0;
      }

      // Trigger play on the instance
      audioInstance.play();

      // Reorder array of audio instances so this is the top in the array
      setMostRecentAudioInstance(audioInstance);

    }


    /**
     * Makes all the audio instances up to date with current settings.
     * Trims or extends the audioInstances array based on maxPolyphony
     * Updates the volume setting and src on all the audio instances
     *
     * @param {Object} which - if specified, which properties get updated.
     *   Defaults to all.
     */
    function refreshPlayers(which) {

      var
        i,
        audioInstance,
        updatePolyphony = ((typeof which === 'object') && which.polyphony) || true,
        updateVolume = ((typeof which === 'object') && which.volume) || true,
        updateSrc    = ((typeof which === 'object') && which.src) || true;

      if (updatePolyphony) {

        // Lengthen or trim audioInstances array to match maxPolyphony
        if (maxPolyphony >= audioInstances.length) {

          // Add the current mismatch number in audio instances
          for (i = 0; i < maxPolyphony - audioInstances.length; i += 1) {
            audioInstances.push(createAudioInstance());
          }

        } else {

          // Remove the current mismatch number of the end of the array, stop them
          for (i = 0; i < audioInstances.length - maxPolyphony; i += 1) {

            audioInstance = audioInstances.pop();

            if (isPlaying(audioInstance)) {
              // Stop.
              audioInstance.pause();
              audioInstance.currentTime = 0;
            }
          }
        }
      }

      // Iterate over array of audio instances to update volume and source
      for (i = 0; i < audioInstances.length; i += 1) {

        audioInstance = audioInstances[i];

        if (updateVolume) {
          audioInstance.volume = volume;
        }

        if (updateSrc) {
          audioInstance.src = sampleUrl;
        }
      }
    }


    /**
     * Find out how many of the audio instances are currently playing
     *
     * @return {Number}
     */
    function getCurrentPolyphony() {

      var
        i,
        playingCount = 0;

      for (i = 0; i < audioInstances.length; i += 1) {
        if (isPlaying(audioInstances[i])) {
          playingCount += 1;
        }
      }

      return playingCount;

    }



    // ## Public interface methods

    /**
     * Updates the sample being used in this channel and refreshes the players
     *
     * @param {String} newSampleUrl path to a valid sample
     * @return {App.Channel} self
     */
    this.setSample = function (newSampleUrl) {

      if (typeof newSampleUrl !== 'string') {
        throw new TypeError(
          'setSample: newSampleUrl should be of type String, ' +
            typeof newSampleUrl + ' given.'
        );
      }

      sampleUrl = newSampleUrl;
      refreshPlayers({src: true});
      return self;

    };


    /**
     * Updates the label to be displayed in the UI for this channel
     *
     * @param {String} newLabel
     * @return {App.Channel} self
     */
    this.setLabel = function (newLabel) {

      if (typeof newLabel !== 'string') {
        throw new TypeError(
          'setLabel: newLabel should be of type String, ' +
            typeof newLabel + ' given.'
        );
      }

      label = newLabel;
      return self;

    };


    /**
     * Updates the volume at which this channel is played and
     * refreshes the players with this new config.
     *
     * @param {Number} newVolume [0.0-1.0]
     * @return {App.Channel} self
     */
    this.setVolume = function (newVolume) {

      if (typeof newVolume !== 'number') {
        throw new TypeError(
          'setVolume: newVolume should be of type Number, ' +
            typeof newVolume + ' given.'
        );
      }

      volume = Math.max(0, Math.min(newVolume, 1));
      refreshPlayers({volume: true});
      return self;

    };


    /**
     * Updates the maximum number of audio instances that can play at the same
     * time in this channel and subsequently refreshes players.
     *
     * @param {Number} newMaxPolyphony
     * @return {App.Channel} self
     */
    this.setMaxPolyphony = function (newMaxPolyphony) {

      if (typeof newMaxPolyphony !== 'number') {
        throw new TypeError(
          'setVolume: newMaxPolyphony should be of type Number, ' +
            typeof newMaxPolyphony + ' given.'
        );
      }

      maxPolyphony = Math.max(1, Math.min(Math.round(newMaxPolyphony), 16));
      refreshPlayers({polyphony: true});
      return self;
    };


    /**
     * Turn this channel on or off.
     * If a parameter is specified, a truthy value will enable the channel.
     * If no parameter is specified, it simply switches.
     *
     * @param  {Boolean} on
     * @return {App.Channel} self
     */
    this.toggle = function (on) {

      if (typeof on !== 'undefined') {
        enabled = !!on;
        return self;
      }

      enabled = !enabled;
      return self;
    };


    /**
     * Get the currently used sample url of this channel
     *
     * @return {String}
     */
    this.getSampleUrl = function () {
      return sampleUrl;
    };


    /**
     * Get the label (name) given to this channel
     *
     * @return {String}
     */
    this.getLabel = function () {
      return label;
    };


    /**
     * Get the maximum number of simultaneous audio instances of this channel
     *
     * @return {Number}
     */
    this.getMaxPolyphony = function () {
      return maxPolyphony;
    };


    this.getCurrentPolyphony = getCurrentPolyphony;


    /**
     * Get the volume this channel is set to
     *
     * @return {Number} [0.0-1.0]
     */
    this.getVolume = function () {
      return volume;
    };


    /**
     * Retrieve whether or not this channel is enabled (not muted)
     *
     * @return {Boolean}
     */
    this.isEnabled = function () {
      return enabled;
    };

    /**
     * Play this channel's sample on the next available audio instance
     * Don't play if channel is not enabled.
     *
     * @return {App.Channel} self
     */
    this.trigger = function () {

      if (!enabled) { return self; }

      play(getNextAudioInstance());
      return self;

    };


    // ## Initialization
    refreshPlayers();

  };

}(window.STEPSEQUENCER, window.document));
