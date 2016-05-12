contract Store is forumable, audible, infosphered, permissioned, aliasable, ordered, approvesAliases{

	OrderReg orderReg;
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
		address orderRegAddr,
		bytes32[] productParams,
		bytes32[] transportParams,
		bytes32[] _approvedAliases
	){

		orderReg = OrderReg(orderRegAddr);

		for(uint i = 0; i< productParams.length; i=i+3){
			products.push(Product(
				true,
				uint(productParams[i]),
				uint(productParams[i+1]),
				productParams[i+2]
			));
		}

		for(uint j = 0; j< products.length; j=j+2){
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
		requireSenderPermission('product');
		products.push(Product(false, teraprice, units, fileHash));
	}

	function setProductIsActive(uint index, bool isActive){
		requireSenderPermission('product');
		products[index].isActive = isActive;
	}

	function setProductTeraprice(uint index, uint teraprice){
		requireSenderPermission('product');
		products[index].teraprice = teraprice;
	}

	function setProductUnits(uint index, uint units){
		requireSenderPermission('product');
		products[index].units = units;
	}

	function setProductFileHash(uint index, bytes32 fileHash){
		requireSenderPermission('product');
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
		requireSenderPermission('transport');
		transports.push(Transport(false, teraprice, fileHash));
	}

	function setTransportIsActive(uint index, bool isActive){
		requireSenderPermission('transport');
		transports[index].isActive = isActive;
	}

	function setTransportTeraprice(uint index, uint teraprice){
		requireSenderPermission('transport');
		transports[index].teraprice = teraprice;
	}

	function setTransportFileHash(uint index, bytes32 fileHash){
		requireSenderPermission('transport');
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
 
}