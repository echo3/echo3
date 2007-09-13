/**
 * Library for Application-Rendered Component support.
 */
EchoArc = function() { }

EchoArc.Client = function(application, domainElement) {
    EchoFreeClient.call(this, application, domainElement);
};

EchoArc.Client.prototype = EchoCore.derive(EchoFreeClient);

EchoArc.ComponentSync = function() {

};

EchoArc.ComponentSync.prototype = EchoCore.derive(EchoRender.ComponentSync);

/**
 * @type EchoApp.Component
 */
EchoArc.ComponentSync.prototype.createBaseComponent = function() { };

/**
 * @type Element
 */
EchoArc.ComponentSync.prototype.getDomainElement = function() { };

EchoArc.ComponentSync.prototype.renderDispose = function(update) {
    if (this.arcClient) {
        this.arcClient.dispose();
        this.arcClient = null;
    }
    if (this.arcApplication) {
        this.arcApplication.dispose();
        this.arcApplication = null;
        this.baseComponent = null;
    }
};

EchoArc.ComponentSync.prototype.renderDisplay = function() {
    if (!this.arcApplication) {
        this.arcApplication = new EchoApp.Application();
        this.arcApplication.setStyleSheet(this.client.application.getStyleSheet());
        this.baseComponent = this.createBaseComponent();
        this.arcApplication.rootComponent.add(this.baseComponent);
        this.arcClient = new EchoArc.Client(this.arcApplication, this.getDomainElement());
        this.arcClient.parent = this.client;
        this.arcClient.init();
    }
};
