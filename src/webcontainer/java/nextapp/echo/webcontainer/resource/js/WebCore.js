/**
 * @fileoverview
 * Provides low-level web-client-related APIs.  Features include:
 * <ul>
 *  <li>Provides cross-platform API for accessing web client features that have
 *   inconsistent implementations on various browser platforms.</li>
 *  <li>Provides HTTP Connection object (wrapper for XMLHttpRequest) that allows
 *   for object-oriented "MethodRef"-based event listeners.</li>
 *  <li>Provides HTML DOM manipulation capabilites.</li>
 *  <li>Provides DOM event mangement facility, enabling capturing/bubbling phases
 *   on all browsers, including Internet Explorer 6 and allowing object-oriented
 *   "MethodRef"-based event listeners.</li>
 *  <li>Provides "virtual positioning" capability for Internet Explorer 6 to
 *   render proper top/left/right/bottom CSS positioning.</li>
 *  <li>Provides facilities to convert dimensions (e.g., in/cm/pc) to pixels.</li>
 *  <li>Provides capabilities to measure rendered size of DOM fragments.</li>
 *  <li> Provides capabilities to asynchronously load and install JavaScript modules.</li>
 * </ul>
 * Requires Core.
 */

/**
 * @class
 * Namespace for Web Core.  Non-instantiable object.
 */
EchoWebCore = function() { };

/**
 * Initializes the web core.  This method must be executed prior to using any Web Core capabilities.
 */
