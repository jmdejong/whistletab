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

// const ERROR_TEMPLATE = '<ul class="tab-note error"><li>?</li><li>?</li><li>?</li><li>?</li><li>?</li><li>?</li><li class="tab-note">?</li></ul>';
// const SPACER_TEMPLATE = '<span class="spacer"></span>'
// const SLUR_TEMPLATE = '<span class="slur">(</span>'


let NOTES = "a a# b c c# d d# e f f# g g#".split(' ');

class WrittenNote {
    
    static noteParser = /^([a-gA-G])(#*|_*)(\+*)$/;
    
    
    static fromString(name){
        let match = name.match(this.noteParser);
        if (!match || match.length !== 4){
            return null;
        }
        let [_, letter, suffix, higher] = match;
        let octave = higher.length;
        if (letter.match(/[A-G]/)) {
            ++octave;
            letter = letter.toLowerCase();
        }
        return new WrittenNote(letter, octave, suffix);
    }
    
    constructor(letter, octave, suffix){
        this.letter = letter;
        this.octave = octave;
        this.suffix = suffix;
    }
    
    getCode(base){
        base = base || 0;
        return (LETTER_CODES[this.letter] + 12 - base) % 12 + base
            + 12 * this.octave 
            + (this.suffix === SHARP) 
            - (this.suffix === FLAT);
    }
    
    makeAbsolute(baseCode){
        return new Token.AbsoluteNote(
            this.getCode(baseCode), 
            (this.suffix === SHARP) - (this.suffix === FLAT)
        );
    }
}

class Token {

    static AbsoluteNote = class AbsoluteNote{
        
        constructor(code, shift){
            this.code = code;
            this.shift = shift || 0; // whether the key is sharp of flat. This won't change the actual height, only whether it's displayed as eg C# or Db
        }
        
        makeRelative(keyCode){
            return new RelativeNote(this.code - keyCode);
        }
        
        getOctave(baseCode){
            return ((this.code - baseCode) / 12) | 0;
        }
        
        getTab(keyCode){
            
            let tabMissing = false;
            let relative = this.makeRelative(keyCode)
            let fingering = relative
                .getFingering();
            let tab = document.getElementById("tab-entry").content.cloneNode(true);
//             console.log(tab);
            let symbols;
            if (fingering === null) {
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
            let name = NOTES[this.code % 12];
            if (relative.getOctave() >= 1){
                name = name.toUpperCase();
            }
            name = name.replace("#", '<span class="sharp">\u266f</span>');
            tab.querySelector(".tab-note--letter").innerHTML = name;
            tab.querySelector(".note-octave").textContent = "+".repeat(relative.getOctave());
            
            return tab
        }
        
    }
    
    static Rest = class Rest{
        getTab(keyCode){
            return document.getElementById("tab-entry-spacer").content.cloneNode(true);
        }
    }
    
    static Slur = class Slur{
        getTab(keyCode){
            return document.getElementById("tab-entry-slur").content.cloneNode(true);
        }
    }
}

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
        

class WTText {
    
    constructor(text, base){
        this.text = text;
        this.base = base;
    }
    
    toLines(){
        if (this.text === null || this.text === undefined){
            return [];
        }
        return this.text
            .split('\n')
            .map(l => this.textLineToLine(l.trim()));
    }
    
    textLineToLine(text){
        if (text === ""){
            return new Line.Empty();
        } else {
            let parts = text.match(/^(?<prefix>-*)(?<body>[^-].*)$/).groups
            let prefix = parts.prefix;
            let body = parts.body;
            if (prefix.length > 3){
                return new Line.Empty();
            } else if (prefix.length === 3){
                return new Line.Comment(body, true);
            } else if (prefix.length === 2){
                return new Line.Lyrics(body.split(' '));
            } else if (prefix.length === 1){
                return new Line.Comment(body);
            } else if (prefix.length === 0){
                return this.toNoteLine(body);
            } else {
                throw new TextError(`no match found for line prefix: ${prefix}, ${body}; line: ${text}`);
            }
        }
    }
    
