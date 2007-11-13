/**
 * @fileoverview
 * Application framework main module.
 * Requires Core.
 */

/**
 * @class Namespace for application framework.
 */
EchoApp = { };

/**
 * @class 
 * Representation of a single application instance.
 * Derived objects must invoke construtor with root component id.
 */
EchoApp.Application = Core.extend({
    
    $abstract: true,

    /** 
     * Mapping between component ids and component instances.
     * @private 
     * @type Core.Arrays.LargeMap
     */
    _idToComponentMap: null,

    /** 
     * ListenerList instance for application-level events.
     * @private 
     * @type Core.ListenerList 
     */
    _listenerList: null,
        
    /** 
     * Array of modal components.
     * This value is read-only.
     * @type Array 
     */
    _modalComponents: null,

    /** 
     * Displayed style sheet.
     * 
     * @private 
     * @type EchoApp.StyleSheet
     */
    _styleSheet: null,
    
    /** 
     * Currently focused component.
     * @private
     * @type EchoApp.Component
     */
    _focusedComponent: null,
    
    /**
     * Creates a new application instance.  
     * @constructor
     */
    $construct: function() {
        
        this._idToComponentMap = new Core.Arrays.LargeMap();
        
        this._listenerList = new Core.ListenerList();
    
        /** 
         * Root component instance.
         * This value is read-only.
         * @type EchoApp.Component 
         */
        this.rootComponent = new EchoApp.Component();
        this.rootComponent.componentType = "Root";
        this.rootComponent.register(this);
        
        this._modalComponents = [];
        
        /** 
         * UpdateManager instance monitoring changes to the application for redraws. 
         * @type EchoApp.Update.Manager
         */
        this.updateManager = new EchoApp.Update.Manager(this);
        
        /**
         * FocusManager instance handling application focus behavior.
         * @type EchoApp.FocusManager
         */
        this.focusManager = new EchoApp.FocusManager(this);
    },

    /**
     * Adds a ComponentUpdateListener.
     * 
     * @param l the listener to add (may be of type Function or Core.MethodRef)
     */
    addComponentUpdateListener: function(l) {
        this._listenerList.addListener("componentUpdate", l);
    },
    
    /**
     * Adds a FocusListener.  Focus listeners will be invoked when the focused
     * component in the application changes.
     * 
     * @param l the listener to add (may be of type Function or Core.MethodRef)
     */
    addFocusListener: function(l) {
        this._listenerList.addListener("focus", l);
    },
    
    /**
     * Disposes of the application.
     * Once invoked, the application will no longer function and cannot be used again.
     * This method will free any resources allocated by the application.
     */ 
    dispose: function() {
        this.updateManager.dispose();
    },
    
    _findCurrentModalComponent: function(searchComponent) {
        for (var i = searchComponent.children.length - 1; i >= 0; --i) {
            var foundComponent = this._findCurrentModalComponent(searchComponent.children[i]);
            if (foundComponent) {
                return foundComponent;
            }
        }
        
        if (searchComponent.modalSupport && searchComponent.getProperty("modal")) {
            return searchComponent;
        }
        
        return null;
    },

    /**
     * Focuses the previous/next component based on the currently focused component.
     * 
     * @param {Boolean} reverse false to focus the next component, true to focus the
     *        previous component
     */
    focusNext: function(reverse) {
        focusedComponent = reverse ? this.focusManager.findPrevious() : this.focusManager.findNext();
        if (focusedComponent == null) {
            //FIXME Focus first or last component
        } else {
            this.setFocusedComponent(focusedComponent);
        }
    },
    
    /**
     * Retrieves the registered component with the specified render id.
     * 
     * @param {String} renderId the render id
     * @return the component
     * @type EchoApp.Component 
     */
    getComponentByRenderId: function(renderId) {
        return this._idToComponentMap.map[renderId];
    },
    
    /**
     * Returns the focused component.
     * 
     * @return the focused component
     * @type {EchoApp.Component}
     */
    getFocusedComponent: function() {
        return this._focusedComponent;
    },
    
    /**
     * Returns the default layout direction of the application.
     *
     * @return the default layout direction
     * @type EchoApp.LayoutDirection 
     */
    getLayoutDirection: function() {
        // FIXME ensure layout direction gets set upon application instantiation
        return this._layoutDirection ? this._layoutDirection : EchoApp.LayoutDirection.LTR;
    },
        
    getModalContextRoot: function() {
        if (this._modalComponents.length == 0) {
            return null;
        } else if (this._modalComponents.length == 1) {
            return this._modalComponents[0];
        }
        
        return this._findCurrentModalComponent(this.rootComponent);
    },
    
    /**
     * Returns the application style sheet.
     * 
     * @return the application style sheet
     * @type EchoApp.StyleSheet
     */
    getStyleSheet: function() {
        return this._styleSheet;
    },
    
    /**
     * Returns the active state of the application.
     * 
     * @return the active state of the application, a value of 
     *         true indicating the application is ready for user
     *         input, a value of false indicating otherwise
     * @type Boolean
     */
    isActive: function() {
        return true;
    },
    
    /**
     * Notifies the application of an update to a component.
     * 
     * @param {EchoApp.Component} parent the parent component
     * @param {String} propertyName the updated property
     * @param oldValue the previous property value
     * @param newValue the new property value
     */
    notifyComponentUpdate: function(parent, propertyName, oldValue, newValue) {
        if (parent.modalSupport && propertyName == "modal") {
            this._setModal(parent, newValue);
        }
        if (this._listenerList.hasListeners("componentUpdate")) {
            this._listenerList.fireEvent(new EchoApp.Application.ComponentUpdateEvent(
                    this, parent, propertyName, oldValue, newValue));
        }
        this.updateManager._processComponentUpdate(parent, propertyName, oldValue, newValue);
    },
    
    /**
     * Registers a component with the application.
     * Invoked when a component is added to a hierarchy of 
     * components that is registered with the application.
     * 
     * @param {EchoApp.Component} component the component to register
     * @private
     */
    _registerComponent: function(component) {
        if (this._idToComponentMap.map[component.renderId]) {
            throw new Error("Component already exists with id: " + component.renderId);
        }
        this._idToComponentMap.map[component.renderId] = component;
        if (component.modalSupport && component.getProperty("modal")) {
            this._setModal(component, true);
        }
    },
    
    /**
     * Removes a ComponentUpdateListener.
     * 
     * @param l the listener to add (may be of type Function or Core.MethodRef)
     */
    removeComponentUpdateListener: function(l) {
        this._listenerList.removeListener("componentUpdate", l);
    },
    
    /**
     * Removes a FocusListener.  Focus listeners will be invoked when the focused
     * component in the application changes.
     * 
     * @param l the listener to remove (may be of type Function or Core.MethodRef)
     */
    removeFocusListener: function(l) {
        this._listenerList.removeListener("focus", l);
    },
    
    /**
     * Sets the focused component
     * 
     * @param {EchoApp.Component} newValue the new focused component
     */
    setFocusedComponent: function(newValue) {
        // If required, find focusable parent containing 'newValue'.
        while (newValue != null && !newValue.focusable) {
            newValue = newValue.parent;
        }
        
        this._focusedComponent = newValue;
        this._listenerList.fireEvent(new Core.Event("focus", this));
    },
    
    /**
     * Sets the application default layout direction.
     * 
     * @param {EchoApp.LayoutDirection} newValue the new layout direction
     */
    setLayoutDirection: function(newValue) {
        this._layoutDirection = newValue;
    },
    
    /**
     * Informs the application of the modal state of a specific component.
     * When modal components are unregistered, this method must be executed
     * in order to avoid a memory leak.
     */
    _setModal: function(component, modal) {
        Core.Arrays.remove(this._modalComponents, component);
        if (modal) {
            this._modalComponents.push(component);
        }
    },
    
    /**
     * Sets the application style sheet.
     * 
     * @param {EchoApp.StyleSheet} newValue the new style sheet
     */
    setStyleSheet: function(newValue) {
        var oldValue = this._styleSheet;
        this._styleSheet = newValue;
    // FIXME updatemanager can't handle this yet.    
    //    this.notifyComponentUpdate(null, "styleSheet", oldValue, newValue);
    },
    
    /**
     * Unregisters a component from the application.
     * This method is invoked when a component is removed from a hierarchy of 
     * components registered with the application.
     * 
     * @param {EchoApp.Component} component the component to remove
     * @private
     */
    _unregisterComponent: function(component) {
        this._idToComponentMap.remove(component.renderId);
        if (component.modalSupport) {
            this._setModal(component, false);
        }
    }
});

/**
 * @class
 * Event object describing an update to a component.
 */
