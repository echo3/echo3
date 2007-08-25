/**
 * NAMESPACE: Component Rendering Peers.
 * Do not instantiate.
 */
EchoRender = function() { };

EchoRender._peers = new Object();

/**
 * Map containing removed components.  Maps component ids to removed components.
 * Created and destroyed during each render. 
 */
EchoRender._disposedComponents = null;

EchoRender.registerPeer = function(componentName, peerObject) {
    EchoRender._peers[componentName] = peerObject;
};

//FIXME.  Scrollbar position tracking code in SplitPane appears to suggest that
// disposed states are not in good shape....SplitPane is being disposed when
// parent contentPane is redrawn.

EchoRender._loadPeer = function(component) {
    if (component.peer) {
        return;
// FIXME. which behavior is correct for this scenario: ignore or fail?    
//        throw new Error("Peer already installed: " + component);
    }
    
    var peerClass = EchoRender._peers[component.componentType];
    
    if (!peerClass) {
        throw new Error("Peer not found for: " + component.componentType);
    }
    
    component.peer = new peerClass();
    component.peer.component = component;
    
    // Initialize the peer.
    component.peer.init();
};

// FIXME. Ensure this is properly invoked and no peers are being leaked.
EchoRender._unloadPeer = function(component) {
    component.peer.component = null;
    component.peer = null;
};

EchoRender._setPeerDisposedState = function(component, disposed) {
    if (disposed) {
        component.peer.disposed = true;
        EchoRender._disposedComponents[component.renderId] = component;
    } else {
        component.peer.disposed = false;
        delete EchoRender._disposedComponents[component.renderId];
    }
};

/**
 * Notifies child components that the parent component has been reszied.
 * Child components (and their descendants) will be notified by having 
 * their renderSizeUpdate() implementations invoked.
 * Note that the parent WILL NOT have its renderSizeUpdate() method
 * invoked.
 * 
 * If your component requires virtual positioning (for IE6) you should invoke
 * this method after informing the virtual positioning system to recalculate
 * the size of your component.
 * 
 * @param parent the component whose size changed
 * @type EchoApp.Component
 */
EchoRender.notifyResize = function(parent) {
    EchoRender._doResize(parent, false);
};

EchoRender._doResize = function(component, resizeSelf) {
    if (resizeSelf) {
        EchoRender._doResizeImpl(component);
    } else {
        for (var i = 0; i < component.children.length; ++i) {
            EchoRender._doResizeImpl(component.children[i]);
        }
    }
};

EchoRender._doResizeImpl = function(component) {
    if (component.peer) {
        // components that are present on the client, but are not rendered (lazy rendered as in tree), 
        // have no peer installed.
        if (component.peer.renderSizeUpdate) {
            component.peer.renderSizeUpdate();
        }
        
        for (var i = 0; i < component.children.length; ++i) {
            EchoRender._doResizeImpl(component.children[i]);
        }
    }
};

EchoRender.renderComponentAdd = function(update, component, parentElement) {
    EchoRender._loadPeer(component);
    EchoRender._setPeerDisposedState(component, false);
    component.peer.renderAdd(update, parentElement);
};

/**
 * Loads the peer for the specified component and invokes its renderDispose() method.
 * Recursively performs this action on all child components.
 * This method should be invoked by any peer that will be updating a component in such
 * a fashion that it will be destroying the rendering of its children and re-rendering them.
 * It is not necessary to invoke this method on components that may not contain children.
 *
 * @param update the <code>ComponentUpdate</code> for which this change is being performed
 * @param component the <code>Component</code> to be disposed.
 */
EchoRender.renderComponentDispose = function(update, component) {
    EchoRender._renderComponentDisposeImpl(update, component);
};

EchoRender._renderComponentDisposeImpl = function(update, component) {
    if (!component.peer || component.peer.disposed) {
        return;
    }
    EchoRender._setPeerDisposedState(component, true);

    component.peer.renderDispose(update);
    for (var i = 0; i < component.children.length; ++i) {
        EchoRender._renderComponentDisposeImpl(update, component.children[i]);
    }
};

