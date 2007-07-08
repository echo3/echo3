/**
 * Remote Client Implementation.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 * 
 * This client provides a view of a remote server hosted application.
 */
EchoRemoteClient = function(serverUrl, domainElementId) { 
    this._serverUrl = serverUrl;
    this.domainElement = document.getElementById(domainElementId);
    if (!this.domainElement) {
        throw new Error("Cannot find domain element: " + domainElementId);
    }
        
    EchoWebCore.init();
    
    this._processComponentUpdateRef = new EchoCore.MethodRef(this, this._processComponentUpdate);
    
    this.application = new EchoApp.Application(domainElementId);
    this.application.addComponentUpdateListener(this._processComponentUpdateRef);

    this._storeUpdates = false;
    this._updateManager = this.application.updateManager;
    
    /**
     * Mapping between shorthand URL codes and replacement values.
     */
    this._urlMappings = new Object();
    this._urlMappings["S"] = this._serverUrl + "?sid=Echo.StreamImage&imageuid=";
    
    this._clientMessage = new EchoRemoteClient.ClientMessage(this, true);
    
    EchoRemoteClient._activeClients.push(this);
};

/**
 * Converts a shorthand URL into a valid full-length URL.
 *
 * @param url the shorthand URL to process
 * @return the full-length valid URL
 */
EchoRemoteClient.prototype.processUrl = function(url) {
    var urlTokens = url.split("!");
    if (urlTokens[0]) {
        // urlTokens[0] is not empty: URL is not a shorthand URL.
        return url;
    } else {
        // urlTokens[0] = empty
        // urlTokens[1] = key
        // urlTokens[2] = baseUrl
        if (urlTokens.length != 3) {
            throw new IllegalArgumentException("Invalid encoded URL");
        }
        var replacementValue = this._urlMappings[urlTokens[1]]; 
        if (replacementValue == null) {
            throw new Error("Invalid URL shorthand key \"" + urlTokens[1] + "\".");
        }
        return replacementValue + urlTokens[2];
    }
};

/**
 * Base URL from which libraries should be retrieved.
 * Libraries are loaded into global scope, and are thus not
 * bound to any particular client instance.
 */
EchoRemoteClient.libraryServerUrl = null;

EchoRemoteClient._activeClients = new Array();

EchoRemoteClient.prototype.addComponentListener = function(component, eventType) {
    component.addListener(eventType, new EchoCore.MethodRef(this, this._processComponentEvent));
};

EchoRemoteClient.prototype.getLibraryServiceUrl = function(serviceId) {
    if (!EchoRemoteClient._libraryServerUrl) {
        EchoRemoteClient._libraryServerUrl = this._serverUrl;
    }
    return EchoRemoteClient._libraryServerUrl + "?sid=" + serviceId;
};

EchoRemoteClient.prototype._processComponentEvent = function(e) {
    if (!this._clientMessage) {
        if (new Date().getTime() - this._syncInitTime > 2000) {
            //FIXME. Central error handling for these.
            alert("Waiting on server response.  Press the browser reload or refresh button if server fails to respond.");
        }
        return;
    }
    this._clientMessage.setEvent(e.source.renderId, e.type, e.data);
    this.sync();
};

EchoRemoteClient.prototype._processComponentUpdate = function(e) {
    if (!this._clientMessage) {
        //FIXME. need to work on scenarios where clientmessage is null, for both this and events too.
        return;
    }
    this._clientMessage.storeProperty(e.parent.renderId, e.propertyName, e.newValue);
};

EchoRemoteClient.prototype._processSyncComplete = function(e) {
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("ser"); // Serialization
    }
    
    this._clientMessage = new EchoRemoteClient.ClientMessage(this, false);
    this.application.addComponentUpdateListener(this._processComponentUpdateRef);
	EchoRender.processUpdates(this._updateManager);
    
    if (EchoCore.profilingTimer) {
        EchoCore.Debug.consoleWrite(EchoCore.profilingTimer);
        EchoCore.profilingTimer = null;
    }
};

