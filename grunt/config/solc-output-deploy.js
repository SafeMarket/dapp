module.exports = function(grunt){

    return {
        "development":{
            "options":{
                "rpcport":grunt.readYAML('config/geth.YML').development.rpcport
                ,"contracts":"generated/contracts.json"
                ,"chain":"config/development/chain.json"
                ,"deploy":[
                    "AliasReg"
                    ,"Infosphere"
                    ,"Keystore"
                    ,"OrderBook"
                ]
            }
        },"production":{
            "options":{
                "rpcport":grunt.readYAML('config/geth.YML').development.production
                ,"contracts":"generated/contracts.json"
                ,"chain":"config/production/chain.json"
                ,"deploy":[
                    "AliasReg"
                    ,"Infosphere"
                    ,"Keystore"
                    ,"OrderBook"
                ]
            }
        }
    }

}