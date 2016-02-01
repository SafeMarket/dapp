contract Infosphere{

    // ================ bool ================

    mapping(address=>mapping(bytes=>bool)) boolStore;

    function getBool(address addr, bytes key) constant returns(bool){
        return boolStore[addr][key];
    }

    function getMyBool(bytes key) constant returns(bool){
        return boolStore[msg.sender][key];
    }

    function setBool(bytes key, bool value){
        boolStore[msg.sender][key] = value;
    }

    // ================ address ================

    mapping(address=>mapping(bytes=>address)) addressStore;

    function getAddress(address addr, bytes key) constant returns(address){
        return addressStore[addr][key];
    }

    function getMyAddress(bytes key) constant returns(address){
        return addressStore[msg.sender][key];
    }

    function setAddress(bytes key, address value){
        addressStore[msg.sender][key] = value;
    }

    // ================ bytes ================

    mapping(address=>mapping(bytes=>bytes)) bytesStore;

    function getBytes(address addr, bytes key) constant returns(bytes){
        return bytesStore[addr][key];
    }

    function getMyBytes(bytes key) constant returns(bytes){
        return bytesStore[msg.sender][key];
    }

    function setBytes(bytes key, bytes value){
        bytesStore[msg.sender][key] = value;
    }

    // ================ string ================

    mapping(address=>mapping(bytes=>string)) stringStore;

    function getString(address addr, bytes key) constant returns(string){
        return stringStore[addr][key];
    }

    function getMyString(bytes key) constant returns(string){
        return stringStore[msg.sender][key];
    }

    function setString(bytes key, string value){
        stringStore[msg.sender][key] = value;
    }

    // ================ int ================

    mapping(address=>mapping(bytes=>int)) intStore;

    function getInt(address addr, bytes key) constant returns(int){
        return intStore[addr][key];
    }

    function getMyInt(bytes key) constant returns(int){
        return intStore[msg.sender][key];
    }

    function setInt(bytes key, int value){
        intStore[msg.sender][key] = value;
    }

    // ================ uint ================

    mapping(address=>mapping(bytes=>uint)) uintStore;

    function getUint(address addr, bytes key) constant returns(uint){
        return uintStore[addr][key];
    }

    function getMyUint(bytes key) constant returns(uint){
        return uintStore[msg.sender][key];
    }

    function setUint(bytes key, uint value){
        uintStore[msg.sender][key] = value;
    }
}