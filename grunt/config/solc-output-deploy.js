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
          'SafitsReg',
          'OrderReg',
          'Filestore'
        ],
        onDeploy: {
          SafitsReg: [
            'contracts.SafitsReg.inflate("0x1049a6c61c46a7c1e12d919189701bf26a1a2011",1, {gas:contracts.SafitsReg.inflate.estimateGas("0x1049a6c61c46a7c1e12d919189701bf26a1a2011",1)})'
          ],
          SubmarketReg: [
            'contracts.SubmarketReg.setAliasRegAddr(chain.AliasReg.address)',
            'contracts.SubmarketReg.setInfosphereAddr(chain.Infosphere.address)'
          ],
          StoreReg: [
            'contracts.StoreReg.setAliasRegAddr(chain.AliasReg.address)',
            'contracts.StoreReg.setInfosphereAddr(chain.Infosphere.address)'
          ],
          OrderReg: [
            'contracts.OrderReg.set(chain.SafitsReg.address, chain.StoreReg.address, chain.SubmarketReg.address, chain.Ticker.address)',
            'contracts.SafitsReg.setPermission(contracts.OrderReg.address,"inflate",true)'
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
          'SafitsReg',
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
