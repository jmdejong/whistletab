"use strict";

const FINGERINGS = [
    '------',
    '-----h',
    '-----o',
    '----ho',
    '----oo',
    '---ooo',
    '--Hooo',
    '--oooo',
    '-Hoooo',
    '-ooooo',
    'o--ooo',
    'oooooo',

    'o-----',
    '-----h',
    '-----o',
    '----ho',
    '----oo',
    '---ooo',
    '--o--o',
    '--oooo',
    '-o-ooo',
    '-ooooo',
    'o-o---',
    'ooo---',

    'o-----',
    null,
    '-----o',
    null,
    '----oo',
    '---ooo',
    null,
    'o----o',
    null,
    '-ooooo',
    null,
    'oooooo'
];

let NOTES = ["a", null, "b", "c", null, "d", null, "e", "f", null, "g", null];

class Renderer {
    
    constructor(key, spacing){
        this.key = key;
        this.spacing = spacing;
    }
    
    render(line){
        if (line instanceof Line.Empty){
            return [];
        } else if (line instanceof Line.Comment) {
            return [this.renderComment(line)];
        } else if (line instanceof Line.Lyrics) {
            return [this.renderLyrics(line)];
        } else if (line instanceof Line.Notes) {
            return [this.renderTab(line)]; // todo: render staff
        } else {
            throw new Exception("unknown line type");
        }
    }
    
    renderComment(line){
        let para = document.createElement('p');
        para.appendChild(document.createTextNode(line.text));
        para.className = line.isHeading ? 'comment heading' : 'comment text';
        return para;
    }
    
    renderLyrics(line){
        let para = document.createElement('p');
        line.words.forEach(word => {
            let spacingWrapper = document.createElement('span');
            let wordEl = document.createElement('span');
            wordEl.appendChild(document.createTextNode(word));
            wordEl.className = 'word';
            spacingWrapper.className = 'spacer';
            spacingWrapper.appendChild(wordEl);
            para.appendChild(spacingWrapper);
        });
        para.className = 'comment lyric';
        return para;
    }
    
    renderTab(line){
        let el = document.createElement("div");
        for (let note of line.notes){
            el.appendChild(this.renderTabPart(note));
        }
        return el;
    }
    
    renderTabPart(part){
        if (part instanceof Token.AbsoluteNote){
            return this.renderNote(part);
        } else if (part instanceof Token.Rest) {
            return document.getElementById("tab-entry-spacer").content.cloneNode(true);
        } else if (part instanceof Token.Slur) {
            return document.getElementById("tab-entry-slur").content.cloneNode(true);
        } else if (part instanceof Token.Bar) {
            return document.getElementById("tab-entry-bar").content.cloneNode(true);
        }
    }
    
    renderNote(note){
        let tab = document.getElementById("tab-entry").content.cloneNode(true);
        
        let relativeCode = note.code - this.key;
        let fingering = FINGERINGS[relativeCode];
        let symbols;
        if (fingering === null || fingering === undefined) {
            tab.querySelector("ul").classList.add("error");
            symbols = "??????".split('');
        } else {
            symbols = fingering
                .split('')
                .map(finger => SYMBOL_MAP[finger]);
        }

        let items = tab.querySelectorAll("li")
        symbols.forEach((symbol, index) => {
            items[index].textContent = symbol;
        });
        let [letter, shift] = this.noteName(note);
        let octave = (relativeCode / 12) |0;
        if (octave >= 1){
            letter = letter.toUpperCase();
        }
        let suffix = "";
        if (shift > 0){
            suffix = `<span class="sharp">${"\u266f".repeat(shift)}</span>`;
        } else if (shift < 0){
            suffix = `<span class="flat">${"\u266d".repeat(-shift)}</span>`;
        }
        let name = letter + suffix;
        tab.querySelector(".tab-note--letter").innerHTML = name;
        tab.querySelector(".note-octave").textContent = "+".repeat(octave);
        
        return tab
    }
    
    noteName(note){
        let shift = note.shift;
        let letter = NOTES[mod(note.code - shift, 12)];
        if (letter){
            // we're fine
        } else if (shift > 0) {
            --shift;
        } else {
            ++shift;
        }
        return [NOTES[mod(note.code - shift, 12)],  shift];
    }
}

function mod(a, b){
    return (a % b + b) % b;
}
