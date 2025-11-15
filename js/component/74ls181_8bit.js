/*
DS-VLAB Extended Component - 8-bit ALU based on 74LS181
Extended from 4-bit to 8-bit for enhanced computational capability
Cascades two 4-bit ALU units with carry chain logic
*/

function Compo74LS181_8bit() {
    this.id;
    this.type = "i";
    this.name = "74LS181_8bit";
    this.width = 350;  // Expanded width for 8-bit
    this.height = 70;
    this.image = "";
    this.paddingLR = 5;

    // 8-bit ALU pins: A0-A7, B0-B7, F0-F7, S0-S3, M, Cn, etc.
    this.pinName = new Array(
        "A7", "A6", "A5", "A4", "A3", "A2", "A1", "A0",
        "B7", "B6", "B5", "B4", "B3", "B2", "B1", "B0",
        "S3", "S2", "S1", "S0", "M", "Cn",
        "GND", "VCC",
        "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7",
        "A=B", "P", "G", "Cn+8"
    );

    this.pinWidth = (this.width - this.paddingLR * 2) / 18;
    this.pinHeight = 19;
    this.showName = true;
    this.showBorder = true;

    var i = 1/18;
    this.pinPosition = new Array(
        // Top row: A inputs (A7-A0)
        [i * 0, 0], [i * 1, 0], [i * 2, 0], [i * 3, 0],
        [i * 4, 0], [i * 5, 0], [i * 6, 0], [i * 7, 0],
        // Top row: B inputs (B7-B0)
        [i * 8, 0], [i * 9, 0], [i * 10, 0], [i * 11, 0],
        [i * 12, 0], [i * 13, 0], [i * 14, 0], [i * 15, 0],
        // Top row: Control signals
        [i * 16, 0], [i * 17, 0], [i * 17, 1], [i * 16, 1],
        [i * 15, 1], [i * 14, 1],
        // Bottom corners: Power
        [i * 13, 1], [i * 12, 1],
        // Bottom row: F outputs (F0-F7)
        [i * 11, 1], [i * 10, 1], [i * 9, 1], [i * 8, 1],
        [i * 7, 1], [i * 6, 1], [i * 5, 1], [i * 4, 1],
        // Bottom row: Status outputs
        [i * 3, 1], [i * 2, 1], [i * 1, 1], [i * 0, 1]
    );

    // Pin functions: 0=input, 10=required input, 1=output, 2=ground, 3=power
    this.pinFunction = new Array(
        10, 10, 10, 10, 10, 10, 10, 10,  // A7-A0
        10, 10, 10, 10, 10, 10, 10, 10,  // B7-B0
        10, 10, 10, 10, 10, 10,          // S3, S2, S1, S0, M, Cn
        2, 3,                             // GND, VCC
        1, 1, 1, 1, 1, 1, 1, 1,          // F0-F7
        1, 1, 1, 1                        // A=B, P, G, Cn+8
    );

    this.pinValue = new Array(36);
    for (var i = 0; i < 36; i++) {
        this.pinValue[i] = 2;
    }

    this.connection = new Array(36);
    for (var i = 0; i < 36; i++) {
        this.connection[i] = [];
    }
}

// Check if all required inputs are ready
Compo74LS181_8bit.prototype.beReady = function () {
    for (var i = 0; i < this.pinFunction.length; i++) {
        if (this.pinFunction[i] == 10 && this.pinValue[i] == 2) {
            return false;
        }
    }
    return true;
};

// Set input pin value
Compo74LS181_8bit.prototype.input = function (pinNo, value) {
    if (value == this.pinValue[pinNo]) return false;
    this.pinValue[pinNo] = Number(value);
    return this.beReady();
};

