/**
 * Exception test namespace.
 * @namespace
 */
ExTest = { };

/**
 * A component which tests renderHide
 */
ExTest.RHT = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("ExTest.RHT", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "ExTest.RHT"
});

/**
 * Synchronization peer for RHT component.
 */
ExTest.RHT.Sync = Core.extend(Echo.Render.ComponentSync, {
    
    _div: null,
    _hidingDiv: null,
    _flashRunnable: null,
    
    $load: function() {
        Echo.Render.registerPeer("ExTest.RHT", this);
    },
    
    _flash: function() {
        if (this._div === this._hidingDiv.parentNode) {
            this._div.removeChild(this._hidingDiv);
        } else {
            this._div.appendChild(this._hidingDiv);
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
        this._flashRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._flash), 3000, true);
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
