/**
 * @fileoverview
 * <ul> 
 *  <li>Provides core property renderers.</li>
 *  <li>Provides property rendering utilities.</li>
 *  <li>Provides TriCellTable rendering utility (used by buttons and labels).</li>
 *  <li>Provides a floating pane z-index management system.</li> 
 * </ul>
 */

EchoAppRender = function() { };

EchoAppRender.getEffectProperty = function(component, defaultPropertyName, effectPropertyName, effectState) {
    var property;
    if (effectState) {
        property = component.getRenderProperty(effectPropertyName);
    }
    if (!property) {
        property = component.getRenderProperty(defaultPropertyName);
    }
    return property;
};

EchoAppRender.Alignment = function() { };

EchoAppRender.Alignment.getRenderedHorizontal = function(alignment, component) {
    var layoutDirection = component ? component.getRenderLayoutDirection() : EchoApp.LayoutDirection.LTR;
    switch (alignment.horizontal) {
    case EchoApp.Alignment.LEADING:
        return layoutDirection.isLeftToRight() ? EchoApp.Alignment.LEFT : EchoApp.Alignment.RIGHT;
    case EchoApp.Alignment.TRAILING:
        return layoutDirection.isLeftToRight() ? EchoApp.Alignment.RIGHT : EchoApp.Alignment.LEFT;
    default:
        return alignment.horizontal;
    }
};

EchoAppRender.Alignment.renderComponentProperty 
        = function(component, componentProperty, defaultValue, element, renderToElement, referenceComponent) {
    referenceComponent = referenceComponent ? referenceComponent : component;
    var alignment = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    if (!alignment) {
        alignment = defaultValue;
    }
    var horizontal = alignment ? EchoAppRender.Alignment.getRenderedHorizontal(alignment, referenceComponent) : null;
    var vertical = alignment ? alignment.vertical : null;
    
    var horizontalValue;
    switch (horizontal) {
    case EchoApp.Alignment.LEFT:   horizontalValue = "left";   break;
    case EchoApp.Alignment.CENTER: horizontalValue = "center"; break;
    case EchoApp.Alignment.RIGHT:  horizontalValue = "right";  break;
    default:                       horizontalValue = "";       break;
    }
    var verticalValue;
    switch (vertical) {
    case EchoApp.Alignment.TOP:    verticalValue = "top";      break;
    case EchoApp.Alignment.CENTER: verticalValue = "middle";   break;
    case EchoApp.Alignment.BOTTOM: verticalValue = "bottom";   break;
    default:                       verticalValue = "";         break;
    }
    
    if (renderToElement) {
        element.align = horizontalValue;
        element.vAlign = verticalValue;
    } else {
        element.style.textAlign = horizontalValue;
        element.style.verticalAlign = verticalValue;
    }
};

EchoAppRender.Border = function() { };

/**
 * @private
 */
EchoAppRender.Border._SIDE_STYLE_NAMES = new Array("borderTop", "borderRight", "borderBottom", "borderLeft");

/**
 * @private
 */
EchoAppRender.Border._SIDE_RENDER_STRATEGIES 
        = new Array(new Array(0, 1, 2, 3), new Array(0, 1, 2, 1), new Array(0, 1, 0, 1), new Array(0, 0, 0, 0));

EchoAppRender.Border.render = function(border, element) {
    if (!border) {
        return;
    }
    if (border.multisided) {
        var renderStrategy = EchoAppRender.Border._SIDE_RENDER_STRATEGIES[4 - border.sides.length];
        for (var i = 0; i < 4; ++i) {
            EchoAppRender.Border.renderSide(border.sides[renderStrategy[i]], element, 
                    EchoAppRender.Border._SIDE_STYLE_NAMES[i]);
        }
    } else {
        var color = border.color ? border.color.value : null;
        element.style.border = EchoAppRender.Extent.toPixels(border.size) + "px " + border.style + " " 
                + (color ? color : "");
    }
};

EchoAppRender.Border.renderClear = function(border, element) {
    if (border) {
        EchoAppRender.Border.render(border, element);
    } else {
        element.style.border = "";
    }
};

EchoAppRender.Border.renderComponentProperty = function(component, componentProperty, defaultValue, element) { 
    var border = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoAppRender.Border.render(border ? border : defaultValue, element);
};

EchoAppRender.Border.renderSide = function(borderSide, element, styleName) {
    var color = borderSide.color ? borderSide.color.value : null;
    element.style[styleName] = EchoAppRender.Extent.toPixels(borderSide.size) + "px " + borderSide.style + " " 
            + (color ? color : "");
};

