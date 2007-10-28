TestApp = function() {
    EchoApp.Application.call(this);
    var testScreen = new TestApp.TestScreen();
    testScreen.addTest("Column");
    testScreen.addTest("SplitPane");
    testScreen.addTest("TextComponent");
    testScreen.addTest("WindowPane");
    this.rootComponent.add(testScreen);
};

TestApp.prototype = Core.derive(EchoApp.Application);

TestApp.randomColor = function() {
    var colorValue = parseInt(Math.random() * 0x1000000).toString(16);
    colorValue = "#" + "000000".substring(colorValue.length) + colorValue;
    return new EchoApp.Color(colorValue);
};

TestApp.TestScreen = function() {
    EchoApp.ContentPane.call(this, {
        background: new EchoApp.Color("#abcdef"),
        children: [
            this.testSelectSplitPane = new EchoApp.SplitPane({
                styleName: "DefaultResizable",
                separatorPosition: new EchoApp.Extent("180px"),
                children: [
                    this.testSelectColumn = new EchoApp.Column({
                        insets: new EchoApp.Insets("5px 10px")
                    }),
                    new EchoApp.Column({
                        insets: new EchoApp.Insets("5px 10px"),
                        children: [
                            new EchoApp.Label({
                                styleName: "Default",
                                text: "Welcome to the Experimental Echo Client Test Application!"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

TestApp.TestScreen.prototype = Core.derive(EchoApp.ContentPane);

TestApp.TestScreen.prototype.addTest = function(testName) {
    this.testSelectColumn.add(new EchoApp.Button({
        styleName: "Default",
        text: testName,
        events: {
            action: new Core.MethodRef(this, this._launchTest)
        }
    }));
};

TestApp.TestScreen.prototype._launchTest = function(e) {
    while (this.testSelectSplitPane.children.length > 1) {
        this.testSelectSplitPane.remove(1);
    }
    var testName = e.source.getProperty("text");
    var test = TestApp.Tests[testName];
    if (!test) {
        alert("Test not found: " + testName);
        return;
    }
    var instance = new test();
    this.testSelectSplitPane.add(instance);
};

TestApp.TestPane = function() {
    EchoApp.ContentPane.call(this, {
        children: [
            new EchoApp.SplitPane({
                styleName: "DefaultResizable",
                orientation: EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING,
                separatorPosition: new EchoApp.Extent(180),
                children: [
                    this.controlsColumn = new EchoApp.Column({
                        insets: new EchoApp.Insets(5, 10)
                    }),
                    this.content = new EchoApp.ContentPane()
                ]
            })
        ]
    });
};

this.component = null;

TestApp.TestPane.prototype = Core.derive(EchoApp.ContentPane);

TestApp.TestPane.prototype.addTestButton = function(text, action) {
    this.controlsColumn.add(
        new EchoApp.Button({
            styleName: "Default",
            text: text,
            events: {
                action: action 
            }
        })
    );
};

TestApp.Tests = function() { };

TestApp.Tests.Column = function() {
    TestApp.TestPane.call(this);

    this.childCount = 0;

    this.column = new EchoApp.Column({
        children: [
            new EchoApp.Label({
                text: "Content One"
            }),
            new EchoApp.Label({
                text: "Content Two"
            })
        ]
    });
    this.content.add(this.column);

    this.addTestButton("CellSpacing=0", new Core.MethodRef(this, this._cellSpacing0));
    this.addTestButton("CellSpacing=1", new Core.MethodRef(this, this._cellSpacing1));
    this.addTestButton("CellSpacing=5", new Core.MethodRef(this, this._cellSpacing5));
    this.addTestButton("CellSpacing=25", new Core.MethodRef(this, this._cellSpacing25));
    this.addTestButton("CellSpacing=null", new Core.MethodRef(this, this._cellSpacingNull));
    this.addTestButton("Add child, i=0", new Core.MethodRef(this, this._addChild0));
    this.addTestButton("Add child, i=1", new Core.MethodRef(this, this._addChild1));
    this.addTestButton("Add child, i=2", new Core.MethodRef(this, this._addChild2));
    this.addTestButton("Add child, i=END", new Core.MethodRef(this, this._addChildEnd));
    this.addTestButton("Remove child, i=0", new Core.MethodRef(this, this._removeChild0));
    this.addTestButton("Remove child, i=1", new Core.MethodRef(this, this._removeChild1));
    this.addTestButton("Remove child, i=2", new Core.MethodRef(this, this._removeChild2));
    this.addTestButton("Remove child, i=END", new Core.MethodRef(this, this._removeChildEnd));
    this.addTestButton("Set child background", new Core.MethodRef(this, this._setChildBackground));
    this.addTestButton("Set LayoutData Background, i = 0", new Core.MethodRef(this, this._setLayoutDataBackground));
    this.addTestButton("Set LayoutData Insets, i = 0", new Core.MethodRef(this, this._setLayoutDataInsets));
};

TestApp.Tests.Column.prototype = Core.derive(TestApp.TestPane);

TestApp.Tests.Column.prototype._cellSpacing0 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent(0));
};

TestApp.Tests.Column.prototype._cellSpacing1 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent(1));
};

TestApp.Tests.Column.prototype._cellSpacing5 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent(5));
};

TestApp.Tests.Column.prototype._cellSpacing25 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent(25));
};

TestApp.Tests.Column.prototype._cellSpacingNull = function() {
    this.column.setProperty("cellSpacing", null);
};

TestApp.Tests.Column.prototype._addChild0 = function() {
    this.column.add(new EchoApp.Label({ text: "[" + ++this.childCount + "] added at 0" }), 0);
};

TestApp.Tests.Column.prototype._addChild1 = function() {
    if (this.column.children.length < 1) {
        return;
    }
    this.column.add(new EchoApp.Label({ text: "[" + ++this.childCount + "] added at 1" }), 1);
};

TestApp.Tests.Column.prototype._addChild2 = function() {
    if (this.column.children.length < 2) {
        return;
    }
    this.column.add(new EchoApp.Label({ text: "[" + ++this.childCount + "] added at 2" }), 2);
};

TestApp.Tests.Column.prototype._addChildEnd = function() {
    this.column.add(new EchoApp.Label({ text: "[" + ++this.childCount + "] added at end" }));
};

TestApp.Tests.Column.prototype._removeChild0 = function() {
    if (this.column.children.length > 0) {
        this.column.remove(0);
    }
};

TestApp.Tests.Column.prototype._removeChild1 = function() {
    if (this.column.children.length > 1) {
        this.column.remove(1);
    }
};

TestApp.Tests.Column.prototype._removeChild2 = function() {
    if (this.column.children.length > 2) {
        this.column.remove(2);
    }
};

TestApp.Tests.Column.prototype._removeChildEnd = function() {
    if (this.column.children.length > 0) {
        this.column.remove(this.column.children.length - 1);
    }
};

TestApp.Tests.Column.prototype._setChildBackground = function() {
    var length = this.column.children.length;
    for (var i = 0; i < length; ++i) {
        this.column.children[i].setProperty("background", TestApp.randomColor());
    }
};

TestApp.Tests.Column.prototype._setLayoutDataBackground = function() {
    if (this.column.children.length == 0) {
        return;
    }
    layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("background", TestApp.randomColor());
    this.column.children[0].setProperty("layoutData", layoutData);
};

TestApp.Tests.Column.prototype._setLayoutDataInsets = function() {
    if (this.column.children.length == 0) {
        return;
    }
    layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("insets", new EchoApp.Insets(parseInt(Math.random() * 20)));
    this.column.children[0].setProperty("layoutData", layoutData);
};


TestApp.Tests.SplitPane = function() {
    TestApp.TestPane.call(this);

    this.content.add(this.splitPane = new EchoApp.SplitPane({
        resizable: true,
        children: [
            new EchoApp.Label({
                text: "Content One"
            }),
            new EchoApp.Label({
                text: "Content Two"
            })
        ]
    }));

    this.addTestButton("Orientation: L/R", new Core.MethodRef(this, this._setOrientationLR));
    this.addTestButton("Orientation: R/L", new Core.MethodRef(this, this._setOrientationRL));
    this.addTestButton("Orientation: T/B", new Core.MethodRef(this, this._setOrientationTB));
    this.addTestButton("Orientation: B/T", new Core.MethodRef(this, this._setOrientationBT));
    this.addTestButton("Component1: Set LD", new Core.MethodRef(this, this._setLayoutData1));
    this.addTestButton("Component1: Clear LD", new Core.MethodRef(this, this._clearLayoutData1));
    this.addTestButton("Component2: Set LD", new Core.MethodRef(this, this._setLayoutData2));
    this.addTestButton("Component2: Clear LD", new Core.MethodRef(this, this._clearLayoutData2));
    this.addTestButton("Add Component", new Core.MethodRef(this, this._addComponent));
    this.addTestButton("Insert Component", new Core.MethodRef(this, this._insertComponent));
    this.addTestButton("Remove First Component", new Core.MethodRef(this, this._removeFirstComponent));
    this.addTestButton("Remove Last Component", new Core.MethodRef(this, this._removeLastComponent));
};

TestApp.Tests.SplitPane.prototype = Core.derive(TestApp.TestPane);

TestApp.Tests.SplitPane.prototype._addComponent = function(e) {
    if (this.splitPane.children.length >= 2) {
        return;
    }
    this.splitPane.add(new EchoApp.Label({ text: "Content Added" }));
};

TestApp.Tests.SplitPane.prototype._insertComponent = function(e) {
    if (this.splitPane.children.length >= 2) {
        return;
    }
    this.splitPane.add(new EchoApp.Label({ text: "Content Inserted" }), 0);
};

TestApp.Tests.SplitPane.prototype._removeFirstComponent = function(e) {
    if (this.splitPane.children.length < 1) {
        return;
    }
    this.splitPane.remove(0);
};

TestApp.Tests.SplitPane.prototype._removeLastComponent = function(e) {
    if (this.splitPane.children.length < 1) {
        return;
    }
    this.splitPane.remove(this.splitPane.children.length - 1);
};

TestApp.Tests.SplitPane.prototype._clearLayoutData1 = function(e) {
    if (this.splitPane.children.length < 1) {
        return;
    }
    this.splitPane.children[0].setProperty("layoutData", null);
};

TestApp.Tests.SplitPane.prototype._clearLayoutData2 = function(e) {
    if (this.splitPane.children.length < 2) {
        return;
    }
    this.splitPane.children[1].setProperty("layoutData", null);
};

TestApp.Tests.SplitPane.prototype._setLayoutData1 = function(e) {
    if (this.splitPane.children.length < 1) {
        return;
    }
    this.splitPane.children[0].setProperty("layoutData", new EchoApp.LayoutData({
        background: new EchoApp.Color("#3fffaf"),
        insets: new EchoApp.Insets(5)
    }));
};

TestApp.Tests.SplitPane.prototype._setLayoutData2 = function(e) {
    if (this.splitPane.children.length < 2) {
        return;
    }
    this.splitPane.children[1].setProperty("layoutData", new EchoApp.LayoutData({
        background: new EchoApp.Color("#afff3f"),
        insets: new EchoApp.Insets(5)
    }));
};

TestApp.Tests.SplitPane.prototype._setOrientationLR = function(e) {
    this.splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT);
};

TestApp.Tests.SplitPane.prototype._setOrientationRL = function(e) {
    this.splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT);
};

TestApp.Tests.SplitPane.prototype._setOrientationTB = function(e) {
    this.splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM);
};

TestApp.Tests.SplitPane.prototype._setOrientationBT = function(e) {
    this.splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP);
};

