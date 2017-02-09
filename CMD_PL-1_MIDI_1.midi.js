// Authored By: Jason "CoolAcid" Kendall
// @CoolAcid
// Original Home: https://github.com/coolacid/Mixxx-Controllers-CMD

// Original :: http://www.mixxx.org/forums/viewtopic.php?f=7&t=6201&start=10#p29935
// Master function definition.
//

function BehringerCMDPL1() {};

// ***************************** Global Vars **********************************

BaseChannel = 0;

// Options

TouchSensitivePlatter = true // Touching top of platter will put in scratch mode

// Buttons

Button_Scratch = 0x1B;

// Internal Verables
Button_Scratching = false
DelayScratch = false

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

BehringerCMDPL1.HandleHotcue = function (channel, control, value, status, group) {
    switch (control) {
        case 0x10:
            hotcue = "hotcue_1";
            break;
        case 0x11:
            hotcue = "hotcue_2";
            break;
        case 0x12:
            hotcue = "hotcue_3";
            break;
        case 0x13:
            hotcue = "hotcue_4";
            break;
    }
    // If hotcue enabled, goto, else set?
    if (engine.getParameter("[Channel" + (channel+1) + "]", hotcue + "_enabled")) {
        engine.setParameter("[Channel" + (channel+1) + "]", hotcue + "_goto", 1);
    } else {
        engine.setParameter("[Channel" + (channel+1) + "]", hotcue + "_set", 1);
    }
}

BehringerCMDPL1.HandleScratchButton = function (channel, control, value, status, group) {
    Channel = 0x90 + BaseChannel + channel;
    var alpha = 1.0/8;
    var beta = alpha/32;
    if (control == 0x1B) {
        // Handle the Scratch Button
        if (status & 0x90) {
            if (engine.isScratching(channel+1)) {
                engine.scratchDisable(channel+1);
                midi.sendShortMsg(Channel, Button_Scratch, 0x00);
                Button_Scratching = false
            } else {
                engine.scratchEnable(channel+1, 128, 33+1/3, alpha, beta);
                midi.sendShortMsg(Channel, Button_Scratch, 0x02);
                Button_Scratching = true
            }
        }
    } else if (TouchSensitivePlatter && control == 0x1F && !Button_Scratching) {
        // Handle the scratch pad
        if ((status & 0x90) == 0x90) {
            engine.scratchEnable(channel+1, 128, 33+1/3, alpha, beta, false);
            midi.sendShortMsg(Channel, Button_Scratch, 0x01);
        } else if (status & 0x80) {
            DelayScratch = true
            engine.beginTimer(1000, function() { DelayScratch = false}, true);
            engine.scratchDisable(channel+1, false);
            midi.sendShortMsg(Channel, Button_Scratch, 0x00);
        }
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
        if (!DelayScratch) {
            engine.setValue('[Channel'+(channel+1)+']', 'jog', CorrectedValue); // Pitch bend
        }
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
        case "hotcue_1_enabled":
            Button = 0x10;
            break;
        case "hotcue_2_enabled":
            Button = 0x11;
            break;
        case "hotcue_3_enabled":
            Button = 0x12;
            break;
        case "hotcue_4_enabled":
            Button = 0x13;
            break;
    }
    // Send the message
    midi.sendShortMsg(Channel, Button, value);
}

BehringerCMDPL1.initLEDs = function () {
    print("CMD PL-1: Setting LEDs and settings");
    for (Channel=1; Channel <= 4; Channel++) {
        engine.trigger("[Channel" + Channel + "]", "play_indicator");
        engine.trigger("[Channel" + Channel + "]", "cue_indicator");
        engine.trigger("[Channel" + Channel + "]", "rate");
        // Set SoftTakeOver on Rate
        engine.softTakeover("[Channel" + Channel +"]", "rate", true);
    }
}

BehringerCMDPL1.ResetLEDs = function () {
    // (re)Initialise any LEDs that are direcctly controlled by this script.
    print("CMD PL-1: Resetting LEDs");

    // Loop through each channel since the PL-1 supports 4 different decks
    for (Channel=0; Channel <= 3; Channel++) {
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

    }
}

