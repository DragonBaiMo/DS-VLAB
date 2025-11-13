/*
DS-VLAB Circuit-DSL: AI-Friendly Circuit Description Language
This enables AI to generate executable circuits for DS-VLAB platform

DSL Syntax Example:
------------------
circuit MyALUCircuit {
    components {
        alu1: 74LS181_8bit at (100, 100)
        counter1: 74LS163_8bit at (400, 100)
        sw1: Switch at (50, 200)
        led1: Led at (650, 200)
        label1: TextLabel at (200, 50) with text="8-bit ALU Demo"
    }

    connections {
        sw1.pin0 -> alu1.A0
        alu1.F0 -> led1.pin0
        counter1.QA -> alu1.B0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}
*/

// Circuit-DSL Parser
var CircuitDSL = (function() {
    'use strict';

    // Token types
    var TokenType = {
        KEYWORD: 'KEYWORD',
        IDENTIFIER: 'IDENTIFIER',
        NUMBER: 'NUMBER',
        STRING: 'STRING',
        SYMBOL: 'SYMBOL',
        EOF: 'EOF'
    };

    // Keywords
    var keywords = ['circuit', 'components', 'connections', 'configuration', 'at', 'with'];

    // Lexer - tokenizes the DSL input
    function tokenize(input) {
        var tokens = [];
        var i = 0;

        while (i < input.length) {
            var char = input[i];

            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Skip comments (// or #)
            if (char === '/' && input[i+1] === '/') {
                while (i < input.length && input[i] !== '\n') i++;
                continue;
            }
            if (char === '#') {
                while (i < input.length && input[i] !== '\n') i++;
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                var quote = char;
                var str = '';
                i++; // Skip opening quote
                while (i < input.length && input[i] !== quote) {
                    str += input[i++];
                }
                i++; // Skip closing quote
                tokens.push({ type: TokenType.STRING, value: str });
                continue;
            }

            // Numbers (pure numbers only, without letters)
            if (/\d/.test(char) || (char === '-' && i + 1 < input.length && /\d/.test(input[i+1]))) {
                var num = '';
                if (char === '-') {
                    num += char;
                    i++;
                    char = input[i];
                }

                // Read digits and optional decimal point
                var hasDecimal = false;
                while (i < input.length) {
                    if (/\d/.test(input[i])) {
                        num += input[i++];
                    } else if (input[i] === '.' && !hasDecimal && i + 1 < input.length && /\d/.test(input[i+1])) {
                        num += input[i++];
                        hasDecimal = true;
                    } else {
                        break;
                    }
                }

                // Check if followed by a letter or underscore - if so, it's actually an identifier
                if (i < input.length && /[a-zA-Z_]/.test(input[i])) {
                    // This is an identifier like 74LS181, not a number
                    var ident = num;
                    while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
                        ident += input[i++];
                    }
                    var type = keywords.indexOf(ident) !== -1 ? TokenType.KEYWORD : TokenType.IDENTIFIER;
                    tokens.push({ type: type, value: ident });
                } else {
                    tokens.push({ type: TokenType.NUMBER, value: parseFloat(num) });
                }
                continue;
            }

            // Identifiers and keywords (starting with letter or underscore)
            if (/[a-zA-Z_]/.test(char)) {
                var ident = '';
                while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
                    ident += input[i++];
                }
                var type = keywords.indexOf(ident) !== -1 ? TokenType.KEYWORD : TokenType.IDENTIFIER;
                tokens.push({ type: type, value: ident });
                continue;
            }

            // Symbols (handle multi-character operators first)
            if (char === '-' && input[i+1] === '>') {
                tokens.push({ type: TokenType.SYMBOL, value: '->' });
                i += 2;
                continue;
            }

            if (/[{}():,.\-=>\/]/.test(char)) {
                tokens.push({ type: TokenType.SYMBOL, value: char });
                i++;
                continue;
            }

            // Unknown character - skip it
            i++;
        }

        tokens.push({ type: TokenType.EOF, value: null });
        return tokens;
    }

    // Parser - builds AST from tokens
    function parse(tokens) {
        var pos = 0;

        function current() {
            return tokens[pos];
        }

        function consume(expected) {
            var token = current();
            if (expected && token.value !== expected) {
                throw new Error('Expected ' + expected + ' but got ' + token.value);
            }
            pos++;
            return token;
        }

        function parseCircuit() {
            consume('circuit');
            var name = consume().value;
            consume('{');

            var circuit = {
                name: name,
                components: [],
                connections: [],
                configuration: {}
            };

            while (current().value !== '}' && current().type !== TokenType.EOF) {
                if (current().value === 'components') {
                    circuit.components = parseComponents();
                } else if (current().value === 'connections') {
                    circuit.connections = parseConnections();
                } else if (current().value === 'configuration') {
                    circuit.configuration = parseConfiguration();
                } else {
                    consume();
                }
            }

            consume('}');
            return circuit;
        }

        function parseComponents() {
            consume('components');
            consume('{');

            var components = [];

            while (current().value !== '}' && current().type !== TokenType.EOF) {
                var comp = parseComponent();
                if (comp) {
                    components.push(comp);
                } else {
                    // Skip unexpected token to avoid infinite loop
                    consume();
                }
            }

            consume('}');
            return components;
        }

        function parseComponent() {
            if (current().type !== TokenType.IDENTIFIER) return null;

            var id = consume().value;
            consume(':');
            var type = consume().value;

            consume('at');
            consume('(');
            var x = consume().value;
            consume(',');
            var y = consume().value;
            consume(')');

            var properties = {};
            if (current().value === 'with') {
                consume('with');
                // Parse properties in format: key="value", key2="value2"
                while (current().value !== '}' && current().type !== TokenType.EOF) {
                    // Stop if we hit a non-identifier (next component or connections block)
                    if (current().type !== TokenType.IDENTIFIER) {
                        break;
                    }

                    var key = consume().value;

                    // Check if next token is '=' (property assignment)
                    if (current().value === '=') {
                        consume('=');
                        var value = consume().value;
                        properties[key] = value;

                        // Check for comma separator for more properties
                        if (current().value === ',') {
                            consume(',');
                        } else {
                            // No comma, we're done with properties
                            break;
                        }
                    } else {
                        // Not a property assignment, must be next component - break
                        break;
                    }
                }
            }

            return {
                id: id,
                type: type,
                x: x,
                y: y,
                properties: properties
            };
        }

        function parseConnections() {
            consume('connections');
            consume('{');

            var connections = [];

            while (current().value !== '}' && current().type !== TokenType.EOF) {
                var conn = parseConnection();
                if (conn) connections.push(conn);
            }

            consume('}');
            return connections;
        }

        function parseConnection() {
            if (current().type !== TokenType.IDENTIFIER) return null;

            var from = consume().value;
            consume('.');
            var fromPin = consume().value;
            consume('->');
            var to = consume().value;
            consume('.');
            var toPin = consume().value;

            return {
                from: from,
                fromPin: fromPin,
                to: to,
                toPin: toPin
            };
        }

        function parseConfiguration() {
            consume('configuration');
            consume('{');

            var config = {};

            while (current().value !== '}' && current().type !== TokenType.EOF) {
                var key = consume().value;
                consume(':');
                var value = consume().value;
                config[key] = value;
            }

            consume('}');
            return config;
        }

        return parseCircuit();
    }

    // Public API
    return {
        parse: function(dslCode) {
            try {
                var tokens = tokenize(dslCode);
                var ast = parse(tokens);
                return { success: true, ast: ast };
            } catch (e) {
                return { success: false, error: e.message };
            }
        },

        // Get available component types
        getComponentTypes: function() {
            return [
                '74LS181', '74LS181_8bit', '74LS163', '74LS163_8bit', '74LS191_8bit',
                '74LS245', '74LS175', '74LS174', '74LS273', '74LS139', '74LS374',
                'RAM6116', 'Switch', 'Led', 'SinglePulse', 'ContinuousPulse',
                'ANDgate', 'ORgate', 'NOTgate', 'NANDgate', 'XORgate', 'Triplegate',
                'EPROM2716C3', 'EPROM2716C4', 'SequeTimer', 'BUS', 'TextLabel'
            ];
        }
    };
})();

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CircuitDSL;
}
