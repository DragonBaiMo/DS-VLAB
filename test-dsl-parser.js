#!/usr/bin/env node

/**
 * DS-VLAB Circuit-DSL Parser Test Script
 * Tests the DSL parsing functionality without requiring a browser
 */

// Load the DSL parser code
const fs = require('fs');
const path = require('path');

// Require the DSL module directly
const CircuitDSL = require('./js/circuit-dsl.js');

// Test utilities
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            console.log(`✓ PASS: ${name}`);
            passedTests++;
        } else {
            console.log(`✗ FAIL: ${name}`);
            failedTests++;
        }
    } catch (e) {
        console.log(`✗ ERROR: ${name}`);
        console.log(`  ${e.message}`);
        failedTests++;
    }
}

// Tests
console.log('========================================');
console.log('DS-VLAB Circuit-DSL Parser Tests');
console.log('========================================\n');

// Test 1: Basic parsing
test('Basic DSL parsing', () => {
    const dsl = `
circuit TestCircuit {
    components {
        sw1: Switch at (100, 100)
        led1: Led at (300, 100)
    }
    connections {
        sw1.pin0 -> led1.pin0
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success &&
           result.ast.name === 'TestCircuit' &&
           result.ast.components.length === 2 &&
           result.ast.connections.length === 1;
});

// Test 2: Component with properties
test('Component with text property', () => {
    const dsl = `
circuit PropTest {
    components {
        label: TextLabel at (100, 50) with text="Hello World"
    }
}`;

    const result = CircuitDSL.parse(dsl);
    if (!result.success) {
        console.log('  Parse error:', result.error);
        return false;
    }

    const label = result.ast.components[0];
    return label.id === 'label' &&
           label.type === 'TextLabel' &&
           label.properties.text === 'Hello World';
});

// Test 3: Multiple connections
test('Multiple connections', () => {
    const dsl = `
circuit MultiConn {
    components {
        c1: 74LS163_8bit at (100, 100)
        l1: Led at (200, 100)
        l2: Led at (200, 130)
    }
    connections {
        c1.QA -> l1.pin0
        c1.QB -> l2.pin0
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success && result.ast.connections.length === 2;
});

// Test 4: Comments
test('Comment handling', () => {
    const dsl = `
// This is a comment
circuit CommentTest {
    components {
        // Another comment
        sw1: Switch at (100, 100)
        # Hash style comment
        led1: Led at (300, 100)
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success && result.ast.components.length === 2;
});

// Test 5: Configuration
test('Configuration parsing', () => {
    const dsl = `
circuit ConfigTest {
    components {
        sw1: Switch at (100, 100)
    }
    configuration {
        linecolor: "#FF0000"
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success &&
           result.ast.configuration &&
           result.ast.configuration.linecolor === '#FF0000';
});

// Test 6: Empty circuit
test('Empty circuit', () => {
    const dsl = `
circuit Empty {
    components {
    }
    connections {
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success &&
           result.ast.components.length === 0 &&
           result.ast.connections.length === 0;
});

// Test 7: Extended components
test('8-bit extended components', () => {
    const dsl = `
circuit Extended {
    components {
        alu: 74LS181_8bit at (200, 100)
        counter: 74LS163_8bit at (400, 100)
        revcounter: 74LS191_8bit at (600, 100)
    }
}`;

    const result = CircuitDSL.parse(dsl);
    if (!result.success) {
        console.log('  Parse error:', result.error);
        return false;
    }

    return result.ast.components.length === 3 &&
           result.ast.components[0].type === '74LS181_8bit' &&
           result.ast.components[1].type === '74LS163_8bit' &&
           result.ast.components[2].type === '74LS191_8bit';
});

// Test 8: Error handling
test('Invalid syntax error detection', () => {
    const dsl = `
circuit Invalid {
    components {
        sw1: Switch at (100 100)  // Missing comma
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return !result.success && result.error;
});

// Test 9: Large circuit
test('Large circuit with many components', () => {
    const dsl = `
circuit Large {
    components {
        alu: 74LS181_8bit at (300, 200)
        c1: 74LS163_8bit at (100, 100)
        c2: 74LS191_8bit at (500, 100)
        sw0: Switch at (50, 150)
        sw1: Switch at (50, 180)
        sw2: Switch at (50, 210)
        led0: Led at (650, 150)
        led1: Led at (650, 180)
        led2: Led at (650, 210)
        label: TextLabel at (250, 50) with text="Test"
    }
    connections {
        sw0.pin0 -> alu.A0
        sw1.pin0 -> alu.B0
        alu.F0 -> led0.pin0
        c1.QA -> led1.pin0
        c2.QA -> led2.pin0
    }
}`;

    const result = CircuitDSL.parse(dsl);
    return result.success &&
           result.ast.components.length === 10 &&
           result.ast.connections.length === 5;
});

// Test 10: Real-world example
test('Real-world ALU demo circuit', () => {
    const dsl = `
circuit ALU_8bit_Demo {
    components {
        alu: 74LS181_8bit at (350, 200)
        sw_a0: Switch at (100, 150)
        sw_a1: Switch at (100, 180)
        sw_b0: Switch at (100, 280)
        led_f0: Led at (600, 150)
        led_f1: Led at (600, 180)
        label_title: TextLabel at (300, 80) with text="8-Bit ALU Demonstration"
    }
    connections {
        sw_a0.pin0 -> alu.A0
        sw_a1.pin0 -> alu.A1
        sw_b0.pin0 -> alu.B0
        alu.F0 -> led_f0.pin0
        alu.F1 -> led_f1.pin0
    }
    configuration {
        linecolor: "#00BFFF"
    }
}`;

    const result = CircuitDSL.parse(dsl);
    if (!result.success) {
        console.log('  Parse error:', result.error);
        return false;
    }

    return result.ast.components.length === 7 &&
           result.ast.connections.length === 5 &&
           result.ast.configuration.linecolor === '#00BFFF';
});

// Test 11: Component type registry
test('Component type registry', () => {
    const types = CircuitDSL.getComponentTypes();
    return types.length > 20 &&
           types.includes('74LS181_8bit') &&
           types.includes('74LS163_8bit') &&
           types.includes('74LS191_8bit') &&
           types.includes('TextLabel') &&
           types.includes('Switch') &&
           types.includes('Led');
});

// Test 12: Load example file
test('Parse example file: example_8bit_alu.dsl', () => {
    try {
        const examplePath = path.join(__dirname, 'examples/example_8bit_alu.dsl');
        const exampleDsl = fs.readFileSync(examplePath, 'utf8');
        const result = CircuitDSL.parse(exampleDsl);

        if (!result.success) {
            console.log('  Parse error:', result.error);
            return false;
        }

        return result.success &&
               result.ast.name === 'ALU_8bit_Demo' &&
               result.ast.components.length > 0;
    } catch (e) {
        console.log('  Error reading example file:', e.message);
        return false;
    }
});

// Summary
console.log('\n========================================');
console.log('Test Summary');
console.log('========================================');
console.log(`Total: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
console.log('========================================\n');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
