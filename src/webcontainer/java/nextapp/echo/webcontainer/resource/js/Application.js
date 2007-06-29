/**
 * Namespace for application framework.  Non-instantiable object.
 * REQUIRES: Core.
 */
EchoApp = function() { };

/**
 * Creates a new application instance.  
 * @class Representation of a single application instance.
 *        Derived objects must invoke construtor with root component id.
 * @constructor
 * @param {String} rootComponentId the DOM id of the root component
 */
EchoApp.Application = function(rootComponentId) {
    if (arguments.length == 0) {
        // Return immediately in case that instance is being created to extend prototype.
        return;
    }
    
    /** 
     * Mapping between component ids and component instances.
     * @private 
     * @type EchoCore.Collections.Map
     */
    this._idToComponentMap = new EchoCore.Collections.Map();
    
    /** 
     * ListenerList instance for application-level events.
     * @private 
     * @type EchoCore.ListenerList 
     */
    this._listenerList = new EchoCore.ListenerList();

    /**
     * Id of root component.
     * This value is read-only.
     * @type string 
     */
    this.rootComponentId = rootComponentId;

    /** 
     * Root component instance.
     * This value is read-only.
     * @type EchoApp.Component 
     */
    this.rootComponent = new EchoApp.Component(this.rootComponentId);
    this.rootComponent.componentType = "Root";
    this.rootComponent.register(this);
    
    /** 
     * Root component of modal context.
     * This value is read-only.
     * @type EchoApp.Component 
     */
    this.modalContext = null;
    
    /** 
     * Displayed style sheet.
     * 
     * @private 
     * @type EchoApp.StyleSheet
     */
    this._styleSheet = null;
    
    /** 
     * Currently focused component.
     * @private
     * @type EchoApp.Component
     */
    this._focusedComponent = null;
    
    /** 
     * UpdateManager instance monitoring changes to the application for redraws. 
     * @type EchoApp.Update.Manager
     */
    this.updateManager = new EchoApp.Update.Manager(this);
};

/**
 * Adds a ComponentUpdateListener.
 * 
 * @param l the listener to add (may be of type Function or EchoCore.MethodRef)
 */
EchoApp.Application.prototype.addComponentUpdateListener = function(l) {
    this._listenerList.addListener("componentUpdate", l);
};

/**
 * Disposes of the application.
 * Once invoked, the application will no longer function and cannot be used again.
 * This method will free any resources allocated by the application.
 */ 
EchoApp.Application.prototype.dispose = function() {
    //FIXME. Add additional functionality to fully destroy application,
    // cause release of all browser-releated resources.
    this.updateManager.dispose();
};

/**
 * Retrieves the registered component with the specified render id.
 * 
 * @param {String} renderId the render id
 * @return the component
 * @type EchoApp.Component 
 */
EchoApp.Application.prototype.getComponentByRenderId = function(renderId) {
    return this._idToComponentMap.get(renderId);
};

/**
 * Returns the focused component.
 * 
 * @return the focused component
 * @type {EchoApp.Component}
 */
EchoApp.Application.prototype.getFocusedComponent = function() {
    return this._focusedComponent;
};

/**
 * Returns the default layout direction of the application.
 *
 * @return the default layout direction
 * @type EchoApp.LayoutDirection 
 */
EchoApp.Application.prototype.getLayoutDirection = function() {
	// FIXME ensure layout direction gets set upon application instantiation
    return this._layoutDirection ? this._layoutDirection : EchoApp.LayoutDirection.LTR;
};

/**
 * Returns the application style sheet.
 * 
 * @return the application style sheet
 * @type EchoApp.StyleSheet
 */
EchoApp.Application.prototype.getStyleSheet = function() {
    return this._styleSheet;
};

/**
 * Notifies the application of an update to a component.
 * 
 * @param {EchoApp.Component} parent the parent component
 * @param {String} propertyName the updated property
 * @param oldValue the previous property value
 * @param newValue the new property value
 */
EchoApp.Application.prototype.notifyComponentUpdate = function(parent, propertyName, oldValue, newValue) {
    if (this._listenerList.hasListeners("componentUpdate")) {
	    this._listenerList.fireEvent(new EchoApp.Application.ComponentUpdateEvent(this, parent, propertyName, oldValue, newValue));
    }
    this.updateManager._processComponentUpdate(parent, propertyName, oldValue, newValue);
};

/**
 * Registers a component with the application.
 * Invoked when a component is added to a hierarchy of 
 * components that is registered with the application.
 * 
 * @param {EchoApp.Component} component the component to register
 * @private
 */
EchoApp.Application.prototype._registerComponent = function(component) {
    if (this._idToComponentMap.get(component.renderId)) {
        throw new Error("Component already exists with id: " + component.renderId);
    }
    this._idToComponentMap.put(component.renderId, component);
};

/**
 * Removes a ComponentUpdateListener.
 * 
 * @param l the listener to add (may be of type Function or EchoCore.MethodRef)
 */
EchoApp.Application.prototype.removeComponentUpdateListener = function(l) {
    this._listenerList.removeListener("componentUpdate", l);
};

/**
 * Sets the focused component
 * 
 * @param {EchoApp.Component} newValue the new focused component
 */
EchoApp.Application.prototype.setFocusedComponent = function(newValue) {
    this._focusedComponent = newValue;
};

/**
 * Sets the application default layout direction.
 * 
 * @param {EchoApp.LayoutDirection} newValue the new layout direction
 */
EchoApp.Application.prototype.setLayoutDirection = function(newValue) {
    this._layoutDirection = newValue;
};

/**
 * Sets the application style sheet.
 * 
 * @param {EchoApp.StyleSheet} newValue the new style sheet
 */
EchoApp.Application.prototype.setStyleSheet = function(newValue) {
    var oldValue = this._styleSheet;
    this._styleSheet = newValue;
// FIXME updatemanager can't handle this yet.    
//    this.notifyComponentUpdate(null, "styleSheet", oldValue, newValue);
};

/**
 * Unregisters a component from the application.
 * This method is invoked when a component is removed from a hierarchy of 
 * components registered with the application.
 * 
 * @param {EchoApp.Component} component the component to remove
 * @private
 */
EchoApp.Application.prototype._unregisterComponent = function(component) {
    this._idToComponentMap.remove(component.renderId);
};

/**
 * Event object describing an update to a component.
 * 
 * @constructor
 * @base EchoCore.Event
 * @param source the generator of the event
 * @param {EchoApp.Component} parent the updated component
 * @param {String} propertyName the updated propery
 * @param oldValue the previous value of the property
 * @param newValue the new value of the property
 */