/**
 * Returns the depth of a specified component in the hierarchy.
 * The root component is at depth 0, its immediate children are
 * at depth 1, their children are at depth 2, and so on.
 *
 * @param component the component whose depth is to be calculated
 * @return the depth of the component
 */
EchoRender._getComponentDepth = function(component) {
    var depth = -1;
    while (component != null) {
        component = component.parent;
        ++depth;
    }
    return depth;
};

/**
 * An array sorting implemention to organize an array by component depth.
 */
EchoRender._componentDepthArraySort = function(a, b) {
    return EchoRender._getComponentDepth(a.parent) - EchoRender._getComponentDepth(b.parent);
};

EchoRender._processDispose = function(update) {
    var components = update.getRemovedDescendants();
    if (components) {
        for (var i = 0; i < components.length; ++i) {
            EchoRender._renderComponentDisposeImpl(update, components[i]);
        }
    }
    components = update.getRemovedChildren();
    if (components) {
        for (var i = 0; i < components.length; ++i) {
            EchoRender._renderComponentDisposeImpl(update, components[i]);
        }
    }
};

EchoRender.processUpdates = function(updateManager) {
    if (!updateManager.hasUpdates()) {
        return;
    }
    
    // Create map to contain removed components (for peer unloading).
    EchoRender._disposedComponents = new Object();
    
    var updates = updateManager.getUpdates();
    
    updates.sort(EchoRender._componentDepthArraySort);

    for (var i = 0; i < updates.length; ++i) {
        var peers = updates[i].parent.peer;
        if (peer == null && updates[i].parent.componentType == "Root") {
            EchoRender._loadPeer(updates[i].parent);
        }
    }

    // Remove Phase: Invoke renderDispose on all updates.
    for (var i = updates.length - 1; i >= 0; --i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        var peer = updates[i].parent.peer;
        EchoRender._processDispose(updates[i]);
    }
    
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("rem");
    }
    
    // Update Phase: Invoke renderUpdate on all updates.
    for (var i = 0; i < updates.length; ++i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        var peer = updates[i].parent.peer;
        
        var fullRender = peer.renderUpdate(updates[i]);
        if (fullRender) {
            // If update required full-rerender of child component hierarchy, remove
            // updates.
            for (var j = i + 1; j < updates.length; ++j) {
                if (updates[j] != null && updates[i].parent.isAncestorOf(updates[j].parent)) {
                    updates[j] = null;
                }
            }
        }

        //FIXME....moved after loop, ensure this is okay (evaluate use of dispose).
        // Set disposed set of peer to false.
        EchoRender._setPeerDisposedState(updates[i].parent, false);
    }
    
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("up");
    }
    
    // Size Update Phase: Invoke renderSizeUpdate on all updates.
    
    for (var i = 0; i < updates.length; ++i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        //FIXME. this does needless work....resizing twice is quite possible.
        // if property updates are present.
        EchoRender._doResize(updates[i].parent, true);
    }

    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("su");
    }

    //var ds = "DISPOSEARRAY:"; ///FIXME Remove this debug code.
    
    // Unload peers for truly removed components, destroy mapping.
    for (var componentId in EchoRender._disposedComponents) {
        //ds += "\n"; ///FIXME Remove this debug code.
        var component = EchoRender._disposedComponents[componentId];
        //ds += component; ///FIXME Remove this debug code.
        EchoRender._unloadPeer(component);
    }
    EchoRender._disposedComponents = null;
    //alert(ds); ///FIXME Remove this debug code.

    updateManager.purge();
};

EchoRender.ComponentSync = function() { };

EchoRender.ComponentSync.prototype.init = function() {

};

EchoRender.ComponentSync.prototype.renderAdd = function(update, parentElement) {
    throw new Error("Operation \"renderAdd\" not supported (Component: " + this.component + ").");
};

EchoRender.ComponentSync.prototype.renderDispose = function(update) {
    throw new Error("Operation \"renderDispose\" not supported (Component: " + this.component + ").");
};

/**
 * @return true if this invocation has re-rendered all child components, false otherwise
 */
EchoRender.ComponentSync.prototype.renderUpdate = function(update) {
    throw new Error("Operation \"renderUpdate\" not supported (Component: " + this.component + ").");
};