EchoWebCore.init = function() { 
    if (EchoWebCore.initialized) {
        // Already initialized.
        return;
    }

    EchoWebCore.Environment._init();
    EchoWebCore.Measure._calculateExtentSizes();
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

/**
 * Flag indicating that a drag-and-drop operation is in process.
 * Setting this flag will prevent text selections within the browser.
 * It must be un-set when the drag operation completes.
 * 
 * @type Boolean
 */
EchoWebCore.dragInProgress = false;

/**
 * Internet Explorer-specific event listener to deny selection.
 * 
 * @param {Event} e the selection event
 * @private
 */
EchoWebCore._selectStartListener = function(e) {
    e = e ? e : window.event;
    if (EchoWebCore.dragInProgress) {
        EchoWebCore.DOM.preventEventDefault(e);
    }
};

/**
 * @class
 * DOM manipulation utility method namespace.
 * Do not instantiate.
 */
EchoWebCore.DOM = function() { };

/**
 * Adds an event listener to an object, using the client's supported event 
 * model.  This method does NOT support method references. 
 *
 * @param {Element} eventSource the event source
 * @param {String} eventType the type of event (the 'on' prefix should NOT be included
 *        in the event type, i.e., for mouse rollover events, "mouseover" would
 *        be specified instead of "onmouseover")
 * @param {Function} eventListener the event listener to be invoked when the event occurs
 * @param {Boolean} useCapture a flag indicating whether the event listener should capture
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
 * Creates a new XML DOM.
 *
 * @param {String} namespaceUri the unique URI of the namespace of the root element in 
 *        the created document (not supported for
 *        Internet Explorer 6 clients, null may be specified for all clients)
 * @param {String} qualifiedName the name of the root element of the new document (this
 *        element will be created automatically)
 * @type Document
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

/**
 * Focuses the given DOM element.
 * The focus operation may be placed in the scheduler if the browser requires the focus
 * operation to be performed outside of current JavaScript context (i.e., in the case
 * where the element to be focused was just rendered in this context).
 * 
 * @param {Element} the DOM element to focus
 */
EchoWebCore.DOM.focusElement = function(element) {
    if (EchoWebCore.Environment.QUIRK_DELAYED_FOCUS_REQUIRED) {
        EchoCore.Scheduler.run(new EchoCore.MethodRef(window, EchoWebCore.DOM._focusElementImpl, element));
    } else {
        EchoWebCore.DOM._focusElementImpl(element);
    }
};

/**
 * Focus element implementation.
 * 
 * @param {Element} the DOM element to focus
 * @private
 */
EchoWebCore.DOM._focusElementImpl = function(element) {
    if (element.focus) {
        element.focus();
    }
};

/**
 * Returns the first immediate child element of parentElement with the specified tag name.
 * 
 * @param {Element} parentElement the parent element
 * @param tagName the tag name
 * @return the first child element of parentElement with the specified tag name,
 *         or null if no elements match
 * @type Element
 */
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

/**
 * Returns an array containing all immediate child element of parentElement with the specified tag name.
 * 
 * @param {Element} parentElement the parent element
 * @param tagName the tag name
 * @return the child elements
 * @type Array
 */
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
 * @param {Event} e the event
 * @return the target
 * @type Element
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
 * @param {Event} e the event
 * @return the target
 * @type Element
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
 * @param {Event} e the event
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
 * @param {Node} node the parent node whose children should be deleted
 */
EchoWebCore.DOM.removeAllChildren = function(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Removes an event listener from an object, using the client's supported event 
 * model.  This method does NOT support method references.
 *
 * @param {Element} eventSource the event source
 * @param {String} eventType the type of event (the 'on' prefix should NOT be included
 *        in the event type, i.e., for mouse rollover events, "mouseover" would
 *        be specified instead of "onmouseover")
 * @param {Function} eventListener the event listener to be invoked when the event occurs
 * @param {Boolean}useCapture a flag indicating whether the event listener should capture
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
 * @param {Node} node the node which should be deleted
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
 * @param {Node} node the node which should be deleted
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
 * Stops an event from propagating ("bubbling") to parent nodes in the DOM, 
 * using the client's supported event model.
 * On clients which support the W3C DOM Level 2 event specification,
 * the stopPropagation() method of the event is invoked.
 * On clients which support only the Internet Explorer event model,
 * the 'cancelBubble' property of the event is set to true.
 *
 * @param {Event} e the event
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
 * @param {Node} ancestorNode the potential ancestor node
 * @param {Npde} descendantNode the potential descendant node
 * @return true if <code>ancestorNode</code> is or is an ancestor of
 *         <code>descendantNode</code>
 * @type Boolean
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

/**
 * @class
 * Provides information about the web browser environment.
 * Non-instantiable class.
 */
EchoWebCore.Environment = function() { };

/**
 * Performs initial analysis of environment.
 * Automatically invoked when WebCore module is initialized.
 */
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
        env._parseVersionInfo(ua, "msie ");
    } else if (env.BROWSER_FIREFOX) {
        env._parseVersionInfo(ua, "firefox/");
    } else if (env.BROWSER_OPERA) {
        env._parseVersionInfo(ua, "opera/");
    } else if (env.BROWSER_SAFARI) {
        env._parseVersionInfo(ua, "version/");
    } else if (env.BROWSER_MOZILLA) {
        env._parseVersionInfo(ua, "rv:")
    } else if (env.BROWSER_KONQUEROR) {
        env._parseVersionInf(ua, "konqueror/");
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
            // Internet Explorer 6 Flags.
            env.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY = true;
            env.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED = true;
            env.QUIRK_CSS_BACKGROUND_ATTACHMENT_USE_FIXED = true;
            env.QUIRK_IE_SELECT_Z_INDEX = true;
            env.NOT_SUPPORTED_CSS_MAX_HEIGHT = true;
            env.QUIRK_DELAYED_FOCUS_REQUIRED = true;
            
            // Enable 'garbage collection' on large associative arrays to avoid memory leak.
            EchoCore.Arrays.LargeMap.garbageCollectEnabled = true;
        }
    } else if (env.BROWSER_MOZILLA) {
        if (env.BROWSER_FIREFOX) {
            if (env.BROWSER_MAJOR_VERSION < 2) {
                env.QUIRK_DELAYED_FOCUS_REQUIRED = true;
            }
        } else {
            env.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE = true;
            env.QUIRK_DELAYED_FOCUS_REQUIRED = true;
        }
    } else if (env.BROWSER_OPERA) {
        env.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
    }
};

