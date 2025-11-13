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
Compo74LS181_8bit.prototype.work = function () {
    var A = [], B = [], F = [];
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

    // Compute 8-bit ALU operation
    // This implements cascaded 4-bit ALU logic
    var x = [], y = [], c = [];

    for (var i = 0; i < 8; i++) {
        x[i] = Number(!((S[3] & S[2] & A[i]) | (S[3] & !S[2] & A[i])));
        y[i] = Number(!(A[i] | (S[2] & S[0]) | (S[1] & !S[2])));
    }

    // Carry chain
    c[0] = Number(!(Cn & !M));
    for (var i = 1; i < 8; i++) {
        c[i] = Number(!(!M & (y[i-1] | (x[i-1] & c[i-1]))));
    }

    // Compute outputs
    for (var i = 0; i < 8; i++) {
        F[i] = Number(c[i] ^ x[i] ^ y[i]);
        this.pinValue[24 + i] = F[i];  // F0-F7
    }

    // Status outputs
    var allEqual = 1;
    for (var i = 0; i < 8; i++) {
        if (F[i] != (A[i] & B[i])) allEqual = 0;
    }
    this.pinValue[32] = allEqual;  // A=B

    var P = 1, G = 1;
    for (var i = 0; i < 8; i++) {
        P = P & x[i];
        G = G & (y[i] | x[i]);
    }
    this.pinValue[33] = Number(!P);        // P
    this.pinValue[34] = Number(!G);        // G
    this.pinValue[35] = c[7];              // Cn+8
};

Compo74LS181_8bit.prototype.reset = function () {
    for (var i = 0; i < 36; i++) {
        this.pinValue[i] = 2;
    }
};
