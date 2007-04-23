/**
 * Component rendering peer: Composite
 */
EchoRender.ComponentSync.Composite = function() { };

EchoRender.ComponentSync.Composite.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Composite.prototype.renderAdd = function(update, parentElement) {
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId;
    
    var componentCount = this.component.getComponentCount();
    if (componentCount > 0) {
	    this._renderStyle(divElement);
	    for (var i = 0; i < componentCount; ++i) {
	        var child = this.component.getComponent(i);
		    EchoRender.renderComponentAdd(update, child, divElement);
	    }
    }
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Composite.prototype._renderStyle = function(element) {
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderDefault(this.component, element);
};

EchoRender.ComponentSync.Composite.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.Composite.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

/**
 * Component rendering peer: Panel
 */
EchoRender.ComponentSync.Panel = function() { };

EchoRender.ComponentSync.Panel.prototype = new EchoRender.ComponentSync.Composite;

EchoRender.ComponentSync.Panel.prototype._renderStyle = function(element) {
	EchoRender.ComponentSync.Composite.prototype._renderStyle.call(this, element);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), element);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
};

EchoRender.registerPeer("Composite", EchoRender.ComponentSync.Composite);
EchoRender.registerPeer("Panel", EchoRender.ComponentSync.Panel);
