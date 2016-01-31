contract OrderBook{

	event Entry(
		address indexed orderAddr
		,address indexed storeAddr
		,address indexed submarketAddr
	);

	function addEntry(address orderAddr, address storeAddr, address submarketAddr){
		Entry(orderAddr, storeAddr, submarketAddr);
	}
}