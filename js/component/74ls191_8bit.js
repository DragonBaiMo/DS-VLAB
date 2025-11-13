/*
DS-VLAB New Component - 8-bit Up/Down Counter (74LS191_8bit)
Reversible synchronous counter with parallel load capability
Features: up/down counting, parallel load, ripple clock output
This is a NEW component created for enhanced functionality
*/

function Compo74LS191_8bit() {
    this.id;
    this.type = "i";
    this.name = "74LS191_8bit";
    this.width = 280;
    this.height = 65;
    this.image = "";
    this.paddingLR = 3;

    // 8-bit up/down counter pins
    this.pinName = new Array(
        "D/U", "CP", "-LOAD",
        "D", "C", "B", "A",      // Lower 4 bits input
        "H", "G", "F", "E",      // Upper 4 bits input
        "CTEN", "GND", "VCC",
        "QA", "QB", "QC", "QD",  // Lower 4 bits output
        "QE", "QF", "QG", "QH",  // Upper 4 bits output
        "MAX/MIN", "RCO"
    );

    this.pinWidth = (this.width - this.paddingLR * 2) / 14;
    this.pinHeight = 19;
    this.showName = true;
    this.showBorder = true;

    var i = 1 / 14;
    this.pinPosition = new Array(
        // Top row
        [i * 0, 0], [i * 1, 0], [i * 2, 0],
        [i * 3, 0], [i * 4, 0], [i * 5, 0], [i * 6, 0],
        [i * 7, 0], [i * 8, 0], [i * 9, 0], [i * 10, 0],
        [i * 11, 0], [i * 12, 0], [i * 13, 0],
        // Bottom row
        [i * 13, 1], [i * 12, 1], [i * 11, 1], [i * 10, 1],
        [i * 9, 1], [i * 8, 1], [i * 7, 1], [i * 6, 1],
        [i * 5, 1], [i * 4, 1]
    );

    // Pin functions: 0=input, 10=required input, 1=output, 2=ground, 3=power
    this.pinFunction = new Array(
        10, 0, 0,                  // D/U, CP, -LOAD
        0, 0, 0, 0,                // D, C, B, A
        0, 0, 0, 0,                // H, G, F, E
        0, 2, 3,                   // CTEN, GND, VCC
        1, 1, 1, 1,                // QA, QB, QC, QD
        1, 1, 1, 1,                // QE, QF, QG, QH
        1, 1                       // MAX/MIN, RCO
    );

    this.pinValue = new Array(24);
    for (var i = 0; i < 24; i++) {
        this.pinValue[i] = 2;
    }

    this.connection = new Array(24);
    for (var i = 0; i < 24; i++) {
        this.connection[i] = [];
    }

    this.operationType = 0;
}

// Check if all required inputs are ready
Compo74LS191_8bit.prototype.beReady = function () {
    for (var i = 0; i < this.pinFunction.length; i++) {
        if (this.pinFunction[i] == 10 && this.pinValue[i] == 2) {
            return false;
        }
    }
    return true;
};

// Set input pin value
Compo74LS191_8bit.prototype.input = function (pinNo, value) {
    if (value == this.pinValue[pinNo]) return false;
    var oldv = this.pinValue[pinNo];
    this.pinValue[pinNo] = value;

    // Clock rising edge detection (pin 1 = CP)
    if (pinNo == 1 && oldv == 0 && value == 1) {
        // Load mode (pin 2 = -LOAD)
        if (this.pinValue[2] == 0) {
            for (var i = 3; i <= 10; i++) {
                if (this.pinValue[i] == 2) {
                    return false;
                }
            }
            this.operationType = 1;  // Load operation
            return true;
        }

        // Count mode (pin 11 = CTEN, must be 0 to enable counting)
        if (this.pinValue[2] == 1 && this.pinValue[11] == 0) {
            for (var i = 14; i <= 21; i++) {
                if (this.pinValue[i] == 2) {
                    return false;
                }
            }
            // Check D/U pin (pin 0): 0=count up, 1=count down
            if (this.pinValue[0] == 0) {
                this.operationType = 2;  // Count up
            } else {
                this.operationType = 3;  // Count down
            }
            return true;
        }
    }
    return false;
};

