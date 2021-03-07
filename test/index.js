const { produceTestReport } = require('./lib')
const unit = require('./unit');
const api = require('./api');

_app = {};

_app.tests = {}

_app.tests.unit = unit;
_app.tests.api = api;

// Count all the tests
_app.countTests = function(){
  var counter = 0;
  for(var key in _app.tests){
    if(_app.tests.hasOwnProperty(key)){
      var subTests = _app.tests[key];
      for(var testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            counter++;
          }
      }
    }
  }
  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = function(){
  var errors = [];
  var successes = 0;
  var limit = _app.countTests();
  var counter = 0;
  for(var key in _app.tests){
    if(_app.tests.hasOwnProperty(key)){
      var subTests = _app.tests[key];
      for(var testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            (function(){
              var tmpTestName = testName;
              var testValue = subTests[testName];
              // Call the test
              try{
                testValue(function(){
                  // If it calls back without throwing, then it succeeded, so log it in green
                  console.log('\x1b[32m%s\x1b[0m',tmpTestName);
                  counter++;
                  successes++;
                  if(counter == limit){
                    produceTestReport(limit,successes,errors);
                  }
                });
              } catch(e){
                // If it throws, then it failed, so capture the error thrown and log it in red
                errors.push({
                  'name' : testName,
                  'error' : e
                });
                console.log('\x1b[31m%s\x1b[0m',tmpTestName);
                counter++;
                if(counter == limit){
                  produceTestReport(limit,successes,errors);
                }
              }
            })();
          }
      }
    }
  }
};

_app.runTests();
