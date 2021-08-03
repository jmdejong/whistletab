
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
    }
    
    static Lyrics = class Lyrics{
        
        constructor(words){
            this.words = words
        }
    }
    
    static Notes = class Notes {
        
        constructor(notes) {
            this.notes = notes;
        }
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
    }
    
    static Rest = class Rest{ }
    
    static Slur = class Slur{ }
}
