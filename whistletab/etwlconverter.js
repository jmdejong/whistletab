"use strict";

function main() {
    
    
    document.getElementById("etwl")
        .addEventListener("input", update);
    document.getElementById("flats-to-sharps")
        .addEventListener("input", update);
    update();
}

function update() {
    
    var etwl = document.getElementById("etwl").value;
    var wt = convert(etwl);
    if (document.getElementById("flats-to-sharps").checked) {
        wt = flatsToSharps(wt);
    }
    var tab = new Tab({
        tab: wt,
        base: "c"
    });
    var url = "https://troido.nl/whistletab/" + tab.toQueryParameters();
    let link = document.getElementById("wt-url");
    link.href = url;
    link.innerHTML = url;
    document.getElementById("wtf").value = wt;
}

function convert(etwl) {
    return etwl
        .replaceAll("b", "_")
        .replaceAll("4", "")
        .replaceAll("5", "+")
        .replaceAll("6", "++")
        .toLowerCase();
}

function flatsToSharps(wt) {
    return wt
        .replaceAll("g_", "f#")
        .replaceAll("d_", "c#");
}

addEventListener("load", main);
