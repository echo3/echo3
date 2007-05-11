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

                Class propertyClass = componentPeer.getPropertyClass(propertyName);
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
