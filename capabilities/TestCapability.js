module.exports = function TestCapability() {
  return {
    test: function () {

      console.log('just testing..');

      return 'paluuarvo';
    },

    getContextData: function () {
      var cxtData = {};
      var testVal = Math.floor((Math.random() * 10) + 1);
      cxtData.testValue = testVal;
      return cxtData;
    }
  }
};