EchoApp.Application.ComponentUpdateEvent = Core.extend(Core.Event, {

    /**
     * Creates an Event object describing an update to a component.
     * 
     * @constructor
     * @param source the generator of the event
     * @param {EchoApp.Component} parent the updated component
     * @param {String} propertyName the updated propery
     * @param oldValue the previous value of the property
     * @param newValue the new value of the property
     */
    $construct: function(source, parent, propertyName, oldValue, newValue) {
        Core.Event.call(this, "componentUpdate", source);
        this.parent = parent;
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
});

/**
 * @class
 * Factory to create new instances of arbitrary components.  This object is 
 * used to instantiate new components during XML deserialization.
 * This is a namespace object, do not instantiate.
 */
EchoApp.ComponentFactory = {
    
    /**
     * Mapping between type names and object constructors.
     * 
     * @type Object
     * @private
     */
    _typeToConstructorMap: {},
    
    /**
     * Creates a new instance of an arbitrary component.
     * 
     * @constructor
     * @param {String} typeName the type name of the component
     * @param {String} renderId the component render id
     * @return a newly instantiated component
     * @type EchoApp.Component
     */
    newInstance: function(typeName, renderId) {
        var typeConstructor = this._typeToConstructorMap[typeName];
        var component = new typeConstructor();
        component.renderId = renderId;
        return component;
    },
    
    getConstructor: function(typeName) {
        return this._typeToConstructorMap[typeName];
    },
    
    /**
     * Determines the super type of a component, based on the type name of the component.
     *
     * @param {String} typeName the component type
     * @return the parent componetn type
     * @type String
     */
    getSuperType: function(typeName) {
        var typeConstructor = this._typeToConstructorMap[typeName];
        if (!typeConstructor) {
            throw new Error("Type not found: " + typeName + ".");
        }
        if (typeConstructor.$super) {
            return typeConstructor.$super.prototype.componentType;
        } else {
            return null;
        }
    },
    
    /**
     * Registers a type name to a specific constructor.
     * 
     * @param typeName the type name
     * @param typeConstructor the constructor
     */
    registerType: function(typeName, typeConstructor) {
        this._typeToConstructorMap[typeName] = typeConstructor;
    }
};

/**
 * @class 
 * Base class for components.
 * Derived classes should always take renderId as the first parameter and pass it to the super-constructor.
 * A component MUST have its componentType property set before it is used in a hierarchy.  Failing to do so
 * will throw an exception and/or result in indeterminate behavior.
 */
EchoApp.Component = Core.extend({
    
    $static: {

        /**
         * The next automatically assigned client render id.
         * @private
         * @type Number
         */
        _nextRenderId: 0
    },
    
    $virtual: {
    
        /**
         * Component type.  This must be set by implementors in order for peer discovery to work properly.
         */
        componentType: null
    },

    /**
     * The render id.
     * This value should be treated as read-only and immutable.
     * @type String
     */
    renderId: null,
    
    /**
     * The parent component.
     * This value is read-only.
     * @type EchoApp.Component
     */
    parent: null,
    
    /**
     * The registered application.
     * This value is read-only.
     * @type EchoApp.Application
     */
    application: null,
    
    /**
     * Listener list.  Lazily created.
     * @private
     * @type Core.ListenerList
     */
    _listenerList: null,
    
    /**
     * Referenced external style
     * @private
     * @type EchoApp.Style
     */
    _style: null,
    
    /**
     * Assigned style name from application-level style sheet.
     * @private
     * @type String
     */
    _styleName: null,

    /**
     * Enabled state of the component (default true).
     * @private
     * @type Boolean
     */
    _enabled: true,
    
    /**
     * Creates a new Component.
     *  
     * @param {String} renderId the render id
     * @param {Object} associative mapping of initial property values (may be null)
     *        By default, all properties will be placed into the local style, except for the following:
     *        <ul>
     *         <li><code>styleName</code> specifies the component stylesheet style name</li>
     *         <li><code>style</code> specifies the referenced component style</li>
     *         <li><code>renderId</code> specifies the render id</li>
     *        </ul>
     * @constructor
     */
    $construct: function(properties) {
        
        /**
         * Array of child components.
         * This value is read-only.  Modifying this array will result in undefined behavior.
         * @type Array
         */
        this.children = [];
        
        var localStyleProperties = null;
        if (properties) {
            for (var name in properties) {
                switch (name) {
                case "style": this._style = properties.style; break;
                case "styleName": this._styleName = properties.styleName; break;
                case "renderId": this._renderId = properties.renderId; break;
                case "children":
                    for (var i = 0; i < properties.children.length; ++i) {
                        this.add(properties.children[i]);
                    }
                    break;
                case "events":
                    for (var eventType in properties.events) {
                        this.addListener(eventType, properties.events[eventType]);
                    }
                    break;
                default:
                    if (localStyleProperties == null) {
                        localStyleProperties = { };
                    }
                    localStyleProperties[name] = properties[name];
                    break;
                }
            }
        }
        
        /**
         * Internal style used to store properties set directly on component.
         * @private
         * @type EchoApp.Style
         */
        this._localStyle = new EchoApp.Style(localStyleProperties);
    },

    /**
     * Adds a component as a child.
     * 
     * @param {EchoApp.Component} component the component to add
     * @param {Number} index the (integer) index at which to add it (optional, omission
     *        will cause component to be appended to end)
     */
    add: function(component, index) {
        if (!(component instanceof EchoApp.Component)) {
            throw new Error("Cannot add child: specified component object is not derived from EchoApp.Component.");
        }
        if (!component.componentType) {
            throw new Error("Cannot add child: specified component object does not have a componentType property. "
                    + "Parent: " + this + ", Child: " + component);
        }
    
        if (component.parent) {
            component.parent.remove(component);
        }
        
        component.parent = this;
            
        if (index == null || index == this.children.length) {
            this.children.push(component);
        } else {
            this.children.splice(index, 0, component);
        }
        
        if (this.application) {
            component.register(this.application);
            this.application.notifyComponentUpdate(this, "children", null, component);
        }
    },
    
    /**
     * Adds an arbitrary event listener.
     * 
     * @param {String} eventType the event type name
     * @param eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
     *        (argument may be of type Function or Core.MethodRef)
     */
    addListener: function(eventType, eventTarget) {
        if (this._listenerList == null) {
            this._listenerList = new Core.ListenerList();
        }
        this._listenerList.addListener(eventType, eventTarget);
        if (this.application) {
            this.application.notifyComponentUpdate(this, "listeners", null, eventType);
        }
    },
    
    /**
     * Provides notification of an arbitrary event.
     * Listeners will be notified based on the event's type property.
     * 
     * @param {Core.Event} event the event to fire
     */
    fireEvent: function(event) {
        if (this._listenerList == null) {
            return;
        }
        this._listenerList.fireEvent(event);
    },
    
    /**
     * Retrieves the child component at the specified index.
     * 
     * @param {Number} index the (integer) index
     * @return the child component
     * @type EchoApp.Component
     */
    getComponent: function(index) {
        return this.children[index];
    },
    
    /**
     * Returns the number of child components
     * 
     * @return the number of child components
     * @type Number
     */
    getComponentCount: function() {
        return this.children.length;
    },
    
    /**
     * Returns the child component at the specified index
     * after sorting the children in the order which they 
     * should be focused.  The default implementation simply
     * returns the same value as getComponent().
     * Implementations should override this method when
     * the natural order to focus child components is
     * different than their normal ordering (e.g., when
     * the component at index 1 is positioned above the 
     * component at index 0).
     * 
     * @param index the index of the child (in focus order)
     * @return the child component
     */
    getFocusComponent: function(index) {
        return this.children[index];
    },
    
    /**
     * Returns an arbitrary indexed property value.
     * 
     * @param {String} name the name of the property
     * @param {Number} index the index to return
     * @return the property value
     */
    getIndexedProperty: function(name, index) {
        return this._localStyle.getIndexedProperty(name, index);
    },
    
    /**
     * Returns the component layout direction.
     * 
     * @return the component layout direction
     * @type {EchoApp.LayoutDirection}
     */
    getLayoutDirection: function() {
        return this._layoutDirection;
    },
    
    /**
     * Retrieves local style property map associations.
     * This method should only be used by a deserialized for
     * the purpose of rapidly loading properties into a new
     * component.
     * 
     * @return the internal style property map associations
     *         (an associative array).
     */
    getLocalStyleData: function() {
        return this._localStyle._properties;
    },
    
    /**
     * Returns an arbitrary property value.
     * 
     * @param {String} name the name of the property
     * @return the property value
     */
    getProperty: function(name) {
        return this._localStyle.getProperty(name);
    },
    
    /**
     * Returns the value of an indexed property that should be rendered,
     * based on the value set on this component, in the component's
     * specified style, and/or in the application's stylesheet.
     * 
     * @param {String} name the name of the property
     * @param {Number} index the (integer) index of the property
     * @param defaultValue the default value to return if no value is 
     *        specified in an internal property, style, or stylesheet
     */
    getRenderIndexedProperty: function(name, index, defaultValue) {
        var value = this.getIndexedProperty(name, index);
        if (value == null) {
            if (this._style != null) {
                value = this._style.getIndexedProperty(name, index);
            }
            if (value == null && this._styleName && this.application && this.application._styleSheet) {
                var style = this.application._styleSheet.getRenderStyle(this._styleName, this.componentType);
                if (style) {
                    value = style.getIndexedProperty(name, index);
                }
            }
        }
        return value == null ? defaultValue : value;
    },
    
    /**
     * Returns the layout direction with which the component should be
     * rendered, based on analyzing the component's layout direction,
     * its parent's, and/or the application's.
     * 
     * @return the rendering layout direction
     * @type EchoApp.LayoutDirection
     */
    getRenderLayoutDirection: function() {
        var component = this;
        while (component) {
            if (component._layoutDirection) {
                return component._layoutDirection;
            }
            component = component.parent;
        }
        if (this.application) {
            return this.application.getLayoutDirection();
        }
        return null;
    },
    
    /**
     * Returns the value of a property that should be rendered,
     * based on the value set on this component, in the component's
     * specified style, and/or in the application's stylesheet.
     * 
     * @param {String} name the name of the property
     * @param defaultValue the default value to return if no value is 
     *        specified in an internal property, style, or stylesheet
     * @return the property value
     */
    getRenderProperty: function(name, defaultValue) {
        var value = this.getProperty(name);
        if (value == null) {
            if (this._style != null) {
                value = this._style.getProperty(name);
            }
            if (value == null && this._styleName && this.application && this.application._styleSheet) {
                var style = this.application._styleSheet.getRenderStyle(this._styleName, this.componentType);
                if (style) {
                    value = style.getProperty(name);
                }
            }
        }
        return value == null ? defaultValue : value;
    },
    
    /**
     * Returns the style assigned to this component, if any.
     * 
     * @return the assigned style
     * @type EchoApp.Style
     */
    getStyle: function() {
        return this._style;
    },
    
    /**
     * Returns the name of the style (from the application's style sheet) 
     * assigned to this component.
     * 
     * @return the style name
     * @type String
     */
    getStyleName: function() {
        return this._styleName;
    },
    
    /**
     * Returns the index of a child component, or -1 if the component
     * is not a child.
     * 
     * @param {EchoApp.Component} component the component
     * @return the index
     * @type Number
     */
    indexOf: function(component) {
        for (var i = 0; i < this.children.length; ++i) {
            if (this.children[i] == component) {
                return i;
            }
        }
        return -1;
    },
    
    /**
     * Determines if the component is active, that is, within the current modal context
     * and ready to receive input.
     * 
     * @return the active state
     * @type Boolean
     */
    isActive: function() {
        // Verify the component and its ancestors are all enabled.
        if (!this.isRenderEnabled()) {
            return false;
        }
        
        // Verify component is registered to an application, and that the application is active.
        if (!this.application || !this.application.isActive()) {
            return false;
        }
        
        // Verify component is in modal context.
        var modalContextRoot = this.application.getModalContextRoot();
        if (modalContextRoot != null && !modalContextRoot.isAncestorOf(this)) {
            return false;
        }
        
        return true;
    },
    
    /**
     * Determines if this component is or is an ancestor of another component.
     * 
     * @param {EchoApp.Component} c the component to test
     * @return true if an ancestor relationship exists
     * @type Boolean
     */
    isAncestorOf: function(c) {
        while (c != null && c != this) {
            c = c.parent;
        }
        return c == this;
    },
    
    /**
     * Determines the enabled state of this component.
     * Use isRenderEnabled() to determine whether a component
     * should be RENDERED as enabled.
     * 
     * @return the enabled state of this specific component
     */
    isEnabled: function() {
        return this._enabled;
    },
    
    /**
     * Determines whether this <code>Component</code> should be rendered with
     * an enabled state.
     * Disabled <code>Component</code>s are not eligible to receive user input.
     * 
     * @return true if the component should be rendered enabled.
     * @type Boolean
     */
    isRenderEnabled: function() {
        var component = this;
        while (component != null) {
            if (!component._enabled) {
                return false;
            }
            component = component.parent;
        }
        return true;
    },
    
    /**
     * Registers / unregisters a component that has been 
     * added/removed to/from a registered hierarchy
     * (a hierarchy that is registered to an application).
     * 
     * @param {EchoApp.Application} application the application 
     *        (null to unregister the component)
     */
    register: function(application) {
        // Sanity check.
        if (application && this.application) {
            throw new Error("Attempt to re-register or change registered application of component.");
        }
    
        if (!application) { // unregistering
            
            // Change application focus in the event the focused component is being removed.
            if (this.application._focusedComponent == this) {
                this.application.setFocusedComponent(this.parent);
            }
            
            if (this.children != null) {
                // Recursively unregister children.
                for (var i = 0; i < this.children.length; ++i) {
                     this.children[i].register(false); // Recursively unregister children.
                }
            }
            
            // Notify application.
            this.application._unregisterComponent(this);
        }
    
        // Link/unlink with application.
        this.application = application;
    
        if (application) { // registering
            
            if (this.renderId == null) {
                this.renderId = "cl_" + ++EchoApp.Component._nextRenderId;
            }
    
            // Notify application.
            this.application._registerComponent(this);
            
            if (this.children != null) {
                // Recursively register children.
                for (var i = 0; i < this.children.length; ++i) {
                     this.children[i].register(application); // Recursively unregister children.
                }
            }
        }
    },
    
    /**
     * Removes a child component.
     * 
     * @param componentOrIndex 
     *        the index of the component to remove, or the component to remove
     *        (values may be of type EchoApp.Component or Number)
     */
    remove: function(componentOrIndex) {
        var component;
        var index;
        if (typeof componentOrIndex == "number") {
            index = componentOrIndex;
            component = this.children[index];
            if (!component) {
                throw new Error("Index out of bounds: " + index);
            }
        } else {
            component = componentOrIndex;
            index = this.indexOf(component);
            if (index == -1) {
                // Component is not a child: do nothing.
                return;
            }
        }
        
        if (this.application) {
            component.register(null);
        }
        
        this.children.splice(index, 1);
        component.parent = null;
        
        if (this.application) {
            this.application.notifyComponentUpdate(this, "children", component, null);
        }
    },
    
    /**
     * Removes all child components.
     */
    removeAll: function() {
        while (this.children.length > 0) {
            this.remove(this.children.length - 1);
        }
    },
    
    /**
     * Removes an arbitrary event listener.
     * 
     * @param {String} eventType the event type name
     * @param eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
     *        (values may be of type Function or Core.MethodRef)
     */
    removeListener: function(eventType, eventTarget) {
        if (this._listenerList == null) {
            return;
        }
        this._listenerList.removeListener(eventType, eventTarget);
        if (this.application) {
            this.application.notifyComponentUpdate(this, "listeners", eventType, null);
        }
    },
    
    /**
     * Sets the enabled state of the component.
     * 
     * @param newValue the new enabled state
     */
    setEnabled: function(newValue) {
        var oldValue = this._enabled;
        this._enabled = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "enabled", oldValue, newValue);
        }
    },
    
    /** 
     * Sets the value of an indexed property in the internal style.
     * 
     * @param {String} name the name of the property
     * @param {Number} index the index of the property
     * @param newValue the new value of the property
     */
    setIndexedProperty: function(name, index, newValue) {
        var oldValue = this._localStyle.getIndexedProperty(name, index);
        this._localStyle.setIndexedProperty(name, index, newValue);
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue);
        }
    },
    
    /**
     * Sets a component-specific layout direction.
     * 
     * @param {EchoApp.LayoutDirection} newValue the new layout direction
     */
    setLayoutDirection: function(newValue) {
        this._layoutDirection = newValue;
    },
    
    /** 
     * Sets the value of a property in the internal style.
     * 
     * @param {String} name the name of the property
     * @param value the new value of the property
     */
    setProperty: function(name, newValue) {
        var oldValue = this._localStyle.getProperty(name);
        this._localStyle.setProperty(name, newValue);
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            var e = new Core.Event("property", this);
            e.propertyName = name;
            e.oldValue = oldValue;
            e.newValue = newValue;
            this._listenerList.fireEvent(e);
        }
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue);
        }
    },
    
    /**
     * Sets the style of the component.
     * 
     * @param {EchoApp.Style} newValue the new style
     */
    setStyle: function(newValue) {
        var oldValue = this._style;
        this._style = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "style", oldValue, newValue);
        }
    },
    
    /**
     * Sets the name of the style (from the application's style sheet) 
     * assigned to this component.
     * 
     * @param {String} newValue the style name
     */
    setStyleName: function(newValue) {
        var oldValue = this._styleName;
        this._styleName = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "styleName", oldValue, newValue);
        }
    },
    
    /**
     * Returns a string representation of the component (default implementation).
     * 
     * @param {Boolean} longFormat an optional flag specifying whether all information about
     *        the component should be displayed (e.g., property values)
     * @return a string representation of the component
     * @type String
     */
    toString: function(longFormat) {
        var out = this.renderId + "/" + this.componentType;
        if (longFormat) {
            out += "\n";
            var componentCount = this.getComponentCount();
            out += this.renderId + "/properties:" + this._localStyle + "\n";
            for (var i = 0; i < componentCount; ++i) {
                var component = this.getComponent(i);
                out += this.renderId + "/child:" + component.renderId + "\n";
                out += component.toString(true);
            }
        }
        return out;
    }
});

