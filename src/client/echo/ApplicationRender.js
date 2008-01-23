/**
 * @fileoverview
 * <ul> 
 *  <li>Provides core property renderers.</li>
 *  <li>Provides property rendering utilities.</li>
 *  <li>Provides TriCellTable rendering utility (used by buttons and labels).</li>
 *  <li>Provides a floating pane z-index management system.</li> 
 * </ul>
 */

EchoAppRender = { 

    getEffectProperty: function(component, defaultPropertyName, effectPropertyName, effectState,
            defaultDefaultPropertyValue, effectDefaultPropertyValue) {
        var property;
        if (effectState) {
            property = component.render(effectPropertyName, effectDefaultPropertyValue);
        }
        if (!property) {
            property = component.render(defaultPropertyName, defaultDefaultPropertyValue);
        }
        return property;
    }
};

EchoAppRender.Alignment = { 

    getRenderedHorizontal: function(alignment, component) {
        var layoutDirection = component ? component.getRenderLayoutDirection() : EchoApp.LayoutDirection.LTR;
        switch (alignment.horizontal) {
        case EchoApp.Alignment.LEADING:
            return layoutDirection.isLeftToRight() ? EchoApp.Alignment.LEFT : EchoApp.Alignment.RIGHT;
        case EchoApp.Alignment.TRAILING:
            return layoutDirection.isLeftToRight() ? EchoApp.Alignment.RIGHT : EchoApp.Alignment.LEFT;
        default:
            return alignment.horizontal;
        }
    },

    renderComponentProperty: function(component, componentProperty, defaultValue, element, renderToElement, referenceComponent) {
        referenceComponent = referenceComponent ? referenceComponent : component;
        var alignment = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
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
    }
};

EchoAppRender.Border = {

    /**
     * @private
     */
    _SIDE_STYLE_NAMES: ["borderTop", "borderRight", "borderBottom", "borderLeft"],
    
    /**
     * @private
     */
    _SIDE_RENDER_STRATEGIES: [[0, 1, 2, 3], [0, 1, 2, 1], [0, 1, 0, 1], [0, 0, 0, 0]],
    
    render: function(border, element) {
        if (!border) {
            return;
        }
        if (border.multisided) {
            var renderStrategy = this._SIDE_RENDER_STRATEGIES[4 - border.sides.length];
            for (var i = 0; i < 4; ++i) {
                this.renderSide(border.sides[renderStrategy[i]], element, this._SIDE_STYLE_NAMES[i]);
            }
        } else {
            var color = border.color ? border.color : null;
            element.style.border = EchoAppRender.Extent.toPixels(border.size) + "px " + border.style + " " + (color ? color : "");
        }
    },
    
    renderClear: function(border, element) {
        if (border) {
            this.render(border, element);
        } else {
            element.style.border = "";
        }
    },
    
    renderComponentProperty: function(component, componentProperty, defaultValue, element) { 
        var border = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
        this.render(border ? border : defaultValue, element);
    },
    
    renderSide: function(borderSide, element, styleName) {
        var color = borderSide.color ? borderSide.color : null;
        element.style[styleName] = EchoAppRender.Extent.toPixels(borderSide.size) + "px " + borderSide.style + " " 
                + (color ? color : "");
    }
};

EchoAppRender.Color = {

    /**
     * Adjusts the value of the color's RGB values by the
     * specified amounts, returning a new Color.
     * The original color is unchanged.
     * 
     * @param color the color to adjust (a 24 bit hex value, e.g., #1a2b3c)
     * @param r the amount to adjust the red value of the color (-255 to 255)
     * @param g the amount to adjust the green value of the color (-255 to 255)
     * @param b the amount to adjust the blue value of the color (-255 to 255)
     * @return the adjusted color (a 24 bit hex value)
     */
    adjust: function(value, r, g, b) {
        var colorInt = parseInt(value.substring(1), 16);
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
        return "#" + (red < 16 ? "0" : "") + red.toString(16)
                + (green < 16 ? "0" : "") + green.toString(16)
                + (blue < 16 ? "0" : "") + blue.toString(16); 
    },

    render: function(color, element, styleProperty) {
        if (color) {
            element.style[styleProperty] = color;
        }
    },
    
    renderClear: function(color, element, styleProperty) {
        element.style[styleProperty] = color ? color : "";
    },
    
    renderComponentProperty: function(component, componentProperty, defaultValue, element, styleProperty) { 
        var color = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
        this.render(color ? color : defaultValue, element, styleProperty);
    },
    
    renderFB: function(component, element) { 
        var color;
        if (color = component.render("foreground")) {
            element.style.color = color;
        }
        if (color = component.render("background")) {
            element.style.backgroundColor = color;
        }
    }
};

