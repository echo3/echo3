/**
 * Component rendering peer: Composite
 */
EchoRender.ComponentSync.Composite = function() { };

EchoRender.ComponentSync.Composite.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.ComponentSync.Composite.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    
    var componentCount = this.component.getComponentCount();
    if (componentCount > 0) {
	    this._renderStyle(this._divElement);
	    for (var i = 0; i < componentCount; ++i) {
	        var child = this.component.getComponent(i);
		    EchoRender.renderComponentAdd(this.client, update, child, this._divElement);
	    }
    }
    
    parentElement.appendChild(this._divElement);
};

EchoRender.ComponentSync.Composite.prototype._renderStyle = function(element) {
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderDefault(this.component, element);
};

EchoRender.ComponentSync.Composite.prototype.renderDispose = function(update) { 
    this._divElement = null;
};

EchoRender.ComponentSync.Composite.prototype.renderUpdate = function(update) {
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

EchoRender.ComponentSync.Panel.prototype = EchoCore.derive(EchoRender.ComponentSync.Composite);

EchoRender.ComponentSync.Panel.prototype._renderStyle = function(element) {
	EchoRender.ComponentSync.Composite.prototype._renderStyle.call(this, element);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), element);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
};

EchoRender.registerPeer("Composite", EchoRender.ComponentSync.Composite);
EchoRender.registerPeer("Panel", EchoRender.ComponentSync.Panel);
