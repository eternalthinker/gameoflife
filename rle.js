/*
 * Basic RLE (Run Length Encoded cellular automata pattern file) parser in JavaScript 
 *
 * Author: Rahul Anand [ eternalthinker.co ], Dec 2014
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

function Rle () {

}

Rle.prototype.parse = function (data) {
    var headerPat = /\s*x\s*=\s*(-?\d+)\s*,\s*y\s*=\s*(-?\d+)(\s*,\s*rule\s*=\s*[Bb]([1-8]*)\/[Ss]([1-8]*))?/; // full, x, y, full_rule, B, S
    var namePat = /\s*#N(.*)/;
    var commentPat = /\s*#[Cc](.*)/;
    var authorPat = /\s*#O(.*)/;
    var refPat = /\s*#[RP]\s*(-?\d+)\s*(-?\d+)/; // full, x, y
    var numtagPat = /[\s^#]*(((\d+)?([bo$]))|!)/mg; // full, full, num_tag, num, tag

    //var header = headerPat.exec(data);
    //console.log(header);
    //var nCols = header[1];
    //var cRows = header[2];

    var offsetX = 0, offsetY = 0;
    var offsets = refPat.exec(data);
    if (offsets && offsets[1] !== undefined) {
        offsetX = +offsets[1];
    }
    if (offsets && offsets[2] !== undefined) {
        offsetY = +offsets[2];
    }

    var points = []; // The cells info is parsed to create a list of relative live coordinates
    var row = 0;
    var col = 0;
    var numtag;

    // Make sure we start at the beginning of cells info; Do not handle # lines in between this content
    var numtagsBeginPat = /^(?=\s*[\dbo$!])/mg;
    numtagsBeginPat.exec(data);
    numtagPat.lastIndex = numtagsBeginPat.lastIndex;

    numtag_loop: // label
    while (numtag = numtagPat.exec(data)) {
        var num = 1;
        numStr = numtag[3]; 
        if (numStr !== undefined) {
            num = +numStr;
        } 
        switch (numtag[0].slice(-1)) {
            case 'o':
                for (var i = 0; i < num; ++i) {
                    points.push([col++, row]);
                }
                break;
            case 'b':
                col += num;
                break;
            case '$':
                row += num;
                col = 0;
                break;
            case '!':
                break numtag_loop;
        }
    }

    return { "points":points, "offsetX":offsetX, "offsetY":offsetY };
}