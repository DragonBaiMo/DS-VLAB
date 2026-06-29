/*
Duosi Principles of Computer Composition Virtual Experiment System ,DS-VLAB v1.0
Copyright(C)2013 ZHANG Wen-fen, Email: yydzhwf@163.com  Address: Xiangnan University, Chenzhou Hunan, China
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

多思计算机组成原理网络虚拟实验系统, DS-VLAB v1.0 
版权所有(C) 张雯雰, 电子邮箱: yydzhwf@163.com
本程序为自由软件；您可依据自由软件基金会所发表的GNU GENERAL PUBLIC LICENSE，对本程序再次发布和/或修改。

作者：湘南学院软件与通信工程学院张雯雰老师
*/

function toolbox() {
    var init = function () {
        // Initialize Accordion
        $("#accordion").accordion({
            heightStyle: "fill",
            collapsible: true,
            animate: 200 // Faster, smoother animation
        });

        // Initialize Resizable Toolbox
        $("#accordion-resizer").resizable({
            minHeight: 250,
            minWidth: 150,
            // Remove the laggy 'resize' event handler. 
            // The 'stop' event is sufficient if we really need to refresh, 
            // but usually heightStyle: "fill" handles it well enough with CSS.
            stop: function () {
                $("#accordion").accordion("refresh");
            }
        });

        // Make Toolbox Draggable
        $("#toolbox").draggable({
            handle: ".ui-widget-header", // Drag by header
            containment: "window"
        });

        // Make List Items Draggable
        $("#accordion li").draggable({
            appendTo: "body",
            helper: "clone",
            revert: "invalid",
            cursor: "move",
            zIndex: 10000,
            start: function (event, ui) {
                $(ui.helper).addClass("ui-draggable-dragging");
            }
        });

        // Make Canvas Droppable
        $("#demo").droppable({
            accept: "#accordion li",
            drop: function (event, ui) {
                var cName = ui.draggable.text().trim();

                // Map Chinese names to Component Class Names if necessary
                // This mapping should ideally be centralized
                var componentMap = {
                    "开关": "Switch",
                    "小灯": "Led",
                    "单脉冲": "SinglePulse",
                    "连续脉冲": "ContinuousPulse",
                    "74LS181": "74LS181",
                    "74LS245": "74LS245",
                    "74LS374": "74LS374",
                    "6116RAM": "RAM6116",
                    "2716ROM": "EPROM2716C3" // Assuming default
                    // Add other mappings as needed based on the UI text
                };

                // If direct mapping exists, use it. Otherwise try to use the text as is (for English names)
                // Or check if the text contains the chip name
                var finalName = cName;

                // Simple heuristic: if it contains English letters, try to extract them
                // But for now, let's assume the text in LI matches or we use the map
                if (componentMap[cName]) {
                    finalName = componentMap[cName];
                } else {
                    // Fallback: Try to find a match in the text
                    // e.g. "74LS181运算器" -> "74LS181"
                    var match = cName.match(/[a-zA-Z0-9]+/);
                    if (match) {
                        finalName = match[0];
                        // Special case handling
                        if (finalName === "6116") finalName = "RAM6116";
                        if (finalName === "2716") finalName = "EPROM2716C3";
                    }
                }

                // Calculate drop position relative to #demo
                var offset = $(this).offset();
                var x = event.pageX - offset.left;
                var y = event.pageY - offset.top;

                // Snap to grid (10px)
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;

                // Add component
                // Note: 'Compo' prefix is expected by circuitdiagram.js
                // We need to ensure the class exists
                var className = "Compo" + finalName;

                if (typeof window[className] === 'function') {
                    mycircuit.addComponent("demo", className, x, y);
                } else {
                    console.warn("Component class not found: " + className);
                    // Try without Compo prefix or other variations if needed
                    // But based on existing code, it expects Compo + Name
                }
            }
        });
    };

    init();
};
