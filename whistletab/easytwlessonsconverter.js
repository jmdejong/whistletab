"use strict";

function main() {
	
	
	document.getElementById("etwl")
		.addEventListener("input", update);
	update();
}

function update() {
	
	var etwl = document.getElementById("etwl").value;
	var wt = convert(etwl);
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
	return etwl.replaceAll("b", "_").replaceAll("4", "").replaceAll("5", "+").replaceAll("6", "++").toLowerCase()
}


addEventListener("load", main);
