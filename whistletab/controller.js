"use strict";
const APP_TITLE = 'Tin Whistle Tab Creator';


class Controller {
    
    constructor(output){
        this.output = output;
        this.elements = {};
        this.updaters = []
    }
    
    _listen(id, onChange){
        let el = document.getElementById(id);
        el.addEventListener("input", e => onChange(el));
        this.elements[id] = el;
        this.updaters.push(() => onChange(el));
    }
    
    init(){
        this._listen("notes", el => {
            this.output.setNotes(el.value);
            this.output.setShareUrl(this.getTab());
        });
        this._listen("spacing", el => {
            this.output.setSpacing(el.value);
            this.output.setShareUrl(this.getTab());
        });
        this._listen("tab-name", el => {
            this.output.setName(el.value);
            this.output.setShareUrl(this.getTab());
        });
        this._listen("tab-source", el => {
            this.output.setSourceHeading(el.value);
            this.output.setShareUrl(this.getTab());
        });
        this.update()
    }
    
    _toggleClass(el){
        document.body.classList.toggle(el.id, el.checked);
    }
    
    get(id){
        return this.elements[id];
    }
    
    setTab(tab){
        this.get("notes").value = tab.tab;
        this.get("spacing").value = tab.spacing;
        this.get("tab-name").value = tab.name;
        this.get("tab-source").value = tab.sourceUrl;
        this.update()
    }
    
    getTab(){
        return new Tab({
            tab: this.get("notes").value,
            name: this.get("tab-name").value,
            spacing: this.get("spacing").value,
            sourceUrl: this.get("tab-source").value
        });
    }
    
    update(){
        for (let update of this.updaters){
            update();
        }
    }
}

