contract OrderBook{

	event Entry(
		address indexed orderAddr
		,address indexed storeAddr
		,address indexed submarketAddr
	);

	function addEntry(address storeAddr, address submarketAddr){
		Entry(msg.sender, storeAddr, submarketAddr);
	}
}