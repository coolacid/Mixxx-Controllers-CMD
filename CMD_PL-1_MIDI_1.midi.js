// Authored By: Jason "CoolAcid" Kendall
// @CoolAcid
// Original Home: https://github.com/coolacid/Mixxx-Controllers-CMD

// Original :: http://www.mixxx.org/forums/viewtopic.php?f=7&t=6201&start=10#p29935
// Master function definition.
//

function BehringerCMDPL1() {};

// ***************************** Global Vars **********************************

BaseChannel = 0;

Button_Scratch = 0x1B;

// ************************ Initialisation stuff. *****************************

BehringerCMDPL1.FindChannel = function(group, base) {
    // Identify the channel
    switch(group) {
        case "[Channel1]":
            Channel = base + BaseChannel + 0
            break;

        case "[Channel2]":
            Channel = base + BaseChannel + 1
            break;

        case "[Channel3]":
            Channel = base + BaseChannel + 2
            break;

        case "[Channel4]":
            Channel = base + BaseChannel + 3
            break;
    }
    return Channel;
}

BehringerCMDPL1.Scale = function(value, baseMin, baseMax, limitMin, limitMax) {
    return ((limitMax - limitMin) * (value - baseMin) / (baseMax - baseMin)) + limitMin;
}

BehringerCMDPL1.HandleScratchButton = function (channel, control, value, status, group) {
    Channel = 0x90 + BaseChannel + channel;
    if (status === 0x90) {
        if (engine.isScratching(channel+1)) {
            engine.scratchDisable(channel+1);
            value = 0x00;
        } else {
            var alpha = 1.0/8;
            var beta = alpha/32;
            engine.scratchEnable(channel+1, 128, 33+1/3, alpha, beta);
            value = 0x01;
        }
        midi.sendShortMsg(Channel, Button_Scratch, value);
    }
}

BehringerCMDPL1.HandleRateSlider = function (channel, control, value, status, group) {
    CorrectedValue = BehringerCMDPL1.Scale(value, 0x000, 127, -1, 1);
    engine.setValue("[Channel"+(channel+1)+"]", "rate", CorrectedValue);
}

BehringerCMDPL1.HandleDisk = function (channel, control, value, status, group) {
    CorrectedValue = value - 0x40;
    if (engine.isScratching(channel+1)) {
        engine.scratchTick(channel+1, CorrectedValue); // Scratch!
    } else {
        engine.setValue('[Channel'+(channel+1)+']', 'jog', CorrectedValue); // Pitch bend
    }
}

BehringerCMDPL1.RateIndicatorUpdate = function (value, group, control) {
    Channel = BehringerCMDPL1.FindChannel(group, 0xB0);
    CorrectedValue = BehringerCMDPL1.Scale(value, -1, 1, 1, 16 );
    midi.sendShortMsg(Channel, 10, CorrectedValue); // Rate
}

BehringerCMDPL1.IndicatorUpdate = function (value, group, control) {
    // Identify the button
    Channel = BehringerCMDPL1.FindChannel(group, 0x90);
    switch(control) {
        case "cue_indicator":
            Button = 0x22;
            break;
        case "play_indicator":
            Button = 0x23;
            break;
    }
    // Send the message
    midi.sendShortMsg(Channel, Button, value);
}

BehringerCMDPL1.initLEDs = function () {
    print("CMD PL-1: Setting LEDs");
    for (Channel=1; Channel <= 4; Channel++) {
        engine.trigger("[Channel" + (Channel) + "]", "play_indicator");
        engine.trigger("[Channel" + (Channel) + "]", "cue_indicator");
        engine.trigger("[Channel" + (Channel) + "]", "rate");
    }
}
BehringerCMDPL1.ResetLEDs = function () {
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
        midi.sendShortMsg(0xB0 + Channel, 10, 8); // Rate

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

        // Set SoftTakeOver on Rate
        engine.softTakeover("[Channel" + (Channel + 1) +"]", "rate", true);
    }
}



BehringerCMDPL1.init = function () {

    BehringerCMDMM1.ResetLEDs();
    engine.connectControl("[Channel1]", "cue_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel2]", "cue_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel3]", "cue_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel4]", "cue_indicator", "BehringerCMDPL1.IndicatorUpdate");

    engine.connectControl("[Channel1]", "play_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel2]", "play_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel3]", "play_indicator", "BehringerCMDPL1.IndicatorUpdate");
    engine.connectControl("[Channel4]", "play_indicator", "BehringerCMDPL1.IndicatorUpdate");

    engine.connectControl("[Channel1]", "rate", "BehringerCMDPL1.RateIndicatorUpdate");
    engine.connectControl("[Channel2]", "rate", "BehringerCMDPL1.RateIndicatorUpdate");
    engine.connectControl("[Channel3]", "rate", "BehringerCMDPL1.RateIndicatorUpdate");
    engine.connectControl("[Channel4]", "rate", "BehringerCMDPL1.RateIndicatorUpdate");

    // Initialise anything that might not be in the correct state.
    BehringerCMDPL1.initLEDs();

}

BehringerCMDPL1.shutdown = function () {
    // Reset the Lights to off
    BehringerCMDMM1.ResetLEDs();
};
