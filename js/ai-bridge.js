/*
DS-VLAB AI Bridge Layer
This module provides the interface for AI to generate and manipulate circuits
Integrates Circuit-DSL parser and translator with the main platform
*/

var AIBridge = (function () {
    'use strict';

    // Execute DSL code and create circuit
    function executeDSL(dslCode, circuit) {
        // Parse DSL
        var parseResult = CircuitDSL.parse(dslCode);

        if (!parseResult.success) {
            return {
                success: false,
                error: 'DSL Parse Error: ' + parseResult.error
            };
        }

        // Translate to circuit
        try {
            var translateResult = CircuitTranslator.translate(parseResult.ast, circuit);

            // Create connections after layout settles
            if (translateResult.connections && translateResult.connections.length > 0) {
                CircuitTranslator.applyConnections(circuit, translateResult.connections, {
                    initialDelay: 150
                });
            }

            return {
                success: true,
                message: translateResult.message,
                ast: parseResult.ast,
                layout: translateResult.layout
            };
        } catch (e) {
            return {
                success: false,
                error: 'Translation Error: ' + e.message
            };
        }
    }

    // Export current circuit as DSL
    function exportToDSL(circuit) {
        try {
            var dslCode = CircuitTranslator.generateDSL(circuit);
            return {
                success: true,
                dsl: dslCode
            };
        } catch (e) {
            return {
                success: false,
                error: 'Export Error: ' + e.message
            };
        }
    }

    // Get AI-friendly component documentation
    function getComponentDocs() {
        return {
            "74LS181": "4-bit ALU with arithmetic and logic operations",
            "74LS181_8bit": "8-bit ALU (extended version) with arithmetic and logic operations",
            "74LS163": "4-bit synchronous counter with clear and load",
            "74LS163_8bit": "8-bit synchronous counter (extended version)",
            "74LS191_8bit": "8-bit up/down counter with reversible counting capability",
            "Switch": "Manual input switch (0/1 toggle)",
            "Led": "LED output indicator",
            "TextLabel": "Text annotation for circuit documentation",
            "SinglePulse": "Single pulse generator",
            "ContinuousPulse": "Continuous clock pulse generator"
        };
    }

    // Get example DSL code
    function getExampleDSL() {
        return {
            "simple_counter": `circuit SimpleCounter {
    components {
        counter: 74LS163_8bit at (200, 100)
        clock: ContinuousPulse at (50, 150)
        led0: Led at (400, 100)
        led1: Led at (450, 100)
        label: TextLabel at (150, 50) with text="8-bit Counter Demo"
    }

    connections {
        clock.pin0 -> counter.CP
        counter.QA -> led0.pin0
        counter.QB -> led1.pin0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}`,
            "alu_demo": `circuit ALUDemo {
    components {
        alu: 74LS181_8bit at (300, 150)
        sw_a0: Switch at (100, 100)
        sw_b0: Switch at (100, 200)
        led_f0: Led at (550, 150)
        label: TextLabel at (250, 50) with text="8-bit ALU Demonstration"
    }

    connections {
        sw_a0.pin0 -> alu.A0
        sw_b0.pin0 -> alu.B0
        alu.F0 -> led_f0.pin0
    }

    configuration {
        linecolor: "#00FF00"
    }
}`,
            "reversible_counter": `circuit ReversibleCounter {
    components {
        counter: 74LS191_8bit at (250, 150)
        clock: ContinuousPulse at (50, 150)
        dir_switch: Switch at (50, 200)
        led_out: Led at (500, 150)
        label: TextLabel at (200, 80) with text="Up/Down Counter"
    }

    connections {
        clock.pin0 -> counter.CP
        dir_switch.pin0 -> counter.D/U
        counter.QA -> led_out.pin0
    }
}`,
            "text_annotation": `circuit AnnotatedCircuit {
    components {
        label1: TextLabel at (100, 50) with text="Input Section"
        label2: TextLabel at (400, 50) with text="Processing"
        label3: TextLabel at (700, 50) with text="Output"
        sw1: Switch at (100, 150)
        alu: 74LS181_8bit at (400, 150)
        led1: Led at (700, 150)
    }
}`
        };
    }

    // Validate DSL syntax
    function validateDSL(dslCode) {
        var parseResult = CircuitDSL.parse(dslCode);
        return parseResult;
    }

    // Parse and execute DSL code
    function executeDSLCode(dslCode, circuit) {
        var result = executeDSL(dslCode, circuit);
        if (result.success) {
            alert("电路创建成功！\nCircuit created successfully!\n\n" + result.message);
        } else {
            alert("错误 (Error):\n" + result.error);
        }
    }
    // Show DSL editor dialog
    function showDSLEditor(circuit) {
        var $dialog = $("#dslEditorDialog");
        if ($dialog.length === 0) {
            $dialog = $('<div id="dslEditorDialog" title="Circuit-DSL 编辑器 (Editor)">' +
                '<div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">' +
                '<span>在此处输入或粘贴 DSL 代码:</span>' +
                '<select id="dslExampleSelect" style="padding: 2px;">' +
                '<option value="">-- 插入示例 (Insert Example) --</option>' +
                '<option value="simple_counter">简单计数器 (Simple Counter)</option>' +
                '<option value="alu_demo">8位 ALU 演示 (8-bit ALU)</option>' +
                '<option value="reversible_counter">可逆计数器 (Reversible Counter)</option>' +
                '<option value="text_annotation">文字标注 (Text Annotation)</option>' +
                '</select>' +
                '</div>' +
                '<textarea id="dslCodeInput" class="text ui-widget-content ui-corner-all" style="width: 100%; height: 300px; font-family: monospace; box-sizing: border-box; padding: 5px; white-space: pre; overflow: auto;"></textarea>' +
                '</div>').appendTo('body');

            // Handle example selection
            $(document).on('change', '#dslExampleSelect', function () {
                var selected = $(this).val();
                if (selected) {
                    var examples = getExampleDSL();
                    if (examples[selected]) {
                        $("#dslCodeInput").val(examples[selected]);
                    }
                    $(this).val(""); // Reset selection
                }
            });
        }

        // Set default example if empty
        var defaultCode = "circuit MyCircuit {\n" +
            "  components {\n" +
            "    sw1: Switch at (100, 100)\n" +
            "    led1: Led at (300, 100)\n" +
            "  }\n" +
            "  connections {\n" +
            "    sw1.pin0 -> led1.pin0\n" +
            "  }\n" +
            "}";

        if (!$("#dslCodeInput").val()) {
            $("#dslCodeInput").val(defaultCode);
        }

        $dialog.dialog({
            modal: true,
            width: 700,
            height: 550,
            buttons: {
                "生成电路 (Generate)": function () {
                    var dslCode = $("#dslCodeInput").val();
                    if (dslCode) {
                        executeDSLCode(dslCode, circuit);
                        $(this).dialog("close");
                    }
                },
                "清空 (Clear)": function () {
                    $("#dslCodeInput").val("");
                },
                "取消 (Cancel)": function () {
                    $(this).dialog("close");
                }
            }
        });
    }

    // Import DSL from file
    function importDSLFile(circuit, fileInputElement) {
        var file = fileInputElement.files[0];
        if (!file) {
            alert("请先选择一个 DSL 文件\nPlease select a DSL file first");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var dslCode = e.target.result;
            executeDSLCode(dslCode, circuit);
        };
        reader.onerror = function () {
            alert("读取文件失败\nFailed to read file");
        };
        reader.readAsText(file);
    }

    // Export current circuit as DSL
    function showDSLExport(circuit) {
        var result = exportToDSL(circuit);
        if (result.success) {
            var $dialog = $("#dslExportDialog");
            if ($dialog.length === 0) {
                $dialog = $('<div id="dslExportDialog" title="导出 DSL (Export DSL)">' +
                    '<p style="margin-bottom: 5px;">复制以下代码 (Copy the code below):</p>' +
                    '<textarea id="dslCodeOutput" readonly class="text ui-widget-content ui-corner-all" style="width: 100%; height: 300px; font-family: monospace; box-sizing: border-box; padding: 5px;"></textarea>' +
                    '</div>').appendTo('body');
            }

            $("#dslCodeOutput").val(result.dsl);

            $dialog.dialog({
                modal: true,
                width: 600,
                height: 500,
                buttons: {
                    "复制 (Copy)": function () {
                        var copyText = document.getElementById("dslCodeOutput");
                        copyText.select();
                        document.execCommand("copy");
                        // alert("代码已复制到剪贴板 (Copied to clipboard)");
                    },
                    "关闭 (Close)": function () {
                        $(this).dialog("close");
                    }
                }
            });
        } else {
            alert("导出失败 (Export failed):\n" + result.error);
        }
    }

    // Public API
    return {
        execute: executeDSL,
        export: exportToDSL,
        validate: validateDSL,
        getComponentDocs: getComponentDocs,
        getExamples: getExampleDSL,
        showEditor: showDSLEditor,
        showExport: showDSLExport,
        importFile: importDSLFile
    };
})();

// Make AIBridge globally accessible
window.AIBridge = AIBridge;
