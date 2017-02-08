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
//        case "PeakIndicatorR":
//            midi.sendShortMsg(0xB4, 81, value+48);
//            break;
//        case "PeakIndicatorL":
//            midi.sendShortMsg(0xB4, 81, value+48);
//            break;

    }
}

BehringerCMDMM1.PFLUpdate = function (value, group, control) {
    print(value + " | " + group + " | " + control);
    switch(group) {
        case "[Channel1]":
            midi.sendShortMsg(0x94, 0x17, value); // Line 1, 1
            break;

        case "[Channel2]":
            midi.sendShortMsg(0x94, 0x1B, value); // Line 1, 1
            break;

        case "[Channel3]":
            midi.sendShortMsg(0x94, 0x13, value); // Line 1, 1
            break;

        case "[Channel4]":
            midi.sendShortMsg(0x94, 0x1F, value); // Line 1, 1
            break;
    }
}


BehringerCMDMM1.CueIndicatorUpdate = function (value, group, control) {
    print(value + " | " + group + " | " + control);
    switch(group) {
        case "[Channel1]":
            midi.sendShortMsg(0x94, 0x31, value); // Line 1, 1
            break;

        case "[Channel2]":
            midi.sendShortMsg(0x94, 0x32, value); // Line 1, 1
            break;

        case "[Channel3]":
            midi.sendShortMsg(0x94, 0x30, value); // Line 1, 1
            break;

        case "[Channel4]":
            midi.sendShortMsg(0x94, 0x33, value); // Line 1, 1
            break;
    }
}

BehringerCMDMM1.initLEDs = function () {
    // (re)Initialise any LEDs that are direcctly controlled by this script.
    print("Setting LEDs");
    midi.sendShortMsg(0xB4, 80, 48); // VuMeterL
    midi.sendShortMsg(0xB4, 81, 48); // VuMeterR

    midi.sendShortMsg(0x94, 0x12, 0x00); // Middle Button

//    midi.sendShortMsg(0x94, 0x10, 0x01); // Left Button  // Doesn't Work?
//    midi.sendShortMsg(0x94, 0x11, 0x01); // Right Button // Doesn't Work?

    midi.sendShortMsg(0x94, 0x13, 0x00); // Line 1, 1
    midi.sendShortMsg(0x94, 0x14, 0x00); // Line 1, 2
    midi.sendShortMsg(0x94, 0x30, 0x00); // Line 1, Que

    midi.sendShortMsg(0x94, 0x17, 0x00); // Line 2, 1
    midi.sendShortMsg(0x94, 0x18, 0x00); // Line 2, 2
    midi.sendShortMsg(0x94, 0x31, 0x00); // Line 2, Que

    midi.sendShortMsg(0x94, 0x1B, 0x00); // Line 3, 1
    midi.sendShortMsg(0x94, 0x1C, 0x00); // Line 3, 2
    midi.sendShortMsg(0x94, 0x32, 0x00); // Line 3, Que

    midi.sendShortMsg(0x94, 0x1F, 0x00); // Line 4, 1
    midi.sendShortMsg(0x94, 0x20, 0x00); // Line 4, 2
    midi.sendShortMsg(0x94, 0x33, 0x00); // Line 4, Que
}

BehringerCMDMM1.init = function () {
    // Initialise anything that might not be in the correct state.
    BehringerCMDMM1.initLEDs();
    // Connect the VUMeters
    engine.connectControl("[Master]", "VuMeterL", "BehringerCMDMM1.VuMeterUpdate");
    engine.connectControl("[Master]", "VuMeterR", "BehringerCMDMM1.VuMeterUpdate");
    engine.connectControl("[Channel1]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel2]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel3]", "pfl", "BehringerCMDMM1.PFLUpdate");
    engine.connectControl("[Channel4]", "pfl", "BehringerCMDMM1.PFLUpdate");

    engine.connectControl("[Channel1]", "cue_indicator", "BehringerCMDMM1.CueIndicatorUpdate");
    engine.connectControl("[Channel2]", "cue_indicator", "BehringerCMDMM1.CueIndicatorUpdate");
    engine.connectControl("[Channel3]", "cue_indicator", "BehringerCMDMM1.CueIndicatorUpdate");
    engine.connectControl("[Channel4]", "cue_indicator", "BehringerCMDMM1.CueIndicatorUpdate");


//    engine.connectControl("[Master]", "PeakIndicatorL", "BehringerCMDMM1.VuMeterUpdate");
//    engine.connectControl("[Master]", "PeakIndicatorR", "BehringerCMDMM1.VuMeterUpdate");

}

BehringerCMDMM1.shutdown = function () {
    BehringerCMDMM1.initLEDs();
};
