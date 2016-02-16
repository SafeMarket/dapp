module.exports = function(grunt){
    grunt.registerTask('create-info-js',function(){
        var gethConfig = grunt.file.readYAML('config/geth.yml')
            ,contracts = grunt.file.readJSON('generated/contracts.json').contracts

        Object.keys(gethConfig).forEach(function(env){
            var blockchain = gethConfig[env]
                ,chainPath = 'config/chains/'+env+'.json'
                ,chain = grunt.file.exists(chainPath) ? grunt.file.readJSON(chainPath) : {}
                ,deployer = grunt.file.readJSON('config/keys/'+env+'.json').address
                ,_contracts = {}
                ,infoPath = 'generated/dapp/'+env+'/info.js'

            blockchain.env = env

            Object.keys(contracts).forEach(function(contractName){
                _contracts[contractName] = contracts[contractName]

                if(!chain[contractName]) return;

                _contracts[contractName].abi = JSON.parse(contracts[contractName].interface)
                _contracts[contractName].address = chain[contractName].address
            });

            var infoJs = 'blockchain = ' + JSON.stringify(blockchain) + '; contracts = ' + JSON.stringify(_contracts) + '; deployer = "0x' + deployer + '";'

            grunt.file.write(infoPath,infoJs)
            grunt.log.success('Wrote info to',infoPath)
        })

    })
}