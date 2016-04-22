contract Store is forumable, audible, infosphered, permissioned, aliasable, ordered{

	struct Product{
		bool isArchived;
		uint teraprice;
		bytes32 dataHash;
	}

	Product[] products;

	function getProductsLength() constant returns(uint){
		return products.length;
	}

	function getSimpleProductParams(uint index) constant returns(bool, uint){
		return (products[index].isArchived, products[index].teraprice);
	}

	function getFullProductParams(uint index) constant returns(bool, uint, bytes32){
		return (products[index].isArchived, products[index].teraprice, products[index].dataHash);
	}

	function addProduct(uint teraprice, bytes32 dataHash){
		requireSenderPermission('product');
		products.push(Product(false, teraprice, dataHash));
	}

	function archiveProduct(uint index){
		requireSenderPermission('product');
		products[index].isArchived = true;
	}

	function unarchiveProduct(uint index){
		requireSenderPermission('product');
		products[index].isArchived = false;
	}

	function setProduct(uint index, bytes32 dataHash){
		requireSenderPermission('product');
		products[index].dataHash = dataHash;
	}
 
}