Step sequencer
==============

View the latest version here: [stepseq.michd.me](http://stepseq.michd.me)

This is meant to be a simple step sequencer using `<audio>` and a bit of JS magic
to create sweet drum grooves, for fun.

It's just some experimentation on my end, see what I can achieve with it.

## Changelog

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
* Picking and choosing from a range of samples
* Adding/removing sample tracks
* Progress indicator
* Set volume per channel