EchoApp.Application.ComponentUpdateEvent = function(source, parent, propertyName, oldValue, newValue) {
    EchoCore.Event.call(this, source, "componentUpdate");
    this.parent = parent;
    this.propertyName = propertyName;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

EchoApp.Application.ComponentUpdateEvent.prototype = new EchoCore.Event;

/**
 * Factory to create new instances of arbitrary components.  This object is 
 * used to instantiate new components during XML deserialization.
 * This is a namespace object, do not instantiate.
 */
EchoApp.ComponentFactory = function() { };

/**
 * Mapping between type names and object constructors.
 * 
 * @type Object
 * @private
 */
EchoApp.ComponentFactory._typeToConstructorMap = new Object();

/**
 * Creates a new instance of an arbitrary component.
 * 
 * @param {String} typeName the type name of the component
 * @param {String} renderId the component render id
 * @return a newly instantiated component
 * @type EchoApp.Component
 */
EchoApp.ComponentFactory.newInstance = function(typeName, renderId) {
    var typeConstructor = EchoApp.ComponentFactory._typeToConstructorMap[typeName];
    if (typeConstructor == null) {
        var component = new EchoApp.Component(renderId);
        component.componentType = typeName;
        return component;
    } else {
        return new typeConstructor(renderId);
    }
};

/**
 * Registers a type name to a specific constructor.
 * 
 * @param {String} typeName the type name
 * @param {Function} typeConstructor the component object to instantiate
 *        (must extend EchoApp.Component)
 */
EchoApp.ComponentFactory.registerType = function(typeName, typeConstructor) {
    EchoApp.ComponentFactory._typeToConstructorMap[typeName] = typeConstructor;
};

/**
 * Base class for components.
 * Derived classes should always take renderId as the first parameter and pass it to the super-constructor.
 * A component MUST have its componentType property set before it is used in a hierarchy.  Failing to do so
 * will throw an exception and/or result in indeterminate behavior.
 * 
 * @param {String} renderId the render id
 * @constructor
 */
EchoApp.Component = function(renderId) {
    if (arguments.length == 0) { return; }
    
    /**
     * The type name of the component.
     * This value is read-only.
     * @type String
     */
    this.componentType = null;
    
    /**
     * The render id.
     * This value is read-only.
     * @type String
     */
    this.renderId = renderId ? renderId : "cl_" + ++EchoApp.Component._nextRenderId;
    
    /**
     * The parent component.
     * This value is read-only.
     * @type EchoApp.Component
     */
    this.parent = null;
    
    /**
     * Array of child components.
     * This value is read-only.
     * @type Array
     */
    this.children = new Array();
    
    /**
     * The registered application.
     * This value is read-only.
     * @type EchoApp.Application
     */
    this.application = null;
    
    /**
     * Listener list.  Lazily created.
     * @private
     * @type EchoCore.ListenerList
     */
    this._listenerList = null;
    
    /**
     * Internal style used to store properties set directly on component.
     * @private
     * @type EchoApp.Style
     */
    this._localStyle = new EchoApp.Style();
    
    /**
     * Referenced external style
     * @private
     * @type EchoApp.Style
     */
    this._style = null;
    
    /**
     * Assigned style name from application-level style sheet.
     * @private
     * @type String
     */
    this._styleName = null;

    /**
     * Assigned style type from application-level style sheet.
     * @private
     * @type String
     */
    this._styleType = null;
};

EchoApp.Component.NOTIFY_CHILDREN = 1;

/**
 * The next automatically assigned client render id.
 * @private
 * @type Number
 */
EchoApp.Component._nextRenderId = 0;

/**
 * Adds a component as a child.
 * 
 * @param {EchoApp.Component} component the component to add
 * @param {Number} index the (integer) index at which to add it (optional, omission
 *        will cause component to be appended to end)
 */
EchoApp.Component.prototype.add = function(component, index) {
    if (!(component instanceof EchoApp.Component)) {
        throw new Error("Cannot add child: specified component object is not derived from EchoApp.Component.");
    }
    if (!this.componentType) {
        throw new Error("Cannot add child: specified component object does not have a componentType property. "
                + "Perhaps the EchoApp.Component() super-constructor was not invoked." + this.toString() + "::::" + component.toString());
    }
    if (!this.renderId) {
        throw new Error("Cannot add child: specified component object does not have a renderId.");
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
};

/**
 * Adds an arbitrary event listener.
 * 
 * @param {String} eventType the event type name
 * @param eventTarget the method to invoke when the event occurs 
 *        (the event will be passed as the single argument)
 *        (argument may be of type Function or EchoCore.MethodRef)
 */
EchoApp.Component.prototype.addListener = function(eventType, eventTarget) {
    if (this._listenerList == null) {
        this._listenerList = new EchoCore.ListenerList();
    }
    this._listenerList.addListener(eventType, eventTarget);
};

/**
 * Provides notification of an arbitrary event.
 * Listeners will be notified based on the event's type property.
 * 
 * @param {EchoCore.Event} event the event to fire
 */
EchoApp.Component.prototype.fireEvent = function(event) {
    if (this._listenerList == null) {
        return;
    }
    this._listenerList.fireEvent(event);
};

/**
 * Retrieves the child omponent at the specified index.
 * 
 * @param {Number} index the (integer) index
 * @return the child component
 * @type EchoApp.Component
 */
EchoApp.Component.prototype.getComponent = function(index) {
    return this.children[index];
};

/**
 * Returns the number of child components
 * 
 * @return the number of child components
 * @type Number
 */
EchoApp.Component.prototype.getComponentCount = function() {
    return this.children.length;
};

/**
 * Returns an arbitrary indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} index the index to return
 * @return the property value
 */
EchoApp.Component.prototype.getIndexedProperty = function(name, index) {
    return this._localStyle.getIndexedProperty(name, index);
};

/**
 * Returns the component layout direction.
 * 
 * @return the component layout direction
 * @type {EchoApp.LayoutDirection}
 */
EchoApp.Component.prototype.getLayoutDirection = function() {
    return this._layoutDirection;
};

/**
 * Returns an arbitrary property value.
 * 
 * @param {String} name the name of the property
 * @return the property value
 */
EchoApp.Component.prototype.getProperty = function(name) {
    return this._localStyle.getProperty(name);
};

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
EchoApp.Component.prototype.getRenderIndexedProperty = function(name, index, defaultValue) {
    var value = this.getIndexedProperty(name, index);
    if (value == null) {
        if (this._style != null) {
            value = this._style.getIndexedProperty(name, index);
        }
        if (value == null && this._styleName && this.application && this.application._styleSheet) {
            var style = this.application._styleSheet.getRenderStyle(this._styleName, 
                    this._styleType ? this._styleType : this.componentType);
            if (style) {
                value = style.getIndexedProperty(name, index);
            }
        }
    }
    return value == null ? defaultValue : value;
};

/**
 * Returns the layout direction with which the component should be
 * rendered, based on analyzing the component's layout direction,
 * its parent's, and/or the application's.
 * 
 * @return the rendering layout direction
 * @type EchoApp.LayoutDirection
 */
EchoApp.Component.prototype.getRenderLayoutDirection = function() {
    if (this._layoutDirection == null) { 
        if (this.parent == null) {
            if (this.application == null) {
                return null;
            } else {
                return this.application.getLayoutDirection();
            }
        } else {
            return this.parent.getRenderLayoutDirection();
        }
    } else {
        return this._layoutDirection;
    }
};

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
EchoApp.Component.prototype.getRenderProperty = function(name, defaultValue) {
    var value = this.getProperty(name);
    if (value == null) {
        if (this._style != null) {
            value = this._style.getProperty(name);
        }
        if (value == null && this._styleName && this.application && this.application._styleSheet) {
            var style = this.application._styleSheet.getRenderStyle(this._styleName, 
                    this._styleType ? this._styleType : this.componentType);
            if (style) {
                value = style.getProperty(name);
            }
        }
    }
    return value == null ? defaultValue : value;
};

/**
 * Returns the style assigned to this component, if any.
 * 
 * @return the assigned style
 * @type EchoApp.Style
 */
EchoApp.Component.prototype.getStyle = function() {
    return this._style;
};

/**
 * Returns the name of the style (from the application's style sheet) 
 * assigned to this component.
 * 
 * @return the style name
 * @type String
 */
EchoApp.Component.prototype.getStyleName = function() {
    return this._styleName;
};

/** 
 * Returns the type name of the style (from the application's style sheet)
 * assigned to this component.
 * This value may differ from the component type in the event
 * the component is a derivative of the type specified in the style sheet
 * 
 * @return the style type
 * @type String
 */
EchoApp.Component.prototype.getStyleType = function() {
    return this._styleType;
};

/**
 * Returns the index of a child component, or -1 if the component
 * is not a child.
 * 
 * @param {EchoApp.Component} component the component
 * @return the index
 * @type Number
 */
EchoApp.Component.prototype.indexOf = function(component) {
    for (var i = 0; i < this.children.length; ++i) {
        if (this.children[i] == component) {
            return i;
        }
    }
    return -1;
};

/**
 * Retrieves local style property map associations.
 * This method should only be used by a deserialized for
 * the purpose of rapidly loading properties into a new
 * component.
 * 
 * @return the internal style property map associations
 *         (an associative array).
 */
EchoApp.Component.prototype.getLocalStyleData = function() {
    return this._localStyle._properties;
};

/**
 * Determines if the component is active, that is, within the current modal context
 * and ready to receive input.
 * 
 * @return the active state
 * @type Boolean
 */
EchoApp.Component.prototype.isActive = function() {
    // FIXME implement this
    return true;
};

/**
 * Determines if this component is or is an ancestor of another component.
 * 
 * @param {EchoApp.Component} c the component to test
 * @return true if an ancestor relationship exists
 * @type Boolean
 */
EchoApp.Component.prototype.isAncestorOf = function(c) {
    while (c != null && c != this) {
        c = c.parent;
    }
    return c == this;
};

/**
 * Registers / unregisters a component that has been 
 * added/removed to/from a registered hierarchy
 * (a hierarchy that is registered to an application).
 * 
 * @param {EchoApp.Application} application the application 
 *        (null to unregister the component)
 */
EchoApp.Component.prototype.register = function(application) {
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
	}

    // Link/unlink with application.
    this.application = application;

	if (application) { // registering

        // Notify application.
        this.application._registerComponent(this);
        
		if (this.children != null) {
			// Recursively register children.
		    for (var i = 0; i < this.children.length; ++i) {
		         this.children[i].register(application); // Recursively unregister children.
			}
		}
	}
};

/**
 * Removes a child component.
 * 
 * @param componentOrIndex 
 *        the index of the component to remove, or the component to remove
 *        (values may be of type EchoApp.Component or Number)
 */
EchoApp.Component.prototype.remove = function(componentOrIndex) {
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
};

/**
 * Removes all child components.
 */
EchoApp.Component.prototype.removeAll = function() {
    //TODO Implement
};

/**
 * Removes an arbitrary event listener.
 * 
 * @param {String} eventType the event type name
 * @param eventTarget the method to invoke when the event occurs 
 *        (the event will be passed as the single argument)
 *        (values may be of type Function or EchoCore.MethodRef)
 */
EchoApp.Component.prototype.removeListener = function(eventType, eventTarget) {
    if (this._listenerList == null) {
        return;
    }
    this._listenerList.removeListener(eventType, eventTarget);
};

/** 
 * Sets the value of an indexed property in the internal style.
 * 
 * @param {String} name the name of the property
 * @param {Number} index the index of the property
 * @param newValue the new value of the property
 */
EchoApp.Component.prototype.setIndexedProperty = function(name, index, newValue) {
    var oldValue = this._localStyle.getIndexedProperty(name, index);
    this._localStyle.setIndexedProperty(name, index, newValue);
    if (this.application) {
        this.application.notifyComponentUpdate(this, name, oldValue, newValue);
    }
};

/**
 * Sets a component-specific layout direction.
 * 
 * @param {EchoApp.LayoutDirection} newValue the new layout direction
 */
EchoApp.Component.prototype.setLayoutDirection = function(newValue) {
    this._layoutDirection = newValue;
};

/** 
 * Sets the value of a property in the internal style.
 * 
 * @param {String} name the name of the property
 * @param value the new value of the property
 */
EchoApp.Component.prototype.setProperty = function(name, newValue) {
    var oldValue = this._localStyle.getProperty(name);
    this._localStyle.setProperty(name, newValue);
    if (this._listenerList && this._listenerList.hasListeners("property")) {
        var e = new EchoCore.Event(this, "property")
        e.propertyName = name;
        e.oldValue = oldValue;
        e.newValue = newValue;
        this._listenerList.fireEvent(e);
    }
    if (this.application) {
        this.application.notifyComponentUpdate(this, name, oldValue, newValue);
    }
};

/**
 * Sets the style of the component.
 * 
 * @param {EchoApp.Style} newValue the new style
 */
EchoApp.Component.prototype.setStyle = function(newValue) {
    var oldValue = this._style;
    this._style = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "style", oldValue, newValue);
    }
};

