module.exports = function(grunt){
    grunt.registerMultiTask('ticker',function(){
        var Web3 = require('web3')
            ,Q = require('q')
            ,web3 = new Web3
            ,options = this.options()
            ,gethConfig = grunt.file.readYAML('config/geth.yml')[options.env]
            ,contracts = grunt.file.readYAML('generated/contracts.json').contracts
            ,chain = grunt.file.readJSON('config/'+options.env+'/chain.json')
            ,rates = grunt.file.readJSON('config/rates.json')
            ,done = this.async()

        web3.setProvider(new web3.providers.HttpProvider('http://localhost:'+gethConfig.rpcport))
        web3.eth.defaultAccount = web3.eth.accounts[0]

        var Infosphere = web3.eth.contract(JSON.parse(contracts.Infosphere.interface)).at(chain.Infosphere.address)
            ,setRatePromises = Object.keys(rates).map(function(symbol){
                return setRate(symbol,rates[symbol])
            })

        Q.all(setRatePromises).then(function(){
            grunt.log.success('All rates are set')
            done(true)
        })

        function setRate(symbol,value){

            grunt.log.writeln('Setting',symbol,'to',value,'...')

            var deferred = Q.defer()
                ,estimatedGas = Infosphere.setUint.estimateGas(symbol,value)

            Infosphere.setUint(symbol,value,{
                gas: Infosphere.setUint.estimateGas(symbol,value)
            },function(err,txHex){
                if(err){
                    grunt.log.error(err)
                    return done(false)
                }

                waitForTx(txHex).then(function(){
                    grunt.log.writeln('Set',symbol,'to',value)
                    deferred.resolve()
                })
            })

            return deferred.promise
        }

        function waitForTx(txHex){
            var deferred = Q.defer()
                ,waitInterval = setInterval(function(){

                    var txReceipt = web3.eth.getTransactionReceipt(txHex)
                    
                    if(!txReceipt) return;

                    clearInterval(waitInterval)
                    deferred.resolve(txReceipt)

                },1000)

            return deferred.promise
        }
    })
}