// contract Gaurd{
	
// 	struct User{
// 		bool isRegistered;
// 		bytes data;
// 		mapping(bytes32=>bool) actionToPermissionMap;
// 	}

// 	mapping(address=>address[]) contractAddrToUserAddrsMap;
// 	mapping(address=>mapping(address=>User)) contractAddrToUserAddrToUserMap;

// 	function getPermission(address contractAddr, address userAddr, bytes32 action) constant returns(bool){
// 		if(userAddr == owned(contractAddr).owner)
// 			return true;
// 		else
// 			return contractAddrToUserAddrToUserMap[contractAddr][userAddr].actionToPermissionMap[action];
// 	}

// 	function requirePermission(address contractAddr, address userAddr, bytes32 action){
// 		if(!getPermission(contractAddr, userAddr, action))
// 			throw;
// 	}

// 	function addUser(address contractAddr, address userAddr, bytes userData){

// 		requireSenderPermission(contractAddr,'admin.addUser');

// 		if(contractAddrToUserAddrToUserMap[contractAddr][userAddr].isRegistered)
// 			throw;

// 		contractAddrToUserAddrsMap[contractAddr][contractAddrToUserAddrsMap[contractAddr].length++] = userAddr;
// 		contractAddrToUserAddrToUserMap[contractAddr][userAddr] = User(true, userData);
// 	}

// 	function removeUser(address contractAddr, address userAddr){

// 		requireSenderPermission(contractAddr,'admin.removeUser');
// 		contractAddrToUserAddrToUserMap[contractAddr][userAddr].isRegistered = false;
	
// 	}


// 	function setPermission(address contractAddr, address userAddr, bytes32 action, bool permission){

// 		requireSenderPermission(contractAddr,'admin.setPermission');
// 		contractAddrToUserAddrToUserMap[contractAddr][userAddr].actionToPermissionMap[action] = permission;
// 	}

// }