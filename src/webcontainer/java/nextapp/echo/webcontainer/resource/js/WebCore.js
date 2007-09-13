/**
 * "WebCore" namespace.  DO NOT INSTANTIATE.
 * REQUIRES: "Core"
 *
 * Provides low-level web-client-related APIs:
 * - Provides cross-platform API for accessing web client features that have
 *   inconsistent implementations on various browser platforms.
 * - Provides HTTP Connection object.
 * - Provides HTML DOM manipulation capabilites.
 * - Provides DOM event mangement facility, enabling capturing/bubbling phases
 *   on all browsers, including Internet Explorer 6.
 * - Provides "virtual positioning" capability for Internet Explorer 6 to
 *   render proper top/left/right/bottom CSS positioning.
 * - Provides facilities to convert dimensions (e.g., in/cm/pc) to pixels.
 * - Provides capabilities to measure rendered size of DOM fragments.
 * - Provides capabilities to asynchronously load and install JavaScript modules.
 */
EchoWebCore = function() { };

EchoWebCore.init = function() { 
    if (EchoWebCore.initialized) {
        // Already initialized.
        return;
    }

    EchoWebCore.Environment._init();
    EchoWebCore.Render.calculateExtentSizes();
    if (EchoWebCore.Environment.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY) {
        // Enable virtual positioning.
        EchoWebCore.VirtualPosition._init();
    }

    if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
        EchoWebCore.DOM.addEventListener(document, "selectstart", EchoWebCore._selectStartListener, false);
        // Set documentElement.style.overflow to hidden in order to hide root scrollbar in IE.
        // This is a non-standard CSS property.
        document.documentElement.style.overflow = "hidden";
    }
    
    EchoWebCore.initialized = true;
};

EchoWebCore.dragInProgress = false;

/**
 * Internet Explorer-specific event listener to deny selection.
 */
EchoWebCore._selectStartListener = function(e) {
    e = e ? e : window.event;
    if (EchoWebCore.dragInProgress) {
        EchoWebCore.DOM.preventEventDefault(e);
    }
};

/**
 * NAMESPACE: DOM manipulation utility methods.
 * Do not instantiate.
 */
EchoWebCore.DOM = function() { };

/**
 * Adds an event listener to an object, using the client's supported event 
 * model.
 *
 * @param eventSource the event source
 * @param eventType the type of event (the 'on' prefix should NOT be included
 *        in the event type, i.e., for mouse rollover events, "mouseover" would
 *        be specified instead of "onmouseover")
 * @param eventListener the event listener to be invoked when the event occurs
 * @param useCapture a flag indicating whether the event listener should capture
 *        events in the final phase of propagation (only supported by 
 *        DOM Level 2 event model, not available on Internet Explorer)
 */
EchoWebCore.DOM.addEventListener = function(eventSource, eventType, eventListener, useCapture) {
    if (eventSource.addEventListener) {
        eventSource.addEventListener(eventType, eventListener, useCapture);
    } else if (eventSource.attachEvent) {
        eventSource.attachEvent("on" + eventType, eventListener);
    }
};

/**
 * Adds a rule to the document stylesheet.
 * This method does not function in Safari/KHTML.
 * 
 * @param selectorText the selector
 * @param style the style information
 */
EchoWebCore.DOM.addRule = function(selectorText, style) {
    //FIXME. add code to init() to ensure document.styleSheets[0] exists.
    // Probably remove the printed version from initial HTML service as well.
    var ss = document.styleSheets[0];
    if (ss.insertRule) {
        // W3C DOM Browsers.
        ss.insertRule(selectorText + " {" + style + "}", ss.cssRules.length);
    } else if (ss.addRule) {
        // IE6.
        ss.addRule(selectorText, style);
    }
};

/**
 * Creates a new XML DOM.
 *
 * @param namespaceUri the unique URI of the namespace of the root element in 
 *        the created document (not supported for
 *        Internet Explorer 6 clients, null may be specified for all clients)
 * @param qualifiedName the name of the root element of the new document (this
 *        element will be created automatically)
 * @return the created DOM
 */
EchoWebCore.DOM.createDocument = function(namespaceUri, qualifiedName) {
    if (document.implementation && document.implementation.createDocument) {
        // DOM Level 2 Browsers
        var dom = document.implementation.createDocument(namespaceUri, qualifiedName, null);
        if (!dom.documentElement) {
            dom.appendChild(dom.createElement(qualifiedName));
        }
        return dom;
    } else if (window.ActiveXObject) {
        // Internet Explorer
        var createdDocument = new ActiveXObject("Microsoft.XMLDOM");
        var documentElement = createdDocument.createElement(qualifiedName);
        createdDocument.appendChild(documentElement);
        return createdDocument;
    } else {
        throw new Error("XML DOM creation not supported by browser environment.");
    }
};

EchoWebCore.DOM.getChildElementByTagName = function(parentElement, tagName) {
    var element = parentElement.firstChild;
    while (element) {
        if (element.nodeType == 1 && element.nodeName == tagName) {
            return element;
        }
        element = element.nextSibling;
    }
    return null;
};

