/**
 * @fileoverview
 * Provides low-level web-client-related APIs.  Features include:
 * <ul>
 *  <li>Provides cross-platform API for accessing web client features that have
 *   inconsistent implementations on various browser platforms.</li>
 *  <li>Provides HTTP Connection object (wrapper for XMLHttpRequest).</li>
 *  <li>Provides HTML DOM manipulation capabilities.</li>
 *  <li>Provides DOM event management facility, enabling capturing/bubbling phases
 *   on all browsers, including Internet Explorer 6.</li>
 *  <li>Provides "virtual positioning" capability for Internet Explorer 6 to
 *   render proper top/left/right/bottom CSS positioning.</li>
 *  <li>Provides facilities to convert dimensions (e.g., in/cm/pc) to pixels.</li>
 *  <li>Provides capabilities to measure rendered size of DOM fragments.</li>
 *  <li> Provides capabilities to asynchronously load and install JavaScript modules.</li>
 * </ul>
 * Requires Core.
 */

/**
 * Namespace for Web Core.
 * @namespace
 */
Core.Web = {

    /**
     * Flag indicating that a drag-and-drop operation is in process.
     * Setting this flag will prevent text selections within the browser.
     * It must be un-set when the drag operation completes.
     * 
     * @type Boolean
     */
    dragInProgress: false,
    
    /**
     * Initializes the Web Core.  This method must be executed prior to using any Web Core capabilities.
     */
    init: function() {
        if (Core.Web.initialized) {
            // Already initialized.
            return;
        }
    
        Core.Web.Env._init();
        Core.Web.Measure._calculateExtentSizes();
        Core.Web.Measure.Bounds._initMeasureContainer();
        if (Core.Web.Env.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY) {
            // Enable virtual positioning.
            Core.Web.VirtualPosition._init();
        }
    
        if (Core.Web.Env.ENGINE_MSHTML) {
            Core.Web.DOM.addEventListener(document, "selectstart", Core.Web._selectStartListener, false);
        }
        
        Core.Web.initialized = true;
    },
    
    /**
     * Internet Explorer-specific event listener to deny selection.
     * 
     * @param {Event} e the selection event
     */
    _selectStartListener: function(e) {
        e = e ? e : window.event;
        if (Core.Web.dragInProgress) {
            Core.Web.DOM.preventEventDefault(e);
        }
    }
};

/**
 * DOM manipulation utility method namespace.
 * @class
 */
Core.Web.DOM = {

    /**
     * Temporary storage for the element about to be focused (for clients that require 'delayed' focusing).
     */
    _focusPendingElement: null,
    
    /**
     * Runnable to invoke focus implementation (lazily created).
     * @type Core.Web.Scheduler.Runnable
     */
    _focusRunnable: null,

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
    addEventListener: function(eventSource, eventType, eventListener, useCapture) {
        if (eventSource.addEventListener) {
            eventSource.addEventListener(eventType, eventListener, useCapture);
        } else if (eventSource.attachEvent) {
            eventSource.attachEvent("on" + eventType, eventListener);
        }
    },
    
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
    createDocument: function(namespaceUri, qualifiedName) {
        if (document.implementation && document.implementation.createDocument) {
            // DOM Level 2 Browsers
            var dom;
            if (Core.Web.Env.BROWSER_FIREFOX && Core.Web.Env.BROWSER_VERSION_MAJOR == 3 &&
                    Core.Web.Env.BROWSER_VERSION_MINOR === 0) {
                // https://bugzilla.mozilla.org/show_bug.cgi?id=431701
                dom = new DOMParser().parseFromString("<?xml version='1.0' encoding='UTF-8'?><" + qualifiedName + "/>",
                        "application/xml");
            } else {
                dom = document.implementation.createDocument(namespaceUri, qualifiedName, null);
            }
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
    },
    
    /**
     * Focuses the given DOM element.
     * The focus operation may be placed in the scheduler if the browser requires the focus
     * operation to be performed outside of current JavaScript context (i.e., in the case
     * where the element to be focused was just rendered in this context).
     * 
     * @param {Element} element the DOM element to focus
     */
    focusElement: function(element) {
        if (Core.Web.Env.QUIRK_DELAYED_FOCUS_REQUIRED) {
            if (!this._focusRunnable) {
                this._focusRunnable = new Core.Web.Scheduler.MethodRunnable(this._focusElementImpl);
            }
            Core.Web.DOM._focusPendingElement = element;
            Core.Web.Scheduler.add(this._focusRunnable);
        } else {
            this._focusElementImpl(element);
        }
    },
    
    /**
     * Focus element implementation.
     * 
     * @param {Element} element the DOM element to focus
     */
    _focusElementImpl: function(element) {
        if (!element) {
            element = Core.Web.DOM._focusPendingElement;
            Core.Web.DOM._focusPendingElement = null;
        }
        if (element && element.focus) {
            try {
                element.focus();
            } catch (ex) {
                // Silently digest IE focus exceptions.
            }
        }
    },
    
    /**
     * Returns the first immediate child element of parentElement with the specified tag name.
     * 
     * @param {Element} parentElement the parent element
     * @param tagName the tag name
     * @return the first child element of parentElement with the specified tag name,
     *         or null if no elements match
     * @type Element
     */
    getChildElementByTagName: function(parentElement, tagName) {
        var element = parentElement.firstChild;
        while (element) {
            if (element.nodeType == 1 && element.nodeName == tagName) {
                return element;
            }
            element = element.nextSibling;
        }
        return null;
    },
    
    /**
     * Returns an array containing all immediate child element of parentElement with the specified tag name.
     * 
     * @param {Element} parentElement the parent element
     * @param tagName the tag name
     * @return the child elements
     * @type Array
     */
    getChildElementsByTagName: function(parentElement, tagName) {
        var elements = [];
        var element = parentElement.firstChild;
        while (element) {
            if (element.nodeType == 1 && element.nodeName == tagName) {
                elements.push(element);
            }
            element = element.nextSibling;
        }
        return elements;
    },
    
    /**
     * Returns x/y coordinates of mouse relative to the element which fired an event.
     * 
     * @param {Event} e the event
     * @return object containing 'x' and 'y' properties specifying the numeric pixel
     *         coordinates of the mouse relative to the element, with {x: 0, y: 0}
     *         indicating its upper-left corner
     */
    getEventOffset: function(e) {
        if (typeof e.offsetX == "number") {
            return { x: e.offsetX, y: e.offsetY };
        } else {
            var bounds = new Core.Web.Measure.Bounds(this.getEventTarget(e));
            return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
        }
    },
    
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
    getEventTarget: function(e) {
        return e.target ? e.target : e.srcElement;
    },
    
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
    getEventRelatedTarget: function(e) {
        return e.relatedTarget ? e.relatedTarget : e.toElement;
    },
    
    /**
     * Determines if <code>ancestorNode</code> is or is an ancestor of
     * <code>descendantNode</code>.
     *
     * @param {Node} ancestorNode the potential ancestor node
     * @param {Node} descendantNode the potential descendant node
     * @return true if <code>ancestorNode</code> is or is an ancestor of
     *         <code>descendantNode</code>
     * @type Boolean
     */
    isAncestorOf: function(ancestorNode, descendantNode) {
        var testNode = descendantNode;
        while (testNode !== null) {
            if (testNode == ancestorNode) {
                return true;
            }
            testNode = testNode.parentNode;
        }
        return false;
    },

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
    preventEventDefault: function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },
    
    /**
     * Removes all child nodes from the specified DOM node.
     *
     * @param {Node} node the parent node whose children should be deleted
     */
    removeAllChildren: function(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },
    
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
    removeEventListener: function(eventSource, eventType, eventListener, useCapture) {
        if (eventSource.removeEventListener) {
            eventSource.removeEventListener(eventType, eventListener, useCapture);
        } else if (eventSource.detachEvent) {
            eventSource.detachEvent("on" + eventType, eventListener);
        }
    },
    
    /**
     * Removes the specified DOM node from the DOM tree. This method employs a workaround for the
     * <code>QUIRK_PERFORMANCE_LARGE_DOM_REMOVE</code> quirk.
     *
     * @param {Node} node the node which should be deleted
     */
    removeNode: function(node) {
        var parentNode = node.parentNode;
        if (!parentNode) {
            // not in DOM tree
            return;
        }
        if (Core.Web.Env.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE) {
            this._removeNodeRecursive(node);
        } else {
            parentNode.removeChild(node);
        }
    },
    
    /**
     * Removes the specified DOM node from the DOM tree in a recursive manner, i.e. all descendants
     * of the given node are removed individually. This alleviates slow performance when removing large
     * DOM trees.
     *
     * @param {Node} node the node which should be deleted
    */
    _removeNodeRecursive: function(node) {
        var childNode = node.firstChild;
        while (childNode) {
            var nextChildNode = childNode.nextSibling;
            this._removeNodeRecursive(childNode);
            childNode = nextChildNode;
        }
        node.parentNode.removeChild(node);
    },
    
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
    stopEventPropagation: function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    }
};

/**
 * Provides information about the web browser environment.
 * @class
 */
