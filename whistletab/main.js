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

    document.querySelector('#display-options').addEventListener('change', function (event) {
        var checkbox;
        if (event.target.nodeName !== 'INPUT') {
            return;
        }

        checkbox = event.target;
        document.body.classList.toggle(checkbox.id, checkbox.checked);

        if (checkbox.id === 'show-staff-notes') {
            tabview.showNotes = checkbox.checked;
            controller.update();
        }
    });
}());
