"use strict";
const STORAGE_KEY = "saved_tabs";
const OLD_STORAGE_KEY = "saved-tabs";

const DEFAULT_TABS = {
    "Basic Scale": {
        name: 'Basic Scale',
        tab: 'def#gabc#',
        timestamp: 0
    },
    "Extended Scale": {
        name: 'Extended Scale',
        tab: 'def# gab c#\nd+e+f#+ g+a+b+ c#+\nd++e++f#++ g++a++b++ c#++',
        timestamp: 0
    }
};

class TabStorage {
    

    constructor(){
        if (!localStorage.getItem(STORAGE_KEY)){
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TABS));
        }
        this.stored = TabStorage.getStoredTabsRaw();
        if (localStorage.getItem(OLD_STORAGE_KEY)){
            let oldStored = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
            for (let item of oldStored){
                if (!this.stored[item.name]){
                    this.stored[item.name] = item;
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stored));
            localStorage.removeItem(OLD_STORAGE_KEY);
        }
        window.addEventListener("storage", e => {
            this.stored = TabStorage.getStoredTabsRaw();
            this.showStoredTabs();
        });
    }

    static getStoredTabsRaw(){
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    }

    static getStoredTabList(){
        let stored = Object.values(TabStorage.getStoredTabsRaw());
        stored.sort((a, b) => (a.timestamp || 0) < (b.timestamp || 0)); // todo: figure out if this order is correct
        let tabs = stored.map(o => new Tab(o));
        return tabs;
    }

    storeTab(tab){
        this.stored = TabStorage.getStoredTabsRaw();
        tab.timestamp = Date.now();
        this.stored[tab.name] = tab;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stored));
    }
    
    tabExists(name){
        return !!this.stored[name];
    }
    
    removeTab(name){
        this.stored = TabStorage.getStoredTabsRaw();
        delete this.stored[name];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stored));
    }

    showStoredTabs(){
        let tabs = TabStorage.getStoredTabList();
        let fragment = document.createDocumentFragment();
        let list = document.createElement("ul");
        for (let tab of tabs){
            let entry = this.showStoredTabEntry(tab);
            list.appendChild(entry);
        }
        fragment.appendChild(list);
        let tabDisplay = document.getElementById("tab-list");
        tabDisplay.innerHTML = "";
        tabDisplay.appendChild(fragment);
            
    }

    showStoredTabEntry(tab){
        let entry = document.createElement("li")
        entry.classList.add("saved-tab-entry")
        
        let name = document.createElement("strong");
        name.classList.add("saved-tab-name")
        name.appendChild(document.createTextNode(tab.name));
        entry.appendChild(name);
        
        let open = document.createElement("a");
        open.classList.add("saved-tab-opener")
        let url = new URL(window.location);
        url.search = tab.toQueryParameters();
        open.href = url
        open.appendChild(document.createTextNode("Open"));
        entry.appendChild(open);
        
        let remove = document.createElement("button");
        remove.addEventListener("click", e => {
            this.removeTab(tab.name);
            this.showStoredTabs();
        });
        remove.appendChild(document.createTextNode("Remove"));
        entry.appendChild(remove);
        
        return entry;
    }

}


