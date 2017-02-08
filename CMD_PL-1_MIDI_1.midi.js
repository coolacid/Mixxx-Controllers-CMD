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

    // Loop through each channel since the PL-1 supports 4 different decks
    for (Channel=0; Channel <= 3; Channel++) {
        print ("CMD PL-1: Setting Channel: " + (Channel+1));
        for (Encoder=0; Encoder <=7; Encoder++) {
            // Loop through each encoder to set to mid section
            midi.sendShortMsg(0xB0 + Channel, 00+Encoder, 8);
        }

        // Set the rest of the LEDs
        midi.sendShortMsg(0xB0 + Channel, 10, 8); // Pitch

        midi.sendShortMsg(0x90 + Channel, 0x10, 0x00); // Button: 1
        midi.sendShortMsg(0x90 + Channel, 0x11, 0x00); // Button: 2
        midi.sendShortMsg(0x90 + Channel, 0x12, 0x00); // Button: 3
        midi.sendShortMsg(0x90 + Channel, 0x13, 0x00); // Button: 4
        midi.sendShortMsg(0x90 + Channel, 0x14, 0x00); // Button: 5
        midi.sendShortMsg(0x90 + Channel, 0x15, 0x00); // Button: 6
        midi.sendShortMsg(0x90 + Channel, 0x16, 0x00); // Button: 7
        midi.sendShortMsg(0x90 + Channel, 0x17, 0x00); // Button: 8

        midi.sendShortMsg(0x90 + Channel, 0x18, 0x00); // Button: Load
        midi.sendShortMsg(0x90 + Channel, 0x19, 0x00); // Button: Lock

        midi.sendShortMsg(0x90 + Channel, 0x1B, 0x00); // Button: Scratch
        midi.sendShortMsg(0x90 + Channel, 0x20, 0x00); // Button: Sync
        midi.sendShortMsg(0x90 + Channel, 0x21, 0x00); // Button: Tap
        midi.sendShortMsg(0x90 + Channel, 0x22, 0x00); // Button: Cue
        midi.sendShortMsg(0x90 + Channel, 0x23, 0x00); // Button: Play

        midi.sendShortMsg(0x90 + Channel, 0x24, 0x00); // Button: <<
        midi.sendShortMsg(0x90 + Channel, 0x25, 0x00); // Button: >>
        midi.sendShortMsg(0x90 + Channel, 0x26, 0x00); // Button: -
        midi.sendShortMsg(0x90 + Channel, 0x27, 0x00); // Button: +

    }
}

BehringerCMDPL1.init = function () {
    // Initialise anything that might not be in the correct state.
    BehringerCMDPL1.initLEDs();
}

BehringerCMDPL1.shutdown = function () {
    // Reset the Lights to off
    BehringerCMDMM1.initLEDs();
};