// 8-bit up/down counter logic
Compo74LS191_8bit.prototype.work = function () {
    // Load mode
    if (this.operationType == 1) {
        // Load lower 4 bits
        this.pinValue[14] = this.pinValue[6];   // QA = A
        this.pinValue[15] = this.pinValue[5];   // QB = B
        this.pinValue[16] = this.pinValue[4];   // QC = C
        this.pinValue[17] = this.pinValue[3];   // QD = D

        // Load upper 4 bits
        this.pinValue[18] = this.pinValue[10];  // QE = E
        this.pinValue[19] = this.pinValue[9];   // QF = F
        this.pinValue[20] = this.pinValue[8];   // QG = G
        this.pinValue[21] = this.pinValue[7];   // QH = H

        var s = this.pinValue[14] * 1 + this.pinValue[15] * 2 +
                this.pinValue[16] * 4 + this.pinValue[17] * 8 +
                this.pinValue[18] * 16 + this.pinValue[19] * 32 +
                this.pinValue[20] * 64 + this.pinValue[21] * 128;

        // Set status flags
        this.pinValue[22] = (s == 255 || s == 0) ? 1 : 0;  // MAX/MIN
        this.pinValue[23] = 0;  // RCO
        this.operationType = 0;
        return;
    }

    // Count up mode
    if (this.operationType == 2) {
        var s = this.pinValue[14] * 1 + this.pinValue[15] * 2 +
                this.pinValue[16] * 4 + this.pinValue[17] * 8 +
                this.pinValue[18] * 16 + this.pinValue[19] * 32 +
                this.pinValue[20] * 64 + this.pinValue[21] * 128;

        var atMax = (s == 255);
        s = (s + 1) % 256;

        this.pinValue[21] = Math.floor(s / 128);
        this.pinValue[20] = Math.floor((s % 128) / 64);
        this.pinValue[19] = Math.floor((s % 64) / 32);
        this.pinValue[18] = Math.floor((s % 32) / 16);
        this.pinValue[17] = Math.floor((s % 16) / 8);
        this.pinValue[16] = Math.floor((s % 8) / 4);
        this.pinValue[15] = Math.floor((s % 4) / 2);
        this.pinValue[14] = Math.floor(s % 2);

        this.pinValue[22] = (s == 255) ? 1 : 0;  // MAX/MIN
        this.pinValue[23] = atMax ? 1 : 0;       // RCO (ripple clock at max)
        this.operationType = 0;
        return;
    }

    // Count down mode
    if (this.operationType == 3) {
        var s = this.pinValue[14] * 1 + this.pinValue[15] * 2 +
                this.pinValue[16] * 4 + this.pinValue[17] * 8 +
                this.pinValue[18] * 16 + this.pinValue[19] * 32 +
                this.pinValue[20] * 64 + this.pinValue[21] * 128;

        var atMin = (s == 0);
        s = (s - 1 + 256) % 256;

        this.pinValue[21] = Math.floor(s / 128);
        this.pinValue[20] = Math.floor((s % 128) / 64);
        this.pinValue[19] = Math.floor((s % 64) / 32);
        this.pinValue[18] = Math.floor((s % 32) / 16);
        this.pinValue[17] = Math.floor((s % 16) / 8);
        this.pinValue[16] = Math.floor((s % 8) / 4);
        this.pinValue[15] = Math.floor((s % 4) / 2);
        this.pinValue[14] = Math.floor(s % 2);

        this.pinValue[22] = (s == 0) ? 1 : 0;    // MAX/MIN
        this.pinValue[23] = atMin ? 1 : 0;       // RCO (ripple clock at min)
    }
    this.operationType = 0;
};

Compo74LS191_8bit.prototype.reset = function () {
    for (var i = 0; i < 24; i++) {
        this.pinValue[i] = 2;
    }
    this.operationType = 0;
};
