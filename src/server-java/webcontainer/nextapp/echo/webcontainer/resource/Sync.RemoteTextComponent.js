Echo.Sync.RemoteTextComponent = Core.extend({
    
    $static: {
    
        SYNC_ON_ACTION: 0,

        SYNC_ON_CHANGE: 1
    }
});

Echo.Sync.RemoteTextField = Core.extend(Echo.TextField, {

    componentType: "RTF",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RTF", this);
    },
    
    doChange: function() {
        this.fireEvent({source: this, type: "change" });
    }
});

Echo.Sync.RemoteTextField.Sync = Core.extend(Echo.Sync.TextField, {
    
    $load: function() {
        Echo.Render.registerPeer("RTF", this);
    },
    
    _processChangeRef: null,
    _syncMode: null,
    _changeRunnable: null,
    _initialDelayComplete: false,
    
    $construct: function() {
        this._processChangeRef = Core.method(this, this._processChange);
    },
    
    _processChange: function(e) {
        if (!this.client) {
            return;
        }
        
        if (!this._changeRunnable) {
            this._changeRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, function() {
                this._initialDelayComplete = true;
                this.component.doChange();
            }),  this.component.render("syncInitialDelay", 0));
            Core.Web.Scheduler.add(this._changeRunnable);
        } else if (this._initialDelayComplete) {
            this._changeRunnable.timeInterval = this.component.render("syncDelay", 250);
            Core.Web.Scheduler.add(this._changeRunnable);
        }
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._syncMode = this.component.render("syncMode", Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION);
        this.constructor.$super.prototype.renderAdd.call(this, update, parentElement);
        if (this._syncMode !== Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION) {
            this.component.addListener("property", this._processChangeRef);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        if (this._changeRunnable) {
            Core.Web.Scheduler.remove(this._changeRunnable);
        }
        this.component.removeListener("property", this._processChangeRef);
        Echo.Sync.TextField.prototype.renderDispose.call(this, update);
    }
});