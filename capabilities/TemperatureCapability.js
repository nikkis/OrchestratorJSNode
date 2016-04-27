module.exports = function TemperatureCapability() {
  return {
    getTemperature: function (username, next) {

      // TODO: get this from a sensor
      var tempTemp = 23;
      console.log('current temperature: ' + tempTemp);
      return tempTemp;
    },

    getContextData: function () {
      var cxtData = {};

      // TODO: get this from a sensor
      //var tempTemp = 23;
      var tempTemp = Math.floor((Math.random() * 10) + 1);
      cxtData.temperature = tempTemp;
      return cxtData;
    }
  }
};