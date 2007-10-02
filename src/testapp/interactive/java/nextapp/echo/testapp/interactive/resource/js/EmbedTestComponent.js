EmbedTest = function() { };

/**
 * TestComponent component.
 */
EmbedTest.TestComponent = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "EmbedTestComponent";
};

EmbedTest.TestComponent.prototype = EchoCore.derive(EchoApp.Component);

/**
 * TestPane component.
 */
EmbedTest.TestPane = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "EmbedTestPane";
};

EmbedTest.TestPane.prototype = EchoCore.derive(EchoApp.Component);

EmbedTest.ComponentSync = function() { };

/**
 * Component rendering peer: TestComponent
 */
EmbedTest.ComponentSync.TestComponent = function() {
};

EmbedTest.ComponentSync.TestComponent.prototype = EchoCore.derive(EchoArc.ComponentSync);

EmbedTest.ComponentSync.TestComponent.prototype.createBaseComponent = function() {
    var label = new EchoApp.Label();
    label.setProperty("text", "This is a freeclient label: " + this.component.getRenderProperty("text"));
    return label;
};

/**
 * Component rendering peer: TestPane
 */
EmbedTest.ComponentSync.TestPane = function() {
    this._addedLabelCount = 0;
};

EmbedTest.ComponentSync.TestPane.prototype = EchoCore.derive(EchoArc.ComponentSync);

EmbedTest.ComponentSync.TestPane.prototype.createBaseComponent = function() {
    var contentPane = new EchoApp.ContentPane();
    
    var windowPane = new EchoApp.WindowPane();
    windowPane.setProperty("title", "A FreeClient WindowPane");
    contentPane.add(windowPane);
    
    var mainColumn = new EchoApp.Column();
    mainColumn.setProperty("cellSpacing", new EchoApp.Property.Extent("5px"));
    mainColumn.setProperty("insets", new EchoApp.Property.Insets("10px"));
    windowPane.add(mainColumn);
    
    var controlsRow = new EchoApp.Row();
    controlsRow.setProperty("cellSpacing", new EchoApp.Property.Extent("10px"));
    mainColumn.add(controlsRow);
    
    var addButton = new EchoApp.Button();
    addButton.setProperty("text", "Add Label");
    addButton.setProperty("background", new EchoApp.Property.Color("#00ff00"));
    addButton.addListener("action", new EchoCore.MethodRef(this, this._processAddButton));
    controlsRow.add(addButton);

    var removeButton = new EchoApp.Button();
    removeButton.setProperty("text", "Remove Label");
    removeButton.setProperty("background", new EchoApp.Property.Color("#ff0000"));
    removeButton.addListener("action", new EchoCore.MethodRef(this, this._processRemoveButton));
    controlsRow.add(removeButton);
    
    this._testColumn = new EchoApp.Column();
    mainColumn.add(this._testColumn);

    return contentPane;
};

EmbedTest.ComponentSync.TestPane.prototype.getDomainElement = function() {
    return this._divElement;
};

EmbedTest.ComponentSync.TestPane.prototype._processAddButton = function(e) {
    var label = new EchoApp.Label();
    label.setProperty("text", "Added Label " + ++this._addedLabelCount);
    this._testColumn.add(label);
};

EmbedTest.ComponentSync.TestPane.prototype._processRemoveButton = function(e) {
    var count = this._testColumn.getComponentCount();
    if (count > 0) {
        this._testColumn.remove(count - 1);
    }
};

EmbedTest.ComponentSync.TestPane.prototype.renderAdd = function(update, parentElement) {
    EchoArc.ComponentSync.prototype.renderAdd.call(this, update, parentElement);
    this._divElement = document.createElement("div");
    this._divElement.style.cssText 
            = "position:relative; width:100%; height:450px; background-color: #3f3f6f; border: 1px #3f3f6f outset";
    parentElement.appendChild(this._divElement);
};

EmbedTest.ComponentSync.TestPane.prototype.renderDispose = function(update) {
    EchoArc.ComponentSync.prototype.renderDispose.call(this, update);
    this._testColumn = null;
    this._divElement = null;
};

EchoApp.ComponentFactory.registerType("EmbedTestComponent", EmbedTest.TestComponent);
EchoRender.registerPeer("EmbedTestComponent", EmbedTest.ComponentSync.TestComponent);

EchoApp.ComponentFactory.registerType("EmbedTestPane", EmbedTest.TestPane);
EchoRender.registerPeer("EmbedTestPane", EmbedTest.ComponentSync.TestPane);