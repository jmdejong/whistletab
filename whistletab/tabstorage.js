
(function(){
"use strict";

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

var dataStore = {
    getItem: function (key) {
        var dataString = window.localStorage.getItem(key);
        return dataString
    },
    setItem: function (key, dataString) {
        window.localStorage.setItem(key, dataString);
    }
};



class TabStorage {
    savedTabList = document.querySelector('#tab-list');
    serverTabList = document.querySelector('#server-tab-list');

    savedTabsForm = document.querySelector('#saved-tabs-form');
    serverTabsForm = document.querySelector('#server-tabs-form');


    tabInput = null;

    savedTabs = [];

    STORAGE_KEY = 'saved-tabs';

    init(controller) {

        this.controller = controller;
        
        document.querySelector('#save-tab-form').addEventListener('submit', this.saveTab.bind(this));
        document.querySelector('#overwrite-tab').addEventListener('click', this.overwriteTab.bind(this));
        document.querySelector('#delete-tab').addEventListener('click', this.deleteTab.bind(this));
        
        this.savedTabsForm.addEventListener('submit', this.loadTab.bind(this));
        this.serverTabsForm.addEventListener('submit', this.loadTab.bind(this));
        this.savedTabsForm.addEventListener('dblclick', this.loadTab.bind(this));
        this.serverTabsForm.addEventListener('dblclick', this.loadTab.bind(this));

        this.savedTabsForm.addEventListener('click', this.toggleCollapse.bind(this));
        this.serverTabsForm.addEventListener('click', this.toggleCollapse.bind(this));
        

        // Load and render user tabs list
        this.fetchTabs();
        var initialIndex = 0;


        var params = this.getHashParams();
        
        if (this.getQueryInput()) {
            this.renderSavedTabList(0);
            this.renderSavedTabList(0, true);
            this.controller.setTab(this.getQueryInput());
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
    }
    
    
    getQueryInput() {
        return Encoder.decode(
            (new URL(document.location))
                .searchParams.get("s")
        )
    }

    setHashParams(isServer, index) {
        var params = [isServer ? 's' : 'u', index.toString()];
        window.location.hash = params.join('');
    }

    getHashParams() {
        var params = ['u', 0];

        if (window.location.hash) {
            params[0] = window.location.hash.slice(1, 2);
            params[1] = window.location.hash.slice(2);
        }

        params[1] = parseInt(params[1], 10);

        return params;
    }

    fetchTabs() {
        let jsonData = dataStore.getItem(this.STORAGE_KEY);
        if (jsonData) {
            this.savedTabs = JSON.parse(jsonData);
        } else {
            this.savedTabs = DEFAULT_TABS;
            this.storeTabs();
        }
    }
    
    storeTabs() {
        dataStore.setItem(this.STORAGE_KEY, JSON.stringify(this.savedTabs));
    }

    saveTab(event) {
        event.preventDefault();
        
        let tab = this.controller.getTab()
        if (!tab.name){
            return;
        }

        this.savedTabs.push(tab);

        this.storeTabs();
        this.renderSavedTabList(this.savedTabs.length - 1);
    }

    getSelectedIndex(useServerTabs) {
        var form = useServerTabs ? this.serverTabsForm : this.savedTabsForm;
        var elements = form.elements['selected-tab-index'];
        var i;
        for (i = 0; i < elements.length; i += 1) {
            if (elements[i].checked) {
            return parseInt(elements[i].value, 10);
            }
        }

        return 0;
    }
    
    getSelectedTab(useServerTabs) {
        var tabs = useServerTabs ? window.serverTabs : this.savedTabs;
        return tabs[this.getSelectedIndex(useServerTabs)];
    }

    loadTab(event, forceServerTab) {
        var isServerTab = event && event.currentTarget === this.serverTabsForm;
        var tabToLoad;

        isServerTab = !!(isServerTab || forceServerTab);
        tabToLoad = this.getSelectedTab(isServerTab);

        if (event) {
            event.preventDefault();
        }

        this.setHashParams(isServerTab, this.getSelectedIndex(isServerTab));

        this.controller.setTab(new Tab(tabToLoad));
    }

    overwriteTab() {
        var tabToOverwrite = this.getSelectedTab();
        var newName = window.prompt('Tab name:', tabToOverwrite.name);

        if (newName) {
            tabToOverwrite.name = newName;
            tabToOverwrite.tab = this.tabInput.getValue();
            tabToOverwrite.spacing = this.tabInput.getSpacing();
            this.storeTabs();
            this.renderSavedTabList(this.getSelectedIndex());
        }
    }

    deleteTab() {
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
    }

    renderSavedTabList(selectedIndex, useServerTabs) {
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
    }

    toggleCollapse(event) {
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
}

window.TabStorage = TabStorage;

})()
