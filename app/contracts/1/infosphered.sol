contract infosphered is owned{

    Infosphere infosphere;

    function setInfosphere(address infosphereAddr){
        requireOwnership();
        infosphere = Infosphere(infosphereAddr);
    }

    function getInfosphereAddr() constant returns(address){
        return address(infosphere);
    }

    // ================ bool ================

    function setBool(bytes32 key, bool value){
        requireOwnership();
        infosphere.setBool(key,value);
    }

    function setBoolByForce(bytes32 key, bool value) internal{
        infosphere.setBool(key,value);
    }

    function getBool(bytes32 key) constant returns(bool){
        return infosphere.getMyBool(key);
    }

    // ================ address ================

    function setAddress(bytes32 key, address value){
        requireOwnership();
        infosphere.setAddress(key,value);
    }

    function setAddressByForce(bytes32 key, address value) internal{
        infosphere.setAddress(key,value);
    }

    function getAddress(bytes32 key) constant returns(address){
        return infosphere.getMyAddress(key);
    }

    // ================ bytes32 ================

    function setBytes32(bytes32 key, bytes32 value){
        requireOwnership();
        infosphere.setBytes32(key,value);
    }

    function setBytes32ByForce(bytes32 key, bytes32 value) internal{
        infosphere.setBytes32(key,value);
    }

    function getBytes32(bytes32 key) constant returns(bytes32){
        return infosphere.getMyBytes32(key);
    }

    // ================ int ================

    function setInt(bytes32 key, int value){
        requireOwnership();
        infosphere.setInt(key,value);
    }

    function setIntByForce(bytes32 key, int value) internal{
        infosphere.setInt(key,value);
    }

    function getInt(bytes32 key) constant returns(int){
        return infosphere.getMyInt(key);
    }

    // ================ uint ================

    function setUint(bytes32 key, uint value){
        requireOwnership();
        infosphere.setUint(key,value);
    }

    function setUintByForce(bytes32 key, uint value) internal{
        infosphere.setUint(key,value);
    }

    function getUint(bytes32 key) constant returns(uint){
        return infosphere.getMyUint(key);
    }
}