// 8-bit ALU computation logic
// Implements two cascaded 4-bit 74LS181 units
Compo74LS181_8bit.prototype.work = function () {
    var A = [], B = [];
    var S = [], M, Cn;

    // Extract inputs
    for (var i = 0; i < 8; i++) {
        A[i] = this.pinValue[7 - i];  // A7-A0
        B[i] = this.pinValue[15 - i]; // B7-B0
    }

    S[3] = this.pinValue[16];
    S[2] = this.pinValue[17];
    S[1] = this.pinValue[18];
    S[0] = this.pinValue[19];
    M = this.pinValue[20];
    Cn = this.pinValue[21];

    // Process lower 4 bits (bits 0-3) - First 74LS181
    var x0, x1, x2, x3, y0, y1, y2, y3, c0, c1, c2, c3;

    x0 = Number(!((S[3] & S[2] & A[0]) | (S[3] & !S[2] & B[0])));
    x1 = Number(!((S[3] & S[2] & A[1]) | (S[3] & !S[2] & B[1])));
    x2 = Number(!((S[3] & S[2] & A[2]) | (S[3] & !S[2] & B[2])));
    x3 = Number(!((S[3] & S[2] & A[3]) | (S[3] & !S[2] & B[3])));

    y0 = Number(!(B[0] | (S[2] & S[0]) | (S[1] & !S[2])));
    y1 = Number(!(B[1] | (S[2] & S[0]) | (S[1] & !S[2])));
    y2 = Number(!(B[2] | (S[2] & S[0]) | (S[1] & !S[2])));
    y3 = Number(!(B[3] | (S[2] & S[0]) | (S[1] & !S[2])));

    c0 = Number(!(Cn & !M));
    c1 = Number(!((x0 & Cn | y0) & !M));
    c2 = Number(!(!M & (y1 | (y0 & x1) | (x0 & x1 & Cn))));
    c3 = Number(!(!M & (y2 | (y1 & x2) | (y0 & x1 & x2) | (x0 & x1 & x2 & Cn))));

    // Lower 4-bit outputs
    this.pinValue[24] = Number(c0 ^ x0 ^ y0);  // F0
    this.pinValue[25] = Number(c1 ^ x1 ^ y1);  // F1
    this.pinValue[26] = Number(c2 ^ x2 ^ y2);  // F2
    this.pinValue[27] = Number(c3 ^ x3 ^ y3);  // F3

    // Calculate Cn+4 for lower unit (carry into upper unit)
    var P_low = x0 & x1 & x2 & x3;
    var G_low = y3 | (y2 & x3) | (y1 & x2 & x3) | (y0 & x1 & x2 & x3);
    var Cn4 = Number(!(G_low & (!Cn | P_low)));

    // Process upper 4 bits (bits 4-7) - Second 74LS181
    var x4, x5, x6, x7, y4, y5, y6, y7, c4, c5, c6, c7;

    x4 = Number(!((S[3] & S[2] & A[4]) | (S[3] & !S[2] & B[4])));
    x5 = Number(!((S[3] & S[2] & A[5]) | (S[3] & !S[2] & B[5])));
    x6 = Number(!((S[3] & S[2] & A[6]) | (S[3] & !S[2] & B[6])));
    x7 = Number(!((S[3] & S[2] & A[7]) | (S[3] & !S[2] & B[7])));

    y4 = Number(!(B[4] | (S[2] & S[0]) | (S[1] & !S[2])));
    y5 = Number(!(B[5] | (S[2] & S[0]) | (S[1] & !S[2])));
    y6 = Number(!(B[6] | (S[2] & S[0]) | (S[1] & !S[2])));
    y7 = Number(!(B[7] | (S[2] & S[0]) | (S[1] & !S[2])));

    c4 = Number(!(Cn4 & !M));
    c5 = Number(!((x4 & Cn4 | y4) & !M));
    c6 = Number(!(!M & (y5 | (y4 & x5) | (x4 & x5 & Cn4))));
    c7 = Number(!(!M & (y6 | (y5 & x6) | (y4 & x5 & x6) | (x4 & x5 & x6 & Cn4))));

    // Upper 4-bit outputs
    this.pinValue[28] = Number(c4 ^ x4 ^ y4);  // F4
    this.pinValue[29] = Number(c5 ^ x5 ^ y5);  // F5
    this.pinValue[30] = Number(c6 ^ x6 ^ y6);  // F6
    this.pinValue[31] = Number(c7 ^ x7 ^ y7);  // F7

    // A=B output: check if all F outputs match all inputs
    var allEqual = 1;
    for (var i = 0; i < 8; i++) {
        if (this.pinValue[24+i] != (A[i] ^ B[i])) {
            allEqual = 0;
            break;
        }
    }
    this.pinValue[32] = allEqual;  // A=B

    // P (Propagate) and G (Generate) for entire 8-bit
    var P_high = x4 & x5 & x6 & x7;
    var P = Number(!(P_low & P_high));

    var G_high = y7 | (y6 & x7) | (y5 & x6 & x7) | (y4 & x5 & x6 & x7);
    var G = Number(!(G_low & (G_high | P_high)));

    this.pinValue[33] = P;     // P
    this.pinValue[34] = G;     // G

    // Cn+8 calculation
    var Cn8 = Number(!(G_high & (!Cn4 | P_high)));
    this.pinValue[35] = Cn8;   // Cn+8
};

Compo74LS181_8bit.prototype.reset = function () {
    for (var i = 0; i < 36; i++) {
        this.pinValue[i] = 2;
    }
};