EchoRemoteClient._globalWindowResizeListener = function(e) {
    for (var i = 0; i < EchoRemoteClient._activeClients.length; ++i) {
        EchoRemoteClient._activeClients[i]._windowResizeListener(e);
    }
};

EchoRemoteClient.prototype._windowResizeListener = function(e) {
    EchoRender.notifyResize(this.application.rootComponent);
};

EchoRemoteClient.prototype._processSyncResponse = function(e) {
    var responseDocument = e.source.getResponseXml();
    
    if (!e.valid || !responseDocument || !responseDocument.documentElement) {
        //FIXME. Central error handling for things like this.
        //FIXME. Shut down further client input with secondary "you're beating a dead horse" error message. 
        alert("An invalid response was received from the server.  Press the browser reload or refresh button.");
        return;
    }
    
    // Profiling Timer (Uncomment to enable).
    EchoCore.profilingTimer = new EchoCore.Debug.Timer();

    this.application.removeComponentUpdateListener(this._processComponentUpdateRef);
    
    var serverMessage = new EchoRemoteClient.ServerMessage(this, responseDocument);
    serverMessage.addCompletionListener(new EchoCore.MethodRef(this, this._processSyncComplete));
    serverMessage.process();
};

EchoRemoteClient.prototype.sync = function() {
    this._syncInitTime = new Date().getTime();
    var conn = new EchoWebCore.HttpConnection(this.getServiceUrl("Echo.Sync"), "POST", 
            this._clientMessage._renderXml(), "text/xml");
    this._clientMessage = null;
    conn.addResponseListener(new EchoCore.MethodRef(this, this._processSyncResponse));
    conn.connect();
};

EchoRemoteClient.prototype.getServiceUrl = function(serviceId) {
    return this._serverUrl + "?sid=" + serviceId;
};

EchoRemoteClient.ClientMessage = function(client, initialize) {
    this._client = client;
    this._componentIdToPropertyMap = new EchoCore.Collections.Map();
    this._initialize = initialize;
};

EchoRemoteClient.ClientMessage.prototype.setEvent = function(componentId, eventType, eventData) {
    this._eventComponentId = componentId;
    this._eventType = eventType;
    this._eventData = eventData;
};

EchoRemoteClient.ClientMessage.prototype.storeProperty = function(componentId, propertyName, propertyValue) {
    var propertyMap = this._componentIdToPropertyMap.get(componentId);
    if (!propertyMap) {
        propertyMap = new EchoCore.Collections.Map();
        this._componentIdToPropertyMap.put(componentId, propertyMap);
    }
    propertyMap.put(propertyName, propertyValue);
};

EchoRemoteClient.ClientMessage.prototype._renderXml = function() {
    var cmsgDocument = EchoWebCore.DOM.createDocument(
            "http://www.nextapp.com/products/echo/svrmsg/clientmessage.3.0", "cmsg");
    var cmsgElement = cmsgDocument.documentElement;
    
    if (this._initialize) {
        cmsgElement.setAttribute("t", "init");
    }
    
    // Render event information.
    if (this._eventType) {
        var eElement = cmsgDocument.createElement("e");
        eElement.setAttribute("t", this._eventType);
        eElement.setAttribute("i", this._eventComponentId);
        if (this._eventData != null) {
            if (typeof (this._eventData) == "object") {
                if (this._eventData.className) {
                    EchoSerial.storeProperty(this._client, eElement, this._eventData);
                }
            } else {
                eElement.setAttribute("v", this._eventData);
            }
        }
        cmsgElement.appendChild(eElement);
    }
    
    // Render property information.
    for (var componentId in this._componentIdToPropertyMap.associations) {
        var propertyMap = this._componentIdToPropertyMap.associations[componentId];
        for (var propertyName in propertyMap.associations) {
            var propertyValue = propertyMap.associations[propertyName];
            var pElement = cmsgDocument.createElement("p");
            pElement.setAttribute("i", componentId);
            pElement.setAttribute("n", propertyName);
            if (typeof (propertyValue) == "object") {
                if (propertyValue.className) {
                    EchoSerial.storeProperty(this._client, pElement, propertyValue);
                }
            } else {
                pElement.setAttribute("v", propertyValue);
            }
            
            cmsgElement.appendChild(pElement);
        }
    }
    
    return cmsgDocument;
};

