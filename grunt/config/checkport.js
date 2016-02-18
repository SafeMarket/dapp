module.exports = function(grunt){
  return {
    webdriver:{
      options:{
        port: 4444
      }
    },server:{
      options:{
        port: 8000
      }
    }
  }
}