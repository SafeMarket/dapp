contract Store is forumable, audible, infosphered, permissioned, aliasable, ordered{

	struct Option{
		bool isArchived;
		uint teraprice;
		bytes32 fileHash;
	}

	Option[] products;
	Option[] transports;

	function getProductsLength() constant returns(uint){
		return products.length;
	}

	function getProductIsArchived(uint index) constant returns(bool){
		return products[index].isArchived;
	}

	function getProductTeraprice(uint index) constant returns(uint){
		return products[index].teraprice;
	}

	function getProductFileHash(uint index) constant returns(bytes32){
		return products[index].fileHash;
	}

	function addProduct(uint teraprice, bytes32 fileHash){
		requireSenderPermission('product');
		products.push(Option(false, teraprice, fileHash));
	}

	function setProductIsArchived(uint index, bool isArchived){
		requireSenderPermission('product');
		products[index].isArchived = isArchived;
	}

	function setProductTeraprice(uint index, uint teraprice){
		requireSenderPermission('product');
		products[index].teraprice = teraprice;
	}

	function setProductFileHash(uint index, bytes32 fileHash){
		requireSenderPermission('product');
		products[index].fileHash = fileHash;
	}

	function getTransportsLength() constant returns(uint){
		return transports.length;
	}

	function getTransportIsArchived(uint index) constant returns(bool){
		return transports[index].isArchived;
	}

	function getTransportTeraprice(uint index) constant returns(uint){
		return transports[index].teraprice;
	}

	function getTransportFileHash(uint index) constant returns(bytes32){
		return transports[index].fileHash;
	}

	function addTransport(uint teraprice, bytes32 fileHash){
		requireSenderPermission('transport');
		transports.push(Option(false, teraprice, fileHash));
	}

	function setTransportIsArchived(uint index, bool isArchived){
		requireSenderPermission('transport');
		transports[index].isArchived = isArchived;
	}

	function setTransportTeraprice(uint index, uint teraprice){
		requireSenderPermission('transport');
		transports[index].teraprice = teraprice;
	}

	function setTransportFileHash(uint index, bytes32 fileHash){
		requireSenderPermission('transport');
		transports[index].fileHash = fileHash;
	}
 
}