/**
 * Sets the name of the style (from the application's style sheet) 
 * assigned to this component.
 * 
 * @param {String} newValue the style name
 */
EchoApp.Component.prototype.setStyleName = function(newValue) {
    var oldValue = this._styleName;
    this._styleName = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "styleName", oldValue, newValue);
    }
};

/** 
 * Sets the type name of the style (from the application's style sheet)
 * assigned to this component.
 * This value may differ from the component type in the event
 * the component is a derivative of the type specified in the style sheet
 * 
 * @param {String} newValue the style type
 */
EchoApp.Component.prototype.setStyleType = function(newValue) {
    var oldValue = this._styleType;
    this._styleType = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "styleType", oldValue, newValue);
    }
};

/**
 * Returns a string representation of the component (default implementation).
 * 
 * @param {Boolean} longFormat an optional flag specifying whether all information about
 *        the component should be displayed (e.g., property values)
 * @return a string representation of the component
 * @type String
 */
EchoApp.Component.prototype.toString = function(longFormat) {
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
};

/**
 * Layout Data Object, describing how a child component is rendered/laid out 
 * within its parent container.
 * 
 * @param properties an associative array containing the initial properties of the layout data
 * @constructor
 */
EchoApp.LayoutData = function(properties) {
    this._localStyle = new EchoApp.Style(properties);
};

/**
 * Retrieves an indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) property index
 */
EchoApp.LayoutData.prototype.getIndexedProperty = function(name, index) {
    return this._localStyle.getIndexedProperty(name, index);
};

/**
 * Retrieves a property value.
 * 
 * @param {String} name the name of the property
 * @return the property value
 */
EchoApp.LayoutData.prototype.getProperty = function(name) {
    return this._localStyle.getProperty(name);
};

/**
 * Sets an indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) property index
 * @param newValue the new property value
 */
EchoApp.LayoutData.prototype.setIndexedProperty = function(name, index, newValue) {
    this._localStyle.setIndexedProperty(name, index, newValue);
};

/**
 * Sets a property value.
 * 
 * @param {String} name the name of the property
 * @param value the new property value
 */
EchoApp.LayoutData.prototype.setProperty = function(name, newValue) {
    this._localStyle.setProperty(name, newValue);
};

/**
 * LayoutDirection property.  Do not instantiate, use LTR/RTL constants.
 * @constructor
 */
EchoApp.LayoutDirection = function() {

    /**
     * Flag indicating whether layout direction is left-to-right.
     * @type Boolean 
     */
    this._ltr = arguments[0];
};

/**
 * Determines if the layout direction is left-to-right.
 * 
 * @return true if the layout direction is left-to-right
 * @type Boolean
 */
EchoApp.LayoutDirection.prototype.isLeftToRight = function() {
    return this._ltr;
};

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

/**
 * Namespace for properties.  Non-instantiable object.
 */
EchoApp.Property = function() { };

