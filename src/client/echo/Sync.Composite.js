/**
 * Component rendering peer: Composite.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.Composite = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Composite", this);
    },

    div: null,
    contentDiv: null,
    
    $virtual: {
        
        /**
         * Renders style attributes on the created DIV.
         * Overridden by <code>Echo.Sync.Panel</code> to provide additional features.
         */
        renderStyle: function() {
            Echo.Sync.renderComponentDefaults(this.component, this.div);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.div = this.contentDiv = document.createElement("div");
        this.div.id = this.component.renderId;
        
        if (this.component.children.length !== 0) {
            this.renderStyle();
            Echo.Render.renderComponentAdd(update, this.component.children[0], this.contentDiv);
        }
        
        parentElement.appendChild(this.div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this.contentDiv = null;
        this.div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this.div;
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
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        if (this._imageBorder) {
            Echo.Sync.FillImageBorder.renderContainerDisplay(this.div);
        }
    },

    /** @see Echo.Sync.Composite#renderStyle */
    renderStyle: function() {
        this._imageBorder = this.component.render("imageBorder");
        
        var child = this.component.children.length !== 0 ? this.component.children[0] : null;
        var width = this.component.render("width");
        var height = this.component.render("height");
        if (Echo.Sync.Extent.isPercent(height)) {
            height = null;
        }
        if (child && child.pane) {
            this.div.style.position = "relative";
            if (!height) {
                height = "10em";
            }
        }
        
        if (width || height) {
            this.contentDiv.style.overflow = "hidden";
            if (height && this._imageBorder) {
                var insetsPx = Echo.Sync.Insets.toPixels(this._imageBorder.contentInsets);
                var contentHeight = Echo.Sync.Extent.toPixels(height) - insetsPx.top - insetsPx.bottom;
                if (!child || !child.pane) {
                    insetsPx = Echo.Sync.Insets.toPixels(this.component.render("insets"));
                    contentHeight -= insetsPx.top + insetsPx.bottom;
                }
                this.contentDiv.style.height = contentHeight + "px";
            }
        }
        
        if (this._imageBorder) {
            this.div = Echo.Sync.FillImageBorder.renderContainer(this._imageBorder, { child: this.contentDiv });
        } else {
            Echo.Sync.Border.render(this.component.render("border"), this.contentDiv);
        }
        Echo.Sync.RoundedCorner.render(this.component.render("radius"), this.contentDiv);
        Echo.Sync.BoxShadow.render(this.component.render("boxShadow"), this.contentDiv);
        Echo.Sync.renderComponentDefaults(this.component, this.contentDiv);
        if (!child || !child.pane) {
            Echo.Sync.Insets.render(this.component.render("insets"), this.contentDiv, "padding");
        }
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.contentDiv, true, this.component);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this.contentDiv);
        Echo.Sync.Extent.render(width, this.div, "width", true, true);
        Echo.Sync.Extent.render(height, this.div, "height", false, false);
    }
});
