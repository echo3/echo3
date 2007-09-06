/**
 * Tools for serializing components, stylesheets, and property instances to and from XML.
 */
EchoSerial = function() { };

EchoSerial._propertyTranslatorMap = new Object();

EchoSerial.addPropertyTranslator = function(type, propertyTranslator) {
    EchoSerial._propertyTranslatorMap[type] = propertyTranslator;
};

EchoSerial.getPropertyTranslator = function(type) {
    return EchoSerial._propertyTranslatorMap[type];
};

/**
 * Deserializes an XML representation of a component into a component instance.
 * Any child components will be added to the created component instance.
 * Events properties will be registered with the client by invoking the
 * "addComponentListener()" method on the provided 'client', passing in
 * the properties 'component' (the component instance) and 'event' (the event
 * type as a string).
 * 
 * @param client the containing client
 * @param componentElement the 'c' DOM element to deserialize
 * @return the instantiated component.
 */
EchoSerial.loadComponent = function(client, componentElement, referenceMap) {
    if (!componentElement.nodeName == "c") {
        throw new Error("Element is not a component.");
    }
    var type = componentElement.getAttribute("t");
    var id = componentElement.getAttribute("i");

    var component = EchoApp.ComponentFactory.newInstance(type, id);

    if (componentElement.getAttribute("en") == "false") {
        component.setEnabled(false);
    }
    
    var styleName = componentElement.getAttribute("s");
    if (styleName) {
        component.setStyleName(styleName);
        var styleType = componentElement.getAttribute("st");
        if (styleType) {
            component.setStyleType(styleType);
        }
    }
    
    var styleData = component.getLocalStyleData();
    
    var element = componentElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            switch (element.nodeName) {
            case "c": // Child Component
                var childComponent = EchoSerial.loadComponent(client, element, referenceMap);
                component.add(childComponent);
                break;
            case "p": // Property
                EchoSerial.loadProperty(client, element, component, styleData, referenceMap);
                break;
            case "e": // Event
                EchoSerial._loadComponentEvent(client, element, component);
                break;
            }
        }
        element = element.nextSibling;
    }
    
    return component;
};

EchoSerial._loadComponentEvent = function(client, eventElement, component) {
    var eventType = eventElement.getAttribute("t");
    client.addComponentListener(component, eventType);
};

/**
 * Deserializes an XML representation of a property into an instance,
 * and assigns it to the specified object.
 * 
 * @param client the containing client
 * @param {Element} propertyElement the property element to parse
 * @param object the object on which the properties should be set (this object
 *        must contain setProperty() and setIndexedProperty() methods
 * @param styleData (optional) an associative array on which properties can
 *        be directly set
 * @param referenceMap (optional) an associative array containing previously
 *        loaded reference-based properties
 */
EchoSerial.loadProperty = function(client, propertyElement, object, styleData, referenceMap) {
    var propertyName = propertyElement.getAttribute("n");
    var propertyType = propertyElement.getAttribute("t");
    var propertyIndex = propertyElement.getAttribute("x");
    var propertyValue;
    
    if (propertyType) {
        // Invoke custom property processor.
        var translator = EchoSerial._propertyTranslatorMap[propertyType];
        if (!translator) {
            throw new Error("Translator not available for property type: " + propertyType);
        }
        propertyValue = translator.toProperty(client, propertyElement);
    } else if (referenceMap) {
        var propertyReference = propertyElement.getAttribute("r");
        if (!propertyReference) {
            throw new Error("No property type specified for property: " + propertyName + referenceMap);
        }
        propertyValue = referenceMap[propertyReference];
    } else {
        throw new Error("No property type specified for property: " + propertyName + referenceMap);
    }
    
    if (propertyName) {
        if (styleData) {
            if (propertyIndex == null) {
                styleData[propertyName] = propertyValue;
            } else {
                var indexValues = styleData[propertyName];
                if (!indexValues) {
                    indexValues = new Array();
                    styleData[propertyName] = indexValues;
                }
                indexValues[propertyIndex] = propertyValue;
            }
        } else {
            // Property has property name: invoke set(Indexed)Property.
            if (propertyIndex == null) {
                object.setProperty(propertyName, propertyValue);
            } else {
                object.setIndexedProperty(propertyName, propertyIndex, propertyValue);
            }
        }
    } else {
        // Property has method name: invoke method.
        var propertyMethod = propertyElement.getAttribute("m");
        if (propertyIndex == null) {
            object[propertyMethod](propertyValue);
        } else {
            object[propertyMethod](propertyIndex, propertyValue);
        }
    }
};

