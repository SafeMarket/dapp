module.exports = function(grunt){
    grunt.registerMultiTask('refill',function(){
        var Web3 = require('web3')
            ,web3 = new Web3
            ,options = this.options()
            ,gethConfig = grunt.file.readYAML('config/geth.yml')[options.env]

        web3.setProvider(new web3.providers.HttpProvider('http://localhost:'+gethConfig.rpcport))
        web3.eth.defaultAccount = options.from

        var balance = web3.eth.getBalance(options.from)

        grunt.log.writeln('Account',options.from,'has a balance of ',prettify(balance), 'ether')

        var transferAmount = balance.div(2)

        web3.eth.sendTransaction({to:options.to,value:transferAmount})

        grunt.log.success('Transferred',prettify(transferAmount),'ether to',options.to)

        function prettify(amount){
            return web3.fromWei(amount,'ether').toFixed(4).toString()
        }
    })
}