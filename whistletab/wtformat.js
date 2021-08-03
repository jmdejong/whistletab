


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
        let [_, sharps, flats] = suffix.match("^(?:(#*)|(_*))$");
        this.offset = (sharps || "").length - (flats || "").length;
    }
    
    getCode(base){
        base = base || 0;
        return (LETTER_CODES[this.letter] + 12 - base) % 12 + base
            + 12 * this.octave 
            + this.offset;
    }
    
    makeAbsolute(baseCode){
        return new Token.AbsoluteNote(
            this.getCode(baseCode), 
            this.offset
        );
    }
}



class WTText {
    
    constructor(base){
        this.base = base;
    }
    
    toLines(text){
        if (text === null || text === undefined){
            return [];
        }
        return text
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
