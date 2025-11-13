/*
DS-VLAB Extended Component - 8-bit Synchronous Counter based on 74LS163
Extended from 4-bit to 8-bit for enhanced counting capability
Features: synchronous clear, parallel load, count enable
*/

function Compo74LS163_8bit() {
    this.id;
    this.type = "i";
    this.name = "74LS163_8bit";
    this.width = 260;
    this.height = 65;
    this.image = "";
    this.paddingLR = 3;

    // 8-bit counter pins
    this.pinName = new Array(
        "-CR", "CP",
        "D", "C", "B", "A",     // Lower 4 bits input
        "H", "G", "F", "E",     // Upper 4 bits input
        "ENP", "ENT",
        "GND", "VCC",
        "-LD",
        "QA", "QB", "QC", "QD",  // Lower 4 bits output
        "QE", "QF", "QG", "QH",  // Upper 4 bits output
        "RCO"
    );

    this.pinWidth = (this.width - this.paddingLR * 2) / 13;
    this.pinHeight = 19;
    this.showName = true;
    this.showBorder = true;

    var i = 1 / 13;
    this.pinPosition = new Array(
        // Top row
        [i * 0, 0], [i * 1, 0], [i * 2, 0], [i * 3, 0],
        [i * 4, 0], [i * 5, 0], [i * 6, 0], [i * 7, 0],
        [i * 8, 0], [i * 9, 0], [i * 10, 0],
        // Corners
        [i * 11, 0], [i * 12, 0],
        // Bottom row
        [i * 12, 1], [i * 11, 1], [i * 10, 1], [i * 9, 1],
        [i * 8, 1], [i * 7, 1], [i * 6, 1], [i * 5, 1],
        [i * 4, 1], [i * 3, 1], [i * 2, 1], [i * 1, 1],
        [i * 0, 1]
    );

    // Pin functions: 0=input, 10=required input, 1=output, 2=ground, 3=power
    this.pinFunction = new Array(
        10, 0,                    // -CR, CP
        0, 0, 0, 0,               // D, C, B, A
        0, 0, 0, 0,               // H, G, F, E
        0, 0,                     // ENP, ENT
        2, 3,                     // GND, VCC
        0,                        // -LD
        1, 1, 1, 1,               // QA, QB, QC, QD
        1, 1, 1, 1,               // QE, QF, QG, QH
        1                         // RCO
    );

    this.pinValue = new Array(25);
    for (var i = 0; i < 25; i++) {
        this.pinValue[i] = 2;
    }

    this.connection = new Array(25);
    for (var i = 0; i < 25; i++) {
        this.connection[i] = [];
    }

    this.operationType = 0;
}

// Check if all required inputs are ready
Compo74LS163_8bit.prototype.beReady = function () {
    for (var i = 0; i < this.pinFunction.length; i++) {
        if (this.pinFunction[i] == 10 && this.pinValue[i] == 2) {
            return false;
        }
    }
    return true;
};

// Set input pin value
Compo74LS163_8bit.prototype.input = function (pinNo, value) {
    if (value == this.pinValue[pinNo]) return false;
    var oldv = this.pinValue[pinNo];
    this.pinValue[pinNo] = value;

    // Clock rising edge detection (pin 1 = CP)
    if (pinNo == 1 && oldv == 0 && value == 1) {
        // Clear mode (pin 0 = -CR)
        if (this.pinValue[0] == 0) {
            this.operationType = 1;
            return true;
        }

        // Load mode (pin 0 = -CR, pin 14 = -LD)
        if (this.pinValue[0] == 1 && this.pinValue[14] == 0) {
            for (var i = 2; i <= 9; i++) {
                if (this.pinValue[i] == 2) {
                    return false;
                }
            }
            this.operationType = 2;
            return true;
        }

        // Count mode (pin 10 = ENP, pin 11 = ENT)
        if (this.pinValue[0] == 1 && this.pinValue[14] == 1 &&
            this.pinValue[10] == 1 && this.pinValue[11] == 1) {
            for (var i = 15; i <= 22; i++) {
                if (this.pinValue[i] == 2) {
                    return false;
                }
            }
            this.operationType = 3;
            return true;
        }
    }
    return false;
};

// 8-bit counter logic
Compo74LS163_8bit.prototype.work = function () {
    // Clear mode
    if (this.operationType == 1) {
        for (var i = 15; i <= 22; i++) {
            this.pinValue[i] = 0;
        }
        this.pinValue[23] = 0;  // RCO
        this.operationType = 0;
        return;
    }

    // Load mode
    if (this.operationType == 2) {
        // Load lower 4 bits (A, B, C, D -> QA, QB, QC, QD)
        this.pinValue[15] = this.pinValue[5];  // QA = A
        this.pinValue[16] = this.pinValue[4];  // QB = B
        this.pinValue[17] = this.pinValue[3];  // QC = C
        this.pinValue[18] = this.pinValue[2];  // QD = D

        // Load upper 4 bits (E, F, G, H -> QE, QF, QG, QH)
        this.pinValue[19] = this.pinValue[9];  // QE = E
        this.pinValue[20] = this.pinValue[8];  // QF = F
        this.pinValue[21] = this.pinValue[7];  // QG = G
        this.pinValue[22] = this.pinValue[6];  // QH = H

        var s = this.pinValue[15] * 1 + this.pinValue[16] * 2 +
                this.pinValue[17] * 4 + this.pinValue[18] * 8 +
                this.pinValue[19] * 16 + this.pinValue[20] * 32 +
                this.pinValue[21] * 64 + this.pinValue[22] * 128;

        this.pinValue[23] = (s == 255) ? 1 : 0;  // RCO
        this.operationType = 0;
        return;
    }

    // Count mode
    if (this.operationType == 3) {
        var s = this.pinValue[15] * 1 + this.pinValue[16] * 2 +
                this.pinValue[17] * 4 + this.pinValue[18] * 8 +
                this.pinValue[19] * 16 + this.pinValue[20] * 32 +
                this.pinValue[21] * 64 + this.pinValue[22] * 128;

        s = (s + 1) % 256;

        this.pinValue[22] = Math.floor(s / 128);
        this.pinValue[21] = Math.floor((s % 128) / 64);
        this.pinValue[20] = Math.floor((s % 64) / 32);
        this.pinValue[19] = Math.floor((s % 32) / 16);
        this.pinValue[18] = Math.floor((s % 16) / 8);
        this.pinValue[17] = Math.floor((s % 8) / 4);
        this.pinValue[16] = Math.floor((s % 4) / 2);
        this.pinValue[15] = Math.floor(s % 2);

        this.pinValue[23] = (s == 255) ? 1 : 0;  // RCO
    }
    this.operationType = 0;
};

Compo74LS163_8bit.prototype.reset = function () {
    for (var i = 0; i < 25; i++) {
        this.pinValue[i] = 2;
    }
    this.operationType = 0;
};
