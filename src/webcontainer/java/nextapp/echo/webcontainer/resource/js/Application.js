/**
 * Application namespace.  DO NOT INSTANTIATE.
 * REQUIRES: Core.
 * SPECIAL NOTE: This resource may NOT use any APIs other than "Core" out of convention.
 */
EchoApp = function() { };

/**
 * Representation of a single application instance.
 * Derived objects must invoke construtor with root component id.
 */
EchoApp.Application = function(rootComponentId) {
    if (arguments.length == 0) {
        return;
    }
    this._idToComponentMap = new EchoCore.Collections.Map();
    this._listenerList = new EchoCore.ListenerList();

    this.rootComponentId = rootComponentId;

    this.rootComponent = new EchoApp.Component("Root", this.rootComponentId);
    this.rootComponent.register(this);
    
    this.modalContext = null;
    
    this._styleSheet = null;
    this._focusedComponent = null;
    
    this.updateManager = new EchoApp.Update.Manager(this);
};

EchoApp.Application.prototype.addComponentUpdateListener = function(l) {
    this._listenerList.addListener("componentUpdate", l);
};

EchoApp.Application.prototype.dispose = function() {
    this.updateManager.dispose();
};

EchoApp.Application.prototype._fireComponentUpdate = function(parent, propertyName, oldValue, newValue) {
    var e = new EchoApp.Application.ComponentUpdateEvent(this, parent, propertyName, oldValue, newValue);
    this._listenerList.fireEvent(e);
};

EchoApp.Application.prototype.getComponentByRenderId = function(renderId) {
    return this._idToComponentMap.get(renderId);
};

EchoApp.Application.prototype.getFocusedComponent = function() {
    return this._focusedComponent;
};

EchoApp.Application.prototype.getStyleSheet = function() {
    return this._styleSheet;
};

EchoApp.Application.prototype.notifyComponentUpdate = function(parent, propertyName, oldValue, newValue) {
    this._fireComponentUpdate(parent, propertyName, oldValue, newValue);
};

EchoApp.Application.prototype.registerComponent = function(component) {
    if (this._idToComponentMap.get(component.renderId)) {
        throw new Error("Component already exists with id: " + component.renderId);
    }
    this._idToComponentMap.put(component.renderId, component);
};

EchoApp.Application.prototype.removeComponentUpdateListener = function(l) {
    this._listenerList.removeListener("componentUpdate", l);
};

EchoApp.Application.prototype.setFocusedComponent = function(newValue) {
    this._focusedComponent = newValue;
};

EchoApp.Application.prototype.setStyleSheet = function(newValue) {
    var oldValue = this._styleSheet;
    this._styleSheet = newValue;
// FIXME updatemanager can't handle this yet.    
//    this.notifyComponentUpdate(null, "styleSheet", oldValue, newValue);
};

EchoApp.Application.prototype.unregisterComponent = function(component) {
    this._idToComponentMap.remove(component.renderId);
};

