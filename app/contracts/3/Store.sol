contract StoreOrderInterface{
	function markAsShipped();
	function cancel();
}

contract Store is forumable, audible, infosphered, permissioned, aliasable, ordered, approvesAliases{

	struct Product{
		bool isActive;
		uint teraprice;
		uint units;
		bytes32 fileHash;
	}

	struct Transport{
		bool isActive;
		uint256 teraprice;
		bytes32 fileHash;
	}

	Product[] products;
	Transport[] transports;


	function Store(
		bytes32[] productParams,
		bytes32[] transportParams,
		bytes32[] _approvedAliases
	){

		for(uint i = 0; i< productParams.length; i=i+3){
			products.push(Product(
				true,
				uint(productParams[i]),
				uint(productParams[i+1]),
				productParams[i+2]
			));
		}

		for(uint j = 0; j< transportParams.length; j=j+2){
			transports.push(Transport(
				true,
				uint(transportParams[j]),
				transportParams[j+1]
			));
		}

		approvedAliases = _approvedAliases;
	}

	function getProductsLength() constant returns(uint){
		return products.length;
	}

	function getProductIsActive(uint index) constant returns(bool){
		return products[index].isActive;
	}

	function getProductTeraprice(uint index) constant returns(uint){
		return products[index].teraprice;
	}

	function getProductUnits(uint index) constant returns(uint){
		return products[index].units;
	}

	function getProductFileHash(uint index) constant returns(bytes32){
		return products[index].fileHash;
	}

	function addProduct(uint teraprice, uint units, bytes32 fileHash){
		requireOwnership();
		products.push(Product(true, teraprice, units, fileHash));
	}

	function setProductIsActive(uint index, bool isActive){
		requireOwnership();
		products[index].isActive = isActive;
	}

	function setProductTeraprice(uint index, uint teraprice){
		requireOwnership();
		products[index].teraprice = teraprice;
	}

	function setProductUnits(uint index, uint units){
		requireOwnership();
		products[index].units = units;
	}

	function setProductFileHash(uint index, bytes32 fileHash){
		requireOwnership();
		products[index].fileHash = fileHash;
	}

	function getTransportsLength() constant returns(uint){
		return transports.length;
	}

	function getTransportIsActive(uint index) constant returns(bool){
		return transports[index].isActive;
	}

	function getTransportTeraprice(uint index) constant returns(uint){
		return transports[index].teraprice;
	}

	function getTransportFileHash(uint index) constant returns(bytes32){
		return transports[index].fileHash;
	}

	function addTransport(uint teraprice, bytes32 fileHash){
		requireOwnership();
		transports.push(Transport(true, teraprice, fileHash));
	}

	function setTransportIsActive(uint index, bool isActive){
		requireOwnership();
		transports[index].isActive = isActive;
	}

	function setTransportTeraprice(uint index, uint teraprice){
		requireOwnership();
		transports[index].teraprice = teraprice;
	}

	function setTransportFileHash(uint index, bytes32 fileHash){
		requireOwnership();
		transports[index].fileHash = fileHash;
	}

	function depleteProductUnits(uint index, uint quantity){
		if(!orderReg.isRegistered(msg.sender))
			throw;

		if(products[index].units < quantity)
			throw;

		products[index].units = products[index].units - quantity;
	}

	function restoreProductUnits(uint index, uint quantity){
		if(!orderReg.isRegistered(msg.sender))
			throw;

		products[index].units = products[index].units + quantity;
	}

	function cancel(address order) {
		requireOwnership();
		StoreOrderInterface(order).cancel();
	}

	function markAsShipped(address order) {
		requireOwnership();
		StoreOrderInterface(order).markAsShipped();
	}
 
}