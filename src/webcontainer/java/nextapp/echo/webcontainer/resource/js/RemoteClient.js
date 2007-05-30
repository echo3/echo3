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
    
    this.application = new EchoApp.Application(domainElementId);
    this.application.addComponentUpdateListener(new EchoCore.MethodRef(this, this._processComponentUpdate));
    this._storeUpdates = false;
    this._updateManager = this.application.updateManager;
    
    this._urlMappings = new EchoCore.Collections.Map();
    this._urlMappings.put("S", this._serverUrl + "?sid=Echo.StreamImage&imageuid=");
    
    this._clientMessage = new EchoRemoteClient.ClientMessage(this, true);
    
    EchoRemoteClient._activeClients.push(this);
};

EchoRemoteClient.prototype.processUrl = function(url) {
    if (url.charAt(0) == "!") {
        var endIndex = url.indexOf("!", 1);
        if (endIndex == -1) {
            throw new IllegalArgumentException("Invalid encoded URL");
        }
        var baseUrl = url.substring(endIndex + 1);
        var key = url.substring(1, endIndex);
        var replacementValue = this._urlMappings.get(key);
        if (replacementValue == null) {
            throw new Error("Invalid URL shorthand key \"" + key + "\".");
        }
        return replacementValue + baseUrl;
    } else {
        return url;
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
        //FIXME. Central error handling for these.
        alert("Waiting on server response.  Press the browser reload or refresh button if server fails to respond.");
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
        EchoCore.profilingTimer.mark("RemoteClient: Deserialized");
    }
    
	EchoRender.processUpdates(this._updateManager);
    
    this._clientMessage = new EchoRemoteClient.ClientMessage(this, false);
    
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

    var serverMessage = new EchoRemoteClient.ServerMessage(this, responseDocument);
    serverMessage.addCompletionListener(new EchoCore.MethodRef(this, this._processSyncComplete));
    serverMessage.process();
};

EchoRemoteClient.prototype.sync = function() {
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

EchoRemoteClient.ComponentSync = function() { };

EchoRemoteClient.ComponentSync.process = function(client, dirElement) {
    var element = dirElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            switch (element.nodeName) {
            case "rm":
                EchoRemoteClient.ComponentSync._processComponentRemove(client, element);
                break;
            case "up":
                EchoRemoteClient.ComponentSync._processComponentUpdate(client, element);
                break;
            case "add":
                EchoRemoteClient.ComponentSync._processComponentAdd(client, element);
                break;
            case "ss":
                EchoRemoteClient.ComponentSync._processStyleSheet(client, element);
                break;
            }
        }
        element = element.nextSibling;
    }
};

EchoRemoteClient.ComponentSync._processComponentAdd = function(client, addElement) {
    var parentId = addElement.getAttribute("i");
    var parentComponent = client.application.getComponentByRenderId(parentId);
    var element = addElement.firstChild;
    while (element) {
        if (element.nodeType == 1) {
            var component = EchoSerial.loadComponent(client, element);
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

EchoRemoteClient.ComponentSync._numericReverseSort = function(a, b) {
    return b - a;
};

EchoRemoteClient.ComponentSync._processComponentRemove = function(client, removeElement) {
    if (removeElement.childNodes.length > 5) {
        // Special case: many children being removed: create renderId -> index map and remove by index
        // in order to prevent Component.indexOf() of from being invoked n times.
        
        // Find parent component.
        var cElement = removeElement.firstChild;
        var parent;
        while (cElement) {
            var component = client.application.getComponentByRenderId(cElement.getAttribute("i"));
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
            var component = client.application.getComponentByRenderId(cElement.getAttribute("i"));
            if (component) {
                component.parent.remove(component);
            }
            cElement = cElement.nextSibling;
        }
    }
};

EchoRemoteClient.ComponentSync._processComponentUpdate = function(client, updateElement) {
    var id = updateElement.getAttribute("i");
    var component = client.application.getComponentByRenderId(id);
    
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
    
    var element = updateElement.firstChild;
    while (element) {
        switch (element.nodeName) {
        case "p": // Property
            EchoSerial.loadProperty(client, element, component);
            break;
        }
        element = element.nextSibling;
    }
};

EchoRemoteClient.ComponentSync._processStyleSheet = function(client, ssElement) {
    var styleSheet = EchoSerial.loadStyleSheet(client, ssElement);
    client.application.setStyleSheet(styleSheet);
};

EchoRemoteClient.ServerMessage = function(client, xmlDocument) { 
    this.client = client;
    this.document = xmlDocument;
    this._listenerList = new EchoCore.ListenerList();
};

EchoRemoteClient.ServerMessage._processors = new EchoCore.Collections.Map();

EchoRemoteClient.ServerMessage.prototype.addCompletionListener = function(l) {
    this._listenerList.addListener("completion", l);
};

EchoRemoteClient.ServerMessage.addProcessor = function(name, processor) {
    EchoRemoteClient.ServerMessage._processors.put(name, processor);
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
    // Processing phase 2: invoke directives.
    var groupElements = EchoWebCore.DOM.getChildElementsByTagName(this.document.documentElement, "group");
    for (var i = 0; i < groupElements.length; ++i) {
        var dirElements = EchoWebCore.DOM.getChildElementsByTagName(groupElements[i], "dir");
        for (var j = 0; j < dirElements.length; ++j) {
            var procName = dirElements[j].getAttribute("proc");
            var processor = EchoRemoteClient.ServerMessage._processors.get(procName);
            if (!processor) {
                throw new Error("Invalid processor specified in ServerMessage: " + procName);
            }
            processor.process(this.client, dirElements[j]);
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