Core.Web.Env = {

    /**
     * Flag indicating the Presto rendering engine is being used (Opera).
     */
    ENGINE_PRESTO: null,

    /**
     * Flag indicating the WebKit rendering engine is being used (Safari,
     * Chrome). Derivative of KHTML.
     */
    ENGINE_WEBKIT: null,

    /**
     * Flag indicating the KHTML rendering engine is being used (Konqueror).
     */
    ENGINE_KHTML: null,

    /**
     * Flag indicating the MSHTML/Trident rendering engine is being used
     * (Internet Explorer).
     */
    ENGINE_MSHTML: null,

    /**
     * Flag indicating the Gecko rendering engine is being used (Mozilla,
     * Firefox).
     */
    ENGINE_GECKO: null,

    /**
     * Flag indicating a Mozilla client or Mozilla-based client.
     */
    BROWSER_MOZILLA: null,

    /**
     * Flag indicating an Opera client.
     */
    BROWSER_OPERA: null,

    /**
     * Flag indicating an Konqueror client.
     */
    BROWSER_KONQUEROR: null,

    /**
     * Flag indicating a Mozilla Firefox client.
     */
    BROWSER_FIREFOX: null,

    /**
     * Flag indicating a Microsoft Internet Explorer client.
     */
    BROWSER_INTERNET_EXPLORER: null,

    /**
     * Flag indicating a Google Chrome client.
     */
    BROWSER_CHROME: null,

    /**
     * The major browser version. For Firefox 3.0.6 this would be 3.
     * 
     * @type Number
     */
    BROWSER_VERSION_MAJOR: null,

    /**
     * The minor browser version. For Firefox 3.0.6, this would be 0.
     * 
     * @type Number
     */
    BROWSER_VERSION_MINOR: null,

    /**
     * The major engine version. For Firefox 3.0.6, which uses the Gecko 1.9,
     * this would be 1.
     * 
     * @type Number
     */
    ENGINE_VERSION_MAJOR: null,

    /**
     * The minor engine version. For Firefox 3.0.6, which uses the Gecko 1.9,
     * this would be 9.
     * 
     * @type Number
     */
    ENGINE_VERSION_MINOR: null,

    /**
     * Flag indicating whether the user-agent string contains deceptive
     * information. This is true in the case of Opera, which contains MSIE info
     * in its version string.
     */
    DECEPTIVE_USER_AGENT: null,


    /**
     * Attribute name for CSS float attribute. Varies by browser.
     * @type String
     */
    CSS_FLOAT: "cssFloat",

    /**
     * Flag indicating that offset measurements do not take into account CSS
     * borders around elements.
     * @type Boolean
     */
    MEASURE_OFFSET_EXCLUDES_BORDER: null,

    /**
     * Flag indicating that the CSS "opacity" attribute is not supported.
     * @type Boolean
     */
    NOT_SUPPORTED_CSS_OPACITY: null,
    
    /**
     * Flag indicating that relative table column widths are not supported, 
     * e.g., "*" or "2*".
     * @type Boolean
     */
    NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS: null,
    
    /**
     * Flag indicating that selectionStart/selectionEnd/setSelectionRange() are not
     * supported on text field INPUT elements and TEXTAREA elements.
     * @type Boolean
     */
    NOT_SUPPORTED_INPUT_SELECTION: null,
    
    /**
     * Flag indicating complete lack of support for W3C DOM range API. 
     * @type Boolean
     */
    NOT_SUPPORTED_RANGE: null,

    /**
     * Flag indicating support for "mouseenter" and "mouseleave" events. This is
     * a proprietary IE event, but is necessary to use to control flicker in
     * rollover effects on high-level elements in this browser.
     * @type Boolean
     */
    PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED: null,

    /**
     * Flag indicating support for "selectstart" events.
     * @type Boolean
     */
    PROPRIETARY_EVENT_SELECT_START_SUPPORTED: null,

    /**
     * Flag indicating a DirectX filter is required to render elements with
     * reduced opacity.
     * @type Boolean
     */
    PROPRIETARY_IE_OPACITY_FILTER_REQUIRED: null,

    /**
     * Flag indicating PNG alpha channel effects require the use of a DirectX
     * filter. This filter is dangerous to use, as it can interfere with event
     * handlers registered on the DOM element.
     * @type Boolean
     */
    PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED: null,
    
    /**
     * Flag indicating support for the IE text range API.
     * @type Boolean
     */
    PROPRIETARY_IE_RANGE: null,
    
    /**
     * Flag indicating that keypress events will place charCode value in keyCode property.
     * @type Boolean
     */
    QUIRK_KEY_CODE_IS_CHAR_CODE: null,
    
    /**
     * Flag indicating that keypress events are fired for special keys.
     * @type Boolean
     */
    QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS: null,
    
    /**
     * Flag indicating that keypress events are fired for special keys.
     * @type Boolean
     */
    QUIRK_KEY_DOWN_NOT_FIRED_FOR_SPECIAL_KEYS: null,
    
    /**
     * Flag indicating collapsed borders appear inside a table's rendered rather
     * than around it. For example, a proper rendering for a 2px collapsed
     * border is that one pixel appear inside the table's are and one pixel
     * appear outside of it. The IE browser, for example, simply renders both
     * pixels of the border inside.
     * @type Boolean
     */
    QUIRK_CSS_BORDER_COLLAPSE_INSIDE: null,

    /**
     * Flag indicating that top and bottom or left and right CSS absolute
     * positioning properties may not be used on the same attribute. Virtual
     * positioning should be used in such cases.
     * @type Boolean
     */
    QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY: null,

    /**
     * Flag indicating that setting focus is more reliably accomplished by
     * performing the operation in a separate JavaScript execution context.
     * @type Boolean
     */
    QUIRK_DELAYED_FOCUS_REQUIRED: null,
    
    /**
     * Flag indicating peculiar behavior in Internet Explorer where screen suddenly appears blank after
     * DOM manipulations have been performed.  This is commonly seen when many JavaScript execution contexts
     * are being invoked and possibly performing DOM manipulations.  The exact criteria to trigger this bug
     * has not yet been determined.  It does appear that IE's rendering engine somehow collapses as a result
     * and simply blanks the screen.  Resizing the window and certain DOM modifications will cause the screen's
     * image to be restored.
     * @type Boolean
     */
    QUIRK_IE_BLANK_SCREEN: null,
    
    /**
     * Flag indicating a fundamental issue in Internet Explorer's rendering engine wherein the browser is incapable of correctly
     * sizing/positioning elements unless certain CSS attributes (which should not be necessary) are present.
     * Setting the proprietary "zoom" attribute to a value of '1' can force this browser to properly layout an an element that 
     * sufferes this quirk.
     * See http://msdn.microsoft.com/en-us/library/bb250481.aspx 
     */
    QUIRK_IE_HAS_LAYOUT: null,

    /**
     * Flag indicating DOM updates to SELECT elements may result in their
     * appearance being changed, i.e., listboxes will become select fields.
     * @type Boolean
     */
    QUIRK_IE_SELECT_LIST_DOM_UPDATE: null,

    /**
     * Flag indicating that setting percent widths on SELECT elements may result
     * in undesired behavior, e.g., zero-width rendering.
     * @type Boolean
     */
    QUIRK_IE_SELECT_PERCENT_WIDTH: null,

    /**
     * Flag indicating that SELECT elements do not respect z-index settings.
     * @type Boolean
     */
    QUIRK_IE_SELECT_Z_INDEX: null,
    
    /**
     * Flag indicating an IE browser that incorrectly displays the security warning,
     * "This page contains both secure and nonsecure items. Do you want to display the nonsecure items?".
     * See http://support.microsoft.com/kb/925014
     * @type Boolean
     */
    QUIRK_IE_SECURE_ITEMS: null,

    /**
     * Flag indicating that IE browser does not properly render tables whose
     * widths are set to percent values when scrollbars are present. The
     * scrollbar is not included in the calculation of the container size, thus
     * a 100% wide table will not fit in its container when a vertical scrollbar
     * is present, and will trigger a horizontal scroll bar.
     * @type Boolean
     */
    QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR: null,

    /**
     * Quirk flag indicating that offset measurements on elements whose overflow setting is hidden
     * will be incorrectly reduced by the border size.  Used internally in measuring algorithms.
     * @type Boolean
     */
    QUIRK_MEASURE_OFFSET_HIDDEN_BORDER: null,

    /**
     * Flag indicating a bug in the Opera browser where absolute CSS positioning
     * and offset calculations are incorrectly performed. See
     * http://my.opera.com/community/forums/topic.dml?id=250572
     * @type Boolean
     */
    QUIRK_OPERA_CSS_POSITIONING: null,

    /**
     * Quirk indicating that removing large element hierarchies from the DOM
     * using a single removeChild invocation at the root results in poor
     * performance. Workaround is to iteratively remove smaller hierarchies.
     * @type Boolean
     */
    QUIRK_PERFORMANCE_LARGE_DOM_REMOVE: null,

    /**
     * Flag indicating XML documents being sent via XMLHttpRequest must have
     * text content manually escaped due to bugs in the Webkit render engine.
     * @type Boolean
     */
    QUIRK_WEBKIT_DOM_TEXT_ESCAPE: null,

    /**
     * Flag indicating that table cell widths do not include padding value.
     * @type Boolean
     */
    QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING: null,

    /**
     * Flag indicating that images which not yet been loaded will have size
     * information (width/height values).
     * @type Boolean
     */
    QUIRK_UNLOADED_IMAGE_HAS_SIZE: null,

    /**
     * User-agent string, in lowercase.
     */
    _ua: null,

    /**
     * The user agent string with all non-alpha character sequences replaced
     * with single slashes and with leading/trailing slashes appended. This
     * string can be searched for whole words using indexOf("/example/")
     */
    _uaAlpha: null,
    
    /**
     * Performs initial analysis of environment. Automatically invoked when
     * Core.Web module is initialized.
     */
    _init: function() {
        var browserVersion = null, 
            engineVersion = null, 
            engineId = false;

        this._ua = navigator.userAgent.toLowerCase();
        this._uaAlpha = "/" + this._ua.replace(/[^a-z]+/g, "/") + "/";
        
        // Parse version string for known major browsers, in reverse order of which they are imitated,
        // i.e., Chrome imitates Safari and Gecko, while Mozilla imitates nothing.
        if (this._testUAString("opera")) {
            this.BROWSER_OPERA = engineId = this.ENGINE_PRESTO = true;
            browserVersion = this._parseVersionInfo("opera/");
        } else if (this._testUAString("chrome")) {
            this.BROWSER_CHROME = engineId = this.ENGINE_WEBKIT = true;
            browserVersion = this._parseVersionInfo("chrome/");
        } else if (this._testUAString("safari")) {
            this.BROWSER_SAFARI = engineId = this.ENGINE_WEBKIT = true;
            browserVersion = this._parseVersionInfo("version/");
        } else if (this._testUAString("konqueror")) {
            this.BROWSER_KONQUEROR = engineId = this.ENGINE_KHTML = true;
            browserVersion = this._parseVersionInfo("konqueror/");
        } else if (this._testUAString("firefox")) {
            this.BROWSER_FIREFOX = this.BROWSER_MOZILLA = engineId = this.ENGINE_GECKO = true;
            browserVersion = this._parseVersionInfo("firefox/");
        } else if (this._testUAString("msie")) {
            this.BROWSER_INTERNET_EXPLORER = engineId = this.ENGINE_MSHTML = true;
            // Set engine version to browser version for MSIE/MSHTML.  Unfortunately "Trident" versioning
            // is unpredictable, with the MSIE8 UA string reporting "Trident/4.0" but MSIE6 supposedly using "Trident IV"
            // and MSIE7 supposedly using "Trident V".  We thus go by the suspected MSHTML DLL version, which is equivalent to
            // the IE version.
            engineVersion = browserVersion = this._parseVersionInfo("msie ");
        }
        
        if (!engineId) {
            // Browser/engine not yet identified, attempt to identify by engine.
            if (this._testUAString("presto")) {
                this.ENGINE_PRESTO = true;
            } else if (this._testUAString("webkit")) {
                this.ENGINE_WEBKIT = true;
            } else if (this._testUAString("khtml")) {
                this.ENGINE_KHTML = true;
            } else if (this._testUAString("trident")) {
                this.ENGINE_MSHTML = true;
            } else if (this._testUAString("gecko")) {
                this.BROWSER_MOZILLA = this.ENGINE_GECKO = true;
            }
        }
        
        if (!engineVersion) {
            if (this.ENGINE_PRESTO) {
                engineVersion = this._parseVersionInfo("presto/");
            } else if (this.ENGINE_WEBKIT) {
                engineVersion = this._parseVersionInfo("webkit/");
            } else if (this.ENGINE_GECKO) {
                engineVersion = this._parseVersionInfo("rv:");
                if (!browserVersion) {
                    browserVersion = engineVersion;
                }
            }
        }
        
        if (browserVersion) {
            this.BROWSER_VERSION_MAJOR = browserVersion.major;
            this.BROWSER_VERSION_MINOR = browserVersion.minor;
        }
        if (engineVersion) {
            this.ENGINE_VERSION_MAJOR = engineVersion.major;
            this.ENGINE_VERSION_MINOR = engineVersion.minor;
        }
        
        // Note deceptive user agent fields:
        // - Konqueror and Safari UA fields contain "like Gecko"
        // - Opera UA field typically contains "MSIE"
        // If this flag is set, browser is not GECKO/MSHTML
        this.DECEPTIVE_USER_AGENT = this.BROWSER_OPERA || this.BROWSER_SAFARI || this.BROWSER_CHROME || this.BROWSER_KONQUEROR;
        
        this.MEASURE_OFFSET_EXCLUDES_BORDER = false;
                
        // Set IE Quirk Flags
        if (this.BROWSER_INTERNET_EXPLORER) {
            // Internet Explorer Flags (all versions).
            this.CSS_FLOAT = "styleFloat";
            this.QUIRK_KEY_CODE_IS_CHAR_CODE = true;
            this.QUIRK_IE_SECURE_ITEMS = true;
            this.NOT_SUPPORTED_RANGE = true;
            this.NOT_SUPPORTED_INPUT_SELECTION = true;
            this.PROPRIETARY_IE_RANGE = true;
            this.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED = true;
            this.PROPRIETARY_EVENT_SELECT_START_SUPPORTED = true;
            this.QUIRK_DELAYED_FOCUS_REQUIRED = true;
            this.QUIRK_UNLOADED_IMAGE_HAS_SIZE = true;
            this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
            this.QUIRK_IE_BLANK_SCREEN = true;
            this.QUIRK_IE_HAS_LAYOUT = true;
            
            if (this.BROWSER_VERSION_MAJOR < 8) {
                // Internet Explorer 6 and 7 Flags.
                this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING = true;
                this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
                this.QUIRK_CSS_BORDER_COLLAPSE_INSIDE = true;
                this.NOT_SUPPORTED_CSS_OPACITY = true;
                this.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED = true;
                this.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR = true;
                this.QUIRK_IE_SELECT_PERCENT_WIDTH = true;
                
                if (this.BROWSER_VERSION_MAJOR < 7) {
                    // Internet Explorer 6 Flags.
                    this.QUIRK_IE_SELECT_LIST_DOM_UPDATE = true;
                    this.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY = true;
                    this.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED = true;
                    this.QUIRK_IE_SELECT_Z_INDEX = true;
                    // Enable 'garbage collection' on large associative arrays to avoid memory leak.
                    Core.Arrays.LargeMap.garbageCollectEnabled = true;
                }
            }
        } else if (this.ENGINE_GECKO) {
            this.QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS = true;
            this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
            this.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER = true;
            if (this.BROWSER_FIREFOX) {
                if (this.BROWSER_VERSION_MAJOR < 2) {
                    this.QUIRK_DELAYED_FOCUS_REQUIRED = true;
                }
            } else {
                this.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE = true;
                this.QUIRK_DELAYED_FOCUS_REQUIRED = true;
            }
        } else if (this.ENGINE_PRESTO) {
            this.QUIRK_KEY_CODE_IS_CHAR_CODE = true;
            this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING = true;
            if (this.BROWSER_VERSION_MAJOR == 9 && this.BROWSER_VERSION_MINOR >= 50) {
                this.QUIRK_OPERA_CSS_POSITIONING = true;
            }
            this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS = true;
        } else if (this.ENGINE_WEBKIT) {
            this.MEASURE_OFFSET_EXCLUDES_BORDER = true;
            if (this.ENGINE_VERSION_MAJOR < 526 || (this.ENGINE_VERSION_MAJOR == 526 && this.ENGINE_VERSION_MINOR < 8)) {
                this.QUIRK_WEBKIT_DOM_TEXT_ESCAPE = true; //https://bugs.webkit.org/show_bug.cgi?id=18421, fixed in 526.8
            }
        }
    },
    
    /**
     * Parses version information from user agent string. The text argument specifies
     * the string that prefixes the version info in the ua string (ie 'version/' for Safari for example).
     * <p>
     * The major version is retrieved by getting the int between text and the first dot. The minor version
     * is retrieved by getting the int between the first dot and the first non-numeric character that appears
     * after the dot, or the end of the ua string (whichever comes first).
     * If the ua string does not supply a minor version, the minor version is assumed to be 0.
     *
     * @param ua the lower cased user agent string
     * @param searchString the text that prefixes the version info (version info must be the first appearance of 
     *          this text in the ua string)
     */
    _parseVersionInfo: function(searchString) {
        var version = { };
        
        var ix1 = this._ua.indexOf(searchString);
        if (ix1 == -1) {
            return;
        }
        
        var ix2 = this._ua.indexOf(".", ix1);
        var ix3 = this._ua.length;
        
        if (ix2 == -1) {
            ix2 = this._ua.length;
        } else {
            // search for the first non-number character after the dot
            for (var i = ix2 + 1; i < this._ua.length; i++) {
                var c = this._ua.charAt(i);
                if (isNaN(c)) {
                    ix3 = i;
                    break;
                }
            }
        }
        
        version.major = parseInt(this._ua.substring(ix1 + searchString.length, ix2), 10);
        if (ix2 == this._ua.length) {
            version.minor = 0;
        } else {
            version.minor = parseInt(this._ua.substring(ix2 + 1, ix3), 10);
        }
        
        return version;
    },
    
    _testUAString: function(browser) {
        return this._uaAlpha.indexOf("/" + browser + "/") != -1;
    }
};

