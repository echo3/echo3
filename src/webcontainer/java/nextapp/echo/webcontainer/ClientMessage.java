/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.util.DomUtil;
import nextapp.echo.webcontainer.util.XmlRequestParser;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";

    private Document document;
    private String type;
    private Map componentUpdateMap = new HashMap();
    
    private String eventType;
    private Element eventElement;
    private String eventComponentId;
    
    public ClientMessage(Connection conn) 
    throws IOException {
        super();
        
        document = XmlRequestParser.parse(conn.getRequest(), conn.getUserInstance().getCharacterEncoding());

        // Retrieve message type.
        type = document.getDocumentElement().getAttribute("t");
        
        Element[] dirElements = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "dir");
        
        for (int i = 0; i < dirElements.length; ++i) {
            String processorName = dirElements[i].getAttribute("proc");
            if ("CSync".equals(processorName)) {
                processComponentSynchronize(dirElements[i]);
            }
        }
    }

    public Iterator getUpdatedComponentIds() {
        return componentUpdateMap.keySet().iterator();
    }
    
    public Iterator getUpdatedPropertyNames(String componentId) {
        Map propertyMap = (Map) componentUpdateMap.get(componentId);
        return propertyMap.keySet().iterator();
    }
    
    public Element getUpdatedProperty(String componentId, String propertyName) {
        Map propertyMap = (Map) componentUpdateMap.get(componentId);
        return (Element) propertyMap.get(propertyName);
    }
    
    public Document getDocument() {
        return document;
    }
    
    public String getType() {
        return type;
    }
    
    public Element getEvent() {
        return eventElement;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public String getEventComponentId() {
        return eventComponentId;
    }
    
    private void processComponentSynchronize(Element dirElement) {
        // Retrieve event.
        eventElement = DomUtil.getChildElementByTagName(dirElement, "e");
        if (eventElement != null) {
            eventType = eventElement.getAttribute("t");
            eventComponentId = eventElement.getAttribute("i");
        }
        
        // Retrieve property updates.
        Element[] pElements = DomUtil.getChildElementsByTagName(dirElement, "p");
        for (int i = 0; i < pElements.length; ++i) {
            String componentId = pElements[i].getAttribute("i");
            String propertyName = pElements[i].getAttribute("n");
        
            Map propertyMap = (Map) componentUpdateMap.get(componentId);
            if (propertyMap == null) {
                propertyMap = new HashMap();
                componentUpdateMap.put(componentId, propertyMap);
            }
            
            propertyMap.put(propertyName, pElements[i]);
        }
    }
}