/**
 * Component rendering peer: Root
 * 
 * The root component is not managed by the server, but rather is an existing
 * element within which the Echo application is rendered.
 * This is a very special case in that there is no renderAdd() method.
 */
EchoRender.ComponentSync.Root = function() { };

EchoRender.ComponentSync.Root.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.ComponentSync.Root.prototype.renderDispose = function(update) {
    this._rootElement = null;
};

EchoRender.ComponentSync.Root.prototype.renderUpdate = function(update) {
    var client = this.component.application.getContextProperty(EchoClient.CONTEXT_PROPERTY_NAME);
    
    var fullRender = false;
    if (update.hasAddedChildren() || update.hasRemovedChildren()) {
        EchoWebCore.DOM.removeAllChildren(client.domainElement);
    
        for (var i = 0; i < update.parent.children.length; ++i) {
            EchoRender.renderComponentAdd(update, update.parent.children[i], client.domainElement);
        }
        fullRender = true;
    }
    
    if (update.hasUpdatedProperties()) {
        var titleUpdate = update.getUpdatedProperty("title");
        if (titleUpdate) {
            document.title = titleUpdate.newValue;
        }
    }
    
    return fullRender;
};

EchoRender.Property = function() {
};

EchoRender.Property.getEffectProperty = function(component, defaultPropertyName, effectPropertyName, effectState) {
	var property;
	if (effectState) {
        property = component.getRenderProperty(effectPropertyName);
	}
	if (!property) {
		property = component.getRenderProperty(defaultPropertyName);
	}
	return property;
};

EchoRender.Property.Alignment = function() { };

EchoRender.Property.Alignment.getRenderedHorizontal = function(alignment, component) {
    var layoutDirection = component ? component.getRenderLayoutDirection() : EchoApp.LayoutDirection.LTR;
    switch (alignment.horizontal) {
    case EchoApp.Property.Alignment.LEADING:
        return layoutDirection.isLeftToRight() ? EchoApp.Property.Alignment.LEFT : EchoApp.Property.Alignment.RIGHT;
    case EchoApp.Property.Alignment.TRAILING:
        return layoutDirection.isLeftToRight() ? EchoApp.Property.Alignment.RIGHT : EchoApp.Property.Alignment.LEFT;
    default:
        return alignment.horizontal;
    }
};

EchoRender.Property.Alignment.renderComponentProperty 
        = function(component, componentProperty, defaultValue, element, renderToElement, referenceComponent) {
    referenceComponent = referenceComponent ? referenceComponent : component;
    var alignment = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    if (!alignment) {
        alignment = defaultValue;
    }
    var horizontal = alignment ? EchoRender.Property.Alignment.getRenderedHorizontal(alignment, referenceComponent) : null;
    var vertical = alignment ? alignment.vertical : null;
    
    var horizontalValue;
    switch (horizontal) {
    case EchoApp.Property.Alignment.LEFT:   horizontalValue = "left";   break;
    case EchoApp.Property.Alignment.CENTER: horizontalValue = "center"; break;
    case EchoApp.Property.Alignment.RIGHT:  horizontalValue = "right";  break;
    default:                                horizontalValue = "";       break;
    }
    var verticalValue;
    switch (vertical) {
    case EchoApp.Property.Alignment.TOP:    verticalValue = "top";      break;
    case EchoApp.Property.Alignment.CENTER: verticalValue = "middle";   break;
    case EchoApp.Property.Alignment.BOTTOM: verticalValue = "bottom";   break;
    default:                                verticalValue = "";         break;
    }
    
    if (renderToElement) {
        element.align = horizontalValue;
        element.vAlign = verticalValue;
    } else {
        element.style.textAlign = horizontalValue;
        element.style.verticalAlign = verticalValue;
    }
};

EchoRender.Property.Border = function() { };

EchoRender.Property.Border._SIDE_STYLE_NAMES = new Array("borderTop", "borderRight", "borderBottom", "borderLeft");
EchoRender.Property.Border._SIDE_RENDER_STRATEGIES 
        = new Array(new Array(0, 1, 2, 3), new Array(0, 1, 2, 1), new Array(0, 1, 0, 1), new Array(0, 0, 0, 0));