/**
 * Event Processing System namespace. The static methods in this object provide
 * a standard framework for handling DOM events across often-incompatible
 * browser platforms.
 * <p>
 * <b>Event Propagation:</b> Capturing listeners are notified of events first,
 * followed by bubbling listeners. During the capturing phase of event firing,
 * listeners on higher-level DOM elements are notified before the lower-level
 * DOM elements. During the bubbling phase of event firing, lower-level DOM
 * elements are notified before higher-level DOM elements.
 * <p>
 * For example, given the DOM hierarchy
 * <code>&lt;body&gt;&lt;div&gt;&lt;span&gt;&lt;/span&gt;&lt;/div&gt;&lt;/body&gt;</code>,
 * with click listeners registered for both capturing and bubbling phases on all
 * elements, the listener notification order for a click on the
 * <code>&lt;span&gt;</code> element would be as folows:
 * <ol>
 * <li>Notify capturing listener of <code>&lt;body&gt;</code> element.</li>
 * <li>Notify capturing listener of <code>&lt;div&gt;</code> element.</li>
 * <li>Notify capturing listener of <code>&lt;span&gt;</code> element.</li>
 * <li>Notify bubbling listener of <code>&lt;span&gt;</code> element.</li>
 * <li>Notify bubbling listener of <code>&lt;div&gt;</code> element.</li>
 * <li>Notify bubbling listener of <code>&lt;body&gt;</code> element.</li>
 * </ol>
 * <b>Listener Return Values:</b> Listeners should return a value of true if
 * they wish to continue to allow propogation of an event, and false if they do
 * not.
 * <p>
 * <b>Capturing/Bubbling Listeners:</b> This implementation allows for the
 * registration of both capturing and bubbling event listeners on all browser
 * platforms, including Internet Explorer, even though Internet Explorer does
 * not inhererntly support such listeners. This is accomplished by the Event
 * system adding a layer of abstraction between event registration and the
 * browser, and then invoking event listeners itself.
 * <p>
 * This implementation relies on the fact that all event listeners will be 
 * registered through it.  The implementation is in fact internally registering only
 * bubbling-phase event listeners on the DOM.  Thus, if other event listeners are 
 * registered directly on the DOM, scenarios may occur such as a direct-registered
 * bubbling listener receiving an event before a Core.Web.Event-registered capturing
 * listener.  This is not necessarily a critical issue, but the developer should
 * be aware of it. 
 * 
 * @class
 */
