/*global window: true*/
(function (App) {
  "use strict";

  var
    events = App.eventDispatcher,
    instance;

  App.ChannelManager = function () {

    // ## Private properties

    var
      /**
       * Holds all App.Channel objects
       * @type {Array}
       */
      channels = [],

      /**
       * Quick channelId: channels array index lookup hash
       * @type {Object}
       */
      channelIndex = {},

      /**
       * Reference to self for in functions
       * @type {App.ChannelManager}
       */
      self = this;


    // Force instantiation before continuing

    if (this.constructor !== App.ChannelManager) {
      return new App.ChannelManager();
    }


    // ## Private methods

    /**
     * Ensures the channelIndex lookup dictionary is up to date with the
     * channels array
     */
    function rehashChannelIndex() {

      var i;

      // Empty current index
      channelIndex = {};

      // Fill with current data
      for (i = 0; i < channels.length; i += 1) {
        channelIndex[channels[i].getId()] = i;
      }
    }


    /**
     * Retrieve a channel object from the channels array by its unique ID
     *
     * @param {Number} channelId
     * @return {App.Channel}
     */
    function getChannelById(channelId) {

      if (typeof channelIndex[channelId] === 'undefined') { return false; }

      if (typeof channels[channelIndex[channelId]] === 'undefined') {
        return false;
      }

      return channels[channelIndex[channelId]];
    }


    /**
     * Event listener hook for when a track gets toggled in the UI,
     * making sure it also toggles the relevant channel.
     *
     * @param {Number} channelId
     * @param {Boolean} on
     */
    function trackToggled(channelId, on) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.toggle(on);
    }


    /**
     * Event listener hook for when the volume on a track changes in the UI,
     * making sure that change is reflected in the relevant channel.
     *
     * @param  {Number} channelId
     * @param  {Number} newVolume
     */
    function volumeChanged(channelId, newVolume) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.setVolume(newVolume);
    }


    /**
     * Event listener hook for when the UI wants to try out a new sample
     * but not yet commit to it.
     *
     * @param  {Number} channelId
     * @param  {String} testSampleUrl
     */
    function sampleTry(channelId, testSampleUrl) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.trySample(testSampleUrl);
    }


    /**
     * Event listener hook for when the UI decided not to go with the sample
     * they just tried and wants to revert to what it was before.
     *
     * @param  {Number} channelId
     */
    function sampleReset(channelId) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.resetSample();
    }


    /**
     * Event listener hook for when the UI has decided on a new sample to use
     * for a channel.
     *
     * @param  {Number} channelId
     * @param  {String} newSampleUrl
     */
    function sampleChanged(channelId, newSampleUrl) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.setSample(newSampleUrl);
    }


    /**
     * Event listener hook for when something decides a channel should play
     * its set sample.
     *
     * @param  {Number} channelId
     */
    function channelTriggered(channelId) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      channel.trigger();
    }


    /**
     * Event listener for when the UI decides it wants to get rid of a channel
     * Removes the channel from
     * @param  {[type]} channelId
     * @return {[type]}
     */
    function channelRemoved(channelId) {

      var channel = getChannelById(channelId);

      if (channel === false) { return; }

      // Any cleanup the channel may have to do
      channel.remove();

      // Remove from the list
      channels.splice(channelIndex[channelId], 1);

      // Refresh the index
      rehashChannelIndex();
    }


    /**
     * Event listener hook for when the UI has decided to add a new channel into
     * the mix. Creates a new channel and adds it to the channels array.
     *
     * @param  {String} sampleUrl
     */
    function channelAddRequested(sampleUrl) {

      channels.push(new App.Channel(sampleUrl));
      rehashChannelIndex();
    }


    // ## Public interface methods

    /**
     * Allow programmatically adding channels
     *
     * @param {String} sampleUrl
     * @return {App.ChannelManager} self
     */
    this.addChannel = function (sampleUrl) {
      channelAddRequested(sampleUrl);
      return self;
    };


    // ## Initialization

    // Store instance in this file's closure for retrieval in case it gets
    // overridden.
    instance = this;
    App.channelManager = instance;

    // Subscribe to some mothereffin events
    events.subscribe({
      'ui.track.toggled':         trackToggled,
      'ui.volume.changed':        volumeChanged,
      'ui.sample.try':            sampleTry,
      'ui.sample.reset':          sampleReset,
      'ui.sample.changed':        sampleChanged,
      'ui.channel.removed':       channelRemoved,
      'ui.channel.add.requested': channelAddRequested
    });

    // High priority for channel triggered (that is, run our function first)
    events.subscribe('channel.triggered', channelTriggered, 10);


    /**
     * Overriding constructor for ChannelManager,
     * so it returns the existing instance.
     * Also make App.channelManager point at the instance
     *
     * @return {App.ChannelManager}
     */
    App.ChannelManager = function () {
      if (App.channelManager !== instance) {
        App.channelManager = instance;
      }

      return instance;
    };
  };

}(window.STEPSEQUENCER));