    toNoteLine(line){
        let text = line;
        let tokens = [];
        while (text !== ""){
            let r = text.match(/^(\s+)|(-)|([a-gA-G])(#*|_*)(\+*)/);
            if (r === null){
                throw new TextError(`invalid line: ${text}`);
            }
            let [match, space, slur, noteName, suffix, octave] = r;
            if (space !== undefined){
                tokens.push(new Token.Rest())
            } else if (slur !== undefined){
                tokens.push(new Token.Slur());
            } else if (noteName != undefined){
                tokens.push(WrittenNote.fromString(match).makeAbsolute(this.base));
            }
            text = text.substring(match.length);
        }
        return new Line.Notes(tokens);
    }
}


class Line {
    
    static Empty = class Empty {
        render(){
            return [];
        }
    }
    
    static Comment = class Comment {
        
        constructor(text, isHeading){
            this.text = text;
            this.isHeading = isHeading || false;
        }
        
        render() {
            let para = document.createElement('p');
            para.appendChild(document.createTextNode(this.text));
            para.className = this.isHeading ? 'comment heading' : 'comment text';
            return [para];
        }
    }
    
    static Lyrics = class Lyrics{
        
        constructor(words){
            this.words = words
        }
        
        render(){
            let para = document.createElement('p');
            this.words.forEach(word => {
                let spacingWrapper = document.createElement('span');
                let wordEl = document.createElement('span');
                wordEl.appendChild(document.createTextNode(word));
                wordEl.className = 'word';
                spacingWrapper.className = 'spacer';
                spacingWrapper.appendChild(wordEl);
                para.appendChild(spacingWrapper);
            });
            para.className = 'comment lyric';
            return [para];
        }
    }
    
    static Notes = class Notes {
        
        constructor(notes) {
            this.notes = notes;
        }
        
        render(key){
//             return this.notes.map(note => note.getTab(key));
            let el = document.createElement("div");
            for (let note of this.notes){
                el.appendChild(note.getTab(key));
            }
            return [el];
        }
    }
}
//             if (text.startsWith("---")){
//                 return new Line.Heading(text);
//             } else if (text.startsWith("--")){
//                 if (!line.match(/^(\s+|-|[a-g](?:#*|_*)\+*)+$/i){
//                     throw new Exception("invalid line: " + line
//                 return new Line.Lyrics(text.split(" "))

const SAME = "s";


class TabView {
    
    spacerTemplate = '<span class="spacer"></span>'
    slurTemplate = '<span class="slur">(</span>'

    noteMatcher = /^-{1,3}.*$|-|[a-g]#?\+{0,2}|\n| /gi
    
    noteLineValidator = /^(\s+|-|[a-g](?:#*|_*)\+*)+$/i
    noteTokenizer = /(?<space>\s+)|(?<slur>-)|(?<notename>[a-gA-G])(?<suffix>#*|_*)(?<octave>\+*)/g

    spacing = 1
    // These are the spacings as defined in ems in the CSS
    spacings = [0, 0.1, 0.2, 0.3, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]
    

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
    ]
    symbolMap = {
        'o': '\u25cb', // white circle
        '-': '\u25cf', // black circle
        'H': '\u25d0', // circle with left half black
        'h': '\u25d1'  // circle with right half black
    }
    
    
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

    lyricsFromNote(note) {
        var commentWords = note.replace(/^--(.*)$/, '$1').split(' ');
        var para = document.createElement('p');

        commentWords.forEach(function (word) {
            var spacingWrapper = document.createElement('span');
            var wordEl = document.createElement('span');
            var textNode = document.createTextNode(word);
            wordEl.appendChild(textNode);
            wordEl.className = 'word';
            spacingWrapper.className = 'spacer';
            spacingWrapper.appendChild(wordEl);
            para.appendChild(spacingWrapper);
        });
        para.className = 'comment lyric';

        return para.outerHTML;
    }
    commentFromNote(note, isHeading) {
        var para = document.createElement('p');
        var text = note.replace(/^-{1,3}(.*)$/, '$1');
        para.appendChild(document.createTextNode(text));
        para.className = isHeading ? 'comment heading' : 'comment text';
        return para.outerHTML;
    }
    noteTemplate(note) {
        var htmlNote;
        var octave = '';

        if (/[a-g](#)?\+/.test(note)) {
            note = note.toUpperCase().slice(0, -1);
        }
        // Uppercase notes are shorthand for `<note>+`
        if (/[A-G]/.test(note)) {
            octave = '+';
        }
        if (/\+/.test(note)) {
            note = note.toUpperCase().slice(0, -1);
            octave = '++';
        }

        htmlNote = '<span class="tab-note--letter">' + note + '</span>';
        htmlNote = htmlNote.replace('#', '<span class="sharp">\u266f</span>'); // sharp symbol
        if (octave) {
            htmlNote += '<sup>' + octave + '</sup>';
        }

        return htmlNote;
    }
    staffFromNotes(notes) {
        const noteSpacing = this.calculateNoteSpacing();
        const newStaff = new window.Staff(notes, this.showNotes, noteSpacing);
        this.staves.push(newStaff);
        return newStaff.toHtml();
    }
    
    getFingering(noteName, baseCode, keyCode){
        
        let note = WrittenNote.fromString(noteName);
        if (note === null){
            return null;
        }
        let code = note.getCode(baseCode) - keyCode;
        if (code >= this.fingerings.length){
            return null;
        }
        return this.fingerings[code]
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
        
//         var lines = inputString.split('\n');

        this.staves = [];

        this.el.innerHTML = '';
//         if (lines.length === 0) {
//             return;
//         }
        
        let wt = new WTText(inputString, baseCode);
//         let lines = wt.toLines();
        wt.toLines(baseCode)
            .reduce(((acc, line) => acc.concat(line.render(keyCode))), [])
            .forEach((line, index) => {
                if (index != 0){
                    this.el.appendChild(document.getElementById("line-break-template").content.cloneNode(true));
                }
                this.el.appendChild(line);
            });
//         wt.toLines(baseCode).forEach(line =>
//             line.render(keyCode)
//             for (let el of line.render(keyCode)){
//                 this.el.appendChild(el);
//             }
//         }
//         console.log(wt.toLines());
        
//         let output = [];
//         for (let line of lines){
//             line = line.trim();
//             if (line.length === 0){
//                 continue;
//             } else if (line[0] === '-'){
//                 // parse text line
//             } else {
//                 if (!this.noteLineValidator.test(line)){
//                     // error
//                 }
// //                 while (line !== ""){
//                 
//                 let tokens = []
//                 for (let part of line.matchAll(this.noteTokenizer)){
//                     
//                 }
// //                 console.log(tokens);
//             }
//         }

//         let notes = lines.reduce((n, line) => {
//             if (line === ''){
//                 return n.concat('\n');
//             } else {
//                 return n.concat(line.match(this.noteMatcher), '\n');
//             }
//         }, []);
//         
// 
//         var staffNotes = [];
//         let tabs = notes.map((note) => {
//             var mapped = this.tabFromNote(note, staffNotes, baseCode, keyCode);
//             return mapped;
//         });
//         
//         this.el.innerHTML = tabs.join('');
//         if (tabs.length !== 0){
//             this.measure1Em();
//         }
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

        if (this.staves.length === 0) return;

        const newStaves = [];
        const staffEls = Array.from(this.el.querySelectorAll('.staff'));

        staffEls.forEach(function (el, index) {
            const oldStaff = this.staves[index];
            const notes = oldStaff.notes;
            const noteSpacing = this.calculateNoteSpacing();
            const newStaff = new window.Staff(notes, this.showNotes, noteSpacing);
            newStaff.render();
            this.el.replaceChild(newStaff.svg, el);
            newStaves.push(newStaff);
        }, this);

        this.staves = newStaves;
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
