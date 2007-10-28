/**
 * Component rendering peer: Composite
 */
EchoAppRender.CompositeSync = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("Composite", this);
    },

    renderAdd: function(update, parentElement) {
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
    },
    
    _renderStyle: function(element) {
        EchoAppRender.Color.renderFB(this.component, element);
        EchoAppRender.Font.renderDefault(this.component, element);
    },
    
    renderDispose: function(update) { 
        this._divElement = null;
    },
    
    renderUpdate: function(update) {
        var element = this._divElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

EchoRender.ComponentSync.Panel = Core.extend(EchoAppRender.CompositeSync, {
    $load: function() {
        EchoRender.registerPeer("Panel", this);
    },

    _renderStyle: function(element) {
        EchoAppRender.CompositeSync.prototype._renderStyle.call(this, element);
        EchoAppRender.Border.render(this.component.getRenderProperty("border"), element);
        EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
    }
});