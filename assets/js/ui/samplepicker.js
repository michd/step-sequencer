/*global window: true*/
(function (App, $, Audio) {
  "use strict";

  App.namespace('ui');

  App.ui.SamplePicker = function (options) {

    // ## Private properties

    var
      /**
       * Audio player for previews
       * @type {HtmlAudioElement}
       */
      previewPlayer = new Audio(),

      /**
       * The sample currently selected, usable for previewing
       * @type {String} Full URL
       */
      selectedSample = '',

      /**
       * Sample url of the sample that should initially be selected
       * @type {String|Boolean} false if not specified
       */
      presetSample = (options && typeof options.presetSample === 'string') ?
          options.presetSample :
          false,

      /**
       * Message to be displayed in the dialog above the selector and preview
       * @type {String}
       */
      message = (options && typeof options.content !== 'undefined') ?
          options.content :
          'Please select a sample below',

      /**
       * Optional callback whenever the selected sample changes
       * @type {Function}
       */
      onChange = (options && typeof options.onChange === 'function') ?
          options.onChange :
          function () {},

      /**
       * Callback when the dialog is closed
       * @type {[type]}
       */
      onClose = (options && typeof options.onClose === 'function') ?
          options.onClose :
          function () {},

      /**
       * Custom dialog object once it's intialized
       * @type {App.ui.dialogs.Dialog}
       */
      dialog = null;


    // Force instantiation before continuing

    if (this.constructor !== App.ui.SamplePicker) {
      return new App.ui.SamplePicker(options);
    }


    // ## Private methods

    /**
     * When the selected sample changes, load it in the preview player
     *
     * @param  {String} newSelectedSample Full URL
     */
    function selectionChanged(newSelectedSample) {

      // Call onChange function from options
      onChange(newSelectedSample);

      previewPlayer.src = newSelectedSample;
    }


    /**
     * Start playing a preview of the currently selected sample
     */
    function playPreview() {
      previewPlayer.play();
    }


    /**
     * Stops the preview player immediately
     */
    function stopPreview() {
      previewPlayer.currentTime = 0;
      previewPlayer.pause();
    }


    /**
     * Does whatever with the end result - selected sample
     *
     * @param  {String|Boolean} result False when cancelled
     */
    function closed(result) {
      stopPreview();
      onClose(result);
    }


    // Init
    (function () {

      var
        //options hash used for dialo constructor
        dialogOptions = {},
        // reference to the sample library
        library = App.sampleLibrary,
        i,
        $dropdown = $('<select>'),
        optionAttributes = {},
        $previewButton = $('<button>', {
          'class': 'icon-play preview',
          title: 'Preview'}
        ).html(' Preview');

      // Init previewPlayer
      previewPlayer.volume = 1;
      previewPlayer.preload      = 'auto';
      previewPlayer.autobuffer   = 'autobuffer';


      // Populate the new content (message, dropdown, preview button)
      dialogOptions.content = $('<div>').append(
        $('<p>').html(message),
        $dropdown,
        $previewButton
      );


      // Add OK and Cancel buttons
      dialogOptions.buttons = [
        {label: 'Cancel', action: 'cancelDialog'},
        {label: 'Ok', action: 'closeDialog'}
      ];


      // Close callback
      dialogOptions.onClose = closed;


      // Got all we need for the dialog, instantiate.
      dialog = new App.ui.dialogs.Dialog(dialogOptions);


      // Populate our earlier elements and attach listeners and whatnot

      // Init sample list in dropdown
      // Populate list
      for (i = 0; i < library.length; i += 1) {

        optionAttributes = {
          value: library[i].value
        };

        if (presetSample === library[i].value) {
          optionAttributes.selected = 'selected';
        }

        $dropdown.append(
          $('<option>', optionAttributes).html(library[i].label)
        );
      }


      // Listen for changes in selection
      $dropdown.change(function () {

        // Change the dialog's return value for when it closes
        dialog.returnValue = $dropdown.val();

        selectionChanged(dialog.returnValue);
      });

      // Set up selectBox plugin for proper styling
      $dropdown.selectBox();


      //Handle preview button clicks
      $previewButton.click(function (event) {

        if (!$(this).hasClass('playing')) {

          playPreview();
          $(this).addClass('playing icon-stop').removeClass('icon-play');

        } else {

          stopPreview();
          $(this).removeClass('playing icon-stop'). addClass('icon-play');
        }
      });


      // When preview player finishes playing, revert button
      $(previewPlayer).bind('ended', function () {

        $previewButton.removeClass('playing icon-stop').addClass('icon-play');

      });


      // Trigger change to load the initial sample
      $dropdown.change();

      // Just spawn it
      dialog.spawn();

    }()); // End init

  };

}(window.STEPSEQUENCER, window.jQuery, window.Audio));
