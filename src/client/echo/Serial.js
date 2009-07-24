/**
 * Tools for serializing components, stylesheets, and property instances to and from XML.
 * @namespace
 */
Echo.Serial = { 

    /**
     * Map between property class names and property translators.
     * Property translators stored in this map will be used when an object
     * provides a "className" property.
     */
    _translatorMap: { },
    
    /**
     * Array describing mapping between object constructors and property translators.
     * Even indices of the map contain constructors, and the subsequent odd indices
     * contain the property translator suitable for the constructor at the previous
     * index.  This array is iterated to determine the appropriate property translator.
     * This array is only used for a very small number of non-primitive 
     * property types which are provided by JavaScript itself, e.g., Date.
     */
    _translatorTypeData: [ ],
    
    /**
     * Adds a property translator for a specific class name.
     *
     * @param {String} className the class name
     * @param {Echo.Serial.PropertyTranslator} translator the property translator singleton (static class)
     */
    addPropertyTranslator: function(className, translator) {
        this._translatorMap[className] = translator;
    },
    
    /**
     * Adds a property translator for a specific constructor.
     *
     * @param {Function} type the constructor
     * @param {Echo.Serial.PropertyTranslator} translator the property translator singleton (static class) 
     */
    addPropertyTranslatorByType: function(type, translator) {
        this._translatorTypeData.push(type, translator);
    },
    
    /**
     * Retrieves a property translator for a specific class name.
     *
     * @param {String} className the class name
     * @return {Echo.Serial.PropertyTranslator} the property translator
     */
    getPropertyTranslator: function(className) {
        return this._translatorMap[className];
    },
    
    /**
     * Retrieves a property translator for a specific constructor.
     *
     * @param {Function} type the constructor
     * @return {Echo.Serial.PropertyTranslator} the property translator
     */
    getPropertyTranslatorByType: function(type) {
        for (var i = 0; i < this._translatorTypeData.length; i += 2) {
            if (this._translatorTypeData[i] == type) {
                return this._translatorTypeData[i + 1];
            } 
        }
        return null;
    },
    
    /**
     * Deserializes an XML representation of a component into a component instance.
     * Any child components will be added to the created component instance.
     * Events properties will be registered with the client by invoking the
     * "addComponentListener()" method on the provided 'client', passing in
     * the properties 'component' (the component instance) and 'event' (the event
     * type as a string).
     * 
     * @param {Echo.Client} client the containing client
     * @param {Element} cElement the 'c' DOM element to deserialize
     * @param propertyMap (optional) a mapping between property identifiers and property values for referenced properties 
     *        (properties which were rendered elsewhere in the document and are potentially referenced by multiple components)
     * @param styleMap (optional) a mapping between style identifiers and style values for referenced styles (styles which were 
     *        rendered elsewhere in the document and are potentially referenced by multiple components)
     * @return the instantiated component
     */
    loadComponent: function(client, cElement, propertyMap, styleMap) {
        if (!cElement.nodeName == "c") {
            throw new Error("Element is not a component.");
        }
        var type = cElement.getAttribute("t");
        var id = cElement.getAttribute("i");
    
        var component = Echo.ComponentFactory.newInstance(type, id);
        var styleData = component.getLocalStyleData();
        
        var element = cElement.firstChild;
        while (element) {
            if (element.nodeType == 1) {
                switch (element.nodeName) {
                case "c": // Child component
                    var childComponent = this.loadComponent(client, element, propertyMap, styleMap);
                    component.add(childComponent);
                    break;
                case "p": // Property
                    this.loadProperty(client, element, component, styleData, propertyMap);
                    break;
                case "s": // Style name
                    component.setStyleName(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "sr": // Style reference
                    component.setStyle(styleMap ? styleMap[element.firstChild.nodeValue] : null);
                    break;
                case "e": // Event
                    this._loadComponentEvent(client, element, component);
                    break;
                case "en": // Enabled state
                    component.setEnabled(element.firstChild.nodeValue == "true");
                    break;
                case "locale": // Locale
                    component.setLocale(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "dir": // Layout direction
                    component.setLayoutDirection(element.firstChild ?
                            (element.firstChild.nodeValue == "rtl" ? Echo.LayoutDirection.RTL : Echo.LayoutDirection.LTR) : null);
                    break;
                case "f": // Focus
                    if (element.getAttribute("n")) {
                        component.focusNextId = element.getAttribute("n");
                    }
                    if (element.getAttribute("p")) {
                        component.focusPreviousId = element.getAttribute("p");
                    }
                }
            }
            element = element.nextSibling;
        }
        
        return component;
    },
    
    /**
     * Processes an event registration directive element.
     * 
     * @param {Echo.Client} client the client
     * @param {Element} eventElement the event element
     * @param {Echo.Component} the component
     */
    _loadComponentEvent: function(client, eventElement, component) {
        if (client.addComponentListener) {
            var eventType = eventElement.getAttribute("t");
            client.addComponentListener(component, eventType);
        }
    },
    
    /**
     * Deserializes an XML representation of a property into an instance,
     * and assigns it to the specified object.
     * 
     * @param {Echo.Client} client the containing client
     * @param {Element} pElement the property element to parse
     * @param object the object on which the properties should be set (this object
     *        must contain set() and setIndex() methods
     * @param styleData (optional) an associative array on which properties can
     *        be directly set
     * @param propertyMap (optional) a mapping between property identifiers and property values for referenced properties 
     *        (properties which were rendered elsewhere in the document and are potentially referenced by multiple components)
     * @param styleMap (optional) a mapping between style identifiers and style values for referenced styles (styles which were 
     *        rendered elsewhere in the document and are potentially referenced by multiple components)
     */
    loadProperty: function(client, pElement, object, styleData, propertyMap) {
        var name = pElement.getAttribute("n");
        var type = pElement.getAttribute("t");
        var index = pElement.getAttribute("x");
        var value;
        
        if (type) {
            // Invoke custom property processor.
            var translator = Echo.Serial._translatorMap[type];
            if (!translator) {
                throw new Error("Translator not available for property type: " + type);
            }
            value = translator.toProperty(client, pElement);
        } else {
            if (propertyMap) {
                var propertyReference = pElement.getAttribute("r");
                if (propertyReference) {
                    value = propertyMap[propertyReference];
                } else {
                    value = Echo.Serial.String.toProperty(client, pElement);
                }
            } else {
                value = Echo.Serial.String.toProperty(client, pElement);
            }
        }
        
        if (name) {
            if (styleData) {
                if (index == null) {
                    styleData[name] = value;
                } else {
                    var indexValues = styleData[name];
                    if (!indexValues) {
                        indexValues = [];
                        styleData[name] = indexValues;
                    }
                    indexValues[index] = value;
                }
            } else {
                // Property has property name: invoke set(Index).
                if (index == null) {
                    object.set(name, value);
                } else {
                    object.setIndex(name, index, value);
                }
            }
        } else {
            // Property has method name: invoke method.
            var propertyMethod = pElement.getAttribute("m");
            if (index == null) {
                object[propertyMethod](value);
            } else {
                object[propertyMethod](index, value);
            }
        }
    },
    
    /**
     * Deserializes an XML representation of a style sheet into a
     * StyleSheet instance.
     * 
     * @param {Echo.Client} client the client instance
     * @param {Element} ssElement the "ss" element representing the root of the style sheet
     * @param propertyMap the (optional) property map containing referenced property information
     */
    loadStyleSheet: function(client, ssElement, propertyMap) {
        var styleSheet = new Echo.StyleSheet();
        
        var ssChild = ssElement.firstChild;
        while (ssChild) {
            if (ssChild.nodeType == 1) {
                if (ssChild.nodeName == "s") {
                    var style = {};
                    var sChild = ssChild.firstChild;
                    while (sChild) {
                        if (sChild.nodeType == 1) {
                            if (sChild.nodeName == "p") {
                                this.loadProperty(client, sChild, null, style, propertyMap);
                            }
                        }
                        sChild = sChild.nextSibling;
                    }
                    styleSheet.setStyle(ssChild.getAttribute("n") || "", ssChild.getAttribute("t"), style);
                }
            }
            ssChild = ssChild.nextSibling;
        }
        return styleSheet;
    },
    
    /**
     * Serializes a property value into an XML representation.
     * 
     * @param {Echo.Client} client the client instance
     * @param {Element} pElement the "p" element representing the property
     * @param value the value to render to the "p" element
     */
    storeProperty: function(client, pElement, value) {
        if (value == null) {
            // Set no value to indicate null.
        } else if (typeof (value) == "object") {
            var translator = null;
            if (value.className) {
                translator = this._translatorMap[value.className];
            } else {
                translator = this.getPropertyTranslatorByType(value.constructor);
            }
            
            if (!translator || !translator.toXml) {
                // If appropriate translator does not exist, or translator does not support to-XML translation,
                // simply ignore the property.
                return;
            }
            translator.toXml(client, pElement, value);
        } else {
            // call toString here, IE will otherwise convert boolean values to integers
            pElement.appendChild(pElement.ownerDocument.createTextNode(value.toString()));
        }
    }
};

/**
 * Abstract base class for property translators.
 */
Echo.Serial.PropertyTranslator = Core.extend({

    $abstract: true,
    
    $static: {
    
        /**
         * Converts an XML property value to a property instance.
         * 
         *  @param {Echo.Client} client the client
         *  @param {Element} the "p" DOM element describing the property value
         *  @return the generated property instance
         */
        toProperty: function(client, pElement) {
            return null;
        },
    
        /**
         * Optional: converts a property instance to an XML property element.
         * 
         * @param {Echo.Client} client the client
         * @param {Element} pElement the "p" DOM element in which the property value should be stored
         * @param value the property instance
         */
        toXml: null
    }
});

/**
 * Null Property Translator Singleton.
 */
Echo.Serial.Null = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            return null;
        }
    },

    $load: function() {
        Echo.Serial.addPropertyTranslator("0", this);
    }
});

