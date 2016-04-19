contract Filestore  {

	mapping (bytes32 => uint) blockNumbers;
	event Store(bytes32 indexed hash, bytes file);

	function store(bytes file) {
		bytes32 hash = sha3(file);
		blockNumbers[hash] = block.number;
		Store(hash, file);
	}

	function getBlockNumber(bytes32 hash) constant returns (uint) {
		return blockNumbers[hash];
	}

}