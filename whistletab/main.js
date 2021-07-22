"use strict";
/*eslint indent: ["warn", 4] */
(function () {

    
    let tabview = new TabView();
    tabview.init();
    let controller = new Controller(tabview);
    controller.init();
    
    let tab = Tab.fromQueryParameters(document.location.search);
    if (tab){
        controller.setTab(tab);
    }

    let options = document.querySelector('#display-options');
    for (let option of options.getElementsByTagName("input")){
        let update = () => document.body.classList.toggle(option.id, option.checked);
        if (option.id === 'show-staff-notes') {
            update = () => {
                tabview.showNotes = option.checked;
                controller.update();
            }
        }
        option.addEventListener("input", update);
        update()
    }
    
    document.getElementById("copy-share-url").addEventListener("click", e => {
        document.getElementById("share-url").select();
        document.execCommand("copy");
    });
    
}());