BehringerCMDPL1.init = function () {
    for (Channel=1; Channel <= 4; Channel++) {
        engine.connectControl("[Channel" + Channel + "]", "cue_indicator", "BehringerCMDPL1.IndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "play_indicator", "BehringerCMDPL1.IndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "rate", "BehringerCMDPL1.RateIndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "hotcue_1_enabled", "BehringerCMDPL1.IndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "hotcue_2_enabled", "BehringerCMDPL1.IndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "hotcue_3_enabled", "BehringerCMDPL1.IndicatorUpdate");
        engine.connectControl("[Channel" + Channel + "]", "hotcue_4_enabled", "BehringerCMDPL1.IndicatorUpdate");
    }

    // Initialise anything that might not be in the correct state.
    BehringerCMDPL1.initLEDs();

}

BehringerCMDPL1.shutdown = function () {
    // Reset the Lights to off
    BehringerCMDPL1.ResetLEDs();
};


// Monitor for Short / Long Presses
// From: https://www.mixxx.org/forums/viewtopic.php?f=7&t=7681

var QUICK_PRESS = 1;
var DOUBLE_PRESS = 2;
var LONG_PRESS = 3;

// =======================  LongShortBtn   
//Callback           : Callback function you have to provide (see end of the code), that will return
//                     the original event parameters (channel, control, value, status, group)
//                     and the kind of press event affecting your button (eventkind)
//                     This callback will be called once you release the button
//                     (Value will be equal to UP). You must provide this parameter.
//LongPressThreshold : delay in ms above which a firts press on the
//                     button will be considered as a Long press (default = 500ms).
//                     This parameter is optional.
//CallBackOKLongPress : This callback will give you the same values than the first one
//                     but it will be triggered as soon as the Long press is taken
//                     into account ( at this moment, value = DOWN because you are still
//                     holding down the button). This permits for instance to lit up a light indicating
//                     the user that he/she can release the button. This callback occurs before the first one.
//                     This parameter is optional.
//Like that, you can decide to put the code for the long press in either callback function
BehringerCMDPL1.LongShortBtn = function(Callback, LongPressThreshold, CallBackOKLongPress) {
    var myself = this;
    this.Callback = Callback;
    this.channel = 0;
    this.control = 0; 
    this.value = 0;
    this.status = 0;
    this.group = "";
    this.CallBackOKLongPress = CallBackOKLongPress;
    if (LongPressThreshold) {
        this.LongPressThreshold = LongPressThreshold;
    } else {
        //Sets a default value of 500 ms
        this.LongPressThreshold = 500;
    }

    this.ButtonLongPress = false;
    this.ButtonLongPressTimer = 0;

    // Timer's call back for long press
    this.ButtonAssertLongPress = function() {
        this.ButtonLongPress = true;
        //the timer was stopped, we set it to zero
        this.ButtonLongPressTimer = 0;
        // let's take action of the long press
        // Make sure the callback is a functionâ€ and exist
        if (typeof callback === "function") {
            // Call it, since we have confirmed it is callableâ€
            this.CallBackOKLongPress(this.channel, this.control, this.value, this.status, this.group, LONG_PRESS);
        }
    };

    this.ButtonDown = function(channel, control, value, status, group) {
        this.channel = channel;
        this.control = control; 
        this.value = value;
        this.status = status;
        this.group = group;
      this.ButtonLongPress = false;
        this.ButtonLongPressTimer = engine.beginTimer(this.LongPressThreshold, function(){ myself.ButtonAssertLongPress(); }, true);
    };

    this.ButtonUp = function() {
        if (this.ButtonLongPressTimer !== 0) {
            engine.stopTimer(this.ButtonLongPressTimer);
            this.ButtonLongPressTimer = 0;
        }
      if (this.ButtonLongPress) {
            this.Callback(this.channel, this.control, this.value, this.status, this.group, LONG_PRESS);
        } else {
            this.Callback(this.channel, this.control, this.value, this.status, this.group, QUICK_PRESS);
        }
    };
};