Core.Web.Event = {
    
    /**
     * Provides utilities for restricting selection of DOM elements.  These are necessary as double click and drag
     * events will cause/begin undesired selections.
     */
    Selection: {

        /**
         * Adds a listener to an element that will prevent text selection / highlighting as a result of mouse clicks.
         * The disable() method should be invoked when the element is to be disposed.
         * The event is registered using the event processor, so invoking Core.Web.Event.removeAll() on its
         * element will also dispose it.
         *
         * @param {Element} element the element on which to forbid text selection
         * @see Core.Web.Event.Selection#enable
         */
        disable: function(element) {
            Core.Web.Event.add(element, "mousedown", Core.Web.Event.Selection._disposeEvent, false);
            if (Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
                Core.Web.Event.add(element, "selectstart", Core.Web.Event.Selection._disposeEvent, false);
            }
        },
        
        /**
         * Selection denial listener implementation.
         * 
         * @param e the selection/click event
         */
        _disposeEvent: function(e) {
            Core.Web.DOM.preventEventDefault(e);
        },
    
        /**
         * Removes a selection denial listener.
         * 
         * @param element the element from which to remove the selection denial listener
         * @see Core.Web.Event.Selection#enable
         */
        enable: function(element) {
            Core.Web.Event.remove(element, "mousedown", Core.Web.Event.Selection._disposeEvent, false);
            if (Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED) {
                Core.Web.Event.remove(element, "selectstart", Core.Web.Event.Selection._disposeEvent, false);
            }
        }
    },
    
    /**
     * Next available sequentially assigned element identifier.
     * Elements are assigned unique identifiers to enable mapping between 
     * elements and lists of registered event listeners.
     *
     * @type Integer
     */
    _nextId: 0,
    
    /**
     * Current listener count.
     */
    _listenerCount: 0,
    
    /**
     * Flag to display listener count every time an event is fired.  Enable this flag to check for listener leaks.
     */
    debugListenerCount: false,
    
    /**
     * Mapping between element ids and ListenerLists containing listeners to invoke during capturing phase.
     * @type Core.Arrays.LargeMap
     */
    _capturingListenerMap: new Core.Arrays.LargeMap(),
    
    /**
     * Mapping between element ids and ListenerLists containing listeners to invoke during bubbling phase.
     * @type Core.Arrays.LargeMap
     */
    _bubblingListenerMap: new Core.Arrays.LargeMap(),
    
    /**
     * Registers an event handler.
     *
     * @param {Element} element the DOM element on which to add the event handler
     * @param {String} eventType the DOM event type
     * @param {Function} eventTarget the event handler to invoke when the event is fired
     * @param {Boolean} capture true to fire the event during the capturing phase, false to fire the event during
     *        the bubbling phase
     */
    add: function(element, eventType, eventTarget, capture) {
        // Assign event processor element id to element if not present.
        if (!element.__eventProcessorId) {
            element.__eventProcessorId = ++Core.Web.Event._nextId;
        }
    
        var listenerList;
        
        // Determine the Core.ListenerList to which the listener should be added.
        if (element.__eventProcessorId == Core.Web.Event._lastId && 
                capture == Core.Web.Event._lastCapture) {
            // If the 'element' and 'capture' properties are identical to those specified on the prior invocation
            // of this method, the correct listener list is stored in the '_lastListenerList' property. 
            listenerList = Core.Web.Event._lastListenerList; 
        } else {
            // Obtain correct id->ListenerList mapping based on capture parameter.
            var listenerMap = capture ? Core.Web.Event._capturingListenerMap : Core.Web.Event._bubblingListenerMap;
            
            // Obtain ListenerList based on element id.                              
            listenerList = listenerMap.map[element.__eventProcessorId];
            if (!listenerList) {
                // Create new ListenerList if none exists.
                listenerList = new Core.ListenerList();
                listenerMap.map[element.__eventProcessorId] = listenerList;
            }
            
            // Cache element's event processor id, capture parameter value, and listener list.
            // If the same element/capture properties are provided in the next call (which commonly occurs),
            // the lookup operation will be unnecessary.
            Core.Web.Event._lastId = element.__eventProcessorId;
            Core.Web.Event._lastCapture = capture;
            Core.Web.Event._lastListenerList = listenerList;
        }
    
        // Register event listener on DOM element.
        if (!listenerList.hasListeners(eventType)) {
            Core.Web.DOM.addEventListener(element, eventType, Core.Web.Event._processEvent, false);
            ++Core.Web.Event._listenerCount;
        }

        // Add event handler to the ListenerList.
        listenerList.addListener(eventType, eventTarget);
    },
    
    /**
     * Listener method which is invoked when ANY event registered with the event processor occurs.
     * 
     * @param {Event} e 
     */
    _processEvent: function(e) {
        if (Core.Web.Event.debugListenerCount) {
            Core.Debug.consoleWrite("Core.Web.Event listener count: " + Core.Web.Event._listenerCount);        
        }

        e = e ? e : window.event;
        
        if (!e.target && e.srcElement) {
            // The Internet Explorer event model stores the target element in the 'srcElement' property of an event.
            // Modify the event such the target is retrievable using the W3C DOM Level 2 specified property 'target'.
            e.target = e.srcElement;
        }

        // Establish array containing elements ancestry, with index 0 containing 
        // the element and the last index containing its most distant ancestor.  
        // Only record elements that have ids.
        var elementAncestry = [];
        var targetElement = e.target;
        while (targetElement) {
            if (targetElement.__eventProcessorId) { // Element Node with identifier.
                elementAncestry.push(targetElement);
            }
            targetElement = targetElement.parentNode;
        }

        var listenerList, i, propagate = true;

        // Fire event to capturing listeners.
        for (i = elementAncestry.length - 1; i >= 0; --i) {
            listenerList = Core.Web.Event._capturingListenerMap.map[elementAncestry[i].__eventProcessorId];
            if (listenerList) {
                // Set registered target on event.
                e.registeredTarget = elementAncestry[i];
                if (!listenerList.fireEvent(e)) {
                    // Stop propagation if requested.
                    propagate = false;
                    break;
                }
            }
        }

        if (propagate) {
            // Fire event to bubbling listeners.
            for (i = 0; i < elementAncestry.length; ++i) {
                listenerList = Core.Web.Event._bubblingListenerMap.map[elementAncestry[i].__eventProcessorId];
                if (listenerList) {
                    // Set registered target on event.
                    e.registeredTarget = elementAncestry[i];
                    if (!listenerList.fireEvent(e)) {
                        // Stop propagation if requested.
                        break;
                    }
                }
            }
        }

        // Inform DOM to stop propagation of event, in all cases.
        // Event will otherwise be re-processed by higher-level elements registered with the event processor.
        Core.Web.DOM.stopEventPropagation(e);
    },
    
    /**
     * Unregisters an event handler.
     * 
     * CAUTION: If you are unregistering an event listener created with Core.method(), please see the documentation for
     * Core.method() and note that a new closure-wrapped method is returned each time Core.method() is invoked.
     * Thus calling removeListener(Core.method(this, this,_someListener)) will NOT remove an existing listener.
     * The solution to this issue is to retain a reference to Core.method() wrapped listeners within the object
     * that will register and unregister them.
     * 
     * If you are removing all listeners registered for a particular element (e.g., one which is being disposed)
     * it is more efficient to simply invoke removeAll().
     *
     * @param {Element} element the DOM element on which to add the event handler
     * @param {String} eventType the DOM event type
     * @param {Function} eventTarget the function to invoke when the event is fired
     * @param {Boolean} capture true to fire the event during the capturing phase, false to fire the event during
     *        the bubbling phase
     */
    remove: function(element, eventType, eventTarget, capture) {
        Core.Web.Event._lastId = null;
        
        if (!element.__eventProcessorId) {
            return;
        }
    
        // Obtain correct id->ListenerList mapping based on capture parameter.
        var listenerMap = capture ? Core.Web.Event._capturingListenerMap : Core.Web.Event._bubblingListenerMap;
    
        // Obtain ListenerList based on element id.                              
        var listenerList = listenerMap.map[element.__eventProcessorId];
        if (listenerList) {
            // Remove event handler from the ListenerList.
            listenerList.removeListener(eventType, eventTarget);
            
            if (listenerList.isEmpty()) {
                listenerMap.remove(element.__eventProcessorId);
            }

            // Unregister event listener on DOM element if all listeners have been removed.
            if (!listenerList.hasListeners(eventType)) {
                Core.Web.DOM.removeEventListener(element, eventType, Core.Web.Event._processEvent, false);
                --Core.Web.Event._listenerCount;
            }
        }
    },
    
    /**
     * Unregister all event handlers from a specific element.
     * Use of this operation is recommended when disposing of components, it is
     * more efficient than removing listeners individually and guarantees proper clean-up.
     * 
     * @param {Element} element the element
     */
    removeAll: function(element) {
        Core.Web.Event._lastId = null;
        if (!element.__eventProcessorId) {
            return;
        }
        Core.Web.Event._removeAllImpl(element, Core.Web.Event._capturingListenerMap);
        Core.Web.Event._removeAllImpl(element, Core.Web.Event._bubblingListenerMap);
    },
    
    /**
     * Implementation method for removeAll().
     * Removes all capturing or bubbling listeners from a specific element
     * 
     * @param {Element} element the element
     * @param {Core.Arrays.LargeMap} listenerMap the map from which the listeners should be removed, either
     *        Core.Web.Event._capturingListenerMap or Core.Web.Event._bubblingListenerMap
     */
    _removeAllImpl: function(element, listenerMap) {
        var listenerList = listenerMap.map[element.__eventProcessorId];
        if (!listenerList) {
            return;
        }
    
        var types = listenerList.getListenerTypes();
        for (var i = 0; i < types.length; ++i) {
            Core.Web.DOM.removeEventListener(element, types[i], Core.Web.Event._processEvent, false);
            --Core.Web.Event._listenerCount;
        }
        
        listenerMap.remove(element.__eventProcessorId);
    },
    
    /**
     * toString() implementation for debugging purposes.
     * Displays contents of capturing and bubbling listener maps.
     * 
     * @return string representation of listener maps
     * @type String
     */
    toString: function() {
        return "Capturing: " + Core.Web.Event._capturingListenerMap + "\n" + "Bubbling: " + Core.Web.Event._bubblingListenerMap;
    }
};

