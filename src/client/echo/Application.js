/**
 * @fileoverview
 * Application framework main module.
 * Requires Core.
 */

/**
 * Main namespace of Echo framework.
 * @namespace
 */
Echo = { };

/**
 * Representation of a single application instance.
 * Derived objects must invoke constructor with root component id.
 * 
 * @event componentUpdate An event fired when any component within the application is updated.
 *        Listening for this event may degrade the performance of an application, due to the
 *        frequency with which it will be fired.
 * @event focus An event fired when the focused component of the application changes.
 * @event modal An event fired when the modal state of the application changes.
 */
Echo.Application = Core.extend({
    
    $static: {

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
    },
    
    $abstract: true,
    
    $virtual: {
    
        /**
         * Performs application initialization operations.  This method should be provided by an application implementation
         * if required.  The superclass' <code>init()</code> method should always be invoked out of convention.
         * The <code>client</code> property will be available. 
         */
        init: function() { },
        
        /**
         * Performs application disposal/resource cleanup operations. This method should be provided by an application
         * implementation if required. The superclass' <code>dispose()</code> method should always be invoked out of convention.
         * The <code>client</code> property will be available.
         */
        dispose: function() { },
        
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
        }
    },
    
    /**
     * The client engine hosting the application.  
     * This property is provided solely for use by the application itself, it is not (and may not be) used internally for any
     * purpose. 
     * @type Object
     */
    client: null,

    /** 
     * Mapping between component ids and component instances.
     * @type Core.Arrays.LargeMap
     */
    _idToComponentMap: null,

    /** 
     * ListenerList instance for application-level events.
     * @type Core.ListenerList 
     */
    _listenerList: null,
    
    /** 
     * Default application locale.
     * @type String
     */
    _locale: null,
        
    /** 
     * Array of modal components.
     * This value is read-only.
     * @type Array 
     */
    _modalComponents: null,

    /** 
     * Displayed style sheet.
     * 
     * @type Echo.StyleSheet
     */
    _styleSheet: null,
    
    /** 
     * Currently focused component.
     * @type Echo.Component
     */
    _focusedComponent: null,
    
    /** 
     * Root component instance.
     * This value is read-only.
     * @type Echo.Component 
     */
    rootComponent: null,
    
    /** 
     * UpdateManager instance monitoring changes to the application for redraws. 
     * @type Echo.Update.Manager
     */
    updateManager: null,
    
    /**
     * FocusManager instance handling application focus behavior.
     * @type Echo.FocusManager
     */
    focusManager: null,
    
    /**
     * Creates a new application instance.  
     * @constructor
     */
    $construct: function() {
        this._idToComponentMap = new Core.Arrays.LargeMap();
        this._listenerList = new Core.ListenerList();
        this.rootComponent = new Echo.Component();
        this.rootComponent.componentType = "Root";
        this.rootComponent.register(this);
        this._modalComponents = [];
        this.updateManager = new Echo.Update.Manager(this);
        this.focusManager = new Echo.FocusManager(this);
    },

    /**
     * Adds an arbitrary event listener.
     * 
     * @param {String} eventType the event type name
     * @param {Function} eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
     */
    addListener: function(eventType, eventTarget) {
        this._listenerList.addListener(eventType, eventTarget);
    },
    
    /**
     * Invoked by application container to dispose of the application.
     * Invokes application-overridable <code>dispose()</code> method.
     * Once invoked, the application will no longer function and cannot be used again.
     * This method will free any resources allocated by the application.
     */ 
    doDispose: function() {
        this.updateManager.dispose();
        this.dispose();
    },
    
    /**
     * Invoked by application container to initialize of the application.
     * Invokes application-overridable <code>init()</code> method.
     */ 
    doInit: function() {
        this.init();
    },
    
    /**
     * Recursively determines the current root component of the modal context.
     *
     * @param {Echo.Component} searchComponent (optional) the component from which to search
     *        (this parameter is provided when recursively searching, if omitted the sear
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
     * Focuses the previous/next component based on the currently focused component.
     * 
     * @param {Boolean} reverse false to focus the next component, true to focus the
     *        previous component
     */
    focusNext: function(reverse) {
        var focusedComponent = this.focusManager.find(null, reverse);
        if (focusedComponent != null) {
            this.setFocusedComponent(focusedComponent);
        }
    },
    
    /**
     * Retrieves the registered component with the specified render id.
     * 
     * @param {String} renderId the render id
     * @return the component
     * @type Echo.Component 
     */
    getComponentByRenderId: function(renderId) {
        return this._idToComponentMap.map[renderId];
    },
    
    /**
     * Returns the focused component.
     * 
     * @return the focused component
     * @type Echo.Component
     */
    getFocusedComponent: function() {
        return this._focusedComponent;
    },
    
    /**
     * Returns the default layout direction of the application.
     *
     * @return the default layout direction
     * @type Echo.LayoutDirection 
     */
    getLayoutDirection: function() {
        return this._layoutDirection ? this._layoutDirection : Echo.LayoutDirection.LTR;
    },
        
    /**
     * Returns the default locale of the application.
     *
     * @return the default locale
     * @type String 
     */
    getLocale: function() {
        return this._locale;
    },
        
    /**
     * Returns the root component of the modal context.
     *
     * @return the root component of the modal context
     * @type Echo.Component
     */
    getModalContextRoot: function() {
        if (this._modalComponents.length === 0) {
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
     * @type Echo.StyleSheet
     */
    getStyleSheet: function() {
        return this._styleSheet;
    },
    
    /**
     * Notifies the application of an update to a component.
     * Fires a <code>componentUpdate</code> event.
     * 
     * @param {Echo.Component} parent the parent component
     * @param {String} propertyName the updated property
     * @param oldValue the previous property value
     * @param newValue the new property value
     * @param rendered optional flag indicating whether the update has already been rendered by the containing client; 
     *        if enabled, the property update will not be sent to the update manager
     */
    notifyComponentUpdate: function(parent, propertyName, oldValue, newValue, rendered) {
        if (parent.modalSupport && propertyName == "modal") {
            this._setModal(parent, newValue);
        }
        if (this._listenerList.hasListeners("componentUpdate")) {
            this._listenerList.fireEvent({type: "componentUpdate", parent: parent, propertyName: propertyName, 
                    oldValue: oldValue, newValue: newValue});
        }
        if (!rendered) {
            this.updateManager._processComponentUpdate(parent, propertyName, oldValue, newValue);
        }
    },
    
    /**
     * Registers a component with the application.
     * Invoked when a component is added to a hierarchy of 
     * components that is registered with the application.
     * 
     * @param {Echo.Component} component the component to register
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
     * Removes an arbitrary event listener.
     * 
     * @param {String} eventType the event type name
     * @param {Function} eventTarget the method to invoke when the event occurs 
     *        (the event will be passed as the single argument)
     */
    removeListener: function(eventType, eventTarget) {
        this._listenerList.removeListener(eventType, eventTarget);
    },

    /**
     * Sets the focused component.
     * A "focus" event is fired to application listeners to inform them of the change.
     * 
     * @param {Echo.Component} newValue the new focused component
     */
    setFocusedComponent: function(newValue) {
        var oldValue = this._focusedComponent;
        
        // If required, find focusable parent containing 'newValue'.
        while (newValue != null && !newValue.focusable) {
            newValue = newValue.parent;
        }
        
        // Verify new focused component is within modal context.
        if (this._modalComponents.length > 0) {
            var modalContextRoot = this.getModalContextRoot();
            if (!modalContextRoot.isAncestorOf(newValue)) {
                // Reject request to focus component outside of modal context.
                return;
            }
        }
        
        if (this._focusedComponent == newValue) {
            return;
        }
        
        this._focusedComponent = newValue;
        this._listenerList.fireEvent({type: "focus", source: this, oldValue: oldValue, newValue: newValue });
    },
    
    /**
     * Sets the application default layout direction.
     * 
     * @param {Echo.LayoutDirection} newValue the new layout direction
     */
    setLayoutDirection: function(newValue) {
        this._layoutDirection = newValue;
        this.updateManager._processFullRefresh();
    },
    
    /**
     * Sets the application default locale.
     * 
     * @param {String} newValue the new locale
     */
    setLocale: function(newValue) {
        this._locale = newValue;
        this.updateManager._processFullRefresh();
    },
    
    /**
     * Informs the application of the modal state of a specific component.
     * When modal components are unregistered, this method must be executed
     * in order to avoid a memory leak.
     * 
     * @param component the component
     * @param modal the modal state
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
        
        this.fireEvent({ source: this, type: "modal", modal: this._modalComponents.length > 0 });
    },
    
    /**
     * Sets the application style sheet.
     * 
     * @param {Echo.StyleSheet} newValue the new style sheet
     */
    setStyleSheet: function(newValue) {
        this._styleSheet = newValue;
        this.updateManager._processFullRefresh();
    },
    
    /**
     * Unregisters a component from the application.
     * This method is invoked when a component is removed from a hierarchy of 
     * components registered with the application.
     * 
     * @param {Echo.Component} component the component to remove
     */
    _unregisterComponent: function(component) {
        this._idToComponentMap.remove(component.renderId);
        if (component.modalSupport) {
            this._setModal(component, false);
        }
    }
});

/**
 * Factory to create new instances of arbitrary components.  This object is 
 * used to instantiate new components during XML de-serialization.
 * @class
 */
Echo.ComponentFactory = {
    
    /**
     * Mapping between type names and object constructors.
     */
    _typeToConstructorMap: {},
    
    /**
     * Creates a new instance of an arbitrary component.
     * 
     * @param {String} typeName the type name of the component
     * @param {String} renderId the component render id
     * @return a newly instantiated component
     * @type Echo.Component
     */
    newInstance: function(typeName, renderId) {
        var typeConstructor = this._typeToConstructorMap[typeName];
        if (!typeConstructor) {
            throw new Error("Type not registered with ComponentFactory: " + typeName);
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
     * @return the parent component type
     * @type String
     */
    getSuperType: function(typeName) {
        var typeConstructor = this._typeToConstructorMap[typeName];
        if (!typeConstructor) {
            // Type not registered, return Component base class name.
            return "Component";
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
 * Base class for components.
 * Derived classes should wishing to support hierarchal construction should provide constructors
 * with a first parameter name of 'properties' which is passed to the super-constructor.
 * In any case, the super-constructor must be invoked.
 * A component MUST have its componentType property set before it is used in a hierarchy.  Failing to do so
 * will throw an exception and/or result in indeterminate behavior.
 *
 * @sp {#Color} background the background color
 * @sp {#Font} font the component font
 * @sp {#Color} foreground the foreground color
 * @sp layoutData layout data information, describing how the component should be rendered by its container 
 * @event property An event fired when the a property of the component changes.  The <code>propertyName</code> property
 *        will specify the name of the changed property.  The <code>oldValue</code> and <code>newValue</code> properties
 *        (may) describe the previous and current states of the property, respectively.
 * @event init An event which is fired when the Component is added to a component hierarchy which is registered to an
 *        application.  The "application" property of the Component will be available when the event is fired.
 * @event dispose An event which is fired when the Component is about to be removed from a component hierarchy which is
 *        registered to an application.  The "application" property of the Component will be available when the event is fired.
 * @event parent An event which is fired when the Component's parent is changed.
 * @event children An event which is fired when a child is added to or removed from the Component.
 */
Echo.Component = Core.extend({
    
    $static: {

        /**
         * The next automatically assigned client render id.
         * @type Number
         */
        _nextRenderId: 0
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Component", this);
    },

    $abstract: true,
    
    $virtual: {
    
        /**
         * Component type.  
         * This value should be the fully-qualified name of the component, e.g. "Foo.ExampleComponent".
         * This property must be set by implementors in order for peer discovery to work properly.
         * @type String
         */
        componentType: "Component",
        
        /** 
         * Flag indicating whether or not the component is focusable.
         * @type Boolean 
         */
        focusable: false,

        /**
         * Returns the child component at the specified index after sorting the
         * children in the order which they should be focused. The default
         * implementation simply returns the same value as getComponent().
         * Implementations should override this method when the natural order to
         * focus child components is different than their normal ordering (e.g.,
         * when the component at index 1 is positioned above the component at
         * index 0).
         * 
         * @param {Number} index the index of the child (in focus order)
         * @return the child component
         * @type Echo.Component
         */
        getFocusComponent: function(index) {
            return this.children[index];
        },
        
        /**
         *  Flag indicating whether component is rendered as a pane (pane components consume available height).
         *  @type Boolean 
         */
        pane: false
    },
    
    /**
     * Component layout direction.
     * @type Echo.LayoutDirection
     */
    _layoutDirection: null,
    
    /**
     * Component locale.
     * @type String
     */
    _locale: null,

    /**
     * The render id.
     * This value should be treated as read-only and immutable.
     * @type String
     */
    renderId: null,
    
    /**
     * The parent component.
     * This value is read-only.
     * @type Echo.Component
     */
    parent: null,
    
    /**
     * The registered application.
     * This value is read-only.
     * @type Echo.Application
     */
    application: null,
    
    /**
     * Listener list.  Lazily created.
     * @type Core.ListenerList
     */
    _listenerList: null,
    
    /**
     * Referenced external style
     */
    _style: null,
    
    /**
     * Assigned style name from application-level style sheet.
     * @type String
     */
    _styleName: null,

    /**
     * Enabled state of the component (default true).
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
     * renderId of application-set next focusable component.
     * @type String 
     */
    focusNextId: null,
    
    /**
     * renderId of application-set previous focusable component.
     * @type String 
     */
    focusPreviousId: null,
    
    /**
     * Internal style used to store properties set directly on component.
     */
    _localStyle: null,
    
    /**
     * Creates a new Component.
     * The parent constructor MUST be invoked if it is overridden.  This is accomplished by including the statement
     * "BaseComponent.call(this, properties)" in any derivative constructor, where "BaseComponent" is
     * class from which the component is immediately derived (which may or may not be Echo.Component itself).
     *  
     * @param properties (Optional) associative mapping of initial property values (may be null)
     *        By default, all properties will be placed into the local style, except for the following:
     *        <ul>
     *         <li><code>styleName</code> specifies the component stylesheet style name</li>
     *         <li><code>style</code> specifies the referenced component style</li>
     *         <li><code>renderId</code> specifies the render id</li>
     *         <li><code>children</code> an array specifying the initial children of the component</li>
     *         <li><code>events</code> an associative mapping between event names and listener methods</li>
     *        </ul>
     */
    $construct: function(properties) {
        this.children = [];
        this._localStyle = { };
        
        if (properties) {
            for (var name in properties) {
                switch (name) {
                case "style": this._style = properties.style; break;
                case "styleName": this._styleName = properties.styleName; break;
                case "renderId": this.renderId = properties.renderId; break;
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
                }
            }
        }
    },

    /**
     * Adds a component as a child.
     * 
     * @param {Echo.Component} component the component to add
     * @param {Number} index the (integer) index at which to add it (optional, omission
     *        will cause component to be appended to end)
     */
    add: function(component, index) {
        if (!(component instanceof Echo.Component)) {
            throw new Error("Cannot add child: specified component object is not derived from Echo.Component. " +
                    "Parent: " + this + ", Child: " + component);
        }
        if (!component.componentType) {
            throw new Error("Cannot add child: specified component object does not have a componentType property. " +
                    "Parent: " + this + ", Child: " + component);
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
        
        if (component._listenerList && component._listenerList.hasListeners("parent")) {
            component._listenerList.fireEvent({type: "parent", source: component, oldValue: null, newValue: this});
        }

        if (this._listenerList && this._listenerList.hasListeners("children")) {
            this._listenerList.fireEvent({type: "children", source: this, add: component, index: index});
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
     * @type Echo.Component
     */
    getComponent: function(index) {
        return this.children[index];
    },
    
    /**
     * Returns the number of child components.
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
     * Note that in most cases it is preferable to set the layout direction of the Application, rather than individual components.
     * 
     * @return the component layout direction
     * @type Echo.LayoutDirection
     */
    getLayoutDirection: function() {
        return this._layoutDirection;
    },
    
    /**
     * Returns the component locale.
     * Note that in most cases it is preferable to set the locale of the Application, rather than individual components.
     * 
     * @return the component locale
     * @type String
     */
    getLocale: function() {
        return this._locale;
    },
    
    /**
     * Retrieves local style property map associations.  This method should only be used by a de-serialized for
     * the purpose of rapidly loading properties into a new component.
     * 
     * @return the internal style property map associations
     */
    getLocalStyleData: function() {
        return this._localStyle;
    },
    
    /**
     * Returns the layout direction with which the component should be rendered, based on analyzing the component's layout 
     * direction, its parent's, and/or the application's.
     * 
     * @return the rendering layout direction
     * @type Echo.LayoutDirection
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
     * Returns the locale  with which the component should be rendered, based on analyzing the component's locale,
     * its parent's, and/or the application's.
     * 
     * @return the rendering locale
     * @type String
     */
    getRenderLocale: function() {
        var component = this;
        while (component) {
            if (component._locale) {
                return component._locale;
            }
            component = component.parent;
        }
        if (this.application) {
            return this.application.getLocale();
        }
        return null;
    },
    
    /**
     * Returns the style assigned to this component, if any.
     * 
     * @return the assigned style
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
     * @param {Echo.Component} component the component
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
     * @param {Echo.Component} c the component to test
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
     * Use isRenderEnabled() to determine whether a component should be rendered as enabled.
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
     * @return true if the component should be rendered enabled
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
     * Registers / unregisters a component that has been added/removed to/from a registered hierarchy
     * (a hierarchy that is registered to an application).
     * 
     * @param {Echo.Application} application the application (null to unregister the component)
     */
    register: function(application) {
        // Sanity check.
        if (application && this.application) {
            throw new Error("Attempt to re-register or change registered application of component.");
        }
        
        var i;
    
        if (!application) { // unregistering
            // Recursively unregister children.
            if (this.children != null) {
                for (i = 0; i < this.children.length; ++i) {
                     this.children[i].register(false); // Recursively unregister children.
                }
            }
            
            // Notify application.
            this.application._unregisterComponent(this);

            // Change application focus in the event the focused component is being removed.
            // Note that this is performed after de-registration to ensure any removed modal context is cleared.
            if (this.application._focusedComponent == this) {
                this.application.setFocusedComponent(this.parent);
            }

            // Notify dispose listeners.
            if (this._listenerList != null && this._listenerList.hasListeners("dispose")) {
                this._listenerList.fireEvent({ type: "dispose", source: this });
            }
        }
    
        // Link/unlink with application.
        this.application = application;
    
        if (application) { // registering
            // Assign render id if required.
            if (this.renderId == null) {
                this.renderId = "CL." + (++Echo.Component._nextRenderId);
            }
    
            // Notify application.
            this.application._registerComponent(this);
            
            // Notify init listeners.
            if (this._listenerList != null && this._listenerList.hasListeners("init")) {
                this._listenerList.fireEvent({ type: "init", source: this });
            }

            // Recursively register children.
            if (this.children != null) {
                for (i = 0; i < this.children.length; ++i) {
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
            if (value == null && this.application && this.application._styleSheet) {
                var style = this.application._styleSheet.getRenderStyle(
                        this._styleName != null ? this._styleName : "", this.componentType);
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
     * @return the property value
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
                var style = this.application._styleSheet.getRenderStyle(
                        this._styleName != null ? this._styleName : "", this.componentType);
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
     * @param componentOrIndex the index of the component to remove, or the component to remove
     *        (values may be of type Echo.Component or Number)
     */
    remove: function(componentOrIndex) {
        var component;
        var index;
        if (typeof componentOrIndex == "number") {
            index = componentOrIndex;
            component = this.children[index];
            if (!component) {
                throw new Error("Component.remove(): index out of bounds: " + index + ", parent: " + this);
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
        
        if (component._listenerList && component._listenerList.hasListeners("parent")) {
            component._listenerList.fireEvent({type: "parent", source: component, oldValue: this, newValue: null});
        }

        if (this._listenerList && this._listenerList.hasListeners("children")) {
            this._listenerList.fireEvent({type: "children", source: this, remove: component, index: index});
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
     * @param rendered optional flag indicating whether the update has already been rendered by the containing client; 
     *        if enabled, the property update will not be sent to the update manager
     */
    set: function(name, newValue, rendered) {
        var oldValue = this._localStyle[name];
        if (oldValue === newValue) {
            return;
        }
        this._localStyle[name] = newValue;
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({type: "property", source: this, propertyName: name, 
                    oldValue: oldValue, newValue: newValue});
        }
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue, rendered);
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
     * @param rendered optional flag indicating whether the update has already been rendered by the containing client; 
     *        if enabled, the property update will not be sent to the update manager
     */
    setIndex: function(name, index, newValue, rendered) {
        var valueArray = this._localStyle[name];
        var oldValue = null;
        if (valueArray) {
            oldValue = valueArray[index];
            if (oldValue === newValue) {
                return;
            }
        } else {
            valueArray = [];
            this._localStyle[name] = valueArray;
        }
        valueArray[index] = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, name, oldValue, newValue, rendered);
        }
        if (this._listenerList && this._listenerList.hasListeners("property")) {
            this._listenerList.fireEvent({type: "property", source: this, propertyName: name, index: index,
                    oldValue: oldValue, newValue: newValue});
        }
    },
    
    /**
     * Sets a component-specific layout direction.
     * Note that in most cases it is preferable to set the layout direction of the Application, 
     * rather than individual components.
     * 
     * @param {Echo.LayoutDirection} newValue the new layout direction
     */
    setLayoutDirection: function(newValue) {
        var oldValue = this._layoutDirection;
        this._layoutDirection = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "layoutDirection", oldValue, newValue);
        }
    },
    
    /**
     * Sets a component-specific locale.
     * Note that in most cases it is preferable to set the locale of the Application, 
     * rather than individual components.
     * 
     * @param {String} newValue the new layout direction
     */
    setLocale: function(newValue) {
        var oldValue = this._locale;
        this._locale = newValue;
        if (this.application) {
            this.application.notifyComponentUpdate(this, "locale", oldValue, newValue);
        }
    },
    
    /**
     * Sets the style of the component.
     * 
     * @param newValue the new style
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
Echo.FocusManager = Core.extend({

    /**
     * The managed application.
     * @type Echo.Application
     */
    _application: null,

    /**
     * Focus management handler for a specific application instance.
     * One FocusManager is created for each application.
     * 
     * @param {Echo.Application} application the managed application
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
     * @param {Echo.Component} component the component at which to begin searching
     * @param {Boolean} reverse flag indicating the direction of the search
     * @return the Component which should be focused
     * @type Echo.Component
     */
    find: function(component, reverse) {
        if (!component) {
            component = this._application.getFocusedComponent();
            if (!component) {
                component = this._application.rootComponent;
            }
        }
        
        // If a specific next focusable component has been specified, attempt to focus it.
        var setComponentId = reverse ? component.focusPreviousId : component.focusNextId;
        if (setComponentId) {
            var setComponent = this._application.getComponentByRenderId(setComponentId);
            if (setComponent && setComponent.isActive() && setComponent.focusable) {
                return setComponent;
            }
        }

        // The component which is currently focused by the application.
        var originComponent = component;
        
        // An associative array containing the ids of all previously visited components.
        var visitedComponents = { };
        
        // The value of 'component' on the previous iteration.
        var lastComponent = null;
        
        while (true) {
            // The candidate next component to be focused.
            var nextComponent = null, componentIndex;

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
                        componentIndex = component.parent.indexOf(component);
                        if (componentIndex > 0) {
                            nextComponent = component.parent.getComponent(componentIndex - 1);
                        }
                    } else {
                        componentIndex = component.parent.indexOf(component);
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
     * The <code>minimumDistance</code> property may be used to skip a number of siblings.
     * This is used by components such as "Grid" which may want to find a focusable component
     * in the next row, skipping over all columns of the current row.  
     * If omitted the default value of this property is 1.  As an example, a value of 2
     * would skip the immediately adjacent sibling of the current focused component.
     *
     * @param {Echo.Component} parentComponent the parent component to search
     * @param {Boolean} reverse the search direction, false indicating to search forward, true
     *        indicating reverse
     * @param {Number} minimumDistance the fewest number of lateral focus moves to make before
     *        returning a focusable component (optional, default value of 1)
     * @return the focusable descendant, or null if one cannot be found
     * @type Echo.Component
     */
    findInParent: function(parentComponent, reverse, minimumDistance) {
        if (!minimumDistance) {
            minimumDistance = 1;
        }
        
        var visitedIds = {},
            focusedComponent = this._application.getFocusedComponent();

        if (!focusedComponent) {
            return null;
        }

        visitedIds[focusedComponent.renderId] = true;
        
        var focusedIndex = this._getDescendantIndex(parentComponent, focusedComponent);
        if (focusedIndex == -1) {
            return null;
        }
        
        var componentIndex = focusedIndex;
        var component = focusedComponent;
        do {
            component = this.find(component, reverse, visitedIds);
            if (component == null || visitedIds[component.renderId]) {
                return null;
            }
            componentIndex = this._getDescendantIndex(parentComponent, component);
            visitedIds[component.renderId] = true;
        } while (Math.abs(componentIndex - focusedIndex) < minimumDistance && component != focusedComponent);

        if (component == focusedComponent) {
            // Search wrapped, only one focusable component.
            return null;
        }
        
        this._application.setFocusedComponent(component);
        return component;
    },
    
    /**
     * Determines the index of the child of <code>parent</code> in which
     * <code>descendant</code> is contained.
     * 
     * @param {Echo.Component} parent the parent component
     * @param {Echo.Component} descendant the descendant component
     * @return the descendant index, or -1 if the component is not a descendant of <code>parent</code>
     * @type Number
     */
    _getDescendantIndex: function(parent, descendant) {
        while (descendant.parent != parent && descendant.parent != null) {
            descendant = descendant.parent;
        }
        if (descendant.parent == null) {
            return -1;
        }
        return parent.indexOf(descendant);
    }
});

/**
 * Describes the layout direction of text and content to provide support 
 * for bidirectional localization.
 */
Echo.LayoutDirection = Core.extend({
    
    /**
     * Flag indicating whether layout direction is left-to-right.
     * @type Boolean 
     */
    _ltr: false,
    
    /**
     * LayoutDirection property.  Do not instantiate, use LTR/RTL constants.
     * 
     * @param {Boolean} ltr true if the layout direction is left-to-right 
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
 * @type Echo.LayoutDirection
 * @final
 */
Echo.LayoutDirection.LTR = new Echo.LayoutDirection(true);

/**
 * Global instance representing a right-to-left layout direction.
 * @type Echo.LayoutDirection
 * @final
 */
Echo.LayoutDirection.RTL = new Echo.LayoutDirection(false);

/**
 * An application style sheet.
 */
Echo.StyleSheet = Core.extend({

    /** Map between style names and type-name to style maps. */
    _nameToStyleMap: null,

    /** 
     * Style cache mapping style names and type-name to style maps.  Behaves identically to _nameToStyleMap except styles are 
     * stored explicitly for every component type.  This provides quick access to style information for the renderer. 
     */
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
     * @param {String} name the component's style name
     * @param {String} componentType the type of the component
     * @return the style
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
    
    /**
     * Creates a rendered style object for a specific style name and componentType and stores it in
     * the cache.  This method is invoked by <code>getRenderStyle()</code> when a cached style cannot be found.
     *
     * @param {String} name the style name
     * @param {String} componentType the type of the component
     * @return the style
     */
    _loadRenderStyle: function(name, componentType) {
        // Retrieve value (type-to-style-map) from name-to-style-map with specified name key.
        var typeToStyleMap = this._nameToStyleMap[name];
        if (typeToStyleMap == null) {
            // No styles available for specified name, mark cache entry as null and return null.
            this._renderCache[name][componentType] = null;
            return null;
        }
        
        // Retrieve style for specific componentType.
        var style = typeToStyleMap[componentType];
        if (style == null) {
            var testType = componentType;
            while (style == null) {
                // Search super types of testType to find style until found.
                testType = Echo.ComponentFactory.getSuperType(testType);
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
     * @param the style
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
 * Namespace for update management.
 * Provides capabilities for storing property changes made to applications and components
 * such that display redraws may be performed efficiently in batches by application container.
 * @namespace
 */
Echo.Update = { };

/**
 * Representation of an update to a single existing component which is currently rendered on the screen.
 */
Echo.Update.ComponentUpdate = Core.extend({

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
     * The parent component represented in this <code>ComponentUpdate</code>.
     * @type Echo.Component
     */
    parent: null,
    
    /**
     * Storage for contextual information used by application container to render this update.
     * Object type and content are specified by the application container, this variable is not
     * used by the application module in any capacity.
     */
    renderContext: null,
    
    /**
     * The set of child Component ids added to the <code>parent</code>.
     * @type Array
     */
    _addedChildIds: null,
    
    /**
     * A mapping between property names of the parent component and 
     * <code>PropertyUpdate</code>s.
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
     * The set of listener types which have been added to/removed from the component.
     * Associative mapping between listener type names and boolean values, true representing
     * the notion that listeners of a type have been added or removed.
     */
    _listenerUpdates: null,

    /**
     * Creates a new ComponentUpdate.
     * 
     * @param {Echo.Component} parent the updated component
     */
    $construct: function(manager, parent) {
    
        /**
         * The <code>Manager</code> to which this update belongs.
         * @type Array
         */
        this._manager = manager;
        
        /**
         * The parent component represented in this <code>ComponentUpdate</code>.
         * @type Echo.Component
         */
        this.parent = parent;
    },
    
    /**
     * Records the addition of a child to the parent component.
     * 
     * @param {Echo.Component} child the added child
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
     * @param {Echo.Update.CompoentUpdate} update the update from which to pull 
     *        removed components/descendants
     */
    _appendRemovedDescendants: function(update) {
        var i;
        
        // Append removed descendants.
        if (update._removedDescendantIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = [];
            }
            for (i = 0; i < update._removedDescendantIds.length; ++i) {
                this._removedDescendantIds.push(update._removedDescendantIds[i]);
            }
        }
        
        // Append removed children.
        if (update._removedChildIds != null) {
            if (this._removedDescendantIds == null) {
                this._removedDescendantIds = [];
            }
            for (i = 0; i < update._removedChildIds.length; ++i) {
                this._removedDescendantIds.push(update._removedChildIds[i]);
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
        var components = [];
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
        var components = [];
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
        var components = [];
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
        var components = [];
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
     * @type Echo.Update.ComponentUpdate.PropertyUpdate
     */
    getUpdatedProperty: function(name) {
        if (this._propertyUpdates == null) {
            return null;
        }
        return this._propertyUpdates[name];
    },
    
    /**
     * Determines if any listeners of a specific type were added or removed
     * from the component.
     * 
     * @param {String} listenerType the type of listener to query
     */
    isListenerTypeUpdated: function(listenerType) {
        return this._listenerUpdates == null ? false : this._listenerUpdates[listenerType]; 
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
     * Determines if any of the specified properties has been
     * updated in this update.  The provided object should have
     * have keys for the desired property names and  values that evaluate 
     * to true, e.g. to determine if either the "text" and/or "icon" properties
     * changed, specify {text: true, icon: true}.
     * 
     * @param updatedPropertySet the updated property set
     * @return true if any of the specified properties has been updated in this update
     * @type Boolean
     */
    hasUpdatedPropertyIn: function(updatedPropertySet) {
        for (var x in this._propertyUpdates) {
            if (updatedPropertySet[x]) {
                return true;
            }
        }
        return false;
    },

    /**
     * Determines if the set of updated property names is contained
     * within the specified set.  The provided object should have
     * have keys for the desired property names and  values that evaluate 
     * to true, e.g. to determine if no properties other than "text" and "icon"
     * changed, specify {text: true, icon: true}. 
     * 
     * @param updatedPropertySet the updated property set
     * @return true if the set of updated property names is contained within the specified set
     * @type Boolean
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
     * @param {Echo.Component} child the removed child
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
     * All children of a removed component are recorded as removed
     * descendants when the child is removed.
     * This method will recursively invoke itself on children of
     * the specified descendant.
     * 
     * @param {Echo.Component} descendant the removed descendant 
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
        s += "- Properties: " + Core.Debug.toString(this._propertyUpdates) + "\n";
        s += "- LayoutDatas: " + this._updatedLayoutDataChildIds + "\n";
        return s;
    },
    
    /**
     * Records the update of the LayoutData of a child component.
     * 
     * @param {Echo.Component} child the child component whose layout data was updated
     */
    _updateLayoutData: function(child) {
        this._manager._idMap[child.renderId] = child;
        if (this._updatedLayoutDataChildIds == null) {
            this._updatedLayoutDataChildIds = [];
        }
        this._updatedLayoutDataChildIds.push(child.renderId);
    },
    
    /**
     * Records the addition or removal of listeners to the parent component.
     * 
     * @param {String} listenerType the listener type
     */
    _updateListener: function(listenerType) {
        if (this._listenerUpdates == null) {
            this._listenerUpdates = { };
        }
        this._listenerUpdates[listenerType] = true;
    },
    
    /**
     * Records the update of a property of the parent component.
     * 
     * @param {String} propertyName the name of the property
     * @param oldValue the previous value of the property
     * @param newValue the new value of the property
     */
   _updateProperty: function(propertyName, oldValue, newValue) {
        if (this._propertyUpdates == null) {
            this._propertyUpdates = { };
        }
        var propertyUpdate = new Echo.Update.ComponentUpdate.PropertyUpdate(oldValue, newValue);
        this._propertyUpdates[propertyName] = propertyUpdate;
    }
});

/**
 * Monitors and records updates made to the application between repaints.
 * Provides API to determine changes to component hierarchy since last update
 * in order to efficiently repaint the screen.
 */
Echo.Update.Manager = Core.extend({
    
    /**
     * Associative mapping between component ids and Echo.Update.ComponentUpdate
     * instances.
     */
    _componentUpdateMap: null,
    
    /**
     * Flag indicating whether a full refresh or incremental update will be performed.
     * @type Boolean
     */
    fullRefreshRequired: false,
    
    /**
     * The application whose updates are being managed.
     * @type Echo.Application
     */
    application: null,
    
    /**
     * Flag indicating whether any updates are pending.
     * @type Boolean
     */
    _hasUpdates: false,
    
    /**
     * Internal listener list for update listeners.
     * @type Core.ListenerList
     */
    _listenerList: null,
    
    /**
     * Associative mapping between component ids and component instances for all
     * updates held in this manager object.
     */
    _idMap: null,
    
    /**
     * Associative mapping from the ids of components which are to be removed in this update to the components themselves.
     */
    _removedIdMap: null,
    
    /** 
     * The id of the last parent component whose child was analyzed by
     * _isAncestorBeingAdded() that resulted in that method returning false.
     * This id is stored for performance optimization purposes.
     * This performance optimization relies on the fact that _isAncestorBeingAdded()
     * will be invoked for each attempt to modify the hierarchy.
     * @type String
     */
    _lastAncestorTestParentId: null,
    
    /**
     * Creates a new Update Manager.
     *
     * @param {Echo.Application} application the supported application
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
     * @param {Echo.Component} parent the parent Component
     * @return a ComponentUpdate instance for that Component
     * @type Echo.Update.ComponentUpdate 
     */
    _createComponentUpdate: function(parent) {
        this._hasUpdates = true;
        var update = this._componentUpdateMap[parent.renderId];
        if (!update) {
            update = new Echo.Update.ComponentUpdate(this, parent);
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
     */
    _fireUpdate: function() {
        if (!this._listenerList.isEmpty()) {
            this._listenerList.fireEvent({type: "update", source: this});
        }
    },
    
    /**
     * Returns the current pending updates.  Returns null in the event that that no pending updates exist.
     * 
     * @return an array containing all component updates (as Echo.Update.ComponentUpdates)
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
     * This method must be invoked by all hierarchy modification operations.
     * 
     * @param {Echo.Component} component the component to evaluate
     * @return true if the component or an ancestor of the component is being added
     * @type Boolean
     */
    _isAncestorBeingAdded: function(component) {
        var child = component;
        var parent = component.parent;
        
        var originalParentId = parent ? parent.renderId : null;
        if (originalParentId && this._lastAncestorTestParentId == originalParentId) {
            // If last invocation of _isAncestorBeingAdded for the same component returned false, it is safe
            // to assume that this invocation will return false as well.
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
     * @param {Echo.Component} parent the parent component
     * @param {Echo.Component} child the added child component
     */
    _processComponentAdd: function(parent, child) {
        if (this.fullRefreshRequired) {
            // A full refresh indicates an update already exists which encompasses this update.
            return;
        }
        if (this._isAncestorBeingAdded(child)) {
            // An ancestor being added indicates an update already exists which encompasses this update.
            return;
        }
        var update = this._createComponentUpdate(parent);
        update._addChild(child);
    },
    
    /**
     * Process a layout data update to a child component.
     * 
     * @param {Echo.Component} updatedComponent the updated component
     */
    _processComponentLayoutDataUpdate: function(updatedComponent) {
        if (this.fullRefreshRequired) {
            // A full refresh indicates an update already exists which encompasses this update.
            return;
        }
        var parent = updatedComponent.parent;
        if (parent == null || this._isAncestorBeingAdded(parent)) {
            // An ancestor being added indicates an update already exists which encompasses this update.
            return;
        }
        var update = this._createComponentUpdate(parent);
        update._updateLayoutData(updatedComponent);
    },
    
    /**
     * Process a layout data update to a child component.
     * 
     * @param {Echo.Component} updatedComponent the updated component
     */
    _processComponentListenerUpdate: function(parent, listenerType) {
        if (this.fullRefreshRequired) {
            // A full refresh indicates an update already exists which encompasses this update.
            return;
        }
        if (this._isAncestorBeingAdded(parent)) {
            // An ancestor being added indicates an update already exists which encompasses this update.
            return;
        }
        var update = this._createComponentUpdate(parent);
        update._updateListener(listenerType);
    },
    
    /**
     * Processes a child removal from a component.
     * 
     * @param {Echo.Component} parent the parent component
     * @param {Echo.Component} child the removed child component
     */
    _processComponentRemove: function(parent, child) {
        if (this.fullRefreshRequired) {
            // A full refresh indicates an update already exists which encompasses this update.
            return;
        }
        if (this._isAncestorBeingAdded(parent)) {
            // An ancestor being added indicates an update already exists which encompasses this update.
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
     * @param {Echo.Component} component the updated component
     * @param {String} propertyName the updated property name
     * @param oldValue the previous value of the property
     * @param newValue the new value of the property
     */
    _processComponentPropertyUpdate: function(component, propertyName, oldValue, newValue) {
        if (this.fullRefreshRequired) {
            // A full refresh indicates an update already exists which encompasses this update.
            return;
        }
        if (this._isAncestorBeingAdded(component)) {
            // An ancestor being added indicates an update already exists which encompasses this update.
            return;
        }
        var update = this._createComponentUpdate(component);
        update._updateProperty(propertyName, oldValue, newValue);
    },
    
    /**
     * Processes an event requiring a full-refresh.
     */
    _processFullRefresh: function() {
        // Mark all components as having being removed from root.
        for (var i = 0; i < this.application.rootComponent.children.length; ++i) {
            this._processComponentRemove(this.application.rootComponent, this.application.rootComponent.children[i]);
        }

        // Flag full refresh as required, such that all future property updates bounce.
        this.fullRefreshRequired = true;
        
        // Retrieve root component update and mark as full refresh.
        var update = this._createComponentUpdate(this.application.rootComponent);
        update.fullRefresh = true;
        
        // Notify container.
        this._fireUpdate();
    },
    
    /**
     * Processes component update notification received from the application instance.
     * 
     * @param {Echo.Component} component the updated component
     * @param {String} propertyName the updated property name
     * @param oldValue the previous value of the property
     * @param newValue the new value of the property
     */
    _processComponentUpdate: function(parent, propertyName, oldValue, newValue) {
        if (propertyName == "children") {
            // Child added/removed.
            if (newValue == null) {
                // Process child removal.
                this._processComponentRemove(parent, oldValue);
            } else {
                // Process child addition.
                this._processComponentAdd(parent, newValue);
            }
        } else if (propertyName == "layoutData") {
            // Process a layout data update.
            this._processComponentLayoutDataUpdate(parent);
        } else if (propertyName == "listeners") {
            // Process listeners addition/removal.
            this._processComponentListenerUpdate(parent, oldValue || newValue);
        } else {
            // Process property update.
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

/**
 * Abstract base class for button components.
 *
 * @sp {String} actionCommand the action command fired in action events 
 *     when the button is pushed
 * @sp {#Alignment} alignment the alignment of the button's content (only horizontal alignments are supported, any vertical
 *     component of the alignment value will not be rendered)
 * @sp {#FillImage} backgroundImage the background image
 * @sp {#Border} border the default button border
 * @sp {#Color} disabledBackground the disabled background color
 * @sp {#FillImage} disabledBackgroundImage the disabled background image
 * @sp {#Border} disabledBorder the disabled border
 * @sp {#Font} disabledFont the disabled font
 * @sp {#Color} disabledForeground the disabled foreground color
 * @sp {#ImageReference} disabledIcon the disabled icon
 * @sp {#Color} focusedBackground the focused background
 * @sp {#FillImage}focusedBackgroundImage the focused background image
 * @sp {#Border} focusedBorder the focused border
 * @sp {Boolean} focusedEnabled boolean flag indicating whether focus effects are enabled 
 * @sp {#Font} focusedFont the focused font
 * @sp {#Color} focusedForeground the focused foreground color
 * @sp {#ImageReference} focusedIcon the focused icon
 * @sp {#Extent} height the button height
 * @sp {#ImageReference} icon the button icon
 * @sp {#Extent} iconTextMargin the extent margin between the button's icon and text
 * @sp {#Insets} insets the inset padding margin between the button's border and its content
 * @sp {Boolean} lineWrap boolean flag indicating whether text within the button may be wrapped
 * @sp {#Color} pressedBackground the pressed background color
 * @sp {#FillImage} pressedBackgroundImage the pressed background image
 * @sp {#Border} pressedBorder the pressed border
 * @sp {Boolean} pressedEnabled boolean flag indicating whether pressed effects are enabled 
 * @sp {#Font} pressedFont the pressed font
 * @sp {#Font} pressedForeground the pressed foreground color
 * @sp {#ImageReference} pressedIcon the pressed icon
 * @sp {#Color} rolloverBackground the rollover background color
 * @sp {#FillImage} rolloverBackgroundImage the rollover background image
 * @sp {#Border} rolloverBorder the rollover border
 * @sp {Boolean} rolloverEnabled boolean flag indicating whether rollover effects are enabled
 * @sp {#Font} rolloverFont the rollover font
 * @sp {#Color} rolloverForeground the rollover foreground
 * @sp {#ImageReference} rolloverIcon the rollover icon
 * @sp {String} text the text of the button
 * @sp {#Alignment} textAlignment the alignment of the text
 * @sp {#Alignment} textPosition the position of the text relative to the icon
 * @sp {String} toolTipText the tool tip text
 * @sp {#Extent} width the width of the button
 * @event action An event fired when the button is pressed (clicked).  The <code>actionCommand</code> property of the pressed
 *        button is provided as a property.
 */
Echo.AbstractButton = Core.extend(Echo.Component, {

    $abstract: true,
    
    $load: function() {
        Echo.ComponentFactory.registerType("AbstractButton", this);
        Echo.ComponentFactory.registerType("AB", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "AbstractButton",

    /** @see Echo.Component#focusable */
    focusable: true,
    
    $virtual: {
        
        /**
         * Programmatically performs a button action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
        }
    }
});

/**
 * Button component: a stateless "push" button which is used to initiate an
 * action.  May not contain child components.
 */
Echo.Button = Core.extend(Echo.AbstractButton, {

    $load: function() {
        Echo.ComponentFactory.registerType("Button", this);
        Echo.ComponentFactory.registerType("B", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Button"
});

/**
 * An abstract base class for on/off toggle button components.
 *
 * @sp {#ImageReference} disabledStateIcon the disabled state icon to display when the toggle state is deselected
 * @sp {#ImageReference} disabledSelectedStateIcon the disabled state icon to display when thetoggle  state is selected
 * @sp {#ImageReference} pressedStateIcon the pressed state icon to display when the toggle state is deselected
 * @sp {#ImageReference} pressedSelectedStateIcon the pressed state icon to display when the toggle state is selected
 * @sp {#ImageReference} rolloverStateIcon the rollover state icon to display when the toggle state is deselected
 * @sp {#ImageReference} rolloverSelectedStateIcon the rollover state icon to display when the toggle state is selected
 * @sp {#ImageReference} selectedStateIcon the default state icon to display when the toggle state is deselected
 * @sp {#Alignment} stateAlignment the alignment of the state icon relative to the button's icon/text
 * @sp {#Alignment} statePosition the position (an alignment value) of the state icon relative to the button's icon/text
 * @sp {#ImageReference} stateIcon the default state icon to display when the toggle state is selected
 * @sp {Number} stateMargin the margin between the state icon and the button's icon/text
 */
Echo.ToggleButton = Core.extend(Echo.AbstractButton, {

    $load: function() {
        Echo.ComponentFactory.registerType("ToggleButton", this);
        Echo.ComponentFactory.registerType("TB", this);
    },

    $abstract: true,

    /** @see Echo.Component#componentType */
    componentType: "ToggleButton"
});

/**
 * CheckBox component: a simple on/off toggle button. May not contain child
 * components.
 */
Echo.CheckBox = Core.extend(Echo.ToggleButton, {

    $load: function() {
        Echo.ComponentFactory.registerType("CheckBox", this);
        Echo.ComponentFactory.registerType("CB", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "CheckBox"
});

/**
 * RadioButton component: a toggle button which allows a user to select one
 * option from a group of options. Radio buttons should be assigned to a unique
 * named group (by setting the <code>group</code> property). Only one radio
 * button in a group will be selected at a given time. May not contain child
 * components.
 * 
 * @sp {String} group a unique identifier used to group radio buttons together
 *     (set this property to a value generated by Echo.Application.generateUid()
 *     to guarantee uniqueness)
 */
Echo.RadioButton = Core.extend(Echo.ToggleButton, {

    $load: function() {
        Echo.ComponentFactory.registerType("RadioButton", this);
        Echo.ComponentFactory.registerType("RB", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "RadioButton"
});

/**
 * Abstract base class for selection list components (i.e., SelectFields and
 * ListBoxes).
 * 
 * @cp {Array} items the array of items contained in the list component. The
 *     value of the 'text' property or toString() value of the item will be
 *     displayed in the selection component.
 * @cp selectedId the values of the id property of the selected item, or an
 *     array of the id values when multiple items are selected
 * @cp selection the index of the selected item, or an array of the indices of
 *     selected items when multiple items are selected
 * 
 * @sp {#Border} border the default border
 * @sp {#Color} disabledBackground the disabled background color
 * @sp {#Border} disabledBorder the disabled border
 * @sp {#Font} disabledFont the disabled font
 * @sp {#Color} disabledForeground the disabled foreground color
 * @sp {#Extent} height the component height
 * @sp {#Insets} insets the inset margin between the border and the items of the
 *     list component
 * @sp {#Color} rolloverBackground the rollover background color
 * @sp {#Border} rolloverBorder the rollover border
 * @sp {#Font} rolloverFont the rollover font
 * @sp {#Color} rolloverForeground the rollover foreground color
 * @sp {#Extent} width the component width
 * @event action An event fired when an item is selected (clicked).
 */
Echo.AbstractListComponent = Core.extend(Echo.Component, {

    $abstract: true,

    $load: function() {
        Echo.ComponentFactory.registerType("AbstractListComponent", this);
        Echo.ComponentFactory.registerType("LC", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "AbstractListComponent",

    /** @see Echo.Component#focusable */
    focusable: true,
    
    $virtual: {
        
        /**
         * Programmatically performs a list select action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
        }
    }
});

/**
 * ListBox component: a selection component which displays selection items in a
 * list. May be configured to allow the selection of one item at a time, or to
 * allow the selection of multiple items at one time. Does not support child
 * components.
 * 
 * @sp {Number} selectionMode a value indicating the selection mode, one of the
 *     following values:
 *     <ul>
 *     <li><code>Echo.ListBox.SINGLE_SELECTION</code> (the default)</li>
 *     <li><code>Echo.ListBox.MULTIPLE_SELECTION</code></li>
 *     </ul>
 */
Echo.ListBox = Core.extend(Echo.AbstractListComponent, {

    $static: {

        /**
         * Constant for <code>selectionMode</code> property indicating single selection.
         * @type Number
         */
        SINGLE_SELECTION: 0,
        
        /**
         * Constant for <code>selectionMode</code> property indicating multiple selection.
         * @type Number
         */
        MULTIPLE_SELECTION: 2
    },

    $load: function() {
        Echo.ComponentFactory.registerType("ListBox", this);
        Echo.ComponentFactory.registerType("LB", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "ListBox"
});

/**
 * SelectField component: a selection component which display selection items in
 * a drop-down field. Allows the selection of only one item at a time. Does not
 * support child components.
 */
Echo.SelectField = Core.extend(Echo.AbstractListComponent, {

    $load: function() {
        Echo.ComponentFactory.registerType("SelectField", this);
        Echo.ComponentFactory.registerType("SF", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "SelectField"
});

/**
 * Column component: a layout container which renders its content in a single
 * vertical column of cells. May contain zero or more child components. Does not
 * support pane components as children.
 * 
 * @sp {#Border} border the border displayed around the entire column
 * @sp {#Extent} cellSpacing the extent margin between cells of the column
 * @sp {#Insets} insets the inset margin between the column border and its cells
 * 
 * @ldp {#Alignment} alignment the alignment of the child component within its
 *      cell
 * @ldp {#Color} background the background of the child component's cell
 * @ldp {#FillImage} backrgoundImage the background image of the child
 *      component's cell
 * @ldp {#Extent} height the height of the child component's cell
 * @ldp {#Insets} insets the insets margin of the child component's cell (this
 *      inset is added to any inset set on the container component)
 */
Echo.Column = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Column", this);
        Echo.ComponentFactory.registerType("C", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Column"
});

/**
 * Composite component: a generic composite component abstract base class. This
 * class is intended to be used as base class for composite components. Provides
 * no rendering properties (other than those specified in Component). May
 * contain at most one child component. May not contain a pane component as a
 * child.
 * 
 * This class provides no benefit if you are providing a custom
 * synchronization/rendering peer. In such cases, <code>Echo.Component</code>
 * itself should be derived instead of this class.
 */
Echo.Composite = Core.extend(Echo.Component, {

    $abstract: true,
    
    $load: function() {
        Echo.ComponentFactory.registerType("Composite", this);
        Echo.ComponentFactory.registerType("CM", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Composite"
});

/**
 * Panel component: a single child container. Provides a configurable border,
 * margin, background image, and dimensions. May contain at most one child. May
 * contain pane components, and may be used as a means to add pane components to
 * containers which do not allow pane components as children. In such a case it
 * may be necessary to manually set the height property of the Panel itself.
 * 
 * @sp {#Alignment} alignment the alignment of the child component within the panel
 * @sp {#FillImage} backgroundImage the background image
 * @sp {#Border} border the border surrounding the child component
 * @sp {#Extent} height the height of the panel
 * @sp {#FillImageBorder} imageBorder an image-based border surrounding the child component (overrides <code>border</code>
 *     property when set)
 * @sp {#Insets} insets the inset padding margin between the panel border and its content
 * @sp {#Extent} width the width of the panel
 */
Echo.Panel = Core.extend(Echo.Composite, {

    $load: function() {
        Echo.ComponentFactory.registerType("Panel", this);
        Echo.ComponentFactory.registerType("P", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Panel"
});

/**
 * ContentPane component: a high-level container/layout object which fills a
 * region and optionally provides the capability to add floating panes (e.g.
 * <code>WindowPane</code>s) above that content. A ContentPane is often
 * suitable for use as a base class to extend when creating a composite (pane)
 * component. May contain at most one non-floating pane component as a child.
 * May contain zero or more floating pane components as children.
 * 
 * @sp {#FillImage} backgroundImage the background image
 * @sp {#Extent} horizontalScroll the horizontal scroll position
 * @sp {#Insets} insets the inset margin of the content
 * @sp {Number} overflow the scrollbar behavior used when content overflows the
 *     boundaries of the pane, one of the following values:
 *     <ul>
 *     <li><code>OVERFLOW_AUTO</code> (the default)</li>
 *     <li><code>OVERFLOW_HIDDEN</code> hide content that overflows</li>
 *     <li><code>OVERFLOW_SCROLL</code> always display scrollbars</li>
 *     </ul>
 * @sp {#Extent} verticalScroll the vertical scroll position
 */
Echo.ContentPane = Core.extend(Echo.Component, {

    $static: {
    
        /**
         * Setting for <code>overflow</code> property that scrollbars should be displayed when content overflows.
         * @type Number
         */
        OVERFLOW_AUTO: 0,

        /** 
         * Setting for <code>overflow</code> property indicating that overflowing content should be hidden.
         * @type Number 
         */
        OVERFLOW_HIDDEN: 1,

        /** 
         * Setting for <code>overflow</code> property indicating that scrollbars should always be displayed.
         * @type Number 
         */
        OVERFLOW_SCROLL: 2
    },

    $load: function() {
        Echo.ComponentFactory.registerType("ContentPane", this);
        Echo.ComponentFactory.registerType("CP", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "ContentPane",
    
    /** @see Echo.Component#pane */
    pane: true
});

/**
 * Grid component: a layout container which displays children in a grid.
 * Individual child component cells may be configured to span multiple rows or
 * columns using layout data. May contain zero or more components as children.
 * May not contain panes as children.
 * 
 * @sp {#Border} border the border displayed around the grid, and between cells
 * @sp {#Extent} columnWidth an indexed property whose indices represent the
 *     width of each column of the grid
 * @sp {#Extent} height the overall height of the grid
 * @sp {#Insets} insets the default inset margin displayed in each cell
 * @sp {Number} orientation a value indicating whether the grid will be laid out
 *     horizontally and then vertically or vice-versa, one of the following
 *     values:
 *     <ul>
 *     <li><code>ORIENTATION_HORIZONTAL</code> (the default) lay children out
 *     horizontally, then vertically</li>
 *     <li><code>ORIENTATION_VERTICAL</code> lay children out vertically,
 *     then horizontally</li>
 *     </ul>
 * @sp {#Extent} rowWidth an indexed property whose indices represent the height
 *     of each row of the grid
 * @sp {Number} size the number of cells to render before wrapping to the next
 *     column/row (default 2)
 * @sp {#Extent} width the overall width of the grid
 * @ldp {#Alignment} alignment the alignment of the child component within its
 *      cell
 * @ldp {#Color} background the background of the child component's cell
 * @ldp {#FillImage} backrgoundImage the background image of the child
 *      component's cell
 * @ldp {Number} columnSpan the number of column the containing cell should span
 *      (a value of <code>SPAN_FILL</code> indicates that cell should fill all
 *      columns until the end of the grid is reached; this value may only be
 *      used in this property for horizontally oriented grids)
 * @ldp {#Insets} insets the insets margin of the child component's cell (this
 *      inset is added to any inset set on the container component)
 * @ldp {Number} rowSpan the number of rows the containing cell should span (a
 *      value of <code>SPAN_FILL</code> indicates that cell should fill all
 *      rows until the end of the grid is reached; this value may only be used
 *      in this property for vertically oriented grids)
 */
Echo.Grid = Core.extend(Echo.Component, {

    $static: {

        /**
         * Constant value for <code>orientation</code> property indicating cells 
         * should be laid out horizontally and then vertically.
         * <code>ORIENTATION_HORIZONTAL</code> is the default orientation setting.
         * @type Number
         */
        ORIENTATION_HORIZONTAL: 0,
    
        /**
         * Constant value for <code>orientation</code> property indicating cells 
         * should be laid out vertically and then horizontally. 
         * @type Number
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
         * @type Number
         */
        SPAN_FILL: -1
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Grid", this);
        Echo.ComponentFactory.registerType("G", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Grid"
});

/**
 * Label component: displays a text string, an icon, or both. May not contain
 * child components.
 * 
 * @sp {Boolean} formatWhitespace a boolean flag indicating whether whitespace
 *     formatting should be applied to the label
 * @sp {Boolean} lineWrap a boolean flag indicating whether long lines should be
 *     wrapped
 * @sp {#ImageReference} icon the icon/image to display in the label
 * @sp {#Extent} iconTextMargin an extent setting describing the distance
 *     between the label and icon
 * @sp {String} text the text to display in the label
 * @sp {#Alignment} textAlignment an alignment setting describing the alignment
 *     of the label's text
 * @sp {#Alignment} textPosition an alignment setting describing the position of
 *     the label's text relative to the icon
 */
Echo.Label = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Label", this);
        Echo.ComponentFactory.registerType("L", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Label"
});

/**
 * Row component: a layout container which renders its content in a single horizontal row of cells.
 * May have zero or more child components.  Does not support pane components as children.
 *
 * @sp {#Border} border the border displayed around the entire column
 * @sp {#Extent} cellSpacing the extent margin between cells of the column
 * @sp {#Insets} insets the inset margin between the column border and its cells
 *
 * @ldp {#Alignment} alignment the alignment of the child component within its cell
 * @ldp {#Color} background the background of the child component's cell
 * @ldp {#FillImage} backrgoundImage the background image of the child component's cell
 * @ldp {#Insets} insets the insets margin of the child component's cell 
 *      (this inset is added to any inset set on the container component)
 * @ldp {#Extent} width the width of the child component's cell
 */
Echo.Row = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Row", this);
        Echo.ComponentFactory.registerType("R", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Row"
});

/**
 * SplitPane component: a pane component which displays two components
 * horizontally or vertically adjacent to one another, optionally allowing the
 * user to apportion space between the two using a resize handle. May have at
 * most two child components. Supports pane components as children.
 * 
 * @sp {Boolean} autoPositioned flag indicating whether the pane should set the
 *     separator position automatically based on size of first child. This
 *     feature is only available on vertically oriented panes, where the first
 *     child contains non-pane content.
 * @sp {Number} orientation the orientation of the SplitPane, one of the
 *     following values:
 *     <ul>
 *     <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code> (the default)</li>
 *     <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
 *     <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
 *     <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
 *     <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
 *     <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
 *     </ul>
 * @sp {Boolean} resizable flag indicating whether the pane separator can be
 *     moved
 * @sp {#Color} separatorColor the separator color
 * @sp {#Extent} separatorHeight the height of the separator (this property is
 *     used to determine the size of the separator in vertical orientations)
 * @sp {#FillImage} separatorHorizontalImage a FillImage used to paint the
 *     separator for horizontal orientations
 * @sp {#FillImage} separatorHorizontalRolloverImage a FillImage used to paint
 *     the separator for horizontal orientations when the mouse is over it
 * @sp {#Extent} separatorPosition an extent specifying the position of the
 *     separator
 * @sp {#Color} separatorRolloverColor the rollover separator color
 * @sp {#FillImage} separatorVerticalImage a FillImage used to paint the
 *     separator for vertical orientations
 * @sp {#FillImage} separatorVerticalRolloverImage a FillImage used to paint the
 *     separator for vertical orientations when the mouse is over it
 * @sp {#Extent} separatorWidth the width of the separator (this property is
 *     used to determine the size of the separator in horizontal orientations)
 * @ldp {#Alignment} alignment the alignment of the child component within its
 *      subpane
 * @ldp {#Color} background the background of the child component's subpane
 * @ldp {#FillImage} backrgoundImage the background image of the child
 *      component's subpane
 * @ldp {#Insets} insets the insets margin of the child component's subpane
 * @ldp {#Extent} maximumSize the maximum size of the child component's subpane
 * @ldp {#Extent} minimumSize the minimum size of the child component's subpane
 * @ldp {Number} overflow the layout behavior to use when the child component is
 *      larger than its containing subpane, one of the following values:
 *      <ul>
 *      <li><code>OVERFLOW_AUTO</code> (the default)</li>
 *      <li><code>OVERFLOW_HIDDEN</code></li>
 *      <li><code>OVERFLOW_SCROLL</code></li>
 *      </ul>
 */
Echo.SplitPane = Core.extend(Echo.Component, {

    $static: {
    
        /**
         * Orientation property value indicating a leading / trailing layout.
         * @type Number
         */
        ORIENTATION_HORIZONTAL_LEADING_TRAILING: 0,

        /**
         * Orientation property value indicating a trailing / leading layout.
         * @type Number
         */
        ORIENTATION_HORIZONTAL_TRAILING_LEADING: 1,
        
        /**
         * Orientation property value indicating a left / right layout.
         * @type Number
         */
        ORIENTATION_HORIZONTAL_LEFT_RIGHT: 2,
        
        /**
         * Orientation property value indicating a right / left layout.
         * @type Number
         */
        ORIENTATION_HORIZONTAL_RIGHT_LEFT: 3,
        
        /**
         * Orientation property value indicating a top / bottom layout.
         * @type Number
         */
        ORIENTATION_VERTICAL_TOP_BOTTOM: 4,

        /**
         * Orientation property value indicating a bottom / top layout.
         * @type Number
         */
        ORIENTATION_VERTICAL_BOTTOM_TOP: 5,
        
        /**
         * Default separator position.
         * @type #Extent
         */
        DEFAULT_SEPARATOR_POSITION: "50%",
        
        /**
         * Default separator size for fixed SplitPanes.
         * @type #Extent
         */
        DEFAULT_SEPARATOR_SIZE_FIXED: 0,

        /**
         * Default separator size for resizable SplitPanes.
         * @type #Extent
         */
        DEFAULT_SEPARATOR_SIZE_RESIZABLE: 4,
        
        /** 
         * Default separator color.
         * @type #Color
         */
        DEFAULT_SEPARATOR_COLOR: "#3f3f4f",
        
        /** 
         * Setting for <code>overflow</code> property that scrollbars should be displayed when content overflows. 
         * @type Number
         */
        OVERFLOW_AUTO: 0,

        /** 
         * Setting for <code>overflow</code> property indicating that overflowing content should be hidden.
         * @type Number
         */
        OVERFLOW_HIDDEN: 1,

        /** 
         * Setting for <code>overflow</code> property indicating that scrollbars should always be displayed. 
         * @type Number
         */
        OVERFLOW_SCROLL: 2
    },

    $load: function() {
        Echo.ComponentFactory.registerType("SplitPane", this);
        Echo.ComponentFactory.registerType("SP", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "SplitPane",

    /** @see Echo.Component#pane */
    pane: true
});

/**
 * Abstract base class for text-entry components.
 * 
 * @sp {String} actionCommand the action command fired when the enter key is
 *     pressed within the text component
 * @sp {#Alignment} alignment an alignment setting describing the alignment of
 *     the text
 * @sp {#FillImage} backgroundImage the background image to display in the
 *     component
 * @sp {#Border} border the border to display around the component
 * @sp {#Color} disabledBackground the disabled background color
 * @sp {#Color} disabledBackgroundImage the disabled background image
 * @sp {#Border} disabledBorder the disabled border
 * @sp {#Font} disabledFont the disabled font
 * @sp {#Color} disabledForeground the disabled foreground color
 * @sp {#Extent} height the height of the component
 * @sp {#Extent} horizontalScroll the horizontal scrollbar position
 * @sp {#Insets} insets the inset margin between the border and the text content
 * @sp {Number} maximumLength the maximum number of characters which may be
 *     entered
 * @sp {Number} selectionStart the character index of the beginning of the selection
 * @sp {Number} selectionEnd the character index of the end of the selection
 * @sp {String} toolTipText the tool tip text
 * @sp {#Extent} verticalScroll the vertical scrollbar position
 * @sp {#Extent} width the width of the component
 * @event action An event fired when the enter/return key is pressed while the
 *        field is focused.
 */
Echo.TextComponent = Core.extend(Echo.Component, {

    $abstract: true,

    $load: function() {
        Echo.ComponentFactory.registerType("TextComponent", this);
        Echo.ComponentFactory.registerType("TC", this);
    },

    $virtual: {
        
        /**
         * Programmatically performs a text component action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, actionCommand: this.get("actionCommand")});
        },
        
        /**
         * Notifies listeners of a key down event.
         * 
         * @param keyCode the (standardized) key code
         */
        doKeyDown: function(keyCode) {
            var e = { type: "keyDown", source: this, keyCode: keyCode };
            this.fireEvent(e);
            return !e.veto;
        },
        
        /**
         * Notifies listeners of a key press event.
         * 
         * @param keyCode the (standardized) key code
         * @param charCode the charater code
         */
        doKeyPress: function(keyCode, charCode) {
            var e = { type: "keyPress", source: this, keyCode: keyCode, charCode: charCode };
            this.fireEvent(e);
            return !e.veto;
        }
    },

    /** @see Echo.Component#componentType */
    componentType: "TextComponent",

    /** @see Echo.Component#focusable */
    focusable: true
});

/**
 * TextArea component: a multiple-line text input field. May not contain child
 * components.
 */
Echo.TextArea = Core.extend(Echo.TextComponent, {

    $load: function() {
        Echo.ComponentFactory.registerType("TextArea", this);
        Echo.ComponentFactory.registerType("TA", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "TextArea"
});

/**
 * TextField component: a single-line text input field. May not contain child
 * components.
 */
Echo.TextField = Core.extend(Echo.TextComponent, {

    $load: function() {
        Echo.ComponentFactory.registerType("TextField", this);
        Echo.ComponentFactory.registerType("TF", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "TextField"
});

/**
 * PasswordField component: a single-line text input field which masks input.
 * May not contain child components.
 */
Echo.PasswordField = Core.extend(Echo.TextField, {

    $load: function() {
        Echo.ComponentFactory.registerType("PasswordField", this);
        Echo.ComponentFactory.registerType("PF", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "PasswordField"
});

/**
 * WindowPane component: displays content in a movable and/or resizable window.
 * May only be added to a <code>ContentPane</code>. May contain at most one
 * child component. May contain pane components as children.
 * 
 * @sp {#FillImage} backgroundImage the background image to display within the
 *     content area
 * @sp {#FillImageBorder} border the border frame containing the WindowPane
 * @sp {Boolean} closable flag indicating whether the window is closable
 * @sp {#ImageReference} closeIcon the close button icon
 * @sp {#Insets} closeIconInsets the inset margin around the close button icon
 * @sp {#ImageReference} closeRolloverIcon the close button rollover icon
 * @sp {#Extent} contentHeight the height of the content region of the window
 * @sp {#Extent} contentWidth the width of the content region of the window
 * @sp {#Insets} controlsInsets the inset margin around the controls area
 * @sp {#Extent} controlsSpacing the spacing between controls in the controls
 *     area
 * @sp {#Extent} height the outside height of the window, including its border
 * @sp {#ImageReference} icon the icon to display adjacent the window title
 * @sp {#Insets} iconInsets the inset margin around the icon
 * @sp {#Insets} insets the inset margin around the window content
 * @sp {Boolean} maximizeEnabled flag indicating whether maximize feature should
 *     be enabled
 * @sp {#ImageReference} maximizeIcon the minimize button icon
 * @sp {#Insets} maximizeIconInsets the inset margin around the maximize button
 *     icon
 * @sp {#ImageReference} maximizeRolloverIcon the maximize button rollover icon
 * @sp {#Extent} maximumHeight the maximum height of the window
 * @sp {#Extent} maximumWidth the maximum width of the window
 * @sp {Boolean} minimizeEnabled flag indicating whether maximize feature should
 *     be enabled
 * @sp {#ImageReference} minimizeIcon the minimize button icon
 * @sp {#Insets} minimizeIconInsets the inset margin around the minimize button
 *     icon
 * @sp {#ImageReference} minimizeRolloverIcon the minimize button rollover icon
 * @sp {#Extent} minimumHeight the minimum height of the window
 * @sp {#Extent} minimumWidth the minimum width of the window
 * @sp {Boolean} movable flag indicating whether the window is movable
 * @sp {#Extent} positionX the horizontal (x) position of the window
 * @sp {#Extent} positionY the vertical (y) position of the window
 * @sp {Boolean} resizable flag indicating whether the window is resizable
 * @sp {String} title the title of the window
 * @sp {#Color} titleBackground the background color to display in the title bar
 * @sp {#FillImage} titleBackgroundImage the background image to display in the
 *     title bar
 * @sp {#Font} titleFont the font in which to display the title text
 * @sp {#Color} titleForeground the foreground color of the title text
 * @sp {#Extent} titleHeight the height of the title bar
 * @sp {#Insets} titleInsets the inset margin of the title text
 * @sp {#Extent} width the outside width of the window, including its border
 * @event close An event fired when the close button is pressed.
 * @event maximize An event fired when the maximize button is pressed.
 * @event minimize An event fired when the minimize button is pressed.
 */
Echo.WindowPane = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("WindowPane", this);
        Echo.ComponentFactory.registerType("WP", this);
    },

    $static: {
        
        /** 
         * Default WindowPane border.
         * @type #FillImageBorder
         */
        DEFAULT_BORDER: { color: "#36537a", borderInsets: 20, contentInsets: 3 },
        
        /** 
         * Default WindowPane content background color.
         * @type #Color
         */
        DEFAULT_BACKGROUND: "#ffffff",
        
        /** 
         * Default WindowPane content background color.
         * @type #Color
         */
        DEFAULT_FOREGROUND: "#000000",
        
        /** 
         * Default insets around WindowPane controls.
         * @type #Insets
         */
        DEFAULT_CONTROLS_INSETS: 4,
        
        /** 
         * Default spacing between WindowPane controls.
         * @type #Extent
         */
        DEFAULT_CONTROLS_SPACING: 4,
        
        /** 
         * Default WindowPane height.
         * @type #Extent
         */
        DEFAULT_HEIGHT: "15em",
        
        /** 
         * Default WindowPane minimum width.
         * @type #Extent
         */
        DEFAULT_MINIMUM_WIDTH: 100,
        
        /** 
         * Default WindowPane minimum height.
         * @type #Extent
         */
        DEFAULT_MINIMUM_HEIGHT: 100,
        
        /** 
         * Default WindowPane title background color.
         * @type #Color
         */
        DEFAULT_TITLE_BACKGROUND: "#becafe",
        
        /** 
         * Default WindowPane title height.
         * @type #Extent
         */
        DEFAULT_TITLE_HEIGHT: 30,
        
        /** 
         * Default WindowPane title insets.
         * @type #Insets
         */
        DEFAULT_TITLE_INSETS: "5px 10px",
        
        /** 
         * Default WindowPane width.
         * @type #Extent
         */
        DEFAULT_WIDTH: "30em"
    },

    /** @see Echo.Component#componentType */
    componentType: "WindowPane",
    
    /** @see Echo.Component#modalSupport */
    modalSupport: true,
    
    /**
     * Render as floating pane in ContentPanes. 
     * @see Echo.ContentPane 
     */
    floatingPane: true,

    /** @see Echo.Component#pane */
    pane: true,
    
    /** @see Echo.Component#focusable */
    focusable: true,
    
    /** 
     * Object specifying state of window pane before it was maximized,
     * May contain x, y, width, height integer properties or be null.
     */
    _preMaximizedState: null,
    
    /**
     * Processes a user request to close the window.
     */
    userClose: function() {
        this.fireEvent({type: "close", source: this});
    },
    
    /**
     * Processes a user request to maximize the window.
     */
    userMaximize: function() {
        if (this.render("width") == "100%" && this.render("height") == "100%") {
            if (this._preMaximizedState) {
                this.set("width", this._preMaximizedState.width);
                this.set("height", this._preMaximizedState.height);
                this.set("positionX", this._preMaximizedState.x);
                this.set("positionY", this._preMaximizedState.y);
            }
        } else {
            this._preMaximizedState = { 
                    x: this.get("positionX"), y: this.get("positionY"),
                    width: this.get("width"), height: this.get("height") };
            this.set("width", "100%");
            this.set("height", "100%");
        }
        this.fireEvent({type: "maximize", source: this});
    },
    
    /**
     * Processes a user request to minimize the window.
     */
    userMinimize: function() {
        this.fireEvent({type: "minimize", source: this});
    }
});
