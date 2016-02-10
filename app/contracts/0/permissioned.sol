contract permissioned is owned{
	
	struct User{
		bool isRegistered;
		bytes data;
		mapping(bytes32=>bool) actionToPermissionMap;
	}

	address[] userAddrs;
	mapping(address=>User) userMap;

	function getPermission(address addr, bytes32 action) constant returns(bool){
		return userMap[addr].actionToPermissionMap[action];
	}

	function getSenderPermission(bytes32 action) constant returns(bool){
		return getPermission(msg.sender,action);
	}

	function requireAddrPermission(address addr, bytes32 action){
		if(msg.sender!=owner && !getPermission(addr, action))
			throw;
	}

	function requireSenderPermission(bytes32 action){
		requireAddrPermission(msg.sender,action);
	}


	function addUser(address userAddr, bytes32 userName){

		requireSenderPermission('admin.adduser');

		if(userMap[userAddr].isRegistered)
			throw;

		userAddrs[userAddrs.length++] = userAddr;
		userMap[userAddr] = User(true, userName);
	}

	function removeUser(address userAddr){
		requireSenderPermission('admin.removeuser');
	}

	function removeUser(address userAddr){
		requireSenderPermission('admin.removeuser');
	}



	function setPermission(address userAddr, bytes32 action, bool perMission){
		userMap[userAddr].actionToPermissionMap[action] = perMission;
	}

}