EchoApp.FocusManager = Core.extend({

    /**
     * Focus management handler for a specific application instance.
     * One FocusManager is created for each application.
     */
    $construct: function(application) { 
        this._application = application;
    },
    
    /**
     * Focuses next (or previous) child of a parent component.
     * If the next immediate child is not focusable, its descendants will
     * be investigated and the first focusable descendant will be focused. 
     */
    focusNextChild: function(parentComponent, reverse) {
        var childComponent = this._application.getFocusedComponent();
        
        // Determine which child of the parentComponent is focused, or which child has
        // a focused descendant.
        while (childComponent.parent != parentComponent && childComponent.parent != null) {
            childComponent = childComponent.parent;
        }
        if (childComponent.parent == null) {
            return false;
        }
        var index = parentComponent.indexOf(childComponent);
    
        if (reverse) {
            while (index > 0) {
                --index;
                childComponent = parentComponent.getComponent(index);
                if (childComponent.focusable && childComponent.isActive()) {
                    this._application.setFocusedComponent(childComponent);
                    return true;
                }
            }
            return false;
        } else {
            var count = parentComponent.getComponentCount();
            while (index < count - 1) {
                ++index;
                childComponent = parentComponent.getComponent(index);
                if (childComponent.focusable && childComponent.isActive()) {
                    this._application.setFocusedComponent(childComponent);
                    return true;
                }
            }
            return false;
        }
    },
    
    /**
     * Searches the component hierarchy for the next component that should
     * be focused (based on the currently focused component).
     * Container components are queried to determine the order in which their
     * children should naturally be focused (certain components, e.g., SplitPanes,
     * will have a child focus order that may be different from the order of their 
     * children).
     * This search is depth first.
     * 
     * @return the Component which should be focused
     * @type EchoApp.Component
     */
    findNext: function() {
        /** The component that is currently being analyzed */
        var component = this._application.getFocusedComponent();
        if (component == null) {
            component = this._application.rootComponent;
        }
        
        /** The component which is currently focused by the application. */
        var originComponent = component;
        
        /** An associative array containing the ids of all previously visited components. */
        var visitedComponents = { };
        
        /** The value of 'component' on the previous iteration. */
        var lastComponent = null;
        
        while (true) {
            /** The candidate next component to be focused */
            var nextComponent = null;
            
            if (component.getComponentCount() > 0) {
                if (lastComponent && lastComponent.parent == component) {
                    // Previously moved up: do not move down.
                } else {
                    // Attempt to move down.
                    nextComponent = component.getComponent(0);
    
                    if (visitedComponents[nextComponent.renderId]) {
                        // Already visited children, cancel the move.
                        nextComponent = null;
                    }
                }
            }
            
            if (nextComponent == null) {
                // Attempt to move right.
    
                // Verify component is not root.
                if (component.parent) {
                    // Get next sibling.
                    var componentIndex = component.parent.indexOf(component);
                    if (componentIndex < component.parent.getComponentCount() - 1) {
                        nextComponent = component.parent.getComponent(componentIndex + 1);
                    }
                }
            }
            
            if (nextComponent == null) {
                // Attempt to move up.
                nextComponent = component.parent;
            }
            
            if (nextComponent == null) {
                return null;
            }
            
            lastComponent = component;
            component = nextComponent;
            visitedComponents[component.renderId] = true;
            
            if (component != originComponent && component.isActive() && component.focusable) {
                return component;
            }
        }
    },
    
    /**
     * Searches the component hierarchy for the previous component that should
     * be focused (based on the currently focused component).
     * Container components are queried to determine the order in which their
     * children should naturally be focused (certain components, e.g., SplitPanes,
     * will have a child focus order that may be different from the order of their 
     * children).
     * This search is depth first.
     * 
     * @return the Component which should be focused
     * @type EchoApp.Component
     */
    findPrevious: function() {
        /** The component that is currently being analyzed */
        var component = this._application.getFocusedComponent();
        if (component == null) {
            component = this._application.rootComponent;
        }
        
        /** The component which is currently focused by the application. */
        var originComponent = component;
        
        /** An associative array containing the ids of all previously visited components. */
        var visitedComponents = { };
        
        /** The value of 'component' on the previous iteration. */
        var lastComponent = null;
        
        while (true) {
            /** The candidate next component to be focused */
            var nextComponent = null;
            
            if (component == originComponent || (lastComponent && lastComponent.parent == component)) {
                // On origin component (OR) Previously moved up: do not move down.
            } else {
                var componentCount = component.getComponentCount();
                if (componentCount > 0) {
                    // Attempt to move down.
                    nextComponent = component.getComponent(componentCount - 1);
                    if (visitedComponents[nextComponent.renderId]) {
                        // Already visited children, cancel the move.
                        nextComponent = null;
                    }
                }
            }
            
            if (nextComponent == null) {
                // Attempt to move left.
                if (component.parent) {
                    // Get previous sibling.
                    var componentIndex = component.parent.indexOf(component);
                    if (componentIndex > 0) {
                        nextComponent = component.parent.getComponent(componentIndex - 1);
                    }
                }
            }
            
            if (nextComponent == null) {
                // Move up.
                nextComponent = component.parent;
            }
            
            if (nextComponent == null) {
                return null;
            }
    
            lastComponent = component;
            component = nextComponent;
            visitedComponents[component.renderId] = true;
            
            if (component != originComponent && component.isActive() && component.focusable) {
                return component;
            }
        }
    }
});

// Fundamental Property Types

EchoApp.LayoutData = Core.extend({
    
    /**
     * Layout Data Object, describing how a child component is rendered/laid out 
     * within its parent container.
     * 
     * @param properties an associative array containing the initial properties of the layout data
     * @constructor
     */
    $construct: function(properties) {
        this._localStyle = new EchoApp.Style(properties);
    },
    
    /**
     * Retrieves an indexed property value.
     * 
     * @param {String} name the name of the property
     * @param {Number} the (integer) property index
     */
    getIndexedProperty: function(name, index) {
        return this._localStyle.getIndexedProperty(name, index);
    },
    
    /**
     * Retrieves a property value.
     * 
     * @param {String} name the name of the property
     * @return the property value
     */
    getProperty: function(name) {
        return this._localStyle.getProperty(name);
    },
    
    /**
     * Sets an indexed property value.
     * 
     * @param {String} name the name of the property
     * @param {Number} the (integer) property index
     * @param newValue the new property value
     */
    setIndexedProperty: function(name, index, newValue) {
        this._localStyle.setIndexedProperty(name, index, newValue);
    },
    
    /**
     * Sets a property value.
     * 
     * @param {String} name the name of the property
     * @param value the new property value
     */
    setProperty: function(name, newValue) {
        this._localStyle.setProperty(name, newValue);
    }
});