EchoWebCore.DOM.getChildElementsByTagName = function(parentElement, tagName) {
    var elements = new Array();
    var element = parentElement.firstChild;
    while (element) {
        if (element.nodeType == 1 && element.nodeName == tagName) {
            elements.push(element);
        }
        element = element.nextSibling;
    }
    return elements;
};

/**
 * Returns the target of an event, using the client's supported event model.
 * On clients which support the W3C DOM Level 2 event specification,
 * the <code>target</code> property of the event is returned.
 * On clients which support only the Internet Explorer event model,
 * the <code>srcElement</code> property of the event is returned.
 *
 * @param e the event
 * @return the target
 */
EchoWebCore.DOM.getEventTarget = function(e) {
    return e.target ? e.target : e.srcElement;
};

/**
 * Returns the related target of an event, using the client's supported event model.
 * On clients which support the W3C DOM Level 2 event specification,
 * the <code>relatedTarget</code> property of the event is returned.
 * On clients which support only the Internet Explorer event model,
 * the <code>toElement</code> property of the event is returned.
 *
 * @param e the event
 * @return the target
 */
EchoWebCore.DOM.getEventRelatedTarget = function(e) {
    return e.relatedTarget ? e.relatedTarget : e.toElement;
};

/**
 * Prevents the default action of an event from occurring, using the
 * client's supported event model.
 * On clients which support the W3C DOM Level 2 event specification,
 * the preventDefault() method of the event is invoked.
 * On clients which support only the Internet Explorer event model,
 * the 'returnValue' property of the event is set to false.
 *
 * @param e the event
 */
EchoWebCore.DOM.preventEventDefault = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

/**
 * Removes all child nodes from the specified DOM node.
 *
 * @param node the parent node whose children should be deleted
 */
