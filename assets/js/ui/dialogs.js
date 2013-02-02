/*global window: true, document: true, console: true */

(function (App, $) {
  "use strict";

  var dialogs = App.namespace('ui.dialogs');

  dialogs.draggableAvailable = (typeof $().draggable === 'function');

  /**
   * In case anything specific in the dialogs goes wrong
   *
   * @param {String} message
   */
  dialogs.DialogError = function (message) {
    this.name = "UI DialogError";
    this.message = message || "An error occured. No more information is available.";
  };



  dialogs.Dialog = (function () {

    var
      dialogCounter = 0,  // 'private static'
      overlayCounter = 0, // 'private static'

      /**
       * Dialog constructor, takes options.
       *
       * @note This one is largely taken and edited from another (currently)
       * non-open-source project.
       *
       * @param {Object} options
       * @return {dialogs.Dialog}
       * @todo write some proper docs for this thing
       */
      NewDialog = function (options) {

        var

          /**
           * Fall-back options for those not specified in the options param
           * @type {Object}
           */
          defaultOptions = {

            /**
             * Main content of the dialog
             * @type {String|HtmlElement|jQuery}
             */
            content: "Dialog content",

            /**
             * List of action buttons to display under the dialog content
             * Each item should be object with {String} label and
             * {String|Function} action. When action is String it should be
             * either "closeDialog" or "cancelDialog"
             * @type {Array}
             */
            buttons: [
              {
                label: "Ok",
                action: "closeDialog"
              }
            ],

            /**
             * Whether this dialog should render an overlay over all content
             * @type {Boolean}
             */
            overlay: false,

            /**
             * Function to be called when the dialog finishes closing
             * @param  returnValue if applicable, a return value from dialog
             */
            onClose: function (returnValue) {},

            /**
             * Function to be called when the dialog finished opening
             */
            onOpen: function () {},

            /**
             * Function to be called when an applicable input changes
             * @param newValue
             */
            onChange: function (newValue) {}
          },

          /**
           * Unique identifier for the dialog
           * @type {Number}
           */
          dialogId = dialogCounter += 1,

          /**
           * When this dialog needs an overlay, use this z-index
           * @type {Number}
           */
          overlayZIndex = 1000 + (overlayCounter += 1),

          /**
           * Value that'll be returned with the onClose function
           */
          returnValue = null;


        // Ensure intantiating
        if (this.constructor !== NewDialog && this.constructor !== dialogs.Dialog) {
          return new NewDialog(options);
        }

        // Inherit options from defaultOption
        options = $.extend({}, defaultOptions, options);

        // Public members
        this.options = options;
        this.$box = null; // Will be the html box
        this.$overlay = null; // If overlay is true, this will be the overlay div

        // Getters
        this.getDialogId = function () { return dialogId; };
        this.getOverlayZIndex = function () { return overlayZIndex; };
        this.getReturnValue = function () { return returnValue; }; //probably deprecated

        this.constructor = dialogs.Dialog;
      };


    return NewDialog;

  }());


  // Utility functions

  /**
   * Remove any options that ought to be ignored (depending on context)
   *
   * @param  {Object} options Current options hash of a dialog
   * @param  {Array} ignoredOptions List of option names to be removed
   * @return {Object} The cleaned up options object
   */
  dialogs.Dialog.cleanOptions = function (options, ignoredOptions) {
    var
      slice = Array.prototype.slice,
      i, iMax;

    options = options || {};

    // Get array of ignoredOptions regardless of whether the parameter
    // is Array or just using remaining args
    ignoredOptions = (ignoredOptions instanceof Array)
      ? ignoredOptions
      : slice.call(arguments, 1);

    for (i = 0, iMax = ignoredOptions.length; i < iMax; i += 1) {
      if (options.hasOwnProperty(ignoredOptions[i])) {
        delete options[ignoredOptions[i]];
      }
    }

    return options;
  };


  // Dialog prototype

  /**
   * Add the dialog to the DOM, after setting up all relevant options
   *
   * @return {dialogs.Dialog} self
   */
  dialogs.Dialog.prototype.spawn = function () {
    var
      htmlId = 'dc_dialog_' + this.getDialogId(),
      i = 0, iMax = 0,
      options = this.options,
      buttons = this.options.buttons,
      self = this,

      $dialogControls = $('<div>', {"class": "dialog-controls"}),
      $button;

    /**
     * Assign the proper functionality to the buttons, based on either
     * a string or a function
     *
     * @param  {jQuery} $button
     * @param  {String|Function|Null} action
     * @return {jQuery} the button
     */
    function attachButtonAction($button, action) {

      // If it is a proper function, it's easy
      if (typeof action === 'function') {

        $button.click(action);

      } else if (typeof action === 'string') {

        switch (action) {

        case "closeDialog":
          $button.click(function (event) {
            self.close();
          });
          break;

        case "cancelDialog":
          $button.click(function (event) {
            self.returnValue = false;
            self.close();
          });
          break;

        default:
          throw new dialogs.DialogError(
            "Invalid button action '" + action + "' specified."
          );
        }

      } else if (action === null) {

        $button.click(function (event) {});

      } else {
        throw new dialogs.DialogError(
          "Invalid button action, expecting function, string or null; '" +
              typeof (action) + "' given."
        );
      }

      return $button;
    }


    // iterate over buttons and set them up with actions
    for (i = 0, iMax = buttons.length; i < iMax; i += 1) {
      $button = $('<button>').html(buttons[i].label);
      $dialogControls.append(attachButtonAction($button, buttons[i].action));
    }

    // Set up the box itself
    this.$box = $('<div>', {id: htmlId, "class": "dialog"}).append(
      $('<div>', {"class": "dialog-content"}).html(this.options.content),
      $dialogControls
    );

    // Wrap in an overlay
    if (this.options.overlay) {

      this.$overlay = $('<div>', {
        "class": "overlay",
        style: "z-index: " + this.getOverlayZIndex()
      });

      this.$overlay.append(this.$box);
      $('body').append(this.$overlay.fadeIn());

    } else {
      $('body').append(this.$box);
    }


    // Set up dragging dialogs if it's available
    if (dialogs.draggableAvailable) {
      // Need to initalize pixel value for left offset
      this.$box.css("left", (($(document).outerWidth() - this.$box.outerWidth()) / 2) + "px");
      this.$box.draggable({containment: "parent"});
    }

    //center the box vertically
    this.$box.css("top", (($(document).outerHeight() - this.$box.innerHeight()) / 2) + "px");

    if (typeof this.options.onOpen === 'function') {
      self.options.onOpen();
    }

    return this;

  };


  /**
   * Fade out and remove the dialog from the DOM
   * Call any onClose function if available
   *
   * @return {dialogs.Dialog} slef
   */
  dialogs.Dialog.prototype.close = function () {
    var
      self = this,
      $box = this.$box,
      $overlay = this.$overlay,
      $element = $overlay || $box;

    if ($element === null) {
      throw new dialogs.DialogError("Cannot close dialog before it has been spawned");
    }

    if (typeof $element.remove !== 'function' || typeof $element.fadeOut !== 'function') {
      $element = $($element);
    }

    $element.fadeOut(200, "linear", function () {
      if (typeof self.options.onClose === 'function') {
        self.options.onClose(self.returnValue);
      }
      $element.remove();
    });

    return this;
  };


  // Dialog variations

  /**
   * Simple message dialog, with content and OK button.
   * Makes use of dialogs.Dialog (obviously)
   *
   * @param {Object|String} options Object with options | content string
   * @return {dialogs.Dialog}
   */
  dialogs.Alert = function (options) {

    var
      cleanOptions = dialogs.Dialog.cleanOptions,
      i, iMax,
      defaultOptions = {
        "buttonText": 'Ok'
      };

    if (!this instanceof dialogs.Alert) { //ensure instantiating
      return new dialogs.Alert(options);
    }

    if (typeof options === 'string' || typeof options === 'number') {
      options = { content: options };
    }

    options = $.extend(defaultOptions, options);

    options = cleanOptions(options, 'onChange', 'buttons');

    options.buttons = [{
      label: (typeof options.buttonText === 'string')
          ? options.buttonText
          : 'Ok',
      action: "closeDialog"
    }];

    return new dialogs.Dialog(options);
  };


  /**
   * Confirmation dialog with content, ok and cancel buttons
   *
   * To use the returned value (true for ok, false for cancel),
   * specify an onClose function in options; the param will be the result of the
   * user interaction.
   *
   * @param {Object} options
   * @return {dialogs.Dialog}
   */
  dialogs.OkCancel = function (options) {

    var
      cleanOptions = dialogs.Dialog.cleanOptions,
      i, iMax,
      self,
      defaultOptions = {
        okButtonText: "Ok",
        cancelButtonText: "Cancel"
      };

    if (!this instanceof dialogs.OkCancel) { //ensure instantiating
      return new dialogs.OkCancel(options);
    }

    options = $.extend(defaultOptions, options);

    options = cleanOptions(options, 'onChange', 'buttons');

    self = new dialogs.Dialog(options);

    self.options.buttons = [
      { //ok button
        label: options.okButtonText,
        action: function () {
          self.returnValue = true;
          self.close();
        }
      }, { //cancel button
        label: options.cancelButtonText,
        action: "cancelDialog"
      }
    ];

    return self;
  };


  /**
   * Multiple choice dialog that uses radio buttons, select dropdown or buttons
   *
   * Choices to be provided as {label, value} hashes
   * Chosen value can be retrieved as the param to onChange and onClose.
   * onChange is not used when choiceType is buttons.
   *
   * @param {Object} options
   * @return {dialogs.Dialog}
   */
  dialogs.MultipleChoice = function (options) {

    var
      cleanOptions = dialogs.Dialog.cleanOptions,
      self,
      i, iMax,
      defaultOptions = {
        choiceType: "select",
        choices: [],
        cancellable: false,
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        selectPlaceholder: 'Select one'
      },

      $choicesWrap,
      $choicesSelect;

    if (!this instanceof dialogs.MultipleChoice) { //ensure instantiating
      return new dialogs.MultipleChoice(options);
    }

    options = $.extend(defaultOptions, options);

    // onChange is irrelevant if we're using buttons for the choice
    if (options.choiceType === "buttons") {
      cleanOptions(options, 'onChange');
    }

    cleanOptions(options, 'buttons');

    self = new dialogs.Dialog(options);

    // Set up Ok / cancel buttons
    self.options.buttons = [];

    if (options.choiceType !== "buttons") {
      // Ok button
      self.options.buttons.push({
        label: options.okButtonText,
        action: "closeDialog"
      });
    }

    if (options.cancellable) {
      // Cancel button
      self.options.buttons.push({
        label: options.cancelButtonText,
        action: "cancelDialog"
      });
    }

    // Set up choices HTML to append to content
    $choicesWrap = $('<div>', {"class": "choices"});

    if (options.choiceType === 'select') {
      $choicesSelect = $('<select>', {name: "dialog-choice"}).append(
        $('<option>', {"value": -1}).html(options.selectPlaceholder)
      ).appendTo($choicesWrap);
    }

    for (i = 0, iMax = options.choices.length; i < iMax; i += 1) {
      switch (options.choiceType) {
      case "radio":
        $choicesWrap.append(
          $('<label>').append(
            $('<input>', {
              type: "radio",
              value: options.choices[i].value,
              name: "dialog-choice"
            }),
            options.choices[i].label
          )
        );
        break;

      case "select":
        $choicesSelect.append(
          $('<option>', {value: options.choices[i].value}).html(options.choices[i].label)
        );
        break;

      case "buttons":
        $choicesWrap.append(
          $('<button>', {name: "dialog-choice", value: options.choices[i].value})
            .html(options.choices[i].label)
        );
        break;
      }
    }

    // Handling selections (onChange for radio and select)
    switch (options.choiceType) {
    case 'radio':
      $choicesWrap.find('input[name=dialog-choice]').change(function () {
        self.returnValue = $(this).val();
        if (typeof self.options.onChange === 'function') {
          self.options.onChange(self.returnValue);
        }
      });
      break;
    case 'select':
      $choicesSelect.change(function () {
        self.returnValue = $(this).val();
        if (typeof self.options.onChange === 'function') {
          self.options.onChange(self.returnValue);
        }
      });
      break;

    case 'buttons':
      $choicesWrap.find('button[name=dialog-choice]').click(function () {
        self.returnValue = $(this).val();
        self.close();
      });
      break;
    }

    self.options.content = $('<div>', {"class": 'dialog-content-wrap'}).append(
      self.options.content,
      $choicesWrap
    );

    return self;
  };


  /**
   * Prompt dialog, provides given content and an input field
   *
   * The user input can be retrieved in onChange and onClose, as the parameter
   * @param {[type]} options [description]
   */
  dialogs.Prompt = function (options) {
    var
      $inputField,
      cleanOptions = dialogs.Dialog.cleanOptions,
      self,
      defaultOptions = {
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        cancellable: false,
        defaultValue: ''
      };

    if (!this instanceof dialogs.Prompt) { //ensure instantiating
      return new dialogs.Prompt(options);
    }

    options = $.extend(defaultOptions, options);

    cleanOptions(options, "buttons");

    options.buttons = [];

    $inputField = $('<input>', {
      type: "text",
      name: "dialog-input",
      value: options.defaultValue
    });

    options.content = $('<div>', {"class": 'dialog-content-wrap'}).append(
      options.content,
      $inputField
    );

    self = new dialogs.Dialog(options);

    //make $inputField fire onChange event
    $inputField.change(function (event) {
      self.returnValue = $inputField.val();
      if (typeof options.onChange === 'function') {
        options.onChange(self.returnValue);
      }
    });

    //Enter key = click OK button for $inputField
    $inputField.keypress(function (event) {
      if (event.which === 13) { //13 is the keycode for enter
        self.returnValue = self.returnValue || $(this).val();
        self.close();
      }
    });

    //Focus on inputfield onOpen
    if (typeof options.onOpen === 'function') {
      self.options.onOpen = function () {
        $inputField.focus();
        options.onOpen();
      };
    } else {
      self.options.onOpen = function () {
        $inputField.focus();
      };
    }

    // Buttons

    // OK
    self.options.buttons.push({
      action: function () {
        self.returnValue = self.returnValue || $inputField.val();
        self.close();
      },
      label: self.options.okButtonText
    });

    // Optional cancel
    if (self.options.cancellable) {
      self.options.buttons.push({
        action: "cancelDialog",
        label: self.options.cancelButtonText
      });
    }

    return self;
  };

}(window.STEPSEQUENCER, window.jQuery));