EchoApp.Application.ComponentUpdateEvent = function(source, parent, propertyName, oldValue, newValue) {
    EchoCore.Event.call(this, source, "componentUpdate");
    this.parent = parent;
    this.propertyName = propertyName;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

EchoApp.Application.ComponentUpdateEvent.prototype = new EchoCore.Event;

EchoApp.ComponentFactory = function() { };

EchoApp.ComponentFactory._typeToConstructorMap = new EchoCore.Collections.Map();

EchoApp.ComponentFactory.newInstance = function(typeName, renderId) {
    var typeConstructor = EchoApp.ComponentFactory._typeToConstructorMap.get(typeName);
    if (typeConstructor == null) {
        return new EchoApp.Component(typeName, renderId);
    } else {
        return new typeConstructor(renderId);
    }
};

EchoApp.ComponentFactory.registerType = function(typeName, typeConstructor) {
    EchoApp.ComponentFactory._typeToConstructorMap.put(typeName, typeConstructor);
};

/**
 * Base class for components.
 * Derived classes must invoke constructor with componentType (and optionally renderId) properties.
 */
EchoApp.Component = function(componentType, renderId) {
    if (arguments.length == 0) { return; }
    this.componentType = componentType;
    this.renderId = renderId ? renderId : "cl_" + ++EchoApp.Component.nextRenderId;
    this.parent = null;
    this.children = new EchoCore.Collections.List();
    this.application = null;
    this._listenerList = null;
    this._internalStyle = new EchoApp.Style();
    this._style = null;
    this._styleName = null;
    this._styleType = null;
};

EchoApp.Component.nextRenderId = 0;

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

EchoApp.Component.prototype.addListener = function(eventType, eventTarget) {
    if (this._listenerList == null) {
        this._listenerList = new EchoCore.ListenerList();
    }
    this._listenerList.addListener(eventType, eventTarget);
};

EchoApp.Component.prototype.fireEvent = function(event) {
    if (this._listenerList == null) {
        return;
    }
    this._listenerList.fireEvent(event);
};

EchoApp.Component.prototype.getComponent = function(index) {
   return this.children.get(index);
};

EchoApp.Component.prototype.getComponentCount = function(index) {
   return this.children.size();
};

EchoApp.Component.prototype.getProperty = function(name) {
    return this._internalStyle.getProperty(name);
};

EchoApp.Component.prototype.getIndexedProperty = function(name, index) {
    return this._internalStyle.getIndexedProperty(name, index);
};

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

EchoApp.Component.prototype.getStyle = function(styleId) {
    return this._style;
};

EchoApp.Component.prototype.getStyleName = function(styleId) {
    return this._styleName;
};

EchoApp.Component.prototype.getStyleType = function(styleId) {
    return this._styleType;
};

EchoApp.Component.prototype.indexOf = function(component) {
    return this.children.indexOf(component);
};

/**
 * Determines if the component is active, that is, within the current modal context
 * and ready to receive input.
 */
EchoApp.Component.prototype.isActive = function() {
    return true;
};

EchoApp.Component.prototype.isAncestorOf = function(c) {
    while (c != null && c != this) {
        c = c.parent;
    }
    return c == this;
};

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

EchoApp.Component.prototype.removeAll = function() {
    //TODO Implement
};

EchoApp.Component.prototype.removeListener = function(eventType, eventTarget) {
    if (this._listenerList == null) {
        return;
    }
    this._listenerList.removeListener(eventType, eventTarget);
};

EchoApp.Component.prototype.setIndexedProperty = function(name, index, value) {
    var oldValue = this._internalStyle.getIndexedProperty(name, index);
    this._internalStyle.setIndexedProperty(name, index, newValue);
    if (this.application) {
        this.application.notifyComponentUpdate(this, name, oldValue, newValue);
    }
};

EchoApp.Component.prototype.setProperty = function(name, newValue) {
    var oldValue = this._internalStyle.getProperty(name);
    this._internalStyle.setProperty(name, newValue);
    if (this.application) {
        this.application.notifyComponentUpdate(this, name, oldValue, newValue);
    }
};

EchoApp.Component.prototype.setStyle = function(newValue) {
    var oldValue = this._style;
    this._style = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "style", oldValue, newValue);
    }
};

EchoApp.Component.prototype.setStyleName = function(newValue) {
    var oldValue = this._styleName;
    this._styleName = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "styleName", oldValue, newValue);
    }
};

EchoApp.Component.prototype.setStyleType = function(newValue) {
    var oldValue = this._styleType;
    this._styleType = newValue;
    if (this.application) {
        this.application.notifyComponentUpdate(this, "styleType", oldValue, newValue);
    }
};

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

EchoApp.LayoutData = function() {
    this._internalStyle = new EchoApp.Style();
};

EchoApp.LayoutData.prototype.getProperty = function(name) {
    return this._internalStyle.getProperty(name);
};

EchoApp.LayoutData.prototype.getIndexedProperty = function(name, index) {
    return this._internalStyle.getIndexedProperty(name, index);
};

EchoApp.LayoutData.prototype.setIndexedProperty = function(name, index, value) {
    this._internalStyle.setIndexedProperty(name, index, newValue);
};

EchoApp.LayoutData.prototype.setProperty = function(name, newValue) {
    this._internalStyle.setProperty(name, newValue);
};

EchoApp.Property = function() { };

EchoApp.Property.Border = function() {
    if (arguments.length == 1 && typeof arguments[0] == "string") {
        var items = EchoCore.tokenizeString(arguments[0], " ");
        if (items.length != 3) {
            throw new Error("Invalid border string: " + arguments[0]);
        }
        this.size = new EchoApp.Property.Extent(items[0]);
        this.style = items[1];
        this.color = new EchoApp.Property.Color(items[2]);
    }
};

EchoApp.Property.Border.prototype.className = "Border";

/**
 * Color constructor.
 *
 * @param value the color hex value
 */
EchoApp.Property.Color = function(value) {
    this.value = value;
};

EchoApp.Property.Color.prototype.className = "Color";

/**
 * Extent constructor.
 *
 * Configuration 1:
 * @param extentString the value of the extent as a string 
 * Configuration 2:
 * @param value the numeric value portion of the extent 
 * @param units the units of the extent, e.g. "%" or "px"
 */
