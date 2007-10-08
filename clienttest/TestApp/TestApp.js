TestApp = function() {
    EchoApp.Application.call(this);
    var testScreen = new TestApp.TestScreen();
    testScreen.addTest("Column");
    testScreen.addTest("SplitPane");
    testScreen.addTest("TextComponent");
    testScreen.addTest("WindowPane");
    this.rootComponent.add(testScreen);
};

TestApp.prototype = EchoCore.derive(EchoApp.Application);

TestApp.randomColor = function() {
    var colorValue = parseInt(Math.random() * 0x1000000).toString(16);
    colorValue = "#" + "000000".substring(colorValue.length) + colorValue;
    return new EchoApp.Color(colorValue);
};

TestApp.TestScreen = function() {
    EchoApp.ContentPane.call(this, {
        background: new EchoApp.Color("#abcdef")
    });

    this.testSelectSplitPane = new EchoApp.SplitPane({
        separatorPosition: new EchoApp.Extent("180px")
    });
    this.testSelectSplitPane.setStyleName("DefaultResizable");
    this.add(this.testSelectSplitPane);

    this.testSelectColumn = new EchoApp.Column({
        insets: new EchoApp.Insets("5px 10px")
    });
    this.testSelectSplitPane.add(this.testSelectColumn);
    
    var testColumn2 = new EchoApp.Column();
    var label = new EchoApp.Label({
        text: "Welcome to the Experimental Echo Client Test Application!"
    });
    label.setStyleName("Default");
    testColumn2.add(label);
    this.testSelectSplitPane.add(testColumn2);
};

TestApp.TestScreen.prototype = EchoCore.derive(EchoApp.ContentPane);

TestApp.TestScreen.prototype.addTest = function(testName) {
    var button = new EchoApp.Button({
        text: testName
    });
    button.setStyleName("Default");
    button.addListener("action", new EchoCore.MethodRef(this, this._launchTest));
    this.testSelectColumn.add(button);
};

TestApp.TestScreen.prototype._launchTest = function(e) {
    while (this.testSelectSplitPane.getComponentCount() > 1) {
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
    EchoApp.ContentPane.call(this);
    var testControlsSplitPane = new EchoApp.SplitPane();
    testControlsSplitPane.setProperty("separatorPosition", new EchoApp.Extent("180px"));
//        splitPane.setStyleName("DefaultResizable");
//        splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING);
    this.add(testControlsSplitPane);
    
    this.controlsColumn = new EchoApp.Column();
    testControlsSplitPane.add(this.controlsColumn);
    
    this.content = new EchoApp.ContentPane();
    testControlsSplitPane.add(this.content);
};

this.component = null;

TestApp.TestPane.prototype = EchoCore.derive(EchoApp.ContentPane);

TestApp.TestPane.prototype.addTestButton = function(text, action) {
    var button = new EchoApp.Button();
    button.setProperty("text", text);
    button.setStyleName("Default");
    if (action) {
        button.addListener("action", action);
    }
    this.controlsColumn.add(button);
};

TestApp.Tests = function() { };

TestApp.Tests.Column = function() {
    TestApp.TestPane.call(this);

    this.column = new EchoApp.Column();
    this.childCount = 0;
    var component;
    
    component = new EchoApp.Label();
    component.setProperty("text", "Content One");
    this.column.add(component);
    component = new EchoApp.Label();
    component.setProperty("text", "Content Two");
    this.column.add(component);
    this.content.add(this.column);

    this.addTestButton("CellSpacing=0", new EchoCore.MethodRef(this, this._cellSpacing0));
    this.addTestButton("CellSpacing=1", new EchoCore.MethodRef(this, this._cellSpacing1));
    this.addTestButton("CellSpacing=5", new EchoCore.MethodRef(this, this._cellSpacing5));
    this.addTestButton("CellSpacing=25", new EchoCore.MethodRef(this, this._cellSpacing25));
    this.addTestButton("CellSpacing=null", new EchoCore.MethodRef(this, this._cellSpacingNull));
    this.addTestButton("Add child, i=0", new EchoCore.MethodRef(this, this._addChild0));
    this.addTestButton("Add child, i=1", new EchoCore.MethodRef(this, this._addChild1));
    this.addTestButton("Add child, i=2", new EchoCore.MethodRef(this, this._addChild2));
    this.addTestButton("Add child, i=END", new EchoCore.MethodRef(this, this._addChildEnd));
    this.addTestButton("Remove child, i=0", new EchoCore.MethodRef(this, this._removeChild0));
    this.addTestButton("Remove child, i=1", new EchoCore.MethodRef(this, this._removeChild1));
    this.addTestButton("Remove child, i=2", new EchoCore.MethodRef(this, this._removeChild2));
    this.addTestButton("Remove child, i=END", new EchoCore.MethodRef(this, this._removeChildEnd));
    this.addTestButton("Set child background", new EchoCore.MethodRef(this, this._setChildBackground));
    this.addTestButton("Set LayoutData Background, i = 0", new EchoCore.MethodRef(this, this._setLayoutDataBackground));
    this.addTestButton("Set LayoutData Insets, i = 0", new EchoCore.MethodRef(this, this._setLayoutDataInsets));
};

TestApp.Tests.Column.prototype = EchoCore.derive(TestApp.TestPane);

TestApp.Tests.Column.prototype._cellSpacing0 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent("0px"));
};

