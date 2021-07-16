
(function(){
"use strict";

var APP_TITLE = 'Tin Whistle Tab Creator';

var dataStore = {
    getItem: function (key) {
        var dataString = window.localStorage.getItem(key);
        return dataString
    },
    setItem: function (key, dataString) {
        window.localStorage.setItem(key, dataString);
    }
};



window.TabStorage = {
    nameInput: document.querySelector('#tab-name'),
    sourceInput: document.querySelector('#tab-source'),
    savedTabList: document.querySelector('#tab-list'),
    serverTabList: document.querySelector('#server-tab-list'),

    deleteButton: document.querySelector('#delete-tab'),
    overwriteButton: document.querySelector('#overwrite-tab'),
    saveTabForm: document.querySelector('#save-tab-form'),
    savedTabsForm: document.querySelector('#saved-tabs-form'),
    serverTabsForm: document.querySelector('#server-tabs-form'),

    printTitle: document.querySelector('#print-title'),
    tabSourceLink: document.querySelector('#tab-source-link'),

    tabInput: null,

    savedTabs: [],

    STORAGE_KEY: 'saved-tabs',

    init: function (input) {
        var params = this.getHashParams();

        this.tabInput = input;
        this.saveTabForm.addEventListener('submit', this.saveTab.bind(this));

        this.savedTabsForm.addEventListener('submit', this.loadTab.bind(this));
        this.serverTabsForm.addEventListener('submit', this.loadTab.bind(this));
        this.savedTabsForm.addEventListener('dblclick', this.loadTab.bind(this));
        this.serverTabsForm.addEventListener('dblclick', this.loadTab.bind(this));

        this.overwriteButton.addEventListener('click', this.overwriteTab.bind(this));
        this.deleteButton.addEventListener('click', this.deleteTab.bind(this));
        this.savedTabsForm.addEventListener('click', this.toggleCollapse.bind(this));
        this.serverTabsForm.addEventListener('click', this.toggleCollapse.bind(this));

        // Load and render user tabs list
        this.fetchTabs();
        var initialIndex = 0;


        if (this.getQueryInput()) {
            this.renderSavedTabList(0);
            this.renderSavedTabList(0, true);
            this.tabInput.setValue(this.getQueryInput());
        } else if (params[0] === 'u') {
            initialIndex = Math.min(params[1], this.savedTabs.length - 1);
            this.renderSavedTabList(initialIndex);
            this.renderSavedTabList(0, true);
            this.loadTab();
        } else {
            initialIndex = Math.min(params[1], window.serverTabs.length - 1);
            this.renderSavedTabList(0);
            this.renderSavedTabList(initialIndex, true);
            this.loadTab(null, true);
        }
    },
    
    
    getQueryInput: () =>
        Encoder.decode(
            (new URL(document.location))
                .searchParams.get("s")
        ),

    setHashParams: function (isServer, index) {
        var params = [isServer ? 's' : 'u', index.toString()];
        window.location.hash = params.join('');
    },

    getHashParams: function () {
        var params = ['u', 0];

        if (window.location.hash) {
            params[0] = window.location.hash.slice(1, 2);
            params[1] = window.location.hash.slice(2);
        }

        params[1] = parseInt(params[1], 10);

        return params;
    },

    fetchTabs: function () {
        let jsonData = dataStore.getItem(this.STORAGE_KEY);
        if (jsonData) {
            this.savedTabs = JSON.parse(jsonData);
        } else {
            this.savedTabs = DEFAULT_TABS;
            this.storeTabs();
        }
    },
    storeTabs: function () {
        dataStore.setItem(this.STORAGE_KEY, JSON.stringify(this.savedTabs));
    },

    saveTab: function (event) {
        event.preventDefault();

        if (!this.nameInput.value) {
            return;
        }

        this.printTitle.innerHTML = this.nameInput.value;

        this.savedTabs.push({
            tab: this.tabInput.getValue(),
            spacing: this.tabInput.getSpacing(),
            name: this.nameInput.value,
            sourceUrl: this.sourceInput.value
        });

        this.storeTabs();
        this.renderSavedTabList(this.savedTabs.length - 1);
        this.nameInput.value = '';
    },

    getSelectedIndex: function (useServerTabs) {
        var form = useServerTabs ? this.serverTabsForm : this.savedTabsForm;
        var elements = form.elements['selected-tab-index'];
        var i;
        for (i = 0; i < elements.length; i += 1) {
            if (elements[i].checked) {
            return parseInt(elements[i].value, 10);
            }
        }

        return 0;
    },
    getSelectedTab: function (useServerTabs) {
        var tabs = useServerTabs ? window.serverTabs : this.savedTabs;
        return tabs[this.getSelectedIndex(useServerTabs)];
    },

    setSourceHeading: function (url) {
        if (url) {
            this.tabSourceLink.innerHTML = url;
            this.tabSourceLink.href = url;
        } else {
            this.tabSourceLink.innerHTML = 'unknown';
            this.tabSourceLink.href = '';
        }
    },

    loadTab: function (event, forceServerTab) {
        var isServerTab = event && event.currentTarget === this.serverTabsForm;
        var tabToLoad;

        isServerTab = !!(isServerTab || forceServerTab);
        tabToLoad = this.getSelectedTab(isServerTab);

        if (event) {
            event.preventDefault();
        }

        this.setHashParams(isServerTab, this.getSelectedIndex(isServerTab));

        this.tabInput.setValue(tabToLoad.tab);
        this.tabInput.setSpacing(tabToLoad.spacing);
        document.title = tabToLoad.name + ' · ' + APP_TITLE;
        this.printTitle.innerHTML = tabToLoad.name;
        this.printTitle.scrollIntoView(true, { behaviour: 'smooth' });
        this.setSourceHeading(tabToLoad.sourceUrl);
    },

    overwriteTab: function () {
        var tabToOverwrite = this.getSelectedTab();
        var newName = window.prompt('Tab name:', tabToOverwrite.name);

        if (newName) {
            tabToOverwrite.name = newName;
            tabToOverwrite.tab = this.tabInput.getValue();
            tabToOverwrite.spacing = this.tabInput.getSpacing();
            this.storeTabs();
            this.renderSavedTabList(this.getSelectedIndex());
        }
    },

    deleteTab: function () {
        var index = this.getSelectedIndex();
        var tabToDelete = this.getSelectedTab();

        if (window.confirm(
            'Are you sure you want to delete the selected tab?\n\n' +
            'Name: ' + tabToDelete.name
        )) {
            this.savedTabs.splice(index, 1);
            this.storeTabs();
            this.renderSavedTabList();
        }
    },

    renderSavedTabList: function (selectedIndex, useServerTabs) {
        var frag = document.createDocumentFragment();
        var tabs = useServerTabs ? window.serverTabs : this.savedTabs;
        var tabList = useServerTabs ? this.serverTabList : this.savedTabList;
        if (!selectedIndex) {
            selectedIndex = 0;
        }

        tabs.forEach(function (savedTab, index) {
            var label = document.createElement('label');
            var text = document.createTextNode(savedTab.name);
            var input = document.createElement('input');

            input.type = 'radio';
            input.name = 'selected-tab-index';
            input.value = index.toString();
            if (index === selectedIndex) {
            input.checked = true;
            }

            label.appendChild(input);
            label.appendChild(text);
            frag.appendChild(label);
        });

        tabList.innerHTML = '';
        tabList.appendChild(frag);
    },

    toggleCollapse: function (event) {
        var form;
        if (!event.target.matches('.tab-list legend')) return;
        switch (event.target.getAttribute('data-form-name')) {
            case 'user':
            form = this.savedTabsForm;
            break;
            case 'server':
            form = this.serverTabsForm;
            break;
            default:
            return;
        }
        form.classList.toggle('collapsed');
    }
};

})()
