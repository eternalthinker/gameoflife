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

        this.Lifeforms = Object.freeze({
            GOSPER_GLIDER_GUN: [
                [1, 5],[1, 6],[2, 5],[2, 6],[11, 5],[11, 6],[11, 7],[12, 4],
                [12, 8],[13, 3],[13, 9],[14, 3],[14, 9],[15, 6],[16, 4],[16, 8],
                [17, 5],[17, 6],[17, 7],[18, 6],[21, 3],[21, 4],[21, 5],[22, 3],
                [22, 4],[22, 5],[23, 2],[23, 6],[25, 1],[25, 2],[25, 6],[25, 7],
                [35, 3],[35, 4],[36, 3],[36, 4]
            ]
        });
    }

    Life.prototype.init = function () {
        // Initialize world cells
        for (var x = 0; x < this.rows; ++x) {
            this.world[x] = [];
            this.world2[x] = [];
            for (var y = 0; y < this.cols; ++y) {
                this.world[x][y] = new Cell();
                this.world2[x][y] = new Cell();
            }
        }

        this.load("GOSPER_GLIDER_GUN");
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
        for (var x = 0; x < this.rows; ++x) {
            for (var y = 0; y < this.cols; ++y) {
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
        for (var x = 0; x < this.rows; ++x) {
            for (var y = 0; y < this.cols; ++y) {
                var ncount = this.getNeighbourCount(x, y);
                if (this.world[x][y].alive) {
                    var find = this.S.indexOf(ncount);
                    if (find != -1) {
                        this.world2[x][y].alive = true; 
                    } else {
                        this.world2[x][y].alive = false;
                    }
                }
                else {
                    var find = this.B.indexOf(ncount);
                    if (find != -1) {
                        this.world2[x][y].alive = true; 
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
        lifeDef.forEach(function(point) {
            this.world[point[0]][point[1]].alive = true;
        }, this);
    }

    function Ui () {
        this.w = 600;
        this.h = 600;
        this.cellSize = 6;
        this.cellColor = '#000000';
        this.gridColor = '#CCCCCC';
        this.bgColor = '#FFFFFF';
        this.gridStroke = 1;
        this.frameDelay = 100; // ms

        this.world_ui = $('#world').get(0).getContext('2d');
        this.grid_ui = $('#grid').get(0).getContext('2d');
        this.world_ui.fillStyle = this.cellColor;
        this.world_ui.strokeStyle  = this.bgColor;
        this.grid_ui.fillStyle = this.bgColor;
        this.grid_ui.strokeStyle = this.gridColor;
        this.grid_ui.lineWidth = this.gridStroke;

        this.rows = this.h / this.cellSize;
        this.cols = this.w / this.cellSize;

        this.paintGrid();
        this.life = new Life (this.rows, this.cols);
        this.life.init();
        this.paint();
    }

    Ui.prototype.paint = function () {
        this.world_ui.clearRect(0, 0, this.w, this.h);
        for (var x = 0; x < this.rows; ++x) {
            for (var y = 0; y < this.cols; ++y) {
                if (this.life.get(x,y)) {
                    this.world_ui.beginPath();
                    this.world_ui.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
                    this.world_ui.fill();
                }
            }
        }
    }

    Ui.prototype.update = function () {
        this.life.step();
        this.paint();
        setTimeout(this.update.bind(this), this.frameDelay);
    }

    Ui.prototype.paintGrid = function () {
        this.grid_ui.beginPath();
        this.grid_ui.rect(0, 0, this.w, this.h);
        this.grid_ui.fill();
        for (var x = 0; x <= this.w; x += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(0, x);
            this.grid_ui.lineTo(this.w, x);
            this.grid_ui.stroke();
        }
        for (var y = 0; y <= this.h; y += this.cellSize) {
            this.grid_ui.beginPath();
            this.grid_ui.moveTo(y, 0);
            this.grid_ui.lineTo(y, this.h);
            this.grid_ui.stroke();
        }
    }

    var ui = new Ui();
    ui.update();

});