/**
 * An HTTP connection to the hosting server.  This method provides a cross
 * platform wrapper for XMLHttpRequest and additionally allows method
 * reference-based listener registration.  
 */
Core.Web.HttpConnection = Core.extend({

    /** The URL. */
    _url: null,
    
    /** The request content type. */
    _contentType: null,
    
    /** The request method. */
    _method: null,
    
    /** The message content object. */
    _messageObject: null,
    
    /** Listener storage facility. */
    _listenerList: null,
    
    /** Disposed state. */
    _disposed: false,
    
    /** Browser XMLHttpRequest object. */
    _xmlHttpRequest: null,
    
    /** Request header value map. */
    _requestHeaders: null,

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
     */
    $construct: function(url, method, messageObject, contentType) {
        this._url = url;
        this._contentType = contentType;
        this._method = method;
        if (Core.Web.Env.QUIRK_WEBKIT_DOM_TEXT_ESCAPE && messageObject instanceof Document) {
            this._preprocessWebkitDOM(messageObject.documentElement);
        }
        
        this._messageObject = messageObject;
        this._listenerList = new Core.ListenerList();
    },
    
    /**
     * Preprocesses outgoing requests to Webkit (invoked when appropriate quirk is detected).
     * All less than, greater than, and ampersands are replaced with escaped values, as this render engine
     * is broken in this regard and will otherwise fail. Recursively invoked on nodes, starting with
     * document element.
     * 
     * @param {Node} node the node to process
     */
    _preprocessWebkitDOM: function(node) {
        if (node.nodeType == 3) {
            var value = node.data;
            value = value.replace(/&/g, "&amp;");
            value = value.replace(/</g, "&lt;");
            value = value.replace(/>/g, "&gt;");
            node.data = value;
        } else {
            var child = node.firstChild;
            while (child) {
                this._preprocessWebkitDOM(child);
                child = child.nextSibling;
            }
        }
    },
    
    /**
     * Adds a response listener to be notified when a response is received from the connection.
     * 
     * @param {Function} l the listener to add
     */
    addResponseListener: function(l) {
        this._listenerList.addListener("response", l);
    },
    
    /**
     * Executes the HTTP connection.
     * This method will return before the HTTP connection has received a response.
     */
    connect: function() {
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

        // Set headers.
        if (this._requestHeaders && (usingActiveXObject || this._xmlHttpRequest.setRequestHeader)) {
            for(var h in this._requestHeaders) {
                try {
                    this._xmlHttpRequest.setRequestHeader(h, this._requestHeaders[h]);
                } catch (e) {
                    throw new Error("Failed to set header \"" + h + "\"");
                }
            }
        }
        
        // Set Content-Type, if supplied.
        if (this._contentType && (usingActiveXObject || this._xmlHttpRequest.setRequestHeader)) {
            this._xmlHttpRequest.setRequestHeader("Content-Type", this._contentType);
        }

        // Execute request.
        this._xmlHttpRequest.send(this._messageObject ? this._messageObject : null);
    },
    
    /**
     * Disposes of the connection.  This method must be invoked when the connection 
     * will no longer be used/processed.
     */
    dispose: function() {
        this._listenerList = null;
        this._messageObject = null;
        this._xmlHttpRequest = null;
        this._disposed = true;
        this._requestHeaders = null;
    },
    
    /**
     * Returns a header from the received response.
     * @param {String} header the header to retrieve
     */
    getResponseHeader: function(header) {
        return this._xmlHttpRequest ? this._xmlHttpRequest.getResponseHeader(header) : null;
    },
    
    /**
     * Returns all the headers of the response.
     * @param {String} header the header to retrieve
     */
    getAllResponseHeaders: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.getAllResponseHeaders() : null;
    },
    
    /**
     * Returns the response status code of the HTTP connection, if available.
     * 
     * @return the response status code
     * @type Integer
     */
    getStatus: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.status : null;
    },
    
    /**
     * Returns the response as text.
     * This method may only be invoked from a response handler.
     *
     * @return the response, as text
     * @type String
     */
    getResponseText: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.responseText : null;
    },
    
    /**
     * Returns the response as an XML DOM.
     * This method may only be invoked from a response handler.
     *
     * @return the response, as an XML DOM
     * @type Document
     */
    getResponseXml: function() {
        return this._xmlHttpRequest ? this._xmlHttpRequest.responseXML : null;
    },
    
    /**
     * Event listener for <code>readystatechange</code> events received from
     * the <code>XMLHttpRequest</code>.
     */
    _processReadyStateChange: function() {
        if (this._disposed) {
            return;
        }
        
        if (this._xmlHttpRequest.readyState == 4) {
            var responseEvent;
            try {
                // 0 included as a valid response code for non-served applications.
                var valid = !this._xmlHttpRequest.status ||  
                        (this._xmlHttpRequest.status >= 200 && this._xmlHttpRequest.status <= 299);
                responseEvent = {type: "response", source: this, valid: valid};
            } catch (ex) {
                responseEvent = {type: "response", source: this, valid: false, exception: ex};
            }
            
            Core.Web.Scheduler.run(Core.method(this, function() {
                this._listenerList.fireEvent(responseEvent);
                this.dispose();
            }));
        }
    },
    
    /**
     * Removes a response listener to be notified when a response is received from the connection.
     * 
     * @param {Function} l the listener to remove
     */
    removeResponseListener: function(l) {
        this._listenerList.removeListener("response", l);
    },
    
    /**
     * Sets a header in the request.
     * 
     * @param {String} header the header to retrieve
     * @param {String} value the value of the header
     */
    setRequestHeader: function(header, value) {
        if (!this._requestHeaders) {
            this._requestHeaders = { };
        } 
        this._requestHeaders[header] = value;
    }
});

/**
 * Image-related utilities.
 * @class
 */
Core.Web.Image = {
    
    /**
     * Work object for monitorImageLoading() method.
     */
    _Monitor: Core.extend({

        /** Reference to _processImageLoad method. */
        _processImageLoadRef: null,
        
        /** Currently enqueued runnable. */
        _queuedRunnable: null,
        
        /** Listener to notify of successful image loadings. */
        _listener: null,
        
        /** Minimum Listener callback interval. */
        _interval: null,
        
        /** The number of images to be loaded. */
        _count: 0,
        
        /**
         * Creates a new image monitor.
         * 
         * @param {Element} element the root element which may (or may not) contain IMG elements
         * @param {Function} listener the method to invoke when images are loaded
         * @param {Number} interval the minimum time interval at which to notify the listener of successfully loaded images
         */
        $construct: function(element, listener, interval) {
            this._listener = listener;
            this._interval = interval || 250;
            this._processImageLoadRef = Core.method(this, this._processImageLoad);
            var imgs = element.getElementsByTagName("img");
            this._count = imgs.length;
            for (var i = 0; i < this._count; ++i) {
                if (!imgs[i].complete && (Core.Web.Env.QUIRK_UNLOADED_IMAGE_HAS_SIZE || 
                        (!imgs[i].height && !imgs[i].style.height))) {
                    Core.Web.DOM.addEventListener(imgs[i], "load", this._processImageLoadRef, false);
                }
            }
        },
        
        /**
         * Process an image loading event.
         * 
         * @param e the event object
         */
        _processImageLoad: function(e) {
            e = e ? e : window.event;
            Core.Web.DOM.removeEventListener(Core.Web.DOM.getEventTarget(e), "load", this._processImageLoadRef, false);
            --this._count;
            
            if (this._queuedRunnable && this._count === 0) {
                Core.Web.Scheduler.remove(this._queuedRunnable);
                this._queuedRunnable = null;
            }
            
            if (!this._queuedRunnable) {
                this._queuedRunnable = Core.Web.Scheduler.run(Core.method(this, function() {
                    this._queuedRunnable = null;
                    this._listener();
                }), this._count === 0 ? 0 : this._interval);
            }
        }
    }),
    
    /**
     * Registers a listener to receive notifications as image size information becomes available.
     * Registers "load" listeners on images which are children of the specified element, invoking the specified listener
     * zero or more times as the images load.  If all images are already loaded (e.g., they were cached) or have specified 
     * sizes, the listener may never be invoked.  If the images take some time to load, the listener may be invoked multiple times.
     * 
     * @param {Element} element the root element which may (or may not) contain IMG elements
     * @param {Function} l the method to invoke when images are loaded.
     * @param {Number} interval the maximum time interval at which the listener should be invoked (default value is 50ms, 
     *        the listener will be invoked immediately once all images have loaded)
     */
    monitor: function(element, l, interval) {
        var monitor = new Core.Web.Image._Monitor(element, l, interval);
    }
};