/**
 * Boolean Property Translator Singleton.
 */
Echo.Serial.Boolean = Core.extend(Echo.Serial.PropertyTranslator, {
        
    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            return pElement.firstChild.data == "true";
        }
    },

    $load: function() {
        Echo.Serial.addPropertyTranslator("b", this);
    }
});

/**
 * Integer Property Translator Singleton.
 */
Echo.Serial.Integer = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            return parseInt(pElement.firstChild.data, 10);
        }
    },

    $load: function() {
        Echo.Serial.addPropertyTranslator("i", this);
    }
});

/**
 * Number Property Translator Singleton.
 */
Echo.Serial.Number = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            return parseFloat(pElement.firstChild.data);
        }
    },

    $load: function() {
        Echo.Serial.addPropertyTranslator("n", this);
    }
});

/**
 * String Property Translator Singleton.
 */
Echo.Serial.String = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var textNode = pElement.firstChild;
            if (!textNode) {
                return "";
            }
            var text = textNode.data;
            while (textNode.nextSibling) {
                textNode = textNode.nextSibling;
                text += textNode.data;
            }
            return text;
        }
    },

    $load: function() {
        Echo.Serial.addPropertyTranslator("s", this);
    }
});

/**
 * Date Property Translator Singleton.
 */
Echo.Serial.Date = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        _expr: /(\d{4})\.(\d{2}).(\d{2})/,

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var value = Echo.Serial.String.toProperty(client, pElement);
            var result = this._expr.exec(value);
            if (!result) {
                return null;
            }
            return new Date(result[1], parseInt(result[2], 10) - 1, result[3]);
        },
        
        /** @see Echo.Serial.PropertyTranslator#toXml */
        toXml: function(client, pElement, value) {
            pElement.appendChild(pElement.ownerDocument.createTextNode(
                    value.getFullYear() + "." + (value.getMonth() + 1) + "." + value.getDate()));
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("d", this);
        Echo.Serial.addPropertyTranslatorByType(Date, this);
    }
});

