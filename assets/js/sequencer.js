/*global window: true, document: true*/
(function (App, $) {
  "use strict";
  var
    al = '/content/audio/2002DANC/',
    events = App.eventDispatcher;

  $(document).ready(function () {
    var
      steps = [[], [], [], [], [], [], []],
      channels = [],
      uiTracks = [],
      currentStep = 0,
      $grid = $('#grid'),
      i;

    function playStep() {

      var i;

      for (i = 0; i < steps.length; i += 1) {
        if (steps[i][currentStep]) {
          channels[i].trigger();
        }
      }
      events.trigger('step.tick', currentStep, App);

      currentStep += 1;
      //TODO needs to be more dynamic.
      if (currentStep > 15) { currentStep = 0; }
    }

    function reset() {
      currentStep = 0;
    }

    function play() {
      reset();
      App.tempo.toggle(true);
    }

    // Link up tempo component with playStep
    App.Tempo(playStep);


    $('#play').click(play);
    $('#stop').click(function () {
      reset();
      App.tempo.toggle(false);
    });

    $('#tempo').change(function () {
      $(this).val(App.tempo.setBpm(parseInt($(this).val(), 10)).getBpm());
    });


    // Listen to UI for step toggles
    events.subscribe('ui.step.toggled', function (channelId, stepIndex, on) {
      steps[channelId][stepIndex] = on;
    });


    // Listen to UI for channel toggles
    events.subscribe('ui.track.toggled', function (channelId, on) {
      channels[channelId].toggle(on);
    });

    // Listen to UI for volume changes
    events.subscribe('ui.volume.changed', function (channelId, newVolume) {
      channels[channelId].setVolume(newVolume);
    });


    // Set up initial audio channels
    channels[0] = new App.Channel(al + 'KIK_1.wav');//.setLabel('Kick');
    channels[1] = new App.Channel(al + 'CLAP.wav');//.setLabel('Clap');
    channels[2] = new App.Channel(al + 'HAT_7.wav');//.setLabel('Closed hihat');
    channels[3] = new App.Channel(al + 'OP_HAT.wav');//.setLabel('Open hihat');
    channels[4] = new App.Channel(al + 'RIDE_CYM.wav');//.setLabel('Ride').setVolume(0.4);
    channels[5] = new App.Channel(al + 'SN_2.wav');//.setLabel('Snare');

    // Set up some mothereffing UI tracks
    for (i = 0; i < channels.length; i += 1) {
      uiTracks[i] = new App.ui.Track(i);
      uiTracks[i].setLabel(channels[i].getLabel());
      $grid.append(uiTracks[i].getRow());
    }

  });
}(window.STEPSEQUENCER, window.jQuery));