EchoRender.Property.Border.render = function(border, element) {
    if (!border) {
    	return;
    }
    if (border.multisided) {
        var renderStrategy = EchoRender.Property.Border._SIDE_RENDER_STRATEGIES[4 - border.sides.length];
        for (var i = 0; i < 4; ++i) {
            EchoRender.Property.Border.renderSide(border.sides[renderStrategy[i]], element, 
                    EchoRender.Property.Border._SIDE_STYLE_NAMES[i]);
        }
    } else {
        var color = border.color ? border.color.value : null;
        element.style.border = EchoRender.Property.Extent.toPixels(border.size) + "px " + border.style + " " 
                + (color ? color : "");
    }
};

EchoRender.Property.Border.renderClear = function(border, element) {
	if (border) {
		EchoRender.Property.Border.render(border, element);
	} else {
		element.style.border = "";
	}
};

EchoRender.Property.Border.renderComponentProperty = function(component, componentProperty, defaultValue, element) { 
    var border = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Border.render(border ? border : defaultValue, element);
};

EchoRender.Property.Border.renderSide = function(borderSide, element, styleName) {
    var color = borderSide.color ? borderSide.color.value : null;
    element.style[styleName] = EchoRender.Property.Extent.toPixels(borderSide.size) + "px " + borderSide.style + " " 
            + (color ? color : "");
};

EchoRender.Property.Color = function() { };

EchoRender.Property.Color.render = function(color, element, styleProperty) {
	if (color) {
	    element.style[styleProperty] = color.value;
	}
};

EchoRender.Property.Color.renderClear = function(color, element, styleProperty) {
    element.style[styleProperty] = color ? color.value : "";
};

EchoRender.Property.Color.renderComponentProperty = function(component, componentProperty, defaultValue, element, styleProperty) { 
    var color = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Color.render(color ? color : defaultValue, element, styleProperty);
};

EchoRender.Property.Color.renderFB = function(component, element) { 
	var color;
    if (color = component.getRenderProperty("foreground")) {
	    element.style.color = color.value;
    }
    if (color = component.getRenderProperty("background")) {
	    element.style.backgroundColor = color.value;
    }
};

EchoRender.Property.Extent = function() { };

EchoRender.Property.Extent.toPixels = function(extent, horizontal) {
    if (extent == null) {
        return 0;
    } else {
        return EchoWebCore.Render.extentToPixels(extent.value, extent.units, horizontal);
    }
};

EchoRender.Property.FillImage = function() { };

EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER = 0x1;