/**
 * Creates an alignment property.
 *
 * @class Alignment property.
 * @param {Number} horizontal the horizontal alignment setting, one of the 
 *        following values:
 *        <ul>
 *         <li>EchoApp.Property.Alignment.DEFAULT</li>
 *         <li>EchoApp.Property.Alignment.LEADING</li>
 *         <li>EchoApp.Property.Alignment.TRAILING</li>
 *         <li>EchoApp.Property.Alignment.LEFT</li>
 *         <li>EchoApp.Property.Alignment.CENTER</li>
 *         <li>EchoApp.Property.Alignment.RIGHT</li>
 *        </ul>
 * @param {Number} vertical the vertical alignment setting, one of the 
 *        following values:
 *        <ul>
 *         <li>EchoApp.Property.Alignment.DEFAULT</li>
 *         <li>EchoApp.Property.Alignment.TOP</li>
 *         <li>EchoApp.Property.Alignment.CENTER</li>
 *         <li>EchoApp.Property.Alignment.BOTTOM</li>
 *        </ul>
 * @constructor
 */
EchoApp.Property.Alignment = function(horizontal, vertical) {

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
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.Alignment.prototype.className = "Alignment";

/**
 * Value for horizontal/vertical setting indicating default alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.DEFAULT = 0;

/**
 * Value for horizontal setting indicating leading alignment
 * (actual value will be left or right, depending on layout direction).
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.LEADING = 1;

/**
 * Value for horizontal setting indicating trailing alignment
 * (actual value will be left or right, depending on layout direction).
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.TRAILING = 2;

/**
 * Value for horizontal setting indicating left alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.LEFT = 3;

/**
 * Value for horizontal/vertical setting indicating centered alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.CENTER = 4;

/**
 * Value for horizontal setting indicating right alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.RIGHT = 5;

/**
 * Value for vertical setting indicating top alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.TOP = 6;

/**
 * Value for vertical setting indicating bottom alignment.
 * @type Number
 * @final
 */
EchoApp.Property.Alignment.BOTTOM = 7;

/**
 * Creates a border property. 
 * @class Border property.
 * @constructor
 */
EchoApp.Property.Border = function() {
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
         * @type EchoApp.Property.Extent
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
         * @type EchoApp.Property.Color
         */
        this.color = this.sides[0].color;
    } else if (arguments.length == 1 && typeof arguments[0] == "string") {
        this.multisided = false;
        var items = arguments[0].split(" ");
        if (items.length != 3) {
            throw new Error("Invalid border string: " + arguments[0]);
        }
        this.size = new EchoApp.Property.Extent(items[0]);
        this.style = items[1];
        this.color = new EchoApp.Property.Color(items[2]);
    } else if (arguments.length == 3) {
        this.multisided = false;
        this.size = arguments[0];
        this.style = arguments[1];
        this.color = arguments[2];
    }
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.Border.prototype.className = "Border";

/**
 * Creates a border side.
 * @class Border side sub-property.
 * @constructor
 */
EchoApp.Property.Border.Side = function() {
    if (arguments.length == 1 && typeof arguments[0] == "string") {
        var items = arguments[0].split(" ");
        if (items.length != 3) {
            throw new Error("Invalid border string: " + arguments[0]);
        }
        
        /** 
         * Border side size
         * @type EchoApp.Property.Extent
         */ 
        this.size = new EchoApp.Property.Extent(items[0]);
        
        /** 
         * Border side style
         * @type Number
         */ 
        this.style = items[1];

        /** 
         * Border side color
         * @type EchoApp.Property.Color
         */ 
        this.color = new EchoApp.Property.Color(items[2]);
    }
};

/**
 * Creates a color property.
 * @class Color property.
 * @constructor
 * @param value the color hex value
 */
EchoApp.Property.Color = function(value) {
    
    /**
     * The hexadecimal value of the color, e.g., #ab12c3.
     * @type String
     */
    this.value = value;
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.Color.prototype.className = "Color";

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
 * @class Extent property.
 * @constructor
 */
EchoApp.Property.Extent = function() {
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
        var parts = EchoApp.Property.Extent._PATTERN.exec(arguments[0]);
        if (!parts) {
            throw new Error("Invalid Extent: " + arguments[0]);
        }
        this.value = parseFloat(parts[1]);
        this.units = parts[2] ? parts[2] : "px";
    }
};

/**
 * Regular expression to parse string based extents, e.g., "20px".
 * Returned part 1 is the value, part 2 is the units (or blank).
 */
EchoApp.Property.Extent._PATTERN = /^(-?\d+(?:\.\d+)?)(.+)?$/;

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.Extent.prototype.className = "Extent";

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Property.Extent.prototype.toString = function() {
    return this.value + this.units;
};

/**
 * Creates a FillImage property.
 * 
 * @param {EchoApp.Property.ImageReference} the image (may also be a string,
 *        at which point an ImageReference will be automatically constructed
 *        with the string as its URL).
 * @param {Number} repeat the image repeat mode, one of the following values:
 *        <ul>
 *         <li>EchoApp.Property.FillImage.NO_REPEAT</li>
 *         <li>EchoApp.Property.FillImage.REPEAT_X</li>
 *         <li>EchoApp.Property.FillImage.REPEAT_Y</li>
 *         <li>EchoApp.Property.FillImage.REPEAT_ALL</li>
 *        </ul>
 *         
 * @param {EchoApp.Property.Extent} the horizontal alignment/position of the image
 * @param {EchoApp.Property.Extent} the vertical alignment/position of the image
 * @class FillImage property.  Describes a repeating image, typically used as a background.
 * @constructor
 */
EchoApp.Property.FillImage = function(image, repeat, x, y) {
    if (image instanceof EchoApp.Property.ImageReference) {
        /**
         * The image.
         * @type EchoApp.Property.ImageReference
         */
        this.image = image;
    } else {
        this.image = new EchoApp.Property.ImageReference(image);
    }
    /**
     * The repeat configuration, one of the following values:
     * <ul>
     *  <li>EchoApp.Property.FillImage.NO_REPEAT</li>
     *  <li>EchoApp.Property.FillImage.REPEAT_X</li>
     *  <li>EchoApp.Property.FillImage.REPEAT_Y</li>
     *  <li>EchoApp.Property.FillImage.REPEAT_ALL</li>
     * </ul>
     * @type Number
     */
    this.repeat = repeat;
    if (x == null || x instanceof EchoApp.Property.Extent) {
        /**
         * The horizontal aligment/position of the image.
         * @type EchoApp.Property.Extent
         */
        this.x = x;
    } else {
        this.x = new EchoApp.Property.Extent(x);
    }
    if (y == null || y instanceof EchoApp.Property.Extent) {
        /**
         * The vertical aligment/position of the image.
         * @type EchoApp.Property.Extent
         */
        this.y = y;
    } else {
        this.y = new EchoApp.Property.Extent(y);
    }
};

/**
 * Repeat value constant indicating the image should not repeat.
 * @type Number
 * @final
 */
EchoApp.Property.FillImage.NO_REPEAT = 0;

/**
 * Repeat value constant indicating the image should repeat horizontally.
 * @type Number
 * @final
 */
EchoApp.Property.FillImage.REPEAT_HORIZONTAL = 1;

/**
 * Repeat value constant indicating the image should repeat vertically.
 * @type Number
 * @final
 */
EchoApp.Property.FillImage.REPEAT_VERTICAL = 2;

/**
 * Repeat value constant indicating the image should repeat horizontally and vertically.
 * @type Number
 * @final
 */
EchoApp.Property.FillImage.REPEAT = 3;

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.FillImage.prototype.className = "FillImage";

/**
 * Creates a FillImageBorder
 * 
 * @param {EchoApp.Property.Color} color the border background color (specify null to enable
 *        a transparent background, such that alpha-rendered PNGs will render properlty)
 * @param {EchoApp.Property.Insets} borderInsets describes the width and 
 *        height of the border images, i.e. the inset to which the border images
 *        extend inward from the outer edges of the box
 * @param {EchoApp.Property.Insets} contentInsets describes the inset of
 *        the content displayed within the border  (if the content inset is less
 *        than the border inset, the content will be drawn above the border)    
 * @class FillImageBorder property.  A border which is rendered using FillImages to
 *        represent each side and each corner, and with configurable Insets to define 
 *        the border size. 
 * @constructor
 */
EchoApp.Property.FillImageBorder = function(color, borderInsets, contentInsets, fillImages) {
    if (color == null || color instanceof EchoApp.Property.Color) {
        /**
         * The border background color.
         * @type EchoApp.Property.Color
         */
        this.color = color;
    } else {
        this.color = new EchoApp.Property.Color(color);
    }
    if (borderInsets == null || borderInsets instanceof EchoApp.Property.Insets) {
        /**
         * The border insets 
         * (effectively defines the sizes of the cells where the border FillImages are rendered).
         * @type EchoApp.Property.Insets 
         */
        this.borderInsets = borderInsets;
    } else {
        this.borderInsets = new EchoApp.Property.Insets(borderInsets);
    }
    if (contentInsets == null || contentInsets instanceof EchoApp.Property.Insets) {
        /**
         * The content insets (defines the content area inside of the border, if smaller than the
         * border insets, the content will overlap the border).
         * 
         * @type EchoApp.Property.Insets 
         */
        this.contentInsets = contentInsets;
    } else {
        this.contentInsets = new EchoApp.Property.Insets(contentInsets);
    }
    
    /**
     * An array containing eight fill images, specifying the images used for the
     * top-left, top, top-right, left, right, bottom-left, bottom, and bottom-right
     * images in that order.
     * @type Array
     */
    this.fillImages = fillImages ? fillImages : new Array(8);
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.FillImageBorder.prototype.className = "FillImageBorder";

/**
 * Creates a Font property.
 * 
 * @param typeface the typeface of the font, may be a string or an array of strings
 * @param {Number} style the style of the font, one or more of the following values ORed together:
 *        <ul>
 *         <li>EchoApp.Property.Font.PLAIN</li>
 *         <li>EchoApp.Property.Font.BOLD</li>
 *         <li>EchoApp.Property.Font.ITALIC</li>
 *         <li>EchoApp.Property.Font.UNDERLINE</li>
 *         <li>EchoApp.Property.Font.OVERLINE</li>
 *         <li>EchoApp.Property.Font.LINE_THROUGH</li>
 *        </ul>
 * @param {EchoApp.Property.Extent} size the size of the font
 * @class Font property
 * @constructor
 */
EchoApp.Property.Font = function(typeface, style, size) {
    
    /**
     * The typeface of the font, may be a string or an array of strings.
     */
    this.typeface = typeface;
    
    /**
     * The style of the font, one or more of the following values ORed together:
     * <ul>
     *  <li>EchoApp.Property.Font.PLAIN</li>
     *  <li>EchoApp.Property.Font.BOLD</li>
     *  <li>EchoApp.Property.Font.ITALIC</li>
     *  <li>EchoApp.Property.Font.UNDERLINE</li>
     *  <li>EchoApp.Property.Font.OVERLINE</li>
     *  <li>EchoApp.Property.Font.LINE_THROUGH</li>
     * </ul>
     * @type Number
     */
    this.style = style;
    
    if (typeof size == "number") {
        /**
         * The size of the font.
         * 
         * @type EchoApp.Property.Extent
         */
        this.size = new Extent(size);
    } else {
        this.size = size;
    }
};

/**
 * Style constant representing a plain font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.PLAIN = 0x0;

/**
 * Style constant representing a bold font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.BOLD = 0x1;

/**
 * Style constant representing a italic font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.ITALIC = 0x2;

/**
 * Style constant representing an underlined font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.UNDERLINE = 0x4;

/**
 * Style constant representing an overlined font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.OVERLINE = 0x8;

/**
 * Style constant representing a line-through (strikethrough) font.
 * @type Number
 * @final
 */
EchoApp.Property.Font.LINE_THROUGH = 0x10;

/**
 * Creates a new Image Reference.
 * 
 * @param {String} url the URL from which the image may be obtained
 * @param {EchoApp.Property.Extent} width the width of the image
 * @param {EchoApp.Property.Extent} height the height of the image
 * @class Image Reference Property.
 * @constructor
 */
EchoApp.Property.ImageReference = function(url, width, height) {
    /**
     * The URL from which the image may be obtained.
     * @type String
     */
    this.url = url;
    
    /**
     * The width of the image.
     * @type EchoApp.Property.Extent
     */
    this.width = width;

    /**
     * The height of the image.
     * @type EchoApp.Property.Extent
     */
    this.height = height;
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.ImageReference.prototype.className = "ImageReference";

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
 * @class Insets property.  Describes inset margins within a box.
 * @constructor
 */
EchoApp.Property.Insets = function() {
    var values;
    if (arguments.length == 1) {
        if (typeof arguments[0] == "string") {
            values = arguments[0].split(" ");
        } else {
            values = arguments;
        }
    } else {
        values = arguments;
    }
    
    for (var i = 0; i < values.length; ++i) {
        if (!(values[i] instanceof EchoApp.Property.Extent)) {
            values[i] = new EchoApp.Property.Extent(values[i]);
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
         * @type EchoApp.Property.Extent
         */
        this.top = values[0];
        /**
         * The right inset size.
         * @type EchoApp.Property.Extent
         */
        this.right = values[1];
        /**
         * The bottom inset size.
         * @type EchoApp.Property.Extent
         */
        this.bottom = values[2];
        /**
         * The left inset size.
         * @type EchoApp.Property.Extent
         */
        this.left = values[3];
        break;
    default:
        throw new Error("Invalid Insets construction parameters: " + values);
    }
};

/**
 * Property class name.
 * @type String
 * @final
 */
EchoApp.Property.Insets.prototype.className = "Insets";

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Property.Insets.prototype.toString = function() {
    return this.top + " " + this.right + " " + this.bottom + " " + this.left;
};

/**
 * @class Component Style.
 * @param properties (optional) the initial property mapping as an associative array
 * @constructor
 */
EchoApp.Style = function(properties) {
    this._properties = properties ? properties : new Object();
};

/**
 * Returns the value of an indexed property.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) index of the property
 * @return the property value  
 */
EchoApp.Style.prototype.getIndexedProperty = function(name, index) {
    var indexValues = this._properties[name];
    if (!indexValues) {
        return null;
    }
    return indexValues[index];
};

/**
 * Returns the value of a property.
 * 
 * @param {String} name the name of the property
 * @return the property value  
 */
EchoApp.Style.prototype.getProperty = function(name) {
    return this._properties[name];
};

/**
 * Sets the value of an indexed property.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) index of the property
 * @param value the new value of the property 
 */
EchoApp.Style.prototype.setIndexedProperty = function(name, index, value) {
    var indexValues = this._properties[name];
    if (!indexValues) {
        indexValues = new Array();
        this._properties[name] = indexValues;
    }
    indexValues[index] = value;
};

/**
 * Sets the value of a property.
 * 
 * @param {String} name the name of the property
 * @param value the new value of the property 
 */
EchoApp.Style.prototype.setProperty = function(name, newValue) {
    this._properties[name] = newValue;
};

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Style.prototype.toString = function() {
    var outArray = new Array();
    for (var x in this._properties) {
        outArray.push(x + "=" + this._properties[x]);
    }
    return outArray.toString();
};

/**
 * An application style sheet.
 */
EchoApp.StyleSheet = function() {
    this._nameToStyleMap = new Object();
};

/**
 * Returns the style that should be used for a component.
 * 
 *  @param {String} name the component's style name
 *  @param {String} componentType the type of the component
 *  @return the style
 *  @type EchoApp.Style
 */
EchoApp.StyleSheet.prototype.getRenderStyle = function(name, componentType) {
    //FIXME. Does not query super component types.
    return this.getStyle(name, componentType);
};

/**
 * Retrieves a specific style from the style sheet.
 * 
 * @param {String} name the style name
 * @param {String} componentType the component type
 * @return the style
 * @type EchoApp.Style
 */
EchoApp.StyleSheet.prototype.getStyle = function(name, componentType) {
    var typeToStyleMap = this._nameToStyleMap[name];
    if (typeToStyleMap == null) {
        return null;
    }
    return typeToStyleMap[componentType];
};

/**
 * Stores a style in the style sheet.
 * 
 * @param {String} name the style name
 * @param {String} componentType the component type
 * @param {EchoApp.Style} the style
 */
EchoApp.StyleSheet.prototype.setStyle = function(name, componentType, style) {
    var typeToStyleMap = this._nameToStyleMap[name];
    if (typeToStyleMap == null) {
        typeToStyleMap = new Object();
        this._nameToStyleMap[name] = typeToStyleMap;
    }
    typeToStyleMap[componentType] = style;
};

/**
 * Namespace for update management.  Non-instantiable object.
 * Provides capabilities for storing property changes made to applications and components
 * such that display redraws may be performed efficiently. 
 */
EchoApp.Update = function() { };

/**
 * Creates a new ComponentUpdate.
 * 
 * @constructor
 * @param parent the updated component
 * @class Representation of an update to a single existing component 
 *        which is currently rendered on the screen.
 */
EchoApp.Update.ComponentUpdate = function(manager, parent) {

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
};

/**
 * Records the addition of a child to the parent component.
 * 
 * @param {EchoApp.Component} child the added child
 * @private
 */
EchoApp.Update.ComponentUpdate.prototype._addChild = function(child) {
    if (!this._addedChildIds) {
        this._addedChildIds = new Array();
    }
    this._addedChildIds.push(child.renderId);
    this._manager._idMap[child.renderId] = child;
};

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
EchoApp.Update.ComponentUpdate.prototype._appendRemovedDescendants = function(update) {
    // Append removed descendants.
    if (update._removedDescendantIds != null) {
        if (this._removedDescendantIds == null) {
            this._removedDescendantIds = new Array();
        }
        for (var x in update._removedDescendantIds) {
            this._removedDescendantIds.push(x);
        }
    }
    
    // Append removed children.
    if (update._removedChildIds != null) {
        if (this._removedDescendantIds == null) {
            this._removedDescendantIds = new Array();
        }
        for (var x in update._removedChildIds) {
            this._removedDescendantIds.push(x);
        }
    }
    
    if (this._removedDescendantIds != null) {
	    EchoCore.Arrays.removeDuplicates(this._removedDescendantIds);
    }
};

EchoApp.Update.ComponentUpdate.prototype.getAddedChildren = function() {
    if (!this._addedChildIds) {
        return null;
    }
    var components = new Array(this._addedChildIds.length);
    for (var i = 0; i < this._addedChildIds.length; ++i) {
        components[i] = this._manager._idMap[this._addedChildIds[i]];
    }
    return components;
};

EchoApp.Update.ComponentUpdate.prototype.getRemovedChildren = function() {
    if (!this._removedChildIds) {
        return null;
    }
    var components = new Array(this._removedChildIds.length);
    for (var i = 0; i < this._removedChildIds.length; ++i) {
        components[i] = this._manager._idMap[this._removedChildIds[i]];
    }
    return components;
};

EchoApp.Update.ComponentUpdate.prototype.getRemovedDescendants = function() {
    if (!this._removedDescendantIds) {
        return null;
    }
    var components = new Array(this._removedDescendantIds.length);
    for (var i = 0; i < this._removedDescendantIds.length; ++i) {
        components[i] = this._manager._idMap[this._removedDescendantIds[i]];
    }
    return components;
};

EchoApp.Update.ComponentUpdate.prototype.getUpdatedLayoutDataChildren = function() {
    if (!this._updatedLayoutDataChildIds) {
        return null;
    }
    var components = new Array(this._updatedLayoutDataChildIds.length);
    for (var i = 0; i < this._updatedLayoutDataChildIds.length; ++i) {
        components[i] = this._manager._idMap[this._updatedLayoutDataChildIds[i]];
    }
    return components;
};

EchoApp.Update.ComponentUpdate.prototype.hasUpdatedLayoutDataChildren= function() {
    return this._updatedLayoutDataChildIds != null;
};

/**
 * Determines if this update is updating properties.
 * 
 * @return true if properties are being updated.
 * @type Boolean
 */
EchoApp.Update.ComponentUpdate.prototype.hasUpdatedProperties = function() {
    return this._propertyUpdates != null;
};

/**
 * Returns a <code>PropertyUpdate</code> describing an update to the
 * property with the given <code>name</code>.
 * 
 * @param name the name of the property being updated
 * @return the <code>PropertyUpdate</code>, or null if none exists.
 */
EchoApp.Update.ComponentUpdate.prototype.getUpdatedProperty = function(name) {
    if (this._propertyUpdates == null) {
    	return null;
    }
    return this._propertyUpdates[name];
};

/**
 * Returns the names of all properties being updated in this update.
 * 
 * @return the names of all updated properties, if no properties are updated an
 * 		empty array is returned.
 * @type Array
 */
EchoApp.Update.ComponentUpdate.prototype.getUpdatedPropertyNames = function() {
    if (this._propertyUpdates == null) {
    	return new Array();
    }
    var updatedPropertyNames = new Array();
    for (var i in this._propertyUpdates) {
    	updatedPropertyNames.push(i);
    }
    return updatedPropertyNames;
};

/**
 * Records the removal of a child from the parent component.
 * 
 * @param {EchoApp.Component} child the removed child
 * @private
 */
EchoApp.Update.ComponentUpdate.prototype._removeChild = function(child) {
    this._manager._idMap[child.renderId] = child;

    if (this._addedChildIds) {
        // Remove child from add list if found.
        EchoCore.Arrays.remove(this._addedChildIds, child.renderId);
    }
    
    if (this._updatedLayoutDataChildIds) {
        // Remove child from updated layout data list if found.
        EchoCore.Arrays.remove(this._updatedLayoutDataChildIds, child.renderId);
    }

    if (!this._removedChildIds) {
        this._removedChildIds = new Array();
    }
    
    this._removedChildIds.push(child.renderId);

    for (var i = 0; i < child.children.length; ++i) {
        this._removeDescendant(child.children[i]);
    }
};

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
EchoApp.Update.ComponentUpdate.prototype._removeDescendant = function(descendant) {
    this._manager._idMap[descendant.renderId] = descendant;
    if (!this._removedDescendantIds) {
        this._removedDescendantIds = new Array();
    }
    this._removedDescendantIds.push(descendant.renderId);
    for (var i = 0; i < descendant.children.length; ++i) {
        this._removeDescendant(descendant.children[i]);
    }
};

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Update.ComponentUpdate.prototype.toString = function() {
    var s = "ComponentUpdate\n";
    s += "- Parent: " + this.parent + "\n";
    s += "- Adds: " + this._addedChildIds + "\n";
    s += "- Removes: " + this._removedChildIds + "\n";
    s += "- DescendantRemoves: " + this._removedDescendantIds + "\n";
    s += "- Properties: " + this._propertyUpdates + "\n";
    s += "- LayoutDatas: " + this._updatedLayoutDataChildIds + "\n";
    return s;
};

/**
 * Records the update of the LayoutData of a child component.
 * 
 * @param the child component whose layout data was updated
 * @private
 */
EchoApp.Update.ComponentUpdate.prototype._updateLayoutData = function(child) {
    this._manager._idMap[child.renderId] = child;
	if (this._updatedLayoutDataChildIds == null) {
		this._updatedLayoutDataChildIds = new Array();
	}
	this._updatedLayoutDataChildIds.push(child.renderId);
};

/**
 * Records the update of a property of the parent component.
 * 
 * @param propertyName the name of the property
 * @param oldValue the previous value of the property
 * @param newValue the new value of the property
 * @private
 */
EchoApp.Update.ComponentUpdate.prototype._updateProperty = function(propertyName, oldValue, newValue) {
    if (this._propertyUpdates == null) {
        this._propertyUpdates = new Object();
    }
	var propertyUpdate = new EchoApp.Update.ComponentUpdate.PropertyUpdate(oldValue, newValue);
	this._propertyUpdates[propertyName] = propertyUpdate;
};

/**
 * Data object representing the old and new states of a changed property.
 *
 * @param oldValue the old value of the property
 * @param newValue the new value of the property
 */
EchoApp.Update.ComponentUpdate.PropertyUpdate = function(oldValue, newValue) {
    this.oldValue = oldValue;
    this.newValue = newValue;
};

/**
 * Creates a new Update Manager.
 *
 * @constructor
 * @class Monitors and records updates made to the application between repaints.
 *        Provides API to determine changes to component hierarchy since last update
 *        in order to efficiently repaint the screen.
 * @param {EchoApp.Application} application the supported application
 */
EchoApp.Update.Manager = function(application) {
    
    /**
     * Associative mapping between component ids and EchoApp.Update.ComponentUpdate
     * instances.
     * @type Object
     */
    this._componentUpdateMap = new Object();

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
    
    this._listenerList = new EchoCore.ListenerList();
    
    /**
     * Associative mapping between component ids and component instances for all
     * updates held in this manager object.
     */
    this._idMap = new Object();

    /** 
     * The id of the last parent component whose child was analyzed by
     * _isAncestorBeingAdded() that resulted in that method returning false.
     * This id is stored for performance optimization purposes.
     * @type String
     */
    this._lastAncestorTestParentId = null;


};

/**
 * Adds a listener to receive notification of update events.
 * 
 * @param l the listener to add (may be a function or EchoCore.MethodRef)
 */
EchoApp.Update.Manager.prototype.addUpdateListener = function(l) {
    this._listenerList.addListener("update", l);
};

/**
 * Creates a new ComponentUpdate object (or returns an existing one) for a
 * specific parent component.
 * 
 * @private
 * @param {EchoApp.Component} parent the parent Component
 * @return a ComponentUpdate instance for that Component
 * @type EchoApp.Update.ComponentUpdate 
 */
EchoApp.Update.Manager.prototype._createComponentUpdate = function(parent) {
    this._hasUpdates = true;
    var update = this._componentUpdateMap[parent.renderId];
    if (!update) {
        update = new EchoApp.Update.ComponentUpdate(this, parent);
        this._componentUpdateMap[parent.renderId] = update;
    }
    return update;
};

/**
 * Permanently disposes of the Update Manager, freeing any resources.
 */
EchoApp.Update.Manager.prototype.dispose = function() {
    this.application = null;
};

/**
 * Notifies update listeners of an event.
 * 
 * @private
 */
EchoApp.Update.Manager.prototype._fireUpdate = function() {
    if (!this._listenerList.isEmpty()) {
        var e = new EchoCore.Event(this, "update");
        this._listenerList.fireEvent(e);
    }
};

/**
 * Returns the current pending updates.  Returns null in the event that that no pending updates exist.
 * 
 * @return an array containing all component updates (as EchoApp.Update.ComponentUpdates)
 * @type Array
 */
EchoApp.Update.Manager.prototype.getUpdates = function() {
    var updates = new Array();
    for (var key in this._componentUpdateMap) {
        updates.push(this._componentUpdateMap[key]);
    }
    return updates;
};

/**
 * Determines if any updates exist in the Update Manager.
 * 
 * @return true if any updates are present
 * @type Boolean
 */
EchoApp.Update.Manager.prototype.hasUpdates = function() {
    return this._hasUpdates;
};

/**
 * Determines if an ancestor of the specified component is being added.
 * 
 * @private
 * @param {EchoApp.Component} component the component to evaluate
 * @return true if the component or an ancestor of the component is being added
 * @type Boolean
 */
EchoApp.Update.Manager.prototype._isAncestorBeingAdded = function(component) {
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
};

/**
 * Processes a child addition to a component.
 * 
 * @private
 * @param {EchoApp.Component} parent the parent component
 * @param {EchoApp.Component} child the added child component
 */
EchoApp.Update.Manager.prototype._processComponentAdd = function(parent, child) {
    if (this.fullRefreshRequired) {
        return;
    }
    if (this._isAncestorBeingAdded(child)) {
        return;
    };
    var update = this._createComponentUpdate(parent);
    update._addChild(child);
};

/**
 * Process a layout data update to a child component.
 * 
 * @private
 * @param {EchoApp.Component} updatedComponent the updated component
 */
EchoApp.Update.Manager.prototype._processComponentLayoutDataUpdate = function(updatedComponent) {
    if (this.fullRefreshRequired) {
        return;
    }
    var parent = updatedComponent.parent;
    if (parent == null || this._isAncestorBeingAdded(parent)) {
        return;
    }
    var update = this._createComponentUpdate(parent);
    update._updateLayoutData(updatedComponent);
};

/**
 * Processes a child removal from a component.
 * 
 * @private
 * @param {EchoApp.Component} parent the parent component
 * @param {EchoApp.Component} child the removed child component
 */
EchoApp.Update.Manager.prototype._processComponentRemove = function(parent, child) {
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
                 disposedIds = new Array();
             }
             disposedIds.push(testParentId);
         }
    }
    
    if (disposedIds != null) {
        for (var i = 0; i < disposedIds.length; ++i) {
            delete this._componentUpdateMap[disposedIds[i]];
        }
    }
};

/**
 * Processes a property update to a component.
 * 
 * @private
 * @component {EchoApp.Component} the updated component
 * @propertyName {String} the updated property name
 * @oldValue the previous value of the property
 * @newValue the new value of the property
 */
EchoApp.Update.Manager.prototype._processComponentPropertyUpdate = function(component, propertyName, oldValue, newValue) {
	if (this.fullRefreshRequired) {
		return;
	}
	if (this._isAncestorBeingAdded(component)) {
		return;
	}
	var update = this._createComponentUpdate(component);
	update._updateProperty(propertyName, oldValue, newValue);
};

/**
 * Processes component updates received from the application instance.
 */
EchoApp.Update.Manager.prototype._processComponentUpdate = function(parent, propertyName, oldValue, newValue) {
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
};

/**
 * Purges all updates from the manager.
 * Invoked after the client has repainted the screen.
 */
EchoApp.Update.Manager.prototype.purge = function() {
    this.fullRefreshRequired = false;
    this._componentUpdateMap = new Object();
    this._idMap = new Object();
    this._hasUpdates = false;
    this._lastAncestorTestParentId = null;
};

/**
 * Removes a listener from receiving notification of update events.
 * 
 * @param l the listener to remove (may be a function or EchoCore.MethodRef)
 */
EchoApp.Update.Manager.prototype.removeUpdateListener = function(l) {
    this._listenerList.removeListener("update", l);
};

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Update.Manager.prototype.toString = function() {
    var s = "[ UpdateManager ]\n";
    if (this.fullRefreshRequired) {
        s += "fullRefresh";
    } else {
		for (var key in this._componentUpdateMap) {
			s += this._componentUpdateMap[key];
		}
    }
    return s;
};

/**
 * Button component.
 * 
 * @constructor
 * @class Button component.
 * @base EchoApp.Component
 */
EchoApp.Button = function(renderId, text, icon) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "Button";
    if (text != null) {
        this.setProperty("text", text);
    }
    if (icon != null) {
        this.setProperty("icon", icon);
    }
};

