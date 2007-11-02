
CoreTests = Core.extend(TestCore.TestCase, {

    testEmpty: function() {
        Core.extend({});
    }
});

init = function() {
    EchoDebugConsole.install();
    TestCore.run(new CoreTests());
};