/**
 * Parses version information from user agent string. The text argument specifies
 * the string that prefixes the version info in the ua string (ie 'version/' for Safari for example).
 * <p>
 * The major version is retrieved by getting the int between text and the first dot. The minor version
 * is retrieved by getting the int between the first dot and the first non-numeric character that appears
 * after the dot, or the end of the ua string (whichever comes first).
 * If the ua string does not supply a minor version, the minor version is assumed to be 0.
 *
 * @private
 * @param ua the lower cased user agent string
 * @param searchString the text that prefixes the version info (version info must be the first appearance of 
 *          this text in the ua string)
 */
EchoWebCore.Environment._parseVersionInfo = function(ua, searchString) {
    var ix1 = ua.indexOf(searchString);
    var ix2 = ua.indexOf(".", ix1);
    var ix3 = ua.length;
    
    if (ix2 == -1) {
        ix2 = ua.length;
    } else {
        // search for the first non-number character after the dot
        for (var i = ix2 + 1; i < ua.length; i++) {
            var c = ua.charAt(i);
            if (isNaN(c)) {
                ix3 = i;
                break;
            }
        }
    }
    
    EchoWebCore.Environment.BROWSER_MAJOR_VERSION = parseInt(ua.substring(ix1 + searchString.length, ix2));
    if (ix2 == ua.length) {
        EchoWebCore.Environment.BROWSER_MINOR_VERSION = 0;
    } else {
        EchoWebCore.Environment.BROWSER_MINOR_VERSION = parseInt(ua.substring(ix2 + 1, ix3));
    }
};

/**
 * @class
 * EventProcessor namespace.  Non-instantiable object.
 * The static methods in this object provide a standard framework for handling
 * DOM events across incompatible browser platforms.
 * <p>
 * <b>Object-oriented events:</b>  
 * This implementation provides the capability to register EchoCore.MethodRef-based
 * listeners, allowing event processing methods of specific object instances to 
 * be invoked (i.e., preserving the 'this' pointer).
 * <p>
 * <b>Capturing/Bubbling Listeners:</b>
 * This implementation additionally allows for the registration of capturing and bubbling event 
 * listeners that work even on Internet Explorer platforms, where they are not natively supported.
 * This implementation relies on the fact that all event listeners will be registered
 * through it.
 */
EchoWebCore.EventProcessor = function() { };

/**
 * The next element identifier.
 * @type Integer
 */
EchoWebCore.EventProcessor._nextId = 0;

/**
 * Mapping between element ids and ListenerLists containing listeners to invoke during capturing phase.
 * @type EchoCore.Arrays.LargeMap
 */
EchoWebCore.EventProcessor._capturingListenerMap = new EchoCore.Arrays.LargeMap();

/**
 * Mapping between element ids and ListenerLists containing listeners to invoke during bubbling phase.
 * @type EchoCore.Arrays.LargeMap
 */
EchoWebCore.EventProcessor._bubblingListenerMap = new EchoCore.Arrays.LargeMap();

/**
 * Registers an event handler.
 *
 * @param {Element} element the DOM element on which to add the event handler
 * @param {String} eventType the DOM event type
 * @param eventTarget the method or MethodRef to invoke when the event is fired
 * @param {Boolean} capture true to fire the event during the capturing phase, false to fire the event during
 *        the bubbling phase
 */
