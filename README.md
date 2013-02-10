Step sequencer
==============

View the latest version here: [stepseq.michd.me](http://stepseq.michd.me)

This is meant to be a simple step sequencer using `<audio>` and a bit of JS magic
to create sweet drum grooves, for fun.

It's just some experimentation on my end, see what I can achieve with it.

## Changelog

### v1.0:

Giant update this time, worth a major version bump. A lot of organizational work was done, which made for very slow updates, as big groundwork was laid. It did allow for building some of the more complex features in a still quite understandable way though.

A lot of work has been put in making everything event-driven, to make for very loose coupling. If some component isn't loaded, others still tend to work alright.

I wrote a custom event dispatcher, in order not to have to rely on jQuery in components that are non-user interface. I've made sure to only use jQuery in components that actually have anything to do with user interface.

Anyway, on to the list.

* Added dialogs UI component, which I wrote for another (not [yet] open source) project
* Added sample picker UI component, making use of dialogs UI component
* Allow replacing the sample in an existing channel, through sample picker
* Allow adding and removing channels, through sample picker
* Pause (you could only play/stop before)
* *Set time signature!* - There are some limits here which I don't know if I'll be able to resolve them, but still.
* Set number of measures for the pattern



### v0.2.1:

* Implemented volume control in interface using the awesome [jQuery Kontrol](https://github.com/aterrien/jQuery-Kontrol) plugin. Thanks for reminding me of it, [diggabyte](https://github.com/diggabyte)

### v0.2:

The previous version was mostly initial experimentation. This weekend I've been focussed on structuring things nicely, and as a result there isn't much new in terms of features.

* Wrote channel module, managing audio for a single track in the sequencer. This module supports:
    * Muting (disabling) a channel (currently used)
    * Setting the volume of a channel (not yet used)
    * Setting maximum polyphone (at default 16 now, not in interface)
    * Updating which sample is used (not in interface)
* Wrote tempo module, which keeps track of proper delay between steps. This module has support already finished for
    * Start/stop playback (currently used)
    * Setting the tempo in bpm (currently used)
    * Configurable time signatures (not yet used, that is, using default 4/4)
* Allowed muting channels using a checkbox next to the name
* Updated some styles a bit
* Removed auto-update URL hash (and thus sharing functionality). The base64 encoding way wouldn't scale with features coming up. I'll add sharing by saving to server and having an ID at some more developed point.

### v0.1:

* 4 tracks (kick, clap, hihat, snare), you can sequence a single bar at step resolution
* Play / stop buttons
* Setting the tempo, haven't checked how accurate it is, but *if my calculations are correct* it should be pretty spot on. I blame inaccuracies on the browser.
* Share sequence with friends through auto-updating URL hash


Plans
-----
* Design update using icons for various buttons
* Fixing some layout glitches when there is not enough horizontal space
* Allow setting maximum polyphony per channel
* More samples to choose from, sample groups in selector (two dropdowns)