/**
 * A component which tests renderHide by blinking its content.
 */
BlinkComponent = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("BlinkComponent", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "BlinkComponent"
});

/**
 * Synchronization peer for blink component.
 * 
 * @sp {Number} interval the flash interval
 */
BlinkComponent.Sync = Core.extend(Echo.Render.ComponentSync, {
    
    _div: null,
    _hidingDiv: null,
    _flashRunnable: null,
    
    $load: function() {
        Echo.Render.registerPeer("BlinkComponent", this);
    },
    
    _flash: function() {
        if (this._div === this._hidingDiv.parentNode) {
            // Remove child, invoke renderComponentHide().
            this._div.removeChild(this._hidingDiv);
            if (this.component.children.length > 0) {
                Echo.Render.renderComponentHide(this.component.children[0]);
            }
        } else {
            // Add child, invoke renderComponentDisplay().
            this._div.appendChild(this._hidingDiv);
            if (this.component.children.length > 0) {
                Echo.Render.renderComponentDisplay(this.component.children[0]);
            }
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;";
        this._hidingDiv = document.createElement("div");
        this._hidingDiv.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;background-color:blue;";
        this._div.appendChild(this._hidingDiv);
        
        if (this.component.children.length !== 0) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._hidingDiv);
        }
        
        parentElement.appendChild(this._div);
        this._flashRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._flash), 
                this.component.render("interval", 3000), true);
        Core.Web.Scheduler.add(this._flashRunnable);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Scheduler.remove(this._flashRunnable);
        this._hidingDiv = null;
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