Core.Web.Key = {
    
    _KEY_TABLES: {
        
        GECKO: { 
            59: 186, 
            61: 187,
            109: 189
        },
        
        MAC_GECKO: {
        },
        
        PRESTO: {
            59: 186,
            61: 187,
            44: 188,
            45: 189,
            46: 190,
            47: 191,
            96: 192,
            91: 219,
            92: 220,
            93: 221,
            39: 222
        },
        
        WEBKIT: {
        }
    },
    
    _keyTable: null,
    
    _loadKeyTable: function() {
        if (Core.Web.Env.ENGINE_GECKO) {
            this._keyTable = this._KEY_TABLES.GECKO;
        } else if(Core.Web.Env.ENGINE_PRESTO) {
            this._keyTable = this._KEY_TABLES.PRESTO;
        } else {
            this._keyTable = { };
        }
    },

    translateKeyCode: function(keyCode) {
        if (!this._keyTable) {
            this._loadKeyTable();
        }
        return this._keyTable[keyCode] || keyCode;
    }
};

/**
 * Utilities for dynamically loading additional script libraries.
 * @class
 */
Core.Web.Library = {

    /**
     * Set of loaded libraries (keys are library urls, value is true when library has been loaded).
     */
    _loadedLibraries: { },
    
    /**
     * Determined source code line number of eval() library load statement (useful for debugging on browsers which do not 
     * properly report line numbers for evaluated scripts).
     * @type Number
     */
    evalLine: null,
    
    /**
     * A representation of a group of libraries to be loaded at the same time.
     * Libraries will be retrieved asynchronously, and then installed once ALL the libraries have
     * been retrieved.  Installation will be done in the order in which the add() method was
     * invoked to add libraries to the group (without regard for the order in which the 
     * HTTP server returns the library code).
     * 
     * A "load" event will be fired (listeners registered via <code>addLoadListener()</code>) when the group
     * has completed loading and the libraries have been installed.  The "success" property of the fired event
     * will be set to true in the event that all libraries were successfully loaded, and false otherwise.
     * In the event of a library loading failure, the following properties will be available in the event:
     * <ul>
     *  <li><code>url</code>: the URL of the failed library.</li>
     *  <li><code>ex</code>: the exception which occurred when attempting to load the library.</li>
     *  <li><code>cancel</code>: a boolean flag, initially set to false, which may be set to true to avoid
     *   having the library loader throw an exception for the failure.  If unset, the exception will be thrown.</li>
     * </ul>
     */
    Group: Core.extend({
    
        /** Listener storage. */
        _listenerList: null,
        
        /**
         * Array of libraries to be loaded.
         * @type Array
         */
        _libraries: null,
        
        /** Number of libraries which have been loaded. */
        _loadedCount: 0,
        
        /** Number of libraries to load. */
        _totalCount: 0,
    
        /**
         * Creates a new library group.
         * @constructor 
         */
        $construct: function() {
            this._listenerList = new Core.ListenerList();
            this._libraries = [];
        },
        
        /**
         * Adds a library to the library group.
         * Libraries which have previously been loaded will not be loaded again.
         *
         * @param {String} libraryUrl the URL from which to retrieve the library.
         */
        add: function(libraryUrl) {
            if (Core.Web.Library._loadedLibraries[libraryUrl]) {
                // Library already loaded: ignore.
                return;
            }
            
            var libraryItem = new Core.Web.Library._Item(this, libraryUrl);
            this._libraries.push(libraryItem);
        },
        
        /**
         * Adds a listener to be notified when all libraries in the group have been loaded.
         *
         * @param {Function} l the listener to add
         */
        addLoadListener: function(l) {
            this._listenerList.addListener("load", l);
        },
        
        /**
         * Determines if this library group contains any new (not previously loaded)
         * libraries.
         * 
         * @return true if any new libraries exist
         * @type Boolean
         */
        hasNewLibraries: function() {
            return this._libraries.length > 0;
        },
        
        /**
         * Installs all libraries in the group.
         * This method is invoked once all libraries have been successfully
         * retrieved.  It will invoke any registered load listeners
         * once the libraries have been installed.
         */
        _install: function() {
            for (var i = 0; i < this._libraries.length; ++i) {
                try {
                    this._libraries[i]._install();
                } catch (ex) {
                    var e = {
                        type: "load", 
                        source: this, 
                        success: false, 
                        ex: ex, 
                        url: this._libraries[i]._url,
                        cancel: false
                    };
                    try {
                        this._listenerList.fireEvent(e);
                    } finally {
                        if (!e.cancel) {
                            throw new Error("Exception installing library \"" + this._libraries[i]._url + "\"; " + ex);
                        }
                    }
                }
            }
            this._listenerList.fireEvent({type: "load", source: this, success: true});
        },
        
        /**
         * Event listener invoked when a single library has been successfully retrieved.
         * When all libraries have been retrieved, this method will invoke _install().
         */
        _notifyRetrieved: function() {
            ++this._loadedCount;
            if (this._loadedCount == this._totalCount) {
                this._install();
            }
        },
        
        /**
         * Initializes library loading.  When this method is invoked
         * the libraries will be asynchronously loaded.  This method
         * will return before the libraries have been loaded.
         * Once this method has been invoked, add() may no longer
         * be invoked.
         */
        load: function() {
            this._totalCount = this._libraries.length;
            for (var i = 0; i < this._libraries.length; ++i) {
                this._libraries[i]._retrieve();
            }
        },
        
        /**
         * Removes a listener from being notified when all libraries in the group have been loaded.
         *
         * @param {Function} l the listener to remove
         */
        removeLoadListener: function(l) {
            this._listenerList.removeListener("load", l);
        }
    }),

    /**
     * Representation of a single library to be loaded within a group
     */    
    _Item: Core.extend({
    
        /** URL Of library to load. */
        _url: null,
        
        /** Containing library group. */
        _group: null,
        
        /** 
         * Loaded library content (set when retrieved). 
         * @type String
         */
        _content: null,
    
        /**
         * Creates a new library item.
         * 
         * @param {Core.Web.Library.Group} group the library group in which the item is contained
         * @param {String} url the URL from which the library may be retrieved
         * @constructor
         */
        $construct: function(group, url) {
            this._url = url;
            this._group = group;
        },
        
        /**
         * Event listener for response from the HttpConnection used to retrieve the library.
         * 
         * @param e the event
         */
        _retrieveListener: function(e) {
            if (!e.valid) {
                throw new Error("Invalid HTTP response retrieving library \"" + this._url + 
                        "\", received status: " + e.source.getStatus());
            }
            this._content = e.source.getResponseText();
            this._group._notifyRetrieved();
        },
        
        /**
         * Installs the library.
         * The library must have been loaded before invoking this method.
         */
        _install: function() {
            if (Core.Web.Library._loadedLibraries[this._url]) {
                // If library was already loaded by another invocation, do not load it again.
                return;
            }
            Core.Web.Library._loadedLibraries[this._url] = true;
            if (this._content == null) {
                throw new Error("Attempt to install library when no content has been loaded.");
            }
            
            // Execute content to install library.
            Core.Web.Library.evalLine = new Error().lineNumber + 1;
            eval(this._content);
        },
        
        /**
         * Asynchronously retrieves the library.
         * This method will invoke the retrieve listener when the library has been completed,
         * it will return before the library has been retrieved.
         */
        _retrieve: function() {
            var conn = new Core.Web.HttpConnection(this._url, "GET");
            conn.addResponseListener(Core.method(this, this._retrieveListener));
            conn.connect();
        }
    }),
    
    /**
     * Loads required libraries and then executes a function.
     * This is a convenience method for use by applications that
     * automatically creates a Group and invokes the specified function
     * once the libraries have loaded.
     * This operation is asynchronous, this method will return before the specified function has been invoked.
     * Any libraries which have already been loaded will NOT be re-loaded.
     *
     * @param {Array} requiredLibraries the URLs of the libraries which must be loaded before the function can execute
     * @param {Function} f the function to execute
     */
    exec: function(requiredLibraries, f) {
        var group = null;
        for (var i = 0; i < requiredLibraries.length; ++i) {
            if (!Core.Web.Library._loadedLibraries[requiredLibraries[i]]) {
                if (group == null) {
                    group = new Core.Web.Library.Group();
                }
                group.add(requiredLibraries[i]);
            }
        }
        
        if (group == null) {
            Core.Web.Scheduler.run(f);
            return;
        }
        
        group.addLoadListener(f);
        group.load();
    }
};

/**
 * Namespace for measuring-related operations.
 * @class
 */
