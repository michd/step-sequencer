/*global window: true, document: true*/
(function (App, $) {
  "use strict";
  var
    al = '/content/audio/2002DANC/',
    events = App.eventDispatcher;

  $(document).ready(function () {
    var
      //Todo: ChannelManager
      channels = [],
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

    // Init time keeper
    App.Tempo();


    // Todo: simple ui transport module triggering events?
    $('#play').click(play);
    $('#stop').click(function () {
      reset();
      App.tempo.toggle(false);
    });

    //todo: trigger proper event
    $('#tempo').change(function () {
      $(this).val(App.tempo.setBpm(parseInt($(this).val(), 10)).getBpm());
    });


    // Init pattern singleton
    App.Pattern();

    // Init TrackManager singleton
    App.ui.TrackManager('#grid', '#trackmanager');

    // Set up initial audio channels
    // TODO: ChannelManager
    channels[0] = new App.Channel(al + 'KIK_1.wav');
    channels[1] = new App.Channel(al + 'CLAP.wav');
    channels[2] = new App.Channel(al + 'HAT_7.wav');
    channels[3] = new App.Channel(al + 'OP_HAT.wav');
    channels[4] = new App.Channel(al + 'RIDE_CYM.wav');
    channels[5] = new App.Channel(al + 'SN_2.wav');


  });
}(window.STEPSEQUENCER, window.jQuery));
