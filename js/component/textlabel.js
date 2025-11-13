/*
DS-VLAB New Feature - Text Label Component
Allows adding text annotations to circuit diagrams
Features: editable text, adjustable font size, draggable, customizable color
This is a BONUS feature for enhanced documentation
*/

function CompoTextLabel() {
    this.id;
    this.type = "annotation";  // Special type for annotations
    this.name = "TextLabel";
    this.width = 150;
    this.height = 40;
    this.image = "";
    this.paddingLR = 5;
    this.pinName = new Array();  // No pins for text labels
    this.pinWidth = 0;
    this.pinHeight = 0;
    this.showName = false;
    this.showBorder = false;

    // Text properties
    this.text = "Double-click to edit";
    this.fontSize = 14;
    this.fontColor = "#000000";
    this.backgroundColor = "rgba(255, 255, 255, 0.8)";
    this.fontFamily = "Arial, sans-serif";
    this.fontWeight = "normal";
    this.textAlign = "left";

    this.pinPosition = new Array();
    this.pinFunction = new Array();
    this.pinValue = new Array();
    this.connection = new Array();
}

// Text labels don't need electrical readiness check
CompoTextLabel.prototype.beReady = function () {
    return false;  // Never needs to compute
};

// Text labels don't have inputs
CompoTextLabel.prototype.input = function (pinNo, value) {
    return false;
};

// Text labels don't perform work
CompoTextLabel.prototype.work = function () {
    // No electrical operation
};

CompoTextLabel.prototype.reset = function () {
    // Nothing to reset
};

// Set text content
CompoTextLabel.prototype.setText = function (newText) {
    this.text = newText;
    this.updateDisplay();
};

// Set font size
CompoTextLabel.prototype.setFontSize = function (size) {
    this.fontSize = size;
    this.updateDisplay();
};

// Set font color
CompoTextLabel.prototype.setFontColor = function (color) {
    this.fontColor = color;
    this.updateDisplay();
};

// Set background color
CompoTextLabel.prototype.setBackgroundColor = function (color) {
    this.backgroundColor = color;
    this.updateDisplay();
};

// Update the display
CompoTextLabel.prototype.updateDisplay = function () {
    var elem = document.getElementById(this.id);
    if (elem) {
        var contentDiv = elem.querySelector('.text-label-content');
        if (contentDiv) {
            contentDiv.innerHTML = this.text.replace(/\n/g, '<br>');
            contentDiv.style.fontSize = this.fontSize + 'px';
            contentDiv.style.color = this.fontColor;
            contentDiv.style.fontFamily = this.fontFamily;
            contentDiv.style.fontWeight = this.fontWeight;
            contentDiv.style.textAlign = this.textAlign;
        }
        elem.style.backgroundColor = this.backgroundColor;
    }
};

// Serialize text label data for saving
CompoTextLabel.prototype.serialize = function () {
    return {
        text: this.text,
        fontSize: this.fontSize,
        fontColor: this.fontColor,
        backgroundColor: this.backgroundColor,
        fontFamily: this.fontFamily,
        fontWeight: this.fontWeight,
        textAlign: this.textAlign
    };
};

// Deserialize text label data for loading
CompoTextLabel.prototype.deserialize = function (data) {
    this.text = data.text || "Double-click to edit";
    this.fontSize = data.fontSize || 14;
    this.fontColor = data.fontColor || "#000000";
    this.backgroundColor = data.backgroundColor || "rgba(255, 255, 255, 0.8)";
    this.fontFamily = data.fontFamily || "Arial, sans-serif";
    this.fontWeight = data.fontWeight || "normal";
    this.textAlign = data.textAlign || "left";
};