Core.Web.Measure = {

    _scrollElements: ["div", "body"],

    /** Size of one inch in horizontal pixels. */
    _hInch: 96,
    
    /** Size of one inch in vertical pixels. */
    _vInch: 96,
    
    /** Size of one 'ex' in horizontal pixels. */
    _hEx: 7,
    
    /** Size of one 'ex' in vertical pixels. */
    _vEx: 7,
    
    /** Size of one 'em' in horizontal pixels. */
    _hEm: 13.3333,
    
    /** Size of one 'em' in vertical pixels. */
    _vEm: 13.3333,
    
    /** Estimated scroll bar width. */
    SCROLL_WIDTH: 17,
    
    /** Estimated scroll bar height. */
    SCROLL_HEIGHT: 17,
    
    _PARSER: /^(-?\d+(?:\.\d+)?)(.+)?$/,

    /**
     * Converts any non-relative extent value to pixels.  Returns null in the case of a percentage extent.
     * 
     * @param {String} value a unitized extent value, e.g., "2px", "5em", etc.
     * @param {Boolean} horizontal a flag indicating whether the extent is horizontal (true) or vertical (false)
     * @return the pixel value (may have a fractional part)
     * @type Number
     */
    extentToPixels: function(extent, horizontal) {
        var parts = this._PARSER.exec(extent);
        if (!parts) {
            throw new Error("Invalid Extent: " + extent);
        }
        var value = parseFloat(parts[1]);
        var units = parts[2] ? parts[2] : "px";

        if (!units || units == "px") {
            return value;
        }
        var dpi = horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch;
        switch (units) {
        case "%":  return null;
        case "in": return value * (horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch);
        case "cm": return value * (horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 2.54;
        case "mm": return value * (horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 25.4;
        case "pt": return value * (horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 72;
        case "pc": return value * (horizontal ? Core.Web.Measure._hInch : Core.Web.Measure._vInch) / 6;
        case "em": return value * (horizontal ? Core.Web.Measure._hEm   : Core.Web.Measure._vEm);
        case "ex": return value * (horizontal ? Core.Web.Measure._hEx   : Core.Web.Measure._vEx);
        }
    },

    /**
     * Updates internal measures used in converting length units 
     * (e.g., in, mm, ex, and em) to pixels.
     * Automatically invoked when Core.Web module is initialized.
     */
    _calculateExtentSizes: function() {
        var containerElement = document.getElementsByTagName("body")[0];
    
        var inchDiv4 = document.createElement("div");
        inchDiv4.style.width = "4in";
        inchDiv4.style.height = "4in";
        containerElement.appendChild(inchDiv4);
        Core.Web.Measure._hInch = inchDiv4.offsetWidth / 4;
        Core.Web.Measure._vInch = inchDiv4.offsetHeight / 4;
        containerElement.removeChild(inchDiv4);
        
        var emDiv24 = document.createElement("div");
        emDiv24.style.width = "24em";
        emDiv24.style.height = "24em";
        containerElement.appendChild(emDiv24);
        Core.Web.Measure._hEm = emDiv24.offsetWidth / 24;
        Core.Web.Measure._vEm = emDiv24.offsetHeight / 24;
        containerElement.removeChild(emDiv24);
        
        var exDiv24 = document.createElement("div");
        exDiv24.style.width = "24ex";
        exDiv24.style.height = "24ex";
        containerElement.appendChild(exDiv24);
        Core.Web.Measure._hEx = exDiv24.offsetWidth / 24;
        Core.Web.Measure._vEx = exDiv24.offsetHeight / 24;
        containerElement.removeChild(exDiv24);
        
        var scrollDiv = document.createElement("div");
        scrollDiv.style.cssText = "width:500px;height:100px;overflow:auto;";
        var largeDiv = document.createElement("div");
        largeDiv.style.cssText = "width:100px;height:200px;";
        scrollDiv.appendChild(largeDiv);
        var testDiv = document.createElement("div");
        testDiv.style.cssText = "width:100%;height:10px;";
        scrollDiv.appendChild(testDiv);
        containerElement.appendChild(scrollDiv);
        var measuredWidth = 500 - testDiv.offsetWidth;
        if (measuredWidth) {
            Core.Web.Measure.SCROLL_WIDTH = Core.Web.Measure.SCROLL_HEIGHT = measuredWidth;
        }
        containerElement.removeChild(scrollDiv);
    },
    
    /**
     * Measures the scrollbar offset of an element, including any
     * scroll-bar related offsets of its ancestors.
     * 
     * @param element the element to measure
     * @return the offset data, with 'left' and 'top' properties specifying the offset amounts
     * @type Object
     */
    _getScrollOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
            if (element.scrollLeft || element.scrollTop) {
                valueT += element.scrollTop  || 0;
                valueL += element.scrollLeft || 0; 
            }
            element = element.offsetParent;
        } while (element);
        return { left: valueL, top: valueT };
    },
    
    /**
     * Measures the cumulative offset of an element.
     * 
     * @param element the element to measure
     * @return the offset data, with 'left' and 'top' properties specifying the offset amounts
     * @type Object
     */
    _getCumulativeOffset: function(element) {
        var valueT = 0, 
            valueL = 0,
            init = true;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            if (!init && Core.Web.Env.MEASURE_OFFSET_EXCLUDES_BORDER) {
                if (element.style.borderLeftWidth && element.style.borderLeftStyle != "none") {
                    var borderLeft = Core.Web.Measure.extentToPixels(element.style.borderLeftWidth, true);
                    valueL += borderLeft;
                    if (Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER && element.style.overflow == "hidden") {
                        valueL += borderLeft;
                    }
                }
                if (element.style.borderTopWidth && element.style.borderTopStyle != "none") {
                    var borderTop = Core.Web.Measure.extentToPixels(element.style.borderTopWidth, false);
                    valueT += borderTop;
                    if (Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER && element.style.overflow == "hidden") {
                        valueT += borderTop;
                    }
                }
            }
            init = false;
            element = element.offsetParent;
        } while (element);
        return { left: valueL, top: valueT };
    },

    /**
     * Measures the boundaries of an element,i.e., its left and top position and/or
     * width and height.  If the element is not attached to the rendered DOM hierarchy,
     * the element will be temporarily removed from its hierarchy and placed in an
     * off-screen buffer for measuring.
     */
    Bounds: Core.extend({

        $static: {
            /**
             * Flag indicating that the dimension of elements should be calculated.
             */
            FLAG_MEASURE_DIMENSION: 0x1,
            
            /**
             * Flag indicating that the position of elements should be calculated.
             */
            FLAG_MEASURE_POSITION: 0x2,
            
            _initMeasureContainer: function() {
                // Create off-screen div element for evaluating sizes.
                this._offscreenDiv = document.createElement("div");
                this._offscreenDiv.style.cssText = 
                        "position: absolute; top: -1300px; left: -1700px; width: 1600px; height: 1200px;";
                document.body.appendChild(this._offscreenDiv);
            }
        },

        /**
         * The width of the element, in pixels.
         * @type Integer
         */
        width: null,
        
        /**
         * The height of the element, in pixels.
         * @type Integer
         */
        height: null,
        
        /**
         * The top coordinate of the element, in pixels relative to the upper-left corner of the interior of the window.
         * @type Integer
         */
        top: null,
         
        /**
         * The left coordinate of the element, in pixels relative to the upper-left corner of the interior of the window.
         * @type Integer
         */
        left: null,

        /**
         * Creates a new Bounds object to calculate the size and/or position of an element.
         * 
         * @param element the element to measure.
         * @param constraints an object containing width and or height properties specifying size of region in which to measure
         *        the element
         * @constructor
         */    
        $construct: function(element, constraints) {
            var flags = (constraints && constraints.flags) || 
                    (Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION | Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION);

            if (element === document.body) {
                return { 
                    x: 0,
                    y: 0,
                    height: window.innerHeight || document.documentElement.clientHeight,
                    width: window.innerWidth || document.documentElement.clientWidth
                };
            }
            
            var testElement = element;
            while (testElement && testElement != document) {
                testElement = testElement.parentNode;
            }
            var rendered = testElement == document;
            
            var parentNode, nextSibling;
            
            if (flags & Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION) {
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
                    
                    if (constraints) {
                        if (constraints.width) {
                            Core.Web.Measure.Bounds._offscreenDiv.width = constraints.width;
                        }
                        if (constraints.height) {
                            Core.Web.Measure.Bounds._offscreenDiv.height = constraints.height;
                        }
                    }
                    
                    // Append element to measuring container DIV.
                    Core.Web.Measure.Bounds._offscreenDiv.appendChild(element);
                    
                    if (constraints) {
                        Core.Web.Measure.Bounds._offscreenDiv.width = "1600px";
                        Core.Web.Measure.Bounds._offscreenDiv.height = "1200px";
                    }
                }
                
                // Store width and height of element.
                this.width = element.offsetWidth;
                this.height = element.offsetHeight;
                
                if (!rendered) {
                    // Replace off-screen measured element in previous location.
                    Core.Web.Measure.Bounds._offscreenDiv.removeChild(element);
                    if (parentNode) {
                        parentNode.insertBefore(element, nextSibling);
                    }
                }
            }

            // Determine top and left positions of element if rendered on-screen.
            if (rendered && (flags & Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION)) {
                var cumulativeOffset = Core.Web.Measure._getCumulativeOffset(element);
                var scrollOffset = Core.Web.Measure._getScrollOffset(element);
        
                this.top = cumulativeOffset.top - scrollOffset.top;
                this.left = cumulativeOffset.left - scrollOffset.left;
            }
        },
        
        /**
         * toString() implementation for debug purposes.
         * 
         * @return a string representation of the object
         * @type String
         */
        toString: function() {
            return (this.left != null ? (this.left + "," + this.top + " : ") : "") + 
                    (this.width != null ? ("[" + this.width + "x" + this.height + "]") : "");
        }
    })
};

/**
 * Scheduler namespace.
 * Provides capability to invoke code at regular intervals, after a delay, 
 * or after the current JavaScript execution context has completed.
 * Provides an object-oriented means of accomplishing this task.
 */