TestApp.Tests.Column.prototype._cellSpacing1 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent("1px"));
};

TestApp.Tests.Column.prototype._cellSpacing5 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent("5px"));
};

TestApp.Tests.Column.prototype._cellSpacing25 = function() {
    this.column.setProperty("cellSpacing", new EchoApp.Extent("25px"));
};

TestApp.Tests.Column.prototype._cellSpacingNull = function() {
    this.column.setProperty("cellSpacing", null);
};

TestApp.Tests.Column.prototype._addChild0 = function() {
    var label = new EchoApp.Label();
    label.setProperty("text", "[" + ++this.childCount + "] added at 0");
    this.column.add(label, 0);
};

TestApp.Tests.Column.prototype._addChild1 = function() {
    if (this.column.getComponentCount() < 1) {
        return;
    }
    var label = new EchoApp.Label();
    label.setProperty("text", "[" + ++this.childCount + "] added at 1");
    this.column.add(label, 1);
};

TestApp.Tests.Column.prototype._addChild2 = function() {
    if (this.column.getComponentCount() < 2) {
        return;
    }
    var label = new EchoApp.Label();
    label.setProperty("text", "[" + ++this.childCount + "] added at 2");
    this.column.add(label, 2);
};

TestApp.Tests.Column.prototype._addChildEnd = function() {
    var label = new EchoApp.Label();
    label.setProperty("text", "[" + ++this.childCount + "] added at end");
    this.column.add(label);
};

TestApp.Tests.Column.prototype._removeChild0 = function() {
    if (this.column.getComponentCount() > 0) {
        this.column.remove(0);
    }
};

TestApp.Tests.Column.prototype._removeChild1 = function() {
    if (this.column.getComponentCount() > 1) {
        this.column.remove(1);
    }
};

TestApp.Tests.Column.prototype._removeChild2 = function() {
    if (this.column.getComponentCount() > 2) {
        this.column.remove(2);
    }
};

TestApp.Tests.Column.prototype._removeChildEnd = function() {
    if (this.column.getComponentCount() > 0) {
        this.column.remove(this.column.getComponentCount() - 1);
    }
};

TestApp.Tests.Column.prototype._setChildBackground = function() {
    var color = TestApp.randomColor();
    var length = this.column.getComponentCount();
    for (var i = 0; i < length; ++i) {
        this.column.getComponent(i).setProperty("background", color);
    }
};

TestApp.Tests.Column.prototype._setLayoutDataBackground = function() {
    if (this.column.getComponentCount() == 0) {
        return;
    }
    layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("background", TestApp.randomColor());
    this.column.getComponent(0).setProperty("layoutData", layoutData);
};

TestApp.Tests.Column.prototype._setLayoutDataInsets = function() {
    if (this.column.getComponentCount() == 0) {
        return;
    }
    layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("insets", new EchoApp.Insets(parseInt(Math.random() * 20)));
    this.column.getComponent(0).setProperty("layoutData", layoutData);
};


TestApp.Tests.SplitPane = function() {
    TestApp.TestPane.call(this);

    this.splitPane = new EchoApp.SplitPane();
    this.splitPane.setProperty("resizable", true);
    var component;
    
    component = new EchoApp.Label();
    component.setProperty("text", "Content One");
    this.splitPane.add(component);
    component = new EchoApp.Label();
    component.setProperty("text", "Content Two");
    this.splitPane.add(component);
    this.content.add(this.splitPane);

    this.addTestButton("Orientation: L/R", new EchoCore.MethodRef(this, this._setOrientationLR));
    this.addTestButton("Orientation: R/L", new EchoCore.MethodRef(this, this._setOrientationRL));
    this.addTestButton("Orientation: T/B", new EchoCore.MethodRef(this, this._setOrientationTB));
    this.addTestButton("Orientation: B/T", new EchoCore.MethodRef(this, this._setOrientationBT));
    this.addTestButton("Component1: Set LD", new EchoCore.MethodRef(this, this._setLayoutData1));
    this.addTestButton("Component1: Clear LD", new EchoCore.MethodRef(this, this._clearLayoutData1));
    this.addTestButton("Component2: Set LD", new EchoCore.MethodRef(this, this._setLayoutData2));
    this.addTestButton("Component2: Clear LD", new EchoCore.MethodRef(this, this._clearLayoutData2));
    this.addTestButton("Add Component", new EchoCore.MethodRef(this, this._addComponent));
    this.addTestButton("Insert Component", new EchoCore.MethodRef(this, this._insertComponent));
    this.addTestButton("Remove First Component", new EchoCore.MethodRef(this, this._removeFirstComponent));
    this.addTestButton("Remove Last Component", new EchoCore.MethodRef(this, this._removeLastComponent));
};

