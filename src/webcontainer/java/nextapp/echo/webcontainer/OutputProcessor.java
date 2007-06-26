package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.Iterator;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Map.Entry;

import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.Window;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.update.ServerUpdateManager;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * Generates an XML <code>ServerMessage</code> describing server-side changes to the
 * state of an application that is returned to the remote client as a response
 * to its syncrhonization HTTP connection.
 */
public class OutputProcessor {
    
    /**
     * <code>Context</code> implementation.
     */
    private class OutputContext implements Context {

        /**
         * <code>SerialContext</code> implementation.
         */
        private SerialContext serialContext = new SerialContext() {
        
            /**
             * @see nextapp.echo.app.serial.SerialContext#getClassLoader()
             */
            public ClassLoader getClassLoader() {
                //FIXME. temporary, not what we want.
                return Thread.currentThread().getContextClassLoader();
            }
        
            /**
             * @see nextapp.echo.app.serial.SerialContext#getDocument()
             */
            public Document getDocument() {
                return document;
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
            } else if (specificContextClass == ServerMessage.class) {
                return serverMessage;
            } else {
                return null;
            }
        }
    }
    
    private Connection conn;
    private ServerMessage serverMessage;
    private Context context;
    private PropertyPeerFactory propertyPeerFactory;
    private Document document;
    
    /**
     * Creates a new <code>OutputProcessor</code>.
     * 
     * @param conn the <code>Connection</code> for which the output is 
     * being generated.
     */
    public OutputProcessor(Connection conn) {
        super();
        this.conn = conn;
        this.context = new OutputContext();
        serverMessage = new ServerMessage();
        document = serverMessage.getDocument();
        propertyPeerFactory = PropertySerialPeerFactory.INSTANCE; //FIXME temporary
    }
    
    private Class getStyleClass(StyleSheet styleSheet, String styleName, Class componentClass) {
        if (styleSheet.getStyle(styleName, componentClass, false) != null) {
            // StyleSheet provides style specifically for componentClass.
            return componentClass;
        }
        
        // StyleSheet does not provide style specifically for componentClass: search superclasses.
        componentClass = componentClass.getSuperclass();
        while (componentClass != null) {
            if (styleSheet.getStyle(styleName, componentClass, false) != null) {
                return componentClass;
            }
            componentClass = componentClass.getSuperclass();
        }
        
        return null;
    }
    
    /**
     * Determines if the specified <code>component</code> has been rendered to
     * the client by determining if it is a descendant of any
     * <code>LazyRenderContainer</code>s and if so querying them to determine
     * the hierarchy's render state. This method is recursively invoked.
     *
     * @param context the relevant <code>Context</code>
     * @param component the <code>Component</code> to analyze
     * @return <code>true</code> if the <code>Component</code> has been
     *         rendered to the client
     */
    private boolean isRendered(Context context, Component component) {
        //FIXME. This code is 100% untested in Echo3.
        Component parent = component.getParent();
        if (parent == null) {
            return true;
        }
        ComponentSynchronizePeer syncPeer = SynchronizePeerFactory.getPeerForComponent(parent.getClass());
        if (syncPeer instanceof LazyRenderContainer) {
            boolean rendered = ((LazyRenderContainer) syncPeer).isRendered(context, parent, component);
            if (!rendered) {
                return false;
            }
        }
        return isRendered(context, parent);
    }
    
    public void process() 
    throws IOException {
        serverMessage.setTransactionId(conn.getUserInstance().getNextTransactionId());
        try {
            processServerOutput();
            conn.setContentType(ContentType.TEXT_XML);
            serverMessage.render(conn.getWriter());
        } catch (SerialException ex) {
            //FIXME. Bad exception handling.
            throw new IOException(ex.toString());
        }
        
        if (WebContainerServlet.DEBUG_PRINT_MESSAGES_TO_CONSOLE) {
            // Print ServerMessage to console. 
            try {
                DomUtil.save(document, System.err, DomUtil.OUTPUT_PROPERTIES_INDENT);
            } catch (SAXException ex) {
                // Should not generally occur.
                throw new RuntimeException(ex);
            }
        }
    }