EchoRender.Property.FillImage.render = function(fillImage, element, flags) {
    if (!fillImage) {
        // No image specified, do nothing.
        return;
    }
    
    var url = fillImage.image ? fillImage.image.url : "";
    
    if (EchoWebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
            flags && (flags & EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
        // IE6 PNG workaround required.
        element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" 
            + url + "', sizingMethod='scale')";
    } else {
        // IE6 PNG workaround not required.
        element.style.backgroundImage = "url(" + url + ")";
    }
    
    if (fillImage.repeat || fillImage.repeat == EchoApp.Property.FillImage.NO_REPEAT) {
		var repeat;
		switch (fillImage.repeat) {
        case EchoApp.Property.FillImage.NO_REPEAT:
            repeat = "no-repeat";
            break;
        case EchoApp.Property.FillImage.REPEAT_HORIZONTAL:
            repeat = "repeat-x";
            break;
        case EchoApp.Property.FillImage.REPEAT_VERTICAL:
            repeat = "repeat-y";
            break;
        default:
            repeat = "repeat";
        }
        element.style.backgroundRepeat = repeat;
    }
    
    if (fillImage.x || fillImage.y) {
        element.style.backgroundPosition = (fillImage.x ? fillImage.x : "0px") + " " + (fillImage.y ? fillImage.y : "0px");
    }
};

EchoRender.Property.FillImage.renderClear = function(fillImage, element, flags) {
	if (fillImage) {
		EchoRender.Property.FillImage.render(fillImage, element, flags);
	} else {
		element.style.backgroundImage = "";
	    element.style.backgroundPosition = "";
	    element.style.backgroundRepeat = "";
	}
};

EchoRender.Property.FillImage.renderComponentProperty = function(component, componentProperty, defaultValue,
        element, flags) {
    var fillImage = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.FillImage.render(fillImage ? fillImage : defaultValue, element, flags);
};

EchoRender.Property.Font = function() { };

EchoRender.Property.Font.render = function(font, element) {
    if (!font) {
        return;
    }
    if (font.typeface) {
        if (font.typeface instanceof Array) {
            element.style.fontFamily = font.typeface.join(",");
        } else {
            element.style.fontFamily = font.typeface;
        }
    }
    if (font.size) {
        element.style.fontSize = EchoRender.Property.Extent.toPixels(font.size) + "px";
    }
    if (font.style) {
        if (font.style & EchoApp.Property.Font.BOLD) {
            element.style.fontWeight = "bold";
        }
        if (font.style & EchoApp.Property.Font.ITALIC) {
            element.style.fontStyle = "italic";
        }
        if (font.style & EchoApp.Property.Font.UNDERLINE) {
            element.style.textDecoration = "underline";
        } else if (font.style & EchoApp.Property.Font.OVERLINE) {
            element.style.textDecoration = "overline";
        } else if (font.style & EchoApp.Property.Font.LINE_THROUGH) {
            element.style.textDecoration = "line-through";
        }
    } else if (font.style == EchoApp.Property.Font.PLAIN) {
        element.style.fontWeight = "";
		element.style.fontStyle = "";
		element.style.textDecoration = "";
    }
};

EchoRender.Property.Font.renderClear = function(font, element) {
    if (font) {
    	EchoRender.Property.Font.render(font, element);
    } else {
		element.style.fontFamily = "";
		element.style.fontSize = "";
		element.style.fontWeight = "";
		element.style.fontStyle = "";
		element.style.textDecoration = "";
    }
};

EchoRender.Property.Font.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element) {
    var font = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Font.render(font ? font : defaultValue, element);
};

EchoRender.Property.Font.renderDefault = function(component, element, defaultValue) {
	EchoRender.Property.Font.renderComponentProperty(component, "font", defaultValue, element);
};

EchoRender.Property.Insets = function() { };

EchoRender.Property.Insets.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element, styleProperty) { 
    var insets = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Insets.renderPixel(insets ? insets : defaultValue, element, styleProperty);
};

EchoRender.Property.Insets.renderPixel = function(insets, element, styleAttribute) {
    if (insets) {
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    }
};

EchoRender.Property.Insets.toCssValue = function(insets) {
    if (insets) {
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        return pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    } else {
        return "";
    }
};

EchoRender.Property.Insets.toPixels = function(insets) {
    var pixelInsets = new Object();
    pixelInsets.top = EchoWebCore.Render.extentToPixels(insets.top.value, insets.top.units, false);
    pixelInsets.right = EchoWebCore.Render.extentToPixels(insets.right.value, insets.right.units, true);
    pixelInsets.bottom = EchoWebCore.Render.extentToPixels(insets.bottom.value, insets.bottom.units, false);
    pixelInsets.left = EchoWebCore.Render.extentToPixels(insets.left.value, insets.left.units, true);
    return pixelInsets;
};

/**
 * Creates a new <code>TriCellTable</code>
 * 
 * @param orientation0_1 the orientation of element 0 with respect to element 1, one of 
 *        the following values:
 *        <ul>
 *        <ul>
 *        <li>LEADING_TRAILING (element 0 is trailing element 1)</li>
 *        <li>TRAILING_LEADING (element 1 is leading element 0)</li>
 *        <li>TOP_BOTTOM (element 0 is above element 1)</li>
 *        <li>BOTTOM_TOP (element 1 is above element 0)</li>
 *        </ul>
 * @param margin0_1 the margin size between element 0 and element 1
 * @param orientation01_2 (omitted for two-cell tables)
 *        the orientation of Elements 0 and 1 with 
 *        respect to Element 2, one of the following values:
 *        <ul>
 *        <li>LEADING_TRAILING (elements 0 and 1 are leading element 2)</li>
 *        <li>TRAILING_LEADING (element 2 is trailing elements 0 and 1)</li>
 *        <li>TOP_BOTTOM (elements 0 and 1 are above element 2)</li>
 *        <li>BOTTOM_TOP (element 2 is above elements 0 and 1)</li>
 *        </ul>
 * @param margin01_2 (omitted for two-cell tables)
 *        The margin size between the combination
 *        of elements 0 and 1 and element 2.
 */
