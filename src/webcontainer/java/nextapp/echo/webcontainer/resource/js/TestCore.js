TestCore = { 

    run: function(testCase) {
        var failEx;
        
        if (testCase.setUp) {
            try {
                testCase.setUp();
                Core.Debug.consoleWrite("setUp() :: success");
            } catch (ex) {
                Core.Debug.consoleWrite("setUp() :: fail: " + ex);
                return;
            }
        }
        
        for (var x in testCase) {
            if (typeof testCase[x] == "function" && x.substring(0, 4) == "test") {
                try {
                    testCase[x]();
                    Core.Debug.consoleWrite(x.substring(4) + " :: success");
                } catch (ex) {
                    Core.Debug.consoleWrite(x.substring(4) + " :: fail:" + ex);
                }
            }
        }
        
        if (testCase.tearDown) {
            try {
                testCase.tearDown();
                Core.Debug.consoleWrite("tearDown() :: success");
            } catch (ex) {
                Core.Debug.consoleWrite("tearDown() :: fail: " + ex);
                return;
            }
        }
    }
};

TestCore.TestCase = Core.extend({
   
    assertEquals: function(expected, actual) {
        if (expected != actual) {
            throw new TestCore.AssertionFailedError("Expected: " + expected + " but value was: " + value + ".");
        }
    },
   
    assertNotEquals: function(expected, actual) {
        if (expected == actual) {
            throw new TestCore.AssertionFailedError("Expected value to not be: " + expected + " but value was: " + value + ".");
        }
    },
   
    assertSame: function(expected, actual) {
        if (expected !== actual) {
            throw new TestCore.AssertionFailedError("Expected: " + expected + " but value was: " + value + ".");
        }
    },
   
    assertNotSame: function(expected, actual) {
        if (expected !== actual) {
            throw new TestCore.AssertionFailedError("Expected value to not be: " + expected + " but value was: " + value + ".");
        }
    },
   
    assertFalse: function(value) {
        if (value) {
            throw new TestCore.AssertionFailedError("Value: " + value + " does not evaluate to false.");
        }
    },
   
    assertTrue: function(value) {
        if (!value) {
            throw new TestCore.AssertionFailedError("Value: " + value + " does not evaluate to true.");
        }
    },
    
    fail: function(message) {
        throw new TestCore.AssertionFailedError(message);
    }
});

TestCore.AssertionFailedError = Core.extend({

    $construct: function(message) {
        this.message = message;
    },
    
    $toString: function() {
        return "AssertionFailedError: " + this.message;
    }
});