
var input = {
    el: document.querySelector('#notes'),
    spacing: document.querySelector('#spacing'),
    share: document.getElementById('share-url'),
    output: null,

    init: function (target) {
        this.output = target;
        this.el.addEventListener('input', this.updateOutput.bind(this));
        this.spacing.addEventListener('input', this.updateSpacing.bind(this));
        this.el.focus();
    },
    setValue: function (newValue) {
        this.el.value = newValue;
        this.updateOutput();
    },
    getValue: function () {
        return this.el.value;
    },
    setSpacing: function (newValue) {
        this.spacing.value = newValue || '0';
        this.updateSpacing();
    },
    getSpacing: function () {
        return this.spacing.value;
    },
    updateOutput: function () {
        this.output.setTab(this.el.value);
        this.setShareUrlInput(this.el.value);
    },
    updateSpacing: function () {
        this.output.setSpacing(this.spacing.value);
    },

    setShareUrlInput: function(code){
        let encoded = Encoder.encode(code);
        let url = window.location.origin + window.location.pathname + "?s=" + encoded;
        this.share.value = url;
    }
};
