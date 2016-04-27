module.exports = function TestCapability() {
  return {
    test: function (username, next) {

      console.log('just testing..');

      return 'paluuarvo';
    },

    getContextData: function () {
      var cxtData = {};
      var testVal = Math.floor((Math.random() * 10) + 1);
      cxtData.testValue = testVal;
      cxtData.testValue2 = testVal + 2;
      return cxtData;
    }
  }
};