/*eslint indent: ["warn", 4] */
(function () {


    input.init(Tab);
    TabStorage.init(input);

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
