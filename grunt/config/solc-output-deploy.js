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
            'contracts.SubmarketReg.setAliasRegAddr(chain.AliasReg.address)',
            'contracts.SubmarketReg.setInfosphereAddr(chain.Infosphere.address)'
          ],
          StoreReg: [
            'contracts.StoreReg.setAliasRegAddr(chain.AliasReg.address)',
            'contracts.StoreReg.setInfosphereAddr(chain.Infosphere.address)'
          ],
          OrderReg: [
            'contracts.OrderReg.setTickerAddr(chain.Ticker.address)',
            'contracts.StoreReg.setOrderRegAddr(chain.OrderReg.address)'
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