EchoWebCore.DOM.removeAllChildren = function(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Removes an event listener from an object, using the client's supported event 
 * model.
 *
 * @param eventSource the event source
 * @param eventType the type of event (the 'on' prefix should NOT be included
 *        in the event type, i.e., for mouse rollover events, "mouseover" would
 *        be specified instead of "onmouseover")
 * @param eventListener the event listener to be invoked when the event occurs
 * @param useCapture a flag indicating whether the event listener should capture
 *        events in the final phase of propagation (only supported by 
 *        DOM Level 2 event model, not available on Internet Explorer)
 */
EchoWebCore.DOM.removeEventListener = function(eventSource, eventType, eventListener, useCapture) {
    if (eventSource.removeEventListener) {
        eventSource.removeEventListener(eventType, eventListener, useCapture);
    } else if (eventSource.detachEvent) {
        eventSource.detachEvent("on" + eventType, eventListener);
    }
};

/**
 * Removes the specified DOM node from the DOM tree. This method employs a workaround for the
 * <code>QUIRK_PERFORMANCE_LARGE_DOM_REMOVE</code> quirk.
 *
 * @param node the node which should be deleted
 */
EchoWebCore.DOM.removeNode = function(node) {
    var parentNode = node.parentNode;
    if (!parentNode) {
        // not in DOM tree
        return;
    }
    if (EchoWebCore.Environment.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE) {
        EchoWebCore.DOM._removeNodeRecursive(node);
    } else {
        parentNode.removeChild(node);
    }
};

/**
 * Removes the specified DOM node from the DOM tree in a recursive manner, i.e. all descendants
 * of the given node are removed individually. This alleviates slow performance when removing large
 * DOM trees.
 *
 * @param node the node which should be deleted
*/
EchoWebCore.DOM._removeNodeRecursive = function(node) {
    var childNode = node.firstChild;
    while (childNode) {
        var nextChildNode = childNode.nextSibling;
        EchoWebCore.DOM._removeNodeRecursive(childNode);
        childNode = nextChildNode;
    }
    node.parentNode.removeChild(node);
};

/**
 * Removes a rule from the document stylesheet.
 * This method does not function in Safari/KHTML.
 * 
 * @param selectorText the selector
 */
EchoWebCore.DOM.removeRule = function(selectorText) {
    selectorText = selectorText.toLowerCase();
    var ss = document.styleSheets[0];
    
    // Retrieve rules object for W3C DOM : IE6.
    var rules = ss.cssRules ? ss.cssRules : ss.rules;
    
    for (var i = 0; i < rules.length; ++i) {
        if (rules[i].type == 1 && rules[i].selectorText.toLowerCase() == selectorText) {
            if (ss.deleteRule) {
                // Delete rule: W3C DOM.
                ss.deleteRule(i);
                break;
            } else if (ss.removeRule) {
                // Delete rule: IE6.
                //FIXME untested.
                ss.removeRule(i);
                break;
            }
        }
    }
};

/**
 * Stops an event from propagating ("bubbling") to parent nodes in the DOM, 
 * using the client's supported event model.
 * On clients which support the W3C DOM Level 2 event specification,
 * the stopPropagation() method of the event is invoked.
 * On clients which support only the Internet Explorer event model,
 * the 'cancelBubble' property of the event is set to true.
 *
 * @param e the event
 */
EchoWebCore.DOM.stopEventPropagation = function(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};

/**
 * Determines if <code>ancestorNode</code> is or is an ancestor of
 * <code>descendantNode</code>.
 *
 * @param ancestorNode the potential ancestor node
 * @param descendantNode the potential descendant node
 * @return true if <code>ancestorNode</code> is or is an ancestor of
 *         <code>descendantNode</code>
 */
EchoWebCore.DOM.isAncestorOf = function(ancestorNode, descendantNode) {
    var testNode = descendantNode;
    while (testNode !== null) {
        if (testNode == ancestorNode) {
            return true;
        }
        testNode = testNode.parentNode;
    }
    return false;
};

EchoWebCore.Environment = function() { };

EchoWebCore.Environment._init = function() {
    var env = EchoWebCore.Environment;
    var ua = navigator.userAgent.toLowerCase();
    env.BROWSER_OPERA = ua.indexOf("opera") != -1;
    env.BROWSER_SAFARI = ua.indexOf("safari") != -1;
    env.BROWSER_KONQUEROR = ua.indexOf("konqueror") != -1;
    env.BROWSER_FIREFOX = ua.indexOf("firefox") != -1;
    
    env.CSS_FLOAT = "cssFloat";

    // Note deceptive user agent fields:
    // - Konqueror and Safari UA fields contain "like Gecko"
    // - Opera UA field typically contains "MSIE"
    env.DECEPTIVE_USER_AGENT = env.BROWSER_OPERA || env.BROWSER_SAFARI || env.BROWSER_KONQUEROR;
    
    env.BROWSER_MOZILLA = !env.DECEPTIVE_USER_AGENT && ua.indexOf("gecko") != -1;
    env.BROWSER_INTERNET_EXPLORER = !env.DECEPTIVE_USER_AGENT && ua.indexOf("msie") != -1;
    
    // Retrieve Version Info (as necessary).
    if (env.BROWSER_INTERNET_EXPLORER) {
        if (ua.indexOf("msie 6.") != -1) {
            env.BROWSER_MAJOR_VERSION = 6;
        } else if (ua.indexOf("msie 7.") != -1) {
            env.BROWSER_MAJOR_VERSION = 7;
        }
    }
    
    //FIXME Quirk flags not refined yet, some quirk flags from Echo 2.0/1 will/may be deprecated/removed.
    
    // Set IE Quirk Flags
    if (env.BROWSER_INTERNET_EXPLORER) {
        env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING = true;
        env.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
        env.QUIRK_IE_REPAINT = true;
        env.QUIRK_TEXTAREA_CONTENT = true;
        env.QUIRK_IE_TEXTAREA_NEWLINE_OBLITERATION = true;
        env.QUIRK_IE_SELECT_LIST_DOM_UPDATE = true;
        env.QUIRK_CSS_BORDER_COLLAPSE_INSIDE = true;
        env.QUIRK_CSS_BORDER_COLLAPSE_FOR_0_PADDING = true;
        env.NOT_SUPPORTED_CSS_OPACITY = true;
        env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED = true;
        env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED = true;
        env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED = true;
        env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR = true;
        env.QUIRK_IE_SELECT_PERCENT_WIDTH = true;
        env.CSS_FLOAT = "styleFloat";
        
        if (env.BROWSER_MAJOR_VERSION < 7) {
            env.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY = true;
            env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED = true;
            env.QUIRK_CSS_BACKGROUND_ATTACHMENT_USE_FIXED = true;
            env.QUIRK_IE_SELECT_Z_INDEX = true;
            env.NOT_SUPPORTED_CSS_MAX_HEIGHT = true;
        }
    } else if (env.BROWSER_MOZILLA) {
    	if (!env.BROWSER_FIREFOX) {
    		env.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE = true;
    	}
    } else if (env.BROWSER_OPERA) {
        env.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
    }
};

EchoWebCore.EventProcessor = function() { };

/**
 * The next element identifier.
 */
EchoWebCore.EventProcessor._nextId = 0;

/**
 * Mapping between element ids and ListenerLists containing listeners to invoke during capturing phase.
 */
EchoWebCore.EventProcessor._capturingListenerMap = new EchoCore.Collections.Map();

/**
 * Mapping between element ids and ListenerLists containing listeners to invoke during bubbling phase.
 */
EchoWebCore.EventProcessor._bubblingListenerMap = new EchoCore.Collections.Map();

/**
 * Registers an event handler.
 *
 * @param element the DOM element on which to add the event handler
 * @param eventType the DOM event type
 * @param eventTarget the method or MethodRef to invoke when the event is fired
 * @param capture true to fire the event during the capturing phase, false to fire the event during
 *        the bubbling phase
 */
EchoWebCore.EventProcessor.add = function(element, eventType, eventTarget, capture) {
    if (!element.__eventProcessorId) {
        element.__eventProcessorId = ++EchoWebCore.EventProcessor._nextId;
    }

    var listenerList;
    if (element == EchoWebCore.EventProcessor._lastElement && capture == EchoWebCore.EventProcessor._lastCapture) {
        listenerList = EchoWebCore.EventProcessor._lastListenerList; 
    } else {
        // Obtain correct id->ListenerList mapping based on capture parameter.
        var listenerMap = capture ? EchoWebCore.EventProcessor._capturingListenerMap 
                                  : EchoWebCore.EventProcessor._bubblingListenerMap;
        
        // Obtain ListenerList based on element id.                              
        listenerList = listenerMap.get(element.__eventProcessorId);
        if (!listenerList) {
            // Create new ListenerList if none exists.
            listenerList = new EchoCore.ListenerList();
            listenerMap.put(element.__eventProcessorId, listenerList);
        }
        
        EchoWebCore.EventProcessor._lastElement = element;
        EchoWebCore.EventProcessor._lastCapture = capture;
        EchoWebCore.EventProcessor._lastListenerList = listenerList;
    }

    // Add event handler to the ListenerList.
    listenerList.addListener(eventType, eventTarget);

    // Register event listener on DOM element.
    // FIXME...not handling multiple listeners of same type!
    EchoWebCore.DOM.addEventListener(element, eventType, EchoWebCore.EventProcessor._processEvent, false);
};

EchoWebCore.EventProcessor.addSelectionDenialListener = function(element) {
    EchoWebCore.EventProcessor.add(element, "mousedown", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    if (EchoWebCore.Environment.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
        EchoWebCore.EventProcessor.add(element, "selectstart", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    }
};

EchoWebCore.EventProcessor.removeSelectionDenialListener = function(element) {
    EchoWebCore.EventProcessor.remove(element, "mousedown", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    if (EchoWebCore.Environment.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
        EchoWebCore.EventProcessor.remove(element, "selectstart", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    }
};

EchoWebCore.EventProcessor._selectionDenialHandler = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
};

EchoWebCore.EventProcessor._processEvent = function(e) {
    e = e ? e : window.event;
    if (!e.target && e.srcElement) {
        // The Internet Explorer event model stores the target element in the 'srcElement' property of an event.
        // Modify the event such the target is retrievable using the W3C DOM Level 2 specified property 'target'.
        e.target = e.srcElement;
    }
    
    // Establish array containing elements ancestry, with index 0 containing 
    // the element and the last index containing its most distant ancestor.  
    // Only record elements that have ids.
    var elementAncestry = new Array();
    var targetElement = e.target;
    while (targetElement) {
        if (targetElement.__eventProcessorId) { // Element Node with identifier.
            elementAncestry.push(targetElement);
        }
        targetElement = targetElement.parentNode;
    }

    var listenerList;
    
    var propagate = true;
    
    // Fire event to capturing listeners.
    for (var i = elementAncestry.length - 1; i >= 0; --i) {
        listenerList = EchoWebCore.EventProcessor._capturingListenerMap.get(elementAncestry[i].__eventProcessorId);
        if (listenerList) {
            // Set registered target on event.
            e.registeredTarget = elementAncestry[i];
            if (!listenerList.fireEvent(e)) {
                propagate = false;
            }
        }
        if (!propagate) {
            // Stop propagation if requested.
            break;
        }
    }
    
    if (propagate) {
        // Fire event to bubbling listeners.
        for (var i = 0; i < elementAncestry.length; ++i) {
            listenerList = EchoWebCore.EventProcessor._bubblingListenerMap.get(elementAncestry[i].__eventProcessorId);
            // Set registered target on event.
            e.registeredTarget = elementAncestry[i];
            if (listenerList) {
                if (!listenerList.fireEvent(e)) {
                    propagate = false;
                }
            }
            if (!propagate) {
                // Stop propagation if requested.
                break;
            }
        }
    }
        
    if (!propagate) {
        // Inform DOM to stop propagation of event.
        EchoWebCore.DOM.stopEventPropagation(e);
    }
};

/**
 * Unregisters an event handler.
 *
 * @param element the DOM element on which to add the event handler
 * @param eventType the DOM event type
 * @param eventTarget the method of MethodRef to invoke when the event is fired
 * @param capture true to fire the event during the capturing phase, false to fire the event during
 *        the bubbling phase
 */
EchoWebCore.EventProcessor.remove = function(element, eventType, eventTarget, capture) {
    EchoWebCore.EventProcessor._lastElement = null;
    
    if (!element.__eventProcessorId) {
        return;
    }

    // Unregister event listener on DOM element.
    // FIXME...not handling multiple listeners of same type!
    EchoWebCore.DOM.removeEventListener(element, eventType, EchoWebCore.EventProcessor._processEvent, false);

    // Obtain correct id->ListenerList mapping based on capture parameter.
    var listenerMap = capture ? EchoWebCore.EventProcessor._capturingListenerMap 
                              : EchoWebCore.EventProcessor._bubblingListenerMap;

    // Obtain ListenerList based on element id.                              
    var listenerList = listenerMap.get(element.__eventProcessorId);
    if (listenerList) {
        // Remove event handler from the ListenerList.
        listenerList.removeListener(eventType, eventTarget);
        
        if (listenerList.isEmpty()) {
            listenerMap.remove(element.__eventProcessorId);
        }
    }
};

EchoWebCore.EventProcessor.removeAll = function(element) {
    if (!element.__eventProcessorId) {
        return;
    }
    EchoWebCore.EventProcessor._unregisterAll(element, EchoWebCore.EventProcessor._capturingListenerMap);
    EchoWebCore.EventProcessor._unregisterAll(element, EchoWebCore.EventProcessor._bubblingListenerMap);
};

EchoWebCore.EventProcessor._unregisterAll = function(element, listenerMap) {
    var listenerList = listenerMap.get(element.__eventProcessorId);
    if (!listenerList) {
        return;
    }

	var types = listenerList.getListenerTypes();
	for (var i = 0; i < types.length; ++i) {
		EchoWebCore.DOM.removeEventListener(element, types[i], EchoWebCore.EventProcessor._processEvent, false); 
	}
	
    listenerMap.remove(element.__eventProcessorId);
};

EchoWebCore.EventProcessor.toString = function() {
    return "Capturing: " + EchoWebCore.EventProcessor._capturingListenerMap + "\n"
            + "Bubbling: " + EchoWebCore.EventProcessor._bubblingListenerMap;
};

/**
 * Creates a new <code>HttpConnection</code>.
 * This method simply configures the connection, the connection
 * will not be opened until <code>connect()</code> is invoked.
 *
 * @param url the target URL
 * @param method the connection method, i.e., GET or POST
 * @param messageObject the message to send (may be a String or XML DOM)
 * @param contentType the request content-type
 */
EchoWebCore.HttpConnection = function(url, method, messageObject, contentType) {
    this._url = url;
    this._contentType = contentType;
    this._method = method;
    this._messageObject = messageObject;
    this._disposed = false;
    this._listenerList = new EchoCore.ListenerList();
};

EchoWebCore.HttpConnection.prototype.addResponseListener = function(l) {
    this._listenerList.addListener("response", l);
};

/**
 * Executes the HTTP connection.
 */
EchoWebCore.HttpConnection.prototype.connect = function() {
    var usingActiveXObject = false;
    if (window.XMLHttpRequest) {
        this._xmlHttpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        usingActiveXObject = true;
        this._xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        throw "Connect failed: Cannot create XMLHttpRequest.";
    }

    var instance = this;
    
    // Create closure around instance.
    this._xmlHttpRequest.onreadystatechange = function() { 
        if (!instance) {
            return;
        }
        try {
            instance._processReadyStateChange();
        } finally {
            if (instance._disposed) {
                // Release instance reference to allow garbage collection.
                instance = null;
            }
        }
    };
    
    this._xmlHttpRequest.open(this._method, this._url, true);

    if (this._contentType && (usingActiveXObject || this._xmlHttpRequest.setRequestHeader)) {
        this._xmlHttpRequest.setRequestHeader("Content-Type", this._contentType);
    }
    this._xmlHttpRequest.send(this._messageObject ? this._messageObject : null);
};

EchoWebCore.HttpConnection.prototype.dispose = function() {
    this._listenerList = null;
    this._messageObject = null;
    this._xmlHttpRequest = null;
    this._disposed = true;
};

EchoWebCore.HttpConnection.prototype.getStatus = function() {
    return this._xmlHttpRequest ? this._xmlHttpRequest.status : null;
};

/**
 * Returns the response as text.
 * This method may only be invoked from a response handler.
 *
 * @return the response, as text
 */
EchoWebCore.HttpConnection.prototype.getResponseText = function() {
    return this._xmlHttpRequest ? this._xmlHttpRequest.responseText : null;
};

/**
 * Returns the response as an XML DOM.
 * This method may only be invoked from a response handler.
 *
 * @return the response, as an XML DOM
 */
EchoWebCore.HttpConnection.prototype.getResponseXml = function() {
    return this._xmlHttpRequest ? this._xmlHttpRequest.responseXML : null;
};

/**
 * Event listener for <code>readystatechange</code> events received from
 * the <code>XMLHttpRequest</code>.
 */
EchoWebCore.HttpConnection.prototype._processReadyStateChange = function() {
    if (this._disposed) {
        return;
    }
    
    if (this._xmlHttpRequest.readyState == 4) {
        var responseEvent;
        try {
            var valid = this._xmlHttpRequest.status == 0 ||  // 0 included as a valid response code for non-served applications.
                    (this._xmlHttpRequest.status >= 200 && this._xmlHttpRequest.status <= 299);
            responseEvent = new EchoWebCore.HttpConnection.ResponseEvent(this, valid);
        } catch (ex) {
            responseEvent = new EchoWebCore.HttpConnection.ResponseEvent(this, false);
            responseEvent.exception = ex;
        }
        
		this._listenerList.fireEvent(responseEvent);
		this.dispose();
    }
};

EchoWebCore.HttpConnection.prototype.removeResponseListener = function(l) {
    this._listenerList.removeListener("response", l);
};

// FIXME. Current "valid" flag for 2XX responses is probably a horrible idea.
EchoWebCore.HttpConnection.ResponseEvent = function(source, valid) {
    EchoCore.Event.call(this, "response", source);
    this.valid = valid;
};

EchoWebCore.Library = function() { };

/**
 * A representation of a group of libraries to be loaded/installed at the same time.
 * Libraries will be retrieved asynchronously, and then installed once ALL the libraries have
 * been loaded.  Installation will be done in the order in which the add() method was
 * invoked to add libraries to the group (without regard for the order in which the 
 * HTTP server returns the library code).
 *
 * Constructor: creates a new library group.
 */
EchoWebCore.Library.Group = function() {
    this._listenerList = new EchoCore.ListenerList();
    this._libraries = new Array();
    this._loadedCount = 0;
    this._totalCount = 0;
};

/**
 * Adds a library to the library group.
 * Libraries which have previously been loaded will not 
 *
 * @param libraryUrl the URL from which to retrieve the library.
 */
EchoWebCore.Library.Group.prototype.add = function(libraryUrl) {
    if (EchoWebCore.Library._Manager._loadedLibrarySet.contains(libraryUrl)) {
        // Library already loaded: ignore.
        return;
    }

    var libraryItem = new EchoWebCore.Library._Item(this, libraryUrl);
    this._libraries.push(libraryItem);
};

/**
 * Adds a listener to be notified when all libraries in the group have been loaded.
 *
 * @param l the listener to add
 */
EchoWebCore.Library.Group.prototype.addLoadListener = function(l) {
    this._listenerList.addListener("load", l);
};

EchoWebCore.Library.Group.prototype._fireLoadEvent = function() {
	var e = new EchoCore.Event("load", this);
	this._listenerList.fireEvent(e);
};

EchoWebCore.Library.Group.prototype._install = function() {
	for (var i = 0; i < this._libraries.length; ++i) {
	    try {
            this._libraries[i]._install();
        } catch (ex) {
            throw new Error("Exception installing library \"" + this._libraries[i]._url + "\"; " + ex);
        }
	}
	this._fireLoadEvent();
};

EchoWebCore.Library.Group.prototype.hasNewLibraries = function() {
    return this._libraries.length > 0;
};

EchoWebCore.Library.Group.prototype._notifyLoad = function(libraryItem) {
    ++this._loadedCount;
    if (this._loadedCount == this._totalCount) {
        this._install();
    }
};

EchoWebCore.Library.Group.prototype.load = function() {
    this._totalCount = this._libraries.length;
    for (var i = 0; i < this._libraries.length; ++i) {
        this._libraries[i]._load();
    }
};

/**
 * Removes a listener from being notified when all libraries in the group have been loaded.
 *
 * @param l the listener to remove
 */
EchoWebCore.Library.Group.prototype.removeLoadListener = function(l) {
    this._listenerList.removeListener("load", l);
};

EchoWebCore.Library._Item = function(group, url) {
    this._url = url;
    this._group = group;
};

EchoWebCore.Library._Item.prototype._responseHandler = function(e) {
    if (!e.valid) {
        throw new Error("Invalid HTTP response from library request: " + e.source.getStatus());
    }
    this._content = e.source.getResponseText();
    this._group._notifyLoad(this);
};

EchoWebCore.Library._Item.prototype._install = function() {
    EchoWebCore.Library._Manager._loadedLibrarySet.add(this._url);
    if (this._content == null) {
        throw new Error("Attempt to install library when no content has been loaded.");
    }
    
    // Execute content to install library.
    eval(this._content);
};

EchoWebCore.Library._Item.prototype._load = function() {
	var conn = new EchoWebCore.HttpConnection(this._url, "GET");
	conn.addResponseListener(new EchoCore.MethodRef(this, this._responseHandler));
	conn.connect();
};

EchoWebCore.Library._Manager = function() { };

EchoWebCore.Library._Manager._loadedLibrarySet = new EchoCore.Collections.Set();

EchoWebCore.Render = function() { };

EchoWebCore.Render._horizontalInchSize = 96;
EchoWebCore.Render._verticalInchSize = 96;
EchoWebCore.Render._horizontalExSize = 7;
EchoWebCore.Render._verticalExSize = 7;
EchoWebCore.Render._horizontalEmSize = 13.3333;
EchoWebCore.Render._verticalEmSize = 13.3333;

/**
 * Converts any non-relative extent value to pixels.
 */
EchoWebCore.Render.extentToPixels = function(value, units, horizontal) {
    if (!units || units == "px") {
        return value;
    }
    var dpi = horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize;
    switch (units) {
    case "%":
        return 0;
    case "in":
        return value * (horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize);
    case "cm":
        return value * (horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize) / 2.54;
    case "mm":
        return value * (horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize) / 25.4;
    case "pt":
        return value * (horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize) / 72;
    case "pc":
        return value * (horizontal ? EchoWebCore.Render._horizontalInchSize : EchoWebCore.Render._verticalInchSize) / 6;
    case "em":
        return value * (horizontal ? EchoWebCore.Render._horizontalEmSize : EchoWebCore.Render._verticalEmSize);
    case "ex":
        return value * (horizontal ? EchoWebCore.Render._horizontalExSize : EchoWebCore.Render._verticalExSize);
    }
};

/**
 * Updates internal measures used in converting length units 
 * (e.g., in, mm, ex, and em) to pixels.
 */
EchoWebCore.Render.calculateExtentSizes = function() {
    var containerElement = document.getElementsByTagName("body")[0];

    var inchDiv4 = document.createElement("div");
    inchDiv4.style.width = "4in";
    inchDiv4.style.height = "4in";
    containerElement.appendChild(inchDiv4);
    EchoWebCore.Render._horizontalInchSize = inchDiv4.offsetWidth / 4;
    EchoWebCore.Render._verticalInchSize = inchDiv4.offsetHeight / 4;
    containerElement.removeChild(inchDiv4);
    
    var emDiv24 = document.createElement("div");
    emDiv24.style.width = "24em";
    emDiv24.style.height = "24em";
    containerElement.appendChild(emDiv24);
    EchoWebCore.Render._horizontalEmSize = emDiv24.offsetWidth / 24;
    EchoWebCore.Render._verticalEmSize = emDiv24.offsetHeight / 24;
    containerElement.removeChild(emDiv24);
    
    var exDiv24 = document.createElement("div");
    exDiv24.style.width = "24ex";
    exDiv24.style.height = "24ex";
    containerElement.appendChild(exDiv24);
    EchoWebCore.Render._horizontalExSize = exDiv24.offsetWidth / 24;
    EchoWebCore.Render._verticalExSize = exDiv24.offsetHeight / 24;
    containerElement.removeChild(exDiv24);
};

EchoWebCore.Render.Measure = function(element) {
    var testElement = element;
    while (testElement && testElement != document) {
        testElement = testElement.parentNode;
    }
    var rendered = testElement == document;

    if (!EchoWebCore.Render._measureContainerDivElement) {
        EchoWebCore.Render._measureContainerDivElement = document.createElement("div");
        EchoWebCore.Render._measureContainerDivElement.style.position = "absolute";
        EchoWebCore.Render._measureContainerDivElement.style.top = "-1700px";
        EchoWebCore.Render._measureContainerDivElement.style.left = "-1300px";
        EchoWebCore.Render._measureContainerDivElement.style.width = "1600px";
        EchoWebCore.Render._measureContainerDivElement.style.height = "1200px";
        document.getElementsByTagName("body")[0].appendChild(EchoWebCore.Render._measureContainerDivElement);
    }
    
    var parentNode, nextSibling;
    
    if (!rendered) {
    	parentNode = element.parentNode;
    	nextSibling = element.nextSibling;
        if (parentNode) {
            parentNode.removeChild(element);
        }
        EchoWebCore.Render._measureContainerDivElement.appendChild(element);
    }
    
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    
    if (!rendered) {
        EchoWebCore.Render._measureContainerDivElement.removeChild(element);
        if (parentNode) {
            parentNode.insertBefore(element, nextSibling);
        }
    }
};

EchoWebCore.Render.Measure.prototype.toString = function() {
    return this.width + "x" + this.height;
};

EchoWebCore.Render.Measure.Bounds = function(element) {
	var cumOffset = EchoWebCore.Render.Measure.Bounds._getCumulativeOffset(element);
    var scrollOffset = EchoWebCore.Render.Measure.Bounds._getScrollOffset(element);
	var measure = new EchoWebCore.Render.Measure(element);
    
    this.top = cumOffset.top - scrollOffset.top;
    this.left = cumOffset.left - scrollOffset.left;
    this.width = measure.width;
    this.height = measure.height;
};

EchoWebCore.Render.Measure.Bounds._getScrollOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0; 
      element = element.parentNode;
    } while (element);
    return {left: valueL, top: valueT};
};

EchoWebCore.Render.Measure.Bounds._getCumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return {left: valueL, top: valueT};
};

EchoWebCore.Render.Measure.Bounds.prototype.toString = function() {
    return this.width + "x" + this.height + "@" + this.left + "," + this.top;
};

/**
 * Static object/namespace which provides cross-platform CSS positioning 
 * capabilities.  Internet Explorer 6 is ordinarily handicapped by its lack
 * of support for setting 'left' and 'right' or 'top' and 'bottom' positions
 * simultaneously on a single document element.
 * 
 * To use virtual positioning, simply set the left/right/top/bottom
 * coordinates of an element and invoke redraw().  The redraw() method
 * must be invoked whenever the size of the element should be redrawn,
 * e.g., when the screen or its containing element resizes.
 */
EchoWebCore.VirtualPosition = function() { };

EchoWebCore.VirtualPosition._OFFSETS_VERTICAL
        = new Array("paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth");
EchoWebCore.VirtualPosition._OFFSETS_HORIZONTAL 
        = new Array("paddingLeft", "paddingRight", "marginLeft", "marginRight", "borderLeftWidth", "borderRightWidth");

/** Flag indicating whether virtual positioning is required/enabled. */
EchoWebCore.VirtualPosition._enabled = false;

/**
 * Calculates horizontal or vertical padding, border, and margin offsets for a particular style.
 *
 * @param offsetNames the names of the offsets styles to calculate, either
 *        _OFFSETS_VERTICAL or _OFFSETS_HORIZONTAL.
 * @param style the style whose offsets should be calculated
 * @return the pixel size of the offsets, or -1 if they cannot be calculated
 */
EchoWebCore.VirtualPosition._calculateOffsets = function(offsetNames, style) {
    var offsets = 0;
    for (var i = 0; i < offsetNames.length; ++i) {
        var value = style[offsetNames[i]];
        if (value) {
            if (value.toString().indexOf("px") == -1) {
                return -1;
            }
            offsets += parseInt(value);
        }
    }
    return offsets;
};

/**
 * Enables and initializes the virtual positioning system.
 */
EchoWebCore.VirtualPosition._init = function() {
    EchoWebCore.VirtualPosition._enabled = true;
};

/**
 * Redraws elements registered with the virtual positioning system.
 * Adjusts the style.height and style.width attributes of an element to 
 * simulate its specified top, bottom, left, and right CSS position settings
 * The calculation makes allowances for padding, margin, and border width.
 *
 * @param element the element to redraw
 */
EchoWebCore.VirtualPosition.redraw = function(element) {
    if (!EchoWebCore.VirtualPosition._enabled) {
        return;
    }

    if (!element.parentNode) {
        return;
    }

    // Adjust 'height' property if 'top' and 'bottom' properties are set, 
    // and if all padding/margin/borders are 0 or set in pixel units.
    if (EchoWebCore.VirtualPosition._verifyPixelValue(element.style.top)
            && EchoWebCore.VirtualPosition._verifyPixelValue(element.style.bottom)) {
        // Verify that offsetHeight is valid, and do nothing if it cannot be calculated.
        // Such a do-nothing scenario is due to a not-up-to-date element cache,  where
        // the element is no longer hierarchy.
        var offsetHeight = element.parentNode.offsetHeight;
        if (!isNaN(offsetHeight)) {
            var offsets = EchoWebCore.VirtualPosition._calculateOffsets(
                    EchoWebCore.VirtualPosition._OFFSETS_VERTICAL, element.style);
            if (offsets != -1) {
                var calculatedHeight = offsetHeight - parseInt(element.style.top) - parseInt(element.style.bottom) - offsets;
                if (calculatedHeight <= 0) {
                    element.style.height = 0;
                } else {
                    if (element.style.height != calculatedHeight + "px") {
                        element.style.height = calculatedHeight + "px";
                    }
                }
            }
        }
    }
    
    // Adjust 'width' property if 'left' and 'right' properties are set, 
    // and if all padding/margin/borders are 0 or set in pixel units.
    if (EchoWebCore.VirtualPosition._verifyPixelValue(element.style.left)
            && EchoWebCore.VirtualPosition._verifyPixelValue(element.style.right)) {
        // Verify that offsetHeight is valid, and do nothing if it cannot be calculated.
        // Such a do-nothing scenario is due to a not-up-to-date element cache,  where
        // the element is no longer hierarchy.
        var offsetWidth = element.parentNode.offsetWidth;
        if (!isNaN(offsetWidth)) {
            var offsets = EchoWebCore.VirtualPosition._calculateOffsets(
                    EchoWebCore.VirtualPosition._OFFSETS_HORIZONTAL, element.style);
            if (offsets != -1) {
                var calculatedWidth = offsetWidth - parseInt(element.style.left) - parseInt(element.style.right) - offsets;
                if (calculatedWidth <= 0) {
                    element.style.width = 0;
                } else {
                    if (element.style.width != calculatedWidth + "px") {
                        element.style.width = calculatedWidth + "px";
                    }
                }
            }
        }
    }
};

/** 
 * Determines if the specified value contains a pixel dimension, e.g., "20px"
 * Returns false if the value is null/whitespace/undefined.
 *
 * @param value the value to evaluate
 * @return true if the value is a pixel dimension, false if it is not
 */
EchoWebCore.VirtualPosition._verifyPixelValue = function(value) {
    if (value == null || value == "" || value == undefined) {
        return false;
    }
    var valueString = value.toString();
    return valueString == "0" || valueString.indexOf("px") != -1;
};

