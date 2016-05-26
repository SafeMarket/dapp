const fs = require('fs-extra')
const contracts = fs.readJsonSync('generated/contracts.json').contracts

Object.keys(contracts).forEach((contractName) => {
  contracts[contractName].bytecode = `0x${contracts[contractName].bytecode}`
  contracts[contractName].abi = JSON.parse(contracts[contractName].interface)
})

module.exports = contracts
