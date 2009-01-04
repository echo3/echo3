/**
 * Component rendering peer: Composite.
 */
Echo.Sync.Composite = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Composite", this);
    },

    $virtual: {
        
        /**
         * Renders style attributes on the created DIV.
         * Overridden by <code>Echo.Sync.Panel</code> to provide additional features.
         * 
         * @param element the 
         */
        renderStyle: function(element) {
            Echo.Sync.renderComponentDefaults(this.component, element);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        
        if (this.component.children.length != 0) {
            this.renderStyle(this._div);
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        }
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { 
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Component rendering peer: Panel.
 */
Echo.Sync.Panel = Core.extend(Echo.Sync.Composite, {
    
    $load: function() {
        Echo.Render.registerPeer("Panel", this);
    },

    /** @see Echo.Sync.Composite#renderStyle */
    renderStyle: function(element) {
        var child = this.component.children.length != 0 ? this.component.children[0] : null;
        var width = this.component.render("width");
        var height = this.component.render("height");
        if (child && child.pane) {
            element.style.position = "relative";
            if (!height || Echo.Sync.Extent.isPercent(height)) {
                height = "10em";
            }
        }
        
        if (width || height) {
            element.style.overflow = "hidden";
        }
        
        Echo.Sync.renderComponentDefaults(this.component, element);
        Echo.Sync.Border.render(this.component.render("border"), element);
        Echo.Sync.Insets.render(this.component.render("insets"), element, "padding");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), element);
        Echo.Sync.Extent.render(width, element, "width", true, true);
        Echo.Sync.Extent.render(height, element, "height", false, false);
    }
});
