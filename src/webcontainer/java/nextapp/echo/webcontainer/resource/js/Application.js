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
     * @type string 
     */
    this.rootComponentId = rootComponentId;

    /** 
     * Root component instance.
     * @type EchoApp.Component 
     */
    this.rootComponent = new EchoApp.Component("Root", this.rootComponentId);
    this.rootComponent.register(this);
    
    /** 
     * Root component of modal context.
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
 * Notifies listeners of a component update event.
 * 
 * The property name "children" indicates a child was added or removed.
 * If a child was added, the added child is provided as <code>newValue</code>
 * and the <code>oldValue</code> property is null.
 * If a child was removed, the removed child is provided as <code>oldValue</code>
 * and the <code>newValue</code> property is null.
 * 
 * @param {EchoApp.Component} parent the updated component
 * @param {String} propertyName the name of the updated property
 * @param oldValue the old value of the property
 * @param newValue the new value of the property
 * @private
 */
EchoApp.Application.prototype._fireComponentUpdate = function(parent, propertyName, oldValue, newValue) {
    var e = new EchoApp.Application.ComponentUpdateEvent(this, parent, propertyName, oldValue, newValue);
    this._listenerList.fireEvent(e);
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
    return this._layoutDirection;
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
    this._fireComponentUpdate(parent, propertyName, oldValue, newValue);
};

/**
 * Registers a component with the application.
 * Invoked when a component is added to a hierarchy of 
 * components that is registered with the application.
 * 
 * @param {EchoApp.Component} component the component to register
 */