EchoApp.Button.prototype = new EchoApp.Component;

/**
 * Programatically performs a button action.
 */
EchoApp.Button.prototype.doAction = function() {
    var e = new EchoCore.Event(this, "action");
    this.fireEvent(e);
};

/**
 * ToggleButton component.
 * 
 * @constructor
 * @class ToggleButton component.
 * @base EchoApp.Button
 */
EchoApp.ToggleButton = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ToggleButton";
};

EchoApp.ToggleButton.prototype = new EchoApp.Button;

/**
 * RadioButton component.
 * 
 * @constructor
 * @class RadioButton component.
 * @base EchoApp.ToggleButton
 */
EchoApp.RadioButton = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "RadioButton";
};

EchoApp.RadioButton.prototype = new EchoApp.ToggleButton;

/**
 * CheckBox component.
 * 
 * @constructor
 * @class CheckBox component.
 * @base EchoApp.ToggleButton
 */
EchoApp.CheckBox = function(renderId) {
    EchoApp.Component.call(this,  renderId);
    this.componentType = "CheckBox";
};

EchoApp.CheckBox.prototype = new EchoApp.ToggleButton;

/**
 * Creates a new Column.
 * 
 * @constructor
 * @class Column component.
 * @base EchoApp.Component
 */
EchoApp.Column = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "Column";
};

