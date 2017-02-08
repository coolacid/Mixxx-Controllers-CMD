// Authored By: Jason "CoolAcid" Kendall
// @CoolAcid
// Original Home: https://github.com/coolacid/Mixxx-Controllers-CMD

// Original :: http://www.mixxx.org/forums/viewtopic.php?f=7&t=6201&start=10#p29935
// Master function definition.
//

function BehringerCMDMM1() {};

// ***************************** Global Vars **********************************



// ************************ Initialisation stuff. *****************************

BehringerCMDMM1.VuMeterUpdate = function (value, group, control){
    value = (value*15)+48;
    switch(control) {
        case "VuMeterL":
            midi.sendShortMsg(0xB4, 80, value);
            break;
        case "VuMeterR":
            midi.sendShortMsg(0xB4, 81, value);
            break;

    }
}

BehringerCMDMM1.PFLUpdate = function (value, group, control) {
    print(value + " | " + group + " | " + control);
    switch(group) {
        case "[Channel1]":
            midi.sendShortMsg(0x94, 0x31, value); // Channel 1, Cue
            break;

        case "[Channel2]":
            midi.sendShortMsg(0x94, 0x32, value); // Channel 2, Cue
            break;

        case "[Channel3]":
            midi.sendShortMsg(0x94, 0x30, value); // Channel 3, Cue
            break;

        case "[Channel4]":
            midi.sendShortMsg(0x94, 0x33, value); // Channel 4, Cue
            break;
    }
}

BehringerCMDMM1.PlayIndicatorUpdate = function (value, group, control) {
    switch(group) {
        case "[Channel1]":
            midi.sendShortMsg(0x94, 0x18, value); // Channel 1, 2
            break;

        case "[Channel2]":
            midi.sendShortMsg(0x94, 0x1C, value); // Channel 2, 2
            break;

        case "[Channel3]":
            midi.sendShortMsg(0x94, 0x14, value); // Channel 3, 2
            break;

        case "[Channel4]":
            midi.sendShortMsg(0x94, 0x20, value); // Channel 4, 2
            break;
    }
}

BehringerCMDMM1.initLEDs = function () {
    // (re)Initialise any LEDs that are direcctly controlled by this script.
    print("CMD MM-1: Setting LEDs");
    midi.sendShortMsg(0xB4, 80, 48); // VuMeterL
    midi.sendShortMsg(0xB4, 81, 48); // VuMeterR

    midi.sendShortMsg(0x94, 0x12, 0x00); // Middle Button

//    midi.sendShortMsg(0x94, 0x10, 0x01); // Left Button  // Doesn't Work?
//    midi.sendShortMsg(0x94, 0x11, 0x01); // Right Button // Doesn't Work?

    // Disk 3
    midi.sendShortMsg(0x94, 0x13, 0x00); // Channel 1, 1
    midi.sendShortMsg(0x94, 0x14, 0x00); // Channel 1, 2
    midi.sendShortMsg(0x94, 0x30, 0x00); // Channel 1, Que

    // Disk 1
    midi.sendShortMsg(0x94, 0x17, 0x00); // Channel 2, 1
    midi.sendShortMsg(0x94, 0x18, 0x00); // Channel 2, 2
    midi.sendShortMsg(0x94, 0x31, 0x00); // Channel 2, Que

    // Disk 2
    midi.sendShortMsg(0x94, 0x1B, 0x00); // Channel 3, 1
    midi.sendShortMsg(0x94, 0x1C, 0x00); // Channel 3, 2
    midi.sendShortMsg(0x94, 0x32, 0x00); // Channel 3, Que

    // Disk 4
    midi.sendShortMsg(0x94, 0x1F, 0x00); // Channel 4, 1
    midi.sendShortMsg(0x94, 0x20, 0x00); // Channel 4, 2
    midi.sendShortMsg(0x94, 0x33, 0x00); // Channel 4, Que
}

BehringerCMDMM1.init = function () {
    // Initialise anything that might not be in the correct state.
    BehringerCMDMM1.initLEDs();

    // Connect the VUMeters
    engine.connectControl("[Master]", "VuMeterL", "BehringerCMDMM1.VuMeterUpdate");
    engine.connectControl("[Master]", "VuMeterR", "BehringerCMDMM1.VuMeterUpdate");

    // Connect the PreFadeListen Indicator to button 1 on each channel
    engine.connectControl("[Channel1]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel2]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel3]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel4]", "pfl", "BehringerCMDMM1.PFLUpdate");

    // Connect the Cue Indicator to the Cue button on each channel
    engine.connectControl("[Channel1]", "play_indicator", "BehringerCMDMM1.PlayIndicatorUpdate");
    engine.connectControl("[Channel2]", "play_indicator", "BehringerCMDMM1.PlayIndicatorUpdate");
    engine.connectControl("[Channel3]", "play_indicator", "BehringerCMDMM1.PlayIndicatorUpdate");
    engine.connectControl("[Channel4]", "play_indicator", "BehringerCMDMM1.PlayIndicatorUpdate");
}

BehringerCMDMM1.shutdown = function () {
    // Reset the Lights to off
    BehringerCMDMM1.initLEDs();
};
