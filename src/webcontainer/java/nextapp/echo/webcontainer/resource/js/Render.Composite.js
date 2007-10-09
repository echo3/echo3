/**
 * Component rendering peer: Composite
 */
EchoAppRender.CompositeSync = function() { };

EchoAppRender.CompositeSync.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoAppRender.CompositeSync.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    
    var componentCount = this.component.getComponentCount();
    if (componentCount > 0) {
	    this._renderStyle(this._divElement);
	    for (var i = 0; i < componentCount; ++i) {
	        var child = this.component.getComponent(i);
		    EchoRender.renderComponentAdd(update, child, this._divElement);
	    }
    }
    
    parentElement.appendChild(this._divElement);
};

EchoAppRender.CompositeSync.prototype._renderStyle = function(element) {
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderDefault(this.component, element);
};

EchoAppRender.CompositeSync.prototype.renderDispose = function(update) { 
    this._divElement = null;
};

EchoAppRender.CompositeSync.prototype.renderUpdate = function(update) {
    var element = this._divElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

/**
 * Component rendering peer: Panel
 */
EchoRender.ComponentSync.Panel = function() { };

EchoRender.ComponentSync.Panel.prototype = EchoCore.derive(EchoAppRender.CompositeSync);

EchoRender.ComponentSync.Panel.prototype._renderStyle = function(element) {
	EchoAppRender.CompositeSync.prototype._renderStyle.call(this, element);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), element);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
};

EchoRender.registerPeer("Composite", EchoAppRender.CompositeSync);
EchoRender.registerPeer("Panel", EchoRender.ComponentSync.Panel);
