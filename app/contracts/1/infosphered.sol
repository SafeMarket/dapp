contract infosphered is owned{

    Infosphere infosphere;

    // ================ bool ================

    function setBool(bytes key, bool value) external{
        if(msg.sender!=owner) throw;
        infosphere.setBool(key,value);
    }

    function setBool(bytes key, bool value) internal{
        infosphere.setBool(key,value);
    }

    // ================ address ================

    function setAddress(bytes key, address value) external{
        if(msg.sender!=owner) throw;
        infosphere.setAddress(key,value);
    }

    function setAddress(bytes key, address value) internal{
        infosphere.setAddress(key,value);
    }

    // ================ bytes ================

    function setBytes(bytes key, bytes value) external{
        if(msg.sender!=owner) throw;
        infosphere.setBytes(key,value);
    }

    function setBytes(bytes key, bytes value) internal{
        infosphere.setBytes(key,value);
    }

    // ================ string ================

    function setString(bytes key, string value) external{
        if(msg.sender!=owner) throw;
        infosphere.setString(key,value);
    }

    function setString(bytes key, string value) internal{
        infosphere.setString(key,value);
    }

    // ================ int ================

    function setInt(bytes key, int value) external{
        if(msg.sender!=owner) throw;
        infosphere.setInt(key,value);
    }

    function setInt(bytes key, int value) internal{
        infosphere.setInt(key,value);
    }

    // ================ uint ================

    function setUint(bytes key, uint value) external{
        if(msg.sender!=owner) throw;
        infosphere.setUint(key,value);
    }

    function setUint(bytes key, uint value) internal{
        infosphere.setUint(key,value);
    }
}