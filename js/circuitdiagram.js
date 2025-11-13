/*
Duosi Principles of Computer Composition Virtual Experiment System ,DS-VLAB v1.0
Copyright(C)2013 ZHANG Wen-fen, Email: yydzhwf@163.com  Address: Xiangnan University, Chenzhou Hunan, China
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

湘思微机原理仿真实验系统, DS-VLAB v1.0 于2013年开发，2016年发布。
版权所有(C) 张雯雰, 联系邮箱: yydzhwf@163.com
本程序为自由软件，您可以在遵守 GNU GENERAL PUBLIC LICENSE 的前提下再次发布和/或修改。

作者：湘南学院计算机系张雯雰，湘南学院电子信息工程师

湘思微机原理仿真实验系统, DS-VLAB v1.2 于2021年5月修改，在V1.0版本基础上将VML改为SVG。
*/


function Circuit() {
    this.componentAll = [];  //已绘制的实验器件列表(不包括已删除的)
    this.count = 0;   //给各组件编号（已删除的组件编号不回收，组件的id
    this.linecolor = "#00BFFF";  // Changed from yellow to DeepSkyBlue for better visibility
    var targetPin = null;  //拖拽连线时的目标引脚
    var _this = this;
    var  arrowCount=0;

    //在父级div（parentId）的指定位置（offsetX, offsetY）添加实验器件（componentName）
    this.addComponent = function (parentId, componentName, offsetX, offsetY, componentId) {
        var component = new window[componentName]();
        if (componentId == null) {
            component.id = "CP" + String(this.count);
        } else {
            component.id = componentId;
        }
        ;
        this.count = this.count + 1;
        _this.componentAll.push(component);
        var compDiv = document.createElement("div");
        compDiv.id = component.id;
        compDiv.style.position = "absolute";
        compDiv.style.left = offsetX + "px";
        compDiv.style.top = offsetY + "px";
        compDiv.style.width = component.width + "px";
        compDiv.style.height = component.height + "px";
        compDiv.style.zIndex = 3000 + this.count;
        $("#" + parentId).append(compDiv);

        if (component.image != "") {
            compDiv.style.backgroundImage = "url(" + component.image + ")";
        }
        ;
        if (component.showBorder == true && component.showName == false) {
            compDiv.className = "window2";
        }
        ;
        if (component.showBorder == true && component.showName == true) {
            var underDiv = document.createElement("div");
            underDiv.id = component.id + "UnderLayer";
            underDiv.className = "window";
            underDiv.style.left = "0px";
            underDiv.style.top = "0px";
            underDiv.style.width = component.width + "px";
            underDiv.style.height = component.height + "px";
            underDiv.style.lineHeight = component.height + "px";
            underDiv.innerHTML = "<strong>" + component.name + "</strong>";
            $("#" + compDiv.id).append(underDiv);
        }
        ;

        //绘制引脚层
        var pinDiv, pn, pinFun;
        for (var i = 0; i < component.pinName.length; i++) {
            pinDiv = document.createElement("div");
            pinDiv.id = compDiv.id + "Pin" + i;
            pinDiv.className = "pin";
            pn = component.pinName[i];
            if (pn == "") {
                pinDiv.style.width = component.pinWidth + 2 + "px";
                pinDiv.style.height = component.pinHeight + "px";
            } else {
                pinDiv.style.width = component.pinWidth + 6 + "px"; //引脚间隔部分宽些，留字好看些
                pinDiv.style.height = component.pinHeight + 2 + "px";
            }
            ;
           
            pinDiv.style.left = component.paddingLR + (component.width - component.paddingLR * 2) * component.pinPosition[i][0] + "px";

            if (component.pinPosition[i][1] == 1) {
                if (component.showBorder == true) {
                    pinDiv.style.top = component.height - component.pinHeight + "px";
                } else {
                    pinDiv.style.top = component.height - component.pinHeight - 1 + "px";
                }
                ;
                if (pn != "" && component.showPinNo != false) pinDiv.innerHTML = pn + "<br>" + i;
                if (pn != "" && component.showPinNo == false) pinDiv.innerHTML = pn;
            }
            ;
            if (component.pinPosition[i][1] == 0) {
                pinDiv.style.top = 0 + "px";
                if (pn != "" && component.showPinNo != false) pinDiv.innerHTML = i + "<br>" + pn;
                if (pn != "" && component.showPinNo == false) pinDiv.innerHTML = pn;
            }
            ;
            pinFun = component.pinFunction[i];
            if (pinFun == 10 || pinFun == 0) {   //仅进入输入引脚
                pinDiv.style.color = "#003C9D";
                $(pinDiv).bind("mousedown", doNone);
                $(pinDiv).bind("mouseenter", function () {
                    targetPin = this;
                });
                $(pinDiv).bind("mouseleave", function () {
                    targetPin = null;
                });
            }
            ;
            if (pinFun == 1) {   //从输出引脚输出
                pinDiv.style.color = "green";
                $(pinDiv).bind("mousedown", lineDrag);
            }
            ;
            if (pinFun == 11) {   //双向引脚/三态门
                pinDiv.style.color = "#b200ff";
                $(pinDiv).bind("mouseenter", function () {
                    targetPin = this;
                });
                $(pinDiv).bind("mouseleave", function () {
                    targetPin = null;
                });
                $(pinDiv).bind("mousedown", lineDrag);
            }
            ;
            if (pinFun >= 2) {   //电源接地引脚
                $(pinDiv).bind("mousedown", doNone);
            }
            ;

            pinDiv.onselectstart = function () {
                return false;
            };//禁止div中的文字被选中

            $("#" + compDiv.id).append(pinDiv);
        }
        ;

        dragEnabled(compDiv.id);
        $(compDiv).bind("mouseup", deleteC);
        if (component.name == "Switch")
            $(compDiv).bind("mousedown", switchClick);
        if (component.name == "SinglePulse")
            $(compDiv).bind("mousedown", singlePulseClick);

        // Special handling for TextLabel component
        if (component.name == "TextLabel") {
            var textDiv = document.createElement("div");
            textDiv.className = "text-label-content";
            textDiv.style.padding = "5px";
            textDiv.style.fontSize = component.fontSize + "px";
            textDiv.style.color = component.fontColor;
            textDiv.style.fontFamily = component.fontFamily;
            textDiv.style.cursor = "text";
            textDiv.innerHTML = component.text.replace(/\n/g, '<br>');
            compDiv.appendChild(textDiv);
            compDiv.style.backgroundColor = component.backgroundColor;
            compDiv.style.border = "1px dashed #cccccc";
            compDiv.style.minWidth = "100px";
            compDiv.style.minHeight = "30px";

            $(compDiv).bind("dblclick", function(e) {
                e.stopPropagation();
                editTextLabel(component);
            });
        }

        if (pn != "" && component.showPinNo != false)
            $(compDiv).bind("dblclick", showPinValue);
    };


    //绘制一根连接线
    this.lineCreate = function (paintDiv, fromX, fromY, toX, toY) {
        console.log("========" + fromX + "  " + toX)
        var newLine = document.createElement("div");
        var path = "M " + fromX + " " + fromY + " L " + toX + " " + toY;
        newLine.setAttribute("class", "div-line");

     //   var timestamp=new Date().getTime();
       arrowCount=arrowCount+1;

        newLine.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"" +
            "style='overflow: inherit;position: absolute;left:0;top:0;'>" +
            "\n" +
            "<defs>" +
            "<marker id=\"idArrow"+arrowCount+"\"\n" +
            "\n" +
            "         viewBox=\"0 0 20 20\" refX=\"0\" refY=\"10\"\n" +
            "\n" +
            "         markerUnits=\"userSpaceOnUse\" markerWidth=\"7\" markerHeight=\"7\"\n" +
            "\n" +
            "         orient=\"auto\">\n" +
            "\n" +
            "         <path class='my-arrow' d=\"M 0 0 L 20 10 L 0 20 z\" fill=\"" + _this.linecolor + "\" stroke=\"" + _this.linecolor + "\"/>\n" +
            "\n" +
            "      </marker>\n" +
            "\n" +
            "</defs>" +
            "<path stroke-width='1.5' fill='none' class='my-line'  stroke=" + _this.linecolor + " d='" + path + "'  marker-end=\"url(#idArrow"+arrowCount+")\" /></svg>";
 
        $("#" + paintDiv).append(newLine);
        $(".my-line").hover(function () {
            $(this).css("stroke", "red");
            $(this).css("stroke-width", "4");
            var a = $(this).prev().find(".my-arrow")[0];
            $(a).css("fill", "red");
            $(a).css("stroke", "red");
        }, function () {
            $(this).css("stroke", _this.linecolor);
            $(this).css("stroke-width", "1.5");
            var a = $(this).prev().find(".my-arrow")[0];
            $(a).css("fill", _this.linecolor);
            $(a).css("stroke", _this.linecolor);
        });
        $(newLine).bind("mousedown", deleteL);

        var p = $(newLine).find("path")[1];
        return p;
    };

    //拖动连线时，从开始到目标拖动的过程中，线的变化
    function lineChange(line, fromX, fromY, toX, toY) {
        var p1X, p1Y, p2X, p2Y;
        if (Math.abs(fromX - toX) > Math.abs(fromY - toY)) {
            p1X = fromX + Math.round((toX - fromX) / 2);
            p1Y = fromY;
            p2X = fromX + Math.round((toX - fromX) / 2);
            p2Y = toY;
            if (fromX > toX) {
                toX = toX + 7
            } else {
                toX = toX - 7
            }
            ;
        } else {
            p1X = fromX;
            p1Y = fromY + Math.round((toY - fromY) / 2);
            p2X = toX;
            p2Y = fromY + Math.round((toY - fromY) / 2);
            if (fromY > toY) {
                toY = toY + 7
            } else {
                toY = toY - 7
            }
            ;
        }
        ;
        var path = "M " +fromX + " " + fromY + " L " + p1X + " " + p1Y + " " + p2X + " " + p2Y + " " + toX + " " + toY;
        $(line).attr("d", path);
     };

    //拖拽连线时，连接到目标引脚后，更新连线位置和线型，拖动器件时，连线跟随运动
    this.lineAdjust = function (line, startPin, endPin) {
        var sX, sY, eX, eY;
        var st = startPin.offsetTop;
        var et = endPin.offsetTop;
        sX = startPin.parentNode.offsetLeft + startPin.offsetLeft + Math.round(startPin.offsetWidth / 2) - 1;
        if (st < 2) sY = startPin.parentNode.offsetTop;
        else sY = startPin.parentNode.offsetTop + startPin.parentNode.offsetHeight;
        eX = endPin.parentNode.offsetLeft + endPin.offsetLeft + Math.round(endPin.offsetWidth / 2) - 1;
        if (et < 2) eY = endPin.parentNode.offsetTop;
        else eY = endPin.parentNode.offsetTop + endPin.parentNode.offsetHeight;

        if (eY - sY > 10 && st > 1 && et < 2) {
            var p1X = sX;
            var p1Y = sY + Math.round((eY - sY) / 2);
            var p2X = eX;
            var p2Y = sY + Math.round((eY - sY) / 2);

            eY = eY - 5;
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + eX + " " + eY;
            $(line).attr("d", path);
        }
        ;
        if (eY - sY < 10 && st > 1 && et < 2) {
            var p1X = sX;
            var p1Y = sY + 30;
            var p2X = sX + Math.round((eX - sX) / 2);
            var p2Y = sY + 30;
            var p3X = p2X;
            var p3Y = eY - 30;
            var p4X = eX;
            var p4Y = eY - 30;

            eY = eY - 5;
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + p3X + " " + p3Y + " L " + p4X + " " + p4Y + " L " + eX + " " + eY;
            $(line).attr("d", path);
        }
        ;
        if (st > 1 && et > 1) {
            var p1X = sX;
            if (eY > sY) {
                var p1Y = eY + 30;
                var p2Y = eY + 30;
            } else {
                var p1Y = sY + 30;
                var p2Y = sY + 30;
            }
            ;
            var p2X = eX;
            eY = eY + 8;
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + eX + " " + eY;
            $(line).attr("d", path);
        }
        ;
        if (st < 2 && et < 2) {
            var p1X = sX;
            if (eY > sY) {
                var p1Y = sY - 30;
                var p2Y = sY - 30;
            } else {
                var p1Y = eY - 30;
                var p2Y = eY - 30;
            }
            ;
            var p2X = eX;
            eY = eY - 5;
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + eX + " " + eY;
            $(line).attr("d", path);
        }
        ;
        var flag = false;
        if (sY - eY > 10 && st < 2 && et > 1) {
            var p1X = sX;
            var p1Y = sY - Math.round((sY - eY) / 2);
            var p2X = eX;
            var p2Y = sY - Math.round((sY - eY) / 2);

            eY = eY + 8;
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + eX + " " + eY;
            $(line).attr("d", path);

            flag = true;
        }
        ;
        if (sY - eY < 10 && st < 2 && et > 1) {
            var p1X = sX;
            var p1Y = sY - 30;
            var p2X = sX + Math.round((eX - sX) / 2);
            var p2Y = sY - 30;
            var p3X = p2X;
            var p3Y = eY + 30;
            var p4X = eX;
            var p4Y = eY + 30;
            if (!flag) {
                eY = eY + 8;
            }
            var path = "M " + sX + " " + sY + " L " + p1X + " " + p1Y + " L " + p2X + " " + p2Y + " L " + p3X + " " + p3Y + " L " + p4X + " " + p4Y + " L " + eX + " " + eY;
            $(line).attr("d", path);
        }
        ;
    };


    //输出引脚的拖动事件
    function lineDrag(a) {
        window.event.cancelBubble = true;  //阻止事件冒泡到上一层
        if (!a) a = window.event;
        var d = document;
        var sTop = Math.max(d.body.scrollTop, d.documentElement.scrollTop);
        var sLeft = Math.max(d.body.scrollLeft, d.documentElement.scrollLeft);
        var ox = a.clientX + sLeft, oy = a.clientY + sTop;
        var line = _this.lineCreate("demo", ox, oy, ox, oy);
        targetPin = null;
        var originPin = this;

        d.onmousemove = function (a) {
            if (!a) a = window.event;
            var sTop = Math.max(d.body.scrollTop, d.documentElement.scrollTop);
            var sLeft = Math.max(d.body.scrollLeft, d.documentElement.scrollLeft);
            if (targetPin == null) {  //还没有进入目标引脚时
                lineChange(line, ox, oy, a.clientX + sLeft, a.clientY + sTop);
            } else { //已经进入目标引脚后时
                _this.lineAdjust(line, originPin, targetPin);
            }
        }

        d.onmouseup = function () {
            if (targetPin == null) {//如果没有进入任何目标引脚后 ...需修改，应该检查目标引脚是否已经有连接线
                var a = $(line).parent()[0];
                $(a).parent()[0].remove(true);
            } else {
                _this.lineAdjust(line, originPin, targetPin);
                _this.addLineToComponent(line, originPin, targetPin);
            }
            ;
            d.onmousemove = null;
            d.onmouseup = null;

        }
    };


    //电源接地和输出引脚的mousedown事件
    function doNone(a) {
        window.event.cancelBubble = true;  //阻止事件冒泡到上一层
    };

    //根据id在componentAll中找到匹配的组件
    this.findById = function (Id) {
        for (var i = 0; i < _this.componentAll.length; i++) {
            if (_this.componentAll[i].id == Id)
                return _this.componentAll[i];
        }
        ;
        return 0;
    };

    //根据id在componentAll中找到匹配的组件并删除
    function deleteById(Id) {
        for (var i = 0; i < _this.componentAll.length; i++) {
            if (_this.componentAll[i].id == Id) {
                _this.componentAll[i] = null;
                _this.componentAll.splice(i, 1);
                return 1;
            }
            ;
        }
        ;
        return 0;
    };


    //将连线信息保存到两个引脚，返回line.id
    this.addLineToComponent = function (line, startPin, endPin) {
        var sPId, ePId, sCId, sPNo, eCId, ePNo, p;
        sPId = startPin.id;
        p = sPId.indexOf("Pin");
        sCId = sPId.substring(0, p);//获取开始引脚的组件ID
        sPNo = sPId.substring(p + 3);//获取开始引脚的编号
        ePId = endPin.id;
        p = ePId.indexOf("Pin");
        eCId = ePId.substring(0, p);
        ePNo = ePId.substring(p + 3);
        var sc = _this.findById(sCId);
        sc.connection[sPNo].push([line, startPin, endPin]);
        var ec = _this.findById(eCId);
        ec.connection[ePNo].push([line, startPin, endPin]);
        line.id = sPId + "To" + ePId;
    };

    //拖动组件c时，更新相关的连线
    this.lineReplace = function (c) {
        var comp = _this.findById(c.id);
        var i, j, l, s, e;
        for (i = 0; i < comp.connection.length; i++) {
            for (j = 0; j < comp.connection[i].length; j++) {
                l = comp.connection[i][j][0];
                s = comp.connection[i][j][1];
                e = comp.connection[i][j][2];
                _this.lineAdjust(l, s, e);
            }
            ;
        }
        ;
    };


    //删除连接线
    function lineDelete(line) {
        var lId, sPId, ePId, sCId, sPNo, eCId, ePNo, p, i;
        var aline = $(line).find("path")[1];
        var bline = line;
        if (typeof (aline) == 'undefined') {
            lId = line.id;
            var a = $(line).parent()[0];
            line = $(a).parent()[0];
        } else {
            bline = aline;
            lId = aline.id;
        }
        p = lId.indexOf("To");
        sPId = lId.substring(0, p);
        ePId = lId.substring(p + 2);
        p = sPId.indexOf("Pin");
        sCId = sPId.substring(0, p);//获取开始引脚的组件ID
        sPNo = sPId.substring(p + 3);//获取开始引脚的编号
        p = ePId.indexOf("Pin");
        eCId = ePId.substring(0, p);
        ePNo = ePId.substring(p + 3);
        var sc = _this.findById(sCId);
        for (i = 0; i < sc.connection[sPNo].length; i++) {
            if (sc.connection[sPNo][i][0] == bline) {
                sc.connection[sPNo].splice(i, 1);
                break;
            }
            ;
        }
        ;
        var ec = _this.findById(eCId);
        for (i = 0; i < ec.connection[ePNo].length; i++) {
            if (ec.connection[ePNo][i][0] == bline) {
                ec.connection[ePNo].splice(i, 1);
                break;
            }
            ;
        }
        ;
        $(line).remove();
    };

    //右键删除连接线的事件
    function deleteL(a) {
        if (!a) a = window.event;
        if (a.button == 2) {
            var r = confirm("是否要删除这根线？");
            if (r == true) {
                lineDelete(this);
            }
            ;
        }
        ;
    };


    //删除组件及其关联的所有连接线
    function componentDelete(c) {
        var i, j;
        var comp = _this.findById(c.id);
        for (i = 0; i < comp.connection.length; i++) {
            for (j = 0; j < comp.connection[i].length;) {
                lineDelete(comp.connection[i][j][0]);
            }
            ;
        }
        ;
        deleteById(c.id);
        c.remove(true);

    };

    //右键删除组件及其连线的事件
    function deleteC(a) {
        if (!a) a = window.event;
        if (a.button == 2) {
            var r = confirm("是否要删除元件及其连接线？");
            if (r == true) {
                componentDelete(this);
            }
            ;
        }
        ;
    };


    //双击组件，显示各个引脚的值
    function showPinValue() {
        var s = "";
        var comp = _this.findById(this.id);
        var len = comp.pinValue.length;
        var w = 250;
        var i;
        if (len > 26) w = len * 10;
        for (i = len - 1; i >= len / 2; i--) {
            s = s + comp.pinValue[i] + "&nbsp;&nbsp;&nbsp;";
        }
        ;
        s = s + "<br/>";
        for (i = len - 1; i >= len / 2; i--) {
            if (i < 10) {
                s = s + i + "&nbsp;&nbsp;&nbsp;";
            } else {
                s = s + i + " ";
            }
            ;
        }
        ;
        s = s + "<br/>";
        for (i = 0; i < len / 2; i++) {
            if (i < 10) {
                s = s + i + "&nbsp;&nbsp;&nbsp;";
            } else {
                s = s + i + " ";
            }
            ;
        }
        ;
        s = s + "<br/>";
        for (i = 0; i < len / 2; i++) {
            s = s + comp.pinValue[i] + "&nbsp;&nbsp;&nbsp;";
        }
        ;

        s = "<p>" + s + "</p>";
        dialog.innerHTML = s;
        $("#dialog").dialog({
            modal: true,
            height: 220,
            width: w,
            buttons: [
                {
                    text: "OK",
                    click: function () {
                        $(this).dialog("close");
                    }
                }
            ]
        });

    };


    /*开关按钮的点击事件*/
    function switchClick(a) {
        if (!a) a = window.event;
        if (a.button == 2) {
          return;
        }
        ;

        var moveFlag = false;
        var d = document;
        var me = this;

        $(this).bind("mousemove", mm);
        $(this).bind("mouseup", mup);

        function mm() {
            moveFlag = true;
        };

        function mup() {
            if (!moveFlag) {
                var imgSrc = me.style.backgroundImage;
                var c = _this.findById(me.id);
                if (imgSrc == "url(\"./img/switchL.gif\")" || imgSrc == "url(./img/switchL.gif)") {
                    me.style.backgroundImage = "url(./img/switchH.gif)";
                }
                ;
                if (imgSrc == "url(\"./img/switchH.gif\")" || imgSrc == "url(./img/switchH.gif)") {
                    me.style.backgroundImage = "url(./img/switchL.gif)";
                }
                ;
                if (cDispatch.runState == 1) {
                    cDispatch.sourceTrigger(c);
                } else {
                    c.input();
                }
                ;
            }
            ;

            $(me).unbind("mousemove", mm);
            $(me).unbind("mouseup", mup);
        };
    };

    /*单脉冲按钮的点击事件*/
    function singlePulseClick(a) {
        if (!a) a = window.event;
        if (a.button == 2) {
          return;
        }
        ;

        var moveFlag = false;
        var d = document;
        var me = this;

        $(this).bind("mousemove", mm);
        $(this).bind("mouseup", mup);

        function mm() {
            moveFlag = true;
        };

        function mup() {
            if (!moveFlag) {
                var c = _this.findById(me.id);
                if (cDispatch.runState == 1 && c.timer == null) {
                    cDispatch.sourceTrigger(c);
                }
                ;
            }
            ;

            $(me).unbind("mousemove", mm);
            $(me).unbind("mouseup", mup);
        };
    };

    this.linecolorchange = function (c) {
        var x = $("#demo").find("div");
        for (var i = 0; i < x.length; i++) {
            var p = $(x[i]).find("path")[1];
            var p1 = $(x[i]).find("path")[0];
            $(p).attr("stroke", c);
            $(p1).attr("fill", c);
        }
        $(".my-line").mouseover();
        $(".my-line").mouseout();
    };

    this.deletecircuit = function () {
        // Add confirmation dialog before clearing circuit
        if (_this.componentAll.length > 0) {
            if (!confirm("确认要清空电路图吗？所有未保存的更改将丢失。\nAre you sure you want to clear the circuit? All unsaved changes will be lost.")) {
                return false;
            }
        }

        var c;
        if ($("#power").attr("src") == "./img/poweron.png") {
            $("#power").attr("src", "./img/poweroff.png");
            cDispatch.powerOff();
        }
        ;

        for (var i = 0; _this.componentAll.length > 0; i) {
            c = document.getElementById(_this.componentAll[i].id);
            componentDelete(c);
        }
        ;

        this.count = 0;   //给各组件编号（已删除的组件编号不回收，组件的id
        var targetPin = null;  //拖拽连线时的目标引脚
        return true;
    };


};

// Global function to edit text label
function editTextLabel(component) {
    var newText = prompt("请输入文字标注内容 (Enter text label):", component.text);
    if (newText !== null && newText !== "") {
        component.text = newText;
        component.updateDisplay();
    }
}