Core.Web.Scheduler = {
    
    /**
     * Collection of runnables to execute.
     */
    _runnables: [],
    
    /**
     * The thread handle returned by setTimeout().
     */ 
    _threadHandle: null,
    
    /**
     * Time at which next execution of the scheduler should occur.
     * When this field is not null, the _threadHandle field contains a
     * timeout scheduled to occur at this time.
     */
    _nextExecution: null,
    
    /**
     * Enqueues a Runnable to be executed by the scheduler.
     * If the runnable is currently enqueued, it will be removed and re-enqueued.  It will be next be invoked
     * after its specified time interval.
     * 
     * @param {Core.Web.Scheduler.Runnable} runnable the runnable to enqueue
     */
    add: function(runnable) {
        Core.Arrays.remove(Core.Web.Scheduler._runnables, runnable);
        runnable._nextExecution = new Date().getTime() + (runnable.timeInterval ? runnable.timeInterval : 0);
        Core.Web.Scheduler._runnables.push(runnable);
        Core.Web.Scheduler._setTimeout(runnable._nextExecution);
    },

    /**
     * Executes the scheduler, running any runnables that are due.
     * DESIGN NOTE: this method MUST ONLY be invoked by the timeout handle Core.Web.Scheduler._threadHandle.
     */
    _execute: function() {
        // Mark now-defunct timeout thread handle as null, because this method was invoked by it.
        Core.Web.Scheduler._threadHandle = null;
        
        var currentTime = new Date().getTime();
        var nextInterval = Number.MAX_VALUE;
        var i, runnable;
        
        // Execute pending runnables.
        for (i = 0; i < Core.Web.Scheduler._runnables.length; ++i) {
            runnable = Core.Web.Scheduler._runnables[i];
            if (runnable && runnable._nextExecution && runnable._nextExecution <= currentTime) {
                runnable._nextExecution = null;
                try {
                    runnable.run();
                } catch (ex) {
                    throw(ex);
                }
            }
        }

        var newRunnables = [];
        for (i = 0; i < Core.Web.Scheduler._runnables.length; ++i) {
            runnable = Core.Web.Scheduler._runnables[i];
            if (runnable == null) {
                continue;
            }

            if (runnable._nextExecution) {
                // Runnable is scheduled for execution: add it to new queue.
                newRunnables.push(runnable);
                
                // Determine time interval of this runnable, if it is the soonest to be executed, use its execution time
                // as the setTimeout delay.
                var interval = runnable._nextExecution - currentTime;
                if (interval < nextInterval) {
                    nextInterval = interval;
                }
                
                // Done processing this runnable.
                continue;
            }
            
            if (runnable.timeInterval != null && runnable.repeat) {
                // Runnable is executed at a repeating interval but is not scheduled: schedule it for execution.
                runnable._nextExecution = currentTime + runnable.timeInterval;
                newRunnables.push(runnable);
                
                // If this is the next runnable to be executed, use its execution time as the setTimeout delay.
                if (runnable.timeInterval < nextInterval) {
                    nextInterval = runnable.timeInterval;
                }
            }
        }
    
        // Store new runnable queue.
        Core.Web.Scheduler._runnables = newRunnables;
        
        if (nextInterval < Number.MAX_VALUE) {
            Core.Web.Scheduler._setTimeout(currentTime + nextInterval);
        }
    },
    
    /**
     * Dequeues a Runnable so it will no longer be executed by the scheduler.
     * 
     * @param {Core.Web.Scheduler.Runnable} runnable the runnable to dequeue
     */
    remove: function(runnable) {
        var index = Core.Arrays.indexOf(Core.Web.Scheduler._runnables, runnable);
        Core.Web.Scheduler._runnables[index] = null;
    },
    
    /**
     * Creates a new Runnable that executes the specified method and enqueues it into the scheduler.
     * 
     * @param {Number} time the time interval, in milliseconds, after which the Runnable should be executed
     *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
     * @param {Boolean} repeat a flag indicating whether the task should be repeated
     * @param f a function to invoke, may be null/undefined
     * @return the created Runnable.
     * @type Core.Web.Scheduler.Runnable 
     */
    run: function(f, timeInterval, repeat) {
        var runnable = new Core.Web.Scheduler.MethodRunnable(f, timeInterval, repeat);
        Core.Web.Scheduler.add(runnable);
        return runnable;
    },
    
    /**
     * Starts the scheduler "thread", to execute at the specified time.
     * If the specified time is in the past, it will execute with a delay of 0.
     * 
     * @param {Number} nextExecution next execution time (milliseconds since epoch)
     */
    _setTimeout: function(nextExecution) {
        if (Core.Web.Scheduler._threadHandle != null && Core.Web.Scheduler._nextExecution < nextExecution) {
            // The current timeout will fire before nextExecution, thus no work needs to be done here.
            return;
        }
        
        if (Core.Web.Scheduler._threadHandle != null) {
            // Clear any existing timeout.
            window.clearTimeout(Core.Web.Scheduler._threadHandle);
        }
        
        var currentTime = new Date().getTime();
        Core.Web.Scheduler._nextExecution = nextExecution;
        var timeout = nextExecution - currentTime > 0 ? nextExecution - currentTime : 0;
        Core.Web.Scheduler._threadHandle = window.setTimeout(Core.Web.Scheduler._execute, timeout);
    },
    
    /**
     * Updates a previously added runnable to be executed based on its <code>timeInterval</code> setting.
     * Performs no action if specified runnable is not currently enqueued.
     * 
     * @param {Core.Web.Scheduler.Runnable} runnable the runnable to update
     */
    update: function(runnable) {
        if (Core.Arrays.indexOf(Core.Web.Scheduler._runnables, runnable) == -1) {
            return;
        }
        var currentTime = new Date().getTime();
        var timeInterval = runnable.timeInterval ? runnable.timeInterval : 0;
        runnable._nextExecution = currentTime + timeInterval;
        Core.Web.Scheduler._setTimeout(runnable._nextExecution);
    }
};

/**
 * A runnable task that may be scheduled with the Scheduler.
 */
Core.Web.Scheduler.Runnable = Core.extend({
    
    /** Next execution time (milliseconds since epoch) */
    _nextExecution: null,
    
    $virtual: {

        /** 
         * Time interval, in milliseconds after which the Runnable should be executed.
         * @type Number
         */
        timeInterval: null,
        
        /**
         * Flag indicating whether task should be repeated.
         * @type Boolean
         */
        repeat: false
    },

    $abstract: {
        
        /** Performs work, provided by derived object. */
        run: function() { }
    }
});

/**
 * A runnable task implementation that invokes a function at regular intervals.
 */
Core.Web.Scheduler.MethodRunnable = Core.extend(Core.Web.Scheduler.Runnable, {

    /**
     * The function to invoke.
     * @type Function
     */
    f: null,

    /**
     * Creates a new Runnable.
     *
     * @constructor
     * @param {Number} time the time interval, in milliseconds, after which the Runnable should be executed
     *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
     * @param {Boolean} repeat a flag indicating whether the task should be repeated
     * @param {Function} f a function to invoke, may be null/undefined
     */
    $construct: function(f, timeInterval, repeat) {
        if (!timeInterval && repeat) {
            throw new Error("Cannot create repeating runnable without time delay:" + f);
        }
        this.f = f;
        this.timeInterval = timeInterval;
        this.repeat = !!repeat;
    },

    $virtual: {
        
        /**
         * Default run() implementation. Should be overridden by subclasses.
         */
        run: function() {
            this.f();
        }
    }
});

/**
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
 * @class
 */
Core.Web.VirtualPosition = {

    /** Array containing vertical offset attributes to be added to calculation. */ 
    _OFFSETS_VERTICAL: ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"],
            
    /** Array containing horizontal offset attributes to be added to calculation. */ 
    _OFFSETS_HORIZONTAL: ["paddingLeft", "paddingRight", "marginLeft", "marginRight", "borderLeftWidth", "borderRightWidth"],
    
    /** Flag indicating whether virtual positioning is required/enabled. */
    enabled: false,
    
    /**
     * Calculates horizontal or vertical padding, border, and margin offsets for a particular style.
     *
     * @param offsetNames the names of the offsets styles to calculate, either
     *        _OFFSETS_VERTICAL or _OFFSETS_HORIZONTAL.
     * @param style the style whose offsets should be calculated
     * @return the pixel size of the offsets, or -1 if they cannot be calculated
     */
    _calculateOffsets: function(offsetNames, style) {
        var offsets = 0;
        for (var i = 0; i < offsetNames.length; ++i) {
            var value = style[offsetNames[i]];
            if (value) {
                if (value.toString().indexOf("px") == -1) {
                    return -1;
                }
                offsets += parseInt(value, 10);
            }
        }
        return offsets;
    },
    
    /**
     * Enables and initializes the virtual positioning system.
     */
    _init: function() {
        this.enabled = true;
    },
    
    /**
     * Redraws elements registered with the virtual positioning system.
     * Adjusts the style.height and style.width attributes of an element to 
     * simulate its specified top, bottom, left, and right CSS position settings
     * The calculation makes allowances for padding, margin, and border width.
     *
     * @param element the element to redraw
     */
    redraw: function(element) {
        if (!this.enabled) {
            return;
        }
    
        if (!element || !element.parentNode) {
            return;
        }
        
        var offsets;
    
        // Adjust 'height' property if 'top' and 'bottom' properties are set, 
        // and if all padding/margin/borders are 0 or set in pixel units.
        if (this._verifyPixelValue(element.style.top) && this._verifyPixelValue(element.style.bottom)) {
            // Verify that offsetHeight is valid, and do nothing if it cannot be calculated.
            // Such a do-nothing scenario is due to a not-up-to-date element cache,  where
            // the element is no longer hierarchy.
            var offsetHeight = element.parentNode.offsetHeight;
            if (!isNaN(offsetHeight)) {
                offsets = this._calculateOffsets(this._OFFSETS_VERTICAL, element.style);
                if (offsets != -1) {
                    var calculatedHeight = offsetHeight - parseInt(element.style.top, 10) - 
                            parseInt(element.style.bottom, 10) - offsets;
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
        if (this._verifyPixelValue(element.style.left) && this._verifyPixelValue(element.style.right)) {
            // Verify that offsetHeight is valid, and do nothing if it cannot be calculated.
            // Such a do-nothing scenario is due to a not-up-to-date element cache,  where
            // the element is no longer hierarchy.
            var offsetWidth = element.parentNode.offsetWidth;
            if (!isNaN(offsetWidth)) {
                offsets = this._calculateOffsets(this._OFFSETS_HORIZONTAL, element.style);
                if (offsets != -1) {
                    var calculatedWidth = offsetWidth - parseInt(element.style.left, 10) - 
                            parseInt(element.style.right, 10) - offsets;
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
    },
    
    /** 
     * Determines if the specified value contains a pixel dimension, e.g., "20px"
     * Returns false if the value is null/whitespace/undefined.
     *
     * @param value the value to evaluate
     * @return true if the value is a pixel dimension, false if it is not
     */
    _verifyPixelValue: function(value) {
        if (value == null || value === "") {
            return false;
        }
        var valueString = value.toString();
        return valueString == "0" || valueString.indexOf("px") != -1;
    }
};
