/*global window: true, document: true*/
(function (App, $) {
  "use strict";
  var
    al = '/content/audio/2002DANC/',
    events = App.eventDispatcher;

  $(document).ready(function () {

    function reset() {
      events.trigger('ui.transport.reset');
    }

    function play() {
      reset();
      //todo: use event
      App.tempo.toggle(true);
    }

    // Init time keeper singleton
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

    // Init ChannelManager singleton and add some initial channels
    App.ChannelManager()
      .addChannel(al + 'KIK_1.wav')
      .addChannel(al + 'CLAP.wav')
      .addChannel(al + 'HAT_7.wav')
      .addChannel(al + 'OP_HAT.wav')
      .addChannel(al + 'RIDE_CYM.wav')


  });
}(window.STEPSEQUENCER, window.jQuery));
