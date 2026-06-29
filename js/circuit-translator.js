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
        'RAM6116': 'CompoRAM6116',
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

    var GRID_SIZE = 5;
    var CONNECTION_RETRY_LIMIT = 15;
    var CONNECTION_RETRY_DELAY = 120;

    function nextFrame(callback) {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(callback);
        } else {
            setTimeout(callback, 16);
        }
    }

    function clearCircuit(circuit) {
        if (!circuit) {
            return;
        }

        if (typeof circuit.clearAll === 'function') {
            circuit.clearAll();
            return;
        }

        if (Array.isArray(circuit.componentAll)) {
            for (var i = circuit.componentAll.length - 1; i >= 0; i--) {
                var comp = circuit.componentAll[i];
                if (!comp || !comp.id) {
                    circuit.componentAll.splice(i, 1);
                    continue;
                }

                if (typeof document !== 'undefined') {
                    var elem = document.getElementById(comp.id);
                    if (elem) {
                        if (typeof elem.remove === 'function') {
                            elem.remove();
                        } else if (elem.parentNode) {
                            elem.parentNode.removeChild(elem);
                        }
                    }
                }
            }
            circuit.componentAll.length = 0;
        }

        if (typeof circuit.count === 'number') {
            circuit.count = 0;
        }

        if (typeof document !== 'undefined') {
            var demo = document.getElementById('demo');
            if (demo) {
                var lineNodes = demo.querySelectorAll('.div-line');
                for (var j = 0; j < lineNodes.length; j++) {
                    if (typeof lineNodes[j].remove === 'function') {
                        lineNodes[j].remove();
                    } else if (lineNodes[j].parentNode) {
                        lineNodes[j].parentNode.removeChild(lineNodes[j]);
                    }
                }
            }
        }
    }

    function snapToGrid(value, gridSize) {
        if (!gridSize) {
            return Math.round(value);
        }
        return Math.round(value / gridSize) * gridSize;
    }

    function applyComponentProperties(component, properties) {
        if (!component || !properties) {
            return;
        }

        var shouldRefresh = component.name === 'TextLabel';

        for (var key in properties) {
            if (!properties.hasOwnProperty(key)) {
                continue;
            }

            var value = properties[key];
            var setterName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);

            if (typeof component[setterName] === 'function') {
                component[setterName](value);
                shouldRefresh = true;
            } else if (Object.prototype.hasOwnProperty.call(component, key)) {
                component[key] = value;
                if (key === 'text' || key === 'fontSize' || key === 'fontColor' || key === 'backgroundColor') {
                    shouldRefresh = true;
                }
            } else {
                component[key] = value;
            }
        }

        if (shouldRefresh && typeof component.updateDisplay === 'function') {
            component.updateDisplay();
        }
    }

    // Translate AST to DS-VLAB circuit
    function translateToCircuit(ast, circuit) {
        if (!circuit) {
            throw new Error('Circuit object is required');
        }

        clearCircuit(circuit);

        var componentMap = {};  // Maps DSL component IDs to actual component objects

        // Step 1: Create all components
        var layoutItems = [];
        ast.components.forEach(function(comp) {
            var constructorName = componentMapping[comp.type];
            if (!constructorName) {
                console.error('Unknown component type: ' + comp.type);
                return;
            }

            var rawX = typeof comp.x === 'number' ? comp.x : parseFloat(comp.x);
            if (isNaN(rawX)) rawX = 0;
            var rawY = typeof comp.y === 'number' ? comp.y : parseFloat(comp.y);
            if (isNaN(rawY)) rawY = 0;

            // Add component to circuit
            circuit.addComponent('demo', constructorName, rawX, rawY);

            // Get the newly created component
            var newComponent = circuit.componentAll[circuit.componentAll.length - 1];
            componentMap[comp.id] = newComponent;

            var componentElement = document.getElementById(newComponent.id);
            if (componentElement) {
                componentElement.setAttribute('data-dsl-id', comp.id);
                componentElement.setAttribute('data-dsl-type', comp.type);
            }

            applyComponentProperties(newComponent, comp.properties);

            layoutItems.push({
                component: newComponent,
                element: componentElement,
                dslX: rawX,
                dslY: rawY
            });
        });

        var arrangedLayout = autoArrangeComponents(layoutItems);
        if (arrangedLayout && arrangedLayout.length) {
            var doc = typeof document !== 'undefined' ? document : null;
            var scrollLeft = doc ? Math.max(doc.body.scrollLeft, doc.documentElement.scrollLeft) : 0;
            var scrollTop = doc ? Math.max(doc.body.scrollTop, doc.documentElement.scrollTop) : 0;

            arrangedLayout.forEach(function(item) {
                if (!item || !item.element) {
                    return;
                }

                item.element.style.left = item.x + 'px';
                item.element.style.top = item.y + 'px';

                item.element.orig_x = item.x - scrollLeft;
                item.element.orig_y = item.y - scrollTop;
                if (typeof item.element.orig_index === 'undefined') {
                    item.element.orig_index = item.element.style.zIndex;
                }

                if (item.component) {
                    item.component.layoutX = item.x;
                    item.component.layoutY = item.y;
                }
            });
        }

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
            layout: arrangedLayout,
            message: 'Circuit created successfully with ' + ast.components.length + ' components and ' + connections.length + ' connections'
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
        if (!circuit || !fromComp || !toComp) {
            console.error('Invalid arguments when creating connection');
            return false;
        }

        if (typeof circuit.lineCreate !== 'function' ||
            typeof circuit.lineAdjust !== 'function' ||
            typeof circuit.addLineToComponent !== 'function') {
            console.error('Circuit instance is missing connection helpers');
            return false;
        }

        var fromPinId = fromComp.id + 'Pin' + fromPin;
        var toPinId = toComp.id + 'Pin' + toPin;

        var fromPinElem = document.getElementById(fromPinId);
        var toPinElem = document.getElementById(toPinId);

        if (!fromPinElem || !toPinElem) {
            console.error('Pin elements not found for connection');
            return false;
        }

        var doc = document;
        var scrollLeft = Math.max(doc.body.scrollLeft, doc.documentElement.scrollLeft);
        var scrollTop = Math.max(doc.body.scrollTop, doc.documentElement.scrollTop);

        // Get pin positions relative to the document, matching manual line drawing behaviour
        var fromRect = fromPinElem.getBoundingClientRect();
        var toRect = toPinElem.getBoundingClientRect();

        var fromX = fromRect.left + scrollLeft + fromRect.width / 2;
        var fromY = fromRect.top + scrollTop + fromRect.height / 2;
        var toX = toRect.left + scrollLeft + toRect.width / 2;
        var toY = toRect.top + scrollTop + toRect.height / 2;

        // Create the line and then adjust it using the platform's routing logic
        var line = circuit.lineCreate('demo', fromX, fromY, toX, toY);

        if (!line) {
            console.error('Failed to create line for connection');
            return false;
        }

        circuit.lineAdjust(line, fromPinElem, toPinElem);
        circuit.addLineToComponent(line, fromPinElem, toPinElem);

        return true;
    }

    function applyConnections(circuit, connections, options) {
        if (!circuit || !Array.isArray(connections) || connections.length === 0) {
            return;
        }

        options = options || {};
        var initialDelay = typeof options.initialDelay === 'number' ? options.initialDelay : 0;

        function connectWithRetry(index, retryCount) {
            if (index >= connections.length) {
                return;
            }

            var conn = connections[index];
            if (!conn) {
                nextFrame(function() {
                    connectWithRetry(index + 1, 0);
                });
                return;
            }

            var success = createConnection(circuit, conn.fromComp, conn.fromPin, conn.toComp, conn.toPin);
            if (success) {
                nextFrame(function() {
                    connectWithRetry(index + 1, 0);
                });
                return;
            }

            if (retryCount >= CONNECTION_RETRY_LIMIT) {
                console.warn('自动布线失败，已达到重试上限:', conn);
                nextFrame(function() {
                    connectWithRetry(index + 1, 0);
                });
                return;
            }

            setTimeout(function() {
                connectWithRetry(index, retryCount + 1);
            }, CONNECTION_RETRY_DELAY);
        }

        var start = function() {
            nextFrame(function() {
                connectWithRetry(0, 0);
            });
        };

        if (initialDelay > 0) {
            setTimeout(start, initialDelay);
        } else {
            start();
        }
    }

    function autoArrangeComponents(layoutItems) {
        if (!layoutItems || layoutItems.length === 0) {
            return [];
        }

        if (typeof document === 'undefined') {
            return layoutItems.map(function(item) {
                return {
                    component: item.component,
                    element: item.element,
                    x: Math.round(item && item.dslX ? item.dslX : 0),
                    y: Math.round(item && item.dslY ? item.dslY : 0)
                };
            });
        }

        var demo = document.getElementById('demo');
        if (!demo) {
            return layoutItems.map(function(item) {
                return {
                    component: item.component,
                    element: item.element,
                    x: Math.round(item && item.dslX ? item.dslX : 0),
                    y: Math.round(item && item.dslY ? item.dslY : 0)
                };
            });
        }

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;

        layoutItems.forEach(function(item) {
            if (!item) {
                return;
            }

            var baseX = typeof item.dslX === 'number' ? item.dslX : parseFloat(item.dslX);
            if (isNaN(baseX)) {
                baseX = 0;
            }
            var baseY = typeof item.dslY === 'number' ? item.dslY : parseFloat(item.dslY);
            if (isNaN(baseY)) {
                baseY = 0;
            }

            var width = 0;
            var height = 0;

            if (item.element) {
                width = item.element.offsetWidth || item.element.clientWidth || 0;
                height = item.element.offsetHeight || item.element.clientHeight || 0;
            }

            if (!width && item.component && item.component.width) {
                width = item.component.width;
            }

            if (!height && item.component && item.component.height) {
                height = item.component.height;
            }

            minX = Math.min(minX, baseX);
            minY = Math.min(minY, baseY);
            maxX = Math.max(maxX, baseX + width);
            maxY = Math.max(maxY, baseY + height);

            item._baseX = baseX;
            item._baseY = baseY;
        });

        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            return [];
        }

        var layoutWidth = Math.max(1, maxX - minX);
        var layoutHeight = Math.max(1, maxY - minY);

        var demoRect = demo.getBoundingClientRect();
        var availableWidth = demoRect.width || demo.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : layoutWidth);
        var availableHeight = demoRect.height || demo.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : layoutHeight);

        var toolbox = document.getElementById('toolbox');
        var menu = document.getElementById('menu');
        var toolbar = document.getElementById('toolbar');

        var leftMargin = 40;
        var topMargin = 40;
        var rightMargin = 40;
        var bottomMargin = 60;

        if (toolbox) {
            leftMargin = Math.max(leftMargin, toolbox.offsetWidth + 30);
        }

        if (menu) {
            topMargin = Math.max(topMargin, menu.offsetHeight + 10);
        }

        if (toolbar) {
            var menuHeight = menu ? menu.offsetHeight : 0;
            topMargin = Math.max(topMargin, menuHeight + toolbar.offsetHeight + 20);
        }

        var effectiveWidth = Math.max(1, availableWidth - leftMargin - rightMargin);
        var effectiveHeight = Math.max(1, availableHeight - topMargin - bottomMargin);

        var targetCenterX = leftMargin + effectiveWidth / 2;
        var targetCenterY = topMargin + effectiveHeight / 2;

        var currentCenterX = minX + layoutWidth / 2;
        var currentCenterY = minY + layoutHeight / 2;

        var deltaX = targetCenterX - currentCenterX;
        var deltaY = targetCenterY - currentCenterY;

        if (!isFinite(deltaX)) deltaX = 0;
        if (!isFinite(deltaY)) deltaY = 0;

        var adjustedMinX = minX + deltaX;
        var adjustedMinY = minY + deltaY;
        var adjustedMaxX = maxX + deltaX;
        var adjustedMaxY = maxY + deltaY;

        if (adjustedMinX < leftMargin) {
            var adjustX = leftMargin - adjustedMinX;
            deltaX += adjustX;
            adjustedMaxX += adjustX;
            adjustedMinX = leftMargin;
        }

        var rightLimit = availableWidth - rightMargin;
        if (adjustedMaxX > rightLimit) {
            var diffX = adjustedMaxX - rightLimit;
            deltaX -= diffX;
            adjustedMinX -= diffX;
        }

        if (adjustedMinY < topMargin) {
            var adjustY = topMargin - adjustedMinY;
            deltaY += adjustY;
            adjustedMaxY += adjustY;
            adjustedMinY = topMargin;
        }

        var bottomLimit = availableHeight - bottomMargin;
        if (adjustedMaxY > bottomLimit) {
            var diffY = adjustedMaxY - bottomLimit;
            deltaY -= diffY;
        }

        var results = [];

        layoutItems.forEach(function(item) {
            if (!item) {
                return;
            }

            var baseX = typeof item._baseX === 'number' ? item._baseX : 0;
            var baseY = typeof item._baseY === 'number' ? item._baseY : 0;

            var newLeft = snapToGrid(baseX + deltaX, GRID_SIZE);
            var newTop = snapToGrid(baseY + deltaY, GRID_SIZE);

            results.push({
                component: item.component,
                element: item.element,
                x: newLeft,
                y: newTop
            });
        });

        return results;
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
        applyConnections: applyConnections,
        generateDSL: generateDSL,
        findPinIndex: findPinIndex
    };
})();