TestApp.Tests.SplitPane.prototype = EchoCore.derive(TestApp.TestPane);

TestApp.Tests.SplitPane.prototype._addComponent = function(e) {
    if (this.splitPane.getComponentCount() >= 2) {
        return;
    }
    var component = new EchoApp.Label();
    component.setProperty("text", "Content X");
    this.splitPane.add(component);
};

TestApp.Tests.SplitPane.prototype._insertComponent = function(e) {
    if (this.splitPane.getComponentCount() >= 2) {
        return;
    }
    var component = new EchoApp.Label();
    component.setProperty("text", "Content X");
    this.splitPane.add(component, 0);
};

TestApp.Tests.SplitPane.prototype._removeFirstComponent = function(e) {
    if (this.splitPane.getComponentCount() < 1) {
        return;
    }
    this.splitPane.remove(0);
};

TestApp.Tests.SplitPane.prototype._removeLastComponent = function(e) {
    if (this.splitPane.getComponentCount() < 1) {
        return;
    }
    this.splitPane.remove(this.splitPane.getComponentCount() - 1);
};

TestApp.Tests.SplitPane.prototype._clearLayoutData1 = function(e) {
    if (this.splitPane.getComponentCount() < 1) {
        return;
    }
    var component = this.splitPane.getComponent(0);
    component.setProperty("layoutData", null);
};

TestApp.Tests.SplitPane.prototype._clearLayoutData2 = function(e) {
    if (this.splitPane.getComponentCount() < 2) {
        return;
    }
    var component = this.splitPane.getComponent(1);
    component.setProperty("layoutData", null);
};

TestApp.Tests.SplitPane.prototype._setLayoutData1 = function(e) {
    if (this.splitPane.getComponentCount() < 1) {
        return;
    }
    var component = this.splitPane.getComponent(0);
    var layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("background", new EchoApp.Color("#3fffaf"));
    layoutData.setProperty("insets", new EchoApp.Insets("5px"));
    component.setProperty("layoutData", layoutData);
};

TestApp.Tests.SplitPane.prototype._setLayoutData2 = function(e) {
    if (this.splitPane.getComponentCount() < 2) {
        return;
    }
    var component = this.splitPane.getComponent(1);
    var layoutData = new EchoApp.LayoutData();
    layoutData.setProperty("background", new EchoApp.Color("#afff3f"));
    layoutData.setProperty("insets", new EchoApp.Insets("5px"));
    component.setProperty("layoutData", layoutData);
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

    var column = new EchoApp.Column();
    this.content.add(column);
    this.textField = new EchoApp.TextField();
    column.add(this.textField);

    this.addTestButton("Set Text", new EchoCore.MethodRef(this, this._setText));
    this.addTestButton("Set Text Empty", new EchoCore.MethodRef(this, this._setTextEmpty));
    this.addTestButton("Set Text Null", new EchoCore.MethodRef(this, this._setTextNull));
};

TestApp.Tests.TextComponent.prototype = EchoCore.derive(TestApp.TestPane);

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
    this.addTestButton("Set Title", new EchoCore.MethodRef(this, this._setTitle));
    this.addTestButton("Set Title Empty", new EchoCore.MethodRef(this, this._setTitleEmpty));
    this.addTestButton("Set Title Null", new EchoCore.MethodRef(this, this._setTitleNull));

    this.windowPane = new EchoApp.WindowPane();
    this.windowPane.setStyleName("Default");
    this.windowPane.setProperty("title", "This is a Window");
    this.add(this.windowPane);

};

TestApp.Tests.WindowPane.prototype = EchoCore.derive(TestApp.TestPane);

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
    EchoCore.Debug.consoleElement = document.getElementById("debugconsole");
    EchoWebCore.init();

    var app = new TestApp();
    var client = new EchoFreeClient(app, document.getElementById("rootArea"));
    client.init();
    client.loadStyleSheet("Default.stylesheet.xml");
};
