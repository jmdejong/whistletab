"use strict";
class Tab {
    
    static fromQueryParameters(queryparams){
        if (queryparams.length < 3 || queryparams[0] !== "?"){
            return null;
        }
        let paramPairs = queryparams
            .substring(1)
            .split("&")
            .map(s => s.split("="));
        if (paramPairs.length === 0){
            return null;
        }
        let parameters = [];
        for (let keyVal of paramPairs){
            if (keyVal.length != 2){
                throw new Error("invalid query parameters: "+keyVal);
            }
            parameters[keyVal[0]] = keyVal[1];
        }
        
        if (!parameters.s){
            return null;
        }
        return new Tab({
            tab: Encoder.decode(parameters.s),
            name: Encoder.decode(parameters.n),
            spacing: Number.parseInt(parameters.p),
            sourceUrl: Encoder.decode(parameters.c)
        });
    }
    
    constructor(options){
        this.tab = options.tab || "";
        this.name = options.name || "";
        this.spacing = options.spacing || 0;
        this.sourceUrl = options.sourceUrl || "";
    }
    
    toQueryParameters(){
        let tab = Encoder.encode(this.tab) || "";
        let name = Encoder.encode(this.name) || "";
        let spacing = this.spacing || 0;
        let sourceUrl = Encoder.encode(this.sourceUrl) || "";
        return `?s=${tab}&n=${name}&p=${spacing}&c=${sourceUrl}&v=a0`
    }
}
