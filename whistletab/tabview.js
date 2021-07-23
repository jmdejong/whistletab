

const LETTER_CODES = {
    a: 0,
    b: 2,
    c: 3,
    d: 5,
    e: 7,
    f: 8,
    g: 10
};

class Note {
    
    static noteParser = /^([a-gA-G])([#_]?)(\+*)$/;
    
    static SHARP = "#";
    static FLAT = "_";
    
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
        return new Note(letter, octave, suffix);
    }
    
    constructor(letter, octave, suffix){
        this.letter = letter;
        this.octave = octave;
        this.suffix = suffix;
    }
    
    getCode(base){
        return (LETTER_CODES[this.letter] + 12 - base) % 12
            + 12 * this.octave 
            + (this.suffix == Note.SHARP) 
            - (this.suffix == Note.FLAT);
    }
}


class TabView {
    
    spacerTemplate = '<span class="spacer"></span>'
    slurTemplate = '<span class="slur">(</span>'

    noteMatcher = /^-{1,3}.*$|-|[a-g]#?\+{0,2}|\n| /gi

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
    
    calculateNoteCode(noteName){
        
    }
    
    getFingering(noteName){
        
        let note = Note.fromString(noteName);
        if (note === null){
            return null;
        }
        let code = note.getCode(LETTER_CODES.d);
        if (code >= this.fingerings.length){
            return null;
        }
        return this.fingerings[code]
    }
    
    tabFromNote(note, staffNotes, prevWasNote) {
        // staffNotes is a list of notes that this function modifies. Each
        // note, space and slur is added to it, and when a line break is reached,
        // a staff is added and the list is reset.
        var fingers;

        if (note === '\n' && prevWasNote) {
            var staff = this.staffFromNotes(staffNotes);
            staffNotes.length = 0;
            return staff + '<div class="line-break"></div>';
        }

        if (note === '\n') {
            return '<div class="line-break"></div>';
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
        
        let fingering = this.getFingering(note);
        if (fingering !== null) {
            staffNotes.push(note);
            fingers = fingering.split('');
        } else {
            return this.errorTemplate;
        }

        return fingers.reduce(function (html, finger, index) {
            var placeholder = '$' + index.toString();
            return html.replace(placeholder, this.symbolMap[finger]);
        }.bind(this), this.tabTemplate.concat()).
            replace('$N', this.noteTemplate(note));
    }

    setNotes(inputString) {
        var self = this;
        var lines = inputString.split('\n');
        var notes;
        var staffNotes = [];
        var tabs;
        var prevWasNote = false;

        this.staves = [];

        if (lines.length === 0) {
            this.el.innerHTML = '';
            return;
        }

        notes = lines.reduce(function (n, line) {
            if (line === '') return n.concat('\n');
            return n.concat(line.match(self.noteMatcher), '\n');
        }, []);

        tabs = notes.map(function (note) {
            var mapped = this.tabFromNote(note, staffNotes, prevWasNote);
            prevWasNote = !!this.getFingering(note);
            return mapped;
        }, this);
        
        this.el.innerHTML = tabs.join('');
        if (tabs.length !== 0){
            this.measure1Em();
        }
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
