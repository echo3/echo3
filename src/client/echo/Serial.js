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
     * @param className the class name
     * @param translator the property translator 
     */
    addPropertyTranslator: function(className, translator) {
        this._translatorMap[className] = translator;
    },
    
    /**
     * Adds a property translator for a specific constructor.
     *
     * @param type the constructor
     * @param translator the property translator 
     */
    addPropertyTranslatorByType: function(type, translator) {
        this._translatorTypeData.push(type, translator);
    },
    
    /**
     * Retrieves a property translator for a specific class name.
     *
     * @param className the class name
     * @return the property translator
     */
    getPropertyTranslator: function(className) {
        return this._translatorMap[className];
    },
    
    /**
     * Retrieves a property translator for a specific constructor.
     *
     * @param type the constructor
     * @return the property translator
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
     * @param client the containing client
     * @param cElement the 'c' DOM element to deserialize
     * @return the instantiated component.
     */
    loadComponent: function(client, cElement, referenceMap) {
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
                case "c": // Child Component
                    var childComponent = this.loadComponent(client, element, referenceMap);
                    component.add(childComponent);
                    break;
                case "p": // Property
                    this.loadProperty(client, element, component, styleData, referenceMap);
                    break;
                case "s": // Style name update.
                    component.setStyleName(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "e": // Event
                    this._loadComponentEvent(client, element, component);
                    break;
                case "en": // Enabled state update.
                    component.setEnabled(element.firstChild.nodeValue == "true");
                    break;
                case "locale": // Locale update.
                    component.setLocale(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "dir": // Layout direction update.
                    component.setLayoutDirection(element.firstChild
                            ? (element.firstChild.nodeValue == "rtl" ? Echo.LayoutDirection.RTL : Echo.LayoutDirection.LTR)
                            : null);
                }
            }
            element = element.nextSibling;
        }
        
        return component;
    },
    
    _loadComponentEvent: function(client, eventElement, component) {
        var eventType = eventElement.getAttribute("t");
        client.addComponentListener(component, eventType);
    },
    
    /**
     * Deserializes an XML representation of a property into an instance,
     * and assigns it to the specified object.
     * 
     * @param client the containing client
     * @param {Element} pElement the property element to parse
     * @param object the object on which the properties should be set (this object
     *        must contain set() and setIndex() methods
     * @param styleData (optional) an associative array on which properties can
     *        be directly set
     * @param referenceMap (optional) an associative array containing previously
     *        loaded reference-based properties
     */
    loadProperty: function(client, pElement, object, styleData, referenceMap) {
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
            if (referenceMap) {
                var propertyReference = pElement.getAttribute("r");
                if (propertyReference) {
                    value = referenceMap[propertyReference];
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
                // Property has property name: invoke set(Indexed)Property.
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
     */
    loadStyleSheet: function(client, ssElement, referenceMap) {
        var styleSheet = new Echo.StyleSheet();
        
        var ssChild = ssElement.firstChild;
        while (ssChild) {
            if (ssChild.nodeType == 1) {
                if (ssChild.nodeName == "s") {
                    var style = {};
                    var sChild = ssChild.firstChild;
                    while (sChild) {
                        if (sChild.nodeType == 1) {
                            switch (sChild.nodeName) {
                            case "p":
                                this.loadProperty(client, sChild, null, style, referenceMap);
                                break;
                            }
                        }
                        sChild = sChild.nextSibling;
                    }
                    styleSheet.setStyle(ssChild.getAttribute("n"), ssChild.getAttribute("t"), style);
                }
            }
            ssChild = ssChild.nextSibling;
        }
        return styleSheet;
    },
    
    /**
     * Serializes a property value into an XML representation.
     */
    storeProperty: function(client, pElement, value) {
        if (value == null) {
            //FIXME.  Send nulled values.
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
 * Null Property Translator Singleton.
 * @class
 */
Echo.Serial.Null = {

    toProperty: function(client, pElement) {
        return null;
    }
};

Echo.Serial.addPropertyTranslator("0", Echo.Serial.Null);

/**
 * Boolean Property Translator Singleton.
 * @class
 */
Echo.Serial.Boolean = {

    toProperty: function(client, pElement) {
        return pElement.firstChild.data == "true";
    }
};

Echo.Serial.addPropertyTranslator("b", Echo.Serial.Boolean);

/**
 * Float Property Translator Singleton.
 * @class
 */
Echo.Serial.Float = {

    toProperty: function(client, pElement) {
        return parseFloat(pElement.firstChild.data);
    }
};

Echo.Serial.addPropertyTranslator("f", Echo.Serial.Float);

/**
 * Integer Property Translator Singleton.
 * @class
 */
Echo.Serial.Integer = { 

    toProperty: function(client, pElement) {
        return parseInt(pElement.firstChild.data);
    }
};

Echo.Serial.addPropertyTranslator("i", Echo.Serial.Integer);

/**
 * String Property Translator Singleton.
 * @class
 */
Echo.Serial.String = {

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
};

Echo.Serial.addPropertyTranslator("s", Echo.Serial.String);

/**
 * Date Property Translator Singleton.
 * @class
 */
Echo.Serial.Date = {

    _expr: /(\d{4})\.(\d{2}).(\d{2})/,

    toProperty: function(client, pElement) {
        var value = Echo.Serial.String.toProperty(client, pElement);
        var result = this._expr.exec(value);
        if (!result) {
            return null;
        }
        return new Date(result[1], parseInt(result[2]) - 1, result[3]);
    },
    
    toXml: function(client, pElement, value) {
        pElement.appendChild(pElement.ownerDocument.createTextNode(
                value.getFullYear() + "." + (value.getMonth() + 1) + "." + value.getDate()));
    }
};

Echo.Serial.addPropertyTranslator("d", Echo.Serial.Date);
Echo.Serial.addPropertyTranslatorByType(Date, Echo.Serial.Date);

/**
 * Map (Associative Array) Property Translator Singleton.
 * @class
 */
Echo.Serial.Map = {

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
};

Echo.Serial.addPropertyTranslator("m", Echo.Serial.Map);

/**
 * Alignment Property Translator Singleton.
 * @class
 */
Echo.Serial.Alignment = {

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
};

Echo.Serial.addPropertyTranslator("Alignment", Echo.Serial.Alignment);
Echo.Serial.addPropertyTranslator("AL", Echo.Serial.Alignment);

/**
 * Border Property Translator Singleton.
 * @class
 */
Echo.Serial.Border = {

    toProperty: function(client, pElement) {
	    if (pElement.firstChild.nodeType == 3) { // Text content
	        return pElement.firstChild.data;
	    } else if (pElement.getAttribute("v")) {
            return pElement.getAttribute("v");
        } else {
            var element = Core.Web.DOM.getChildElementByTagName(pElement, "b");
            var border = {};
            
            value = element.getAttribute("t");
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
};

Echo.Serial.addPropertyTranslator("Border", Echo.Serial.Border);
Echo.Serial.addPropertyTranslator("BO", Echo.Serial.Border);

//FIXME delete
/**
 * Extent Property Translator Singleton.
 * @class
 */
Echo.Serial.Extent = {

    toProperty: function(client, pElement) {
        return  pElement.firstChild.data;
    },
    
    toXml: function(client, pElement, value) {
        pElement.appendChild(pElement.ownerDocument.createTextNode(value.toString()));
    }
};

Echo.Serial.addPropertyTranslator("Extent", Echo.Serial.Extent);
Echo.Serial.addPropertyTranslator("X", Echo.Serial.Extent);

/**
 * FillImage Property Translator Singleton.
 * @class
 */
Echo.Serial.FillImage = {

    toProperty: function(client, pElement) {
        var element = Core.Web.DOM.getChildElementByTagName(pElement, "fi");
        return this._parseElement(client, element);
    },
    
    _parseElement: function(client, fiElement) {
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
    }
};

Echo.Serial.addPropertyTranslator("FillImage", Echo.Serial.FillImage);
Echo.Serial.addPropertyTranslator("FI", Echo.Serial.FillImage);

/**
 * FillImageBorder Property Translator Singleton.
 * @class
 */
Echo.Serial.FillImageBorder = {

    _NAMES: [ "topLeft", "top", "topRight", "left", "right", "bottomLeft", "bottom", "bottomRight" ],

    toProperty: function(client, pElement) {
        var element = Core.Web.DOM.getChildElementByTagName(pElement, "fib");
        return Echo.Serial.FillImageBorder._parseElement(client, element);
    },
    
    _parseElement: function(client, fibElement) {
        var fillImageBorder = { 
            contentInsets: fibElement.getAttribute("ci") == "" ? null : fibElement.getAttribute("ci"),
            borderInsets: fibElement.getAttribute("bi") == "" ? null : fibElement.getAttribute("bi"),
            color: fibElement.getAttribute("bc")
        };
        
        var element = fibElement.firstChild;
        var i = 0;
        while(element) {
            if (element.nodeType == 1) {
                if (element.nodeName == "fi") {
                    fillImageBorder[this._NAMES[i]] = Echo.Serial.FillImage._parseElement(client, element);
                    ++i;
                } else if (element.nodeName == "null-fi") {
                    ++i;
                }
            }
            element = element.nextSibling;
        }
        if (!(i == 0 || i == 8)) {
            throw new Error("Invalid FillImageBorder image count: " + i);
        }
    
        return fillImageBorder;
    }
};

Echo.Serial.addPropertyTranslator("FillImageBorder", Echo.Serial.FillImageBorder);
Echo.Serial.addPropertyTranslator("FIB", Echo.Serial.FillImageBorder);

/**
 * Font Property Translator Singleton.
 * @class
 */
Echo.Serial.Font = {

    toProperty: function(client, pElement) {
        var element = Core.Web.DOM.getChildElementByTagName(pElement, "f");
        var tfElements = Core.Web.DOM.getChildElementsByTagName(element, "tf");
        
        var font = { };
        
        if (tfElements.length > 1) {
            font.typeface = new Array(tfElements.length);
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
};

Echo.Serial.addPropertyTranslator("Font", Echo.Serial.Font);
Echo.Serial.addPropertyTranslator("F", Echo.Serial.Font);

/**
 * ImageReference Property Translator Singleton.
 * @class
 */
Echo.Serial.ImageReference = {

    toProperty: function(client, pElement) {
	    if (pElement.firstChild.nodeType == 1) {
	    	var iElement = pElement.firstChild;
	        var url = iElement.firstChild.data;
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
	    	var url = pElement.firstChild.data;
	    	return client.decompressUrl ? client.decompressUrl(url) : url;
	    }
    }
};

Echo.Serial.addPropertyTranslator("ImageReference", Echo.Serial.ImageReference);
Echo.Serial.addPropertyTranslator("I", Echo.Serial.ImageReference);

/**
 * Insets Property Translator Singleton.
 * @class
 */
Echo.Serial.Insets = {

    toProperty: function(client, pElement) {
        return pElement.firstChild.data;
    }
};

Echo.Serial.addPropertyTranslator("Insets", Echo.Serial.Insets);
Echo.Serial.addPropertyTranslator("N", Echo.Serial.Insets);

/**
 * LayoutData Property Translator Singleton.
 * @class
 */
Echo.Serial.LayoutData = {

    toProperty: function(client, pElement) {
        var layoutData = {};
        var element = pElement.firstChild;
        while (element) {
            if (element.nodeType == 1) {
                switch (element.nodeName) {
                case "p":
                    Echo.Serial.loadProperty(client, element, null, layoutData);
                    break;
                }
            }
            element = element.nextSibling;
        }
        return layoutData;
    }
};

Echo.Serial.addPropertyTranslator("LayoutData", Echo.Serial.LayoutData);
Echo.Serial.addPropertyTranslator("L", Echo.Serial.LayoutData);
