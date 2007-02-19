package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.Iterator;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class InputProcessor {

    private class InputContextImpl implements InputContext {
        
        private InputContextImpl() 
        throws IOException {
            super();
        }
        
        public ClientUpdateManager getClientUpdateManager() {
            return conn.getUserInstance().getApplicationInstance().getUpdateManager().getClientUpdateManager();
        }
        
        /**
         * @see nextapp.echo.webcontainer.InputContext#getClientMessage()
         */
        public ClientMessage getClientMessage() {
            return clientMessage;
        }

        /**
         * @see nextapp.echo.webcontainer.InputContext#getConnection()
         */
        public Connection getConnection() {
            return conn;
        }

        /**
         * @see nextapp.echo.webcontainer.InputContext#getUserInstance()
         */
        public UserInstance getUserInstance() {
            return conn.getUserInstance();
        }

        /**
         * @see nextapp.echo.app.xml.XmlContext#getClassLoader()
         */
        public ClassLoader getClassLoader() {
            //FIXME. temporary, not what we want.
            return Thread.currentThread().getContextClassLoader();
        }

        /**
         * @see nextapp.echo.app.xml.XmlContext#getDocument()
         */
        public Document getDocument() {
            return clientMessage.getDocument();
        }

        /**
         * @see nextapp.echo.app.xml.XmlContext#getPropertyPeer(java.lang.Class)
         */
        public XmlPropertyPeer getPropertyPeer(Class propertyClass) {
            return null;
        }
    }
    
    private Connection conn;
    private ClientMessage clientMessage;

    public InputProcessor(Connection conn) {
        super();
        this.conn = conn;
    }
    
    public void process() 
    throws IOException {
        clientMessage = new ClientMessage(conn);
        InputContext inputContext = new InputContextImpl();
        
        processClientInput(inputContext);
        conn.getUserInstance().getApplicationInstance().getUpdateManager().processClientUpdates();
    }

    private void processClientInput(InputContext context) {
        UserInstance userInstance = context.getUserInstance();
        UpdateManager updateManager = userInstance.getUpdateManager();
        ClientUpdateManager clientUpdateManager = updateManager.getClientUpdateManager();
        
        if (ClientMessage.TYPE_INITIALIZE.equals(clientMessage.getType())) {
            // Flag full refresh if initializing.
            updateManager.getServerUpdateManager().processFullRefresh();
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
                    continue;
                }
                
                PropertySynchronizePeer propertyPeer = 
                        (PropertySynchronizePeer) SynchronizePeerFactory.getPeerForProperty(propertyClass);
                if (propertyPeer == null) {
                    continue;
                }
                
                Object propertyValue = propertyPeer.toProperty(context, component.getClass(), propertyElement);
                
                componentPeer.storeInputProperty(context, component, propertyName, propertyValue);
            }
        }
        
        if (clientMessage.getEventType() != null) {
            Component component = userInstance.getComponentByElementId(clientMessage.getEventComponentId());
            clientUpdateManager.setComponentAction(component, clientMessage.getEventType(), null);
        }
    }
}
