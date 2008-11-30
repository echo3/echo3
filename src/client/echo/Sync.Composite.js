/**
 * Component rendering peer: Composite
 */
Echo.Sync.Composite = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Composite", this);
    },

    $virtual: {
        renderStyle: function(element) {
            Echo.Sync.renderComponentDefaults(this.component, element);
        }
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        
        if (this.component.children.length != 0) {
            this.renderStyle(this._div);
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
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
        Echo.Sync.renderComponentDefaults(this.component, element);
        Echo.Sync.Border.render(this.component.render("border"), element);
        Echo.Sync.Insets.render(this.component.render("insets"), element, "padding");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), element);
    }
});