EchoApp.LayoutDirection = Core.extend({
    
    /**
     * LayoutDirection property.  Do not instantiate, use LTR/RTL constants.
     * @constructor
     */
    $construct: function() {
    
        /**
         * Flag indicating whether layout direction is left-to-right.
         * @type Boolean 
         */
        this._ltr = arguments[0];
    },

    /**
     * Determines if the layout direction is left-to-right.
     * 
     * @return true if the layout direction is left-to-right
     * @type Boolean
     */
    isLeftToRight: function() {
        return this._ltr;
    }
});

/**
 * Global instance representing a left-to-right layout direction.
 * @type EchoApp.LayoutDirection
 * @final
 */
EchoApp.LayoutDirection.LTR = new EchoApp.LayoutDirection(true);

/**
 * Global instance representing a right-to-left layout direction.
 * @type EchoApp.LayoutDirection
 * @final
 */
EchoApp.LayoutDirection.RTL = new EchoApp.LayoutDirection(false);

EchoApp.Alignment = Core.extend({
    
    $static: {
    
        /**
         * Value for horizontal/vertical setting indicating default alignment.
         * @type Number
         * @final
         */
        DEFAULT: 0,
        
        /**
         * Value for horizontal setting indicating leading alignment
         * (actual value will be left or right, depending on layout direction).
         * @type Number
         * @final
         */
        LEADING: 1,
        
        /**
         * Value for horizontal setting indicating trailing alignment
         * (actual value will be left or right, depending on layout direction).
         * @type Number
         * @final
         */
        TRAILING: 2,
        
        /**
         * Value for horizontal setting indicating left alignment.
         * @type Number
         * @final
         */
        LEFT: 3,
        
        /**
         * Value for horizontal/vertical setting indicating centered alignment.
         * @type Number
         * @final
         */
        CENTER: 4,
        
        /**
         * Value for horizontal setting indicating right alignment.
         * @type Number
         * @final
         */
        RIGHT: 5,
        
        /**
         * Value for vertical setting indicating top alignment.
         * @type Number
         * @final
         */
        TOP: 6,
        
        /**
         * Value for vertical setting indicating bottom alignment.
         * @type Number
         * @final
         */
        BOTTOM: 7
    },

    /**
     * Creates an alignment property.
     *
     * @class Alignment property.
     * @param {Number} horizontal the horizontal alignment setting, one of the 
     *        following values:
     *        <ul>
     *         <li>EchoApp.Alignment.DEFAULT</li>
     *         <li>EchoApp.Alignment.LEADING</li>
     *         <li>EchoApp.Alignment.TRAILING</li>
     *         <li>EchoApp.Alignment.LEFT</li>
     *         <li>EchoApp.Alignment.CENTER</li>
     *         <li>EchoApp.Alignment.RIGHT</li>
     *        </ul>
     * @param {Number} vertical the vertical alignment setting, one of the 
     *        following values:
     *        <ul>
     *         <li>EchoApp.Alignment.DEFAULT</li>
     *         <li>EchoApp.Alignment.TOP</li>
     *         <li>EchoApp.Alignment.CENTER</li>
     *         <li>EchoApp.Alignment.BOTTOM</li>
     *        </ul>
     * @constructor
     */
    $construct: function(horizontal, vertical) {
    
        /**
         * The horizontal alignment setting.
         * @type {Number}
         */
        this.horizontal = horizontal ? horizontal : 0;
    
        /**
         * The vertical alignment setting.
         * @type {Number}
         */
        this.vertical = vertical ? vertical : 0;
    },
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Alignment"
});

/**
 * @class Border property.
 */
EchoApp.Border = Core.extend({

    /**
     * Creates a border property. 
     * @constructor
     */
    $static: {
    
        /**
         * @class Border side sub-property.
         */
        Side: Core.extend({
            
            /**
             * Creates a border side.
             * @constructor
             */
            $construct: function() {
                if (arguments.length == 1 && typeof arguments[0] == "string") {
                    var items = arguments[0].split(" ");
                    if (items.length != 3) {
                        throw new Error("Invalid border string: " + arguments[0]);
                    }
                    
                    /** 
                     * Border side size
                     * @type EchoApp.Extent
                     */ 
                    this.size = new EchoApp.Extent(items[0]);
                    
                    /** 
                     * Border side style
                     * @type Number
                     */ 
                    this.style = items[1];
            
                    /** 
                     * Border side color
                     * @type EchoApp.Color
                     */ 
                    this.color = new EchoApp.Color(items[2]);
                }
            }
        })
    },

    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Border",
    
    $construct: function() {
        if (arguments.length == 1 && arguments[0] instanceof Array) {
            /**
             * Flag indicating whether the border has individually specified sides.
             * @type Boolean
             */
            this.multisided = true;
            
            /**
             * Array of Border.Side objects, specifying top, right, bottom, and left
             * sides in that order.
             * @type Array
             */
            this.sides = arguments[0];
            
            /**
             * Default border size (used by components that do not support borders
             * with individually specified sides, or in the case of a border that
             * does not individually specify sides).
             * @type EchoApp.Extent
             */
            this.size = this.sides[0].size;
    
            /**
             * Default border style (used by components that do not support borders
             * with individually specified sides, or in the case of a border that
             * does not individually specify sides).
             * @type Number
             */
            this.style = this.sides[0].style;
    
            /**
             * Default border color (used by components that do not support borders
             * with individually specified sides, or in the case of a border that
             * does not individually specify sides).
             * @type EchoApp.Color
             */
            this.color = this.sides[0].color;
        } else if (arguments.length == 1 && typeof arguments[0] == "string") {
            this.multisided = false;
            var items = arguments[0].split(" ");
            if (items.length != 3) {
                throw new Error("Invalid border string: " + arguments[0]);
            }
            this.size = new EchoApp.Extent(items[0]);
            this.style = items[1];
            this.color = new EchoApp.Color(items[2]);
        } else if (arguments.length == 3) {
            this.multisided = false;
            this.size = arguments[0];
            this.style = arguments[1];
            this.color = arguments[2];
        }
    }
});

/**
 * @class 
 * A representation of a group of RadioButtons, where only one may be selected at a time.
 */
EchoApp.ButtonGroup = Core.extend({

    /**
     * Creates a RadioButton group.
     * 
     * @param id {String} the id
     */
    $construct: function(id) {
        this._id = id;
        this._buttonArray = [];
    },
    
    /**
     * Gets the id of this button group.
     * 
     * @return the id.
     * @type {String}
     */
    getId: function() {
        return this._id;
    },
    
    /**
     * Adds the specified button to this button group.
     *
     * @param button {EchoRender.ComponentSync.ToggleButton} the button
     */
    add: function(button) {
        this._buttonArray.push(button);
    },
    
    /**
     * Deselects all buttons in this button group.
     */
    deselect: function() {
        for (var i = 0; i < this._buttonArray.length; ++i) {
            this._buttonArray[i].setSelected(false);
        }
    },
    
    /**
     * Removes the specified button from this button group.
     * 
     * @param button {EchoRender.ComponentSync.ToggleButton} the button
     */
    remove: function(button) {
        // Find index of button in array.
        var arrayIndex = -1;
        for (var i = 0; i < this._buttonArray.length; ++i) {
            if (this._buttonArray[i] == button) {
                arrayIndex = i;
                break;
            }
        }
        
        if (arrayIndex == -1) {
            // Button does not exist in group.
            throw new Error("No such button: " + button.component.renderId);
        }
        
        if (this._buttonArray.length == 1) {
            // Array will now be empty.
            this._buttonArray = [];
        } else {
            // Buttons remain, remove button from button group.
            this._buttonArray[arrayIndex] = this._buttonArray[this._buttonArray.length - 1];
            this._buttonArray.length = this._buttonArray.length - 1;
        }
    },

    /**
     * Gets the amount of buttons contained by this button group.
     * 
     * @return the number of buttons.
     * @type {Number}
     */
    size: function() {
        return this._buttonArray.length;
    }
});

/**
 * @class Color property.
 */
EchoApp.Color = Core.extend({
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Color",
    
    /**
     * Creates a color property.
     * @constructor
     * @param value the color hex value
     */
    $construct: function(value) {
        /**
         * The hexadecimal value of the color, e.g., #ab12c3.
         * @type String
         */
        this.value = value;
    },
    
    /**
     * Adjusts the value of the color's RGB values by the
     * specified amounts, returning a new Color.
     * The original color is unchanged.
     * 
     * @param r the amount to adjust the red value of the color (-255 to 255)
     * @param g the amount to adjust the green value of the color (-255 to 255)
     * @param b the amount to adjust the blue value of the color (-255 to 255)
     * @return a new adjusted color
     */
    adjust: function(r, g, b) {
        var colorInt = parseInt(this.value.substring(1), 16);
        var red = parseInt(colorInt / 0x10000) + r;
        if (red < 0) {
            red = 0;
        } else if (red > 255) {
            red = 255;
        }
        var green = parseInt(colorInt / 0x100) % 0x100 + g;
        if (green < 0) {
            green = 0;
        } else if (green > 255) {
            green = 255;
        }
        var blue = colorInt % 0x100 + b;
        if (blue < 0) {
            blue = 0;
        } else if (blue > 255) {
            blue = 255;
        }
        return new EchoApp.Color("#"
                + (red < 16 ? "0" : "") + red.toString(16)
                + (green < 16 ? "0" : "") + green.toString(16)
                + (blue < 16 ? "0" : "") + blue.toString(16)); 
    },
    
    /**
     * Returns the red value of the color.
     * 
     * @return the red value (0-255)
     * @type Integer
     */
    getRed: function() {
        var colorInt = parseInt(this.value.substring(1), 16);
        return parseInt(colorInt / 0x10000);
    },
    
    /**
     * Returns the green value of the color.
     * 
     * @return the green value (0-255)
     * @type Integer
     */
    getGreen: function() {
        var colorInt = parseInt(this.value.substring(1), 16);
        return parseInt(colorInt / 0x100) % 0x100;
    },
    
    /**
     * Returns the blue value of the color.
     * 
     * @return the blue value (0-255)
     * @type Integer
     */
    getBlue: function() {
        var colorInt = parseInt(this.value.substring(1), 16);
        return colorInt % 0x100;
    }
});

/**
 * @class Extent property.
 */
