"use strict";


class TextError extends Error { }

const LETTER_CODES = {
    a: 0,
    b: 2,
    c: 3,
    d: 5,
    e: 7,
    f: 8,
    g: 10
};


const SHARP = "#";
const FLAT = "_";
const SPACE = " ";
const SLUR = "-";

const SYMBOL_MAP = {
    'o': '\u25cb', // white circle
    '-': '\u25cf', // black circle
    'H': '\u25d0', // circle with left half black
    'h': '\u25d1'  // circle with right half black
}


let NOTES = "a a# b c c# d d# e f f# g g#".split(' ');

class RelativeNote {
    
    constructor(code){
        this.code = code;
    }
    
    getOctave(){
        return this.code / 12 | 0;
    }
    
    
    getFingering(){
        return this.fingerings[this.code];
    }
    
    fingerings = [
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
}




const SAME = "s";


class TabView {
    
    spacerTemplate = '<span class="spacer"></span>'
    slurTemplate = '<span class="slur">(</span>'


    spacing = 1
    // These are the spacings as defined in ems in the CSS
    spacings = [0, 0.1, 0.2, 0.3, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]
    
    
    constructor() {
        
        this.showNotes = false;
        this.staves = [];
    }
    
    init(){
        this.el = document.querySelector('#tab');
        this.tabTemplate = document.querySelector('#tab-entry').innerHTML;
        this.errorTemplate = document.querySelector('#tab-entry-error').innerHTML;
        this.share = document.getElementById("share-url");
        this.printTitle = document.querySelector('#print-title');
        this.tabSourceLink = document.querySelector('#tab-source-link');
    }
    
    measure1Em() {
        const ul = this.el.querySelector('ul');
        if (!ul){
            return;
        }
        const rect = ul.getBoundingClientRect();

        // Fingering elements have a width of 1.2em defined in the CSS.
        this.emSize = rect.width / 1.2;

        return this.emSize;
    }

    calculateNoteSpacing() {
        return this.emSize * (this.spacings[this.spacing] + 1.2);
    }

    staffFromNotes(notes) {
        const noteSpacing = this.calculateNoteSpacing();
        const newStaff = new window.Staff(notes, this.showNotes, noteSpacing);
        this.staves.push(newStaff);
        return newStaff.toHtml();
    }
    
    tabFromNote(note, staffNotes, baseCode, keyCode) {
        // staffNotes is a list of notes that this function modifies. Each
        // note, space and slur is added to it, and when a line break is reached,
        // a staff is added and the list is reset.
        var fingers;

        if (note === '\n') {
            var staff = this.staffFromNotes(staffNotes);
            staffNotes.length = 0;
            return staff + '<div class="line-break"></div>';
        }

        if (note === '') {
            return '';
        }

        if (note === ' ') {
            staffNotes.push(note);
            return this.spacerTemplate;
        }

        if (note === '-') {
            staffNotes.push(note);
            return this.slurTemplate;
        }

        if (/^---/.test(note)) {
            return this.commentFromNote(note, true);
        }

        if (/^--/.test(note)) {
            return this.lyricsFromNote(note, false);
        }

        if (/^-/.test(note)) {
            return this.commentFromNote(note);
        }
        
        let fingering = this.getFingering(note, baseCode, keyCode);
        staffNotes.push(note);
        if (fingering !== null) {
            fingers = fingering.split('');
        } else {
            return this.errorTemplate;
        }

        return fingers
            .reduce(
                (html, finger, index) => {
                    var placeholder = '$' + index.toString();
                    return html.replace(placeholder, this.symbolMap[finger]);
                },
                this.tabTemplate.concat()
            )
            .replace('$N', this.noteTemplate(note));
    }

    setNotes(inputString, key, base) {
        
        let keyCode = WrittenNote.fromString(key).getCode(0);
        let baseCode = base === SAME ? keyCode : Note.fromString(base).getCode(0);

        this.staves = [];

        this.el.innerHTML = '';
        
        let renderer = new Renderer(keyCode, this.spacing);
        
        let wt = new WTText(baseCode);
        let lines = wt.toLines(inputString)
            .reduce(((acc, line) => acc.concat(renderer.render(line))), [])
            .forEach((line, index) => {
                if (index != 0){
                    this.el.appendChild(document.getElementById("line-break-template").content.cloneNode(true));
                }
                this.el.appendChild(line);
            });
    }
    
    setShareUrl(tab){
        let encoded = Encoder.encode(tab);
        let url = new URL(window.location);
        url.search = tab.toQueryParameters();
        this.share.value = url;
        document.getElementById("open-share-url").href=url;
    }

    setSpacing(toValue) {
        this.spacing = parseInt(toValue, 10);
        this.el.className = 'spacing' + this.spacing;
    }
    
    setName(name){
        
        document.title = name + ' · ' + APP_TITLE;
        this.printTitle.innerHTML = name;
    }
    
    setSourceHeading(url) {
        if (url) {
            this.tabSourceLink.innerHTML = url;
            this.tabSourceLink.href = url;
        } else {
            this.tabSourceLink.innerHTML = 'unknown';
            this.tabSourceLink.href = '';
        }
    }
};
