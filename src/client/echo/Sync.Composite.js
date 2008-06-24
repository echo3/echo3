/**
 * Component rendering peer: Composite
 */
Echo.Sync.Composite = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Composite", this);
    },

    $virtual: {
        renderStyle: function(element) {
            Echo.Sync.Color.renderFB(this.component, element);
            Echo.Sync.Font.render(this.component.render("font"), element);
        }
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        
        var componentCount = this.component.getComponentCount();
        if (componentCount > 0) {
            this.renderStyle(this._div);
            for (var i = 0; i < componentCount; ++i) {
                var child = this.component.getComponent(i);
                Echo.Render.renderComponentAdd(update, child, this._div);
            }
        }
        
        parentElement.appendChild(this._div);
    },
    
    renderDispose: function(update) { 
        this._div = null;
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

Echo.Sync.Panel = Core.extend(Echo.Sync.Composite, {
    $load: function() {
        Echo.Render.registerPeer("Panel", this);
    },

    renderStyle: function(element) {
        Echo.Sync.Composite.prototype.renderStyle.call(this, element);
        Echo.Sync.Border.render(this.component.render("border"), element);
        Echo.Sync.Insets.render(this.component.render("insets"), element, "padding");
    }
});
