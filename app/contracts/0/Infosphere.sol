contract Infosphere{

    // ================ bool ================

    mapping(address=>mapping(bytes32=>bool)) boolStore;

    function getBool(address addr, bytes32 key) constant returns(bool){
        return boolStore[addr][key];
    }

    function getMyBool(bytes32 key) constant returns(bool){
        return boolStore[msg.sender][key];
    }

    function setBool(bytes32 key, bool value){
        boolStore[msg.sender][key] = value;
    }

    // ================ address ================

    mapping(address=>mapping(bytes32=>address)) addressStore;

    function getAddress(address addr, bytes32 key) constant returns(address){
        return addressStore[addr][key];
    }

    function getMyAddress(bytes32 key) constant returns(address){
        return addressStore[msg.sender][key];
    }

    function setAddress(bytes32 key, address value){
        addressStore[msg.sender][key] = value;
    }

    // ================ bytes32 ================

    mapping(address=>mapping(bytes32=>bytes32)) bytes32Store;

    function getBytes32(address addr, bytes32 key) constant returns(bytes32){
        return bytes32Store[addr][key];
    }

    function getMyBytes32(bytes32 key) constant returns(bytes32){
        return bytes32Store[msg.sender][key];
    }

    function setBytes32(bytes32 key, bytes32 value){
        bytes32Store[msg.sender][key] = value;
    }

    // ================ int ================

    mapping(address=>mapping(bytes32=>int)) intStore;

    function getInt(address addr, bytes32 key) constant returns(int){
        return intStore[addr][key];
    }

    function getMyInt(bytes32 key) constant returns(int){
        return intStore[msg.sender][key];
    }

    function setInt(bytes32 key, int value){
        intStore[msg.sender][key] = value;
    }

    // ================ uint ================

    mapping(address=>mapping(bytes32=>uint)) uintStore;

    function getUint(address addr, bytes32 key) constant returns(uint){
        return uintStore[addr][key];
    }

    function getMyUint(bytes32 key) constant returns(uint){
        return uintStore[msg.sender][key];
    }

    function setUint(bytes32 key, uint value){
        uintStore[msg.sender][key] = value;
    }
}