EchoApp.Column.prototype = new EchoApp.Component;

/**
 * Creates a new ContentPane.
 * 
 * @constructor
 * @class ContentPane component.
 * @base EchoApp.Component
 */
EchoApp.ContentPane = function(renderId) {
    this.pane = true;
    EchoApp.Component.call(this, renderId);
    this.componentType = "ContentPane";
};

EchoApp.ContentPane.prototype = new EchoApp.Component;

/**
 * Creates a new Grid.
 * 
 * @constructor
 * @class Grid component.
 * @base EchoApp.Component
 */
EchoApp.Grid = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "Grid";
};

EchoApp.Grid.prototype = new EchoApp.Component;

EchoApp.Grid.SPAN_FILL = -1;

/**
 * Creates a new Label.
 * 
 * @constructor
 * @class Label component.
 * @base EchoApp.Component
 */
EchoApp.Label = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "Label";
};

EchoApp.Label.prototype = new EchoApp.Component;

/**
 * Creates a new ListBox.
 * 
 * @constructor
 * @class ListBox component.
 * @base EchoApp.Component
 */
EchoApp.ListBox = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ListBox";
};

EchoApp.ListBox.prototype = new EchoApp.Component;

/**
 * Creates a new Row.
 * 
 * @constructor
 * @class Row component.
 * @base EchoApp.Component
 */
