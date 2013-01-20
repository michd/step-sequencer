(function ($, _) {

  var al = '/content/audio/2002DANC/';

  function audioInstance (wav) {
    var audio = document.createElement('audio');
    audio.src = wav;
    audio.preload = "auto";
    audio.autobuffer = "autobuffer";
    return audio;
  }

  function syncInterval(beatsPerMinute) {
    
  }


  $(document).ready(function () {
    var
      steps = [[], [], [], []],
      players = [[], [], [], []],
      currentStep = 0,
      i,
      playTimeout,
      playing = false,
      timing = {
        bpm: 140,
        stepInterval: 125,
        lastTime: Date.now()
      },
      hashed = false;

    //init audio instances
    for (i = 0; i < 16; i += 1) {
      players[0].push(audioInstance(al + 'KIK_1.wav'));
      players[1].push(audioInstance(al + 'CLAP.wav'));
      players[2].push(audioInstance(al + 'HAT_1.wav'));
      players[3].push(audioInstance(al + 'SN4.wav'));
    }

    function checkTiming() {
      var
        curTime = Date.now(),
        timeDiff = curTime - timing.lastTime,
        desiredTimeDiff = (60 * 1000) / (Math.max(timing.bpm, 1) * 4),
        ratio = desiredTimeDiff / timing.stepInterval;

      timing.stepInterval = desiredTimeDiff * ratio;
    }

    function setTempo(newTempo) {
      var tempo = parseInt(newTempo, 10);
      tempo = Math.round(
        Math.max(40, Math.min(newTempo, 300))
      );
      timing.bpm = tempo;
      return tempo;
    }

    function playStep() {
      var i;
      for (i = 0; i < steps.length; i += 1) {
        if (steps[i][currentStep]) {
          players[i][currentStep].currentTime = 0;
          players[i][currentStep].play();
        }
      }

      currentStep += 1;
      if (currentStep > 15) { currentStep = 0; }

      if (playing) {
        playTimeout = setTimeout(playStep, timing.stepInterval);
      }
      checkTiming();
    }

    function reset () {
      clearTimeout(playTimeout);
      playing = false;
      currentStep = 0;
    }

    function play () {
      reset();
      playing = true
      timing.lastTime = Date.now()
      playTimeout = setTimeout(playStep, timing.stepInterval);
    }

    function updateHash(justTempo) {
      var
        track = 0,
        step = 0,
        arr = [],
        str = '';

      if(justTempo && hashed) {
        str = window.location.hash;
        str = str.substr(0, str.indexOf('#', 1));
        window.location.hash = str + '#' + timing.bpm;
        return;
      }

      for (track = 0; track < steps.length; track += 1) {
        arr[track] = [];
        for (step in steps[track]) {
          if (!isNaN(step)) {
            if (steps[track][step]) {
              arr[track].push(step);
            }
          }
        }
        arr[track] = arr[track].join(',');
      }
      str = arr.join(';');
      window.location.hash = '#' + window.btoa(str) + '#' + timing.bpm;
      hashed = true;
    }

    function loadFromHash() {
      var
        str = window.location.hash,
        arr,
        track, step,
        i,
        $track;
      if (str.length <= 1) { return; }
      setTempo(parseInt(str.split('#')[2], 10));
      $('#tempo').val(timing.bpm);
      str = str.split('#')[1];
      str = window.atob(str);
      arr = str.split(';')

      for (track = 0; track < arr.length; track += 1) {
        steps[track] = [];
        $track = $('[data-track=' + track +']');
        $track.find('.step').removeClass('on');
        arr[track] = arr[track].split(',');
        for (i = 0; i < arr[track].length; i += 1) {
          step = arr[track][i];
          console.log(step);
          steps[track][step] = true;
          $track.find('[data-step=' + step + ']').addClass('on');
        }
      }
    }

    $('tr .step').click(function () {
      stepIndex = $(this).data('step');
      $(this).toggleClass('on');
      steps[$(this).closest('tr').data('track')][stepIndex] = $(this).hasClass('on');
      updateHash();
    });

    $('#play').click(play);
    $('#stop').click(reset);

    $('#tempo').change(function() {
      $(this).val(setTempo($(this).val()));
      updateHash(true);
    });

    loadFromHash();







  });
}(window.jQuery, window._));