// FIXME. Investigate "defaultValue" argument in property rendering peers...currently it is ignored,
// should be delete it or should we correctly implement it?

/**
 * NAMESPACE: Component Rendering Peers.
 * Do not instantiate.
 */
EchoRender = function() { };

EchoRender._peers = new EchoCore.Collections.Map();

/**
 * Map containing removed components.  Maps component ids to removed components.
 * Created and destroyed during each render. 
 */
EchoRender._disposedComponents = null;

EchoRender.registerPeer = function(componentName, peerObject) {
    EchoRender._peers.put(componentName, peerObject);
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
    
    var peerClass = EchoRender._peers.get(component.componentType);
    
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
        EchoRender._disposedComponents.put(component.renderId, component);
    } else {
        component.peer.disposed = false;
        EchoRender._disposedComponents.remove(component.renderId);
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
 *
 * @param update the <code>ComponentUpdate</code> for which this change is being performed
 * @param component the <code>Component</code> to be disposed.
 */
EchoRender.renderComponentDispose = function(update, component) {
    EchoRender._renderComponentDisposeImpl(update, component, true);
};

EchoRender._renderComponentDisposeImpl = function(update, component, removeIds) {
    if (!component.peer) {
        return;
    }
    if (component.peer.disposed) {
        return;
    }
    EchoRender._setPeerDisposedState(component, true);

    component.peer.renderDispose(update);
    for (var i = 0; i < component.children.items.length; ++i) {
        EchoRender._renderComponentDisposeImpl(update, component.children.items[i], false);
    }
    
    if (removeIds) {
        var element = document.getElementById(component.renderId);
        EchoRender._renderRemoveIds(element);
    }
};

EchoRender._renderRemoveIds = function(element) {
    element.id = "";
    element = element.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            EchoRender._renderRemoveIds(element);
        }
        element = element.nextSibling;
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
            EchoRender._renderComponentDisposeImpl(update, components[i], false);
        }
    }
    components = update.getRemovedChildren();
    if (update.removedChildIds) {
        for (var i = 0; i < components.length; ++i) {
            EchoRender._renderComponentDisposeImpl(update, components[i], true);
        }
    }
};

EchoRender.processUpdates = function(updateManager) {
    if (!updateManager.hasUpdates()) {
        return;
    }
    
    // Create map to contain removed components (for peer unloading).
    EchoRender._disposedComponents = new EchoCore.Collections.Map();
    
    var updates = updateManager.getUpdates();
    
    updates.sort(EchoRender._componentDepthArraySort);

    for (var i = 0; i < updates.length; ++i) {
        var peers = updates[i].parent.peer;
        if (peer == null && updates[i].parent.componentType == "Root") {
            EchoRender._loadPeer(updates[i].parent);
        }
    }

    for (var i = updates.length - 1; i >= 0; --i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        var peer = updates[i].parent.peer;
        EchoRender._processDispose(updates[i]);
    }
    
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("ProcessUpdates: Remove Phase");
    }
    
    // Need to remove descendant peers if renderUpdate returns true.
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
        EchoCore.profilingTimer.mark("ProcessUpdates: Update Phase");
    }

    //var ds = "DISPOSEARRAY:"; ///FIXME Remove this debug code.
    
    // Unload peers for truly removed components, destroy mapping.
    for (var componentId in EchoRender._disposedComponents.associations) {
        //ds += "\n"; ///FIXME Remove this debug code.
        var component = EchoRender._disposedComponents.associations[componentId];
        //ds += component; ///FIXME Remove this debug code.
        EchoRender._unloadPeer(component);
    }
    EchoRender._disposedComponents = null;
    //alert(ds); ///FIXME Remove this debug code.

    updateManager.purge();

    EchoWebCore.VirtualPosition.redraw();
};

EchoRender.ComponentSync = function() { };

EchoRender.ComponentSync.prototype.getContainerElement = function(component) {
    throw new Error("Operation \"getContainerElement\" not supported (Component: " + this.component + ").");
};