EchoApp.Application.prototype.registerComponent = function(component) {
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
 */
EchoApp.Application.prototype.unregisterComponent = function(component) {
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
 */
EchoApp.ComponentFactory._typeToConstructorMap = new EchoCore.Collections.Map();

/**
 * Creates a new instance of an arbitrary component.
 * 
 * @param {String} typeName the type name of the component
 * @param {String} renderId the component render id
 * @return a newly instantiated component
 * @type  {EchoApp.Component}
 */
EchoApp.ComponentFactory.newInstance = function(typeName, renderId) {
    var typeConstructor = EchoApp.ComponentFactory._typeToConstructorMap.get(typeName);
    if (typeConstructor == null) {
        return new EchoApp.Component(typeName, renderId);
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
    EchoApp.ComponentFactory._typeToConstructorMap.put(typeName, typeConstructor);
};

/**
 * Base class for components.
 * Derived classes must invoke constructor with componentType (and optionally renderId) properties.
 * 
 * @param {String} componentType the component type
 * @param {String} renderId the render id
 * @constructor
 */
EchoApp.Component = function(componentType, renderId) {
    if (arguments.length == 0) { return; }
    
    /**
     * The type name of the component.
     * @type String
     */
    this.componentType = componentType;
    
    /**
     * The render id.
     * @type String
     */
    this.renderId = renderId ? renderId : "cl_" + ++EchoApp.Component._nextRenderId;
    
    /**
     * The parent component.
     * @type EchoApp.Component
     */
    this.parent = null;
    
    /**
     * Array of child components.
     * @type Array
     */
    this.children = new EchoCore.Collections.List();
    
    /**
     * The registered application.
     * @type EchoApp.Application
     */
    this.application = null;
    
    /**
     * Listener list.
     * @private
     * @type EchoCore.ListenerList
     */
    this._listenerList = null;
    
    /**
     * Internal style used to store properties set directly on component.
     * @private
     * @type EchoApp.Style
     */
    this._internalStyle = new EchoApp.Style();
    
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
        throw new Error("Cannot add child: specified component object does not have a componentType property."
                + "Perhaps the EchoApp.Component() super-constructor was not invoked.");
    }
    if (!this.renderId) {
        throw new Error("Cannot add child: specified component object does not have a renderId.");
    }

	if (component.parent) {
		component.parent.remove(component);
	}
    
    component.parent = this;
        
    this.children.add(component, index);
    
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
    return this.children.get(index);
};

/**
 * Returns the number of child components
 * 
 * @return the number of child components
 * @type Number
 */
EchoApp.Component.prototype.getComponentCount = function(index) {
    return this.children.size();
};

/**
 * Returns an arbitrary indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} index the index to return
 * @return the property value
 */
EchoApp.Component.prototype.getIndexedProperty = function(name, index) {
    return this._internalStyle.getIndexedProperty(name, index);
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
    return this._internalStyle.getProperty(name);
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
            value = this._style.getProperty(name, index);
        }
        //FIXME. Stylesheet support.
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
            if (this.applicationInstance == null) {
                return null;
            } else {
                return this.applicationInstance.getLayoutDirection();
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
    return this.children.indexOf(component);
};

/**
 * Determines if the component is active, that is, within the current modal context
 * and ready to receive input.
 * 
 * @return the active state
 * @type Boolean
 */
EchoApp.Component.prototype.isActive = function() {
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
		    for (var i = 0; i < this.children.items.length; ++i) {
		         this.children.items[i].register(false); // Recursively unregister children.
			}
		}
		
        // Notify application.
		this.application.unregisterComponent(this);
	}

    // Link/unlink with application.
    this.application = application;

	if (application) { // registering

        // Notify application.
        this.application.registerComponent(this);
        
		if (this.children != null) {
			// Recursively register children.
		    for (var i = 0; i < this.children.items.length; ++i) {
		         this.children.items[i].register(application); // Recursively unregister children.
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
        component = this.children.items[index];
        if (!component) {
            throw new Error("Index out of bounds: " + index);
        }
    } else {
        component = componentOrIndex;
        index = this.children.indexOf(component);
        if (index == -1) {
            // Component is not a child: do nothing.
            return;
        }
    }
    
    if (this.application) {
        component.register(null);
    }
    
    this.children.remove(index);
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
 * @param value the new value of the property
 */
EchoApp.Component.prototype.setIndexedProperty = function(name, index, value) {
    var oldValue = this._internalStyle.getIndexedProperty(name, index);
    this._internalStyle.setIndexedProperty(name, index, newValue);
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
    var oldValue = this._internalStyle.getProperty(name);
    this._internalStyle.setProperty(name, newValue);
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
        out += this.renderId + "/properties:" + this._internalStyle + "\n";
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
 * @constructor
 */
EchoApp.LayoutData = function() {
    this._internalStyle = new EchoApp.Style();
};

/**
 * Retrieves an indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) property index
 */
EchoApp.LayoutData.prototype.getIndexedProperty = function(name, index) {
    return this._internalStyle.getIndexedProperty(name, index);
};

/**
 * Retrieves a property value.
 * 
 * @param {String} name the name of the property
 * @return the property value
 */
EchoApp.LayoutData.prototype.getProperty = function(name) {
    return this._internalStyle.getProperty(name);
};

/**
 * Sets an indexed property value.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) property index
 * @param value the new property value
 */
EchoApp.LayoutData.prototype.setIndexedProperty = function(name, index, value) {
    this._internalStyle.setIndexedProperty(name, index, newValue);
};

/**
 * Sets a property value.
 * 
 * @param {String} name the name of the property
 * @param value the new property value
 */
EchoApp.LayoutData.prototype.setProperty = function(name, newValue) {
    this._internalStyle.setProperty(name, newValue);
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
EchoApp.LayoutDirection.isLeftToRight = function() {
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
        var items = EchoCore.tokenizeString(arguments[0], " ");
        if (items.length != 3) {
            throw new Error("Invalid border string: " + arguments[0]);
        }
        this.size = new EchoApp.Property.Extent(items[0]);
        this.style = items[1];
        this.color = new EchoApp.Property.Color(items[2]);
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
        var items = EchoCore.tokenizeString(arguments[0], " ");
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
        this.value = parseFloat(arguments[0]);
        if (isNaN(this.value)) {
            throw new Error("Invalid Extent: " + arguments[0]);
        }
        if (typeof arguments[0] == "string") {
            this.units = arguments[0].substring(this.value.toString().length);
            if (this.units.length == 0) {
                this.units = "px";
            }
        } else {
            this.units = "px";
        }
    }
};

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
    if (color instanceof EchoApp.Property.Color) {
        /**
         * The border background color.
         * @type EchoApp.Property.Color
         */
        this.color = color;
    } else {
        this.color = new EchoApp.Property.Color(color);
    }
    if (borderInsets instanceof EchoApp.Property.Insets) {
        /**
         * The border insets 
         * (effectively defines the sizes of the cells where the border FillImages are rendered).
         * @type EchoApp.Property.Insets 
         */
        this.borderInsets = borderInsets;
    } else {
        this.borderInsets = new EchoApp.Property.Insets(borderInsets);
    }
    if (contentInsets instanceof EchoApp.Property.Insets) {
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
            values = EchoCore.tokenizeString(arguments[0], " ");
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
 * @constructor
 */
EchoApp.Style = function() { 
    this._propertyMap = new EchoCore.Collections.Map();
};

/**
 * Returns the value of an indexed property.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) index of the property
 * @return the property value  
 */
EchoApp.Style.prototype.getIndexedProperty = function(name, index) {
    var indexValues = _propertyMap.get(name);
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
    return this._propertyMap.get(name);
};

/**
 * Sets the value of an indexed property.
 * 
 * @param {String} name the name of the property
 * @param {Number} the (integer) index of the property
 * @param value the new value of the property 
 */
EchoApp.Style.prototype.setIndexedProperty = function(name, index, value) {
    var indexValues = _propertyMap.get(name);
    if (!indexValues) {
        indexValues = new Array();
        _propertyMap.put(name, indexValues);
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
    this._propertyMap.put(name, newValue);
};

/**
 * Returns a string representation.
 * 
 * @return a string representation
 * @type String
 */
EchoApp.Style.prototype.toString = function() {
    return this._propertyMap.toString();
};

/**
 * An application style sheet.
 */
EchoApp.StyleSheet = function() {
    this._nameToStyleMap = new EchoCore.Collections.Map();
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
    var typeToStyleMap = this._nameToStyleMap.get(name);
    if (typeToStyleMap == null) {
        return null;
    }
    return typeToStyleMap.get(componentType);
};

/**
 * Stores a style in the style sheet.
 * 
 * @param {String} name the style name
 * @param {String} componentType the component type
 * @param {EchoApp.Style} the style
 */
EchoApp.StyleSheet.prototype.setStyle = function(name, componentType, style) {
    var typeToStyleMap = this._nameToStyleMap.get(name);
    if (typeToStyleMap == null) {
        typeToStyleMap = new EchoCore.Collections.Map();
        this._nameToStyleMap.put(name, typeToStyleMap);
    }
    typeToStyleMap.put(componentType, style);
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
EchoApp.Update.ComponentUpdate = function(parent) {

    /**
     * The parent component represented in this <code>ServerComponentUpdate</code>.
     * @type EchoApp.Component
     */
    this.parent = parent;

    /**
     * The set of child <code>Component</code>s added to the <code>parent</code>.
     * @type EchoCore.Collections.Set
     */
    this.addedChildren = null;
    
    /**
     * A mapping between property names of the <code>parent</code> component and 
     * <code>PropertyUpdate</code>s.
     * @type EchoCore.Collections.Map
     */
    this.propertyUpdates = null;
    
    /**
     * The set of child <code>Component</code>s removed from the <code>parent</code>.
     * @type EchoCore.Collections.Set
     */
    this.removedChildren = null;
    
    /**
     * The set of descendant <code>Component</code>s which are implicitly removed 
     * as they were children of removed children.
     * @type EchoCore.Collections.Set
     */
    this.removedDescendants = null;

    /**
     * The set of child <code>Component</code>s whose <code>LayoutData</code> 
     * was updated. 
     * @type EchoCore.Collections.Set
     */
    this.updatedLayoutDataChildren = null;
};

/**
 * Records the addition of a child to the parent component.
 * 
 * @param {EchoApp.Component} child the added child
 */
EchoApp.Update.ComponentUpdate.prototype.addChild = function(child) {
    if (!this.addedChildren) {
        this.addedChildren = new EchoCore.Collections.Set();
    }
    this.addedChildren.add(child);
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
    if (update.removedDescendants != null) {
        if (this.removedDescendants == null) {
            removedDescendants = new EchoCore.Collections.Set();
        }
        for (var x in update.removedDescendants.items) {
            this.removedDescendants.add(x);
        }
    }
    
    // Append removed children.
    if (update.removedChildren != null) {
        if (this.removedDescendants == null) {
            removedDescendants = new EchoCore.Collections.Set();
        }
        for (var x in update.removedChildren.items) {
            this.removedDescendants.add(x);
        }
    }
};

/**
 * Retrives children that have been added to the component.
 * 
 * @return the set of added child components
 * @type EchoCore.Collections.Set
 */
EchoApp.Update.ComponentUpdate.prototype.getAddedChildren = function() {
    return this.addedChildren;
};

/**
 * Retrives children that have been removed from the component.
 * 
 * @return the set of removed child components
 * @type EchoCore.Collections.Set
 */
EchoApp.Update.ComponentUpdate.prototype.getRemovedChildren = function() {
    return this.removedChildren;
};

/**
 * Determines if the component has had any children added.
 * 
 * @return true if children have been added
 * @type Boolean
 */
EchoApp.Update.ComponentUpdate.prototype.hasAddedChildren = function() {
    return this.addedChildren != null;
};

/**
 * Determines if the component has had any children removed.
 * 
 * @return true if children have been removed
 * @type Boolean
 */
EchoApp.Update.ComponentUpdate.prototype.hasRemovedChildren = function() {
    return this.removedChildren != null;
};

/**
 * Determines if any children of the component have had their LayoutData
 * properties updated.
 * 
 * @return true if any child LayoutDatas have been updated
 * @type Boolean
 */
EchoApp.Update.ComponentUpdate.prototype.hasUpdatedLayoutDataChildren = function() {
    return this.updatedLayoutDataChildren != null;
};

/**
 * Determines if the component has any updated properties.
 * 
 * @return true if any properties have been updated
 * @type Boolean
 */
EchoApp.Update.ComponentUpdate.prototype.hasUpdatedProperties = function() {
    return this.propertyUpdates != null;
};

/**
 * Records the removal of a child from the parent component.
 * 
 * @param {EchoApp.Component} child the removed child
 */
EchoApp.Update.ComponentUpdate.prototype.removeChild = function(child) {
    if (this.addedChildren != null && this.addedChildren.contains(child)) {
        // Remove child from add list if found.
        this.addedChildren.remove(child);
    }
    
    if (this.updatedLayoutDataChildren != null && this.updatedLayoutDataChildren.containes(child)) {
        // Remove child from updated layout data list if found.
        this.updatedLayoutDataChildren.remove(child);
    }

    if (this.removedChildren == null) {
        this.removedChildren = new EchoCore.Collections.Set();
    }
    
    this.removedChildren.add(child);

     for (var i = 0; i < child.children.items.length; ++i) {
          this._removeDescendant(child.children.items[i]);
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
    if (this.removedDescendants == null) {
        this.removedDescendants = new EchoCore.Collections.Set();
    }
    this.removedDescendants.add(descendant);
    for (var i = 0; i < descendant.children.items.length; ++i) {
        this._removeDescendant(descendant.children.items[i]);
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
    s += "- Adds: " + this.addedChildren + "\n";
    s += "- Removes: " + this.removedChildren + "\n";
    s += "- DescendantRemoves: " + this.removedDescendants + "\n";
    s += "- Properties: " + this.propertyUpdates + "\n";
    s += "- LayoutDatas: " + this.updatedLayoutDataChildren + "\n";
    return s;
};

/**
 * Records the update of the LayoutData of a child component.
 * 
 * @param the child component whose layout data was updated
 */
EchoApp.Update.ComponentUpdate.prototype.updateLayoutData = function(child) {
	if (this.updatedLayoutDataChildren == null) {
		this.updatedLayoutDataChildren = new EchoCore.Collections.Set();
	}
	this.updatedLayoutDataChildren.add(child);
};

/**
 * Records the update of a property of the parent component.
 * 
 * @param propertyName the name of the property
 * @param oldValue the previous value of the property
 * @param newValue the new value of the property
 */
EchoApp.Update.ComponentUpdate.prototype.updateProperty = function(propertyName, oldValue, newValue) {
    if (this.propertyUpdates == null) {
        this.propertyUpdates = new EchoCore.Collections.Map();
    }
	var propertyUpdate = new EchoApp.Update.ComponentUpdate.PropertyUpdate(oldValue, newValue);
	this.propertyUpdates.put(propertyName, propertyUpdate);
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
    this.componentUpdateMap = new EchoCore.Collections.Map();
    this.fullRefreshRequired = false;
    this.application = application;
    this.application.addComponentUpdateListener(new EchoCore.MethodRef(this, this._processComponentUpdate));
    this._hasUpdates = true;
    this._listenerList = new EchoCore.ListenerList();
};

/**
 * Adds a listener to receive notification of update events.
 * 
 * @param l the listener to add (may be a function or EchoCore.MethodRef)
 */
EchoApp.Update.Manager.prototype.addUpdateListener = function(l) {
    this._listenerList.addListener("update", l);
};

EchoApp.Update.Manager.prototype.createComponentUpdate = function(parent) {
    this._hasUpdates = true;
    var update = this.componentUpdateMap.get(parent.renderId);
    if (!update) {
        update = new EchoApp.Update.ComponentUpdate(parent);
        this.componentUpdateMap.put(parent.renderId, update);
    }
    return update;
};

EchoApp.Update.Manager.prototype.dispose = function() {
    this.application.removeComponentUpdateListener(new EchoCore.MethodRef(this, this._processComponentUpdate));
    this.application = null;
};

EchoApp.Update.Manager.prototype._fireUpdate = function() {
    var e = new EchoCore.Event(this, "update");
    this._listenerList.fireEvent(e);
};

/**
 * Returns the current pending updates.  Returns null in the event that that no pending updates exist.
 */
EchoApp.Update.Manager.prototype.getUpdates = function() {
    var updates = new Array();
    for (var key in this.componentUpdateMap.associations) {
        updates.push(this.componentUpdateMap.associations[key]);
    }
    return updates;
};

EchoApp.Update.Manager.prototype.hasUpdates = function() {
    return this._hasUpdates;
};

EchoApp.Update.Manager.prototype._isAncestorBeingAdded = function(component) {
    //TODO. This is a performance bottleneck for large adds.  Update to Echo(2) svn837+ version.
    for (var testParentId in this.componentUpdateMap.associations) {
         var update = this.componentUpdateMap.associations[testParentId];
         if (update.parent.isAncestorOf(component) && update.addedChildren) {
             for (var i = 0; i < update.addedChildren.items.length; ++i) {
                 if (update.addedChildren.items[i].isAncestorOf(component)) {
                     return true;
                 }
             }
         }
    }
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
    var update = this.createComponentUpdate(parent);
    update.addChild(child);
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
    var update = this.createComponentUpdate(parent);
    update.updateLayoutData(updatedComponent);
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
    var update = this.createComponentUpdate(parent);
    update.removeChild(child);
    
    var disposedIds = null;
    
    // Search updated components for descendants of removed component.
    // Any found descendants will be removed and added to this update's
    // list of removed components.
    for (var testParentId in this.componentUpdateMap.associations) {
         var testUpdate = this.componentUpdateMap.associations[testParentId];
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
            this.componentUpdateMap.remove(disposedIds[i]);
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
	if (this.fullRefereshRequired) {
		return;
	}
	if (this._isAncestorBeingAdded(component)) {
		return;
	}
	var update = this.createComponentUpdate(component);
	update.updateProperty(propertyName, oldValue, newValue);
};

/**
 * ComponentUpdateEvent handler registered with the application to monitor
 * UI state changes.
 * 
 * @private
 * @param {EchoApp.Update.ComponentUpdateEvent} e the event
 */
EchoApp.Update.Manager.prototype._processComponentUpdate = function(e) {
    if (e.propertyName == "children") {
        if (e.newValue == null) {
            this._processComponentRemove(e.parent, e.oldValue);
        } else {
            this._processComponentAdd(e.parent, e.newValue);
        }
    } else if (e.propertyName == "layoutData") {
        this._processComponentLayoutDataUpdate(e.parent, e.oldValue, e.newValue);
    } else {
        this._processComponentPropertyUpdate(e.parent, e.propertyName, e.oldValue, e.newValue);
    }
    this._fireUpdate();
};

/**
 * Purges all updates from the manager.
 * Invoked after the client has repainted the screen.
 */
EchoApp.Update.Manager.prototype.purge = function() {
    this.componentUpdateMap = new EchoCore.Collections.Map();
    this.fullRefreshRequired = false;
    this._hasUpdates = false;
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
		for (var key in this.componentUpdateMap.associations) {
			s += this.componentUpdateMap.associations[key];
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
    EchoApp.Component.call(this, "Button", renderId);
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
 * Creates a new Column.
 * 
 * @constructor
 * @class Column component.
 * @base EchoApp.Component
 */
EchoApp.Column = function(renderId) {
    EchoApp.Component.call(this, "Column", renderId);
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
    EchoApp.Component.call(this, "ContentPane", renderId);
};

EchoApp.ContentPane.prototype = new EchoApp.Component;

/**
 * Creates a new Label.
 * 
 * @constructor
 * @class Label component.
 * @base EchoApp.Component
 */
EchoApp.Label = function(renderId) {
    EchoApp.Component.call(this, "Label", renderId);
};

EchoApp.Label.prototype = new EchoApp.Component;

/**
 * Creates a new Row.
 * 
 * @constructor
 * @class Row component.
 * @base EchoApp.Component
 */
EchoApp.Row = function(renderId) {
    EchoApp.Component.call(this, "Row", renderId);
};

EchoApp.Row.prototype = new EchoApp.Component;

/**
 * Creates a new SplitPane.
 * 
 * @constructor
 * @class SplitPane component.
 * @base EchoApp.Component
 */
EchoApp.SplitPane = function(renderId) {
    EchoApp.Component.call(this, "SplitPane", renderId);
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
EchoApp.SplitPane.DEFAULT_SEPARATOR_COLOR = new EchoApp.Property.Color("#3f007f");

/**
 * Creates a new TextField.
 * 
 * @constructor
 * @class TextField component.
 * @base EchoApp.Component
 */
EchoApp.TextField = function(renderId) {
    EchoApp.Component.call(this, "TextField", renderId);
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
    EchoApp.Component.call(this, "WindowPane", renderId);
};

EchoApp.WindowPane.prototype = new EchoApp.Component;

/**
 * Programmatically perform a window closing operation.
 */
EchoApp.WindowPane.prototype.doWindowClosing = function() {
    var e = new EchoCore.Event(this, "windowClosing");
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
EchoApp.ComponentFactory.registerType("Column", EchoApp.Column);
EchoApp.ComponentFactory.registerType("Label", EchoApp.Label);
EchoApp.ComponentFactory.registerType("Row", EchoApp.Row);
EchoApp.ComponentFactory.registerType("SplitPane", EchoApp.SplitPane);
EchoApp.ComponentFactory.registerType("TextField", EchoApp.TextField);
EchoApp.ComponentFactory.registerType("WindowPane", EchoApp.WindowPane);