EchoAppRender.Extent = { 

    toPixels: function(extent, horizontal) {
        if (extent == null) {
            return 0;
        } else {
            return WebCore.Measure.extentToPixels(extent.value, extent.units, horizontal);
        }
    }
};

EchoAppRender.FillImage = { 

    FLAG_ENABLE_IE_PNG_ALPHA_FILTER: 0x1,
    
    render: function(fillImage, element, flags) {
        if (!fillImage) {
            // No image specified, do nothing.
            return;
        }
        
        var url = fillImage.image ? fillImage.image.url : "";
        
        if (WebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
                flags && (flags & this.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
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
    },
    
    renderClear: function(fillImage, element, flags) {
        if (fillImage) {
            this.render(fillImage, element, flags);
        } else {
            element.style.backgroundImage = "";
            element.style.backgroundPosition = "";
            element.style.backgroundRepeat = "";
        }
    },
    
    renderComponentProperty: function(component, componentProperty, defaultValue,
            element, flags) {
        var fillImage = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
        this.render(fillImage ? fillImage : defaultValue, element, flags);
    }
};

EchoAppRender.Font = { 

    render: function(font, element) {
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
    },
    
    renderClear: function(font, element) {
        if (font) {
            this.render(font, element);
        } else {
            element.style.fontFamily = "";
            element.style.fontSize = "";
            element.style.fontWeight = "";
            element.style.fontStyle = "";
            element.style.textDecoration = "";
        }
    },
    
    renderComponentProperty: function(component, componentProperty, defaultValue, 
            element) {
        var font = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
        this.render(font ? font : defaultValue, element);
    },
    
    renderDefault: function(component, element, defaultValue) {
        this.renderComponentProperty(component, "font", defaultValue, element);
    }
};

EchoAppRender.Insets = { 

    renderComponentProperty: function(component, componentProperty, defaultValue, 
            element, styleProperty) { 
        var insets = component.render ? component.render(componentProperty)
                : component.get(componentProperty);
        this.renderPixel(insets ? insets : defaultValue, element, styleProperty);
    },
    
    renderPixel: function(insets, element, styleAttribute) {
        if (insets) {
            var pixelInsets = this.toPixels(insets);
            element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px "
                    + pixelInsets.bottom + "px " + pixelInsets.left + "px";
        }
    },
    
    toCssValue: function(insets) {
        if (insets) {
            var pixelInsets = this.toPixels(insets);
            return pixelInsets.top + "px " + pixelInsets.right + "px "
                    + pixelInsets.bottom + "px " + pixelInsets.left + "px";
        } else {
            return "";
        }
    },
    
    toPixels: function(insets) {
        return {
            top: WebCore.Measure.extentToPixels(insets.top.value, insets.top.units, false),
            right: WebCore.Measure.extentToPixels(insets.right.value, insets.right.units, true),
            bottom: WebCore.Measure.extentToPixels(insets.bottom.value, insets.bottom.units, false),
            left: WebCore.Measure.extentToPixels(insets.left.value, insets.left.units, true)
        };
    }
};

/**
 * @class Manages floating windows, e.g., window panes in a content pane.
 * Provides listener facility to receive notifications when the panes are raised or lowered,
 * such that floating panes may adjust their z-indices appropriately for correct display.
 * Registered listeners will be notified when one or more z-indices have changed.
 */
EchoAppRender.FloatingPaneManager = Core.extend({

    /**
     * Creates a new Floating Pane Manager.
     */
    $construct: function() {
        this._floatingPanes = null;
        this._listeners = null;
    },
    
    /**
     * Adds a floating pane to be managed, or, if the floating pane already exists,
     * raises it to the top.
     * The floating pane will be placed above all others, at the highest z-index.
     * 
     * @param {String} renderId the id of the floating pane
     * @return the initial z-index of the added floating pane
     */
    add: function(renderId) {
        if (!this._floatingPanes) {
            this._floatingPanes = [];
        }
        Core.Arrays.remove(this._floatingPanes, renderId);
        this._floatingPanes.push(renderId);
        this._fireZIndexEvent();
        return this._floatingPanes.length;
    },
    
    /**
     * Adds a z-index listener.  
     * 
     * @param {Function} the listener to add
     */
    addZIndexListener: function(l) {
        if (!this._listeners) {
            this._listeners = new Core.ListenerList();
        }
        this._listeners.addListener("zIndex", l);
    },
    
    /**
     * Notifies listeners of a z-index change.
     * @private
     */
    _fireZIndexEvent: function() {
        if (this._listeners) {
            this._listeners.fireEvent({type: "zIndex", source: this});
        }
    },
    
    /**
     * Returns the z-index of the floating pane with the specified id.
     * -1 is returned if the pane is not registered.
     * 
     * @param {String} renderId the id of the floating pane
     * @return the z-index
     */
    getIndex: function(renderId) {
        if (this._floatingPanes) {
            var index = Core.Arrays.indexOf(this._floatingPanes, renderId);
            return index == -1 ? -1 : index + 1;
        } else {
            return -1;
        }
    },
    
    /**
     * Removes a floating pane from being managed.
     * 
     * @param {String} renderId the id of the floating pane
     */
    remove: function(renderId) {
        if (!this._floatingPanes) {
            return;
        }
        Core.Arrays.remove(this._floatingPanes, renderId);
        this._fireZIndexEvent();
    },
    
    /**
     * Removes a z-index listener.
     * 
     * @param {Function} the listener to remove
     */
    removeZIndexListener: function(l) {
        if (!this._listeners) {
            return;
        }
        this._listeners.removeListener("zIndex", l);
    }
});

EchoAppRender.TriCellTable = Core.extend({

    $static: {
        
        INVERTED: 1,
        VERTICAL: 2,
        
        LEADING_TRAILING: 0,
        TRAILING_LEADING: 1, // INVERTED
        TOP_BOTTOM: 2,       // VERTICAL
        BOTTOM_TOP: 3,       // VERTICAL | INVERTED

        //FIXME. this method will need additional information with regard to RTL settings.
        getOrientation: function(component, propertyName) {
            var position = component.render(propertyName);
            var orientation;
            if (position) {
                switch (position.horizontal) {
                case EchoApp.Alignment.LEADING:  orientation = this.LEADING_TRAILING; break;
                case EchoApp.Alignment.TRAILING: orientation = this.TRAILING_LEADING; break;
                case EchoApp.Alignment.LEFT:     orientation = this.LEADING_TRAILING; break;
                case EchoApp.Alignment.RIGHT:    orientation = this.TRAILING_LEADING; break;
                default:
                    switch (position.vertical) {
                    case EchoApp.Alignment.TOP:    orientation = this.TOP_BOTTOM;       break;
                    case EchoApp.Alignment.BOTTOM: orientation = this.BOTTOM_TOP;       break;
                    default:                       orientation = this.TRAILING_LEADING; break;
                    }
                }
            } else {
                orientation = this.TRAILING_LEADING;
            }
            return orientation;
        },
        
        /**
         * @private
         */
        _createTablePrototype: function() {
            var tableElement = document.createElement("table");
            tableElement.style.borderCollapse = "collapse";
            tableElement.style.padding = "0px";
            
            tbodyElement = document.createElement("tbody");
            tableElement.appendChild(tbodyElement);
            
            return tableElement;
        }
    },
    
    $load: function() {
        this._tablePrototype = this._createTablePrototype(); 
    },
    
    /**
     * The rendered TABLE element.
     * @type Element
     */
    tableElement: null,
    
    /**
     * The rendered TBODY element.
     * @type Element
     */
    tbodyElement: null,

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
    $construct: function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
        this.tableElement = EchoAppRender.TriCellTable._tablePrototype.cloneNode(true);
        this.tbodyElement = this.tableElement.firstChild;
        
        if (orientation01_2 == null) {
            this.configure2(orientation0_1, margin0_1);
        } else {
            this.configure3(orientation0_1, margin0_1, orientation01_2, margin01_2);
        }
    },
    
    addColumn: function(trElement, tdElement) {
        if (tdElement != null) {
            trElement.appendChild(tdElement);
        }
    },
    
    addRow: function(tdElement) {
        if (tdElement == null) {
            return;
        }
        var trElement = document.createElement("tr");
        trElement.appendChild(tdElement);
        this.tbodyElement.appendChild(trElement);
    },
    
    addSpacer: function(parentElement, size, vertical) {
        var divElement = document.createElement("div");
        divElement.style.width = vertical ? "1px" : size + "px";
        divElement.style.height = vertical ? size + "px" : "1px";
        parentElement.appendChild(divElement);
    },
    
    /**
     * @param id the id of 
     */
    configure2: function(orientation0_1, margin0_1) {
        this.tdElements = [document.createElement("td"), document.createElement("td")];
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
    },
    
    configure3: function(orientation0_1, margin0_1, orientation01_2, margin01_2) {
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
    }
});
