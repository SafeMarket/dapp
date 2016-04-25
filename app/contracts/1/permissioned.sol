contract permissioned is owned{
	
	struct User{
		bool isRegistered;
		bytes data;
		mapping(bytes32=>bool) actionToPermissionMap;
	}

	address[] userAddrs;
	mapping(address=>User) userMap;

	function getPermission(address addr, bytes32 action) constant returns(bool){
		if(addr==owner)
			return true;
		else
			return userMap[addr].actionToPermissionMap[action];
	}

	function getSenderPermission(bytes32 action) constant returns(bool){
		if (getPermission(msg.sender,action) || getPermission(tx.origin,action)) {
			return true;
		} else {
			return false;
		}
	}

	function requireAddrPermission(address addr, bytes32 action){
		if(!getPermission(addr, action))
			throw;
	}

	function requireSenderPermission(bytes32 action){
		if(!getSenderPermission(action))
			throw;
	}


	function addUser(address userAddr, bytes userData){

		requireSenderPermission('admin.adduser');

		if(userMap[userAddr].isRegistered)
			throw;

		userAddrs[userAddrs.length++] = userAddr;
		userMap[userAddr] = User(true, userData);
	}

	function removeUser(address userAddr){
		requireSenderPermission('admin.removeuser');
		userMap[userAddr].isRegistered = false;
	}


	function setPermission(address userAddr, bytes32 action, bool perMission){
		userMap[userAddr].actionToPermissionMap[action] = perMission;
	}

}