EchoApp.Extent = Core.extend({

    $static: {
        
        /**
         * Regular expression to parse string based extents, e.g., "20px".
         * Returned part 1 is the value, part 2 is the units (or blank).
         */
        _PATTERN: /^(-?\d+(?:\.\d+)?)(.+)?$/
    },
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Extent",

    /**
     * Creates a new Extent property.  
     * This method takes multiple configurations of arguments.
     * <p>
     * Configuration 1: Extent (string)
     * extentString the value of the extent as a string 
     * <p>
     * Configuration 2: Extent(value, units)
     * value the numeric value portion of the extent 
     * units the units of the extent, e.g. "%" or "px"
     * 
     * @constructor
     */
    $construct: function() {
        if (arguments.length == 2) {
            /**
             * The dimensionless value of the extent, e.g., 30.
             * @type Number 
             */
            this.value = arguments[0];
            /**
             * The dimension of the extent, e.g., "px", "%", or "in"/
             * @type String
             */
            this.units = arguments[1];
        } else {
            var parts = EchoApp.Extent._PATTERN.exec(arguments[0]);
            if (!parts) {
                throw new Error("Invalid Extent: " + arguments[0]);
            }
            this.value = parseFloat(parts[1]);
            this.units = parts[2] ? parts[2] : "px";
        }
    },
    
    /**
     * Returns a string representation.
     * 
     * @return a string representation
     * @type String
     */
    toString: function() {
        return this.value + this.units;
    }
});

/**
 * @class FillImage property.  Describes a repeating image, typically used as a background.
 */
EchoApp.FillImage = Core.extend({

    $static: {
    
        /**
         * Repeat value constant indicating the image should not repeat.
         * @type Number
         * @final
         */
        NO_REPEAT: 0,
        
        /**
         * Repeat value constant indicating the image should repeat horizontally.
         * @type Number
         * @final
         */
        REPEAT_HORIZONTAL: 1,
        
        /**
         * Repeat value constant indicating the image should repeat vertically.
         * @type Number
         * @final
         */
        REPEAT_VERTICAL: 2,
        
        /**
         * Repeat value constant indicating the image should repeat horizontally and vertically.
         * @type Number
         * @final
         */
        REPEAT:3 
    },

    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "FillImage",

    /**
     * Creates a FillImage property.
     * 
     * @param {EchoApp.ImageReference} the image (may also be a string,
     *        at which point an ImageReference will be automatically constructed
     *        with the string as its URL).
     * @param {Number} repeat the image repeat mode, one of the following values:
     *        <ul>
     *         <li>EchoApp.FillImage.NO_REPEAT</li>
     *         <li>EchoApp.FillImage.REPEAT_HORIZONTAL</li>
     *         <li>EchoApp.FillImage.REPEAT_VERTICAL</li>
     *         <li>EchoApp.FillImage.REPEAT</li>
     *        </ul>
     *         
     * @param {EchoApp.Extent} the horizontal alignment/position of the image
     * @param {EchoApp.Extent} the vertical alignment/position of the image
     * @constructor
     */
    $construct: function(image, repeat, x, y) {
        if (image instanceof EchoApp.ImageReference) {
            /**
             * The image.
             * @type EchoApp.ImageReference
             */
            this.image = image;
        } else {
            this.image = new EchoApp.ImageReference(image);
        }
        /**
         * The repeat configuration, one of the following values:
         * <ul>
         *  <li>EchoApp.FillImage.NO_REPEAT</li>
         *  <li>EchoApp.FillImage.REPEAT_HORIZONTAL</li>
         *  <li>EchoApp.FillImage.REPEAT_VERTICAL</li>
         *  <li>EchoApp.FillImage.REPEAT</li>
         * </ul>
         * @type Number
         */
        this.repeat = repeat;
        if (x == null || x instanceof EchoApp.Extent) {
            /**
             * The horizontal aligment/position of the image.
             * @type EchoApp.Extent
             */
            this.x = x;
        } else {
            this.x = new EchoApp.Extent(x);
        }
        if (y == null || y instanceof EchoApp.Extent) {
            /**
             * The vertical aligment/position of the image.
             * @type EchoApp.Extent
             */
            this.y = y;
        } else {
            this.y = new EchoApp.Extent(y);
        }
    }
});

/**
 * @class
 * FillImageBorder property.  A border which is rendered using FillImages to
 * represent each side and each corner, and with configurable Insets to define 
 * the border size. 
 */
EchoApp.FillImageBorder = Core.extend({
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "FillImageBorder",

    /**
     * Creates a FillImageBorder
     * 
     * @param {EchoApp.Color} color the border background color (specify null to enable
     *        a transparent background, such that alpha-rendered PNGs will render properlty)
     * @param {EchoApp.Insets} borderInsets describes the width and 
     *        height of the border images, i.e. the inset to which the border images
     *        extend inward from the outer edges of the box
     * @param {EchoApp.Insets} contentInsets describes the inset of
     *        the content displayed within the border  (if the content inset is less
     *        than the border inset, the content will be drawn above the border)    
     * @constructor
     */
    $construct: function(color, borderInsets, contentInsets, fillImages) {
        if (color == null || color instanceof EchoApp.Color) {
            /**
             * The border background color.
             * @type EchoApp.Color
             */
            this.color = color;
        } else {
            this.color = new EchoApp.Color(color);
        }
        if (borderInsets == null || borderInsets instanceof EchoApp.Insets) {
            /**
             * The border insets 
             * (effectively defines the sizes of the cells where the border FillImages are rendered).
             * @type EchoApp.Insets 
             */
            this.borderInsets = borderInsets;
        } else {
            this.borderInsets = new EchoApp.Insets(borderInsets);
        }
        if (contentInsets == null || contentInsets instanceof EchoApp.Insets) {
            /**
             * The content insets (defines the content area inside of the border, if smaller than the
             * border insets, the content will overlap the border).
             * 
             * @type EchoApp.Insets 
             */
            this.contentInsets = contentInsets;
        } else {
            this.contentInsets = new EchoApp.Insets(contentInsets);
        }
        
        /**
         * An array containing eight fill images, specifying the images used for the
         * top-left, top, top-right, left, right, bottom-left, bottom, and bottom-right
         * images in that order.
         * @type Array
         */
        this.fillImages = fillImages ? fillImages : new Array(8);
    }
});

/**
 * @class Font property
 */
EchoApp.Font = Core.extend({

    $static: {
    
        /**
         * Style constant representing a plain font.
         * @type Number
         * @final
         */
        PLAIN: 0x0,
        
        /**
         * Style constant representing a bold font.
         * @type Number
         * @final
         */
        BOLD: 0x1,
        
        /**
         * Style constant representing a italic font.
         * @type Number
         * @final
         */
        ITALIC: 0x2,
        
        /**
         * Style constant representing an underlined font.
         * @type Number
         * @final
         */
        UNDERLINE: 0x4,
        
        /**
         * Style constant representing an overlined font.
         * @type Number
         * @final
         */
        OVERLINE: 0x8,
        
        /**
         * Style constant representing a line-through (strikethrough) font.
         * @type Number
         * @final
         */
        LINE_THROUGH: 0x10
    },
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Font",

    /**
     * Creates a Font property.
     * 
     * @param typeface the typeface of the font, may be a string or an array of strings
     * @param {Number} style the style of the font, one or more of the following values ORed together:
     *        <ul>
     *         <li>EchoApp.Font.PLAIN</li>
     *         <li>EchoApp.Font.BOLD</li>
     *         <li>EchoApp.Font.ITALIC</li>
     *         <li>EchoApp.Font.UNDERLINE</li>
     *         <li>EchoApp.Font.OVERLINE</li>
     *         <li>EchoApp.Font.LINE_THROUGH</li>
     *        </ul>
     * @param {EchoApp.Extent} size the size of the font
     * @constructor
     */
    $construct: function(typeface, style, size) {
        
        /**
         * The typeface of the font, may be a string or an array of strings.
         */
        this.typeface = typeface;
        
        /**
         * The style of the font, one or more of the following values ORed together:
         * <ul>
         *  <li>EchoApp.Font.PLAIN</li>
         *  <li>EchoApp.Font.BOLD</li>
         *  <li>EchoApp.Font.ITALIC</li>
         *  <li>EchoApp.Font.UNDERLINE</li>
         *  <li>EchoApp.Font.OVERLINE</li>
         *  <li>EchoApp.Font.LINE_THROUGH</li>
         * </ul>
         * @type Number
         */
        this.style = style;
        
        if (typeof size == "number") {
            /**
             * The size of the font.
             * 
             * @type EchoApp.Extent
             */
            this.size = new Extent(size);
        } else {
            this.size = size;
        }
    }
});

/**
 * @class Image Reference Property.
 */
EchoApp.ImageReference = Core.extend({
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "ImageReference",

    /**
     * Creates a new Image Reference.
     * 
     * @param {String} url the URL from which the image may be obtained
     * @param {EchoApp.Extent} width the width of the image
     * @param {EchoApp.Extent} height the height of the image
     * @constructor
     */
    $construct: function(url, width, height) {
        /**
         * The URL from which the image may be obtained.
         * @type String
         */
        this.url = url;
        
        /**
         * The width of the image.
         * @type EchoApp.Extent
         */
        this.width = width;
    
        /**
         * The height of the image.
         * @type EchoApp.Extent
         */
        this.height = height;
    }
});

/**
 * @class Insets property.  Describes inset margins within a box.
 */
EchoApp.Insets = Core.extend({
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "Insets",
 
    /**
     * Creates a new Insets Property.
     * 
     * This method takes multiple parameter configurations:
     * <ul>
     *  <li>A string may be passed providing extent values for 1-4 sides of the inset,
     *   in the following order: top, right, bottom, left.  Any values not specified will
     *   be derived from the value representing the opposite side inset.</li>
     *  <li>Additionally, 1-4 values may be provided in the form of Extents or String,
     *   representing each side of the Insets.</li>
     * </ul> 
     * 
     * @constructor
     */
    $construct: function() {
        var values;
        if (arguments.length == 1) {
            if (typeof arguments[0] == "string") {
                values = arguments[0].split(" ");
            } else if (arguments[0] instanceof Array) {
                values = arguments[0];
            } else {
                values = arguments;
            }
        } else {
            values = arguments;
        }
    
        for (var i = 0; i < values.length; ++i) {
            if (!(values[i] instanceof EchoApp.Extent)) {
                values[i] = new EchoApp.Extent(values[i]);
            }
        }
        
        switch (values.length) {
        case 1:
            this.top = this.left = this.right = this.bottom = values[0];
            break;
        case 2:
            this.top = this.bottom = values[0];
            this.right = this.left = values[1];
            break;
        case 3:
            this.top = values[0];
            this.right = this.left = values[1];
            this.bottom = values[2];
            break;
        case 4:
            /**
             * The top inset size.
             * @type EchoApp.Extent
             */
            this.top = values[0];
            /**
             * The right inset size.
             * @type EchoApp.Extent
             */
            this.right = values[1];
            /**
             * The bottom inset size.
             * @type EchoApp.Extent
             */
            this.bottom = values[2];
            /**
             * The left inset size.
             * @type EchoApp.Extent
             */
            this.left = values[3];
            break;
        default:
            throw new Error("Invalid Insets construction parameters: " + values);
        }
    },
    
    /**
     * Returns a string representation.
     * 
     * @return a string representation
     * @type String
     */
    toString: function() {
        return this.top + " " + this.right + " " + this.bottom + " " + this.left;
    }
});