/**
 * Deserializes an XML representation of a style sheet into a
 * StyleSheet instance.
 */
EchoSerial.loadStyleSheet = function(client, ssElement, referenceMap) {
    var styleSheet = new EchoApp.StyleSheet();
    
    var ssChild = ssElement.firstChild;
    while (ssChild) {
        if (ssChild.nodeType == 1) {
            if (ssChild.nodeName == "s") {
                var styleData = new Object();
                var style = new EchoApp.Style(styleData);
                var sChild = ssChild.firstChild;
                while (sChild) {
                    if (sChild.nodeType == 1) {
                        switch (sChild.nodeName) {
                        case "p":
                            EchoSerial.loadProperty(client, sChild, style, styleData, referenceMap);
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
};

/**
 * Serializes a property value into an XML representation.
 */
EchoSerial.storeProperty = function(client, propertyElement, propertyValue) {
    EchoCore.Debug.consoleWrite("Storing property:" + propertyValue);
    if (typeof (propertyValue) == "object") {
        if (!propertyValue.className) {
            throw new Error("propertyValue does not provide className property, cannot determine translator.");
        }
        var translator = EchoSerial._propertyTranslatorMap[propertyValue.className];
        if (!translator || !translator.toXml) {
            throw new Error("No to-XML translator available for class name: " + propertyValue.className);
            //FIXME. silently ignore and return may be desired behavior.
        }
        translator.toXml(client, propertyElement, propertyValue);
    } else {
        propertyElement.setAttribute("v", propertyValue);
    }
};

/**
 * Namespace for property translator implementations.
 */
EchoSerial.PropertyTranslator = function() { };

/**
 * Null PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Null = function() { };

EchoSerial.PropertyTranslator.Null.toProperty = function(client, propertyElement) {
    return null;
};

EchoSerial.addPropertyTranslator("0", EchoSerial.PropertyTranslator.Null);

/**
 * Boolean PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Boolean = function() { };

EchoSerial.PropertyTranslator.Boolean.toProperty = function(client, propertyElement) {
    return propertyElement.getAttribute("v") == "true";
};

EchoSerial.addPropertyTranslator("b", EchoSerial.PropertyTranslator.Boolean);

/**
 * Float PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Float = function() { };

EchoSerial.PropertyTranslator.Float.toProperty = function(client, propertyElement) {
    return parseFloat(propertyElement.getAttribute("v"));
};

EchoSerial.addPropertyTranslator("f", EchoSerial.PropertyTranslator.Float);

/**
 * Integer PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Integer = function() { };

EchoSerial.PropertyTranslator.Integer.toProperty = function(client, propertyElement) {
    return parseInt(propertyElement.getAttribute("v"));
};

EchoSerial.addPropertyTranslator("i", EchoSerial.PropertyTranslator.Integer);

/**
 * String PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.String = function() { };

EchoSerial.PropertyTranslator.String.toProperty = function(client, propertyElement) {
    return propertyElement.getAttribute("v");
};

EchoSerial.addPropertyTranslator("s", EchoSerial.PropertyTranslator.String);


/**
 * Map (Associative Array) PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Map = function() { };

EchoSerial.PropertyTranslator.Map.toProperty = function(client, propertyElement) {
    var mapObject = new Object();
    var element = propertyElement.firstChild;
    while (element) {
        if (element.nodeType != 1) {
            continue;
        }

        EchoSerial.loadProperty(client, element, null, mapObject, null);
        element = element.nextSibling;
    }
    return mapObject;
};

EchoSerial.addPropertyTranslator("map", EchoSerial.PropertyTranslator.Map);

/**
 * Alignment PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Alignment = function() { };

EchoSerial.PropertyTranslator.Alignment.toProperty = function(client, propertyElement) {
    var element = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "a");
    var h, v;
    switch (element.getAttribute("h")) {
    case "leading":  h = EchoApp.Property.Alignment.LEADING;  break;
    case "trailing": h = EchoApp.Property.Alignment.TRAILING; break;
    case "left":     h = EchoApp.Property.Alignment.LEFT;     break;
    case "center":   h = EchoApp.Property.Alignment.CENTER;   break;
    case "right":    h = EchoApp.Property.Alignment.RIGHT;    break;
    default:         h = EchoApp.Property.Alignment.DEFAULT;
    }
    switch (element.getAttribute("v")) {
    case "top":      v = EchoApp.Property.Alignment.TOP;      break;
    case "center":   v = EchoApp.Property.Alignment.CENTER;   break;
    case "bottom":   v = EchoApp.Property.Alignment.BOTTOM;   break;
    default:         v = EchoApp.Property.Alignment.DEFAULT;  
    }
    return new EchoApp.Property.Alignment(h, v);
};

EchoSerial.addPropertyTranslator("Alignment", EchoSerial.PropertyTranslator.Alignment);

/**
 * Border PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Border = function() { };

EchoSerial.PropertyTranslator.Border.toProperty = function(client, propertyElement) {
    var value = propertyElement.getAttribute("v");
    if (value) {
        return new EchoApp.Property.Border(value);
    } else {
        var element = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "b");
        var sides = new Array();
        
        value = element.getAttribute("t");
        if (value) {
            sides.push(new EchoApp.Property.Border.Side(value));
            value = element.getAttribute("r");
            if (value) {
                sides.push(new EchoApp.Property.Border.Side(value));
                value = element.getAttribute("b");
                if (value) {
                    sides.push(new EchoApp.Property.Border.Side(value));
                    value = element.getAttribute("l");
                    if (value) {
                        sides.push(new EchoApp.Property.Border.Side(value));
                    }
                }
            }
        } else {
            throw new Error("Invalid multi-sided border: no sides set.");
        }
        return new EchoApp.Property.Border(sides);
    }
};

EchoSerial.addPropertyTranslator("Border", EchoSerial.PropertyTranslator.Border);

/**
 * Color PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Color = function() { };

EchoSerial.PropertyTranslator.Color.toProperty = function(client, propertyElement) {
    return new EchoApp.Property.Color(propertyElement.getAttribute("v"));
};

EchoSerial.PropertyTranslator.Color.toXml = function(client, propertyElement, propertyValue) {
    propertyElement.setAttribute("v", propertyValue.value);
};

EchoSerial.addPropertyTranslator("Color", EchoSerial.PropertyTranslator.Color);

/**
 * Extent PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Extent = function() { };

EchoSerial.PropertyTranslator.Extent.toProperty = function(client, propertyElement) {
    return new EchoApp.Property.Extent(propertyElement.getAttribute("v"));
};

EchoSerial.PropertyTranslator.Extent.toXml = function(client, propertyElement, propertyValue) {
    propertyElement.setAttribute("v", propertyValue.toString());
};

EchoSerial.addPropertyTranslator("Extent", EchoSerial.PropertyTranslator.Extent);

/**
 * FillImage PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.FillImage = function() { };

EchoSerial.PropertyTranslator.FillImage.toProperty = function(client, propertyElement) {
    var element = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "fi");
    return EchoSerial.PropertyTranslator.FillImage._parseElement(client, element);
};

EchoSerial.PropertyTranslator.FillImage._parseElement = function(client, fiElement) {
    var url = fiElement.getAttribute("u");
    if (client.decompressUrl) {
        url = client.decompressUrl(url);
    }
    var repeat = fiElement.getAttribute("r");
    switch (repeat) {
    case "0": repeat = EchoApp.Property.FillImage.NO_REPEAT; break;
    case "xy": repeat = EchoApp.Property.FillImage.REPEAT; break;
    case "x": repeat = EchoApp.Property.FillImage.REPEAT_HORIZONTAL; break;
    case "y": repeat = EchoApp.Property.FillImage.REPEAT_VERTICAL; break;
    }
    var x = fiElement.getAttribute("x");
    var y = fiElement.getAttribute("y");
    return new EchoApp.Property.FillImage(url, repeat, x, y);
};

EchoSerial.addPropertyTranslator("FillImage", EchoSerial.PropertyTranslator.FillImage);

/**
 * FillImageBorder PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.FillImageBorder = function() { };

EchoSerial.PropertyTranslator.FillImageBorder.toProperty = function(client, propertyElement) {
    var element = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "fib");
    return EchoSerial.PropertyTranslator.FillImageBorder._parseElement(client, element);
};

EchoSerial.PropertyTranslator.FillImageBorder._parseElement = function(client, fibElement) {
    var contentInsets = fibElement.getAttribute("ci");
    contentInsets = contentInsets ? new EchoApp.Property.Insets(contentInsets) : null;
    var borderInsets = fibElement.getAttribute("bi");
    borderInsets = borderInsets ? new EchoApp.Property.Insets(borderInsets) : null;
    var borderColor = fibElement.getAttribute("bc");
    borderColor = borderColor ? new EchoApp.Property.Color(borderColor) : null;
    var fillImages = new Array();
    
    var element = fibElement.firstChild;
    while(element) {
        if (element.nodeType == 1) {
            if (element.nodeName == "fi") {
                fillImages.push(EchoSerial.PropertyTranslator.FillImage._parseElement(client, element));
            } else if (element.nodeName == "null-fi") {
                fillImages.push(null);
            }
        }
        element = element.nextSibling;
    }
    if (fillImages.length != 8) {
	    throw new Error("Invalid FillImageBorder image count: " + fillImages.length);
    }
    
    return new EchoApp.Property.FillImageBorder(borderColor, borderInsets, contentInsets, fillImages);
};

EchoSerial.addPropertyTranslator("FillImageBorder", EchoSerial.PropertyTranslator.FillImageBorder);

/**
 * Font PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Font = function() { };

EchoSerial.PropertyTranslator.Font.toProperty = function(client, propertyElement) {
    var element = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "f");
    var tfElements = EchoWebCore.DOM.getChildElementsByTagName(element, "tf");
    var typefaces = null;
    if (tfElements.length > 0) {
        typefaces = new Array(tfElements.length);
        for (var i = 0; i < tfElements.length; ++i) {
            typefaces[i] = tfElements[i].getAttribute("n");
        }
    }
    
    var size = element.getAttribute("sz") ? new EchoApp.Property.Extent(element.getAttribute("sz")) : null;

    var style = 0;
    if (element.getAttribute("bo")) { style |= EchoApp.Property.Font.BOLD         };
    if (element.getAttribute("it")) { style |= EchoApp.Property.Font.ITALIC       };
    if (element.getAttribute("un")) { style |= EchoApp.Property.Font.UNDERLINE    };
    if (element.getAttribute("ov")) { style |= EchoApp.Property.Font.OVERLINE     };
    if (element.getAttribute("lt")) { style |= EchoApp.Property.Font.LINE_THROUGH };
    
    return new EchoApp.Property.Font(typefaces, style, size);
};

EchoSerial.addPropertyTranslator("Font", EchoSerial.PropertyTranslator.Font);

/**
 * ImageReference PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.ImageReference = function() { };

EchoSerial.PropertyTranslator.ImageReference.toProperty = function(client, propertyElement) {
    var url = propertyElement.getAttribute("v");
    if (client.decompressUrl) {
        url = client.decompressUrl(url);
    }
    var width = propertyElement.getAttribute("w");
    width = width ? new EchoApp.Property.Extent(width) : null;
    var height = propertyElement.getAttribute("h");
    height = height ? new EchoApp.Property.Extent(height) : null;
    
    return new EchoApp.Property.ImageReference(url, width, height);
};

EchoSerial.addPropertyTranslator("ImageReference", EchoSerial.PropertyTranslator.ImageReference);

/**
 * Insets PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.Insets = function() { };

EchoSerial.PropertyTranslator.Insets.toProperty = function(client, propertyElement) {
    return new EchoApp.Property.Insets(propertyElement.getAttribute("v"));
};

EchoSerial.addPropertyTranslator("Insets", EchoSerial.PropertyTranslator.Insets);

/**
 * LayoutData PropertyTranslator Singleton.
 */
EchoSerial.PropertyTranslator.LayoutData = function() { };

EchoSerial.PropertyTranslator.LayoutData.toProperty = function(client, propertyElement) {
    var styleData = new Object();
    var layoutData = new EchoApp.LayoutData(styleData);
    var element = propertyElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            switch (element.nodeName) {
            case "p":
                EchoSerial.loadProperty(client, element, layoutData, styleData);
                break;
            }
        }
        element = element.nextSibling;
    }
    return layoutData;
};

EchoSerial.addPropertyTranslator("LayoutData", EchoSerial.PropertyTranslator.LayoutData);
