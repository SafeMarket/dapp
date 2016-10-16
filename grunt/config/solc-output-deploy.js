module.exports = function(grunt){

    return {
        "development":{
            "options":{
                "rpcport":grunt.file.readYAML('config/geth.yml').development.rpcport
                ,"contracts":"node_modules/safemarket-protocol/generated/contracts.json"
                ,"chain":"config/development/chain.json"
                ,"deploy":[
                   "AliasReg"
                    ,"Infosphere"
                    ,"Keystore"
                    ,"AffiliateReg"
                    ,"StoreReg"
                    ,"SubmarketReg"
                    ,"OrderReg"
                ],"onDeploy":{
                    "SubmarketReg":[
                        'contracts["SubmarketReg"].setAliasRegAddr(chain.AliasReg.address)'
                        ,'contracts["SubmarketReg"].setInfosphereAddr(chain.Infosphere.address)'
                    ]
                    ,"StoreReg":[
                        'contracts["StoreReg"].setAliasRegAddr(chain.AliasReg.address)'
                        ,'contracts["StoreReg"].setInfosphereAddr(chain.Infosphere.address)'
                    ]
                }
            }
        },"production":{
            "options":{
                "rpcport":grunt.file.readYAML('config/geth.yml').production.rpcport
                ,"contracts":"node_modules/safemarket-protocol/generated/contracts.json"
                ,"chain":"config/production/chain.json"
                ,"deploy":[
                    "AliasReg"
                    ,"Infosphere"
                    ,"Keystore"
                    ,"AffiliateReg"
                    ,"StoreReg"
                    ,"SubmarketReg"
                    ,"OrderReg"
                ]
            }
        }
    }

}