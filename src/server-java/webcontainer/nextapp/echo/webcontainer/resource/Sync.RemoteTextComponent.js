/**
 * Component rendering peer for RemoteClient-based text components.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.RemoteTextComponent = Core.extend({
    
    $static: {
    
        /**
         * Constant for <code>syncMode</code> indicating that the server should be notified of text changes only
         * after an action event is fired.
         */
        SYNC_ON_ACTION: 0,

        /**
         * Constant for <code>syncMode</code> indicating that the server should be notified of text changes after
         * each change.  The <code>syncDelay</code> and <code>syncInitialDelay</code> properties may be used to
         * configure the amount of inactivity after which change events are fired.
         */
        SYNC_ON_CHANGE: 1,
        
        /**
         * Mixin properties used by all remote text components.
         */
        _SyncMixins: {
    
            /**
             * Method reference to instance's _processChange() method.
             * @type Function
             */
            _processChangeRef: null,
            
            /**
             * Flag indicating whether text has changed during current period of focus.
             * @type Boolean
             */
            _changed: false,
            
            /** 
             * The synchronization mode, one of the following values:
             * <ul>
             *  <li><code>SYNC_ON_ACTION<code></li>
             *  <li><code>SYNC_ON_CHANGE</code></li>
             * </ul>
             * @type Number
             */
            _syncMode: null,
            
            /**
             * The runnable used to buffer changes to avoid sending input to server unnecessarily.
             * @type Core.Web.Scheduler.Runnable
             */
            _changeRunnable: null,
            
            /**
             * Flag indicating that the initial delay has been completed.
             * @type Boolean
             */
            _initialDelayComplete: false,
            
            /**
             * Processes a property change event from a text component synchronization peer's supported component.
             * 
             * @param e the property change event
             */
            _processChange: function(e) {
                if (!this.client || e.propertyName != "text") {
                    return;
                }
                
                this._changed = true;
                
                if (!this._changeRunnable) {
                    this._changeRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, function() {
                        this._initialDelayComplete = true;
                        this._changed = false;
                        this.component.fireEvent({source: this.component, type: "change" });
                    }), this.component.render("syncInitialDelay", 0));
                    Core.Web.Scheduler.add(this._changeRunnable);
                } else if (this._initialDelayComplete) {
                    this._changeRunnable.timeInterval = this.component.render("syncDelay", 250);
                    Core.Web.Scheduler.add(this._changeRunnable);
                }
            },
            
            /**
             * Initialization method, should be invoked by class' constructor.
             */
            _remoteInit: function() {
                this._processChangeRef = Core.method(this, this._processChange);
            },
    
            /**
             * Delegate implementation of <code>getSupportedPartialProperties()</code>.
             * @see Echo.Sync.TextComponent#getSupportedPartialProperties
             */
            _remoteGetSupportedPartialProperties: function(properties) {
                properties.push("syncMode", "syncDelay", "syncInitialDelay");
                return properties;
            },
            
            /**
             * Performs remote-client specific renderAdd() tasks.
             */
            _remoteAdd: function() {
                this._syncMode = this.component.render("syncMode", Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION);
                if (this._syncMode !== Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION) {
                    this.component.addListener("property", this._processChangeRef);
                }
            },
            
            /**
             * Performs remote-client specific processBlur() tasks.
             */
            _remoteBlur: function() {
                if (this._changed && this._syncMode !== Echo.Sync.RemoteTextComponent.SYNC_ON_ACTION) {
                    if (this._changeRunnable) {
                        Core.Web.Scheduler.remove(this._changeRunnable);
                    }
                    this.component.fireEvent({source: this.component, type: "change" });
                }
                this._changed = false;
            },
            
            /**
             * Performs remote-client specific processFocus() tasks.
             */
            _remoteFocus: function() {
                this._changed = false;
            },
            
            /**
             * Performs remote-client specific renderDispose() tasks.
             */
            _remoteDispose: function() {
                if (this._changeRunnable) {
                    Core.Web.Scheduler.remove(this._changeRunnable);
                }
                this.component.removeListener("property", this._processChangeRef);
            },
            
            /**
             * Performs remote-client specific renderUpdate() tasks.
             */
            _remoteUpdate: function() {
                this._remoteDispose();
                this._remoteAdd();
            }
        }
    }
});

/**
 * Remote password field component.
 */