TestApp.Tests.TextComponent = function() {
    TestApp.TestPane.call(this);

    this.content.add(new EchoApp.Column({
        children: [
            this.textField = new EchoApp.TextField()
        ]
    }));

    this.addTestButton("Set Text", new Core.MethodRef(this, this._setText));
    this.addTestButton("Set Text Empty", new Core.MethodRef(this, this._setTextEmpty));
    this.addTestButton("Set Text Null", new Core.MethodRef(this, this._setTextNull));
};

TestApp.Tests.TextComponent.prototype = Core.derive(TestApp.TestPane);

TestApp.Tests.TextComponent.prototype._setText = function() {
    this.textField.setProperty("text", "Hello, world");
};

TestApp.Tests.TextComponent.prototype._setTextEmpty = function() {
    this.textField.setProperty("text", "");
};

TestApp.Tests.TextComponent.prototype._setTextNull = function() {
    this.textField.setProperty("text", null);
};

TestApp.Tests.WindowPane = function() {
    TestApp.TestPane.call(this);

    this.add(this.windowPane = new EchoApp.WindowPane({
        styleName: "Default",
        title: "This is a Window"
    }));

    this.addTestButton("Set Title", new Core.MethodRef(this, this._setTitle));
    this.addTestButton("Set Title Empty", new Core.MethodRef(this, this._setTitleEmpty));
    this.addTestButton("Set Title Null", new Core.MethodRef(this, this._setTitleNull));
};

TestApp.Tests.WindowPane.prototype = Core.derive(TestApp.TestPane);

TestApp.Tests.WindowPane.prototype._setTitle = function() {
    this.windowPane.setProperty("title", "Hello, world");
};

TestApp.Tests.WindowPane.prototype._setTitleEmpty = function() {
    this.windowPane.setProperty("title", "");
};

TestApp.Tests.WindowPane.prototype._setTitleNull = function() {
    this.windowPane.setProperty("title", null);
};

init = function() {
    Core.Debug.consoleElement = document.getElementById("debugconsole");
    WebCore.init();

    var app = new TestApp();
    var client = new EchoFreeClient(app, document.getElementById("rootArea"));
    client.loadStyleSheet("Default.stylesheet.xml");
    client.init();
};
