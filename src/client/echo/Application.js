/**
 * @fileoverview
 * Application framework main module.
 * Requires Core.
 */

/**
 * @class Namespace for application framework.
 */
EchoApp = { 

    /**
     * Next unique identifier.
     */
    _nextUid: 1,

    /**
     * Generates a unique identifier.  Identifiers are unique for the duration of the existence of this namespace.
     */
    generateUid: function() {
        return this._nextUid++;
    }
};

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
     * Root component instance.
     * This value is read-only.
     * @type EchoApp.Component 
     */
    rootComponent: null,
    
    /** 
     * UpdateManager instance monitoring changes to the application for redraws. 
     * @type EchoApp.Update.Manager
     */
    updateManager: null,
    
    /**
     * FocusManager instance handling application focus behavior.
     * @type EchoApp.FocusManager
     */
    focusManager: null,
    
    /**
     * Creates a new application instance.  
     * @constructor
     */
    $construct: function() {
        this._idToComponentMap = new Core.Arrays.LargeMap();
        this._listenerList = new Core.ListenerList();
        this.rootComponent = new EchoApp.Component();
        this.rootComponent.componentType = "Root";
        this.rootComponent.register(this);
        this._modalComponents = [];
        this.updateManager = new EchoApp.Update.Manager(this);
        this.focusManager = new EchoApp.FocusManager(this);
    },

    /**
     * Adds a ComponentUpdateListener.
     * 
     * @param {Function} l the listener to add
     */
    addComponentUpdateListener: function(l) {
        this._listenerList.addListener("componentUpdate", l);
    },
    
    /**
     * Adds a FocusListener.  Focus listeners will be invoked when the focused
     * component in the application changes.
     * 
     * @param {Function} l the listener to add
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
    
    /**
     * Recurisvely determines the current root component of the modal context.
     *
     * @param {EchoApp.Component} searchComponent (optional) the component from which to search
     *        (this paramater is provided when recursively searching, if omitted the sear
     *        will begin at the root component of the application).
     * @return the current modal context root component
     */
    _findModalContextRoot: function(searchComponent) {
        searchComponent = searchComponent ? searchComponent : this.rootComponent;
        for (var i = searchComponent.children.length - 1; i >= 0; --i) {
            var foundComponent = this._findModalContextRoot(searchComponent.children[i]);
            if (foundComponent) {
                return foundComponent;
            }
        }
        
        if (searchComponent.modalSupport && searchComponent.get("modal")) {
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
        focusedComponent = this.focusManager.find(null, reverse);
        if (focusedComponent != null) {
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
     * @type EchoApp.Component
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
        
    /**
     * Returns the root component of the modal context.
     *
     * @return the root component of the modal context
     */
    getModalContextRoot: function() {
        if (this._modalComponents.length == 0) {
            return null;
        } else if (this._modalComponents.length == 1) {
            return this._modalComponents[0];
        }
        
        return this._findModalContextRoot();
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
            this._listenerList.fireEvent({type: "componentUpdate", parent: parent, propertyName: propertyName, 
                    oldValue: oldValue, newValue: newValue});
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
        if (component.modalSupport && component.get("modal")) {
            this._setModal(component, true);
        }
    },
    
    /**
     * Removes a ComponentUpdateListener.
     * 
     * @param {Function} l the listener to remove
     */
    removeComponentUpdateListener: function(l) {
        this._listenerList.removeListener("componentUpdate", l);
    },
    
    /**
     * Removes a FocusListener.  Focus listeners will be invoked when the focused
     * component in the application changes.
     * 
     * @param {Function} l the listener to remove
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
        
        // Verify new focused component is within modal context.
        if (this._modalComponents.length > 0) {
            var modalContextRoot = this.getModalContextRoot();
            if (!modalContextRoot.isAncestorOf(newValue)) {
                // Reject request to focus component outside of modal context.
                Core.Debug.consoleWrite("not in modal:" + newValue);
                return;
            }
        }
        
        this._focusedComponent = newValue;
        this._listenerList.fireEvent({type: "focus", source: this});
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
        
        // Auto-focus first component in modal context if component is currently focused component is not within modal context.
        if (this._modalComponents.length > 0 && this._focusedComponent) {
            var modalContextRoot = this.getModalContextRoot();
            if (!modalContextRoot.isAncestorOf(this._focusedComponent)) {
                if (modalContextRoot.focusable) {
                    this.setFocusedComponent(modalContextRoot);
                } else {
                    this.setFocusedComponent(this.focusManager.findInParent(modalContextRoot, false));
                }
            }
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
        if (!typeConstructor) {
            throw new Error("Type not registered: " + typeName);
        }
        var component = new typeConstructor();
        component.renderId = renderId;
        return component;
    },
    
    /**
     * Returns the component constructor for the specified type.
     *
     * @param {String} typeName the type name
     * @return the component constructor
     * @type Function
     */
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
        if (this._typeToConstructorMap[typeName]) {
            throw new Error("Type already registered: " + typeName);
        }
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
    
    $load: function() {
        EchoApp.ComponentFactory.registerType("Component", this);
    },

    $abstract: true,
    
    $virtual: {
    
        /**
         * Component type.  This must be set by implementors in order for peer discovery to work properly.
         */
        componentType: "Component",

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
        }
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
     * @type Object
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
     * Array of child components.
     * This value is read-only.  Modifying this array will result in undefined behavior.
     * @type Array
     */
    children: null,
    
    /**
     * Internal style used to store properties set directly on component.
     * @private
     * @type Object
     */
    _localStyle: null,
    
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
        this.children = [];
        this._localStyle = { };
        
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
                    this._localStyle[name] = properties[name];
                    break;
                }
            }
        }
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
            throw new Error("Cannot add child: specified component object is not derived from EchoApp.Component. "
                    + "Parent: " + this + ", Child: " + component);
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
     * @param {Function} eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
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
     * @param event the event to fire
     */
    fireEvent: function(event) {
        if (this._listenerList == null) {
            return;
        }
        this._listenerList.fireEvent(event);
    },
    
    /**
     * Returns an arbitrary property value.
     * 
     * @param {String} name the name of the property
     * @return the property value
     */
    get: function(name) {
        return this._localStyle[name];
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
     * Returns an arbitrary indexed property value.
     * 
     * @param {String} name the name of the property
     * @param {Number} index the index to return
     * @return the property value
     */
    getIndex: function(name, index) {
        var valueArray = this._localStyle[name];
        return valueArray ? valueArray[index] : null;
    },
    
    /**
     * Returns the component layout direction.
     * 
     * @return the component layout direction
     * @type EchoApp.LayoutDirection
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
        return this._localStyle;
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
     * Returns the style assigned to this component, if any.
     * 
     * @return the assigned style
     * @type Object
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
            
            if (this.children != null) {
                // Recursively unregister children.
                for (var i = 0; i < this.children.length; ++i) {
                     this.children[i].register(false); // Recursively unregister children.
                }
            }
            
            // Notify application.
            this.application._unregisterComponent(this);
            
            // Change application focus in the event the focused component is being removed.
            // Note that this is performed after deregistration to ensure any removed modal context is cleared.
            if (this.application._focusedComponent == this) {
                this.application.setFocusedComponent(this.parent);
            }
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
     * Returns the value of a property that should be rendered,
     * based on the value set on this component, in the component's
     * specified style, and/or in the application's stylesheet.
     * 
     * @param {String} name the name of the property
     * @param defaultValue the default value to return if no value is 
     *        specified in an internal property, style, or stylesheet
     * @return the property value
     */
    render: function(name, defaultValue) {
        var value = this._localStyle[name];
        if (value == null) {
            if (this._style != null) {
                value = this._style[name];
            }
            if (value == null && this._styleName && this.application && this.application._styleSheet) {
                var style = this.application._styleSheet.getRenderStyle(this._styleName, this.componentType);
                if (style) {
                    value = style[name];
                }
            }
        }
        return value == null ? defaultValue : value;
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
    renderIndex: function(name, index, defaultValue) {
        var valueArray = this._localStyle[name];
        var value = valueArray ? valueArray[index] : null;
        if (value == null) {
            if (this._style != null) {
                valueArray = this._style[name];
                value = valueArray ? valueArray[index] : null;
            }
            if (value == null && this._styleName && this.application && this.application._styleSheet) {
                var style = this.application._styleSheet.getRenderStyle(this._styleName, this.componentType);
                if (style) {
                    valueArray = style[name];
                    value = valueArray ? valueArray[index] : null;
                }
            }
        }
        return value == null ? defaultValue : value;
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
     * @param {Function} eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
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
     * Sets the value of a property in the internal style.
     * 
     * @param {String} name the name of the property
     * @param value the new value of the property
     */
    set: function(name, newValue) {
        var oldValue = this._localStyle[name];
        this._localStyle[name] = newValue;
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({type: "property", source: this, propertyName: name, 
                    oldValue: oldValue, newValue: newValue});
        }
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue);
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
    setIndex: function(name, index, newValue) {
        var valueArray = this._localStyle[name];
        var oldValue = null;
        if (valueArray) {
            oldValue = valueArray[index];
        } else {
            valueArray = [];
            this._localStyle[name] = valueArray;
        }
        valueArray[index] = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue);
        }
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({type: "property", source: this, propertyName: name, index: index,
                    oldValue: oldValue, newValue: newValue});
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
     * Sets the style of the component.
     * 
     * @param {Object} newValue the new style
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

/**
 * Provides focus management tools for an application.
 */
EchoApp.FocusManager = Core.extend({

    _application: null,

    /**
     * Focus management handler for a specific application instance.
     * One FocusManager is created for each application.
     */
    $construct: function(application) { 
        this._application = application;
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
     * Search order (FORWARD):
     * 
     * (Start on Component)
     * First Child, next sibling, parent
     *
     * Search order (REVERSE):
     * Last Child, previous sibling, parent
     * 
     *
     * @return the Component which should be focused
     * @type EchoApp.Component
     */
    find: function(component, reverse) {
        if (!component) {
            component = this._application.getFocusedComponent();
            if (!component) {
                component = this._application.rootComponent;
            }
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

            if ((reverse && component == originComponent) || (lastComponent && lastComponent.parent == component)) {
                // Searching in reverse on origin component (OR) Previously moved up: do not move down.
            } else {
                var componentCount = component.getComponentCount();
                if (componentCount > 0) {
                    // Attempt to move down.
                    // Next component is first child (searching forward) or last child (searching reverse).
                    nextComponent = component.getComponent(reverse ? componentCount - 1 : 0);
                    if (visitedComponents[nextComponent.renderId]) {
                        // Already visited children, cancel the move.
                        nextComponent = null;
                    }
                }
            }
                
            if (nextComponent == null) {
                // Attempt to move to next/previous sibling.
                if (component.parent) {
                    // Get previous sibling.
                    if (reverse) {
                        var componentIndex = component.parent.indexOf(component);
                        if (componentIndex > 0) {
                            nextComponent = component.parent.getComponent(componentIndex - 1);
                        }
                    } else {
                        var componentIndex = component.parent.indexOf(component);
                        if (componentIndex < component.parent.getComponentCount() - 1) {
                            nextComponent = component.parent.getComponent(componentIndex + 1);
                        }
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
     * Finds next (or previous) focusable descendant of a parent component.
     * This method requires that the application's currently focused component
     * be a descendant of the specified parent component.  The search will
     * be limited to descendants of the parent component, i.e., if a suitable descendant
     * component cannot be found, null will be returned.
     *
     * @param parentComponent the parent component to search
     * @param reverse the search direction, false indicating to search forward, true
     *        indicating reverse
     * @param minimumDistance FIXME
     */
    findInParent: function(parentComponent, reverse, minimumDistance) {
        if (!minimumDistance) {
            minimumDistance = 1;
        }
        
        var focusedComponent = this._application.getFocusedComponent();
        
        var focusedIndex = this._getDescendantIndex(parentComponent, focusedComponent);
        if (focusedIndex == -1) {
            return null;
        }
        
        var componentIndex = focusedIndex;
        var component = focusedComponent;
        do {
            component = this.find(component, reverse);
            if (component == null) {
                return null;
            }
            componentIndex = this._getDescendantIndex(parentComponent, component);
        } while (Math.abs(componentIndex - focusedIndex) < minimumDistance && component != focusedComponent);

        if (component == focusedComponent) {
            // Search wrapped, only one focusable component.
            return null;
        }
        
        this._application.setFocusedComponent(component);
        return component;
    },
    
    _getDescendantIndex: function(parentComponent, descendant) {
        while (descendant.parent != parentComponent && descendant.parent != null) {
            descendant = descendant.parent;
        }
        if (descendant.parent == null) {
            return -1;
        }
        return parentComponent.indexOf(descendant);
    }
});

// Fundamental Property Types

/**
 * Describes the layout direction of text and content to provide support 
 * for bidirectional localization.
 */
EchoApp.LayoutDirection = Core.extend({
    
    /**
     * Flag indicating whether layout direction is left-to-right.
     * @type Boolean 
     */
    _ltr: false,
    
    /**
     * LayoutDirection property.  Do not instantiate, use LTR/RTL constants.
     * @constructor
     */
    $construct: function(ltr) {
        this._ltr = ltr;
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

// StyleSheets

/**
 * @class
 * An application style sheet.
 */
EchoApp.StyleSheet = Core.extend({

    _nameToStyleMap: null,

    _renderCache: null,
    
    /**
     * Creates a new style sheet.
     *
     * @param initialValues an optional mapping between style names 
     *        and maps between component types and styles
     */
    $construct: function(initialValues) {
        this._renderCache = { };
        this._nameToStyleMap = { };
        
        if (initialValues) {
            for (var styleName in initialValues) {
                for (var componentType in initialValues[styleName]) {
                     this.setStyle(styleName, componentType, initialValues[styleName][componentType]);
                }
            }
        }
    },
    
    /**
     * Returns the style that should be used for a component.
     * 
     *  @param {String} name the component's style name
     *  @param {String} componentType the type of the component
     *  @return the style
     *  @type Object
     */
    getRenderStyle: function(name, componentType) {
        // Retrieve style from cache.
        var typeToStyleMap = this._renderCache[name];
        if (!typeToStyleMap) {
            return null;
        }
        var style = typeToStyleMap[componentType];
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
     * @type Object
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
     * @param {Object} the style
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
     * The <code>Manager</code> to which this update belongs.
     * @type Array
     */
    _manager: null,
    
    /**
     * The parent component represented in this <code>ServerComponentUpdate</code>.
     * @type EchoApp.Component
     */
    parent: null,
    
    /**
     * Storage for contextual information used by application container to render this update.
     * Object type and content are specified by the application container, this variable is not
     * used by the application module in any capacity.
     */
    renderContext : null,
    
    /**
     * The set of child Component ids added to the <code>parent</code>.
     * @type Array
     */
    _addedChildIds: null,
    
    /**
     * A mapping between property names of the parent component and 
     * <code>PropertyUpdate</code>s.
     * @type Object
     */
    _propertyUpdates: null,
    
    /**
     * The set of child Component ids removed from the <code>parent</code>.
     * @type Array
     */
    _removedChildIds: null,
    
    /**
     * The set of descendant Component ids which are implicitly removed 
     * as they were children of removed children.
     * @type Array
     */
    _removedDescendantIds: null,

    /**
     * The set of child Component ids whose <code>LayoutData</code> 
     * was updated. 
     * @type Array
     */
    _updatedLayoutDataChildIds: null,

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
            components[i] = this._manager._removedIdMap[this._removedChildIds[i]];
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
            components[i] = this._manager._removedIdMap[this._removedDescendantIds[i]];
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
     *         empty array is returned
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
     * Determines if the set of updated property names is contained
     * within the specified set.  The provided object should have
     * have keys for the desired property names and  values that evaluate 
     * to true, e.g. to determine if no properties other than "text" and "icon"
     * changed, specify {text: true, icon: true}. 
     */
    isUpdatedPropertySetIn: function(updatedPropertySet) {
        for (var x in this._propertyUpdates) {
            if (!updatedPropertySet[x]) {
                return false;
            }
        }
        return true;
    },
    
    /**
     * Records the removal of a child from the parent component.
     * 
     * @param {EchoApp.Component} child the removed child
     * @private
     */
    _removeChild: function(child) {
        this._manager._removedIdMap[child.renderId] = child;
    
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
        this._manager._removedIdMap[descendant.renderId] = descendant;
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
     * Associative mapping between component ids and EchoApp.Update.ComponentUpdate
     * instances.
     * @type Object
     */
    _componentUpdateMap: null,
    
    /**
     * Flag indicating whether a full refresh or incremental update will be performed.
     * @type Boolean
     */
    _fullRefreshRequired: false,
    
    application: null,
    
    /**
     * Flag indicating whether any updates are pending.
     * @type Boolean
     */
    _hasUpdates: true,
    
    _listenerList: null,
    
    /**
     * Associative mapping between component ids and component instances for all
     * updates held in this manager object.
     */
    _idMap: null,
    
    _removedIdMap: null,
    
    /** 
     * The id of the last parent component whose child was analyzed by
     * _isAncestorBeingAdded() that resulted in that method returning false.
     * This id is stored for performance optimization purposes.
     * @type String
     */
    _lastAncestorTestParentId: null,
    
    /**
     * Creates a new Update Manager.
     *
     * @constructor
     * @param {EchoApp.Application} application the supported application
     */
    $construct: function(application) {
        this._componentUpdateMap = { };
        this.application = application;
        this._listenerList = new Core.ListenerList();
        this._idMap = { };
        this._removedIdMap = { };
    },
    
    /**
     * Adds a listener to receive notification of update events.
     * 
     * @param {Function} l the listener to add
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
            this._listenerList.fireEvent({type: "update", source: this});
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
        this._removedIdMap = { };
        this._hasUpdates = false;
        this._lastAncestorTestParentId = null;
    },
    
    /**
     * Removes a listener from receiving notification of update events.
     * 
     * @param {Function} l the listener to remove
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
            this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
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

    $load: function() {
        EchoApp.ComponentFactory.registerType("ToggleButton", this);
        EchoApp.ComponentFactory.registerType("TB", this);
    },

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
    focusable: true,
    
    $virtual: {
        
        /**
         * Programatically performs a list select action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
        }
    }
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

    $static: {
        OVERFLOW_AUTO: 0,
        OVERFLOW_HIDDEN: 1,
        OVERFLOW_SCROLL: 2
    },

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

        /**
         * Constant value for <code>orientation</code> property indicating cells 
         * should be laid out horizontally and then vertically.
         * <code>ORIENTATION_HORIZONTAL</code> is the default orientation setting.
         */
        ORIENTATION_HORIZONTAL: 0,
    
        /**
         * Constant value for <code>orientation</code> property indicating cells 
         * should be laid out vertically and then horizontally. 
         */
        ORIENTATION_VERTICAL: 1,

        /**
         * A constant value for the <code>columnSpan</code> and <code>rowSpan</code>
         * properties of <code>LayoutData</code> objects used by children of a
         * Grid indicating that a cell should fill all remaining cells.  
         * <p>
         * <strong>WARNING</strong>: This value may ONLY be used for spans in the
         * direction of the layout of the <code>Grid</code>, i.e., it may only be 
         * used for column-spans if the orientation is horizontal, and it may only
         * be used for row-spans if the orientation is vertical.
         */
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
        
        DEFAULT_SEPARATOR_POSITION: 100,
        DEFAULT_SEPARATOR_SIZE_FIXED: 0,
        DEFAULT_SEPARATOR_SIZE_RESIZABLE: 4,
        DEFAULT_SEPARATOR_COLOR: "#3f3f4f",
        
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
        DEFAULT_BORDER: { color: "#4f4faf", borderInsets: 20, contentInsets: 3 },
        DEFAULT_BACKGROUND: "#ffffff",
        DEFAULT_FOREGROUND: "#000000",
        DEFAULT_CLOSE_ICON_INSETS: 4,
        DEFAULT_HEIGHT: 200,
        DEFAULT_MINIMUM_WIDTH: 100,
        DEFAULT_MINIMUM_HEIGHT: 100,
        DEFAULT_TITLE_HEIGHT: 30,
        DEFAULT_WIDTH: 400
    },

    componentType: "WindowPane",
    modalSupport: true,
    floatingPane: true,
    pane: true,
    focusable: true,
    
    /**
     * Programmatically perform a window closing operation.
     */
    doWindowClosing: function() {
        this.fireEvent({type: "close", source: this});
    }
});