EchoRender.ComponentSync.prototype.init = function() {
//    throw new Error("Operation \"renderAdd\" not supported (Component: " + this.component + ").");
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
 * Component rendering peer: Root (not managed by server)
 */
EchoRender.ComponentSync.Root = function() { };

EchoRender.ComponentSync.Root.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Root.prototype.getContainerElement = function(component) {
    return document.getElementById(this.component.renderId);
};

EchoRender.ComponentSync.Root.prototype.renderDispose = function(update) {
};

EchoRender.ComponentSync.Root.prototype.renderUpdate = function(update) {
    var rootElement = document.getElementById(update.parent.renderId);
    EchoWebCore.DOM.removeAllChildren(rootElement);

    var rootElement = document.getElementById(update.parent.renderId);
    for (var i = 0; i < update.parent.children.items.length; ++i) {
        EchoRender.renderComponentAdd(update, update.parent.children.items[i], rootElement);
    }
    return true;
};

EchoRender.Focus = function() { };

EchoRender.Focus.visitNextFocusComponent = function(containerComponent, previous) {
    var focusedComponent = containerComponent.application.getFocusedComponent();
    if (!focusedComponent) {
        focusedComponent = containerComponent;
    }
    var targetComponent = previous ? EchoRender.Focus._findPreviousFocusComponent(focusedComponent)
            : EchoRender.Focus._findNextFocusComponent(focusedComponent);
    if (targetComponent) {
        targetComponent.peer.focus();
        return true;
    } else {
        return false;
    }
};

EchoRender.Focus._findPreviousFocusComponent = function(component) {
    var originComponent = component;
    var visitedComponents = new Array();
    var lastComponent = null;
    
    while (true) {
        var nextComponent = null;
        if (component == originComponent || (lastComponent && lastComponent.parent == component)) {
            // On origin component (OR) Previously moved up: do not move down.
        } else {
            if (component.getComponentCount() > 0) {
                // Attempt to move down.
                nextComponent = component.getComponent(component.getComponentCount() - 1);

                if (visitedComponents[nextComponent.renderId]) {
                    // Already visited children, cancel the move.
                    nextComponent = null;
                }
            }
        }
        
        if (nextComponent == null) {
            // Attempt to move left.
            nextComponent = EchoRender.Focus._previousSibling(component);
            if (nextComponent && visitedComponents[nextComponent.renderId]) {
                nextComponent = null;
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

        if (component != originComponent && component.peer.focus) {
            return component;
        }
    }
};

EchoRender.Focus._findNextFocusComponent = function(component) {
    var originComponent = component;
    var visitedComponents = new Array();
    var lastComponent = null;
    
    while (true) {
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
            nextComponent = EchoRender.Focus._nextSibling(component);
            if (nextComponent && visitedComponents[nextComponent.renderId]) {
                nextComponent = null;
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

        if (component != originComponent && component.peer.focus) {
            return component;
        }
    }
};

EchoRender.Focus._nextSibling = function(component) {
    if (!component.parent) {
        // No parent: no siblings.
        return null;
    }
    
    var componentIndex = component.parent.indexOf(component);
    if (componentIndex >= component.parent.getComponentCount() - 1) {
        // On last sibling.
        return null;
    }
    
    return component.parent.getComponent(componentIndex + 1);
};

EchoRender.Focus._previousSibling = function(component) {
    if (!component.parent) {
        // No parent: no siblings.
        return null;
    }
    
    var componentIndex = component.parent.indexOf(component);
    if (componentIndex < 1) {
        // On first sibling.
        return null;
    }
    
    return component.parent.getComponent(componentIndex - 1);
};

//FIXME. determine how clearing of previously set properties is handled in property renderers.

EchoRender.Property = function() {
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
    case EchoApp.Property.Alignment.CENTER: verticalValue = "center";   break;
    case EchoApp.Property.Alignment.BOTTOM: verticalValue = "bottom";   break;
    default:                                verticalValue = "";         break;
    }
    
    if (renderToElement) {
        element.align = horizontalValue;
        element.valign = verticalValue;
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
    if (border) {
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
    } else {
        element.style.border = "";
    }
};

EchoRender.Property.Border.renderSide = function(borderSide, element, styleName) {
    var color = borderSide.color ? borderSide.color.value : null;
    element.style[styleName] = EchoRender.Property.Extent.toPixels(borderSide.size) + "px " + borderSide.style + " " 
            + (color ? color : "");
};

EchoRender.Property.Color = function() { };

EchoRender.Property.Color.render = function(color, element, styleProperty) {
    //FIXME. broken.
    var color = component.getRenderProperty(componentProperty);
    element.style[styleProperty] = color ? color.value : "";
};

EchoRender.Property.Color.renderComponentProperty = function(component, componentProperty, defaultValue, element, styleProperty) { 
    var color = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    element.style[styleProperty] = color ? color.value : (defaultValue ? defaultValue.value : "");
};

EchoRender.Property.Color.renderFB = function(component, element) { 
    var f = component.getRenderProperty("foreground");
    element.style.color = f ? f.value : "";
    var b = component.getRenderProperty("background");
    element.style.backgroundColor = b ? b.value : "";
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
    if (!fillImage || !fillImage.image) {
        // No image specified, do nothing.
        return;
    }
    if (EchoWebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
            flags && (flags & EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
        // IE6 PNG workaround required.
        element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" 
            + fillImage.image.url + "', sizingMethod='scale')";
    } else {
        // IE6 PNG workaround not required.
        element.style.backgroundImage = "url(" + fillImage.image.url + ")";
    }
    
    if (fillImage.repeat) {
        element.style.backgroundRepeat = fillImage.repeat;
    }
    
    if (fillImage.x || fillImage.y) {
        element.style.backgroundPosition = (fillImage.x ? fillImage.x : "0") + " " + (fillImage.y ? fillImage.y : "0");
    }
};

EchoRender.Property.FillImage.renderComponentProperty = function(component, componentProperty, defaultValue,
        element) {
    var fillImage = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.FillImage.render(fillImage, element);
};

EchoRender.Property.Font = function() { };

EchoRender.Property.Font.renderDefault = function(component, element, defaultValue) {
	EchoRender.Property.Font.renderComponentProperty(component, "font", defaultValue, element);
};

EchoRender.Property.Font.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element) {
    var font = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
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
    }
};

EchoRender.Property.Insets = function() { };

EchoRender.Property.Insets.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element, styleProperty) { 
    var insets = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Insets.renderPixel(insets, element, styleProperty);
};

EchoRender.Property.Insets.renderPixel = function(insets, element, styleAttribute) {
    if (insets) {
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    } else {
        element.style[styleAttribute] = "";
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
 * @param id the id of the root element
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
EchoRender.TriCellTable = function(id, orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.id = id;
    this.tableElement = document.createElement("table");
    this.tableElement.style.borderCollapse = "collapse";
    this.tableElement.style.padding = 0;
    
    this.tbodyElement = document.createElement("tbody");
    this.tbodyElement.id, id + "_tbody";
    this.tableElement.appendChild(this.tbodyElement);
    
    if (orientation01_2 == null) {
        this.configure2(id, orientation0_1, margin0_1);
    } else {
        this.configure3(id, orientation0_1, margin0_1, orientation01_2, margin01_2);
    }
};

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
    trElement.appendChild(td);
    this.tbodyElement.appendChild(trElement);
};

EchoRender.TriCellTable.prototype.addSpacer = function(parentElement, size, vertical) {
    var imgElement = document.createElement("img");
    imgElement.src = EchoRender.TriCellTable.TRANSPARENT_IMAGE;
    imgElement.width = vertical ? "1" : size;
    imgElement.height = vertical ? size : "1";
    parentElement.appendChild(imgElement);
};

EchoRender.TriCellTable.prototype.configure2 = function(id, orientation0_1, margin0_1) {
    this.tdElements = new Array(document.createElement("td"), document.createElement("td"));
    this.tdElements[0].style.padding = 0;
    this.tdElements[1].style.padding = 0;
    this.marginTdElements = new Array(1);
    
    if (margin0_1 != null) {
        this.marginTdElements[0] = document.createElement("td");
        this.marginTdElements[0].style.padding = 0;
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

EchoRender.TriCellTable.prototype.configure3 = function(id, orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.tdElements = new Array(3);
    for (var i = 0; i < 3; ++i) {
        this.tdElements[i] = document.createElement("td");
        this.tdElements[i].style.padding = 0;
    }
    
    if (margin0_1 != null || margin01_2 != null) {
        if (margin0_1 != null && margin0_1 > 0) {
            this.marginTdElements[0] = document.createElement("td");
            if (orientation0_1 & VERTICAL) {
                this.marginTdElements[0].style.height = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, true);
            } else {
                this.marginTdElements[0].style.width = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, false);
            }
        }
        if (margin01_2 != null && margin01_2 > 0) {
            if (orientation0_1 & VERTICAL) {
                this.marginTdElements[1].style.height = margin01_2;
                this.addSpacer(this.marginTdElements[1], margin01_2, true);
            } else {
                this.marginTdElements[1].style.width = margin01_2;
                this.addSpacer(this.marginTdElements[1], margin01_2, false);
            }
        }
    }
    
    if (orientation0_1 & VERTICAL) {
        // Vertically oriented 0/1.
        if (orientation01_2 & VERTICAL) {
            // Vertically oriented 01/2
            if (!(orientation01_2 & INVERTED)) {
                // 2 before 01: render #2 and margin at beginning of TABLE.
                this.addRow(this.tdElements[2]);
                this.addRow(this.marginTdElements[1]);
            }
            
            // Render 01
            if (orientation0_1 & INVERTED) {
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

            if (!(orientation01_2 & INVERTED)) {
                // 01 before 2: render #2 and margin at end of TABLE.
                this.addRow(this.marginTdElements[1]);
                this.addRow(this.tdElements[2]);
            }
        } else {
            // Horizontally oriented 01/2
            
            // Determine and apply row span based on presence of margin between 0 and 1.
            var rows = (margin0_1 != null && margin0_1 > 0) ? 3 : 2;
            this.tdElements[2].rowSpan = rows;
            if (this.marginTdElements[1]) {
                this.marginTdElements[1].rowSpan = rows;
            }
            
            var trElement = document.createElement("tr");
            if (orientation01_2 & INVERTED) {
                if (orientation0_1 & INVERTED) {
                    this.addColumn(trElement, tdElements[1]);
                } else {
                    this.addColumn(trElement, tdElements[0]);
                }
                this.addColumn(trElement, this.marginTdElements[1]);
                this.addColumn(trElement, this.tdElements[2]);
            } else {
                this.addColumn(trElement, this.tdElements[2]);
                this.addColumn(trElement, this.marginTdElements[1]);
                if (orientation0_1 & INVERTED) {
                    this.addColumn(trElement, tdElements[1]);
                } else {
                    this.addColumn(trElement, tdElements[0]);
                }
            }
            
            tbodyElement.appendChild(trElement);
            this.addRow(marginTdElements[0]);
            if (orientation0_1 & INVERTED) {
                this.addRow(tdElements[0]);
            } else {
                this.addRow(tdElements[1]);
            }
        }
    }
    
};

EchoRender.Util = function() { };

// FIXME abstract this somehow so it works with FreeClient too
EchoRender.Util.TRANSPARENT_IMAGE = "?sid=Echo.TransparentImage";

/**
 * Convenience method to return the parent DOM element into which a 
 * component should be rendered.
 */
EchoRender.Util.getContainerElement = function(component) {
    return component.parent.peer.getContainerElement(component);
};

//FXIME? This method is also invoking dispose on the component....this is kind of what we want, but kind of not.
EchoRender.Util.renderRemove = function(update, component) {
    var element = document.getElementById(component.renderId);
    EchoRender.renderComponentDispose(update, component);
    element.parentNode.removeChild(element);
};

EchoRender.registerPeer("Root", EchoRender.ComponentSync.Root);
