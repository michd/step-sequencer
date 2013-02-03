/*global window: true, document: true*/
(function (App, $) {
  "use strict";
  var
    al = '/content/audio/2002DANC/',
    events = App.eventDispatcher,
    sampleLibrary = [
      {label: "CLAP",     value: al + "CLAP.wav"},
      {label: "CL_HAT_2", value: al + "CL_HAT_2.wav"},
      {label: "CYM_REV",  value: al + "CYM_REV.wav"},
      {label: "FX_1",     value: al + "FX_1.wav"},
      {label: "HAT_1",    value: al + "HAT_1.wav"},
      {label: "HAT_2",    value: al + "HAT_2.wav"},
      {label: "HAT_3",    value: al + "HAT_3.wav"},
      {label: "HAT_5",    value: al + "HAT_5.wav"},
      {label: "HAT_6",    value: al + "HAT_6.wav"},
      {label: "HAT_7",    value: al + "HAT_7.wav"},
      {label: "KIK_10",   value: al + "KIK_10.wav"},
      {label: "KIK_14",   value: al + "KIK_14.wav"},
      {label: "KIK_1",    value: al + "KIK_1.wav"},
      {label: "KIK_2",    value: al + "KIK_2.wav"},
      {label: "KIK_3",    value: al + "KIK_3.wav"},
      {label: "KIK_4",    value: al + "KIK_4.wav"},
      {label: "KIK5",     value: al + "KIK5.wav"},
      {label: "KIK_7",    value: al + "KIK_7.wav"},
      {label: "KIK_8",    value: al + "KIK_8.wav"},
      {label: "KIK_9",    value: al + "KIK_9.wav"},
      {label: "KK6",      value: al + "KK6.wav"},
      {label: "OP_HA_8",  value: al + "OP_HA_8.wav"},
      {label: "OP_HAT_2", value: al + "OP_HAT_2.wav"},
      {label: "OP_HAT_3", value: al + "OP_HAT_3.wav"},
      {label: "OP_HAT_4", value: al + "OP_HAT_4.wav"},
      {label: "OP_HAT_5", value: al + "OP_HAT_5.wav"},
      {label: "OP_HAT_6", value: al + "OP_HAT_6.wav"},
      {label: "OP_HAT_7", value: al + "OP_HAT_7.wav"},
      {label: "OP_HAT_8", value: al + "OP_HAT_8.wav"},
      {label: "OP_HAT",   value: al + "OP_HAT.wav"},
      {label: "RIDE_CYM", value: al + "RIDE_CYM.wav"},
      {label: "RIM__2",   value: al + "RIM__2.wav"},
      {label: "RIM",      value: al + "RIM.wav"},
      {label: "SHAKER_2", value: al + "SHAKER_2.wav"},
      {label: "SHAKER_3", value: al + "SHAKER_3.wav"},
      {label: "SHAKER",   value: al + "SHAKER.wav"},
      {label: "SN_10",    value: al + "SN_10.wav"},
      {label: "SN11",     value: al + "SN11.wav"},
      {label: "SN_12",    value: al + "SN_12.wav"},
      {label: "SN_1",     value: al + "SN_1.wav"},
      {label: "SN_2",     value: al + "SN_2.wav"},
      {label: "SN_3",     value: al + "SN_3.wav"},
      {label: "SN4",      value: al + "SN4.wav"},
      {label: "SN_5",     value: al + "SN_5.wav"},
      {label: "SN__6",    value: al + "SN__6.wav"},
      {label: "SN_7",     value: al + "SN_7.wav"},
      {label: "SN_8",     value: al + "SN_8.wav"},
      {label: "SN_9",     value: al + "SN_9.wav"}
    ];

  $(document).ready(function () {
    var
      //Todo: ChannelManager, ui.TrackManager
      channels = [],
      uiTracks = [],
      $grid = $('#grid'),

      i;

    function reset() {
      //currentStep = 0;
      events.trigger('ui.transport.reset');

    }

    function play() {
      reset();
      //todo: use event
      App.tempo.toggle(true);
    }

    // Link up tempo component with playStep
    App.Tempo();


    $('#play').click(play);
    $('#stop').click(function () {
      reset();
      App.tempo.toggle(false);
    });

    //todo: trigger proper event
    $('#tempo').change(function () {
      $(this).val(App.tempo.setBpm(parseInt($(this).val(), 10)).getBpm());
    });


    // Listen to UI for sample replace requests
    events.subscribe('ui.sample.replace.requested', function (channelId, trackLabel) {

      var
        channel = channels[channelId],
        currentSampleUrl = channel.getSampleUrl();

      App.ui.dialogs.MultipleChoice({
        content:     'Replace sample #' + (channelId + 1) + ' for ' + trackLabel,
        choices:     sampleLibrary,
        cancellable: true,

        onChange: function (testSample) {
          channel.setSample(testSample);
        },

        onClose: function (result) {
          if (result === false) {
            channel.setSample(currentSampleUrl);
          } else {
            channel.setSample(result);
            events.trigger(
              'sample.changed.channel-' + channelId,
              [result, channel.getLabel()],
              App
           );
          }
        }

      }).spawn();
    });

    // Init pattern singleton
    App.Pattern();

    // Set up initial audio channels
    // TODO: ChannelManager
    channels[0] = new App.Channel(al + 'KIK_1.wav');
    channels[1] = new App.Channel(al + 'CLAP.wav');
    channels[2] = new App.Channel(al + 'HAT_7.wav');
    channels[3] = new App.Channel(al + 'OP_HAT.wav');
    channels[4] = new App.Channel(al + 'RIDE_CYM.wav');
    channels[5] = new App.Channel(al + 'SN_2.wav');

    // Set up some mothereffing UI tracks
    // TODO: TrackManager
    for (i = 0; i < channels.length; i += 1) {
      uiTracks[i] = new App.ui.Track(i);
      uiTracks[i].setLabel(channels[i].getLabel());
      $grid.append(uiTracks[i].getRow());
    }

  });
}(window.STEPSEQUENCER, window.jQuery));
