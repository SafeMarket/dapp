contract Store is forumable, audible, infosphered, meta, permissioned, aliasable, ordered{

	struct Product{
		bool isArchived;
		uint teraprice;
		bytes data;
	}

	Product[] products;

	function getProductsLength() constant returns(uint){
		return products.length;
	}

	function getSimpleProductParams(uint index) constant returns(bool, uint){
		return (products[index].isArchived, products[index].teraprice);
	}

	function getFullProductParams(uint index) constant returns(bool, uint, bytes, bytes){
		return (products[index].isArchived, products[index].teraprice, data);
	}

	function addProduct(uint teraprice, bytes data){
		requireSenderPermission('product');
		products.push(Product(false, teraprice, data));
	}

	function archiveProduct(uint index){
		requireSenderPermission('product');
		products[index].isArchived = true;
	}

	function unarchiveProduct(uint index){
		requireSenderPermission('product');
		products[index].isArchived = false;
	}

	function setProductDescription(uint index, bytes description){
		requireSenderPermission('product');
		products[index].description = description;
	}
 
}