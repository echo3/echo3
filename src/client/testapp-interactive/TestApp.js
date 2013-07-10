init = function() {
    Core.Debug.consoleElement = document.getElementById("debugconsole");
    Core.Web.init();

    var app = new TestApp();
    var client = new Echo.FreeClient(app, document.getElementById("rootArea"));
    client.loadStyleSheet("Default.stylesheet.xml");
    client.init();
};

TestApp = Core.extend(Echo.Application, {

    $static: {
        Tests: { },

        randomColor: function() {
            var colorValue = parseInt(Math.random() * 0x1000000).toString(16);
            colorValue = "#" + "000000".substring(colorValue.length) + colorValue;
            return colorValue;
        }
    },

    $construct: function() {
        Echo.Application.call(this);
        var testScreen = new TestApp.TestScreen();
        testScreen.addTest("Column");
        testScreen.addTest("SplitPane");
        testScreen.addTest("TextComponent");
        testScreen.addTest("WindowPane");
        testScreen.addTest("ButtonAlignment");
        this.rootComponent.add(testScreen);
    }
});

TestApp.TestScreen = Core.extend(Echo.ContentPane, {

    $construct: function() {
        Echo.ContentPane.call(this, {
            background: "#abcdef",
            children: [
                this.testSelectSplitPane = new Echo.SplitPane({
                    styleName: "DefaultResizable",
                    separatorPosition: 180,
                    children: [
                        this.testSelectColumn = new Echo.Column({
                            insets: "5px 10px"
                        }),
                        new Echo.Column({
                            insets: "5px 10px",
                            children: [
                                new Echo.Label({
                                    styleName: "Default",
                                    text: "Welcome to the Experimental Echo Client Test Application!"
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    },
    
    addTest: function(testName) {
        this.testSelectColumn.add(new Echo.Button({
            styleName: "Default",
            text: testName,
            events: {
                action: Core.method(this, this._launchTest)
            }
        }));
    },

    _launchTest: function(e) {
        while (this.testSelectSplitPane.children.length > 1) {
            this.testSelectSplitPane.remove(1);
        }
        var testName = e.source.get("text");
        var test = TestApp.Tests[testName];
        if (!test) {
            alert("Test not found: " + testName);
            return;
        }
        var instance = new test();
        this.testSelectSplitPane.add(instance);
    }
});

TestApp.TestPane = Core.extend(Echo.ContentPane, {

    $construct: function() {
        Echo.ContentPane.call(this, {
            children: [
                new Echo.SplitPane({
                    styleName: "DefaultResizable",
                    orientation: Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING,
                    separatorPosition: 180,
                    children: [
                        this.controlsColumn = new Echo.Column({
                            insets: "5px 10px"
                        }),
                        this.content = new Echo.ContentPane()
                    ]
                })
            ]
        });
    },

    addTestButton: function(text, action) {
        this.controlsColumn.add(
            new Echo.Button({
                styleName: "Default",
                text: text,
                events: {
                    action: action 
                }
            })
        );
    }
});

TestApp.Tests.Column = Core.extend(TestApp.TestPane, {

    $construct: function() {
        TestApp.TestPane.call(this);

        this.childCount = 0;

        this.column = new Echo.Column({
            children: [
                new Echo.Label({
                    text: "Content One"
                }),
                new Echo.Label({
                    text: "Content Two"
                })
            ]
        });
        this.content.add(this.column);

        this.addTestButton("CellSpacing=0", Core.method(this, this._cellSpacing0));
        this.addTestButton("CellSpacing=1", Core.method(this, this._cellSpacing1));
        this.addTestButton("CellSpacing=5", Core.method(this, this._cellSpacing5));
        this.addTestButton("CellSpacing=25", Core.method(this, this._cellSpacing25));
        this.addTestButton("CellSpacing=null", Core.method(this, this._cellSpacingNull));
        this.addTestButton("Add child, i=0", Core.method(this, this._addChild0));
        this.addTestButton("Add child, i=1", Core.method(this, this._addChild1));
        this.addTestButton("Add child, i=2", Core.method(this, this._addChild2));
        this.addTestButton("Add child, i=END", Core.method(this, this._addChildEnd));
        this.addTestButton("Add two children", Core.method(this, this._addTwoChildren));
        this.addTestButton("Add children, remove/add column", Core.method(this, function() {
            var parent = this.column.parent;
            parent.remove(this.column);
            parent.add(this.column);
            this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at end" }));
            this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at end" }));
        }));
        this.addTestButton("Remove child, i=0", Core.method(this, this._removeChild0));
        this.addTestButton("Remove child, i=1", Core.method(this, this._removeChild1));
        this.addTestButton("Remove child, i=2", Core.method(this, this._removeChild2));
        this.addTestButton("Remove child, i=END", Core.method(this, this._removeChildEnd));
        this.addTestButton("Set child background", Core.method(this, this._setChildBackground));
        this.addTestButton("Set LayoutData Background, i = 0", Core.method(this, this._setLayoutDataBackground));
        this.addTestButton("Set LayoutData Insets, i = 0", Core.method(this, this._setLayoutDataInsets));
    },

    _cellSpacing0: function() {
        this.column.set("cellSpacing", 0);
    },

    _cellSpacing1: function() {
        this.column.set("cellSpacing", 1);
    },

    _cellSpacing5: function() {
       this.column.set("cellSpacing", 5);
    },

    _cellSpacing25: function() {
        this.column.set("cellSpacing", 25);
    },

    _cellSpacingNull: function() {
        this.column.set("cellSpacing", null);
    },

    _addChild0: function() {
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at 0" }), 0);
    },

    _addChild1: function() {
        if (this.column.children.length < 1) {
            return;
        }
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at 1" }), 1);
    },

    _addChild2: function() {
        if (this.column.children.length < 2) {
            return;
        }
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at 2" }), 2);
    },

    _addChildEnd: function() {
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at end" }));
    },

    _addTwoChildren: function() {
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at end" }));
        this.column.add(new Echo.Label({ text: "[" + ++this.childCount + "] added at end" }));
    },

    _removeChild0: function() {
        if (this.column.children.length > 0) {
            this.column.remove(0);
        }
    },

    _removeChild1: function() {
        if (this.column.children.length > 1) {
            this.column.remove(1);
        }
    },

    _removeChild2: function() {
        if (this.column.children.length > 2) {
            this.column.remove(2);
        }
    },

    _removeChildEnd: function() {
        if (this.column.children.length > 0) {
            this.column.remove(this.column.children.length - 1);
        }
    },

    _setChildBackground: function() {
        var length = this.column.children.length;
        for (var i = 0; i < length; ++i) {
            this.column.children[i].set("background", TestApp.randomColor());
        }
    },

    _setLayoutDataBackground: function() {
        if (this.column.children.length == 0) {
            return;
        }
        this.column.children[0].set("layoutData", { background: TestApp.randomColor() });
    },

    _setLayoutDataInsets: function() {
        if (this.column.children.length == 0) {
            return;
        }
        this.column.children[0].set("layoutData", { insets: parseInt(Math.random() * 20) });
    }
});

TestApp.Tests.SplitPane = Core.extend(TestApp.TestPane, {

    $construct: function() {
        TestApp.TestPane.call(this);

        this.content.add(this.splitPane = new Echo.SplitPane({
            resizable: true,
            children: [
                new Echo.Label({
                    text: "Content One"
                }),
                new Echo.Label({
                    text: "Content Two"
                })
            ]
        }));

        this.addTestButton("Orientation: L/R", Core.method(this, this._setOrientationLR));
        this.addTestButton("Orientation: R/L", Core.method(this, this._setOrientationRL));
        this.addTestButton("Orientation: T/B", Core.method(this, this._setOrientationTB));
        this.addTestButton("Orientation: B/T", Core.method(this, this._setOrientationBT));
        this.addTestButton("Component1: Set LD", Core.method(this, this._setLayoutData1));
        this.addTestButton("Component1: Clear LD", Core.method(this, this._clearLayoutData1));
        this.addTestButton("Component2: Set LD", Core.method(this, this._setLayoutData2));
        this.addTestButton("Component2: Clear LD", Core.method(this, this._clearLayoutData2));
        this.addTestButton("Add Component", Core.method(this, this._addComponent));
        this.addTestButton("Insert Component", Core.method(this, this._insertComponent));
        this.addTestButton("Remove First Component", Core.method(this, this._removeFirstComponent));
        this.addTestButton("Remove Last Component", Core.method(this, this._removeLastComponent));
    },
    
    _addComponent: function(e) {
        if (this.splitPane.children.length >= 2) {
            return;
        }
        this.splitPane.add(new Echo.Label({ text: "Content Added" }));
    },

    _insertComponent: function(e) {
        if (this.splitPane.children.length >= 2) {
            return;
        }
        this.splitPane.add(new Echo.Label({ text: "Content Inserted" }), 0);
    },

    _removeFirstComponent: function(e) {
        if (this.splitPane.children.length < 1) {
            return;
        }
        this.splitPane.remove(0);
    },

    _removeLastComponent: function(e) {
        if (this.splitPane.children.length < 1) {
            return;
        }
        this.splitPane.remove(this.splitPane.children.length - 1);
    },

    _clearLayoutData1: function(e) {
        if (this.splitPane.children.length < 1) {
            return;
        }
        this.splitPane.children[0].set("layoutData", null);
    },

    _clearLayoutData2: function(e) {
        if (this.splitPane.children.length < 2) {
            return;
        }
        this.splitPane.children[1].set("layoutData", null);
    },

    _setLayoutData1: function(e) {
        if (this.splitPane.children.length < 1) {
            return;
        }
        this.splitPane.children[0].set("layoutData", {
            background: "#3fffaf",
            insets: 5
        });
    },

    _setLayoutData2: function(e) {
        if (this.splitPane.children.length < 2) {
            return;
        }
        this.splitPane.children[1].set("layoutData", {
            background: "#afff3f",
            insets: 5
        });
    },

    _setOrientationLR: function(e) {
        this.splitPane.set("orientation", Echo.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT);
    },

    _setOrientationRL: function(e) {
        this.splitPane.set("orientation", Echo.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT);
    },

    _setOrientationTB: function(e) {
        this.splitPane.set("orientation", Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM);
    },

    _setOrientationBT: function(e) {
        this.splitPane.set("orientation", Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP);
    }
});


TestApp.Tests.TextComponent = Core.extend(TestApp.TestPane, {

    $construct: function() {
        TestApp.TestPane.call(this);

        this.content.add(new Echo.Column({
            children: [
                this.textField = new Echo.TextField()
            ]
        }));

        this.addTestButton("Set Text", Core.method(this, this._setText));
        this.addTestButton("Set Text Empty", Core.method(this, this._setTextEmpty));
        this.addTestButton("Set Text Null", Core.method(this, this._setTextNull));
    },

    _setText: function() {
        this.textField.set("text", "Hello, world");
    },

    _setTextEmpty: function() {
        this.textField.set("text", "");
    },

    _setTextNull: function() {
        this.textField.set("text", null);
    }
});

TestApp.Tests.WindowPane = Core.extend(TestApp.TestPane, {

    $construct: function() {
        TestApp.TestPane.call(this);

        this.add(this.windowPane = new Echo.WindowPane({
            styleName: "Default",
            title: "This is a Window"
        }));

        this.addTestButton("Set Title", Core.method(this, this._setTitle));
        this.addTestButton("Set Title Empty", Core.method(this, this._setTitleEmpty));
        this.addTestButton("Set Title Null", Core.method(this, this._setTitleNull));
    },

    _setTitle: function() {
        this.windowPane.set("title", "Hello, world");
    },

    _setTitleEmpty: function() {
        this.windowPane.set("title", "");
    },

    _setTitleNull: function() {
        this.windowPane.set("title", null);
    }
});

TestApp.Tests.ButtonAlignment = Core.extend(TestApp.TestPane, {

    $construct: function() {
        TestApp.TestPane.call(this);

        var middlealign = {horizontal: "center", vertical: "middle"};
        var rightalign = {horizontal: "right", vertical: "middle"};
        var bottomalign = {horizontal: "center", vertical: "bottom"};
        var textMiddle = {horizontal: "middle"};
        var textRight = {horizontal: "right"};
        var img = "img/test.png";
        var grid = new Echo.Grid({
            size: 6,
            insets: "3px",
            background: "green",
            width: "200px",
            children: [
                new Echo.Label({text: ""}),
                new Echo.Label({text: "Text only"}),
                new Echo.Label({text: "Icon only"}),
                new Echo.Label({text: "Text and Icon"}),
                new Echo.Label({text: "Text-align middle"}),
                new Echo.Label({text: "Text-align right"}),
                new Echo.Label({text: "Left", layoutData: { rowSpan: 3}}),

                new Echo.Button({width: "100", text: "text", height: "65px", background: "yellow"}),
                new Echo.Button({width: "100", icon: img, height: "65px", background: "orange"}),
                new Echo.Button({width: "140", text: "text", icon: img, height: "65px", background: "magenta"}),
                new Echo.Button({width: "140", text: "text", icon: img, height: "65px", background: "cyan", textAlignment: textMiddle}),
                new Echo.Button({width: "140", text: "text", icon: img, height: "65px", background: "lightgray", textAlignment: textRight}),

                new Echo.RadioButton({width: "100", text: "text", height: "65px", background: "yellow"}),
                new Echo.RadioButton({width: "100", icon: img, height: "65px", background: "orange"}),
                new Echo.RadioButton({width: "140", text: "text", icon: img, height: "65px", background: "magenta"}),
                new Echo.RadioButton({width: "140", text: "text", icon: img, height: "65px", background: "cyan", textAlignment: textMiddle}),
                new Echo.RadioButton({width: "140", text: "text", icon: img, height: "65px", background: "lightgray", textAlignment: textRight}),

                new Echo.CheckBox({width: "100", text: "text", height: "65px", background: "yellow"}),
                new Echo.CheckBox({width: "100", icon: img, height: "65px", background: "orange"}),
                new Echo.CheckBox({width: "140", text: "text", icon: img, height: "65px", background: "magenta"}),
                new Echo.CheckBox({width: "140", text: "text", icon: img, height: "65px", background: "cyan", textAlignment: textMiddle}),
                new Echo.CheckBox({width: "140", text: "text", icon: img, height: "65px", background: "lightgray", textAlignment: textRight}),

                new Echo.Label({text: ""}),
                new Echo.Label({text: "Text only"}),
                new Echo.Label({text: "Icon only"}),
                new Echo.Label({text: "Text and Icon"}),
                new Echo.Label({text: "Text-align middle"}),
                new Echo.Label({text: "Text-align right"}),
                new Echo.Label({text: "Middle", layoutData: { rowSpan: 3}}),

                new Echo.Button({text: "text", height: "65px", background: "yellow", alignment: middlealign}),
                new Echo.Button({ icon: img, height: "65px", background: "orange", alignment: middlealign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "magenta", alignment: middlealign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "cyan", alignment: middlealign, textAlignment: textMiddle}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: middlealign, textAlignment: textRight}),

                new Echo.RadioButton({text: "text", height: "65px", background: "yellow", alignment: middlealign}),
                new Echo.RadioButton({ icon: img, height: "65px", background: "orange", alignment: middlealign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "magenta", alignment: middlealign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "cyan", alignment: middlealign, textAlignment: textMiddle}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: middlealign, textAlignment: textRight}),

                new Echo.CheckBox({text: "text", height: "65px", background: "yellow", alignment: middlealign}),
                new Echo.CheckBox({ icon: img, height: "65px", background: "orange", alignment: middlealign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "magenta", alignment: middlealign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "cyan", alignment: middlealign, textAlignment: textMiddle}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: middlealign, textAlignment: textRight}),

                new Echo.Label({text: ""}),
                new Echo.Label({text: "Text only"}),
                new Echo.Label({text: "Icon only"}),
                new Echo.Label({text: "Text and Icon"}),
                new Echo.Label({text: "Text-align middle"}),
                new Echo.Label({text: "Text-align right"}),
                new Echo.Label({text: "Right", layoutData: { rowSpan: 3}}),

                new Echo.Button({text: "text", height: "65px", background: "yellow", alignment: rightalign}),
                new Echo.Button({ icon: img, height: "65px", background: "orange", alignment: rightalign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "magenta", alignment: rightalign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "cyan", alignment: rightalign, textAlignment: textMiddle}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: rightalign, textAlignment: textRight}),

                new Echo.RadioButton({text: "text", height: "65px", background: "yellow", alignment: rightalign}),
                new Echo.RadioButton({ icon: img, height: "65px", background: "orange", alignment: rightalign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "magenta", alignment: rightalign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "cyan", alignment: rightalign, textAlignment: textMiddle}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: rightalign, textAlignment: textRight}),

                new Echo.CheckBox({text: "text", height: "65px", background: "yellow", alignment: rightalign}),
                new Echo.CheckBox({ icon: img, height: "65px", background: "orange", alignment: rightalign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "magenta", alignment: rightalign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "cyan", alignment: rightalign, textAlignment: textMiddle}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: rightalign, textAlignment: textRight}),

                new Echo.Label({text: ""}),
                new Echo.Label({text: "Text only"}),
                new Echo.Label({text: "Icon only"}),
                new Echo.Label({text: "Text and Icon"}),
                new Echo.Label({text: "Text-align middle"}),
                new Echo.Label({text: "Text-align right"}),
                new Echo.Label({text: "Bottom", layoutData: { rowSpan: 3}}),

                new Echo.Button({text: "text", height: "65px", background: "yellow", alignment: bottomalign}),
                new Echo.Button({ icon: img, height: "65px", background: "orange", alignment: bottomalign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "magenta", alignment: bottomalign}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "cyan", alignment: bottomalign, textAlignment: textMiddle}),
                new Echo.Button({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: bottomalign, textAlignment: textRight}),

                new Echo.RadioButton({text: "text", height: "65px", background: "yellow", alignment: bottomalign}),
                new Echo.RadioButton({ icon: img, height: "65px", background: "orange", alignment: bottomalign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "magenta", alignment: bottomalign}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "cyan", alignment: bottomalign, textAlignment: textMiddle}),
                new Echo.RadioButton({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: bottomalign, textAlignment: textRight}),

                new Echo.CheckBox({text: "text", height: "65px", background: "yellow", alignment: bottomalign}),
                new Echo.CheckBox({ icon: img, height: "65px", background: "orange", alignment: bottomalign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "magenta", alignment: bottomalign}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "cyan", alignment: bottomalign, textAlignment: textMiddle}),
                new Echo.CheckBox({ text: "text", icon: img, height: "65px", background: "lightgray", alignment: bottomalign, textAlignment: textRight})
            ]
        });
       this.add(grid);
    }
});
