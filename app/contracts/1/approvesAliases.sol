contract approvesAliases is owned{

	bytes32[] approvedAliases;
	mapping (bytes32 => bool) isApprovedMap;
	mapping (bytes32 => bool) isAddedMap;

	function approveAlias(bytes32 alias) {
		requireOwnership();

		isApprovedMap[alias] = true;

		if(!isAddedMap[alias]){
			approvedAliases.push(alias);
			isAddedMap[alias] = true;
		}
	}

	function disapproveAlias(bytes32 alias) {
		requireOwnership();
		isApprovedMap[alias] = false;
	}

	function getIsAliasApproved(bytes32 alias) constant returns (bool) {
		return isApprovedMap[alias];
	}

	function getApprovedAliasesLength() constant returns (uint) {
		return approvedAliases.length;
	}

	function getApprovedAlias(uint index) constant returns (bytes32) {
		return approvedAliases[index];
	}
}