    private void processServerOutput() 
    throws SerialException {
        UserInstance userInstance = conn.getUserInstance();
        UpdateManager updateManager = userInstance.getUpdateManager();
        ServerUpdateManager serverUpdateManager = updateManager.getServerUpdateManager();
        
        if (serverUpdateManager.isFullRefreshRequired()) {
            renderStyleSheet();
            ContentPane content = userInstance.getApplicationInstance().getDefaultWindow().getContent();
            if (content == null) {
                throw new IllegalStateException("No content to render: default window has no content.");
            }
            Element addElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "add");
            //FIXME. Specific reference to c_root.
            addElement.setAttribute("i", "c_root");
            renderComponentState(addElement, content);
        } else {
            ServerComponentUpdate[] componentUpdates = updateManager.getServerUpdateManager().getComponentUpdates();
            
            // Remove any updates whose updates are descendants of components which have not been rendered to the
            // client yet due to lazy-loading containers.
            for (int i = 0; i < componentUpdates.length; ++i) {
                if (!isRendered(context, componentUpdates[i].getParent())) {
                    componentUpdates[i] = null;
                }
            }

            for (int i = 0; i < componentUpdates.length; ++i) {
                if (componentUpdates[i] == null) {
                    // Update removed, do nothing.
                    continue;
                }
                
                // Removed children.
                Component[] removedChildren = componentUpdates[i].getRemovedChildren();
                if (removedChildren.length > 0) {
                    Element rmElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "rm");
                    for (int j = 0; j < removedChildren.length; ++j) {
                        Element cElement = document.createElement("c");
                        cElement.setAttribute("i", UserInstance.getElementId(removedChildren[j]));
                        rmElement.appendChild(cElement);
                    }
                }
                
                Component parentComponent = componentUpdates[i].getParent();
                
                // Added children.
                Component[] addedChildren = componentUpdates[i].getAddedChildren();
                if (addedChildren.length > 0) {
                    Element addElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "add");
                    String parentId;
                    //FIXME. Ugly hack for root window id.  Need to either render window as a div...or something.
                    if (parentComponent instanceof Window) {
                        parentId = "c_root";
                    } else {
                        parentId = UserInstance.getElementId(parentComponent);
                    }
                    addElement.setAttribute("i", parentId);
                    // sort components by their index
                    SortedMap indexedComponents = new TreeMap();
                    for (int j = 0; j < addedChildren.length; ++j) {
                        Component addedChild = addedChildren[j];
                        indexedComponents.put(new Integer((parentComponent.visibleIndexOf(addedChild))), addedChild);
                    }
                    Iterator indexedComponentsIter = indexedComponents.entrySet().iterator();
                    while (indexedComponentsIter.hasNext()) {
                        Entry entry = (Entry)indexedComponentsIter.next();
                        Element cElement = renderComponentState(addElement, (Component)entry.getValue());
                        cElement.setAttribute("x", ((Integer)entry.getKey()).toString()); 
                    }
                }
                