EchoApp.Row = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "Row";
};

EchoApp.Row.prototype = new EchoApp.Component;

/**
 * Creates a new SelectField.
 * 
 * @constructor
 * @class SelectField component.
 * @base EchoApp.Component
 */
EchoApp.SelectField = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "SelectField";
};

EchoApp.SelectField.prototype = new EchoApp.Component;

/**
 * Creates a new SplitPane.
 * 
 * @constructor
 * @class SplitPane component.
 * @base EchoApp.Component
 */
EchoApp.SplitPane = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "SplitPane";
};

EchoApp.SplitPane.prototype = new EchoApp.Component;

EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING = 0;
EchoApp.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING = 1;
EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT = 2;
EchoApp.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT = 3;
EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM = 4;
EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP = 5;

EchoApp.SplitPane.DEFAULT_SEPARATOR_POSITION = new EchoApp.Property.Extent("100px");
EchoApp.SplitPane.DEFAULT_SEPARATOR_SIZE_FIXED = new EchoApp.Property.Extent("0px");
EchoApp.SplitPane.DEFAULT_SEPARATOR_SIZE_RESIZABLE = new EchoApp.Property.Extent("4px");
EchoApp.SplitPane.DEFAULT_SEPARATOR_COLOR = new EchoApp.Property.Color("#3f3f4f");