/**
 * @class Minimalistic representation of ListSelectionModel.
 */
 
EchoApp.ListSelectionModel = Core.extend({

    $static: {
    
        /**
         * Value for selection mode setting indicating single selection.
         * 
         * @type Number
         * @final
         */
        SINGLE_SELECTION: 0,
        
        /**
         * Value for selection mode setting indicating multiple selection.
         * 
         * @type Number
         * @final
         */
        MULTIPLE_SELECTION: 2
    },
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "ListSelectionModel",

    /**
     * Creates a ListSelectionModel.
     * 
     * @param {Number} selectionMode the selectionMode
     * @constructor
     *
     */
    $construct: function(selectionMode) {
        this._selectionState = [];
        this._selectionMode = selectionMode;
    },
    
    /**
     * Returns the selection mode. 
     * 
     * @return the selection mode
     * @type Number
     */
    getSelectionMode: function() {
        return this._selectionMode;
    },
    
    /**
     * Determines whether an index is selected.
     * 
     * @param {Number} index the index
     * @return true if the index is selected
     * @type Boolean
     */
    isSelectedIndex: function(index) {
        if (this._selectionState.length <= index) {
            return false;
        } else {
            return this._selectionState[index];
        }
    },
    
    /**
     * Sets the selection state of the given index.
     * 
     * @param {Number} index the index
     * @param {Boolean} selected the new selection state
     */
    setSelectedIndex: function(index, selected) {
        this._selectionState[index] = selected;
    },
    
    //FIXME remove this method, it belongs in serialization code.  
    //Expand the ListSelectionModel API to provide capability to do this externally.
    /**
     * Gets a comma-delimited list containing the selected indices.
     * 
     * @return the list
     * @type String
     */
    getSelectionString: function() {
        var selection = "";
        for (var i = 0; i < this._selectionState.length; i++) {
            if (this._selectionState[i]) {
                if (selection.length > 0) {
                    selection += ",";
                }
                selection += i;
            }
        }
        return selection;
    }
});

// Styles and StyleSheets

/**
 * @class Component Style.
 */
EchoApp.Style = Core.extend({ 

    /**
     * Creates a new Component Syle.
     *
     * @param properties (optional) the initial property mapping as an associative array
     * @constructor
     */
    $construct: function(properties) {
        this._properties = properties ? properties : { };
    },
    
    /**
     * Returns the value of an indexed property.
     * 
     * @param {String} name the name of the property
     * @param {Number} the (integer) index of the property
     * @return the property value  
     */
    getIndexedProperty: function(name, index) {
        var indexValues = this._properties[name];
        if (!indexValues) {
            return null;
        }
        return indexValues[index];
    },
    
    /**
     * Returns the value of a property.
     * 
     * @param {String} name the name of the property
     * @return the property value  
     */
    getProperty: function(name) {
        return this._properties[name];
    },
    
    /**
     * Sets the value of an indexed property.
     * 
     * @param {String} name the name of the property
     * @param {Number} the (integer) index of the property
     * @param value the new value of the property 
     */
    setIndexedProperty: function(name, index, value) {
        var indexValues = this._properties[name];
        if (!indexValues) {
            indexValues = [];
            this._properties[name] = indexValues;
        }
        indexValues[index] = value;
    },
    
    /**
     * Sets the value of a property.
     * 
     * @param {String} name the name of the property
     * @param value the new value of the property 
     */
    setProperty: function(name, newValue) {
        this._properties[name] = newValue;
    },
    
    /**
     * Returns a string representation.
     * 
     * @return a string representation
     * @type String
     */
    toString: function() {
        var outArray = [];
        for (var x in this._properties) {
            outArray.push(x + "=" + this._properties[x]);
        }
        return outArray.toString();
    }
});

/**
 * @class
 * An application style sheet.
 */
EchoApp.StyleSheet = Core.extend({

    _nameToStyleMap: null,

    _renderCache: null,
    
    /**
     * Creates a new style sheet.
     */
    $construct: function() {
        this._nameToStyleMap = { };
        this._renderCache = {};
    },
    
    /**
     * Returns the style that should be used for a component.
     * 
     *  @param {String} name the component's style name
     *  @param {String} componentType the type of the component
     *  @return the style
     *  @type EchoApp.Style
     */
    getRenderStyle: function(name, componentType) {
        // Retrieve style from cache.
        var style = this._renderCache[name][componentType];
        if (style !== undefined) {
            // If style found in cache, return immediately.
            return style;
        } else {
            return this._loadRenderStyle(name, componentType);
        }
    },
    
    _loadRenderStyle: function(name, componentType) {
        // Retrieve value (type-to-style-map) from name-to-style-map with specified name key.
        var typeToStyleMap = this._nameToStyleMap[name];
        if (typeToStyleMap == null) {
            // No styles available for specified name, mark cache entry as null and return null.
            this._renderCache[name][componentType] = null;
            return null;
        }
        
        // Retrieve style for specific componentType.
        style = typeToStyleMap[componentType];
        if (style == null) {
            var testType = componentType;
            while (style == null) {
                // Search super types of testType to find style until found.
                testType = EchoApp.ComponentFactory.getSuperType(testType);
                if (testType == null) {
                    // No style available for component type, mark cache entry as null and return null.
                    this._renderCache[name][testType] = null;
                    return null;
                }
                style = typeToStyleMap[testType];
            }
        }
        this._renderCache[name][componentType] = style;
        return style;
    },
    
    /**
     * Retrieves a specific style from the style sheet.
     * 
     * @param {String} name the style name
     * @param {String} componentType the component type
     * @return the style
     * @type EchoApp.Style
     */
    getStyle: function(name, componentType) {
        var typeToStyleMap = this._nameToStyleMap[name];
        if (typeToStyleMap == null) {
            return null;
        }
        return typeToStyleMap[componentType];
    },
    
    /**
     * Stores a style in the style sheet.
     * 
     * @param {String} name the style name
     * @param {String} componentType the component type
     * @param {EchoApp.Style} the style
     */
    setStyle: function(name, componentType, style) {
        // Create or clear cache entry for name.
        this._renderCache[name] = {};
        
        var typeToStyleMap = this._nameToStyleMap[name];
        if (typeToStyleMap == null) {
            typeToStyleMap = {};
            this._nameToStyleMap[name] = typeToStyleMap;
        }
        typeToStyleMap[componentType] = style;
    }
});

// Update Management

/**
 * Namespace for update management.  Non-instantiable object.
 * Provides capabilities for storing property changes made to applications and components
 * such that display redraws may be performed efficiently. 
 */
EchoApp.Update = { };

/**
 * @class Representation of an update to a single existing component 
 *        which is currently rendered on the screen.
 */
