

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
        }
    }
    
    renderNote(note){
        let tabMissing = false;
        let relative = note.makeRelative(this.key)
        let fingering = relative.getFingering();
        let tab = document.getElementById("tab-entry").content.cloneNode(true);
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
        let name = NOTES[note.code % 12];
        if (relative.getOctave() >= 1){
            name = name.toUpperCase();
        }
        name = name.replace("#", '<span class="sharp">\u266f</span>');
        tab.querySelector(".tab-note--letter").innerHTML = name;
        tab.querySelector(".note-octave").textContent = "+".repeat(relative.getOctave());
        
        return tab
    }
}