EchoRender.TriCellTable = function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.tableElement = EchoRender.TriCellTable._tablePrototype.cloneNode(true);
    this.tbodyElement = this.tableElement.firstChild;
    
    if (orientation01_2 == null) {
        this.configure2(orientation0_1, margin0_1);
    } else {
        this.configure3(orientation0_1, margin0_1, orientation01_2, margin01_2);
    }
};

//FIXME. this method will need additional information with regard to RTL settings.
EchoRender.TriCellTable.getOrientation = function(component, propertyName) {
    var position = component.getRenderProperty(propertyName);
    var orientation;
    if (position) {
        switch (position.horizontal) {
        case EchoApp.Property.Alignment.LEADING:  orientation = EchoRender.TriCellTable.LEADING_TRAILING; break;
        case EchoApp.Property.Alignment.TRAILING: orientation = EchoRender.TriCellTable.TRAILING_LEADING; break;
        case EchoApp.Property.Alignment.LEFT:     orientation = EchoRender.TriCellTable.LEADING_TRAILING; break;
        case EchoApp.Property.Alignment.RIGHT:    orientation = EchoRender.TriCellTable.TRAILING_LEADING; break;
        default:
            switch (position.vertical) {
            case EchoApp.Property.Alignment.TOP:    orientation = EchoRender.TriCellTable.TOP_BOTTOM;       break;
            case EchoApp.Property.Alignment.BOTTOM: orientation = EchoRender.TriCellTable.BOTTOM_TOP;       break;
            default:                                orientation = EchoRender.TriCellTable.TRAILING_LEADING; break;
            }
        }
    } else {
        orientation = EchoRender.TriCellTable.TRAILING_LEADING;
    }
    return orientation;
};
            
EchoRender.TriCellTable._createTablePrototype = function() {
    var tableElement = document.createElement("table");
    tableElement.style.borderCollapse = "collapse";
    tableElement.style.padding = "0px";
    
    tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    
    return tableElement;
};

EchoRender.TriCellTable._tablePrototype = EchoRender.TriCellTable._createTablePrototype();

EchoRender.TriCellTable.INVERTED = 1;
EchoRender.TriCellTable.VERTICAL = 2;

EchoRender.TriCellTable.LEADING_TRAILING = 0;
EchoRender.TriCellTable.TRAILING_LEADING = EchoRender.TriCellTable.INVERTED;
EchoRender.TriCellTable.TOP_BOTTOM = EchoRender.TriCellTable.VERTICAL;
EchoRender.TriCellTable.BOTTOM_TOP = EchoRender.TriCellTable.VERTICAL | EchoRender.TriCellTable.INVERTED;

EchoRender.TriCellTable.prototype.addColumn = function(trElement, tdElement) {
    if (tdElement != null) {
        trElement.appendChild(tdElement);
    }
};

EchoRender.TriCellTable.prototype.addRow = function(tdElement) {
    if (tdElement == null) {
        return;
    }
    var trElement = document.createElement("tr");
    trElement.appendChild(tdElement);
    this.tbodyElement.appendChild(trElement);
};

EchoRender.TriCellTable.prototype.addSpacer = function(parentElement, size, vertical) {
    var divElement = document.createElement("div");
    divElement.style.width = vertical ? "1px" : size + "px";
    divElement.style.height = vertical ? size + "px" : "1px";
    parentElement.appendChild(divElement);
};

/**
 * @param id the id of 
 */
