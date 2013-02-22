Step sequencer
==============

View the latest version here: [stepseq.michd.me](http://stepseq.michd.me)

This is meant to be a simple step sequencer using `<audio>` and a bit of JS magic
to create sweet drum grooves, for fun.

It's just some experimentation on my end, see what I can achieve with it.

## Changelog

### v1.2.1:

* Fix glitch when there is not enough horizontal space and you ad a channel, the pattern for that channel wouldn't render.

### v1.2:

* Improve some UI performance by not iterating over all the ui tracks every step; instead use neater jQuery targetting.
* Add priority parameter to the event dispatcher subscribe function; subscribed callbacks are now executed in order of priority
* Set priority in channel for channel.trigger, so audio playback fires before the UI gets to do its thing
* Fix layout glitch when there is not enough horizontal space; now shows a scrollbar
* Add a bunch of classname options in UI trackmanager and track

### v1.1:

* An actual design (which also no longer uses a table for the pattern)
    * Track toggle checkbox replaced by orb
    * Add some icons using an icon font, prettifying buttons
    * Add [jQuery SelectBox](https://github.com/claviska/jquery-selectBox) plugin for nice looking dropdown in sample selector
    * Add indicator light for nicer track trigger indication
* Clear the whole pattern in one go (asks for confirmation first)

### v1.0.1:

* Fix confusing bugs related to time signature/measures changes and adding channels, moved some responsibilities around for better organization allowing this.

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
* Save your sequence and share it with a simple URL
* Allow setting maximum polyphony per channel
* More samples to choose from, sample groups in selector (two dropdowns or something)
* Timing accuracy tweaks