EchoWebCore.EventProcessor.add = function(element, eventType, eventTarget, capture) {
    if (!element) {
        alert(eventType + eventTarget);
    }
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
        listenerList = listenerMap.map[element.__eventProcessorId];
        if (!listenerList) {
            // Create new ListenerList if none exists.
            listenerList = new EchoCore.ListenerList();
            listenerMap.map[element.__eventProcessorId] = listenerList;
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

/**
 * Adds a listener to an element that will prevent text 
 * selection / highlighting as a result of mouse clicks.
 * The removeSelectionDenialListener() method should be invoked
 * when the element is to be disposed.
 * 
 * @param {Element} element the element on which to forbid text selection
 * @see EchoWebCore.EventProcessor#removeSelectionDenialListener
 */
EchoWebCore.EventProcessor.addSelectionDenialListener = function(element) {
    EchoWebCore.EventProcessor.add(element, "mousedown", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    if (EchoWebCore.Environment.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
        EchoWebCore.EventProcessor.add(element, "selectstart", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    }
};

/**
 * Listener method which is invoked when ANY event registered with the event processor occurs.
 * 
 * @param {Event} e 
 */
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
        listenerList = EchoWebCore.EventProcessor._capturingListenerMap.map[elementAncestry[i].__eventProcessorId];
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
            listenerList = EchoWebCore.EventProcessor._bubblingListenerMap.map[elementAncestry[i].__eventProcessorId];
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
        //FIXME Possibly always invoke this to avoid bug #71 propagation issue.
        // Inform DOM to stop propagation of event.
        EchoWebCore.DOM.stopEventPropagation(e);
    }
};

/**
 * Unregisters an event handler.
 *
 * @param {Element} element the DOM element on which to add the event handler
 * @param {String} eventType the DOM event type
 * @param eventTarget the method of MethodRef to invoke when the event is fired
 * @param {Boolean} capture true to fire the event during the capturing phase, false to fire the event during
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
    var listenerList = listenerMap.map[element.__eventProcessorId];
    if (listenerList) {
        // Remove event handler from the ListenerList.
        listenerList.removeListener(eventType, eventTarget);
        
        if (listenerList.isEmpty()) {
            listenerMap.remove(element.__eventProcessorId);
        }
    }
};

/**
 * Unregister all event handlers from a specific element.
 * Use of this operation is recommended when disposing of components, it is
 * more efficient than removing listenerse individually and guarantees proper clean-up.
 * 
 * @param {Element} the element
 */
EchoWebCore.EventProcessor.removeAll = function(element) {
    if (!element.__eventProcessorId) {
        return;
    }
    EchoWebCore.EventProcessor._removeAllImpl(element, EchoWebCore.EventProcessor._capturingListenerMap);
    EchoWebCore.EventProcessor._removeAllImpl(element, EchoWebCore.EventProcessor._bubblingListenerMap);
};

/**
 * Implementation method for removeAll().
 * Removes all capturing or bubbling listeners from a specific element
 * 
 * @param {Element} the element
 * @param {EchoCore.Arrays.LargeMap} the map from which the listeners should be removed, either
 *        EchoWebCore.EventProcessor._capturingListenerMap or EchoWebCore.EventProcessor._bubblingListenerMap
 * @private
 */
EchoWebCore.EventProcessor._removeAllImpl = function(element, listenerMap) {
    var listenerList = listenerMap.map[element.__eventProcessorId];
    if (!listenerList) {
        return;
    }

    var types = listenerList.getListenerTypes();
    for (var i = 0; i < types.length; ++i) {
        EchoWebCore.DOM.removeEventListener(element, types[i], EchoWebCore.EventProcessor._processEvent, false); 
    }
    
    listenerMap.remove(element.__eventProcessorId);
};

/**
 * Removes a selection denial listener.
 * 
 * @param element the element from which to remove the selection denial listener
 * @see EchoWebCore.EventProcessor#addSelectionDenialListener
 */
EchoWebCore.EventProcessor.removeSelectionDenialListener = function(element) {
    EchoWebCore.EventProcessor.remove(element, "mousedown", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    if (EchoWebCore.Environment.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
        EchoWebCore.EventProcessor.remove(element, "selectstart", EchoWebCore.EventProcessor._selectionDenialHandler, false);
    }
};

/**
 * Selection denial listener implementation.
 * 
 * @param {Event} the selection/click event
 * @private
 */
EchoWebCore.EventProcessor._selectionDenialHandler = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
};

/**
 * toString() implementation for debugging purposes.
 * Displays contents of capturing and bubbling listener maps.
 * 
 * @return string represenation of listener maps
 * @type String
 */
EchoWebCore.EventProcessor.toString = function() {
    return "Capturing: " + EchoWebCore.EventProcessor._capturingListenerMap + "\n"
            + "Bubbling: " + EchoWebCore.EventProcessor._bubblingListenerMap;
};

/**
 * Creates a new <code>HttpConnection</code>.
 * This method simply configures the connection, the connection
 * will not be opened until <code>connect()</code> is invoked.
 *
 * @param {String} url the target URL
 * @param {String} method the connection method, i.e., GET or POST
 * @param messageObject the message to send (may be a String or XML DOM)
 * @param {String} contentType the request content-type
 * @constructor
 * 
 * @class
 * An HTTP connection to the hosting server.  This method provides a cross
 * platform wrapper for XMLHttpRequest and additionally allows method
 * reference-based listener registration.  
 */
EchoWebCore.HttpConnection = function(url, method, messageObject, contentType) {
    this._url = url;
    this._contentType = contentType;
    this._method = method;
    this._messageObject = messageObject;
    this._disposed = false;
    this._listenerList = new EchoCore.ListenerList();
};

/**
 * Adds a response listener to be notified when a response is received from the connection.
 * 
 * @param l the listener to add (may be a Function or EchoCore.MethodRef)
 */
EchoWebCore.HttpConnection.prototype.addResponseListener = function(l) {
    this._listenerList.addListener("response", l);
};

/**
 * Executes the HTTP connection.
 * This method will return before the HTTP connection has received a response.
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

/**
 * Disposes of the connection.  This method must be invoked when the connection 
 * will no longer be used/processed.
 */
EchoWebCore.HttpConnection.prototype.dispose = function() {
    this._listenerList = null;
    this._messageObject = null;
    this._xmlHttpRequest = null;
    this._disposed = true;
};

/**
 * Returns the response status code of the HTTP connection, if available.
 * 
 * @return {Integer} the response status code
 */
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

/**
 * Adds a response listener to be notified when a response is received from the connection.
 * 
 * @param l the listener to add (may be a Function or EchoCore.MethodRef)
 */
EchoWebCore.HttpConnection.prototype.removeResponseListener = function(l) {
    this._listenerList.removeListener("response", l);
};

// FIXME Current "valid" flag for 2XX responses is probably a horrible idea.
/**
 * Creates a new response event
 * @param source {EchoWebCore.HttpConnection} the connection which fired the event
 * @param valid {Boolean} a flag indicating a valid 2XX response was received
 * 
 * @constructor
 * @class
 * An event which indicates a response has been received to a connection
 */
EchoWebCore.HttpConnection.ResponseEvent = function(source, valid) {
    EchoCore.Event.call(this, "response", source);
    this.valid = valid;
};

/**
 * @class
 * Utilities for dynamically loading additional script libraries.
 * Non-instantiable class. 
 */
EchoWebCore.Library = function() { };

/**
 * Set of loaded libraries (keys are library urls, value is true when library has been loaded).
 * @private
 */
EchoWebCore.Library._loadedLibraries = new Object();

/**
 * A representation of a group of libraries to be loaded at the same time.
 * Libraries will be retrieved asynchronously, and then installed once ALL the libraries have
 * been retrieved.  Installation will be done in the order in which the add() method was
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
 * Libraries which have previously been loaded will not be loaded again.
 *
 * @param libraryUrl the URL from which to retrieve the library.
 */
EchoWebCore.Library.Group.prototype.add = function(libraryUrl) {
    if (EchoWebCore.Library._loadedLibraries[libraryUrl]) {
        // Library already loaded: ignore.
        return;
    }
    
    var libraryItem = new EchoWebCore.Library._Item(this, libraryUrl);
    this._libraries.push(libraryItem);
};

/**
 * Adds a listener to be notified when all libraries in the group have been loaded.
 *
 * @param l the listener to add (may be a Function or EchoCore.MethodRef)
 */
EchoWebCore.Library.Group.prototype.addLoadListener = function(l) {
    this._listenerList.addListener("load", l);
};

/**
 * Notifies listeners of completed library loading.
 * 
 * @private
 */
EchoWebCore.Library.Group.prototype._fireLoadEvent = function() {
	var e = new EchoCore.Event("load", this);
	this._listenerList.fireEvent(e);
};

/**
 * Determines if this library group contains any new (not previously loaded)
 * libraries.
 * 
 * @return true if any new libraries exist
 * @type Boolean
 */
EchoWebCore.Library.Group.prototype.hasNewLibraries = function() {
    return this._libraries.length > 0;
};

/**
 * Installs all libraries in the group.
 * This method is invoked once all libraries have been successfully
 * retrieved.  It will invoke any registered load listeners
 * once the libraries have been installed.
 * 
 * @private
 */
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

/**
 * Event listener invoked when a single library has been successfully retrieved.
 * When all libraries have been retrieved, this method will invoke _install().
 * @private
 */
EchoWebCore.Library.Group.prototype._notifyRetrieved = function() {
    ++this._loadedCount;
    if (this._loadedCount == this._totalCount) {
        this._install();
    }
};

/**
 * Initializes library loading.  When this method is invoked
 * the libraries will be asynchronously loaded.  This method
 * will return before the libraries have been loaded.
 * Once this method has been invoked, add() may no longer
 * be invoked.
 */
EchoWebCore.Library.Group.prototype.load = function() {
    this._totalCount = this._libraries.length;
    for (var i = 0; i < this._libraries.length; ++i) {
        this._libraries[i]._retrieve();
    }
};

/**
 * Removes a listener from being notified when all libraries in the group have been loaded.
 *
 * @param l the listener to remove (may be a Function or EchoCore.MethodRef)
 */
EchoWebCore.Library.Group.prototype.removeLoadListener = function(l) {
    this._listenerList.removeListener("load", l);
};

/**
 * Creates a new library item.
 * 
 * @param {EchoWebCore.Library.Group} group the library group in which the item is contained
 * @param {String} url the URL from which the library may be retrieved
 * @constructor
 * 
 * @class
 * Representation of a single library to be loaded within a group
 * 
 * @private 
 */
EchoWebCore.Library._Item = function(group, url) {
    this._url = url;
    this._group = group;
};

/**
 * Event listener for response from the HttpConnection used to retrive the library.
 * 
 * @param {EchoWebCore.HttpConnection.ResponseEvent} e the event
 * @private
 */
EchoWebCore.Library._Item.prototype._retrieveListener = function(e) {
    if (!e.valid) {
        throw new Error("Invalid HTTP response from library request: " + e.source.getStatus());
    }
    this._content = e.source.getResponseText();
    this._group._notifyRetrieved();
};

/**
 * Installs the library.
 * The library must have been loaded before invoking this method.
 * @private
 */
EchoWebCore.Library._Item.prototype._install = function() {
    EchoWebCore.Library._loadedLibraries[this._url] = true;
    if (this._content == null) {
        throw new Error("Attempt to install library when no content has been loaded.");
    }
    
    // Execute content to install library.
    eval(this._content);
};

/**
 * Asynchronously retrieves the library.
 * This method will invoke the retrieve listener when the library has been completed,
 * it will return before the library has been retrieved.
 */
EchoWebCore.Library._Item.prototype._retrieve = function() {
	var conn = new EchoWebCore.HttpConnection(this._url, "GET");
	conn.addResponseListener(new EchoCore.MethodRef(this, this._retrieveListener));
	conn.connect();
};

/**
 * @class
 * Namespace for measuring-related operations.
 * Do not instantiate.  
 */
EchoWebCore.Measure = function() { };

/** Size of one inch in horizontal pixels. */
EchoWebCore.Measure._hInch = 96;

/** Size of one inch in vertical pixels. */
EchoWebCore.Measure._vInch = 96;

/** Size of one 'ex' in horizontal pixels. */
EchoWebCore.Measure._hEx = 7;

/** Size of one 'ex' in vertical pixels. */
EchoWebCore.Measure._vEx = 7;

/** Size of one 'em' in horizontal pixels. */
EchoWebCore.Measure._hEm = 13.3333;

/** Size of one 'em' in vertical pixels. */
EchoWebCore.Measure._vEm = 13.3333;

/**
 * Converts any non-relative extent value to pixels.
 * 
 * @param {Number} value the value to convert
 * @param {String} the units, one of the following values: in, cm, mm, pt, pc, em, ex
 * @return the pixel value (may have a fractional part)
 * @type Number
 */
EchoWebCore.Measure.extentToPixels = function(value, units, horizontal) {
    if (!units || units == "px") {
        return value;
    }
    var dpi = horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch;
    switch (units) {
    case "%":  return 0;
    case "in": return value * (horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch);
    case "cm": return value * (horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch) / 2.54;
    case "mm": return value * (horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch) / 25.4;
    case "pt": return value * (horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch) / 72;
    case "pc": return value * (horizontal ? EchoWebCore.Measure._hInch : EchoWebCore.Measure._vInch) / 6;
    case "em": return value * (horizontal ? EchoWebCore.Measure._hEm   : EchoWebCore.Measure._vEm);
    case "ex": return value * (horizontal ? EchoWebCore.Measure._hEx   : EchoWebCore.Measure._vEx);
    }
};

/**
 * Updates internal measures used in converting length units 
 * (e.g., in, mm, ex, and em) to pixels.
 * Automatically invoked when WebCore module is initialized.
 * @private
 */
EchoWebCore.Measure._calculateExtentSizes = function() {
    var containerElement = document.getElementsByTagName("body")[0];

    var inchDiv4 = document.createElement("div");
    inchDiv4.style.width = "4in";
    inchDiv4.style.height = "4in";
    containerElement.appendChild(inchDiv4);
    EchoWebCore.Measure._hInch = inchDiv4.offsetWidth / 4;
    EchoWebCore.Measure._vInch = inchDiv4.offsetHeight / 4;
    containerElement.removeChild(inchDiv4);
    
    var emDiv24 = document.createElement("div");
    emDiv24.style.width = "24em";
    emDiv24.style.height = "24em";
    containerElement.appendChild(emDiv24);
    EchoWebCore.Measure._hEm = emDiv24.offsetWidth / 24;
    EchoWebCore.Measure._vEm = emDiv24.offsetHeight / 24;
    containerElement.removeChild(emDiv24);
    
    var exDiv24 = document.createElement("div");
    exDiv24.style.width = "24ex";
    exDiv24.style.height = "24ex";
    containerElement.appendChild(exDiv24);
    EchoWebCore.Measure._hEx = exDiv24.offsetWidth / 24;
    EchoWebCore.Measure._vEx = exDiv24.offsetHeight / 24;
    containerElement.removeChild(exDiv24);
};

/**
 * Creates a new Bounds object to calculate the size and/or position of an element.
 * 
 * @param element the element to measure.
 * @constructor
 * 
 * @class
 * Measures the boundaries of an element,i.e., its left and top position and/or
 * width and height.  If the element is not attached to the rendered DOM hierarchy,
 * the element will be temporarily removed from its hierarchy and placed in an
 * off-screen buffer for measuring.
 */
EchoWebCore.Measure.Bounds = function(element) {
    var testElement = element;
    while (testElement && testElement != document) {
        testElement = testElement.parentNode;
    }
    var rendered = testElement == document;
    
    // Create off-screen div element for evaluating sizes if necessary.
    if (!EchoWebCore.Measure.Bounds._offscreenDiv) {
        EchoWebCore.Measure.Bounds._offscreenDiv = document.createElement("div");
        EchoWebCore.Measure.Bounds._offscreenDiv.style.cssText 
                = "position: absolute; top: -1700px; left: -1300px; width: 1600px; height: 1200px;";
        document.body.appendChild(EchoWebCore.Measure.Bounds._offscreenDiv);
    }

    var parentNode, nextSibling;
    if (!rendered) {
        // Element must be added to off-screen element for measuring.
        
        // Store parent node and next sibling such that element may be replaced into proper position
        // once off-screen measurement has been completed.
        parentNode = element.parentNode;
        nextSibling = element.nextSibling;

        // Remove element from parent.
        if (parentNode) {
            parentNode.removeChild(element);
        }
        
        // Append element to measuring container DIV.
        EchoWebCore.Measure.Bounds._offscreenDiv.appendChild(element);
    }
    
    // Store  width and height of element.

    /**
     * The width of the element, in pixels.
     * @type Integer
     */
    this.width = element.offsetWidth;

    /**
     * The height of the element, in pixels.
     * @type Integer
     */
    this.height = element.offsetHeight;
    
    if (!rendered) {
        // Replace off-screen measured element in previous location.
        EchoWebCore.Measure.Bounds._offscreenDiv.removeChild(element);
        if (parentNode) {
            parentNode.insertBefore(element, nextSibling);
        }
    }
    
    // Determine top and left positions of element if rendered on-screen.
    if (rendered) {
        var cumulativeOffset = EchoWebCore.Measure.Bounds._getCumulativeOffset(element);
        var scrollOffset = EchoWebCore.Measure.Bounds._getScrollOffset(element);

        /**
         * The top coordinate of the element, in pixels relative to the upper-left corner of the interior of the window.
         * @type Integer
         */
        this.top = cumulativeOffset.top - scrollOffset.top;

        /**
         * The left coordinate of the element, in pixels relative to the upper-left corner of the interior of the window.
         * @type Integer
         */
        this.left = cumulativeOffset.left - scrollOffset.left;
    }
};

/**
 * Measures the scrollbar offset of an element, including any
 * scroll-bar related offsets of its ancestors.
 * 
 * @param element the elemnt to measure
 * @return the offset data, with 'left' and 'top' properties specifying the offset amounts
 * @type Object
 * @private
 */
EchoWebCore.Measure.Bounds._getScrollOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
        valueT += element.scrollTop  || 0;
        valueL += element.scrollLeft || 0; 
        element = element.parentNode;
    } while (element);
    return { left: valueL, top: valueT };
};

/**
 * Measures the cumulative offset of an element.
 * 
 * @param element the elemnt to measure
 * @return the offset data, with 'left' and 'top' properties specifying the offset amounts
 * @type Object
 * @private
 */
EchoWebCore.Measure.Bounds._getCumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return { left: valueL, top: valueT };
};

/**
 * toString() implementation for debug purposes.
 * 
 * @return a string representation of the object
 * @type String
 */
EchoWebCore.Measure.Bounds.prototype.toString = function() {
    return (this.left != null ? (this.left + "," + this.top + " : ") : "") + "[" + this.width + "x" + this.height + "]";
};

/**
 * @class
 * Static object/namespace which provides cross-platform CSS positioning 
 * capabilities. Do not instantiate.
 * <p>
 * Internet Explorer 6 is ordinarily handicapped by its lack
 * of support for setting 'left' and 'right' or 'top' and 'bottom' positions
 * simultaneously on a single document element.
 * <p> 
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

