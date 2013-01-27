(function (App, $) {

  var al = '/content/audio/2002DANC/';

  $(document).ready(function () {
    var
      steps = [[], [], [], []],
      channels = [],
      currentStep = 0,
      i;

    channels[0] = new App.Channel(al + 'KIK_1.wav').setLabel('Kick');
    channels[1] = new App.Channel(al + 'CLAP.wav').setLabel('Clap');
    channels[2] = new App.Channel(al + 'HAT_1.wav').setLabel('Hihat');
    channels[3] = new App.Channel(al + 'SN4.wav').setLabel('Snare');


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

  });
}(window.STEPSEQUENCER, window.jQuery));