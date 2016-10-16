module.exports = function(grunt){
    grunt.registerTask('create-info-js',function(){
        var gethConfig = grunt.file.readYAML('config/geth.yml')
            ,contracts = grunt.file.readJSON('node_modules/safemarket-protocol/generated/contracts.json').contracts

        Object.keys(gethConfig).forEach(function(env){
            var blockchain = gethConfig[env]
                ,chainPath = 'config/'+env+'/chain.json'
                ,chain = grunt.file.exists(chainPath) ? grunt.file.readJSON(chainPath) : {}
                ,deployer = gethConfig[env].unlock
                ,_contracts = {}
                ,infoPath = 'generated/dapp/'+env+'/js/info.js'

            blockchain.env = env

            Object.keys(contracts).forEach(function(contractName){
                _contracts[contractName] = contracts[contractName]

                _contracts[contractName].bytecode = hexify(_contracts[contractName].bytecode)
                _contracts[contractName].runtimeBytecode = hexify(_contracts[contractName].runtimeBytecode)

                _contracts[contractName].abi = JSON.parse(contracts[contractName].interface)
                
                if(!chain[contractName]) return;
                _contracts[contractName].address = chain[contractName].address
            });

            var infoJs = 'blockchain = ' + JSON.stringify(blockchain) + '; contracts = ' + JSON.stringify(_contracts) + '; deployer = "0x' + deployer + '";'

            grunt.file.write(infoPath,infoJs)
            grunt.log.success('Wrote info to',infoPath)
        })

        function hexify(string){
            if(string.indexOf('0x') === 0)
                return string
            else
                return '0x'+string

        }

    })
}