EchoAppRender.Color = function() { };

EchoAppRender.Color.render = function(color, element, styleProperty) {
    if (color) {
        element.style[styleProperty] = color.value;
    }
};

EchoAppRender.Color.renderClear = function(color, element, styleProperty) {
    element.style[styleProperty] = color ? color.value : "";
};

EchoAppRender.Color.renderComponentProperty = function(component, componentProperty, defaultValue, element, styleProperty) { 
    var color = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoAppRender.Color.render(color ? color : defaultValue, element, styleProperty);
};

EchoAppRender.Color.renderFB = function(component, element) { 
    var color;
    if (color = component.getRenderProperty("foreground")) {
        element.style.color = color.value;
    }
    if (color = component.getRenderProperty("background")) {
        element.style.backgroundColor = color.value;
    }
};

EchoAppRender.Extent = function() { };

EchoAppRender.Extent.toPixels = function(extent, horizontal) {
    if (extent == null) {
        return 0;
    } else {
        return EchoWebCore.Render.extentToPixels(extent.value, extent.units, horizontal);
    }
};

EchoAppRender.FillImage = function() { };

EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER = 0x1;

EchoAppRender.FillImage.render = function(fillImage, element, flags) {
    if (!fillImage) {
        // No image specified, do nothing.
        return;
    }
    
    var url = fillImage.image ? fillImage.image.url : "";
    
    if (EchoWebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
            flags && (flags & EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
        // IE6 PNG workaround required.
        element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" 
            + url + "', sizingMethod='scale')";
    } else {
        // IE6 PNG workaround not required.
        element.style.backgroundImage = "url(" + url + ")";
    }
    
    if (fillImage.repeat || fillImage.repeat == EchoApp.FillImage.NO_REPEAT) {
        var repeat;
        switch (fillImage.repeat) {
        case EchoApp.FillImage.NO_REPEAT:
            repeat = "no-repeat";
            break;
        case EchoApp.FillImage.REPEAT_HORIZONTAL:
            repeat = "repeat-x";
            break;
        case EchoApp.FillImage.REPEAT_VERTICAL:
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

EchoAppRender.FillImage.renderClear = function(fillImage, element, flags) {
    if (fillImage) {
        EchoAppRender.FillImage.render(fillImage, element, flags);
    } else {
        element.style.backgroundImage = "";
        element.style.backgroundPosition = "";
        element.style.backgroundRepeat = "";
    }
};

EchoAppRender.FillImage.renderComponentProperty = function(component, componentProperty, defaultValue,
        element, flags) {
    var fillImage = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoAppRender.FillImage.render(fillImage ? fillImage : defaultValue, element, flags);
};

EchoAppRender.Font = function() { };

EchoAppRender.Font.render = function(font, element) {
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
        element.style.fontSize = EchoAppRender.Extent.toPixels(font.size) + "px";
    }
    if (font.style) {
        if (font.style & EchoApp.Font.BOLD) {
            element.style.fontWeight = "bold";
        }
        if (font.style & EchoApp.Font.ITALIC) {
            element.style.fontStyle = "italic";
        }
        if (font.style & EchoApp.Font.UNDERLINE) {
            element.style.textDecoration = "underline";
        } else if (font.style & EchoApp.Font.OVERLINE) {
            element.style.textDecoration = "overline";
        } else if (font.style & EchoApp.Font.LINE_THROUGH) {
            element.style.textDecoration = "line-through";
        }
    } else if (font.style == EchoApp.Font.PLAIN) {
        element.style.fontWeight = "";
        element.style.fontStyle = "";
        element.style.textDecoration = "";
    }
};

EchoAppRender.Font.renderClear = function(font, element) {
    if (font) {
        EchoAppRender.Font.render(font, element);
    } else {
        element.style.fontFamily = "";
        element.style.fontSize = "";
        element.style.fontWeight = "";
        element.style.fontStyle = "";
        element.style.textDecoration = "";
    }
};

EchoAppRender.Font.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element) {
    var font = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoAppRender.Font.render(font ? font : defaultValue, element);
};

EchoAppRender.Font.renderDefault = function(component, element, defaultValue) {
    EchoAppRender.Font.renderComponentProperty(component, "font", defaultValue, element);
};

EchoAppRender.Insets = function() { };

EchoAppRender.Insets.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element, styleProperty) { 
    var insets = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoAppRender.Insets.renderPixel(insets ? insets : defaultValue, element, styleProperty);
};

EchoAppRender.Insets.renderPixel = function(insets, element, styleAttribute) {
    if (insets) {
        var pixelInsets = EchoAppRender.Insets.toPixels(insets);
        element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    }
};

EchoAppRender.Insets.toCssValue = function(insets) {
    if (insets) {
        var pixelInsets = EchoAppRender.Insets.toPixels(insets);
        return pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    } else {
        return "";
    }
};

EchoAppRender.Insets.toPixels = function(insets) {
    var pixelInsets = new Object();
    pixelInsets.top = EchoWebCore.Render.extentToPixels(insets.top.value, insets.top.units, false);
    pixelInsets.right = EchoWebCore.Render.extentToPixels(insets.right.value, insets.right.units, true);
    pixelInsets.bottom = EchoWebCore.Render.extentToPixels(insets.bottom.value, insets.bottom.units, false);
    pixelInsets.left = EchoWebCore.Render.extentToPixels(insets.left.value, insets.left.units, true);
    return pixelInsets;
};

/**
 * Creates a new Floating Pane Manager.
 * 
 * @class Manages floating windows, e.g., window panes in a content pane.
 * Provides listener facility to receive notifications when the panes are raised or lowered,
 * such that floating panes may adjust their z-indices appropriately for correct display.
 * 
 * Registered listeners will be notified when one or more z-indices have changed.
 */
EchoAppRender.FloatingPaneManager = function() {
    this._floatingPanes = null;
    this._listeners = null;
};

/**
 * Adds a floating pane to be managed, or, if the floating pane already exists,
 * raises it to the top.
 * The floating pane will be placed above all others, at the highest z-index.
 * 
 * @param {String} renderId the id of the floating pane
 * @return the initial z-index of the added floating pane
 */
EchoAppRender.FloatingPaneManager.prototype.add = function(renderId) {
    if (!this._floatingPanes) {
        this._floatingPanes = new Array();
    }
    EchoCore.Arrays.remove(this._floatingPanes, renderId);
    this._floatingPanes.push(renderId);
    this._fireZIndexEvent();
    return this._floatingPanes.length;
};

/**
 * Adds a z-index listener.  
 * 
 * @param the listener to add (a method or MethodRef)
 */
EchoAppRender.FloatingPaneManager.prototype.addZIndexListener = function(l) {
    if (!this._listeners) {
        this._listeners = new EchoCore.ListenerList();
    }
    this._listeners.addListener("zIndex", l);
};

/**
 * Notifies listeners of a z-index change.
 * @private
 */
EchoAppRender.FloatingPaneManager.prototype._fireZIndexEvent = function() {
    if (this._listeners) {
        this._listeners.fireEvent(new EchoCore.Event("zIndex", this));
    }
};

/**
 * Returns the z-index of the floating pane with the specified id.
 * -1 is returned if the pane is not registered.
 * 
 * @param {String} renderId the id of the floating pane
 * @return the z-index
 */
EchoAppRender.FloatingPaneManager.prototype.getIndex = function(renderId) {
    if (this._floatingPanes) {
        var index = EchoCore.Arrays.indexOf(this._floatingPanes, renderId);
        return index == -1 ? -1 : index + 1;
    } else {
        return -1;
    }
};

/**
 * Removes a floating pane from being managed.
 * 
 * @param {String} renderId the id of the floating pane
 */
EchoAppRender.FloatingPaneManager.prototype.remove = function(renderId) {
    if (!this._floatingPanes) {
        return;
    }
    EchoCore.Arrays.remove(this._floatingPanes, renderId);
    this._fireZIndexEvent();
};

/**
 * Removes a z-index listener.
 * 
 * @param the listener to remove (a method or MethodRef)
 */
EchoAppRender.FloatingPaneManager.prototype.removeZIndexListener = function(l) {
    if (!this._listeners) {
        return;
    }
    this._listeners.removeListener("zIndex", l);
};

/**
 * Creates a new <code>TriCellTable</code>
 * 
 * @param orientation0_1 the orientation of element 0 with respect to element 1, one of 
 *        the following values:
 *        <ul>
 *        <ul>
 *        <li>LEADING_TRAILING (element 0 is leading element 1)</li>
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
EchoAppRender.TriCellTable = function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.tableElement = EchoAppRender.TriCellTable._tablePrototype.cloneNode(true);
    this.tbodyElement = this.tableElement.firstChild;
    
    if (orientation01_2 == null) {
        this.configure2(orientation0_1, margin0_1);
    } else {
        this.configure3(orientation0_1, margin0_1, orientation01_2, margin01_2);
    }
};

//FIXME. this method will need additional information with regard to RTL settings.
EchoAppRender.TriCellTable.getOrientation = function(component, propertyName) {
    var position = component.getRenderProperty(propertyName);
    var orientation;
    if (position) {
        switch (position.horizontal) {
        case EchoApp.Alignment.LEADING:  orientation = EchoAppRender.TriCellTable.LEADING_TRAILING; break;
        case EchoApp.Alignment.TRAILING: orientation = EchoAppRender.TriCellTable.TRAILING_LEADING; break;
        case EchoApp.Alignment.LEFT:     orientation = EchoAppRender.TriCellTable.LEADING_TRAILING; break;
        case EchoApp.Alignment.RIGHT:    orientation = EchoAppRender.TriCellTable.TRAILING_LEADING; break;
        default:
            switch (position.vertical) {
            case EchoApp.Alignment.TOP:    orientation = EchoAppRender.TriCellTable.TOP_BOTTOM;       break;
            case EchoApp.Alignment.BOTTOM: orientation = EchoAppRender.TriCellTable.BOTTOM_TOP;       break;
            default:                                orientation = EchoAppRender.TriCellTable.TRAILING_LEADING; break;
            }
        }
    } else {
        orientation = EchoAppRender.TriCellTable.TRAILING_LEADING;
    }
    return orientation;
};

/**
 * @private
 */
EchoAppRender.TriCellTable._createTablePrototype = function() {
    var tableElement = document.createElement("table");
    tableElement.style.borderCollapse = "collapse";
    tableElement.style.padding = "0px";
    
    tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    
    return tableElement;
};

/**
 * @private
 */
EchoAppRender.TriCellTable._tablePrototype = EchoAppRender.TriCellTable._createTablePrototype();

EchoAppRender.TriCellTable.INVERTED = 1;
EchoAppRender.TriCellTable.VERTICAL = 2;

EchoAppRender.TriCellTable.LEADING_TRAILING = 0;
EchoAppRender.TriCellTable.TRAILING_LEADING = EchoAppRender.TriCellTable.INVERTED;
EchoAppRender.TriCellTable.TOP_BOTTOM = EchoAppRender.TriCellTable.VERTICAL;
EchoAppRender.TriCellTable.BOTTOM_TOP = EchoAppRender.TriCellTable.VERTICAL | EchoAppRender.TriCellTable.INVERTED;

EchoAppRender.TriCellTable.prototype.addColumn = function(trElement, tdElement) {
    if (tdElement != null) {
        trElement.appendChild(tdElement);
    }
};

EchoAppRender.TriCellTable.prototype.addRow = function(tdElement) {
    if (tdElement == null) {
        return;
    }
    var trElement = document.createElement("tr");
    trElement.appendChild(tdElement);
    this.tbodyElement.appendChild(trElement);
};

EchoAppRender.TriCellTable.prototype.addSpacer = function(parentElement, size, vertical) {
    var divElement = document.createElement("div");
    divElement.style.width = vertical ? "1px" : size + "px";
    divElement.style.height = vertical ? size + "px" : "1px";
    parentElement.appendChild(divElement);
};

/**
 * @param id the id of 
 */
EchoAppRender.TriCellTable.prototype.configure2 = function(orientation0_1, margin0_1) {
    this.tdElements = new Array(document.createElement("td"), document.createElement("td"));
    this.tdElements[0].style.padding = "0px";
    this.tdElements[1].style.padding = "0px";
    this.marginTdElements = new Array(1);
    
    if (margin0_1) {
        this.marginTdElements[0] = document.createElement("td");
        this.marginTdElements[0].style.padding = "0px";
        if ((orientation0_1 & EchoAppRender.TriCellTable.VERTICAL) == 0) {
            this.marginTdElements[0].style.width = margin0_1 + "px";
            this.addSpacer(this.marginTdElements[0], margin0_1, false);
        } else {
            this.marginTdElements[0].style.height = margin0_1 + "px";
            this.addSpacer(this.marginTdElements[0], margin0_1, true);
        }
    }
    
    if (orientation0_1 & EchoAppRender.TriCellTable.VERTICAL) {
        // Vertically oriented.
        if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
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
        if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
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

EchoAppRender.TriCellTable.prototype.configure3 = function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
    this.tdElements = new Array(3);
    for (var i = 0; i < 3; ++i) {
        this.tdElements[i] = document.createElement("td");
        this.tdElements[i].style.padding = "0px";
    }
    this.marginTdElements = new Array(2);
    
    if (margin0_1 || margin01_2 != null) {
        if (margin0_1 && margin0_1 > 0) {
            this.marginTdElements[0] = document.createElement("td");
            if (orientation0_1 & EchoAppRender.TriCellTable.VERTICAL) {
                this.marginTdElements[0].style.height = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, true);
            } else {
                this.marginTdElements[0].style.width = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, false);
            }
        }
        if (margin01_2 != null && margin01_2 > 0) {
            this.marginTdElements[1] = document.createElement("td");
            if (orientation0_1 & EchoAppRender.TriCellTable.VERTICAL) {
                this.marginTdElements[1].style.height = margin01_2 + "px";
                this.addSpacer(this.marginTdElements[1], margin01_2, true);
            } else {
                this.marginTdElements[1].style.width = margin01_2 + "px";
                this.addSpacer(this.marginTdElements[1], margin01_2, false);
            }
        }
    }
    
    if (orientation0_1 & EchoAppRender.TriCellTable.VERTICAL) {
        // Vertically oriented 0/1.
        if (orientation01_2 & EchoAppRender.TriCellTable.VERTICAL) {
            // Vertically oriented 01/2
            
            if (orientation01_2 & EchoAppRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TABLE.
                this.addRow(this.tdElements[2]);
                this.addRow(this.marginTdElements[1]);
            }
            
            // Render 01
            if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
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

            if (!(orientation01_2 & EchoAppRender.TriCellTable.INVERTED)) {
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
            if (orientation01_2 & EchoAppRender.TriCellTable.INVERTED) {
                this.addColumn(trElement, this.tdElements[2]);
                this.addColumn(trElement, this.marginTdElements[1]);
                if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
                    this.addColumn(trElement, this.tdElements[1]);
                } else {
                    this.addColumn(trElement, this.tdElements[0]);
                }
            } else {
                if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
                    this.addColumn(trElement, this.tdElements[1]);
                } else {
                    this.addColumn(trElement, this.tdElements[0]);
                }
                this.addColumn(trElement, this.marginTdElements[1]);
                this.addColumn(trElement, this.tdElements[2]);
            }
            this.tbodyElement.appendChild(trElement);
            
            this.addRow(this.marginTdElements[0]);
            if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
                this.addRow(this.tdElements[0]);
            } else {
                this.addRow(this.tdElements[1]);
            }
        }
    } else {
        // horizontally oriented 0/1
        if (orientation01_2 & EchoAppRender.TriCellTable.VERTICAL) {
            // vertically oriented 01/2

            // determine and apply column span based on presence of margin between 0 and 1
            var columns = margin0_1 ? 3 : 2;
            this.tdElements[2].setAttribute("colspan", columns);
            if (this.marginTdElements[1] != null) {
                this.marginTdElements[1].setAttribute("colspan", Integer.toString(columns));
            }
            
            if (orientation01_2 & EchoAppRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TR.
                this.addRow(this.tdElements[2]);
                this.addRow(this.marginTdElements[1]);
            }
            
            // Render 01
            trElement = document.createElement("tr");
            if ((orientation0_1 & EchoAppRender.TriCellTable.INVERTED) == 0) {
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
            
            if (!(orientation01_2 & EchoAppRender.TriCellTable.INVERTED)) {
                // 01 before 2: render margin and #2 at end of TR.
                this.addRow(this.marginTdElements[1]);
                this.addRow(this.tdElements[2]);
            }

        } else {
            // horizontally oriented 01/2
            trElement = document.createElement("tr");
            if (orientation01_2 & EchoAppRender.TriCellTable.INVERTED) {
                // 2 before 01: render #2 and margin at beginning of TR.
                this.addColumn(trElement, this.tdElements[2]);
                this.addColumn(trElement, this.marginTdElements[1]);
            }
            
            // Render 01
            if (orientation0_1 & EchoAppRender.TriCellTable.INVERTED) {
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
            
            if (!(orientation01_2 & EchoAppRender.TriCellTable.INVERTED)) {
                this.addColumn(trElement, this.marginTdElements[1]);
                this.addColumn(trElement, this.tdElements[2]);
            }
            
            this.tbodyElement.appendChild(trElement);        
        }
    }
};