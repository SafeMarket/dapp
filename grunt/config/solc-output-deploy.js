module.exports = function(grunt){

    return {
        "development":{
            "options":{
                "rpcport":grunt.file.readYAML('config/geth.yml').development.rpcport
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
                "rpcport":grunt.file.readYAML('config/geth.yml').production.rpcport
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