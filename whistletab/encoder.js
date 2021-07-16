"use strict";
window.Encoder = (function(){
    /* A normal url encoding would have been enough, but characters like spaces are likely very common
     * Meanwhile, characters like numbers are uncommon
     * This encoding swaps them around to save space
     */
    let conversionEnc = {
        " ": "9",
        "\n": "8",
        "#": "7",
        "+": "6"
    }
    
    let conversionDec = {}
    for (let original in conversionEnc){
        conversionDec[conversionEnc[original]] = original;
    }
    
    function encode(text){
        if (text === "" || typeof text !== "string"){
            return null;
        }
        let converted = [];
        for (let char of text){
            let convertedChar = conversionEnc[char];
            if (convertedChar === undefined){
                convertedChar = char;
            }
            converted.push(convertedChar);
        }
        return encodeURIComponent(converted.join(""));
    }
    
    function decode(encoded){
        if (encoded === "" || typeof encoded !== "string"){
            return null;
        }
        let decoded = [];
        for (let char of decodeURIComponent(encoded)){
            let convertedChar = conversionDec[char];
             if (convertedChar === undefined){
                 convertedChar = char;
             }
             decoded.push(convertedChar);
        }
        return decoded.join("");
    }
    
    return {
        encode: encode,
        decode: decode
    };
})();
