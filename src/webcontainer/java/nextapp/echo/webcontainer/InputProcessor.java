package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.Iterator;

import org.w3c.dom.Document;

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
        // Process client input.
        //FIXME. there is chicken-egg stinkiness going on here:
        InputContext inputContext = new InputContextImpl();
        clientMessage = new ClientMessage(inputContext);
        
        processClientInput(inputContext);
        conn.getUserInstance().getApplicationInstance().getUpdateManager().processClientUpdates();
    }
    
    private void processClientInput(InputContext context) {
        UserInstance userInstance = context.getUserInstance();
        UpdateManager updateManager = userInstance.getUpdateManager();
        ClientUpdateManager clientUpdateManager = updateManager.getClientUpdateManager();
        ClientMessage clientMessage = context.getClientMessage();
        
        if (ClientMessage.TYPE_INITIALIZE.equals(clientMessage.getType())) {
            // Flag full refresh if initializing.
            updateManager.getServerUpdateManager().processFullRefresh();
        }
        
        Iterator updatedComponentIt  = clientMessage.getUpdatedComponents();
        while (updatedComponentIt.hasNext()) {
            Component component = (Component) updatedComponentIt.next();
            Iterator updatedPropertyIt = clientMessage.getUpdatedPropertyNames(component);
            while (updatedPropertyIt.hasNext()) {
                String propertyName = (String) updatedPropertyIt.next();
                Object propertyValue = clientMessage.getUpdatedPropertyValue(component, propertyName);
                ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
                componentPeer.storeInputProperty(context, component, propertyName, propertyValue);
            }
        }
        
        //FIXME. process clientmessage properties.
        
        if (clientMessage.getEventType() != null) {
            Component component = userInstance.getComponentByElementId(clientMessage.getEventComponentId());
            clientUpdateManager.setComponentAction(component, clientMessage.getEventType(), null);
        }
    }

}