EchoApp.Update.ComponentUpdate = Core.extend({

    $static: {
    
        /**
         * Data object representing the old and new states of a changed property.
         *
         * @param oldValue the old value of the property
         * @param newValue the new value of the property
         */
        PropertyUpdate: function(oldValue, newValue) {
            this.oldValue = oldValue;
            this.newValue = newValue;
        }
    },

    /**
     * Creates a new ComponentUpdate.
     * 
     * @constructor
     * @param parent the updated component
     */
    $construct: function(manager, parent) {
    
        /**
         * The <code>Manager</code> to which this update belongs.
         * @type Array
         */
        this._manager = manager;
        
        /**
         * The parent component represented in this <code>ServerComponentUpdate</code>.
         * @type EchoApp.Component
         */
        this.parent = parent;
    
        /**
         * The set of child Component ids added to the <code>parent</code>.
         * @type Array
         */
        this._addedChildIds = null;
        
        /**
         * A mapping between property names of the parent component and 
         * <code>PropertyUpdate</code>s.
         * @type Object
         */
        this._propertyUpdates = null;
        
        /**
         * The set of child Component ids removed from the <code>parent</code>.
         * @type Array
         */
        this._removedChildIds = null;
        
        /**
         * The set of descendant Component ids which are implicitly removed 
         * as they were children of removed children.
         * @type Array
         */
        this._removedDescendantIds = null;
    
        /**
         * The set of child Component ids whose <code>LayoutData</code> 
         * was updated. 
         * @type Array
         */
        this._updatedLayoutDataChildIds = null;
    },
    
    /**
     * Records the addition of a child to the parent component.
     * 
     * @param {EchoApp.Component} child the added child
     * @private
     */
    _addChild: function(child) {
        if (!this._addedChildIds) {
            this._addedChildIds = [];
        }
        this._addedChildIds.push(child.renderId);
        this._manager._idMap[child.renderId] = child;
    },
    
    /**
     * Appends removed children and descendants from another update to this
     * update as removed descendants.
     * This method is invoked when a component is removed that is an ancestor
     * of a component that has an update in the update manager.
     * 
     * @private
     * @param {EchoApp.Update.CompoenntUpdate} update the update from which to pull 
     *        removed components/descendants
     */
    _appendRemovedDescendants: function(update) {
        // Append removed descendants.
        if (update._removedDescendantIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = [];
            }
            for (var x in update._removedDescendantIds) {
                this._removedDescendantIds.push(x);
            }
        }
        
        // Append removed children.
        if (update._removedChildIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = [];
            }
            for (var x in update._removedChildIds) {
                this._removedDescendantIds.push(x);
            }
        }
        
        if (this._removedDescendantIds != null) {
    	    Core.Arrays.removeDuplicates(this._removedDescendantIds);
        }
    },
    
    /**
     * Returns an array containing the children added in this update,
     * or null if none were added.
     * 
     * @return the added children
     * @type Array
     */
    getAddedChildren: function() {
        if (!this._addedChildIds) {
            return null;
        }
        var components = new Array(this._addedChildIds.length);
        for (var i = 0; i < this._addedChildIds.length; ++i) {
            components[i] = this._manager._idMap[this._addedChildIds[i]];
        }
        return components;
    },
    
    /**
     * Returns an array containing the children removed in this update,
     * or null if none were removed.
     * 
     * @return the removed children
     * @type Array
     */
    getRemovedChildren: function() {
        if (!this._removedChildIds) {
            return null;
        }
        var components = new Array(this._removedChildIds.length);
        for (var i = 0; i < this._removedChildIds.length; ++i) {
            components[i] = this._manager._idMap[this._removedChildIds[i]];
        }
        return components;
    },
    
    /**
     * Returns an array containing the descendants of any children removed in
     * this update, or null if none were removed.  The removed children
     * themselves are not returned by this method.
     * 
     * @return the removed descendants
     * @type Array
     */
    getRemovedDescendants: function() {
        if (!this._removedDescendantIds) {
            return null;
        }
        var components = new Array(this._removedDescendantIds.length);
        for (var i = 0; i < this._removedDescendantIds.length; ++i) {
            components[i] = this._manager._idMap[this._removedDescendantIds[i]];
        }
        return components;
    },
    
    /**
     * Returns an array containing the children of this component whose
     * LayoutDatas have changed in this update, or null if no such
     * changes were made.
     * 
     * @return the updated layout data children
     * @type Array
     */
    getUpdatedLayoutDataChildren: function() {
        if (!this._updatedLayoutDataChildIds) {
            return null;
        }
        var components = new Array(this._updatedLayoutDataChildIds.length);
        for (var i = 0; i < this._updatedLayoutDataChildIds.length; ++i) {
            components[i] = this._manager._idMap[this._updatedLayoutDataChildIds[i]];
        }
        return components;
    },
    
    /**
     * Determines if any children were added during this update.
     * 
     * @return true if any children were added
     * @type Boolean
     */
    hasAddedChildren: function() {
        return this._addedChildIds != null;
    },
    
    /**
     * Determines if any children were removed during this update.
     * 
     * @return true if any children were removed
     * @type Boolean
     */
    hasRemovedChildren: function() {
        return this._removedChildIds != null;
    },
    
    /**
     * Determines if any children had their LayoutData changed during this update.
     * 
     * @return true if any children had their LayoutData changed
     * @type Boolean
     */
    hasUpdatedLayoutDataChildren: function() {
        return this._updatedLayoutDataChildIds != null;
    },
    
    /**
     * Determines if this update has any changed properties.
     * 
     * @return true if properties are being updated
     * @type Boolean
     */
    hasUpdatedProperties: function() {
        return this._propertyUpdates != null;
    },
    
    /**
     * Returns a <code>PropertyUpdate</code> describing an update to the
     * property with the given <code>name</code>.
     * 
     * @param name the name of the property being updated
     * @return the <code>PropertyUpdate</code>, or null if none exists
     */
    getUpdatedProperty: function(name) {
        if (this._propertyUpdates == null) {
        	return null;
        }
        return this._propertyUpdates[name];
    },
    
    /**
     * Returns the names of all properties being updated in this update.
     * 
     * @return the names of all updated properties, if no properties are updated an
     * 		empty array is returned
     * @type Array
     */
    getUpdatedPropertyNames: function() {
        if (this._propertyUpdates == null) {
        	return [];
        }
        var updatedPropertyNames = [];
        for (var i in this._propertyUpdates) {
        	updatedPropertyNames.push(i);
        }
        return updatedPropertyNames;
    },
    
    /**
     * Records the removal of a child from the parent component.
     * 
     * @param {EchoApp.Component} child the removed child
     * @private
     */
    _removeChild: function(child) {
        this._manager._idMap[child.renderId] = child;
    
        if (this._addedChildIds) {
            // Remove child from add list if found.
            Core.Arrays.remove(this._addedChildIds, child.renderId);
        }
        
        if (this._updatedLayoutDataChildIds) {
            // Remove child from updated layout data list if found.
            Core.Arrays.remove(this._updatedLayoutDataChildIds, child.renderId);
        }
    
        if (!this._removedChildIds) {
            this._removedChildIds = [];
        }
        
        this._removedChildIds.push(child.renderId);
    
        for (var i = 0; i < child.children.length; ++i) {
            this._removeDescendant(child.children[i]);
        }
    },
    
    /**
     * Records the removal of a descendant of the parent component.
     * All children of a removed compoennt are recorded as removed
     * descendants when the child is removed.
     * This method will recursively invoke itself on children of
     * the specified descendant.
     * 
     * @private
     * @param {EchoApp.Component} descendant the removed descendant 
     */
    _removeDescendant: function(descendant) {
        this._manager._idMap[descendant.renderId] = descendant;
        if (!this._removedDescendantIds) {
            this._removedDescendantIds = [];
        }
        this._removedDescendantIds.push(descendant.renderId);
        for (var i = 0; i < descendant.children.length; ++i) {
            this._removeDescendant(descendant.children[i]);
        }
    },
    
    /**
     * Returns a string representation.
     * 
     * @return a string representation
     * @type String
     */
    toString: function() {
        var s = "ComponentUpdate\n";
        s += "- Parent: " + this.parent + "\n";
        s += "- Adds: " + this._addedChildIds + "\n";
        s += "- Removes: " + this._removedChildIds + "\n";
        s += "- DescendantRemoves: " + this._removedDescendantIds + "\n";
        s += "- Properties: " + this._propertyUpdates + "\n";
        s += "- LayoutDatas: " + this._updatedLayoutDataChildIds + "\n";
        return s;
    },
    
    /**
     * Records the update of the LayoutData of a child component.
     * 
     * @param the child component whose layout data was updated
     * @private
     */
    _updateLayoutData: function(child) {
        this._manager._idMap[child.renderId] = child;
    	if (this._updatedLayoutDataChildIds == null) {
    		this._updatedLayoutDataChildIds = [];
    	}
    	this._updatedLayoutDataChildIds.push(child.renderId);
    },
    
    /**
     * Records the update of a property of the parent component.
     * 
     * @param propertyName the name of the property
     * @param oldValue the previous value of the property
     * @param newValue the new value of the property
     * @private
     */
   _updateProperty: function(propertyName, oldValue, newValue) {
        if (this._propertyUpdates == null) {
            this._propertyUpdates = { };
        }
    	var propertyUpdate = new EchoApp.Update.ComponentUpdate.PropertyUpdate(oldValue, newValue);
    	this._propertyUpdates[propertyName] = propertyUpdate;
    }
});

/**
 * @class Monitors and records updates made to the application between repaints.
 *        Provides API to determine changes to component hierarchy since last update
 *        in order to efficiently repaint the screen.
 */
EchoApp.Update.Manager = Core.extend({
    
    /**
     * Creates a new Update Manager.
     *
     * @constructor
     * @param {EchoApp.Application} application the supported application
     */
    $construct: function(application) {
        
        /**
         * Associative mapping between component ids and EchoApp.Update.ComponentUpdate
         * instances.
         * @type Object
         */
        this._componentUpdateMap = { };
    
        /**
         * Flag indicating whether a full refresh or incremental update will be performed.
         * @type Boolean
         */
        this.fullRefreshRequired = false;
        
        this.application = application;
    
        /**
         * Flag indicating whether any updates are pending.
         * @type Boolean
         */
        this._hasUpdates = true;
        
        this._listenerList = new Core.ListenerList();
        
        /**
         * Associative mapping between component ids and component instances for all
         * updates held in this manager object.
         */
        this._idMap = { };
    
        /** 
         * The id of the last parent component whose child was analyzed by
         * _isAncestorBeingAdded() that resulted in that method returning false.
         * This id is stored for performance optimization purposes.
         * @type String
         */
        this._lastAncestorTestParentId = null;
    },
    
    /**
     * Adds a listener to receive notification of update events.
     * 
     * @param l the listener to add (may be a function or Core.MethodRef)
     */
    addUpdateListener: function(l) {
        this._listenerList.addListener("update", l);
    },
    
    /**
     * Creates a new ComponentUpdate object (or returns an existing one) for a
     * specific parent component.
     * 
     * @private
     * @param {EchoApp.Component} parent the parent Component
     * @return a ComponentUpdate instance for that Component
     * @type EchoApp.Update.ComponentUpdate 
     */
    _createComponentUpdate: function(parent) {
        this._hasUpdates = true;
        var update = this._componentUpdateMap[parent.renderId];
        if (!update) {
            update = new EchoApp.Update.ComponentUpdate(this, parent);
            this._componentUpdateMap[parent.renderId] = update;
        }
        return update;
    },
    
    /**
     * Permanently disposes of the Update Manager, freeing any resources.
     */
    dispose: function() {
        this.application = null;
    },
    
    /**
     * Notifies update listeners of an event.
     * 
     * @private
     */
    _fireUpdate: function() {
        if (!this._listenerList.isEmpty()) {
            var e = new Core.Event("update", this);
            this._listenerList.fireEvent(e);
        }
    },
    
    /**
     * Returns the current pending updates.  Returns null in the event that that no pending updates exist.
     * 
     * @return an array containing all component updates (as EchoApp.Update.ComponentUpdates)
     * @type Array
     */
    getUpdates: function() {
        var updates = [];
        for (var key in this._componentUpdateMap) {
            updates.push(this._componentUpdateMap[key]);
        }
        return updates;
    },
    
    /**
     * Determines if any updates exist in the Update Manager.
     * 
     * @return true if any updates are present
     * @type Boolean
     */
    hasUpdates: function() {
        return this._hasUpdates;
    },
    
    /**
     * Determines if an ancestor of the specified component is being added.
     * 
     * @private
     * @param {EchoApp.Component} component the component to evaluate
     * @return true if the component or an ancestor of the component is being added
     * @type Boolean
     */
    _isAncestorBeingAdded: function(component) {
        var child = component;
        var parent = component.parent;
        
        var originalParentId = parent ? parent.renderId : null;
        if (originalParentId && this._lastAncestorTestParentId == originalParentId) {
            return false;
        }
        
        while (parent) {
            var update = this._componentUpdateMap[parent.renderId];
            if (update && update._addedChildIds) {
                for (var i = 0; i < update._addedChildIds.length; ++i) {
                    if (update._addedChildIds[i] == child.renderId) {
                        return true;
                    }
                }
            }
            child = parent;
            parent = parent.parent;
        }
        
        this._lastAncestorTestParentId = originalParentId;
        return false;
    },
    
    /**
     * Processes a child addition to a component.
     * 
     * @private
     * @param {EchoApp.Component} parent the parent component
     * @param {EchoApp.Component} child the added child component
     */
    _processComponentAdd: function(parent, child) {
        if (this.fullRefreshRequired) {
            return;
        }
        if (this._isAncestorBeingAdded(child)) {
            return;
        };
        var update = this._createComponentUpdate(parent);
        update._addChild(child);
    },
    
    /**
     * Process a layout data update to a child component.
     * 
     * @private
     * @param {EchoApp.Component} updatedComponent the updated component
     */
    _processComponentLayoutDataUpdate: function(updatedComponent) {
        if (this.fullRefreshRequired) {
            return;
        }
        var parent = updatedComponent.parent;
        if (parent == null || this._isAncestorBeingAdded(parent)) {
            return;
        }
        var update = this._createComponentUpdate(parent);
        update._updateLayoutData(updatedComponent);
    },
    
    /**
     * Processes a child removal from a component.
     * 
     * @private
     * @param {EchoApp.Component} parent the parent component
     * @param {EchoApp.Component} child the removed child component
     */
    _processComponentRemove: function(parent, child) {
        if (this.fullRefreshRequired) {
            return;
        }
        if (this._isAncestorBeingAdded(parent)) {
            return;
        }
        var update = this._createComponentUpdate(parent);
        update._removeChild(child);
        
        var disposedIds = null;
        
        // Search updated components for descendants of removed component.
        // Any found descendants will be removed and added to this update's
        // list of removed components.
        for (var testParentId in this._componentUpdateMap) {
             var testUpdate = this._componentUpdateMap[testParentId];
             if (child.isAncestorOf(testUpdate.parent)) {
                 update._appendRemovedDescendants(testUpdate);
                 if (disposedIds == null) {
                     disposedIds = [];
                 }
                 disposedIds.push(testParentId);
             }
        }
        
        if (disposedIds != null) {
            for (var i = 0; i < disposedIds.length; ++i) {
                delete this._componentUpdateMap[disposedIds[i]];
            }
        }
    },
    
    /**
     * Processes a property update to a component.
     * 
     * @private
     * @component {EchoApp.Component} the updated component
     * @propertyName {String} the updated property name
     * @oldValue the previous value of the property
     * @newValue the new value of the property
     */
    _processComponentPropertyUpdate: function(component, propertyName, oldValue, newValue) {
    	if (this.fullRefreshRequired) {
    		return;
    	}
    	if (this._isAncestorBeingAdded(component)) {
    		return;
    	}
    	var update = this._createComponentUpdate(component);
    	update._updateProperty(propertyName, oldValue, newValue);
    },
    
    /**
     * Processes component updates received from the application instance.
     */
    _processComponentUpdate: function(parent, propertyName, oldValue, newValue) {
        if (propertyName == "children") {
            if (newValue == null) {
                this._processComponentRemove(parent, oldValue);
            } else {
                this._processComponentAdd(parent, newValue);
            }
        } else if (propertyName == "layoutData") {
            this._processComponentLayoutDataUpdate(parent, oldValue, newValue);
        } else {
            this._processComponentPropertyUpdate(parent, propertyName, oldValue, newValue);
        }
        this._fireUpdate();
    },
    
    /**
     * Purges all updates from the manager.
     * Invoked after the client has repainted the screen.
     */
    purge: function() {
        this.fullRefreshRequired = false;
        this._componentUpdateMap = { };
        this._idMap = { };
        this._hasUpdates = false;
        this._lastAncestorTestParentId = null;
    },
    
    /**
     * Removes a listener from receiving notification of update events.
     * 
     * @param l the listener to remove (may be a function or Core.MethodRef)
     */
    removeUpdateListener: function(l) {
        this._listenerList.removeListener("update", l);
    },
    
    /**
     * Returns a string representation.
     * 
     * @return a string representation
     * @type String
     */
    toString: function() {
        var s = "[ UpdateManager ]\n";
        if (this.fullRefreshRequired) {
            s += "fullRefresh";
        } else {
    		for (var key in this._componentUpdateMap) {
    			s += this._componentUpdateMap[key];
    		}
        }
        return s;
    }
});