/**
 * Map (Associative Array) Property Translator Singleton.
 */
Echo.Serial.Map = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var mapObject = {};
            var element = pElement.firstChild;
            while (element) {
                if (element.nodeType != 1) {
                    continue;
                }
        
                Echo.Serial.loadProperty(client, element, null, mapObject, null);
                element = element.nextSibling;
            }
            return mapObject;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("m", this);
    }
});

/**
 * Alignment Property Translator Singleton.
 */
Echo.Serial.Alignment = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        _HORIZONTAL_MAP: {
            "leading": "leading",
            "trailing": "trailing",
            "left": "left",
            "center": "center",
            "right": "right"
        },
        
        _VERTICAL_MAP: {
            "top": "top",
            "center": "middle",
            "bottom": "bottom"
        },
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var element = Core.Web.DOM.getChildElementByTagName(pElement, "a");
            var h = this._HORIZONTAL_MAP[element.getAttribute("h")];
            var v = this._VERTICAL_MAP[element.getAttribute("v")];
            
            if (h) {
                if (v) {
                    return { horizontal: h, vertical: v };
                }
                return h;
            }
            if (v) {
                return v;
            }
            return null;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Alignment", this);
        Echo.Serial.addPropertyTranslator("AL", this);
    }
});

/**
 * Border Property Translator Singleton.
 */
