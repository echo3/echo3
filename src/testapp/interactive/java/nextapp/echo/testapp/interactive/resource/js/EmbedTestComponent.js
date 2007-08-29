EmbedTest = function() { };

EmbedTest.TestComponent = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "EmbedTestComponent";
};

EmbedTest.TestComponent.prototype = EchoCore.derive(EchoApp.Component);

EmbedTest.ComponentSync = function() { };

/**
 * Component rendering peer: WindowPane
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

EchoApp.ComponentFactory.registerType("EmbedTestComponent", EmbedTest.TestComponent);
EchoRender.registerPeer("EmbedTestComponent", EmbedTest.ComponentSync.TestComponent);