Echo.Sync.RemotePasswordField = Core.extend(Echo.PasswordField, {

    /** @see Echo.Component#componentType */
    componentType: "RPF",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RPF", this);
    }
});

/**
 * Remote password field component synchronization peer.
 */
Echo.Sync.RemotePasswordField.Sync = Core.extend(Echo.Sync.PasswordField, {
    
    $load: function() {
        Echo.Render.registerPeer("RPF", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    /** Constructor. */
    $construct: function() {
        this._remoteInit();
    },
    
    /** @see Echo.Sync.TextComponent#getSupportedPartialProperties */
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties(
                Echo.Sync.PasswordField.prototype.getSupportedPartialProperties.call(this));
    },
    
    /** @see Echo.Sync.TextComponent#processBlur */
    processBlur: function(e) {
        Echo.Sync.PasswordField.prototype.processBlur.call(this, e);
        this._remoteBlur();
    },
    
    /** @see Echo.Sync.TextComponent#processFocus */
    processFocus: function(e) {
        Echo.Sync.PasswordField.prototype.processFocus.call(this, e);
        this._remoteFocus();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        Echo.Sync.PasswordField.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.PasswordField.prototype.renderDispose.call(this, update);
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        this._remoteUpdate();
        Echo.Sync.PasswordField.prototype.renderUpdate.call(this, update);
    }
});

/**
 * Remote text area component.
 */
Echo.Sync.RemoteTextArea = Core.extend(Echo.TextArea, {

    /** @see Echo.Component#componentType */
    componentType: "RTA",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RTA", this);
    }
});

/**
 * Remote text area component synchronization peer.
 */
Echo.Sync.RemoteTextArea.Sync = Core.extend(Echo.Sync.TextArea, {
    
    $load: function() {
        Echo.Render.registerPeer("RTA", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    /** Constructor. */
    $construct: function() {
        this._remoteInit();
    },
    
    /** @see Echo.Sync.TextComponent#getSupportedPartialProperties */
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties(
                Echo.Sync.TextArea.prototype.getSupportedPartialProperties.call(this));
    },
    
    /** @see Echo.Sync.TextComponent#processBlur */
    processBlur: function(e) {
        Echo.Sync.TextArea.prototype.processBlur.call(this, e);
        this._remoteBlur();
    },
    
    /** @see Echo.Sync.TextComponent#processFocus */
    processFocus: function(e) {
        Echo.Sync.TextArea.prototype.processFocus.call(this, e);
        this._remoteFocus();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        Echo.Sync.TextArea.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.TextArea.prototype.renderDispose.call(this, update);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        this._remoteUpdate();
        Echo.Sync.TextArea.prototype.renderUpdate.call(this, update);
    }
});

/**
 * Remote text field component.
 */
Echo.Sync.RemoteTextField = Core.extend(Echo.TextField, {

    /** @see Echo.Component#componentType */
    componentType: "RTF",
    
    $load: function() {
        Echo.ComponentFactory.registerType("RTF", this);
    }
});

/**
 * Remote text field component synchronization peer.
 */
Echo.Sync.RemoteTextField.Sync = Core.extend(Echo.Sync.TextField, {
    
    $load: function() {
        Echo.Render.registerPeer("RTF", this);
    },
    
    $include: [ Echo.Sync.RemoteTextComponent._SyncMixins],
    
    /** Constructor. */
    $construct: function() {
        this._remoteInit();
    },
    
    /** @see Echo.Sync.TextComponent#getSupportedPartialProperties */
    getSupportedPartialProperties: function() {
        return this._remoteGetSupportedPartialProperties(
                Echo.Sync.TextField.prototype.getSupportedPartialProperties.call(this));
    },
    
    /** @see Echo.Sync.TextComponent#processBlur */
    processBlur: function(e) {
        Echo.Sync.TextField.prototype.processBlur.call(this, e);
        this._remoteBlur();
    },
    
    /** @see Echo.Sync.TextComponent#processFocus */
    processFocus: function(e) {
        Echo.Sync.TextField.prototype.processFocus.call(this, e);
        this._remoteFocus();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        Echo.Sync.TextField.prototype.renderAdd.call(this, update, parentElement);
        this._remoteAdd();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._remoteDispose();
        Echo.Sync.TextField.prototype.renderDispose.call(this, update);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        this._remoteUpdate();
        Echo.Sync.TextField.prototype.renderUpdate.call(this, update);
    }
});

