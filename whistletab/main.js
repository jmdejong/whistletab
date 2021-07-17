/*eslint indent: ["warn", 4] */
(function () {
    var DEFAULT_TABS = [
        {
            name: 'Basic Scale',
            tab: 'def#gabc#'
        },
        {
            name: 'Extended Scale',
            tab: 'def# gab c#\nd+e+f#+ g+a+b+ c#+\nd++e++f#++ g++a++b++ c#++'
        }
    ];

    let tabview = new TabView();
    tabview.init();
//     let model = new Model(new Tab({}), {});
    let controller = new Controller(tabview);
    controller.init();

//     input.init(TabElement);
//     TabStorage.init(input);

    document.querySelector('#display-options').addEventListener('change', function (event) {
        var checkbox;
        if (event.target.nodeName !== 'INPUT') {
            return;
        }

        checkbox = event.target;
        document.body.classList.toggle(checkbox.id, checkbox.checked);

        if (checkbox.id === 'show-staff-notes') {
            tab.showNotes = checkbox.checked;
            tab.refresh();
        }
    });
}());
