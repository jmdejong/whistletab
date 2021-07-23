"use strict";


    

window.addEventListener("load", () => {

    
    let tabview = new TabView();
    tabview.init();
    let storage = new TabStorage();
    let controller = new Controller(tabview, storage);
    
    let tab = Tab.fromQueryParameters(document.location.search);
    if (tab){
        controller.setTab(tab);
    }
    
    storage.showStoredTabs();
});
