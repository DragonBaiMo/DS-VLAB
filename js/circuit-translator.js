/*
DS-VLAB Circuit Translator: Converts Circuit-DSL AST to executable DS-VLAB circuit
This is the bridge between AI-generated DSL and the platform's internal representation
*/

var CircuitTranslator = (function() {
    'use strict';

    // Component name mapping (DSL name -> Constructor name)
    var componentMapping = {
        '74LS181': 'Compo74LS181',
        '74LS181_8bit': 'Compo74LS181_8bit',
        '74LS163': 'Compo74LS163',
        '74LS163_8bit': 'Compo74LS163_8bit',
        '74LS191_8bit': 'Compo74LS191_8bit',
        '74LS245': 'Compo74LS245',
        '74LS175': 'Compo74LS175',
        '74LS174': 'Compo74LS174',
        '74LS273': 'Compo74LS273',
        '74LS139': 'Compo74LS139',
        '74LS374': 'Compo74LS374',
        'RAM6116': 'Comporam6116',
        'Switch': 'CompoSwitch',
        'Led': 'CompoLed',
        'SinglePulse': 'CompoSinglePulse',
        'ContinuousPulse': 'CompoContinuousPulse',
        'ANDgate': 'CompoANDgate',
        'ORgate': 'CompoORgate',
        'NOTgate': 'CompoNOTgate',
        'NANDgate': 'CompoNANDgate',
        'XORgate': 'CompoXORgate',
        'Triplegate': 'CompoTriplegate',
        'EPROM2716C3': 'CompoEPROM2716C3',
        'EPROM2716C4': 'CompoEPROM2716C4',
        'SequeTimer': 'CompoSequeTimer',
        'BUS': 'CompoBUS',
        'TextLabel': 'CompoTextLabel'
    };

    // Translate AST to DS-VLAB circuit
    function translateToCircuit(ast, circuit) {
        if (!circuit) {
            throw new Error('Circuit object is required');
        }

        var componentMap = {};  // Maps DSL component IDs to actual component objects

        // Step 1: Create all components
        ast.components.forEach(function(comp) {
            var constructorName = componentMapping[comp.type];
            if (!constructorName) {
                console.error('Unknown component type: ' + comp.type);
                return;
            }

            // Add component to circuit
            circuit.addComponent('demo', constructorName, comp.x, comp.y);

            // Get the newly created component
            var newComponent = circuit.componentAll[circuit.componentAll.length - 1];
            componentMap[comp.id] = newComponent;

            // Apply properties
            if (comp.properties) {
                for (var key in comp.properties) {
                    if (newComponent[key] !== undefined) {
                        newComponent[key] = comp.properties[key];
                    }
                }

                // Special handling for TextLabel
                if (comp.type === 'TextLabel' && comp.properties.text) {
                    newComponent.text = comp.properties.text;
                    newComponent.updateDisplay();
                }
            }
        });

        // Step 2: Create connections
        // Note: In DS-VLAB, connections are created by simulating pin dragging
        // For DSL, we'll store connection information that can be used later
        var connections = [];
        ast.connections.forEach(function(conn) {
            var fromComp = componentMap[conn.from];
            var toComp = componentMap[conn.to];

            if (!fromComp) {
                console.error('Source component not found: ' + conn.from);
                return;
            }
            if (!toComp) {
                console.error('Target component not found: ' + conn.to);
                return;
            }

            // Find pin indices
            var fromPinIndex = findPinIndex(fromComp, conn.fromPin);
            var toPinIndex = findPinIndex(toComp, conn.toPin);

            if (fromPinIndex === -1) {
                console.error('Source pin not found: ' + conn.fromPin + ' on ' + conn.from);
                return;
            }
            if (toPinIndex === -1) {
                console.error('Target pin not found: ' + conn.toPin + ' on ' + conn.to);
                return;
            }

            connections.push({
                fromComp: fromComp,
                fromPin: fromPinIndex,
                toComp: toComp,
                toPin: toPinIndex
            });
        });

        // Step 3: Apply configuration
        if (ast.configuration) {
            if (ast.configuration.linecolor) {
                circuit.linecolor = ast.configuration.linecolor;
                circuit.linecolorchange(ast.configuration.linecolor);
            }
        }

        return {
            success: true,
            componentMap: componentMap,
            connections: connections,
            message: 'Circuit created successfully with ' + ast.components.length + ' components'
        };
    }

    // Find pin index by name or pin notation
    function findPinIndex(component, pinIdentifier) {
        // Try direct pin number (e.g., "pin0", "pin5")
        if (pinIdentifier.indexOf('pin') === 0) {
            var num = parseInt(pinIdentifier.substring(3));
            if (!isNaN(num) && num >= 0 && num < component.pinName.length) {
                return num;
            }
        }

        // Try pin name (e.g., "A0", "QB", "CP")
        for (var i = 0; i < component.pinName.length; i++) {
            if (component.pinName[i] === pinIdentifier) {
                return i;
            }
        }

        // Try case-insensitive match
        var lowerPin = pinIdentifier.toLowerCase();
        for (var i = 0; i < component.pinName.length; i++) {
            if (component.pinName[i].toLowerCase() === lowerPin) {
                return i;
            }
        }

        return -1;
    }

    // Helper function to create connections after circuit is built
    function createConnection(circuit, fromComp, fromPin, toComp, toPin) {
        var fromPinId = fromComp.id + 'Pin' + fromPin;
        var toPinId = toComp.id + 'Pin' + toPin;

        var fromPinElem = document.getElementById(fromPinId);
        var toPinElem = document.getElementById(toPinId);

        if (!fromPinElem || !toPinElem) {
            console.error('Pin elements not found for connection');
            return false;
        }

        // Get pin positions
        var fromRect = fromPinElem.getBoundingClientRect();
        var toRect = toPinElem.getBoundingClientRect();

        var fromX = fromRect.left + fromRect.width / 2;
        var fromY = fromRect.top + fromRect.height / 2;
        var toX = toRect.left + toRect.width / 2;
        var toY = toRect.top + toRect.height / 2;

        // Create the line
        var line = circuit.lineCreate('demo', fromX, fromY, toX, toY);

        // Update connection data
        line.id = fromPinId + 'To' + toPinId;
        fromComp.connection[fromPin].push([fromPinElem, toPinElem, line]);
        toComp.connection[toPin].push([fromPinElem, toPinElem, line]);

        return true;
    }

    // Generate DSL code from existing circuit
    function generateDSL(circuit) {
        var dsl = 'circuit GeneratedCircuit {\n';
        dsl += '    components {\n';

        // Generate component definitions
        circuit.componentAll.forEach(function(comp) {
            var elem = document.getElementById(comp.id);
            if (!elem) return;

            var x = parseInt(elem.style.left);
            var y = parseInt(elem.style.top);

            // Find DSL name for component
            var dslType = comp.name;
            for (var key in componentMapping) {
                if (componentMapping[key] === 'Compo' + comp.name) {
                    dslType = key;
                    break;
                }
            }

            dsl += '        comp' + comp.id.substring(2) + ': ' + dslType + ' at (' + x + ', ' + y + ')';

            // Add text property for TextLabel
            if (comp.name === 'TextLabel') {
                dsl += ' with text="' + comp.text.replace(/"/g, '\\"') + '"';
            }

            dsl += '\n';
        });

        dsl += '    }\n\n';
        dsl += '    connections {\n';

        // Generate connections
        circuit.componentAll.forEach(function(comp) {
            comp.connection.forEach(function(connList, pinIndex) {
                if (comp.pinFunction[pinIndex] === 1 || comp.pinFunction[pinIndex] === 11) {
                    connList.forEach(function(conn) {
                        var targetPinId = conn[1].id;
                        var targetCompId = targetPinId.substring(0, targetPinId.indexOf('Pin'));
                        var targetPinNum = targetPinId.substring(targetPinId.indexOf('Pin') + 3);

                        var targetComp = circuit.componentAll.find(function(c) {
                            return c.id === targetCompId;
                        });

                        if (targetComp) {
                            dsl += '        comp' + comp.id.substring(2) + '.' + comp.pinName[pinIndex] +
                                   ' -> comp' + targetCompId.substring(2) + '.' + targetComp.pinName[targetPinNum] + '\n';
                        }
                    });
                }
            });
        });

        dsl += '    }\n\n';
        dsl += '    configuration {\n';
        dsl += '        linecolor: "' + circuit.linecolor + '"\n';
        dsl += '    }\n';
        dsl += '}\n';

        return dsl;
    }

    // Public API
    return {
        translate: translateToCircuit,
        createConnection: createConnection,
        generateDSL: generateDSL,
        findPinIndex: findPinIndex
    };
})();
