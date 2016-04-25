/* globals angular */

angular.module('app').factory('Infosphered', (utils) => {

  function Infosphered(contract, types) {
    this.contract = contract
    this.types = types
  }

  Infosphered.prototype.getMartyrCalls = function getMartyrCalls(data) {

    const calls = []

    Object.keys(data).forEach((key) => {

      const newValue = data[key]
      const currentValue = this.getValue(key)
      const type = this.types[key]

      if (newValue === currentValue) {
        return true
      }

      if (typeof currentValue === 'string' && utils.toAscii(currentValue) === newValue) {
        return true
      }

      if (currentValue.equals && currentValue.equals(newValue)) {
        return true
      }

      console.log('changed', key)

      calls.push({
        address: this.contract.address,
        data: this.contract[getInfospheredSetterName(type)].getData(key, newValue)
      })

    })

    return calls

  }

  function getInfospheredSetterName(type) {
    return `set${type.charAt(0).toUpperCase()}${type.slice(1)}`
  }

  function getInfospheredGetterName(type) {
    return `get${type.charAt(0).toUpperCase()}${type.slice(1)}`
  }

  Infosphered.prototype.getValue = function getInfospheredValue(key) {

    const type = this.types[key]

    if (!type) {
      throw new Error('${key} has no associate type')
    }

    const functionName = getInfospheredGetterName(type)

    return this.contract[functionName](key)
  }

  Infosphered.prototype.update = function updateInfosphered() {

    const infosphered = this
    const data = {}

    Object.keys(this.types).forEach((key) => {
      data[key] = infosphered.getValue(key)
    })

    this.data = data
  }

  return Infosphered

})