EchoApp.Property.Extent = function() {
    if (arguments.length == 2) {
        this.value = arguments[0];
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

EchoApp.Property.Extent.prototype.className = "Extent";

EchoApp.Property.Extent.prototype.toString = function() {
    return this.value + this.units;
};

EchoApp.Property.FillImage = function(image, repeat, x, y) {
    if (image instanceof EchoApp.Property.ImageReference) {
        this.image = image;
    } else {
        this.image = new EchoApp.Property.ImageReference(image);
    }
    this.repeat = repeat;
    if (x == null || x instanceof EchoApp.Property.Extent) {
        this.x = x;
    } else {
        this.x = new EchoApp.Property.Extent(x);
    }
    if (y == null || y instanceof EchoApp.Property.Extent) {
        this.y = y;
    } else {
        this.y = new EchoApp.Property.Extent(y);
    }
};

EchoApp.Property.FillImage.prototype.className = "FillImage";

EchoApp.Property.FillImageBorder = function(color, borderInsets, contentInsets, fillImages) {
    if (color instanceof EchoApp.Property.Color) {
        this.color = color;
    } else {
        this.color = new EchoApp.Property.Color(color);
    }
    if (borderInsets instanceof EchoApp.Property.Insets) {
        this.borderInsets = borderInsets;
    } else {
        this.borderInsets = new EchoApp.Property.Insets(borderInsets);
    }
    if (contentInsets instanceof EchoApp.Property.Insets) {
        this.contentInsets = contentInsets;
    } else {
        this.contentInsets = new EchoApp.Property.Insets(contentInsets);
    }
    this.fillImages = fillImages ? fillImages : new Array(8);
};

EchoApp.Property.FillImageBorder.prototype.className = "FillImageBorder";

EchoApp.Property.ImageReference = function(url, width, height) {
    this.url = url;
    this.width = width;
    this.height = height;
};

EchoApp.Property.ImageReference.prototype.className = "ImageReference";

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
        this.top = values[0];
        this.right = values[1];
        this.bottom = values[2];
        this.left = values[3];
        break;
    default:
        throw new Error("Invalid Insets construction parameters: " + values);
    }
};

EchoApp.Property.Insets.prototype.className = "Insets";

EchoApp.Property.Insets.prototype.toString = function() {
    return this.top + " " + this.right + " " + this.bottom + " " + this.left;
};

EchoApp.Style = function() { 
    this._propertyMap = new EchoCore.Collections.Map();
};

EchoApp.Style.prototype.getIndexedProperty = function(name, index) {
    var indexValues = _propertyMap.get(name);
    if (!indexValues) {
        return null;
    }
    return indexValues[index];
};

EchoApp.Style.prototype.getProperty = function(name) {
    return this._propertyMap.get(name);
};

EchoApp.Style.prototype.setIndexedProperty = function(name, index, value) {
    var indexValues = _propertyMap.get(name);
    if (!indexValues) {
        indexValues = new Array();
        _propertyMap.put(name, indexValues);
    }
    indexValues[index] = value;
};

EchoApp.Style.prototype.setProperty = function(name, newValue) {
    this._propertyMap.put(name, newValue);
};

EchoApp.Style.prototype.toString = function() {
    return this._propertyMap.toString();
};

EchoApp.StyleSheet = function() {
    this._nameToStyleMap = new EchoCore.Collections.Map();
};

EchoApp.StyleSheet.prototype.getRenderStyle = function(name, componentType) {
    //FIXME. Does not query super component types.
    return this.getStyle(name, componentType);
};

/**
 * @param name the style name
 * @param componentType the component type
` */
EchoApp.StyleSheet.prototype.getStyle = function(name, componentType) {
    var typeToStyleMap = this._nameToStyleMap.get(name);
    if (typeToStyleMap == null) {
        return null;
    }
    return typeToStyleMap.get(componentType);
};

EchoApp.StyleSheet.prototype.setStyle = function(name, componentType, style) {
    var typeToStyleMap = this._nameToStyleMap.get(name);
    if (typeToStyleMap == null) {
        typeToStyleMap = new EchoCore.Collections.Map();
        this._nameToStyleMap.put(name, typeToStyleMap);
    }
    typeToStyleMap.put(componentType, style);
};

EchoApp.Update = function() { };

/**
 * Representation of an update to a single existing component which is currently rendered on the screen.
 */
