function ProductModel(addr){
	this.contract = web3.eth.contract(ProductAbi).at(addr)
	this.meta = convertHexToObject(this.contract.getMeta())
	this.price = this.contract.getPrice()
}