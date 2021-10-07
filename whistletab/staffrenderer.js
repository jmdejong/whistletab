"use strict";


const PAD_X = 10;
const PAD_KEY = 30;
const NOTE_X_OFFSET = PAD_X + PAD_KEY;
const LINE_SPACE = 10;
const PAD_T = 0;
const PAD_B = 0;
const STAFF_HEIGHT = LINE_SPACE * 4 + PAD_T + PAD_B;


function setAttributes(obj, attrs) {
    Object.keys(attrs).forEach(function (key) {
        obj.setAttributeNS(null, key, attrs[key]);
    });
}

function svgEl(name, attrs, content) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    setAttributes(el, attrs);
    if (content) {
        el.appendChild(document.createTextNode(content));
    }
    return el;
}

function renderStaff(notes, key, spacing){
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let width = notes
        .filter(note =>
            note instanceof Token.AbsoluteNote
            || note instanceof Token.Rest
        )
        .length 
        * spacing
        + PAD_X * 2
        + NOTE_X_OFFSET;
    console.log(width);
    console.log(spacing);
    setAttributes(svg, {
        x: 0,
        y: 0,
        width: width,
        height: STAFF_HEIGHT,
        viewBox: `0 0 ${width} ${STAFF_HEIGHT}`,
        preserveAspectRatio: 'xMidYMid meet',
        'class': 'staff'
    });
    
    

    for (let i = 0; i < 5; ++i) {
        let y = PAD_T + i * LINE_SPACE + 0.5;
        svg.appendChild(svgEl('line', {
            x1: PAD_X,
            x2: width - PAD_X,
            y1: y,
            y2: y,
            stroke: 'black'
        }));
    }
    return svg;
}
