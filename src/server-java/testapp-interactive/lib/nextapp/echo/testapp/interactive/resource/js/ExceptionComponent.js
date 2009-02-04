/**
 * Exception test namespace.
 * @namespace
 */
ExTest = { };

/**
 * A component which throws an exception when rendered.
 */
ExTest.RenderFail = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("ExTest.RenderFail", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "ExTest.RenderFail"
});

/**
 * Synchronization peer for RenderFail component.
 */
ExTest.RenderFail.Sync = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("ExTest.RenderFail", this);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        // Epic fail.
        thisMethodDoesNotExistAndThusCallingItWillCauseAnException();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        this.renderAdd(update, containerElement);
    }
});
