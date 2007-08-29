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

EmbedTest.ComponentSync.TestComponent.prototype = EchoCore.derive(EchoRender.ComponentSync);

EmbedTest.ComponentSync.TestComponent.prototype._createApp = function() {
    this._app = new EchoApp.Application();
    var label = new EchoApp.Label();
    label.setProperty("text", "This is a freeclient label.");
    this._app.rootComponent.add(label);
    this._freeClient = new EchoFreeClient(this._app, this._divElement); 
    this._freeClient.init();
};

EmbedTest.ComponentSync.TestComponent.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    parentElement.appendChild(this._divElement);
};

EmbedTest.ComponentSync.TestComponent.prototype.renderDispose = function(update) {
    if (this._freeClient) {
        this._freeClient.dispose();
        this._freeClient = null;
    }
    if (this._appInitialized) {
        this._app.dispose();
        this._appInitialized = false;
        this._app = null;
    }
    this._divElement = null;
};

EmbedTest.ComponentSync.TestComponent.prototype.renderSizeUpdate = function(update) {
    if (!this._appInitialized) {
        this._createApp();
        this._appInitialized = true;
    }
};

EmbedTest.ComponentSync.TestComponent.prototype.renderUpdate = function(update) {
};

/**
 * Component rendering peer: TestPane
 */
EmbedTest.ComponentSync.TestPane = function() {
};

EmbedTest.ComponentSync.TestPane.prototype = EchoCore.derive(EchoRender.ComponentSync);

EmbedTest.ComponentSync.TestPane.prototype._createApp = function() {
    this._app = new EchoApp.Application();
    
    var contentPane = new EchoApp.ContentPane();
    this._app.rootComponent.add(contentPane);
    
    var windowPane = new EchoApp.WindowPane();
    windowPane.setProperty("title", "A FreeClient WindowPane");
    contentPane.add(windowPane);
    
    var label = new EchoApp.Label();
    label.setProperty("text", "This is a freeclient label.");
    windowPane.add(label);
    
    this._freeClient = new EchoFreeClient(this._app, this._divElement); 
    this._freeClient.init();
};

EmbedTest.ComponentSync.TestPane.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    this._divElement.style.cssText 
            = "position:relative; width:650px; height:450px; background-color: #3f3f6f; border: 1px #3f3f6f outset";
    parentElement.appendChild(this._divElement);
};

EmbedTest.ComponentSync.TestPane.prototype.renderDispose = function(update) {
    if (this._freeClient) {
        this._freeClient.dispose();
        this._freeClient = null;
    }
    if (this._appInitialized) {
        this._app.dispose();
        this._appInitialized = false;
        this._app = null;
    }
    this._divElement = null;
};

EmbedTest.ComponentSync.TestPane.prototype.renderSizeUpdate = function(update) {
    if (!this._appInitialized) {
        this._createApp();
        this._appInitialized = true;
    }
};

EmbedTest.ComponentSync.TestPane.prototype.renderUpdate = function(update) {
};

EchoApp.ComponentFactory.registerType("EmbedTestComponent", EmbedTest.TestComponent);
EchoRender.registerPeer("EmbedTestComponent", EmbedTest.ComponentSync.TestComponent);

EchoApp.ComponentFactory.registerType("EmbedTestPane", EmbedTest.TestPane);
EchoRender.registerPeer("EmbedTestPane", EmbedTest.ComponentSync.TestPane);