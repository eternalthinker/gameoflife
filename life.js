/*
 * Javascript implementation of Conway's Game of Life 
 *
 * Author: Rahul Anand [ eternalthinker.co ], Nov 2014
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

$(document).ready(function() {

    /* ================== Life class ================ */
    function Cell () {
        this.age = 0; // Determines alpha of color
        this.alive = false;
    }
    
    function Life (rows, cols) {
        this.B = [3]; // B(orn)
        this.S = [2, 3]; // S(tay alive)
        this.rows = rows;
        this.cols = cols;
        this.world = [];
        this.world2 = [];
        this.generation = 0;
        this.population = 0;

        this.Lifeforms = Object.freeze({
            GOSPER_GLIDER_GUN: [
                [1, 5],[1, 6],[2, 5],[2, 6],[11, 5],[11, 6],[11, 7],[12, 4],
                [12, 8],[13, 3],[13, 9],[14, 3],[14, 9],[15, 6],[16, 4],[16, 8],
                [17, 5],[17, 6],[17, 7],[18, 6],[21, 3],[21, 4],[21, 5],[22, 3],
                [22, 4],[22, 5],[23, 2],[23, 6],[25, 1],[25, 2],[25, 6],[25, 7],
                [35, 3],[35, 4],[36, 3],[36, 4]
            ]
        });

        // Actions
        this.init();
    }

    Life.prototype.init = function () {
        // Initialize world cells
        for (var x = 0; x < this.cols; ++x) {
            this.world[x] = [];
            this.world2[x] = [];
            for (var y = 0; y < this.rows; ++y) {
                this.world[x][y] = new Cell();
                this.world2[x][y] = new Cell();
            }
        }
    }

    Life.prototype.get = function (x, y) {
        return this.world[x][y].alive;
    }

    Life.prototype.set = function (x, y) {
        this.world[x][y].alive = true;
    }

    Life.prototype.unset = function (x, y) {
        this.world[x][y].alive = false;
    }

    Life.prototype.clear = function () {
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                this.world[x][y].alive = false;
                this.world[x][y].age = 0;
            }
        }
        this.generation = 0;
    }

    Life.prototype.getNeighbourCount = function (x, y) {
        var ncount = 0;

        // Bounded grid
        /* // Left
        if (this.world[x-1] && this.world[x-1][y].alive) { ++ncount; }
        if (this.world[x-1] && this.world[x-1][y-1] && this.world[x-1][y-1].alive) { ++ncount; }
        if (this.world[x-1] && this.world[x-1][y+1] && this.world[x-1][y+1].alive) { ++ncount; }
        // Adj
        if (this.world[x] && this.world[x][y-1] && this.world[x][y-1].alive) { ++ncount; }
        if (this.world[x] && this.world[x][y+1] && this.world[x][y+1].alive) { ++ncount; }
        // Right
        if (this.world[x+1] && this.world[x+1][y].alive) { ++ncount; }
        if (this.world[x+1] && this.world[x+1][y-1] && this.world[x+1][y-1].alive) { ++ncount; }
        if (this.world[x+1] && this.world[x+1][y+1] && this.world[x+1][y+1].alive) { ++ncount; } */

        // Toroidal grid
        var x1 = (x > 0)? x: this.cols;
        var y1 = (y > 0)? y: this.rows;
        // Left
        if (this.world[x1-1][y].alive) { ++ncount; }
        if (this.world[x1-1][y1-1].alive) { ++ncount; }
        if (this.world[x1-1][(y+1) % this.rows].alive) { ++ncount; }
        // Adj
        if (this.world[x][y1-1].alive) { ++ncount; }
        if (this.world[x][(y+1) % this.rows].alive) { ++ncount; }
        // Right
        if (this.world[(x+1) % this.cols][y].alive) { ++ncount; }
        if (this.world[(x+1) % this.cols][y1-1].alive) { ++ncount; }
        if (this.world[(x+1) % this.cols][(y+1) % this.rows].alive) { ++ncount; }

        return ncount;
    }

    Life.prototype.step = function () {
        this.population = 0
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                var ncount = this.getNeighbourCount(x, y);
                if (this.world[x][y].alive) {
                    var find = this.S.indexOf(ncount);
                    if (find != -1) {
                        this.world2[x][y].alive = true; 
                        this.population++;
                    } else {
                        this.world2[x][y].alive = false;
                    }
                }
                else {
                    var find = this.B.indexOf(ncount);
                    if (find != -1) {
                        this.world2[x][y].alive = true; 
                        this.population++;
                    } 
                    else {
                        this.world2[x][y].alive = false;
                    }
                }
            }
        }
        
        // Apply next generation
        var temp = this.world;
        this.world = this.world2;
        this.world2 = temp;
        this.generation++;
    }
        
    Life.prototype.load = function (lifeForm) {
        var lifeDef = this.Lifeforms[lifeForm];
        this.population = 0;
        lifeDef.forEach(function(point) {
            this.world[point[0]][point[1]].alive = true;
            this.population++;
        }, this);
    }
    /* ================== End of Life class ================ */


    /* ================== Ui class ================ */
    function Ui () {
        // Ui components
        this.$run_btn = $('#run');
        this.$step_btn = $('#step');
        this.$pause_btn = $('#pause');
        this.$pencil_btn = $('#pencil');
        this.$eraser_btn = $('#eraser');
        this.$clear_btn = $('#clear');
        this.$slider_ui = $('#slider');
        this.slider_values = [1000, 120, 70, 10, 1];
        this.$grid_chk = $('#grid-switch');
        this.$grid_cnvs = $('#grid');
        this.$world_cnvs = $('#world');
        this.world_cnvs = $('#world').get(0);
        this.$generation_ui = $('#generation');
        this.$population_ui = $('#population');

        // Ui component handlers
        this.$run_btn.click($.proxy(this.run, this));
        this.$step_btn.click($.proxy(this.step_update, this));
        this.$pause_btn.click($.proxy(this.pause, this)); 
        this.$pencil_btn.click($.proxy(function() {
            this.curTool = this.Tool.PENCIL;
            this.$pencil_btn.prop('disabled', true);
            this.$eraser_btn.prop('disabled', false);
        }, this));
        this.$eraser_btn.click($.proxy(function() {
            this.curTool = this.Tool.ERASER;
            this.$pencil_btn.prop('disabled', false);
            this.$eraser_btn.prop('disabled', true);
        }, this));
        this.$clear_btn.click($.proxy(this.clearWorld, this));

        if (this.$slider_ui.length > 0) {
          this.$slider_ui.slider({
            min: 1,
            max: 5,
            value: 3,
            orientation: "horizontal",
            range: "min",
            slide: $.proxy(function (event, ui) {
                this.frameDelay = this.slider_values[ui.value - 1];
            }, this)
          }).addSliderSegments(this.$slider_ui.slider("option").max);
        }
        this.$grid_chk.bootstrapSwitch('state', true);
        this.$grid_chk.on('switchChange.bootstrapSwitch', $.proxy(function (event, state) {
          if (state) {
            this.$grid_cnvs.show();
          } else {
            this.$grid_cnvs.hide();
          }
        }, this));

        // Mouse handlers
        this.$grid_cnvs.mousedown($.proxy(function (event) { this.onMouseDown(event); }, this));
        this.$grid_cnvs.mouseup($.proxy(function (event) { this.onMouseUp(event); }, this));
        this.$grid_cnvs.mousemove($.proxy(function (event) { this.onMouseMove(event); }, this));
        this.$grid_cnvs.mouseout($.proxy(function (event) { this.onMouseOut(event); }, this));
        this.$world_cnvs.mousedown($.proxy(function (event) { this.onMouseDown(event); }, this));
        this.$world_cnvs.mouseup($.proxy(function (event) { this.onMouseUp(event); }, this));
        this.$world_cnvs.mousemove($.proxy(function (event) { this.onMouseMove(event); }, this));
        this.$world_cnvs.mouseout($.proxy(function (event) { this.onMouseOut(event); }, this));

        // Drawing related variables
        this.drawing = false;
        this.dragging = false;
        this.Tool = Object.freeze({
            PENCIL: 1,
            ERASER: 2
        });
        this.curTool = this.Tool.PENCIL;

        // Life appearance variables
        this.w = 750;
        this.h = 600;
        this.cellSize = 5;
        this.cellColor = '#000000';
        this.gridColor = '#CCCCCC';
        this.bgColor = '#FFFFFF';
        this.gridStroke = 0.5;
        this.frameDelay = 70; // ms
        this.frameTimer;

        this.world_ui = $('#world').get(0).getContext('2d');
        this.grid_ui = $('#grid').get(0).getContext('2d');
        this.world_ui.fillStyle = this.cellColor;
        this.world_ui.strokeStyle  = this.bgColor;
        this.grid_ui.fillStyle = this.bgColor;
        this.grid_ui.strokeStyle = this.gridColor;
        this.grid_ui.lineWidth = this.gridStroke;

        this.rows = this.h / this.cellSize;
        this.cols = this.w / this.cellSize;

        // Actions
        this.$run_btn.prop('disabled', false);
        this.$step_btn.prop('disabled', false);
        this.$pause_btn.prop('disabled', true);
        this.$pencil_btn.prop('disabled', true);
        this.$eraser_btn.prop('disabled', false);
        this.paintGrid();
        this.life = new Life (this.rows, this.cols);
        this.life.load("GOSPER_GLIDER_GUN");
        this.paint();
    }

    Ui.prototype.getPixelpoint = function (coords) {
        return { x: Math.floor(coords.x/this.cellSize), y: Math.floor(coords.y/this.cellSize) };
    }

    Ui.prototype.onMouseDown = function (event) {
        event.originalEvent.preventDefault(); // Chrome drag text cursor fix
        this.drawing = true;
        // var point = this.getPixelpoint(this.world_cnvs.relMouseCoords(event));
    }

    Ui.prototype.onMouseUp = function (event) {
        if (this.drawing) {
            this.drawing = false;
            if (this.dragging) { // No mouse up action if mouse was being dragged
                this.dragging = false;
            }
            else {
                var point = this.getPixelpoint(this.world_cnvs.relMouseCoords(event));
                if (this.curTool === this.Tool.PENCIL) {
                    var ievent = this.world_cnvs.relMouseCoords(event);
                    console.log ("(" + ievent.x + ", " + ievent.y + ") -> " + "(" + point.x + ", " + point.y + ")");
                    if (! this.life.get(point.x, point.y)) {
                        this.setCell(point.x, point.y);
                    } else {
                        this.unsetCell(point.x, point.y); // Live cell; click to unset
                    }
                }
                else { // this.curTool.ERASER
                    this.unsetCell(point.x, point.y);
                }
            }
        }
    }

    Ui.prototype.onMouseMove = function (event) {
        if (this.drawing) {
            this.dragging = true;
            var point = this.getPixelpoint(this.world_cnvs.relMouseCoords(event));
            if (this.curTool === this.Tool.PENCIL) {
                this.setCell(point.x, point.y);
            }
            else { // this.curTool.ERASER
                this.unsetCell(point.x, point.y);
            }
        }
    }

    Ui.prototype.onMouseOut = function (event) {
        if (this.drawing) {
            this.drawing = false;
            this.dragging = false;
            // var point = this.getPixelpoint(this.world_cnvs.relMouseCoords(event));
        }
    }

    Ui.prototype.setCell = function (x, y) {
        if (this.life.get(x,y)) return;
        this.life.set(x, y);
        this.world_ui.beginPath();
        this.world_ui.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
        this.world_ui.fill();
    }

    Ui.prototype.unsetCell = function (x, y) {
        if (! this.life.get(x,y)) return;
        this.life.unset(x, y);
        this.world_ui.clearRect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
    }

    Ui.prototype.clearWorld = function (x, y) {
        this.pause();
        this.life.clear();
        this.life.load("GOSPER_GLIDER_GUN");
        this.paint();
    }

    Ui.prototype.run = function () {
        this.update();
        this.$run_btn.prop('disabled', true);
        this.$step_btn.prop('disabled', true);
        this.$pause_btn.prop('disabled', false);
    }

    Ui.prototype.step_update = function () {
        this.life.step();
        this.paint();
    }

    Ui.prototype.pause = function () {
        clearTimeout(this.frameTimer);
        this.$run_btn.prop('disabled', false);
        this.$step_btn.prop('disabled', false);
        this.$pause_btn.prop('disabled', true);
    }

    Ui.prototype.paint = function () {
        this.world_ui.clearRect(0, 0, this.w, this.h);
        for (var x = 0; x < this.cols; ++x) {
            for (var y = 0; y < this.rows; ++y) {
                if (this.life.get(x,y)) {
                    this.world_ui.beginPath();
                    this.world_ui.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
                    this.world_ui.fill();
                }
            }
        }
        this.$generation_ui.text(this.life.generation);
        this.$population_ui.text(this.life.population);
    }

    Ui.prototype.update = function () {
        this.life.step();
        this.paint();
        this.frameTimer = setTimeout(this.update.bind(this), this.frameDelay);
    }

    Ui.prototype.paintGrid = function () {
        //this.grid_ui.beginPath();
        //this.grid_ui.rect(0, 0, this.w, this.h);
        //this.grid_ui.fill();
        for (var x = 0; x <= this.w; x += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(x, 0);
            this.grid_ui.lineTo(x, this.h);
            this.grid_ui.stroke();
        }
        for (var y = 0; y <= this.h; y += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(0, y);
            this.grid_ui.lineTo(this.w, y);
            this.grid_ui.stroke();
        }
    }
    /* ================== End of Ui class ================ */

    // Compatibility fix
    if (String.prototype.repeat === undefined) {
        String.prototype.repeat = function(num)
        {
            return new Array(num + 1).join(this);
        }
    }

    // Add segments to a slider
    $.fn.addSliderSegments = function (amount, orientation) {
        return this.each(function () {
            if (orientation == "vertical") {
              var output = ''
              , i;
              for (i = 1; i <= amount - 2; i++) {
                output += '<div class="ui-slider-segment" style="top:' + 100 / (amount - 1) * i + '%;"></div>';
            };
            $(this).prepend(output);
            } else {
                var segmentGap = 100 / (amount - 1) + "%";
                var segment = '<div class="ui-slider-segment" style="margin-left: ' + segmentGap + ';"></div>';
                $(this).prepend(segment.repeat(amount - 2));
            }
        });
    };

    // Retrieve mouse coordinates relative to the canvas element
    function relMouseCoords(event){
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = this;

        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while(currentElement = currentElement.offsetParent);

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x:canvasX, y:canvasY};
    }

    // Actions
    $('select').select2();
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
    var ui = new Ui();

});