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
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Map.Entry;

import nextapp.echo.app.Command;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.Window;
import nextapp.echo.app.reflect.ComponentIntrospector;
import nextapp.echo.app.reflect.IntrospectorFactory;
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
 * to its synchronization HTTP connection.
 */
class OutputProcessor {
    
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
                return userInstance;
            } else if (specificContextClass == ServerMessage.class) {
                return serverMessage;
            } else {
                return null;
            }
        }
    }
    
    private Connection conn;
    private UserInstance userInstance;
    private ServerMessage serverMessage;
    private Context context;
    private PropertyPeerFactory propertyPeerFactory;
    private Document document;
    private int nextPropertyKey = 0;
    private Map propertyValueToKeyMap = null;
    private Element spElement;
    
    /**
     * Cached set of known-to-be-not-lazily-rendered components.
     * Used to aid performance of isRendered().
     */
    private Set renderedComponents = new HashSet();
    
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
        userInstance = conn.getUserInstance();
        propertyPeerFactory = PropertySerialPeerFactory.INSTANCE; //FIXME temporary
    }
    
    private Class getComponentStyleClass(StyleSheet styleSheet, String styleName, Class componentClass) {
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
    private boolean isComponentRendered(Component component) {
        //FIXME. This code is 98% untested in Echo3.
        if (renderedComponents.contains(component)) {
            return true;
        }
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
        boolean rendered = isComponentRendered(parent);
        if (rendered) {
            renderedComponents.add(component);
        }
        return rendered;
    }
    
    public void process() 
    throws IOException {
        serverMessage.setTransactionId(userInstance.getNextTransactionId());
        try {
            processServerOutput();
            conn.setContentType(ContentType.TEXT_XML);
            DomUtil.save(serverMessage.getDocument(), conn.getWriter(), null);
        } catch (SerialException ex) {
            //FIXME. Bad exception handling.
            throw new IOException(ex.toString());
        } catch (SAXException ex) {
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
        UpdateManager updateManager = userInstance.getUpdateManager();
        ServerUpdateManager serverUpdateManager = updateManager.getServerUpdateManager();
        
        if (serverUpdateManager.isFullRefreshRequired()) {
            // Special case: full refresh.  Render entire component hierarchy by rendering an
            // add directive to add the Window's child ContentPane to the root.   
            // Render all properties of Window. 
            Window window = userInstance.getApplicationInstance().getDefaultWindow();
            serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "CSyncUp", "fr");
            serverMessage.setAttribute("root", userInstance.getRootHtmlElementId());
            
            // Render Style Sheet
            renderStyleSheet();
            
            // Render Add ContentPane to Window
            ContentPane content = window.getContent();
            if (content == null) {
                throw new IllegalStateException("No content to render: default window has no content.");
            }
            
            Element upElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSyncUp", "up");
            upElement.setAttribute("r", "true"); // Adding to root.
            renderComponentState(upElement, content);

            // Render Window properties
            ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(window.getClass());
            if (componentPeer == null) {
                throw new IllegalStateException("No synchronize peer found for component: " + window.getClass().getName());
            }
            Iterator propertyNameIterator = componentPeer.getOutputPropertyNames(context, window);
            while (propertyNameIterator.hasNext()) {
                String propertyName = (String) propertyNameIterator.next();
                renderComponentProperty(upElement, componentPeer, window, propertyName, false);
            }
        } else {
            ServerComponentUpdate[] componentUpdates = updateManager.getServerUpdateManager().getComponentUpdates();
            
            // Remove any updates whose updates are descendants of components which have not been rendered to the
            // client yet due to lazy-loading containers.
            for (int i = 0; i < componentUpdates.length; ++i) {
                if (!isComponentRendered(componentUpdates[i].getParent())) {
                    componentUpdates[i] = null;
                }
            }
            
            // Render Component Synchronization Removes
            for (int i = 0; i < componentUpdates.length; ++i) {
                if (componentUpdates[i] == null || !componentUpdates[i].hasRemovedChildren()) {
                    // Update removed, or update has no removed children: do nothing.
                    continue;
                }

                Element rmElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSyncRm", "rm");

                Component parentComponent = componentUpdates[i].getParent();
                setComponentId(rmElement, parentComponent);
                    
                Component[] removedChildren = componentUpdates[i].getRemovedChildren();
                StringBuffer out = new StringBuffer();
                for (int j = 0; j < removedChildren.length; ++j) {
                    if (j > 0) {
                        out.append(",");
                    }
                    out.append(userInstance.getClientRenderId(removedChildren[j]));
                }
                rmElement.setAttribute("rm", out.toString());
            }

            // Render Component Synchronization Updates
            for (int i = 0; i < componentUpdates.length; ++i) {
                if (componentUpdates[i] == null) {
                    // Update removed, do nothing.
                    continue;
                }
                
                // Process added/removed children and updated properties of update's parent component.
                if (componentUpdates[i].hasAddedChildren() || componentUpdates[i].hasUpdatedProperties()) {
                    Component parentComponent = componentUpdates[i].getParent();
                    Element upElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSyncUp", "up");
                    setComponentId(upElement, parentComponent);
                
                    // Added children.
                    Component[] addedChildren = componentUpdates[i].getAddedChildren();
                    if (addedChildren.length > 0) {
                        // sort components by their index
                        SortedMap indexedComponents = new TreeMap();
                        for (int j = 0; j < addedChildren.length; ++j) {
                            Component addedChild = addedChildren[j];
                            if (isComponentRendered(addedChild)) {
                                indexedComponents.put(new Integer((parentComponent.visibleIndexOf(addedChild))), addedChild);
                            }
                        }
                        Iterator indexedComponentsIter = indexedComponents.entrySet().iterator();
                        while (indexedComponentsIter.hasNext()) {
                            Entry entry = (Entry)indexedComponentsIter.next();
                            Element cElement = renderComponentState(upElement, (Component) entry.getValue());
                            cElement.setAttribute("x", ((Integer)entry.getKey()).toString()); 
                        }
                    }
                    
                    // Updated properties.
                    renderComponentUpdatedProperties(upElement, parentComponent, componentUpdates[i]);
                }
                
                // Process updated layout data on immediate children of update's parent component.
                if (componentUpdates[i].hasUpdatedLayoutDataChildren()) {
                    Component[] updatedLayoutDataChildren = componentUpdates[i].getUpdatedLayoutDataChildren();
                    for (int j = 0; j < updatedLayoutDataChildren.length; ++j) {
                        Component component = updatedLayoutDataChildren[j];
                        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
                        if (componentPeer == null) {
                            throw new IllegalStateException("No synchronize peer found for component: " 
                                    + component.getClass().getName());
                        }
                        Element upElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSyncUp", "up");
                        setComponentId(upElement, component);
                        renderComponentProperty(upElement, componentPeer, component, Component.PROPERTY_LAYOUT_DATA, true); 
                    }
                }
            }
        }
        
        // Render Commands.
        Command[] commands = serverUpdateManager.getCommands();
        for (int i = 0; i < commands.length; ++i) {
            CommandSynchronizePeer commandPeer = SynchronizePeerFactory.getPeerForCommand(commands[i].getClass());
            if (commandPeer == null) {
                throw new IllegalStateException("No synchronize peer found for command: " 
                        + commands[i].getClass().getName());
            }
            commandPeer.init(context);
            Element commandExecuteElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CmdExec", "cmd");
            commandExecuteElement.setAttribute("t", commandPeer.getClientCommandType());
            Iterator propertyNameIt = commandPeer.getPropertyNames(context, commands[i]);
            while (propertyNameIt.hasNext()) {
                String propertyName = (String) propertyNameIt.next();
                if (commandPeer.isPropertyIndexed(context, commands[i], propertyName)) {
                    Iterator propertyIndexIt = commandPeer.getPropertyIndices(context, commands[i], propertyName);
                    while (propertyIndexIt.hasNext()) {
                        int propertyIndex = ((Integer) propertyIndexIt.next()).intValue();
                        renderCommandProperty(commandExecuteElement, commandPeer, commands[i], propertyName, propertyIndex);
                    }
                } else {
                    renderCommandProperty(commandExecuteElement, commandPeer, commands[i], propertyName, -1);
                }
            }
        }
        
        Component focusedComponent = userInstance.getApplicationInstance().getFocusedComponent();
        if (focusedComponent != null) {
            Element focusElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CFocus", "focus");
            focusElement.setAttribute("i", userInstance.getClientRenderId(focusedComponent));
        }        
        
        if (userInstance.getApplicationInstance().hasTaskQueues()) {
             //FIXME ...not sure I want this in the root of the smsg again.
            serverMessage.setAttribute("async-interval", Integer.toString(userInstance.getCallbackInterval()));
        }
    }
    
    private void renderCommandProperty(Element parentElement, CommandSynchronizePeer commandPeer,
            Command command, String propertyName, int propertyIndex) 
    throws SerialException {
        Element pElement = document.createElement("p");
        pElement.setAttribute("n", propertyName);
        if (propertyIndex != -1) {
            // Set property index.
            pElement.setAttribute("x", Integer.toString(propertyIndex));
        }
        Object propertyValue = commandPeer.getProperty(context, command, propertyName, propertyIndex);
        if (propertyValue == null) {
            // Set null property value.
            pElement.setAttribute("t", "0");
        } else {
            SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
            if (propertySyncPeer == null) {
                // Unsupported property: do nothing.
                return;
            }

            // Render property value.
            propertySyncPeer.toXml(context, command.getClass(), pElement, propertyValue);
        }
        
        // Append to parent element.
        parentElement.appendChild(pElement);
    }
    
    private void renderComponentProperty(Element parentElement, ComponentSynchronizePeer componentPeer, 
            Component c, String propertyName, boolean renderNulls) 
    throws SerialException {
        boolean indexedProperty = componentPeer.isOutputPropertyIndexed(context, c, propertyName);
        if (indexedProperty) {
            Iterator indicesIt = componentPeer.getOutputPropertyIndices(context, c, propertyName);
            while (indicesIt.hasNext()) {
                int index = ((Integer) indicesIt.next()).intValue();
                renderComponentPropertyImpl(parentElement, componentPeer, c, propertyName, index, renderNulls);
            }
        } else {
            renderComponentPropertyImpl(parentElement, componentPeer, c, propertyName, -1, renderNulls);
        }
    }
    
    private void renderComponentPropertyImpl(Element parentElement, ComponentSynchronizePeer componentPeer, 
            Component c, String propertyName, int propertyIndex, boolean renderNulls) 
    throws SerialException {
        Object propertyValue = componentPeer.getOutputProperty(context, c, propertyName, propertyIndex);
        if (propertyValue == null && !renderNulls) {
            // Abort immediately if rendering of nulls is not desired.
            return;
        }
        
        // Create property element.
        Element pElement = document.createElement("p");
        
        String propertyKey = null;
        Element propertyDataElement;
        if (propertyValue != null && componentPeer.isOutputPropertyReferenced(context, c, propertyName)) {
            if (spElement == null) {
                spElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "CSyncUp", "sp");
            }
            
            if (propertyValueToKeyMap == null) {
                propertyValueToKeyMap = new HashMap();
            } else {
                propertyKey = (String) propertyValueToKeyMap.get(propertyValue);
            }
            
            if (propertyKey == null) {
                propertyKey = Integer.toString(nextPropertyKey++);
                propertyValueToKeyMap.put(propertyValue, propertyKey);

                Element rpElement = document.createElement("rp");
                rpElement.setAttribute("i", propertyKey);
                propertyDataElement = rpElement;
                
                spElement.appendChild(rpElement);
            } else {
                propertyDataElement = null;
            }

            pElement.setAttribute("r", propertyKey);
        } else {
            propertyDataElement = pElement;
        }
        
        String methodName = componentPeer.getOutputPropertyMethodName(context, c, propertyName);
        if (methodName != null) {
            // Set method name.
            pElement.setAttribute("m", methodName);
        } else {
            // Set property name.
            pElement.setAttribute("n", propertyName);
        }
        
        if (propertyIndex != -1) {
            // Set property index.
            pElement.setAttribute("x", Integer.toString(propertyIndex));
        }
        
        if (propertyValue == null) {
            // Set nulll property value.
            pElement.setAttribute("t", "0");
        } else if (propertyDataElement != null) {
            // Set non-null property value (if necessary, i.e., if propertyDataElement is set).
            // Obtain appropriate peer.
            SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
            if (propertySyncPeer == null) {
                // Unsupported property: do nothing.
                return;
            }

            // Render property value.
            propertySyncPeer.toXml(context, c.getClass(), propertyDataElement, propertyValue);
        }
        
        // Append to parent element.
        parentElement.appendChild(pElement);
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
        cElement.setAttribute("i", userInstance.getClientRenderId(c));

        cElement.setAttribute("t", componentPeer.getClientComponentType());
        
        componentPeer.init(context);

        renderComponentStyleAttributes(cElement, c);
        
        if (!c.isEnabled()) {
            cElement.setAttribute("en", "false");
        }
        
        // Render component properties.
        Iterator propertyNameIterator = componentPeer.getOutputPropertyNames(context, c);
        while (propertyNameIterator.hasNext()) {
            String propertyName = (String) propertyNameIterator.next();
            renderComponentProperty(cElement, componentPeer, c, propertyName, false);
        }
        
        // Render immediate event flags.
        Iterator eventTypeIterator = componentPeer.getEventTypes(context, c);
        while (eventTypeIterator.hasNext()) {
            String eventType = (String) eventTypeIterator.next();
            if (!componentPeer.hasListeners(context, c, eventType)) {
                continue;
            }
            Element eElement = document.createElement("e");
            eElement.setAttribute("t", eventType);
            eElement.setAttribute("v", "true");
            cElement.appendChild(eElement);
        }
        
        // Render child components.
        Component[] children = c.getVisibleComponents();
        for (int i = 0; i < children.length; ++i) {
            if (isComponentRendered(children[i])) {
                renderComponentState(cElement, children[i]);
            }
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
        }
    }
    
    private void renderComponentUpdatedProperties(Element upElement, Component c, ServerComponentUpdate update) 
    throws SerialException {
        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(c.getClass());
        if (componentPeer == null) {
            throw new IllegalStateException("No synchronize peer found for component: " + c.getClass().getName());
        }

        Iterator propertyNameIt = componentPeer.getUpdatedOutputPropertyNames(context, c, update);
        while (propertyNameIt.hasNext()) {
            String propertyName = (String) propertyNameIt.next();
            renderComponentProperty(upElement, componentPeer, c, propertyName, true);
        }
        
        if (update.hasUpdatedProperties()) {
            if (update.hasUpdatedProperty(Component.STYLE_NAME_CHANGED_PROPERTY)) {
                renderComponentStyleAttributes(upElement, c);
            }
            
            // Render enabled state.
            if (update.hasUpdatedProperty(Component.ENABLED_CHANGED_PROPERTY)) {
                upElement.setAttribute("en", update.getParent().isEnabled() ? "true" : "false");
            }
        }
        
        // Render immediate event flags.
        Iterator eventTypeIterator = componentPeer.getEventTypes(context, c);
        while (eventTypeIterator.hasNext()) {
            String eventType = (String) eventTypeIterator.next();
            if (!componentPeer.hasUpdatedListeners(context, c, update, eventType)) {
                continue;
            }
            Element eElement = document.createElement("e");
            eElement.setAttribute("t", eventType);
            eElement.setAttribute("v", componentPeer.hasListeners(context, c, eventType) ? "true" : "false");
            upElement.appendChild(eElement);
        }
    }
    
    private void renderStyle(Class componentClass, Element parentElement, Style style)
    throws SerialException {
        Document document = parentElement.getOwnerDocument();
        
        ComponentIntrospector ci;
        try {
            ci = (ComponentIntrospector) IntrospectorFactory.get(componentClass.getName(),
                    componentClass.getClassLoader());
        } catch (ClassNotFoundException ex) {
            // Should never occur.
            throw new RuntimeException("Internal error.", ex);
        }
        
        Iterator it = style.getPropertyNames();
        while (it.hasNext()) {
            String propertyName = (String) it.next();

            if (ci.isIndexedProperty(propertyName)) {
                Iterator indicesIt = style.getPropertyIndices(propertyName);
                while (indicesIt.hasNext()) {
                    int index = ((Integer) indicesIt.next()).intValue();
                    Object propertyValue = style.getIndexedProperty(propertyName, index);
                    if (propertyValue == null) {
                        continue;
                    }
                    SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
                    if (propertySyncPeer == null) {
                        System.err.println("No peer found for property class: " + propertyValue.getClass());
                        //FIXME. figure out how these should be handled...ignoring is probably best.
                        continue;
                    }
                    Element pElement = document.createElement("p");
                    pElement.setAttribute("n", propertyName);
                    // Set property index.
                    pElement.setAttribute("x", Integer.toString(index));
                    propertySyncPeer.toXml(context, componentClass, pElement, propertyValue);
                    parentElement.appendChild(pElement);
                }
            } else {
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
                propertySyncPeer.toXml(context, componentClass, pElement, propertyValue);
                parentElement.appendChild(pElement);
            }
        }
    }
    
    private void renderStyleSheet() 
    throws SerialException {
        Element ssElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CSyncUp", "ss");
        
        StyleSheet styleSheet = userInstance.getApplicationInstance().getStyleSheet();
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

    /**
     * Utility method to identify a component in an add/update directive.
     * Adds an 'r="true"' attribute if the updating component is the root.
     * Adds an 'i="xxx"' attribute if the updating component is not root
     * 
     * @param element the element to add the component identifier to
     * @param component the component
     */
    private void setComponentId(Element element, Component component) {
        if (component.getParent() == null) {
            element.setAttribute("r", "true");
        } else {
            element.setAttribute("i", userInstance.getClientRenderId(component));
        }
    }
}
