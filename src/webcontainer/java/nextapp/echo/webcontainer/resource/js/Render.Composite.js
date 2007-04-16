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
	    this.renderStyle(divElement);
	    for (var i = 0; i < componentCount; ++i) {
	        var child = this.component.getComponent(i);
		    EchoRender.renderComponentAdd(update, child, divElement);
	    }
    }
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Composite.prototype.renderStyle = function(element) {
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderDefault(this.component, element);
};

EchoRender.ComponentSync.Composite.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.Composite.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
};

EchoRender.registerPeer("Composite", EchoRender.ComponentSync.Composite);
