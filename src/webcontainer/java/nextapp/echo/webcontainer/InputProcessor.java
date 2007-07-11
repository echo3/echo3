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
import java.util.Iterator;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

public class InputProcessor {

    private class InputContext implements Context {
        
        private SerialContext serialContext = new SerialContext() {
        
            public ClassLoader getClassLoader() {
                //FIXME. temporary, not what we want.
                return Thread.currentThread().getContextClassLoader();
            }
        
            public Document getDocument() {
                return clientMessage.getDocument();
            }
        };
        
        /**
         * @see nextapp.echo.app.util.Context#get(java.lang.Class)
         */
        public Object get(Class specificContextClass) {
            if (specificContextClass == SerialContext.class) {
                return serialContext;
            } else if (specificContextClass == Connection.class) {
                return conn;
            } else if (specificContextClass == PropertyPeerFactory.class) {
                return propertyPeerFactory;
            } else if (specificContextClass == UserInstance.class) {
                return conn.getUserInstance();
            } else if (specificContextClass == ClientMessage.class) {
                return clientMessage;
            } else if (specificContextClass == ClientUpdateManager.class) {
                return conn.getUserInstance().getApplicationInstance().getUpdateManager().getClientUpdateManager();
            } else {
                return null;
            }
        }
    }
    
    private Connection conn;
    private ClientMessage clientMessage;
    private PropertyPeerFactory propertyPeerFactory;

    public InputProcessor(Connection conn) {
        super();
        this.conn = conn;
        propertyPeerFactory = PropertySerialPeerFactory.INSTANCE; //FIXME. temporary
    }
    
    public void process() 
    throws IOException {
        clientMessage = new ClientMessage(conn);

        Context context = new InputContext();
        UserInstance userInstance = conn.getUserInstance();
        UpdateManager updateManager = userInstance.getUpdateManager();
        
        if (ClientMessage.TYPE_INITIALIZE.equals(clientMessage.getType())) {
            // Flag full refresh if initializing.
            updateManager.getServerUpdateManager().processFullRefresh();
        }
        
        if (WebContainerServlet.DEBUG_PRINT_MESSAGES_TO_CONSOLE) {
            // Print ClientMessage to console. 
            try {
                DomUtil.save(clientMessage.getDocument(), System.err, DomUtil.OUTPUT_PROPERTIES_INDENT);
            } catch (SAXException ex) {
                throw new RuntimeException(ex);
            }
        }

        Iterator updatedComponentIdIt  = clientMessage.getUpdatedComponentIds();
        while (updatedComponentIdIt.hasNext()) {
            String componentId = (String) updatedComponentIdIt.next();
            Component component = userInstance.getComponentByElementId(componentId);
            ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
            
            Iterator updatedPropertyIt = clientMessage.getUpdatedPropertyNames(componentId);
            while (updatedPropertyIt.hasNext()) {
                String propertyName = (String) updatedPropertyIt.next();
                Element propertyElement = clientMessage.getUpdatedProperty(componentId, propertyName);

                Class propertyClass = componentPeer.getInputPropertyClass(propertyName);
                if (propertyClass == null) {
                    //FIXME. add ex handling.
                    System.err.println("Could not determine class of property: " + propertyName);
                    continue;
                }
                
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(propertyClass);
                
                if (propertyPeer == null) {
                    //FIXME. add ex handling.
                    System.err.println("No peer available for property: " + propertyName + " of class: " + propertyClass);
                    continue;
                }
                
                try {
                    Object propertyValue = propertyPeer.toProperty(context, component.getClass(), propertyElement);
                    componentPeer.storeInputProperty(context, component, propertyName, -1, propertyValue);
                } catch (SerialException ex) {
                    //FIXME. bad ex handling.
                    throw new IOException(ex.toString());
                }
            }
        }
        
        if (clientMessage.getEvent() != null) {
            Component component = userInstance.getComponentByElementId(clientMessage.getEventComponentId());
            ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
            Class eventDataClass = componentPeer.getEventDataClass(clientMessage.getEventType());
            if (eventDataClass == null) {
                componentPeer.processEvent(context, component, clientMessage.getEventType(), null);
            } else {
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(eventDataClass);
                if (propertyPeer == null) {
                    //FIXME. add ex handling.
                    System.err.println("No peer available for event data for event type: " + clientMessage.getEventType() 
                            + " of class: " + eventDataClass);
                }
                try {
                    Object eventData = propertyPeer.toProperty(context, component.getClass(), clientMessage.getEvent());
                    componentPeer.processEvent(context, component, clientMessage.getEventType(), eventData);
                } catch (SerialException ex) {
                    //FIXME. bad ex handling.
                    throw new IOException(ex.toString());
                }
            }
        }

        updateManager.processClientUpdates();
    }
}