EchoApp.Update.ComponentUpdate = function(parent) {

    /**
     * The parent component represented in this <code>ServerComponentUpdate</code>.
     */
    this.parent = parent;

    /**
     * The set of child <code>Component</code>s added to the <code>parent</code>.
     */
    this.addedChildren = null;
    
    /**
     * A mapping between property names of the <code>parent</code> component and 
     * <code>PropertyUpdate</code>s.
     */
    this.propertyUpdates = null;
    
    /**
     * The set of child <code>Component</code>s removed from the <code>parent</code>.
     */
    this.removedChildren = null;
    
    /**
     * The set of descendant <code>Component</code>s which are implicitly removed 
     * as they were children of removed children.
     */
    this.removedDescendants = null;

    /**
     * The set of child <code>Component</code>s whose <code>LayoutData</code> 
     * was updated. 
     */
    this.updatedLayoutDataChildren = null;
};

EchoApp.Update.ComponentUpdate.prototype.addChild = function(child) {
    if (!this.addedChildren) {
        this.addedChildren = new EchoCore.Collections.Set();
    }
    this.addedChildren.add(child);
};

EchoApp.Update.ComponentUpdate.prototype.appendRemovedDescendants = function(update) {
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

EchoApp.Update.ComponentUpdate.prototype.hasRemovedChildren = function() {
    return this.removedChildren != null;
};

EchoApp.Update.ComponentUpdate.prototype.hasAddedChildren = function() {
    return this.addedChildren != null;
};

EchoApp.Update.ComponentUpdate.prototype.hasUpdatedLayoutDataChildren = function() {
    return this.updatedLayoutDataChildren != null;
};

EchoApp.Update.ComponentUpdate.prototype.hasUpdatedProperties = function() {
    return this.propertyUpdates != null;
};

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
          this.removeDescendant(child.children.items[i]);
     }
};

EchoApp.Update.ComponentUpdate.prototype.removeDescendant = function(descendant) {
    if (this.removedDescendants == null) {
        this.removedDescendants = new EchoCore.Collections.Set();
    }
    this.removedDescendants.add(descendant);
    for (var i = 0; i < descendant.children.items.length; ++i) {
        this.removeDescendant(descendant.children.items[i]);
    }
};

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

EchoApp.Update.ComponentUpdate.prototype.updateLayoutData = function(child) {
	if (this.updatedLayoutDataChildren == null) {
		this.updatedLayoutDataChildren = new EchoCore.Collections.Set();
	}
	this.updatedLayoutDataChildren.add(child);
};

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

EchoApp.Update.Manager = function(application) {
    this.componentUpdateMap = new EchoCore.Collections.Map();
    this.fullRefreshRequired = false;
    this.application = application;
    this.application.addComponentUpdateListener(new EchoCore.MethodRef(this, this._processComponentUpdate));
    this._hasUpdates = true;
    this._listenerList = new EchoCore.ListenerList();
};

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
             update.appendRemovedDescendants(testUpdate);
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

EchoApp.Update.Manager.prototype.purge = function() {
    this.componentUpdateMap = new EchoCore.Collections.Map();
    this.fullRefreshRequired = false;
    this._hasUpdates = false;
};

EchoApp.Update.Manager.prototype.removeUpdateListener = function(l) {
    this._listenerList.removeListener("update", l);
};

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

EchoApp.Button.prototype.doAction = function() {
    var e = new EchoCore.Event(this, "action");
    this.fireEvent(e);
};

/**
 * Column component.
 */
EchoApp.Column = function(renderId) {
    EchoApp.Component.call(this, "Column", renderId);
};

EchoApp.Column.prototype = new EchoApp.Component;

/**
 * ContentPane component.
 */
EchoApp.ContentPane = function(renderId) {
    this.pane = true;
    EchoApp.Component.call(this, "ContentPane", renderId);
};

EchoApp.ContentPane.prototype = new EchoApp.Component;

/**
 * Label component.
 */
EchoApp.Label = function(renderId) {
    EchoApp.Component.call(this, "Label", renderId);
};

EchoApp.Label.prototype = new EchoApp.Component;

/**
 * Row component.
 */
EchoApp.Row = function(renderId) {
    EchoApp.Component.call(this, "Row", renderId);
};

EchoApp.Row.prototype = new EchoApp.Component;

/**
 * SplitPane component.
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
 * TextField component.
 */
EchoApp.TextField = function(renderId) {
    EchoApp.Component.call(this, "TextField", renderId);
};

EchoApp.TextField.prototype = new EchoApp.Component;

/**
 * WindowPane component.
 */
EchoApp.WindowPane = function(renderId) {
    this.floatingPane = this.pane = true;
    EchoApp.Component.call(this, "WindowPane", renderId);
};

EchoApp.WindowPane.prototype = new EchoApp.Component;

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
EchoApp.ComponentFactory.registerType("SplitPane", EchoApp.SplitPane);
EchoApp.ComponentFactory.registerType("WindowPane", EchoApp.WindowPane);
