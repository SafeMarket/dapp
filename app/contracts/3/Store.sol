contract Store is forumable, audible, infosphered, permissioned, aliasable, ordered{

	struct Product{
		bool isArchived;
		uint teraprice;
		bytes32 fileHash;
	}

	Product[] products;

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
		products.push(Product(false, teraprice, fileHash));
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
 
}