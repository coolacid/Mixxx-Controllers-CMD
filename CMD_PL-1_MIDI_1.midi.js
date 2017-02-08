// Authored By: Jason "CoolAcid" Kendall
// @CoolAcid
// Original Home: https://github.com/coolacid/Mixxx-Controllers-CMD

// Original :: http://www.mixxx.org/forums/viewtopic.php?f=7&t=6201&start=10#p29935
// Master function definition.
//

function BehringerCMDPL1() {};

// ***************************** Global Vars **********************************



// ************************ Initialisation stuff. *****************************

BehringerCMDPL1.initLEDs = function () {
    // (re)Initialise any LEDs that are direcctly controlled by this script.
    print("CMD PL-1: Setting LEDs");
    midi.sendShortMsg(0xB4, 80, 48); // VuMeterL
    midi.sendShortMsg(0xB4, 81, 48); // VuMeterR

    midi.sendShortMsg(0x94, 0x12, 0x00); // Middle Button

//    midi.sendShortMsg(0x94, 0x10, 0x01); // Left Button  // Doesn't Work?
//    midi.sendShortMsg(0x94, 0x11, 0x01); // Right Button // Doesn't Work?

    midi.sendShortMsg(0x94, 0x13, 0x00); // Channel 1, 1
    midi.sendShortMsg(0x94, 0x14, 0x00); // Channel 1, 2
    midi.sendShortMsg(0x94, 0x30, 0x00); // Channel 1, Que

    midi.sendShortMsg(0x94, 0x17, 0x00); // Channel 2, 1
    midi.sendShortMsg(0x94, 0x18, 0x00); // Channel 2, 2
    midi.sendShortMsg(0x94, 0x31, 0x00); // Channel 2, Que

    midi.sendShortMsg(0x94, 0x1B, 0x00); // Channel 3, 1
    midi.sendShortMsg(0x94, 0x1C, 0x00); // Channel 3, 2
    midi.sendShortMsg(0x94, 0x32, 0x00); // Channel 3, Que

    midi.sendShortMsg(0x94, 0x1F, 0x00); // Channel 4, 1
    midi.sendShortMsg(0x94, 0x20, 0x00); // Channel 4, 2
    midi.sendShortMsg(0x94, 0x33, 0x00); // Channel 4, Que
}

BehringerCMDPL1.init = function () {
    // Initialise anything that might not be in the correct state.
    BehringerCMDPL1.initLEDs();
}

BehringerCMDPL1.shutdown = function () {
    // Reset the Lights to off
//    BehringerCMDMM1.initLEDs();
};
