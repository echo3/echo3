CoreTests = Core.extend(TestCore.TestCase, {

    testEmpty: function() {
        var o = Core.extend({});
    },
    
    /**
     * Verify that extending an abstract class while not providing an abstract method results in an exception.
     */
    testAbstractSimpleFail: function() {
        var base = Core.extend({
        
            $abstract: {
                abstractFunction: function() { }
            }
        });
        
        var exceptionThrown = false;
        try {
            var derivedIncomplete = Core.extend(base, { });
        } catch (ex) { 
            exceptionThrown = true;
        }
        if (!exceptionThrown) {
            this.fail("Non-abstract property was overridden without throwing an exception.");
        }
    },
    
    /**
     * Verify overriding a method by declaring it virtual.
     */
    testVirtualSimple: function() {
        var f1 = function() { alert("f1"); };
        var f2 = function() { alert("f2"); };
    
        var first = Core.extend({
            $virtual: {
                alpha: f1
            }
        });
        this.assertSame(f1, first.prototype.alpha);

        var second = Core.extend(first, {
            alpha: f2
        });
        this.assertSame(f2, second.prototype.alpha);
    },

    /**
     * Verify overriding a method in a subclass and a sub-subclass.
     */
    testVirtualDouble: function() {
        var f1 = function() { alert("f1"); };
        var f2 = function() { alert("f2"); };
        var f3 = function() { alert("f3"); };
    
        var first = Core.extend({
            $virtual: {
                alpha: f1
            }
        });
        this.assertSame(f1, first.prototype.alpha);

        var second = Core.extend(first, {
            $virtual: {
                alpha: f2
            }
        });
        this.assertSame(f1, first.prototype.alpha);
        this.assertSame(f2, second.prototype.alpha);

        var third = Core.extend(second, {
            alpha: f3
        });
        this.assertSame(f1, first.prototype.alpha);
        this.assertSame(f2, second.prototype.alpha);
        this.assertSame(f3, third.prototype.alpha);
    },

    /**
     * Verifying failing to declare a method as virtual and attempting to override it throws an exception.
     */
    testVirtualSimpleFail: function() {
        var f1 = function() { alert("f1"); };
        var f2 = function() { alert("f2"); };
    
        var first = Core.extend({
            alpha: f1
        });
        this.assertSame(f1, first.prototype.alpha);

        var exceptionThrown = false;
        try {
            var second = Core.extend(first, {
                alpha: f2
            });
        } catch (ex) { 
            exceptionThrown = true;
        }
        if (!exceptionThrown) {
            this.fail("Non-virtual property was overridden without throwing an exception.");
        }
    },

    /**
     * Verify that virtual-ness is enforced at each level: if subclass override is NOT specified as virtual, ensure that 
     * sub-sub class CANNOT override it.
     */
    testVirtualDoubleFail: function() {
        var f1 = function() { alert("f1"); };
        var f2 = function() { alert("f2"); };
        var f3 = function() { alert("f3"); };
    
        var first = Core.extend({
            $virtual: {
                alpha: f1
            }
        });
        this.assertSame(f1, first.prototype.alpha);

        var second = Core.extend(first, {
            alpha: f2
        });
        this.assertSame(f1, first.prototype.alpha);
        this.assertSame(f2, second.prototype.alpha);

        var exceptionThrown = false;
        try {
            var third = Core.extend(second, {
                alpha: f3
            });
        } catch (ex) { 
            exceptionThrown = true;
        }
        if (!exceptionThrown) {
            this.fail("Non-virtual property was overridden without throwing an exception.");
        }
    }
});

init = function() {
    EchoDebugConsole.install();
    EchoDebugConsole.setVisible(true);
new CoreTests().testAbstractSimpleFail();
//    TestCore.run(new CoreTests());
};
