const fs = require('fs-extra')
const readYaml = require('read-yaml')
const Web3 = require('web3')

const geth = readYaml.sync('config/geth.yml').development
const contracts = fs.readJsonSync('generated/contracts.json')

const web3 = new Web3()

web3.setProvider(new web3.providers.HttpProvider(`http://${geth.rpcaddr}:${geth.rpcport}`))
web3.eth.defaultAccount = web3.eth.accounts[0]

module.exports = { contracts, web3 }