EchoApp.SplitPane.OVERFLOW_AUTO = 0;
EchoApp.SplitPane.OVERFLOW_HIDDEN = 1;
EchoApp.SplitPane.OVERFLOW_SCROLL = 2;

/**
 * Creates a new TextField.
 * 
 * @constructor
 * @class TextField component.
 * @base EchoApp.Component
 */
EchoApp.TextField = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "TextField";
};

EchoApp.TextField.prototype = new EchoApp.Component;

/**
 * Creates a new WindowPane.
 * 
 * @constructor
 * @class WindowPane component.
 * @base EchoApp.Component
 */
EchoApp.WindowPane = function(renderId) {
    this.floatingPane = this.pane = true;
    EchoApp.Component.call(this, renderId);
    this.componentType = "WindowPane";
};

EchoApp.WindowPane.prototype = new EchoApp.Component;

/**
 * Programmatically perform a window closing operation.
 */
EchoApp.WindowPane.prototype.doWindowClosing = function() {
    var e = new EchoCore.Event(this, "close");
    this.fireEvent(e);
};

EchoApp.WindowPane.DEFAULT_BORDER = new EchoApp.Property.FillImageBorder("#4f4faf", 
        new EchoApp.Property.Insets("20px"), new EchoApp.Property.Insets("3px"));
EchoApp.WindowPane.DEFAULT_BACKGROUND = new EchoApp.Property.Color("#ffffff");
EchoApp.WindowPane.DEFAULT_FOREGROUND = new EchoApp.Property.Color("#000000");
EchoApp.WindowPane.DEFAULT_HEIGHT = new EchoApp.Property.Extent("200px");
EchoApp.WindowPane.DEFAULT_TITLE_HEIGHT = new EchoApp.Property.Extent("30px");
EchoApp.WindowPane.DEFAULT_WIDTH = new EchoApp.Property.Extent("400px");
EchoApp.WindowPane.DEFAULT_X = new EchoApp.Property.Extent("100px");
EchoApp.WindowPane.DEFAULT_Y = new EchoApp.Property.Extent("50px");
EchoApp.WindowPane.DEFAULT_MINIMUM_WIDTH = new EchoApp.Property.Extent("100px");
EchoApp.WindowPane.DEFAULT_MINIMUM_HEIGHT = new EchoApp.Property.Extent("100px");

EchoApp.ComponentFactory.registerType("Button", EchoApp.Button);
EchoApp.ComponentFactory.registerType("CheckBox", EchoApp.CheckBox);
EchoApp.ComponentFactory.registerType("Column", EchoApp.Column);
EchoApp.ComponentFactory.registerType("ContentPane", EchoApp.ContentPane);
EchoApp.ComponentFactory.registerType("Label", EchoApp.Label);
EchoApp.ComponentFactory.registerType("ListBox", EchoApp.ListBox);
EchoApp.ComponentFactory.registerType("RadioButton", EchoApp.RadioButton);
EchoApp.ComponentFactory.registerType("Row", EchoApp.Row);
EchoApp.ComponentFactory.registerType("SelectField", EchoApp.SelectField);
EchoApp.ComponentFactory.registerType("SplitPane", EchoApp.SplitPane);
EchoApp.ComponentFactory.registerType("TextField", EchoApp.TextField);
EchoApp.ComponentFactory.registerType("ToggleButton", EchoApp.ToggleButton);
EchoApp.ComponentFactory.registerType("WindowPane", EchoApp.WindowPane);
