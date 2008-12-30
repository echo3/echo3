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

    /**
     * Retrieves an "effect-specific" property from a component (e.g., a rollover background) if it
     * is available, or otherwise returns the default (non-effect) property value.
     * 
     * @param {Echo.Component} component the component to query
     * @param {String} defaultPropertyName the name of the default (non-effect) property, e.g., "background"
     * @param {String} effectPropertyName the name of the effect property, e.g., "rolloverBackground"
     * @param {Boolean} effectState flag indicating whether the effect is enabled (if the effect is not enabled,
     *        the default (non-effect) value will always be returned)
     * @param defaultDefaultPropertyValue (optional) the default (non-effect) property value (this value will be returned
     *        if no other value can be determined for the property)
     * @param defaultEffectPropertyValue (optional) the default effect property value (this value will be returned if the
     *        effectState is true and no value has been specifically set for the effect property) 
     */
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

    /**
     * Returns the render-able horizontal component of an alignment property.  This method
     * translates leading/trailing horizontal values to left/right based on the specified layout
     * direction provider.  If a provider is no given, leading defaults to left and trailing to
     * right.
     * 
     * @param {#Alignment} alignment the alignment
     * @return the rendered horizontal component, i.e., "left", "center", "right", or null
     * @type String
     */
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
    
    /**
     * Returns the horizontal component of an alignment property.
     * 
     * @param {#Alignment} the alignment
     * @return the horizontal component, i.e., "left", "center", "right", "leading", "trailing", or null
     * @type String
     */
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

    /**
     * Returns the vertical component of an alignment property.
     * 
     * @param {#Alignment} the alignment
     * @return the vertical component, i.e., "top", "middle", "bottom", or null 
     * @type String
     */
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

    /**
     * Renders an alignment property to an element.
     * 
     * @param {#Alignment} alignment the alignment
     * @param {Element} the target element
     * @param {Boolean} renderToElement flag indicating whether the alignment state should be rendered to the element using
     *        attributes (true) or CSS (false)
     * @param layoutDirectionProvider an (optional) object providing a getRenderLayoutDirection() method to determine if the
     *        element has a layout direction of left-to-right or right-to-left
     */
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
                this.render(Echo.Sync.Extent.toPixels(elements[1]) + "px " + elements[2] + " " + elements[3], 
                        element, styleAttribute);
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
            if (border instanceof Object) {
                element.style.border = "";
            }
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
    
    /**
     * Blends two colors together.
     * 
     * @param {#Color} value1 the first color
     * @param {#Color} value2 the second color
     * @param {Number} ratio the blend ratio, where 0 represents the first color, 1 the second color, and 0.5 an equal blend
     *        between the first and second colors
     * @return the blended color
     * @type #Color
     */
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

    /**
     * Renders a color to an element.
     * 
     * @param {#Color} color the color
     * @param {#Element} element the target element
     * @param {String} styleProperty the name of the style property, e.g., "color", "backgroundColor" 
     */
    render: function(color, element, styleProperty) {
        if (color) {
            element.style[styleProperty] = color;
        }
    },
    
    /**
     * Renders a color to an element, clearing any existing value.
     * 
     * @param {#Color} color the color
     * @param {#Element} element the target element
     * @param {String} styleProperty the name of the style property, e.g., "color", "backgroundColor" 
     */
    renderClear: function(color, element, styleProperty) {
        element.style[styleProperty] = color ? color : "";
    },
    
    /**
     * Renders the "foreground" and "background" color properties of a component to an element's "color" and
     * "backgroundColor" properties.
     * 
     * @param {Echo.Component} component the component
     * @param {Element} the target element 
     */
    renderFB: function(component, element) { 
        var color;
        if ((color = component.render("foreground"))) {
            element.style.color = color;
        }
        if ((color = component.render("background"))) {
            element.style.backgroundColor = color;
        }
    },
    
    /**
     * Converts red/green/blue integer values to a 6 digit hexadecimal string, preceded by a sharp, e.g. #1a2b3c.
     * 
     * @param {Number} red the red value, 0-255
     * @param {Number} green the green value, 0-255
     * @param {Number} blue the blue value, 0-255
     * @return the hex string
     * @type String
     */
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

    /**
     * Regular expression to determine if an extent value is already formatted to pixel units.
     */
    _FORMATTED_INT_PIXEL_TEST: /^(-?\d+px *)$/,
    
    /**
     * Regular expression to determine if an extent value is already formatted to pixel units.
     */
    _FORMATTED_DECIMAL_PIXEL_TEST: /^(-?\d+(.\d+)?px *)$/,
    
    /**
     * Determines if an extent has percent units.
     * 
     * @param {#Extent} extent the Extent
     * @return true if the extent has percent units
     * @type Boolean
     */
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
    
    /**
     * Renders an extent value to an element.
     *
     * @param {#Extent} extent the Extent
     * @param {Element} element the target element
     * @param {String} styleAttribute the style attribute name, e.g., "padding-left", or "width"
     * @param {Boolean} horizontal flag indicating whether the value is being rendered horizontally
     * @param {Boolean} allowPercent flag indicating whether percent values should be rendered
     */
    render: function(extent, element, styleAttribute, horizontal, allowPercent) {
        var cssValue = Echo.Sync.Extent.toCssValue(extent, horizontal, allowPercent);
        if (cssValue !== "") {
            element.style[styleAttribute] = cssValue;
        }
    },

    /**
     * Returns a CSS representation of an extent value.
     * 
     * @param {#Extent} extent the Extent
     * @param {Boolean} horizontal flag indicating whether the value is being rendered horizontally
     * @param {Boolean} allowPercent flag indicating whether percent values should be rendered
     * @return the rendered CSS value or the empty string ("") if no value could be determined (null will never be returned)
     * @type String
     */
    toCssValue: function(extent, horizontal, allowPercent) {
        switch(typeof(extent)) {
            case "number":
                return Math.round(extent) + "px";
            case "string":
                if (this._FORMATTED_INT_PIXEL_TEST.test(extent)) {
                    return extent;
                } else if (this._FORMATTED_DECIMAL_PIXEL_TEST.test(extent)) {
                    return Math.round(parseFloat(extent)) + "px";
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

    /**
     * Converts an extent value to pixels.
     * 
     * @param {#Extent} extent the Extent
     * @param {Boolean} horizontal flag indicating whether the value is being rendered horizontally
     * @type Number
     */
    toPixels: function(extent, horizontal) {
        if (extent == null) {
            return 0;
        } else if (typeof(extent) == "number") {
            return Math.round(extent);
        } else {
            return Math.round(Core.Web.Measure.extentToPixels(extent, horizontal));
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

    /**
     * Flag indicating that the Internet Explorer 6-specific PNG alpha filter should be used to render PNG alpha (transparency).
     */
    FLAG_ENABLE_IE_PNG_ALPHA_FILTER: 0x1,
    
    /**
     * Determines the background-position CSS attribute of a FillImage.
     * 
     * @param {#FillImage} fillImage the FillImage
     * @return the appropriate CSS background-position attribute, or null if it is not specified
     * @type String
     */
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
    
    /**
     * Determines the background-repeat CSS attribute of a FillImage.
     * 
     * @param {#FillImage} fillImage the FillImage
     * @return the appropriate CSS background-repeat attribute, or null if it is not specified/invalid
     * @type String
     */
    getRepeat: function(fillImage) {
        if (this._REPEAT_VALUES[fillImage.repeat]) {
            return this._REPEAT_VALUES[fillImage.repeat]; 
        } else {
            return null;
        }
    },
    
    /**
     * Returns the URL of a FillImage.
     * 
     * @param {#FillImage} fillImage the FillImage
     * @return the URL
     * @type String
     */
    getUrl: function(fillImage) {
        if (fillImage == null) {
            return null;
        }
        return typeof(fillImage) == "object" ? fillImage.url : fillImage;
    },
    
    /**
     * Renders a FillImage to an element.
     * 
     * @param {#FillImage} fillImage the FillImage (may be null)
     * @param {Element} element the target element
     * @param flags (optional) the rendering flags, one or more of the following values:
     *        <ul>
     *         <li><code>FLAG_ENABLE_IE_PNG_ALPHA_FILTER</code></li>
     *        <ul>
     */
    render: function(fillImage, element, flags) {
        if (fillImage == null) {
            // No image specified, do nothing.
            return;
        }
        
        var isObject = typeof(fillImage) == "object";
        var url = isObject ? fillImage.url : fillImage;

        if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED && flags && (flags & this.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
            // IE6 PNG workaround required.
            element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url + "', sizingMethod='scale')";
        } else {
            // IE6 PNG workaround not required.
            element.style.backgroundImage = "url(" + url + ")";
        }
        
        if (isObject) {
            var position = Echo.Sync.FillImage.getPosition(fillImage);
            element.style.backgroundPosition = position ? position : "";
            element.style.backgroundRepeat = this._REPEAT_VALUES[fillImage.repeat] ? this._REPEAT_VALUES[fillImage.repeat]: ""; 
        }
    },
    
    /**
     * Renders a FillImage to an element, clearing any existing value.
     * 
     * @param {#FillImage} fillImage the FillImage (may be null)
     * @param {Element} element the target element
     * @param flags (optional) the rendering flags, one or more of the following values:
     *        <ul>
     *         <li><code>FLAG_ENABLE_IE_PNG_ALPHA_FILTER</code></li>
     *        <ul>
     */
    renderClear: function(fillImage, element, flags) {
        if (fillImage) {
            this.render(fillImage, element, flags);
        } else {
            if (Core.Web.Env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED) {
                element.style.filter = "";
            }
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

    /**
     * Renders a Font property to an element.
     * 
     * @param {#Font} font the font
     * @param {Element} element the target element
     */
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
    
    /**
     * Renders a Font property to an element, clearing any previously set font first.
     * 
     * @param {#Font} font the font
     * @param {Element} element the target element
     */
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

    /**
     * Returns the URL of an image reference object.
     * 
     * @param {#ImageReference} imageReference the image reference (may be null)
     * @return the URL
     * @type String
     */
    getUrl: function(imageReference) {
        return imageReference ? (typeof(imageReference) == "string" ? imageReference : imageReference.url) : null;
    },

    /**
     * Renders an image reference object to an IMG element.
     * 
     * @param {#ImageReference} imageReference the image reference
     * @param {Element} imgElement the IMG element.
     */
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

    /**
     * Renders an insets property to an element.
     * 
     * @param {#Insets} insets the insets property
     * @param {Element} the target element
     * @param {String} the style attribute name, e.g., "padding" or "margin" 
     */
    render: function(insets, element, styleAttribute) {
        switch(typeof(insets)) {
            case "number":
                element.style[styleAttribute] = Math.round(insets) + "px";
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
    
    /**
     * Generates a CSS value for an insets property.
     * 
     * @param {#Insets} insets the insets property
     * @return the CSS value
     * @type String
     */
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
    
    /**
     * Returns an object representing the pixel dimensions of a insets property.
     * 
     * @param {#Insets} insets the insets property
     * @return an object containing top, bottom, left, and right values representing the pixel sizes of the insets property
     */
    toPixels: function(insets) {
        if (insets == null) {
            return this._ZERO;
        } else if (typeof(insets) == "number") {
            insets = Math.round(insets);
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

/**
 * Provides tools for rendering layout direction properties. 
 */
Echo.Sync.LayoutDirection = {

    /**
     * Renders a layout direction property to an element.
     * 
     * @param {Echo.LayoutDirection} layoutDirection the layoutDirection property (may be null)
     * @param {Element} element the target element
     */
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
