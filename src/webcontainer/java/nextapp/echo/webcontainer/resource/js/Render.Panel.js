/**
 * Component rendering peer: Panel
 */
EchoRender.ComponentSync.Panel = function() { };

EchoRender.ComponentSync.Panel.prototype = new EchoRender.ComponentSync.Composite;

EchoRender.ComponentSync.Panel.prototype.renderStyle = function(element) {
	EchoRender.ComponentSync.Composite.prototype.renderStyle.call(this, element);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), element);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
};

EchoRender.registerPeer("Panel", EchoRender.ComponentSync.Panel);