                // Updated properties.
                //FIXME. move to method?
                String[] updatedPropertyNames = componentUpdates[i].getUpdatedPropertyNames();
                if (updatedPropertyNames.length > 0) {
                    Element upElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "up");
                    upElement.setAttribute("i", UserInstance.getElementId(parentComponent));
                    renderUpdatedProperties(upElement, parentComponent, componentUpdates[i]);
                }
                
                Component[] updatedLayoutDataChildren = componentUpdates[i].getUpdatedLayoutDataChildren();
                for (int j = 0; j < updatedLayoutDataChildren.length; ++j) {
                    Element upElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "up");
                    upElement.setAttribute("i", UserInstance.getElementId(updatedLayoutDataChildren[j]));
                    renderUpdatedLayoutData(upElement, updatedLayoutDataChildren[j]);
                }
            }
        }
        
        updateManager.purge();
    }
    
    /**
     * Renders the full state of a specific component.
     * 
     * @param parentElement the element to append the component element to
     * @param c the rendering component
     */
    private Element renderComponentState(Element parentElement, Component c)
    throws SerialException {
        Document document = parentElement.getOwnerDocument();
        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(c.getClass());
        if (componentPeer == null) {
            throw new IllegalStateException("No synchronize peer found for component: " + c.getClass().getName());
        }
        
        Element cElement = document.createElement("c");
        cElement.setAttribute("i", UserInstance.getElementId(c));

        cElement.setAttribute("t", componentPeer.getClientComponentType());
        
        componentPeer.init(context);

        renderComponentStyleAttributes(cElement, c);

        // Render component properties.
        Iterator propertyNameIterator = componentPeer.getOutputPropertyNames(context, c);
        while (propertyNameIterator.hasNext()) {
            String propertyName = (String) propertyNameIterator.next();
            renderProperty(cElement, componentPeer, c, propertyName, false);
        }
        
        // Render immediate event flags.
        Iterator eventTypeIterator = componentPeer.getImmediateEventTypes(context, c);
        while (eventTypeIterator.hasNext()) {
            String eventType = (String) eventTypeIterator.next();
            Element eElement = document.createElement("e");
            eElement.setAttribute("t", eventType);
            cElement.appendChild(eElement);
        }
        
        // Render child components.
        Component[] children = c.getVisibleComponents();
        for (int i = 0; i < children.length; ++i) {
            renderComponentState(cElement, children[i]);
        }
        
        // Append component element to parent.
        parentElement.appendChild(cElement);
        
        return cElement;
    }
    
    /**
     * Render style name (and style type, if necessary).
     * 
     * @param element the element to append the style attributes to
     * @param c the rendering component
     */ 
    private void renderComponentStyleAttributes(Element element, Component c) {
        StyleSheet styleSheet = c.getApplicationInstance().getStyleSheet();
        if (styleSheet != null && c.getStyleName() != null) {
            element.setAttribute("s", c.getStyleName());
            Class styleClass = getStyleClass(styleSheet, c.getStyleName(), c.getClass());
            if (styleClass != null && styleClass != c.getClass()) {
                ComponentSynchronizePeer styleComponentSyncPeer 
                        = SynchronizePeerFactory.getPeerForComponent(styleClass, false);
                if (styleComponentSyncPeer == null) {
                    element.setAttribute("st", styleClass.getName());
                } else {
                    element.setAttribute("st", styleComponentSyncPeer.getClientComponentType());
                }
            }
        }
    }
    
    private void renderProperty(Element parentElement, ComponentSynchronizePeer componentPeer, 
            Component c, String propertyName, boolean renderNulls) 
    throws SerialException {
        boolean indexedProperty = componentPeer.isOutputPropertyIndexed(context, c, propertyName);
        if (indexedProperty) {
            Iterator indicesIt = componentPeer.getOutputPropertyIndices(context, c, propertyName);
            while (indicesIt.hasNext()) {
                int index = ((Integer) indicesIt.next()).intValue();
                renderPropertyImpl(parentElement, componentPeer, c, propertyName, index, renderNulls);
            }
        } else {
            renderPropertyImpl(parentElement, componentPeer, c, propertyName, -1, renderNulls);
        }
    }

    private void renderPropertyImpl(Element parentElement, ComponentSynchronizePeer componentPeer, 
            Component c, String propertyName, int propertyIndex, boolean renderNulls) 
    throws SerialException {
        Object propertyValue = componentPeer.getOutputProperty(context, c, propertyName, propertyIndex);
        if (propertyValue == null && !renderNulls) {
            // Abort immediately if rendering of nulls is not desired.
            return;
        }
        
        // Create property element.
        Element pElement = document.createElement("p");
        
        // Set property name.
        pElement.setAttribute("n", propertyName);
        
        String methodName = componentPeer.getOutputPropertyMethodName(context, c, propertyName);
        if (methodName != null) {
            pElement.setAttribute("m", methodName);
        }
        
        if (propertyIndex != -1) {
            // Set property index.
            pElement.setAttribute("x", Integer.toString(propertyIndex));
        }
        
        if (propertyValue == null) {
            // Set nulll property value.
            pElement.setAttribute("t", "0");
        } else {
            // Set non-null property value.
            // Obtain appropriate peer.
            SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
            if (propertySyncPeer == null) {
                // Unsupported property: do nothing.
                return;
            }
            // Render property value.
            propertySyncPeer.toXml(context, c.getClass(), pElement, propertyValue);
        }
        
        // Append to parent element.
        parentElement.appendChild(pElement);
    }
    
    private void renderStyleSheet() 
    throws SerialException {
        Element ssElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSync", "ss");
        
        StyleSheet styleSheet = conn.getUserInstance().getApplicationInstance().getStyleSheet();
        if (styleSheet == null) {
            return;
        }
        
        Document document = ssElement.getOwnerDocument();
        Iterator styleNameIterator = styleSheet.getStyleNames();
        while (styleNameIterator.hasNext()) {
            String styleName = (String) styleNameIterator.next();
            Iterator componentTypeIterator = styleSheet.getComponentTypes(styleName);
            while (componentTypeIterator.hasNext()) {
                Class componentClass = (Class) componentTypeIterator.next();
                Element sElement = document.createElement("s");
                ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(componentClass);
                if (componentPeer != null) {
                    sElement.setAttribute("t", componentPeer.getClientComponentType());
                } else {
                    sElement.setAttribute("t", componentClass.getName());
                }
                if (styleName != null) {
                    sElement.setAttribute("n", styleName);
                }
                
                Style style = styleSheet.getStyle(styleName, componentClass, false);
                renderStyle(componentClass, sElement, style);
                
                ssElement.appendChild(sElement);
            }
        }
    }
    
    private void renderStyle(Class objectClass, Element parentElement, Style style)
    throws SerialException {
        Document document = parentElement.getOwnerDocument();
        Iterator it = style.getPropertyNames();
        while (it.hasNext()) {
            String propertyName = (String) it.next();
            Object propertyValue = style.getProperty(propertyName);
            if (propertyValue == null) {
                continue;
            }
            SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
            if (propertySyncPeer == null) {
                System.err.println("No peer found for property class: " + propertyValue.getClass());
                //FIXME. figure out how these should be handled...ignoring is probably best.
                continue;
            }
            
            //FIXME these need to handle indexed properties.
            Element pElement = document.createElement("p");
            pElement.setAttribute("n", propertyName);
            propertySyncPeer.toXml(context, objectClass, pElement, propertyValue);
            parentElement.appendChild(pElement);
        }
    }
    
    private void renderUpdatedLayoutData(Element upElement, Component c)
    throws SerialException {
        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(c.getClass());
        if (componentPeer == null) {
            throw new IllegalStateException("No synchronize peer found for component: " + c.getClass().getName());
        }
        renderProperty(upElement, componentPeer, c, Component.PROPERTY_LAYOUT_DATA, true); 
    }
    
    private void renderUpdatedProperties(Element upElement, Component c, ServerComponentUpdate update) 
    throws SerialException {
        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(c.getClass());
        if (componentPeer == null) {
            throw new IllegalStateException("No synchronize peer found for component: " + c.getClass().getName());
        }

        Iterator propertyNameIt = componentPeer.getUpdatedOutputPropertyNames(context, c, update);
        while (propertyNameIt.hasNext()) {
            String propertyName = (String) propertyNameIt.next();
            renderProperty(upElement, componentPeer, c, propertyName, true);
        }
        
        if (update.hasUpdatedProperty(Component.STYLE_NAME_CHANGED_PROPERTY)) {
            renderComponentStyleAttributes(upElement, c);
        }
    }
}