// Built-in Component Object Definitions

EchoApp.AbstractButton = Core.extend(EchoApp.Component, {

    $abstract: true,
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("AbstractButton", this);
        EchoApp.ComponentFactory.registerType("AB", this);
    },

    componentType: "AbstractButton",
    focusable: true,
    
    $virtual: {
        
        /**
         * Programatically performs a button action.
         */
        doAction: function() {
            var e = new Core.Event("action", this, this.getProperty("actionCommand"));
            this.fireEvent(e);
        }
    }
});

/**
 * @class Button component.
 * @base EchoApp.Component
 */ 
EchoApp.Button = Core.extend(EchoApp.AbstractButton, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Button", this);
        EchoApp.ComponentFactory.registerType("B", this);
    },

    componentType: "Button"
});

/**
 * @class ToggleButton component.
 * @base EchoApp.Button
 */
EchoApp.ToggleButton = Core.extend(EchoApp.AbstractButton, {

    $abstract: true,
    componentType: "ToggleButton"
});

/**
 * @class CheckBox component.
 * @base EchoApp.ToggleButton
 */
EchoApp.CheckBox = Core.extend(EchoApp.ToggleButton, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("CheckBox", this);
        EchoApp.ComponentFactory.registerType("CB", this);
    },

    componentType: "CheckBox"
});

/**
 * @class RadioButton component.
 * @base EchoApp.ToggleButton
 */
EchoApp.RadioButton = Core.extend(EchoApp.ToggleButton, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("RadioButton", this);
        EchoApp.ComponentFactory.registerType("RB", this);
    },

    componentType: "RadioButton"
});

/**
 * @class AbstractListComponent base component.
 * @base EchoApp.Component
 */
EchoApp.AbstractListComponent = Core.extend(EchoApp.Component, {

    $abstract: true,

    $load: function() {
        EchoApp.ComponentFactory.registerType("AbstractListComponent", this);
        EchoApp.ComponentFactory.registerType("LC", this);
    },

    componentType: "AbstractListComponent",
    focusable: true
});

/**
 * @class ListBox component.
 * @base EchoApp.AbstractListComponent
 */
EchoApp.ListBox = Core.extend(EchoApp.AbstractListComponent, {

    $static: {

        /**
         * Constant for "selectionMode" property indicating single selection.
         */
        SINGLE_SELECTION: 0,
        
        /**
         * Constant for "selectionMode" property indicating multiple selection.
         */
        MULTIPLE_SELECTION: 2
    },

    $load: function() {
        EchoApp.ComponentFactory.registerType("ListBox", this);
        EchoApp.ComponentFactory.registerType("LB", this);
    },

    componentType: "ListBox"
});

/**
 * @class SelectField component.
 * @base EchoApp.AbstractListComponent
 */
EchoApp.SelectField = Core.extend(EchoApp.AbstractListComponent, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("SelectField", this);
        EchoApp.ComponentFactory.registerType("SF", this);
    },

    componentType: "SelectField"
});

/**
 * @class Column component.
 * @base EchoApp.Component
 */
EchoApp.Column = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Column", this);
        EchoApp.ComponentFactory.registerType("C", this);
    },

    componentType: "Column"
});

/**
 * @class Composite component.
 * @base EchoApp.Component
 */
EchoApp.Composite = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Composite", this);
        EchoApp.ComponentFactory.registerType("CM", this);
    },

    componentType: "Composite"
});

/**
 * @class Panel component.
 * @base EchoApp.Composite
 */
EchoApp.Panel = Core.extend(EchoApp.Composite, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Panel", this);
        EchoApp.ComponentFactory.registerType("P", this);
    },

    componentType: "Panel"
});

/**
 * @class ContentPane component.
 * @base EchoApp.Component
 */
EchoApp.ContentPane = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("ContentPane", this);
        EchoApp.ComponentFactory.registerType("CP", this);
    },

    componentType: "ContentPane",
    pane: true
});

/**
 * @class Grid component.
 * @base EchoApp.Component
 */
EchoApp.Grid = Core.extend(EchoApp.Component, {

    $static: {
        SPAN_FILL: -1
    },

    $load: function() {
        EchoApp.ComponentFactory.registerType("Grid", this);
        EchoApp.ComponentFactory.registerType("G", this);
    },

    componentType: "Grid"
});

/**
 * @class Label component.
 * @base EchoApp.Component
 */
EchoApp.Label = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Label", this);
        EchoApp.ComponentFactory.registerType("L", this);
    },

    componentType: "Label"
});

/**
 * @class Row component.
 * @base EchoApp.Component
 */
EchoApp.Row = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("Row", this);
        EchoApp.ComponentFactory.registerType("R", this);
    },

    componentType: "Row"
});

/**
 * @class SplitPane component.
 * @base EchoApp.Component
 */
EchoApp.SplitPane = Core.extend(EchoApp.Component, {

    $static: {
        ORIENTATION_HORIZONTAL_LEADING_TRAILING: 0,
        ORIENTATION_HORIZONTAL_TRAILING_LEADING: 1,
        ORIENTATION_HORIZONTAL_LEFT_RIGHT: 2,
        ORIENTATION_HORIZONTAL_RIGHT_LEFT: 3,
        ORIENTATION_VERTICAL_TOP_BOTTOM: 4,
        ORIENTATION_VERTICAL_BOTTOM_TOP: 5,
        
        DEFAULT_SEPARATOR_POSITION: new EchoApp.Extent("100px"),
        DEFAULT_SEPARATOR_SIZE_FIXED: new EchoApp.Extent("0px"),
        DEFAULT_SEPARATOR_SIZE_RESIZABLE: new EchoApp.Extent("4px"),
        DEFAULT_SEPARATOR_COLOR: new EchoApp.Color("#3f3f4f"),
        
        OVERFLOW_AUTO: 0,
        OVERFLOW_HIDDEN: 1,
        OVERFLOW_SCROLL: 2
    },

    $load: function() {
        EchoApp.ComponentFactory.registerType("SplitPane", this);
        EchoApp.ComponentFactory.registerType("SP", this);
    },

    componentType: "SplitPane",
    pane: true
});

/**
 * @class Abstract base class for text components.
 * @base EchoApp.Component
 */
EchoApp.TextComponent = Core.extend(EchoApp.Component, {

    $abstract: true,

    $load: function() {
        EchoApp.ComponentFactory.registerType("TextComponent", this);
        EchoApp.ComponentFactory.registerType("TC", this);
    },

    componentType: "TextComponent",
    focusable: true
});

/**
 * @class TextArea component.
 * @base EchoApp.Component
 */
EchoApp.TextArea = Core.extend(EchoApp.TextComponent, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("TextArea", this);
        EchoApp.ComponentFactory.registerType("TA", this);
    },

    componentType: "TextArea"
});

/**
 * @class TextField component.
 * @base EchoApp.Component
 */
EchoApp.TextField = Core.extend(EchoApp.TextComponent, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("TextField", this);
        EchoApp.ComponentFactory.registerType("TF", this);
    },

    componentType: "TextField"
});

/**
 * @class PasswordField component.
 * @base EchoApp.Component
 */
EchoApp.PasswordField = Core.extend(EchoApp.TextField, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("PasswordField", this);
        EchoApp.ComponentFactory.registerType("PF", this);
    },
    
    componentType: "PasswordField"
});

/**
 * @class WindowPane component.
 * @base EchoApp.Component
 */
EchoApp.WindowPane = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("WindowPane", this);
        EchoApp.ComponentFactory.registerType("WP", this);
    },

    $static: {
        DEFAULT_BORDER: new EchoApp.FillImageBorder("#4f4faf", new EchoApp.Insets("20px"), new EchoApp.Insets("3px")),
        DEFAULT_BACKGROUND: new EchoApp.Color("#ffffff"),
        DEFAULT_FOREGROUND: new EchoApp.Color("#000000"),
        DEFAULT_CLOSE_ICON_INSETS: new EchoApp.Insets("4px"),
        DEFAULT_HEIGHT: new EchoApp.Extent("200px"),
        DEFAULT_MINIMUM_WIDTH: new EchoApp.Extent("100px"),
        DEFAULT_MINIMUM_HEIGHT: new EchoApp.Extent("100px"),
        DEFAULT_TITLE_HEIGHT: new EchoApp.Extent("30px"),
        DEFAULT_WIDTH: new EchoApp.Extent("400px")
    },

    componentType: "WindowPane",
    modalSupport: true,
    floatingPane: true,
    pane: true,
    
    /**
     * Programmatically perform a window closing operation.
     */
    doWindowClosing: function() {
        var e = new Core.Event("close", this);
        this.fireEvent(e);
    }
});