Echo.Serial.Border = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
    	    if (pElement.firstChild.nodeType == 3) { // Text content
    	        return pElement.firstChild.data;
    	    } else if (pElement.getAttribute("v")) {
                return pElement.getAttribute("v");
            } else {
                var element = Core.Web.DOM.getChildElementByTagName(pElement, "b");
                var border = {};
                
                var value = element.getAttribute("t");
                if (value) {
                    border.top = value;
                    value = element.getAttribute("r");
                    if (value) {
                        border.right = value;
                        value = element.getAttribute("b");
                        if (value) {
                            border.bottom = value;
                            value = element.getAttribute("l");
                            if (value) {
                                border.left = value;
                            }
                        }
                    }
                } else {
                    throw new Error("Invalid multi-sided border: no sides set.");
                }
                return border;
            }
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Border", this);
        Echo.Serial.addPropertyTranslator("BO", this);
    }
});

/**
 * FillImage Property Translator Singleton.
 */
Echo.Serial.FillImage = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {

        /**
         * Parses a &lt;fi&gt; fill image element.
         * 
         * @param {Echo.Client} client the client
         * @param {Element} fiElement the fill image element
         * @return the parsed fill image
         * @type #FillImage
         */
        parseElement: function(client, fiElement) {
            var url = fiElement.getAttribute("u");
            if (client.decompressUrl) {
                url = client.decompressUrl(url);
            }
            var repeat = fiElement.getAttribute("r");
            var x = fiElement.getAttribute("x");
            var y = fiElement.getAttribute("y");
            
            if (repeat || x || y) {
                return { url: url, repeat: repeat, x: x, y: y };
            } else {
                return url;
            }
        },

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var element = Core.Web.DOM.getChildElementByTagName(pElement, "fi");
            return this.parseElement(client, element);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("FillImage", this);
        Echo.Serial.addPropertyTranslator("FI", this);
    }
});

/**
 * FillImageBorder Property Translator Singleton.
 */
