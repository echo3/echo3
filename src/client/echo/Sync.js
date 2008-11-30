/**
 * @fileoverview
 * <ul> 
 *  <li>Provides property rendering utilities for core properties.</li>
 *  <li>Provides TriCellTable rendering utility (used by buttons and labels).</li>
 *  <li>Provides a floating pane z-index management system.</li> 
 * </ul>
 */

/**
 * @namespace
 */
Echo.Sync = { 

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
    },
    
    /**
     * Renders component foreground, background, font, and layout direction properties
     * (if each is provided) to the specified element.  This is a performance/convenience method
     * which combines capabilities found in Echo.Sync.Color/Font/LayoutDirection.
     * 
     * @param {Echo.Component} component the component
     * @param {Element} element the target element
     */
    renderComponentDefaults: function(component, element) {
        var color;
        if ((color = component.render("foreground"))) {
            element.style.color = color;
        }
        if ((color = component.render("background"))) {
            element.style.backgroundColor = color;
        }
        var font = component.render("font");
        if (font) {
            Echo.Sync.Font.render(font, element);
        }
        if (component.getLayoutDirection()) {
            element.dir = component.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl";
        }
    }
};

/**
 * Provides tools for rendering alignment properties.
 * @class
 */
Echo.Sync.Alignment = { 

    _HORIZONTALS: { left: true, center: true, right: true, leading: true, trailing: true },
    _VERTICALS: { top: true, middle: true, bottom: true },

    getRenderedHorizontal: function(alignment, layoutDirectionProvider) {
        if (alignment == null) {
            return null;
        }
    
        var layoutDirection = layoutDirectionProvider ? 
                layoutDirectionProvider.getRenderLayoutDirection() : Echo.LayoutDirection.LTR;
         
        var horizontal = typeof(alignment) == "object" ? alignment.horizontal : alignment; 
                
        switch (horizontal) {
        case "leading":
            return layoutDirection.isLeftToRight() ? "left" : "right";
        case "trailing":
            return layoutDirection.isLeftToRight() ? "right" : "left";
        default:
            return horizontal in this._HORIZONTALS ? horizontal : null;
        }
    },
    
    getHorizontal: function(alignment) {
        if (alignment == null) {
            return null;
        }
        if (typeof(alignment == "string")) {
            return alignment in this._HORIZONTALS ? alignment : null;
        } else {
            return alignment.horizontal;
        }
    },

    getVertical: function(alignment) {
        if (alignment == null) {
            return null;
        }
        if (typeof(alignment == "string")) {
            return alignment in this._VERTICALS ? alignment : null;
        } else {
            return alignment.vertical;
        }
    },

    render: function(alignment, element, renderToElement, layoutDirectionProvider) {
        if (alignment == null) {
            return;
        }
        
        var horizontal = Echo.Sync.Alignment.getRenderedHorizontal(alignment, layoutDirectionProvider);
        var vertical = typeof(alignment) == "object" ? alignment.vertical : alignment;
    
        var horizontalValue;
        switch (horizontal) {
        case "left":   horizontalValue = "left";   break;
        case "center": horizontalValue = "center"; break;
        case "right":  horizontalValue = "right";  break;
        default:       horizontalValue = "";       break;
        }
        var verticalValue;
        switch (vertical) {
        case "top":    verticalValue = "top";      break;
        case "middle": verticalValue = "middle";   break;
        case "bottom": verticalValue = "bottom";   break;
        default:       verticalValue = "";         break;
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

/**
 * Provides tools for rendering border properties.
 * @class
 */
Echo.Sync.Border = {

    /**
     * Regular expression to validate/parse a CSS border expression, e.g., "1px solid #abcdef".
     * Supports omission of any term, or empty strings.
     */
    _PARSER_PX: new RegExp("^(-?\\d+px)?(?:^|$|(?= )) ?(none|hidden|dotted|dashed|solid|" + 
            "double|groove|ridge|inset|outset)?(?:^|$|(?= )) ?(#[0-9a-fA-F]{6})?$"),

    /**
     * Regular expression to validate/parse a pixel-based CSS border expression, e.g., "1px solid #abcdef".
     * Supports omission of any term, or empty strings.
     */
    _PARSER: new RegExp("^(-?\\d+(?:px|pt|pc|cm|mm|in|em|ex))?(?:^|$|(?= )) ?(none|hidden|dotted|dashed|solid|" +
            "double|groove|ridge|inset|outset)?(?:^|$|(?= )) ?(#[0-9a-fA-F]{6})?$"),
            
    _TEST_EXTENT_PX: /^(-?\d+px*)$/,
    
    /**
     * Creates a border property from a size, style, and color.
     * 
     * @param {#Extent} size the border size
     * @param {String} the border style
     * @param {#Color} the border color
     * @return a border object
     * @type #Border
     */
    compose: function(size, style, color) {
        if (typeof size == "number") {
            size += "px";
        }
        var out = [];
        if (size) {
            out.push(size);
        }
        if (style) {
            out.push(style);
        }
        if (color) {
            out.push(color);
        }
        return out.join(" ");
    },
    
    /**
     * Parses a border into size, style, and color components.
     * 
     * @param border the border to parse
     * @return an object containing size, style, and color properties of the border
     */
    parse: function(border) {
        if (!border) {
            return { };
        }
        if (typeof(border) == "string") {
            var parts = this._PARSER.exec(border);
            return { size: parts[1], style: parts[2], color: parts[3] }; 
        } else {
            // FIXME support multisided borders.
            return { };
        }
    },

    /**
     * Renders a border to a DOM element.
     * 
     * @param {#Border} border the border to render
     * @param {Element} the target DOM element
     * @param {String} styleAttribute the CSS style attribute name (defaults to "border" if omitted)
     */
    render: function(border, element, styleAttribute) {
        if (!border) {
            return;
        }
        styleAttribute = styleAttribute ? styleAttribute : "border";
        if (typeof(border) == "string") {
            if (this._PARSER_PX.test(border)) {
                element.style[styleAttribute] = border;
            } else {
                var elements = this._PARSER.exec(border);
                if (elements == null) {
                    throw new Error("Invalid border: \"" + border + "\"");
                }
            }
        } else {
            this.render(border.top, element, styleAttribute + "Top");
            if (border.right !== null) {
                this.render(border.right || border.top, element, styleAttribute + "Right");
            }
            if (border.bottom !== null) {
                this.render(border.bottom || border.top, element, styleAttribute + "Bottom");
            }
            if (border.left !== null) {
                this.render(border.left || border.right || border.top, element, styleAttribute + "Left");
            }
            
        }
    },
    
    /**
     * Renders a border to a DOM element, clearing an existing border if the border value is null.
     * 
     * @param {#Border} border the border to render
     * @param {Element} the target DOM element
     * @param {String} styleAttribute the CSS style attribute name (defaults to "border" if omitted)
     */
    renderClear: function(border, element) {
        if (border) {
            this.render(border, element);
        } else {
            element.style.border = "";
        }
    },

    /**
     * Determines the size of a particular side of the border in pixels.
     * 
     * @param {#Border} border the border
     * @param {String} sideName, the border side name, "left", "right", "bottom", or "top" (defaults to "top" if omitted)
     * @return the border size in pixels
     * @type {Number}
     */
    getPixelSize: function(border, sideName) {
        if (!border) {
            return 0;
        }
        
        if (typeof(border) == "string") {
            var extent = this._PARSER.exec(border)[1];
            if (extent == null) {
                return 0;
            } else if (this._TEST_EXTENT_PX.test(extent)) {
                return parseInt(extent, 10);
            } else {
                return Echo.Sync.Extent.toPixels(extent);
            }
        } else if (typeof(border) == "object") {
            // Retrieve value for individual side.
            // Specified side is queried first, followed by alternatives.
            while (true) {
                var side = this.getPixelSize(border[sideName]);
                if (side == null) {
                    switch (sideName) {
                    case "left": 
                        // If left side specified but value null, try again with right.
                        sideName = "right"; 
                        continue;
                    case "right":
                    case "bottom": 
                        // If bottom or right side specified, try again with top.
                        sideName = "top";
                        continue; 
                    }
                }
                return side;
            }
        }
    }
};

/**
 * Provides tools for rendering color properties.
 * @class
 */
Echo.Sync.Color = {

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
        var red = Math.floor(colorInt / 0x10000) + r;
        var green = Math.floor(colorInt / 0x100) % 0x100 + g;
        var blue = colorInt % 0x100 + b;
        return this.toHex(red, green, blue);
    },
    
    blend: function(value1, value2, ratio) {
        ratio = ratio < 0 ? 0 : (ratio > 1 ? 1 : ratio);
        var colorInt1 = parseInt(value1.substring(1), 16);
        var colorInt2 = parseInt(value2.substring(1), 16);
        var red = Math.round(Math.floor(colorInt1 / 0x10000) * (1 - ratio) + Math.floor(colorInt2 / 0x10000) * ratio);
        var green = Math.round(Math.floor(colorInt1 / 0x100) % 0x100 * (1 - ratio) + 
                Math.floor(colorInt2 / 0x100) % 0x100 * ratio);
        var blue = Math.round((colorInt1 % 0x100) * (1 - ratio) + (colorInt2 % 0x100) * ratio);
        return this.toHex(red, green, blue);
    },

    render: function(color, element, styleProperty) {
        if (color) {
            element.style[styleProperty] = color;
        }
    },
    
    renderClear: function(color, element, styleProperty) {
        element.style[styleProperty] = color ? color : "";
    },
    
    renderFB: function(component, element) { 
        var color;
        if ((color = component.render("foreground"))) {
            element.style.color = color;
        }
        if ((color = component.render("background"))) {
            element.style.backgroundColor = color;
        }
    },
    
    toHex: function(red, green, blue) {
        if (red < 0) {
            red = 0;
        } else if (red > 255) {
            red = 255;
        }
        if (green < 0) {
            green = 0;
        } else if (green > 255) {
            green = 255;
        }
        if (blue < 0) {
            blue = 0;
        } else if (blue > 255) {
            blue = 255;
        }

        return "#" + (red < 16 ? "0" : "") + red.toString(16) +
                (green < 16 ? "0" : "") + green.toString(16) +
                (blue < 16 ? "0" : "") + blue.toString(16); 
    }
};

/**
 * Provides tools for rendering extent (dimension) properties.
 * @class
 */
Echo.Sync.Extent = { 

    /**
     * Regular expression to parse an extent value, e.g., "12px" into its value and unit components.
     */
    _PARSER: /^(-?\d+(?:\.\d+)?)(.+)?$/,

    _FORMATTED_PIXEL_TEST: /^(-?\d+px *)$/,
    
    isPercent: function(extent) {
        if (extent == null || typeof(extent) == "number") {
            return false;
        } else {
            var parts = this._PARSER.exec(arguments[0]);
            if (!parts) {
                throw new Error("Invalid Extent: " + arguments[0]);
            }
            return parts[2] == "%";
        }
    },
    
    render: function(extent, element, styleAttribute, horizontal, allowPercent) {
        var cssValue = Echo.Sync.Extent.toCssValue(extent, horizontal, allowPercent);
        if (cssValue !== "") {
            element.style[styleAttribute] = cssValue;
        }
    },

    toCssValue: function(extent, horizontal, allowPercent) {
        switch(typeof(extent)) {
            case "number":
                return extent + "px";
            case "string":
                if (this._FORMATTED_PIXEL_TEST.test(extent)) {
                    return extent;
                } else {
                    if (allowPercent && this.isPercent(extent)) {
                        return extent;
                    } else {
                        var pixels = this.toPixels(extent, horizontal);
                        return pixels == null ? "" : this.toPixels(extent, horizontal) + "px";
                    }
                }
                break;
        }
        return "";
    },

    toPixels: function(extent, horizontal) {
        if (extent == null) {
            return 0;
        } else if (typeof(extent) == "number") {
            return extent;
        } else {
            return Core.Web.Measure.extentToPixels(extent, horizontal);
        }
    }
};

/**
 * Provides tools for rendering fill image (background image) properties.
 * @class
 */
Echo.Sync.FillImage = { 

    _REPEAT_VALUES: {
        "0": "no-repeat",
        "x": "repeat-x",
        "y": "repeat-y",
        "xy": "repeat",
        "no-repeat": "no-repeat",
        "repeat-x": "repeat-x",
        "repeat-y": "repeat-y",
        "repeat": "repeat"
    },

    FLAG_ENABLE_IE_PNG_ALPHA_FILTER: 0x1,
    
    getPosition: function(fillImage) {
        if (fillImage.x || fillImage.y) {
            var x, y;
            if (Echo.Sync.Extent.isPercent(fillImage.x)) {
                x = fillImage.x;
            } else {
                x = Echo.Sync.Extent.toPixels(fillImage.x, true) + "px";
            }
            if (Echo.Sync.Extent.isPercent(fillImage.y)) {
                y = fillImage.y;
            } else {
                y = Echo.Sync.Extent.toPixels(fillImage.y, false) + "px";
            }
            return x + " " + y;
        } else {
            return null;
        }
    },
    
    getRepeat: function(fillImage) {
        if (this._REPEAT_VALUES[fillImage.repeat]) {
            return this._REPEAT_VALUES[fillImage.repeat]; 
        } else {
            return null;
        }
    },
    
    getUrl: function(fillImage) {
        if (fillImage == null) {
            return null;
        }
        return typeof(fillImage) == "object" ? fillImage.url : fillImage;
    },
    
    render: function(fillImage, element, flags) {
        if (fillImage == null) {
            // No image specified, do nothing.
            return;
        }
        
        var isObject = typeof(fillImage) == "object";
        var url = isObject ? fillImage.url : fillImage;

        if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
                flags && (flags & this.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
            // IE6 PNG workaround required.
            element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url + "', sizingMethod='scale')";
        } else {
            // IE6 PNG workaround not required.
            element.style.backgroundImage = "url(" + url + ")";
        }
        
        if (isObject) {
            if (this._REPEAT_VALUES[fillImage.repeat]) {
                element.style.backgroundRepeat = this._REPEAT_VALUES[fillImage.repeat]; 
            }
            
            var position = Echo.Sync.FillImage.getPosition(fillImage);
            if (position) {
                element.style.backgroundPosition = position;
            }
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
    }
};

/**
 * Provides tools for rendering font properties.
 * @class
 */
Echo.Sync.Font = { 

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
            element.style.fontSize = Echo.Sync.Extent.toCssValue(font.size);
        }

        if (font.bold) {
            element.style.fontWeight = "bold";
        }
        if (font.italic) {
            element.style.fontStyle = "italic";
        }
        if (font.underline) {
            element.style.textDecoration = "underline";
        } else if (font.overline) {
            element.style.textDecoration = "overline";
        } else if (font.lineThrough) {
            element.style.textDecoration = "line-through";
        }
    },
    
    renderClear: function(font, element) {
        if (font) {
            this.render(font, element);
            if (!font.typeface) {
                element.style.fontFamily = "";
            }
            if (!font.underline) {
                element.style.textDecoration = "";
            }
            if (!font.bold) {
                element.style.fontWeight = "";
            }
            if (!font.size) {
                element.style.fontSize = "";
            }
            if (!font.italic) {
                element.style.fontStyle = "";
            }
        } else {
            element.style.fontFamily = "";
            element.style.fontSize = "";
            element.style.fontWeight = "";
            element.style.fontStyle = "";
            element.style.textDecoration = "";
        }
    }
};

/**
 * Provides tools for rendering image properties.
 * @class
 */
Echo.Sync.ImageReference = {

    getUrl: function(imageReference) {
        return imageReference ? (typeof(imageReference) == "string" ? imageReference : imageReference.url) : null;
    },

    renderImg: function(imageReference, imgElement) {
        if (!imageReference) {
            return;
        }
        
        if (typeof(imageReference) == "string") {
            imgElement.src = imageReference;
        } else {
            imgElement.src = imageReference.url;
            if (imageReference.width) {
                imgElement.style.width = Echo.Sync.Extent.toCssValue(imageReference.width, true);
            }
            if (imageReference.height) {
                imgElement.style.height = Echo.Sync.Extent.toCssValue(imageReference.height, false);
            }
        }
    }
};

/**
 * Provides tools for rendering insets/margin/padding properties.
 * @class
 */
Echo.Sync.Insets = {

    /**
     * Regular expression to test extents which are entirely presented in pixels
     * and may thus be directly added to CSS.
     */
    _FORMATTED_PIXEL_INSETS: /^(-?\d+px *){1,4}$/,

    _ZERO: { top: 0, right: 0, bottom: 0, left: 0 },
    
    /**
     * Mapping between number of inset values provided and arrays which represent the
     * inset value index for the top, right, bottom, and left value. 
     */
    _INDEX_MAPS: {
        1: [0, 0, 0, 0], 
        2: [0, 1, 0, 1], 
        3: [0, 1, 2, 1], 
        4: [0, 1, 2, 3] 
    },

    render: function(insets, element, styleAttribute) {
        switch(typeof(insets)) {
            case "number":
                element.style[styleAttribute] = insets + "px";
                break;
            case "string":
                if (this._FORMATTED_PIXEL_INSETS.test(insets)) {
                    element.style[styleAttribute] = insets;
                } else {
                    var pixelInsets = this.toPixels(insets);
                    element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px " +
                            pixelInsets.bottom + "px " + pixelInsets.left + "px";
                }
                break;
        }
    },
    
    toCssValue: function(insets) {
        switch(typeof(insets)) {
            case "number":
                return insets + "px";
            case "string":
                if (this._FORMATTED_PIXEL_INSETS.test(insets)) {
                    return insets;
                } else {
                    var pixelInsets = this.toPixels(insets);
                    return pixelInsets.top + "px " + pixelInsets.right + "px " +
                            pixelInsets.bottom + "px " + pixelInsets.left + "px";
                }
                break;
        }
        return "";
    },
    
    toPixels: function(insets) {
        if (insets == null) {
            return this._ZERO;
        } else if (typeof(insets) == "number") {
            return { top: insets, right: insets, bottom: insets, left: insets };
        }
        
        insets = insets.split(" ");
        var map = this._INDEX_MAPS[insets.length];
        return {
            top: Echo.Sync.Extent.toPixels(insets[map[0]], false),
            right: Echo.Sync.Extent.toPixels(insets[map[1]], true),
            bottom: Echo.Sync.Extent.toPixels(insets[map[2]], false),
            left: Echo.Sync.Extent.toPixels(insets[map[3]], true)
        };
    }
};

/**
 * Manages floating windows, e.g., window panes in a content pane.
 * Provides listener facility to receive notifications when the panes are raised or lowered,
 * such that floating panes may adjust their z-indices appropriately for correct display.
 * Registered listeners will be notified when one or more z-indices have changed.
 * @class
 */
Echo.Sync.FloatingPaneManager = Core.extend({

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

Echo.Sync.LayoutDirection = {

    render: function(layoutDirection, element) {
        if (layoutDirection) {
            element.dir = layoutDirection.isLeftToRight() ? "ltr" : "rtl";
        }
    }
};

/**
 * Renders a table with two or three cells, suitable for laying out buttons, labels, 
 * and similar components.
 */
Echo.Sync.TriCellTable = Core.extend({

    $static: {
        
        INVERTED: 1,
        VERTICAL: 2,
        
        LEADING_TRAILING: 0,
        TRAILING_LEADING: 1, // INVERTED
        TOP_BOTTOM: 2,       // VERTICAL
        BOTTOM_TOP: 3,       // VERTICAL | INVERTED

        //FIXME. verify this method will work with  RTL settings (not tested)
        getOrientation: function(component, propertyName) {
            var position = component.render(propertyName);
            var orientation;
            if (position) {
                switch (Echo.Sync.Alignment.getRenderedHorizontal(position, component)) {
                case "leading":  orientation = this.LEADING_TRAILING; break;
                case "trailing": orientation = this.TRAILING_LEADING; break;
                case "left":     orientation = this.LEADING_TRAILING; break;
                case "right":    orientation = this.TRAILING_LEADING; break;
                default:
                    switch (Echo.Sync.Alignment.getVertical(position, component)) {
                    case "top":    orientation = this.TOP_BOTTOM;       break;
                    case "bottom": orientation = this.BOTTOM_TOP;       break;
                    default:       orientation = this.TRAILING_LEADING; break;
                    }
                }
            } else {
                orientation = this.TRAILING_LEADING;
            }
            return orientation;
        },
        
        _createTablePrototype: function() {
            var tableElement = document.createElement("table");
            tableElement.style.borderCollapse = "collapse";
            tableElement.style.padding = "0";
            
            var tbodyElement = document.createElement("tbody");
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
        this.tableElement = Echo.Sync.TriCellTable._tablePrototype.cloneNode(true);
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
        if (vertical) {
            divElement.style.cssText = "width:1px;height:" + size + "px;font-size:1px;line-height:0;";
        } else {
            divElement.style.cssText = "width:" + size + "px;height:1px;font-size:1px;line-height:0;";
        }
        parentElement.appendChild(divElement);
    },
    
    configure2: function(orientation0_1, margin0_1) {
        this.tdElements = [document.createElement("td"), document.createElement("td")];
        this.tdElements[0].style.padding = "0";
        this.tdElements[1].style.padding = "0";
        this.marginTdElements = new Array(1);
        
        if (margin0_1) {
            this.marginTdElements[0] = document.createElement("td");
            this.marginTdElements[0].style.padding = "0";
            if ((orientation0_1 & Echo.Sync.TriCellTable.VERTICAL) === 0) {
                this.marginTdElements[0].style.width = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, false);
            } else {
                this.marginTdElements[0].style.height = margin0_1 + "px";
                this.addSpacer(this.marginTdElements[0], margin0_1, true);
            }
        }
        
        if (orientation0_1 & Echo.Sync.TriCellTable.VERTICAL) {
            // Vertically oriented.
            if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
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
            if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
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
            this.tdElements[i].style.padding = "0";
        }
        this.marginTdElements = new Array(2);
        
        if (margin0_1 || margin01_2 != null) {
            if (margin0_1 && margin0_1 > 0) {
                this.marginTdElements[0] = document.createElement("td");
                if (orientation0_1 & Echo.Sync.TriCellTable.VERTICAL) {
                    this.marginTdElements[0].style.height = margin0_1 + "px";
                    this.addSpacer(this.marginTdElements[0], margin0_1, true);
                } else {
                    this.marginTdElements[0].style.width = margin0_1 + "px";
                    this.addSpacer(this.marginTdElements[0], margin0_1, false);
                }
            }
            if (margin01_2 != null && margin01_2 > 0) {
                this.marginTdElements[1] = document.createElement("td");
                if (orientation0_1 & Echo.Sync.TriCellTable.VERTICAL) {
                    this.marginTdElements[1].style.height = margin01_2 + "px";
                    this.addSpacer(this.marginTdElements[1], margin01_2, true);
                } else {
                    this.marginTdElements[1].style.width = margin01_2 + "px";
                    this.addSpacer(this.marginTdElements[1], margin01_2, false);
                }
            }
        }
        
        if (orientation0_1 & Echo.Sync.TriCellTable.VERTICAL) {
            // Vertically oriented 0/1.
            if (orientation01_2 & Echo.Sync.TriCellTable.VERTICAL) {
                // Vertically oriented 01/2
                
                if (orientation01_2 & Echo.Sync.TriCellTable.INVERTED) {
                    // 2 before 01: render #2 and margin at beginning of TABLE.
                    this.addRow(this.tdElements[2]);
                    this.addRow(this.marginTdElements[1]);
                }
                
                // Render 01
                if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
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
    
                if (!(orientation01_2 & Echo.Sync.TriCellTable.INVERTED)) {
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
                if (orientation01_2 & Echo.Sync.TriCellTable.INVERTED) {
                    this.addColumn(trElement, this.tdElements[2]);
                    this.addColumn(trElement, this.marginTdElements[1]);
                    if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
                        this.addColumn(trElement, this.tdElements[1]);
                    } else {
                        this.addColumn(trElement, this.tdElements[0]);
                    }
                } else {
                    if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
                        this.addColumn(trElement, this.tdElements[1]);
                    } else {
                        this.addColumn(trElement, this.tdElements[0]);
                    }
                    this.addColumn(trElement, this.marginTdElements[1]);
                    this.addColumn(trElement, this.tdElements[2]);
                }
                this.tbodyElement.appendChild(trElement);
                
                this.addRow(this.marginTdElements[0]);
                if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
                    this.addRow(this.tdElements[0]);
                } else {
                    this.addRow(this.tdElements[1]);
                }
            }
        } else {
            // horizontally oriented 0/1
            if (orientation01_2 & Echo.Sync.TriCellTable.VERTICAL) {
                // vertically oriented 01/2
    
                // determine and apply column span based on presence of margin between 0 and 1
                var columns = margin0_1 ? 3 : 2;
                this.tdElements[2].setAttribute("colspan", columns);
                if (this.marginTdElements[1] != null) {
                    this.marginTdElements[1].setAttribute("colspan", columns);
                }
                
                if (orientation01_2 & Echo.Sync.TriCellTable.INVERTED) {
                    // 2 before 01: render #2 and margin at beginning of TR.
                    this.addRow(this.tdElements[2]);
                    this.addRow(this.marginTdElements[1]);
                }
                
                // Render 01
                trElement = document.createElement("tr");
                if ((orientation0_1 & Echo.Sync.TriCellTable.INVERTED) === 0) {
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
                
                if (!(orientation01_2 & Echo.Sync.TriCellTable.INVERTED)) {
                    // 01 before 2: render margin and #2 at end of TR.
                    this.addRow(this.marginTdElements[1]);
                    this.addRow(this.tdElements[2]);
                }
            } else {
                // horizontally oriented 01/2
                trElement = document.createElement("tr");
                if (orientation01_2 & Echo.Sync.TriCellTable.INVERTED) {
                    // 2 before 01: render #2 and margin at beginning of TR.
                    this.addColumn(trElement, this.tdElements[2]);
                    this.addColumn(trElement, this.marginTdElements[1]);
                }
                
                // Render 01
                if (orientation0_1 & Echo.Sync.TriCellTable.INVERTED) {
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
                
                if (!(orientation01_2 & Echo.Sync.TriCellTable.INVERTED)) {
                    this.addColumn(trElement, this.marginTdElements[1]);
                    this.addColumn(trElement, this.tdElements[2]);
                }
                
                this.tbodyElement.appendChild(trElement);        
            }
        }
    }
});