EchoRemoteClient.ComponentSync = function(client) { 
    this._client = client;
    this._referenceMap = new Object();
};

EchoRemoteClient.ComponentSync._numericReverseSort = function(a, b) {
    return b - a;
};

EchoRemoteClient.ComponentSync.prototype.process = function(dirElement) {
    var element = dirElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            switch (element.nodeName) {
            case "rm": this._processComponentRemove(element); break;
            case "up": this._processComponentUpdate(element); break;
            case "add": this._processComponentAdd(element); break;
            case "ss": this._processStyleSheet(element); break;
            case "sp": this._processStoreProperties(element); break;
            }
        }
        element = element.nextSibling;
    }
};

EchoRemoteClient.ComponentSync.prototype._processComponentAdd = function(addElement) {
    var parentId = addElement.getAttribute("i");
    var parentComponent = this._client.application.getComponentByRenderId(parentId);
    var element = addElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            var component = EchoSerial.loadComponent(this._client, element, this._referenceMap);
            var index = element.getAttribute("x");
            if (index == null) {
                parentComponent.add(component);
            } else {
                parentComponent.add(component, parseInt(index));
            }
        }
        element = element.nextSibling;
    }
};

EchoRemoteClient.ComponentSync.prototype._processComponentRemove = function(removeElement) {
    if (removeElement.childNodes.length > 5) {
        // Special case: many children being removed: create renderId -> index map and remove by index
        // in order to prevent Component.indexOf() of from being invoked n times.
        
        // Find parent component.
        var cElement = removeElement.firstChild;
        var parent;
        while (cElement) {
            var component = this._client.application.getComponentByRenderId(cElement.getAttribute("i"));
            if (component) {
                parent = component.parent;
                break;
            }
            cElement = cElement.nextSibling;
        }
        if (!parent) {
            return;
        }
        
        // Create map between ids and indices.
        var idToIndexMap = new Object();
        for (var i = 0; i < parent.children.length; ++i) {
            idToIndexMap[parent.children[i].renderId] = i;
        }
        
        // Create array of indices to remove.
        var indicesToRemove = new Array();
        cElement = removeElement.firstChild;
        while (cElement) {
            var index = idToIndexMap[cElement.getAttribute("i")];
            if (index != null) {
                indicesToRemove.push(parseInt(index));
            }
            cElement = cElement.nextSibling;
        }
        indicesToRemove.sort(EchoRemoteClient.ComponentSync._numericReverseSort);

        // Remove components (last to first).
        for (var i = 0; i < indicesToRemove.length; ++i) {
            parent.remove(indicesToRemove[i]);
        }
    } else {
        var cElement = removeElement.firstChild;
        while (cElement) {
            var component = this._client.application.getComponentByRenderId(cElement.getAttribute("i"));
            if (component) {
                component.parent.remove(component);
            }
            cElement = cElement.nextSibling;
        }
    }
};

EchoRemoteClient.ComponentSync.prototype._processComponentUpdate = function(updateElement) {
    var id = updateElement.getAttribute("i");
    var component = this._client.application.getComponentByRenderId(id);
    
    var styleName = updateElement.getAttribute("s");
    if (styleName != null) {
        component.setStyleName(styleName == "" ? null : styleName); //FIXME verify this works as desired for unsets.
        var styleType = updateElement.getAttribute("st");
        if (styleType) {
            component.setStyleType(styleType);
        } else {
            component.setStyleType(null);
        }
    }
    
    var enabledState = updateElement.getAttribute("en");
    if (enabledState) {
        component.setEnabled(enabledState == "true");
    }
    
    var element = updateElement.firstChild;
    while (element) {
        switch (element.nodeName) {
        case "p": // Property
            EchoSerial.loadProperty(this._client, element, component, null, this._referenceMap);
            break;
        }
        element = element.nextSibling;
    }
};

