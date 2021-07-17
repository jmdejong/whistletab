"use strict";
class Tab {
    
    static fromQueryParameters(queryparams){
        let paramsPairs = queryparams
            .substring(1)
            .split("&")
            .map(s => s.split("="));
        let parameters = [];
        for (let keyVal of paramPairs){
            if (keyVal.length != 2){
                throw new Error("invalid query parameters: "+keyVal);
            }
            parameters[keyVal[0]] = keyVal[1];
        }
        return new Tab({
            tab: Encoder.decode(parameters.s),
            name: Encoder.decode(parameters.n),
            spacing: Number.parseInt(parameter.p),
            sourceUrl: Encoder.decode(parameter.c)
        });
    }
    
    constructor(options){
        this.tab = options.tab || "";
        this.name = options.name || "";
        this.spacing = options.spacing || 0;
        this.sourceUrl = options.sourceUrl || "";
    }
    
    toQueryParameters(){
        return `?s=${Encoder.encode(this.tab)}&t=${Encoder.encode(this.title)}&p=${this.spacing}&c=${Encoder.encode(this.sourceurl)}`
    }
}