EchoRender.TriCellTable.prototype.configure2 = function(orientation0_1, margin0_1) {
    this.tdElements = new Array(document.createElement("td"), document.createElement("td"));
    this.tdElements[0].style.padding = "0px";
    this.tdElements[1].style.padding = "0px";
    this.marginTdElements = new Array(1);
    
    if (margin0_1) {
        this.marginTdElements[0] = document.createElement("td");
        this.marginTdElements[0].style.padding = "0px";
        if ((orientation0_1 & EchoRender.TriCellTable.VERTICAL) == 0) {
            this.marginTdElements[0].style.width = margin0_1 + "px";
            this.addSpacer(this.marginTdElements[0], margin0_1, false);
        } else {
            this.marginTdElements[0].style.height = margin0_1 + "px";
            this.addSpacer(this.marginTdElements[0], margin0_1, true);
        }
    }
    
    if (orientation0_1 & EchoRender.TriCellTable.VERTICAL) {
        // Vertically oriented.
        if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
            // Inverted (bottom to top).
            this.addRow(this.tdElements[1]);
            this.addRow(this.marginTdElements[0]);
            this.addRow(this.tdElements[0]);
        } else {
            // Normal (top to bottom).
            this.addRow(this.tdElements[0]);
            this.addRow(this.marginTdElements[0]);
            this.addRow(this.tdElements[1]);
        }
    } else {
        // Horizontally oriented.
        var trElement = document.createElement("tr");
        if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
            // Trailing to leading.
            this.addColumn(trElement, this.tdElements[1]);
            this.addColumn(trElement, this.marginTdElements[0]);
            this.addColumn(trElement, this.tdElements[0]);
        } else {
            // Leading to trailing.
            this.addColumn(trElement, this.tdElements[0]);
            this.addColumn(trElement, this.marginTdElements[0]);
            this.addColumn(trElement, this.tdElements[1]);
        }
        this.tbodyElement.appendChild(trElement);
    }
};