Echo.Serial.FillImageBorder = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** 
         * (Array) mapping between border indices and property names.
         * @type Array 
         */
        _NAMES: [ "topLeft", "top", "topRight", "left", "right", "bottomLeft", "bottom", "bottomRight" ],
        
        /**
         * Parses a &lt;fbi&gt; fill image border element.
         * 
         * @param {Echo.Client} client the client
         * @param {Element} fibElement the fill image border element
         * @return the parsed fill image border
         * @type #FillImageBorder
         */
        _parseElement: function(client, fibElement) {
            var fillImageBorder = { 
                contentInsets: fibElement.getAttribute("ci") ? fibElement.getAttribute("ci") : null,
                borderInsets: fibElement.getAttribute("bi") ? fibElement.getAttribute("bi") : null,
                color: fibElement.getAttribute("bc")
            };
            
            var element = fibElement.firstChild;
            var i = 0;
            while(element) {
                if (element.nodeType == 1) {
                    if (element.nodeName == "fi") {
                        fillImageBorder[this._NAMES[i]] = Echo.Serial.FillImage.parseElement(client, element);
                        ++i;
                    } else if (element.nodeName == "null-fi") {
                        ++i;
                    }
                }
                element = element.nextSibling;
            }
            if (!(i === 0 || i == 8)) {
                throw new Error("Invalid FillImageBorder image count: " + i);
            }
        
            return fillImageBorder;
        },
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var element = Core.Web.DOM.getChildElementByTagName(pElement, "fib");
            return Echo.Serial.FillImageBorder._parseElement(client, element);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("FillImageBorder", this);
        Echo.Serial.addPropertyTranslator("FIB", this);
    }
});

/**
 * Font Property Translator Singleton.
 */
Echo.Serial.Font = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var element = Core.Web.DOM.getChildElementByTagName(pElement, "f");
            var tfElements = Core.Web.DOM.getChildElementsByTagName(element, "tf");
            
            var font = { };
            
            if (tfElements.length > 1) {
                font.typeface = [];
                for (var i = 0; i < tfElements.length; ++i) {
                    font.typeface[i] = tfElements[i].firstChild.data;
                }
            } else if (tfElements.length == 1) {
                font.typeface = tfElements[0].firstChild.data;
            }
            
            var size = element.getAttribute("sz");
            if (size) {
                font.size = size;
            }
            
            if (element.getAttribute("bo")) { font.bold        = true; }
            if (element.getAttribute("it")) { font.italic      = true; }
            if (element.getAttribute("un")) { font.underline   = true; }
            if (element.getAttribute("ov")) { font.overline    = true; }
            if (element.getAttribute("lt")) { font.lineThrough = true; }
            
            return font;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Font", this);
        Echo.Serial.addPropertyTranslator("F", this);
    }
});

/**
 * ImageReference Property Translator Singleton.
 */
Echo.Serial.ImageReference = Core.extend(Echo.Serial.PropertyTranslator, {

    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var url;
    	    if (pElement.firstChild.nodeType == 1) {
    	    	var iElement = pElement.firstChild;
    	        url = iElement.firstChild.data;
    	        if (client.decompressUrl) {
    	            url = client.decompressUrl(url);
    	        }
    	        var width = iElement.getAttribute("w");
    	        width = width ? width : null;
    	        var height = iElement.getAttribute("h");
    	        height = height ? height : null;
    	        
    	        if (width || height) {
    	            return { url: url, width: width, height: height };
    	        } else {
    	            return url;
    	        }
    	    } else {
    	     url = pElement.firstChild.data;
    	    	return client.decompressUrl ? client.decompressUrl(url) : url;
    	    }
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("ImageReference", this);
        Echo.Serial.addPropertyTranslator("I", this);
    }
});

/**
 * LayoutData Property Translator Singleton.
 */
Echo.Serial.LayoutData = Core.extend(Echo.Serial.PropertyTranslator, {
        
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var layoutData = {};
            var element = pElement.firstChild;
            while (element) {
                if (element.nodeType == 1) {
                    if (element.nodeName == "p") {
                        Echo.Serial.loadProperty(client, element, null, layoutData);
                    }
                }
                element = element.nextSibling;
            }
            return layoutData;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("LayoutData", this);
        Echo.Serial.addPropertyTranslator("L", this);
    }
});
