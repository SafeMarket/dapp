module.exports = function exportSolcOutputDeploy(grunt) {

  return {
    development: {
      options: {
        rpcport: grunt.file.readYAML('config/geth.yml').development.rpcport,
        contracts: 'generated/contracts.json',
        chain: 'config/development/chain.json',
        deploy: [
          'AliasReg',
          'Ticker',
          'Infosphere',
          'Keystore',
          'AffiliateReg',
          'StoreReg',
          'SubmarketReg',
          'OrderReg',
          'Filestore'
        ],
        onDeploy: {
          SubmarketReg: [
            'thisContract.setAliasRegAddr(chain.AliasReg.address)',
            'thisContract.setInfosphereAddr(chain.Infosphere.address)'
          ],
          StoreReg: [
            'thisContract.setAliasRegAddr(chain.AliasReg.address)',
            'thisContract.setInfosphereAddr(chain.Infosphere.address)'
          ],
          OrderReg: [
            'thisContract.setTickerAddr(chain.Ticker.address)'
          ]
        }
      }
    },
    production: {
      options: {
        rpcport: grunt.file.readYAML('config/geth.yml').production.rpcport,
        contracts: 'generated/contracts.json',
        chain: 'config/production/chain.json',
        deploy: [
          'AliasReg',
          'Ticker',
          'Infosphere',
          'Keystore',
          'AffiliateReg',
          'StoreReg',
          'SubmarketReg',
          'OrderReg',
          'Filestore'
        ]
      }
    }
  }

}
