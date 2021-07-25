"use strict";
const APP_TITLE = 'Tin Whistle Tab Creator';


class Controller {
    
    constructor(output, storage){
        this.output = output;
        this.storage = storage
        this.elements = {};
        this.updaters = []
        
        
        this._listen("notes", el => this.updateTab());
        this._listen("spacing", el => {
            this.output.setSpacing(el.value);
        });
        this._listen("tab-name", el => {
            this.output.setName(el.value);
            document.getElementById("overwrite-warning").hidden = !this.storage.tabExists(el.value);
        });
        this._listen("tab-source", el => {
            this.output.setSourceHeading(el.value);
        });
        this._listen("whistle-key", el => this.updateTab());
        this._listen("octave-base", el => this.updateTab());
        
        
        let options = document.querySelector('#display-options');
        for (let option of options.getElementsByTagName("input")){
            let update = () => document.body.classList.toggle(option.id, option.checked);
            if (option.id === 'show-staff-notes') {
                update = () => {
                    this.output.showNotes = option.checked;
                    this.update();
                }
            }
            option.addEventListener("input", update);
            update()
        }
        
        document.getElementById("copy-share-url").addEventListener("click", e => {
            document.getElementById("share-url").select();
            document.execCommand("copy");
        });
        
        document.getElementById("saved-tabs-legend").addEventListener("click", e => {
            document.getElementById("saved-tabs-content").classList.toggle('collapsed');
        })
        
        document.getElementById("save-tab").addEventListener("click", e => {
            this.storage.storeTab(this.getTab());
            this.storage.showStoredTabs();
        });
    }
    
    _listen(id, onChange){
        let el = document.getElementById(id);
        el.addEventListener("input", e => {
            onChange(el);
            this.output.setShareUrl(this.getTab());
        });
        this.elements[id] = el;
        this.updaters.push(() => {
            onChange(el);
            this.output.setShareUrl(this.getTab());
        });
    }
    
    
    _toggleClass(el){
        document.body.classList.toggle(el.id, el.checked);
    }
    
    updateTab(){
        this.output.setNotes(
            this.get("notes").value,
            this.get("whistle-key").value,
            this.get("octave-base").value
        );
    }
    
    get(id){
        return this.elements[id];
    }
    
    setTab(tab){
        this.get("notes").value = tab.tab;
        this.get("spacing").value = tab.spacing;
        this.get("tab-name").value = tab.name;
        this.get("tab-source").value = tab.sourceUrl;
        this.get("whistle-key").value = tab.key;
        this.get("octave-base").value = tab.base;
        this.update()
    }
    
    getTab(){
        return new Tab({
            tab: this.get("notes").value,
            name: this.get("tab-name").value,
            spacing: this.get("spacing").value,
            sourceUrl: this.get("tab-source").value,
            key: this.get("whistle-key").value,
            base: this.get("octave-base").value
        });
    }
    
    update(){
        for (let update of this.updaters){
            update();
        }
    }
}

