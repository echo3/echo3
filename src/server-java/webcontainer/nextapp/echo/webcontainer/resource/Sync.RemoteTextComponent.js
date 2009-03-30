Echo.Sync.RemoteTextComponent = Core.extend({
    
    $static: {
    
        SYNC_ON_ACTION: 0,

        SYNC_ON_CHANGE: 1,
        
        _SyncMixins: {
    
            _processChangeRef: null,
            _syncMode: null,
            _changeRunnable: null,
            _initialDelayComplete: false,
            
            _remoteInit: function() {
                this._processChangeRef = Core.method(this, this._processChange);
            },
    
            _remoteGetSupportedPartialProperties: function() {
                var properties = this.constructor.$super.prototype.getSupportedPartialProperties();
                properties.push("syncMode", "syncDelay", "syncInitialDelay");
                return properties;
            },
            
            _remoteAdd: function() {
                this._syncMode = this.component.render("syncMode", Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION);
                if (this._syncMode !== Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION) {
                    this.component.addListener("property", this._processChangeRef);
                }
            },
            
            _remoteDispose: function() {
                if (this._changeRunnable) {
                    Core.Web.Scheduler.remove(this._changeRunnable);
                }
                this.component.removeListener("property", this._processChangeRef);
            },
            
            _processChange: function(e) {
                if (!this.client) {
                    return;
                }
                
                if (!this._changeRunnable) {
                    this._changeRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, function() {
                        this._initialDelayComplete = true;
                        this.component.fireEvent({source: this.component, type: "change" });
                    }), this.component.render("syncInitialDelay", 0));
                    Core.Web.Scheduler.add(this._changeRunnable);
                } else if (this._initialDelayComplete) {
                    this._changeRunnable.timeInterval = this.component.render("syncDelay", 250);
                    Core.Web.Scheduler.add(this._changeRunnable);
                }
            }
        }
    }
});

Echo.Sync.RemotePasswordField = Core.extend(Echo.PasswordField, {

    componentType: "RPF",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RPF", this);
    }
});

Echo.Sync.RemotePasswordField.Sync = Core.extend(Echo.Sync.PasswordField, {
    
    $load: function() {
        Echo.Render.registerPeer("RPF", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    $construct: function() {
        this._remoteInit();
    },
    
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.constructor.$super.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.PasswordField.prototype.renderDispose.call(this, update);
    }
});

Echo.Sync.RemoteTextArea = Core.extend(Echo.TextArea, {

    componentType: "RTA",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RTA", this);
    }
});

Echo.Sync.RemoteTextArea.Sync = Core.extend(Echo.Sync.TextArea, {
    
    $load: function() {
        Echo.Render.registerPeer("RTA", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    $construct: function() {
        this._remoteInit();
    },
    
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.constructor.$super.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.TextArea.prototype.renderDispose.call(this, update);
    }
});

Echo.Sync.RemoteTextField = Core.extend(Echo.TextField, {

    componentType: "RTF",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RTF", this);
    }
});

Echo.Sync.RemoteTextField.Sync = Core.extend(Echo.Sync.TextField, {
    
    $load: function() {
        Echo.Render.registerPeer("RTF", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    $construct: function() {
        this._remoteInit();
    },
    
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.constructor.$super.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.TextField.prototype.renderDispose.call(this, update);
    }
});