EchoRender.TriCellTable.prototype.configure3 = function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.tdElements = new Array(3);
    for (var i = 0; i < 3; ++i) {
        this.tdElements[i] = document.createElement("td");
        this.tdElements[i].style.padding = "0px";
    }
    this.marginTdElements = new Array(2);
    
    if (margin0_1 || margin01_2 != null) {
        if (margin0_1 && margin0_1 > 0) {
            this.marginTdElements[0] = document.createElement("td");
            if (orientation0_1 & EchoRender.TriCellTable.VERTICAL) {
                this.marginTdElements[0].style.height = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, true);
            } else {
                this.marginTdElements[0].style.width = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, false);
            }
        }
        if (margin01_2 != null && margin01_2 > 0) {
            this.marginTdElements[1] = document.createElement("td");
            if (orientation0_1 & EchoRender.TriCellTable.VERTICAL) {
                this.marginTdElements[1].style.height = margin01_2 + "px";
                this.addSpacer(this.marginTdElements[1], margin01_2, true);
            } else {
                this.marginTdElements[1].style.width = margin01_2 + "px";
                this.addSpacer(this.marginTdElements[1], margin01_2, false);
            }
        }
    }
    
    if (orientation0_1 & EchoRender.TriCellTable.VERTICAL) {
        // Vertically oriented 0/1.
        if (orientation01_2 & EchoRender.TriCellTable.VERTICAL) {
            // Vertically oriented 01/2
            
            if (orientation01_2 & EchoRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TABLE.
                this.addRow(this.tdElements[2]);
                this.addRow(this.marginTdElements[1]);
            }
            
            // Render 01
            if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
                // Inverted (bottom to top)
                this.addRow(this.tdElements[1]);
                this.addRow(this.marginTdElements[0]);
                this.addRow(this.tdElements[0]);
            } else {
                // Normal (top to bottom)
                this.addRow(this.tdElements[0]);
                this.addRow(this.marginTdElements[0]);
                this.addRow(this.tdElements[1]);
            }

            if (!(orientation01_2 & EchoRender.TriCellTable.INVERTED)) {
                // 01 before 2: render #2 and margin at end of TABLE.
                this.addRow(this.marginTdElements[1]);
                this.addRow(this.tdElements[2]);
            }
        } else {
            // Horizontally oriented 01/2
            
            // Determine and apply row span based on presence of margin between 0 and 1.
            var rows = (margin0_1 && margin0_1 > 0) ? 3 : 2;
            this.tdElements[2].rowSpan = rows;
            if (this.marginTdElements[1]) {
                this.marginTdElements[1].rowSpan = rows;
            }
            
            var trElement = document.createElement("tr");
            if (orientation01_2 & EchoRender.TriCellTable.INVERTED) {
                this.addColumn(trElement, this.tdElements[2]);
                this.addColumn(trElement, this.marginTdElements[1]);
                if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
                    this.addColumn(trElement, this.tdElements[1]);
                } else {
                    this.addColumn(trElement, this.tdElements[0]);
                }
            } else {
                if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
                    this.addColumn(trElement, this.tdElements[1]);
                } else {
                    this.addColumn(trElement, this.tdElements[0]);
                }
                this.addColumn(trElement, this.marginTdElements[1]);
                this.addColumn(trElement, this.tdElements[2]);
            }
            this.tbodyElement.appendChild(trElement);
            
            this.addRow(this.marginTdElements[0]);
            if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
                this.addRow(this.tdElements[0]);
            } else {
                this.addRow(this.tdElements[1]);
            }
        }
    } else {
        // horizontally oriented 0/1
        if (orientation01_2 & EchoRender.TriCellTable.VERTICAL) {
            // vertically oriented 01/2

            // determine and apply column span based on presence of margin between 0 and 1
            var columns = margin0_1 ? 3 : 2;
            this.tdElements[2].setAttribute("colspan", columns);
            if (this.marginTdElements[1] != null) {
                this.marginTdElements[1].setAttribute("colspan", Integer.toString(columns));
            }
            
            if (orientation01_2 & EchoRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TR.
                this.addRow(this.tdElements[2]);
                this.addRow(this.marginTdElements[1]);
            }
            
            // Render 01
            trElement = document.createElement("tr");
            if ((orientation0_1 & EchoRender.TriCellTable.INVERTED) == 0) {
                // normal (left to right)
                this.addColumn(trElement, this.tdElements[0]);
                this.addColumn(trElement, this.marginTdElements[0]);
                this.addColumn(trElement, this.tdElements[1]);
            } else {
                // inverted (right to left)
                this.addColumn(trElement, this.tdElements[1]);
                this.addColumn(trElement, this.marginTdElements[0]);
                this.addColumn(trElement, this.tdElements[0]);
            }
            this.tbodyElement.appendChild(trElement);
            
            if (!(orientation01_2 & EchoRender.TriCellTable.INVERTED)) {
                // 01 before 2: render margin and #2 at end of TR.
                this.addRow(this.marginTdElements[1]);
                this.addRow(this.tdElements[2]);
            }

        } else {
            // horizontally oriented 01/2
            trElement = document.createElement("tr");
            if (orientation01_2 & EchoRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TR.
                this.addColumn(trElement, this.tdElements[2]);
                this.addColumn(trElement, this.marginTdElements[1]);
            }
            
            // Render 01
            if (orientation0_1 & EchoRender.TriCellTable.INVERTED) {
                // inverted (right to left)
                this.addColumn(trElement, this.tdElements[1]);
                this.addColumn(trElement, this.marginTdElements[0]);
                this.addColumn(trElement, this.tdElements[0]);
            } else {
                // normal (left to right)
                this.addColumn(trElement, this.tdElements[0]);
                this.addColumn(trElement, this.marginTdElements[0]);
                this.addColumn(trElement, this.tdElements[1]);
            }
            
            if (!(orientation01_2 & EchoRender.TriCellTable.INVERTED)) {
                this.addColumn(trElement, this.marginTdElements[1]);
                this.addColumn(trElement, this.tdElements[2]);
            }
            
            this.tbodyElement.appendChild(trElement);        
        }
    }
    
};

EchoRender.Util = function() { };

// FIXME abstract this somehow so it works with FreeClient too
EchoRender.Util.TRANSPARENT_IMAGE = "?sid=Echo.TransparentImage";

EchoRender.registerPeer("Root", EchoRender.ComponentSync.Root);
