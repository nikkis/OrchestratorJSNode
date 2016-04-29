var PhillipsHUE,
  ENABLED;

module.exports = function LightsCapability() {
  return {
    initCapability: function () {

      console.log('Initializing LightsCapability');

      try {
        PhillipsHUE.getState();
        ENABLED = true;
        console.log('Lights are connected');
      } catch (err) {
        ENABLED = false;
        console.log('Lights not connected');
      }

      return;
    },

    turnAllOn: function () {
      try {
        PhillipsHUE.turnAllOn();
      } catch (err) {
        console.log(err);
      }
      return;
    },

    turnAllOff: function () {
      try {
        PhillipsHUE.turnAllOff();
      } catch (err) {
        console.log(err);
      }
      return;
    },

    setScene: function (sceneName) {
      try {
        PhillipsHUE.setSceneOn(sceneName);
      } catch (err) {
        console.log(err);
      }
      return;
    },

    getContextData: function () {
      var cxtData = {};
      cxtData.lightsConnected = ENABLED;
      return cxtData;
    }
  }
};


var hue = require("node-hue-api"),
  HueApi = hue.HueApi,
  lightState = hue.lightState;
//var hostname = "192.168.1.68";
var hostname = "192.168.0.14";
var username = "25fa138c1c7bbacf123c76429e69a67";


var displayResult = function (result) {
  //console.log('results');
  //console.log(JSON.stringify(result, null, 2));
};

// I have no idea where this comes from
var scenePostFix = ' on 0';


PhillipsHUE = {
  registerNewUser: function () {


    var newUserName = null; // You can provide your own username value, but it is normally easier to leave it to the Bridge to create it 
    userDescription = "device description goes here";

    var displayUserResult = function (result) {
      console.log("Created user: " + JSON.stringify(result));
    };

    var displayError = function (err) {
      console.log('OJSERR: ' + err);
    };

    hue = new HueApi();

    // -------------------------- 
    // Using a promise 
    hue.registerUser(hostname, newUserName, userDescription)
      .then(displayUserResult)
      .fail(displayError)
      .done();

    // -------------------------- 
    // Using a callback (with default description and auto generated username) 
    hue.createUser(hostname, null, null, function (err, user) {
      if (err) throw err;
      displayUserResult(user);
    });

  },


  getState: function () {
    var api = new HueApi(hostname, username),
      state;
    api.fullState()
      .then(displayResult)
      .fail(displayError)
      .done();
  },


  turnOff: function (bulbName, value) {

    var api = new HueApi(hostname, username),
      state;

    var setState = function (result) {

      for (k in result.lights) {
        console.log(k);
        if (result.lights[k].name == bulbName) {
          state = lightState.create().off();
          api.setLightState(k, state).done();
        }
      }
    };

    api.fullState().then(setState).done();
  },

  turnOn: function (bulbName, value) {

    var api = new HueApi(hostname, username),
      state;

    var setState = function (result) {

      for (k in result.lights) {
        console.log(k);
        if (result.lights[k].name == bulbName) {
          state = lightState.create().on();
          api.setLightState(k, state).done();
        }
      }
    };

    api.fullState().then(setState).done();
  },

  setColor: function (bulbName, value) {

    var api = new HueApi(hostname, username),
      state;

    var setState = function (result) {

      for (k in result.lights) {
        console.log(k);
        if (result.lights[k].name == bulbName) {
          state = lightState.create().on().white(500, 100);
          api.setLightState(k, state).done();
        }
      }
    };

    api.fullState().then(setState).done();
  },

  setSceneOn: function (sceneName) {

    var api = new HueApi(hostname, username),
      state;

    var setSceneOn = function (result) {
      for (k in result) {

        if (result[k].name == sceneName || result[k].name == sceneName + scenePostFix) {
          console.log(result[k].name);
          api.activateScene(result[k].id).done();

        }
      }
    };

    api.getScenes().then(setSceneOn).done();
  },


  turnAllOff: function () {

    var api = new HueApi(hostname, username),
      state;

    var setState = function (result) {
      for (k in result.lights) {
        state = lightState.create().off();
        api.setLightState(k, state).done();
      }
    };

    api.fullState().then(setState).done();
  },

  turnAllOn: function () {

    var api = new HueApi(hostname, username),
      state;

    var setState = function (result) {
      for (k in result.lights) {
        state = lightState.create().on();
        api.setLightState(k, state).done();
      }
    };

    api.fullState().then(setState).done();
  }

};