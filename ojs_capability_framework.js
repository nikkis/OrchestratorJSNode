/*jslint node: true */
"use strict";

/*global SOCKET */

var ROOT = process.cwd();
var config = require(ROOT + '/config.json');

var log = console.log;

var host = 'http://' + config.hostname + ':' + config.port;
var deviceIdentity = config.username + '@' + config.devicename;
log("HOSTNAME: " + config.hostname);
log("    PORT: " + config.port);
log("      ID: " + deviceIdentity);


var Fiber = require('fibers');

function sleep(ms) {
  var fiber = Fiber.current;
  setTimeout(function () {
    fiber.run();
  }, ms * 1000);
  Fiber.yield();
}

var CAPABILITIES = {};


function initCapabilities() {
  log('Initializing capabilities:');
  var
    capabilityIndex,
    capabilityName,
    TempCapabilityConstructor;
  for (capabilityIndex in config.enabledCapabilities) {
    try {
      capabilityName = config.enabledCapabilities[capabilityIndex];
      log('..' + capabilityName);
      TempCapabilityConstructor = require(ROOT + '/capabilities/' + capabilityName + '.js');
      CAPABILITIES[capabilityName] = new TempCapabilityConstructor();

      if (CAPABILITIES[capabilityName].hasOwnProperty('initCapability')) {
        CAPABILITIES[capabilityName].initCapability();
      }

    } catch (err) {
      log('ERROR initializing capabilities: ' + capabilityIndex + ', ' + capabilityName + ': ' + err);
    }
  }
}





var CURRENT_ACTION_ID,
  CURRENT_METHODCALL_ID;



function sendMethodcallResponse(retVal) {
  log('Sending method call response');

  var methodcallresponseArgs = [];
  methodcallresponseArgs.push(CURRENT_ACTION_ID);
  methodcallresponseArgs.push(CURRENT_METHODCALL_ID);
  methodcallresponseArgs.push(retVal);

  SOCKET.emit('methodcallresponse', methodcallresponseArgs);

}

function handleMethodcall(capabilityName, methodName, methodArguments) {

  if (CAPABILITIES.hasOwnProperty(capabilityName)) {
    if (CAPABILITIES[capabilityName].hasOwnProperty(methodName)) {

      var method = CAPABILITIES[capabilityName][methodName],
        retVal = method();

      sendMethodcallResponse(retVal);

    } else {
      log('ERR: capability: ' + capabilityName + ' has no method: ' + methodName);
      // TODO: send error
      sendOJSException('ERR: capability: ' + capabilityName + ' has no method: ' + methodName);
    }
  } else {
    log('ERR: device has no capability: ' + capabilityName);
    // TODO: send error
    sendOJSException('ERR: device has no capability: ' + capabilityName);
  }
}




// connect
var SOCKET;

function connectOJS() {
  SOCKET = require('socket.io-client').connect(host);

  // login
  SOCKET.on('connect', function () {
    log('connected..');
    SOCKET.emit('login', [deviceIdentity]);
  });


  // begin to listen for capability method calls
  SOCKET.on('methodcall', function (receivedArguments) {

    if (receivedArguments.length === 5) {

      CURRENT_ACTION_ID = receivedArguments[0];
      CURRENT_METHODCALL_ID = receivedArguments[1];
      var capabilityName = receivedArguments[2],
        methodcallName = receivedArguments[3],
        methodcallArguments = receivedArguments[4];

      log('EXECUTING ACTION: ' + CURRENT_ACTION_ID + ' METHOD: ' + CURRENT_METHODCALL_ID);

      handleMethodcall(capabilityName, methodcallName, methodcallArguments);

    }

  });
}

function sendOJSException(reason) {
  log('sending exception to orchestrator..');
  SOCKET.emit('ojs_context_data', CURRENT_ACTION_ID, CURRENT_METHODCALL_ID, config.username + '@' + config.devicename, reason);
}


function emitOJSContextData(contextData) {
  SOCKET.emit('ojs_context_data', '', config.username + '@' + config.devicename, contextData);
}


// Get the context events from each capability and report them to OJS
function reportContextEvents() {
  var f = new Fiber(function () {

    while (config.reportContextData) {
      // Wait
      sleep(config.reportContextDataInterval);

      // Get the data from capabilities and report
      var ultimateCxtData = {},
        capabilityName;

      for (capabilityName in CAPABILITIES) {
        try {
          if (CAPABILITIES.hasOwnProperty(capabilityName)) {
            if (CAPABILITIES[capabilityName].getContextData) {
              var dataToEmit = CAPABILITIES[capabilityName].getContextData(),
                dataKey;
              for (dataKey in dataToEmit) {
                ultimateCxtData[dataKey] = dataToEmit[dataKey];
              }
            }
          }
        } catch (err) {
          log(err);
        }
      }

      emitOJSContextData(ultimateCxtData);
      ultimateCxtData = {};

    }
  }).run();
}





//////// Main

initCapabilities();

connectOJS();



// Begin to report context events if enabled
if (config.reportContextData && config.reportContextDataInterval > 0) {
  log('REPORT CONTEXT DATA ENABLED (' + config.reportContextDataInterval + ')');
  reportContextEvents();
}









//