(function (App, $) {

  var al = '/content/audio/2002DANC/';

  $(document).ready(function () {
    var
      steps = [[], [], [], [], [], [], []],
      channels = [],
      currentStep = 0,
      i;

    channels[0] = new App.Channel(al + 'KIK_1.wav').setLabel('Kick');
    channels[1] = new App.Channel(al + 'CLAP.wav').setLabel('Clap');
    channels[2] = new App.Channel(al + 'HAT_7.wav').setLabel('Closed hihat');
    channels[3] = new App.Channel(al + 'OP_HAT.wav').setLabel('Open hihat');
    channels[4] = new App.Channel(al + 'RIDE_CYM.wav').setLabel('Ride').setVolume(0.4);
    channels[5] = new App.Channel(al + 'SN_2.wav').setLabel('Snare');


    function playStep() {

      var i;

      for (i = 0; i < steps.length; i += 1) {
        if (steps[i][currentStep]) {
          channels[i].trigger();
        }
      }

      currentStep += 1;
      if (currentStep > 15) { currentStep = 0; }
    }

    function reset () {
      currentStep = 0;
    }

    function play () {
      reset();
      App.tempo.toggle(true);
    }

    App.Tempo(playStep);

    $('tr .step').click(function () {
      stepIndex = $(this).data('step');
      $(this).toggleClass('on');
      steps[$(this).closest('tr').data('track')][stepIndex] = $(this).hasClass('on');
    });

    $('#play').click(play);
    $('#stop').click(function () {
      reset();
      App.tempo.toggle(false);
    });

    $('#tempo').change(function() {
      $(this).val(App.tempo.setBpm(parseInt($(this).val(), 10)).getBpm());
    });

    $('tr th input[type=checkbox]').change(function() {
      var
        on = $(this).is(':checked'),
        $tr = $(this).closest('tr');

      channels[$tr.data('track')].toggle(on);
      $tr.toggleClass('disabled', !on);
    });

  });
}(window.STEPSEQUENCER, window.jQuery));