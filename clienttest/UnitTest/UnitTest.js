
CoreTests = Core.extend(TestCore.TestCase, {

    testEmpty: function() {
        var o = Core.extend({});
    },
    
    testAbstract: function() {
        var base = Core.extend({
            $abstract: {
                abstractFunction: function() { }
            }
        });
        
        var failEx = null;
        try {
            var derivedIncomplete = Core.extend(base, {

            });
        } catch (ex) {
            failEx = ex;
        }
    }
});

init = function() {
    EchoDebugConsole.install();
    EchoDebugConsole.setVisible(true);
    TestCore.run(new CoreTests());
};