EchoRemoteClient.ComponentSync.prototype._processStoreProperties = function(spElement) {
    var propertyElement = spElement.firstChild;
    while (propertyElement) {
        switch (propertyElement.nodeName) {
        case "rp": // Referenced Property
            var propertyId = propertyElement.getAttribute("i");
            var propertyType = propertyElement.getAttribute("t");
            var translator = EchoSerial.getPropertyTranslator(propertyType);
            if (!translator) {
                throw new Error("Translator not available for property type: " + propertyType);
            }
            propertyValue = translator.toProperty(this._client, propertyElement);
            this._referenceMap[propertyId] = propertyValue;
            break;
        }
        propertyElement = propertyElement.nextSibling;
    }
};

EchoRemoteClient.ComponentSync.prototype._processStyleSheet = function(ssElement) {
    var styleSheet = EchoSerial.loadStyleSheet(this._client, ssElement);
    this._client.application.setStyleSheet(styleSheet);
};

EchoRemoteClient.ServerMessage = function(client, xmlDocument) { 
    this.client = client;
    this.document = xmlDocument;
    this._listenerList = new EchoCore.ListenerList();
    this._processorInstances = new Object();
};

EchoRemoteClient.ServerMessage._processorClasses = new Object();

EchoRemoteClient.ServerMessage.prototype.addCompletionListener = function(l) {
    this._listenerList.addListener("completion", l);
};

EchoRemoteClient.ServerMessage.addProcessor = function(name, processor) {
    EchoRemoteClient.ServerMessage._processorClasses[name] = processor;
};

EchoRemoteClient.ServerMessage.prototype.process = function() {
    // Processing phase 1: load libraries.
    var libsElement = EchoWebCore.DOM.getChildElementByTagName(this.document.documentElement, "libs");
    if (libsElement) {
        var libraryGroup = new EchoWebCore.Library.Group();
        var element = libsElement.firstChild;
        while (element) {
            if (element.nodeType == 1) {
                if (element.nodeName == "lib") {
                    var url = this.client.getLibraryServiceUrl(element.getAttribute("i"));
                    libraryGroup.add(url);
                }
            }
            element = element.nextSibling;
        }
        if (libraryGroup.hasNewLibraries()) {
            libraryGroup.addLoadListener(new EchoCore.MethodRef(this, this._processPostLibraryLoad));
            libraryGroup.load();
        } else {
            this._processPostLibraryLoad();
        }
    } else {
        this._processPostLibraryLoad();
    }
};

EchoRemoteClient.ServerMessage.prototype._processPostLibraryLoad = function() {
    EchoCore.profilingTimer.mark("lib"); // Library Loading
    // Processing phase 2: invoke directives.
    var groupElements = EchoWebCore.DOM.getChildElementsByTagName(this.document.documentElement, "group");
    for (var i = 0; i < groupElements.length; ++i) {
        var dirElements = EchoWebCore.DOM.getChildElementsByTagName(groupElements[i], "dir");
        for (var j = 0; j < dirElements.length; ++j) {
            var procName = dirElements[j].getAttribute("proc");
            var processor = this._processorInstances[procName];
            if (!processor) {
                // Create new processor instance.
                processor = new EchoRemoteClient.ServerMessage._processorClasses[procName](this.client);
                if (!processor) {
                    throw new Error("Invalid processor specified in ServerMessage: " + procName);
                }
                this._processorInstances[procName] = processor;
            }
            processor.process(dirElements[j]);
        }
    }

    // Complete: notify listeners of completion.
    this._listenerList.fireEvent(new EchoCore.Event(this, "completion"));
};

EchoRemoteClient.ServerMessage.prototype.removeCompletionListener = function(l) {
    this._listenerList.removeListener("completion", l);
};

EchoRemoteClient.ServerMessage.addProcessor("CSync", EchoRemoteClient.ComponentSync);

EchoWebCore.DOM.addEventListener(window, "resize", EchoRemoteClient._globalWindowResizeListener, false);
