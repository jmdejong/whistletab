
"use strict";
const APP_TITLE = 'Tin Whistle Tab Creator';

// function gd(id){
//     return document.getElementById(id);
// }
// 
// function gv(id){
//     return gd(id).value;
// }

class Controller {
    
    constructor(output){
//         this.tab = {};
        this.output = output;
//         this.noteInput = null;
//         this.spacingInput = null;
//         this.cachedModel = new Model(new Tab({}), {});
        this.listeners = {}
        this.getters = {};
    }
    
    _listen(id, onChange){
        let el = document.getElementById(id);
        let get = 
            el.checked === undefined
                ? (() => el.value)
                : (() => el.checked);
        el.addEventListener("input", e => onchange(get()));
        this.listeners[id] = onChange
        this.getters[id] = get;
    }
    
    init(){
        this._listen("notes", this.output.setNotes.bind(this.output));
        this._listen("spacing", this.output.setSpacing.bind(this.output));
        this._listen("tab-name", this.output.setName.bind(this.output));
        this._listen("tab-source", this.output.setSourceHeading.bind(this.output));
//         let update = e => this.update();
//         for (let id of ["notes", "spacing", "tab-name", "tab-source"]){
//             document.getElementById(id).addEventListener("input", update);
//         }
    }
    
    setTab(){
        
    }
    
//     static readModel(){
//         let tab = new Tab({
//             tab: gv("notes"),
//             name: gv("tab-name"),
//             spacing: gv("spacing"),
//             sourceUrl: gv("tab-source")
//         });
//         let config = {
//             whiteBackground: gv("white-background"),
//             showFingering: gv("show-fingering"),
//             showNotes: gv("show-notes"),
//             showLyrics: gv("show-lyrics"),
//             showStaves: gv("show-staves"),
//             showStaffNotes: gv("show-staff-notes")
//         };
//         return new Model(tab, config);
//     }
    
//     onNotesChange(e){
//         this.tab.notes = this.noteInput.value;
//         this.update();
//     }
//     
//     onSpacingChange(e){
//         this.tab.spacing = this.spacingInput.value;
//         this.update();
//     }
//     
//     setTab(tab){
//         this.tab = tab;
//         this.update();
//     }
    
//     _updateProperty(model, property, change){
//         if (this.model[model][property] !== this.previousTab[property]){
//             change(this.tab[property])
//             this.previousTab[property] = this.tab[property];
//         }
//     }
//     
//     update(){
//         let model = Controller.readModel();
//         this.updateProperty("notes", notes => this.output.setNotes(notes));
//         this.updateProperty("spacing", spacing => this.output.setSpacing(spacing));
//         this.updateProperty("name", name => {
//             document.title = name + ' · ' + APP_TITLE;
//         });
//     }
}

// window.Controller = Controller;
// })();
