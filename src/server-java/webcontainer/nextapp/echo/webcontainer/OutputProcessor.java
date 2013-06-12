/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Map.Entry;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Command;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.Window;
import nextapp.echo.app.reflect.ComponentIntrospector;
import nextapp.echo.app.reflect.IntrospectorFactory;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.update.ServerUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.util.Log;

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
     * Returns the client locale string for the specified <code>Locale</code> object.
     * The client locale contains the language first, and if set, the country code with a preceding hyphen.
     * For example, US English would be rendered as "en-US".
     * 
     * @param locale the locale
     * @return the client-side locale string
     */
    public static String getClientLocaleString(Locale locale) {
        String language = locale.getLanguage();
        String country = locale.getCountry();
        if (country.length() == 0) {
            return language;
        } else {
            return language + "-" + country;
        }
    }
   
    /**
     * <code>Context</code> implementation.
     */
    private class OutputContext extends SynchronizationContext {
        
        /**
         * Creates a new <code>OutputContext</code>.
         */
        public OutputContext() {
            super(conn, document);
        }

        /**
         * @see nextapp.echo.app.util.Context#get(java.lang.Class)
         */
        public Object get(Class specificContextClass) {
            if (specificContextClass == ServerMessage.class) {
                return serverMessage;
            } else {
                return super.get(specificContextClass);
            }
        }
    }
    
    private Connection conn;
    private UserInstance userInstance;
    private ServerMessage serverMessage;
    private ServerUpdateManager serverUpdateManager;
    
    private Context context;
    private PropertyPeerFactory propertyPeerFactory;
    private Document document;
    private int nextPropertyKey = 0;
    private Map propertyValueToKeyMap = null;
    private int nextStyleKey = 0;
    private Map styleValueToKeyMap = null;
    private Element rpElement;
    private Element rsElement;
    private SynchronizationState syncState;
    
    private ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

    /**
     * Creates a new <code>OutputProcessor</code>.
     * 
     * @param syncState the <code>SynchronizationState</code> of the current synchronization
     * @param conn the <code>Connection</code> for which the output is being generated.
     */
    public OutputProcessor(SynchronizationState syncState, Connection conn) {
        super();
        this.syncState = syncState;
        this.conn = conn;
        serverMessage = new ServerMessage();
        document = serverMessage.getDocument();
        context = new OutputContext();
        userInstance = conn.getUserInstance();
        serverUpdateManager = userInstance.getUpdateManager().getServerUpdateManager();
        propertyPeerFactory = PropertySerialPeerFactory.forClassLoader(classLoader);
    }
        
    /**
     * Processes pending output from the application, generating a server message and rendering it
     * to the output <code>PrintWriter</code> of the <code>Connection</code> specified in the constructor.
     */
    public void process() 
    throws IOException {
        serverMessage.setUserInstanceId(userInstance.getId());
        serverMessage.setTransactionId(userInstance.getNextTransactionId());
        if (syncState.isOutOfSync()) {
            serverMessage.setResync();
        }
        
        try {
            // Render output to server message DOM.
            if (serverUpdateManager.isFullRefreshRequired()) {
                renderApplicationFull();
                renderComponentsFull();
            } else {
                renderApplicationIncremental();
                renderComponentsIncremental();
            }
            renderCommands();
            renderFocus();
            renderAsyncState();
        } catch (SerialException ex) {
            throw new SynchronizationException("Cannot serialize server state.", ex);
        }
        
        try {
            // Render DOM to <code>PrintWriter</code>.
            conn.setContentType(ContentType.TEXT_XML);
            DomUtil.save(serverMessage.getDocument(), conn.getWriter(), null);
        } catch (SAXException ex) {
            throw new SynchronizationException("Cannot serialize server state.", ex);
        }
        
        if (WebContainerServlet.DEBUG_PRINT_MESSAGES_TO_CONSOLE) {
            // Print ServerMessage DOM to console. 
            try {
                System.err.println("======== Response: " + userInstance.getCurrentTransactionId() + " ========");
                DomUtil.save(document, System.err, DomUtil.OUTPUT_PROPERTIES_INDENT);
                System.err.println();
            } catch (SAXException ex) {
                // Should not generally occur.
                throw new SynchronizationException("Cannot render XML sync message to console.", ex);
            }
        }
    }
    
    /**
     * Renders asynchronous callback settings to server message.
     */
    private void renderAsyncState() {
        if (userInstance.getApplicationInstance().hasTaskQueues()) {
            serverMessage.setAttribute("async-interval", Integer.toString(userInstance.getCallbackInterval()));
            serverMessage.setAttribute("ws-enable", Boolean.toString(conn.getServlet().hasWebSocketConnectionHandler()));
        }
    }
    
    /**
     * Renders full-refresh application-level properties.
     */
    private void renderApplicationFull() 
    throws SerialException {
        // Clear User Instance updated property names.
        userInstance.getUpdatedPropertyNames();
        
        Element localeElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "AppSync", "locale");
        localeElement.appendChild(document.createTextNode(getClientLocaleString(
                userInstance.getApplicationInstance().getLocale())));
        Element layoutDirElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "AppSync", "dir");
        layoutDirElement.appendChild(document.createTextNode(
                userInstance.getApplicationInstance().getLayoutDirection().isLeftToRight() ? "ltr" : "rtl"));
        renderClientConfiguration();
    }
    
    /**
     * Renders incrementally updated application instance properties.
     */
    private void renderApplicationIncremental() 
    throws SerialException {
        Iterator it = userInstance.getUpdatedPropertyNames();
        while (it.hasNext()) {
            String propertyName = (String) it.next();
            if (UserInstance.PROPERTY_CLIENT_CONFIGURATION.equals(propertyName)) {
                renderClientConfiguration();
            } else if (ApplicationInstance.STYLE_SHEET_CHANGED_PROPERTY.equals(propertyName)) {
                renderStyleSheet();
            }
        }
    }
    
    /**
     * Renders state of <code>ClientConfiguration</code> object associated with the <code>UserInstance</code>.
     */
    private void renderClientConfiguration() 
    throws SerialException {
        ClientConfiguration config = userInstance.getClientConfiguration();
        if (config == null) {
            return;
        }
        
        Element configElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "AppSync", "config");
        String[] propertyNames = config.getPropertyNames();
        for (int i = 0; i < propertyNames.length; ++i) {
            Element pElement = document.createElement("p");
            pElement.setAttribute("n", propertyNames[i]);
            Object propertyValue = config.getProperty(propertyNames[i]);
            
            
            if (propertyValue == null) {
                // Set null property value.
                pElement.setAttribute("t", "0");
            } else {
                SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
                if (propertySyncPeer == null) {
                    // Unsupported property: do nothing.
                    continue;
                }
    
                // Render property value.
                propertySyncPeer.toXml(context, ClientConfiguration.class, pElement, propertyValue);
            }
            configElement.appendChild(pElement);
        }
    }
    
    /**
     * Renders enqueued commands to server message.
     */
    private void renderCommands() 
    throws SerialException {
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
    }
    
    /**
     * Renders an individual property of a <code>Command</code>.
     * 
     * @param commandExecuteElement the command execute element to which the property should be added
     * @param commandPeer the <code>CommandSynchronizePeer</code>
     * @param command the <code>Command</code>
     * @param propertyName the name of the property
     * @param propertyIndex the property index
     * @throws SerialException
     */
    private void renderCommandProperty(Element commandExecuteElement, CommandSynchronizePeer commandPeer,
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
        commandExecuteElement.appendChild(pElement);
    }
    
    /**
     * Renders the state of the entire component hierarchy to the server message, i.e.,
     * on initialization or when the client page is reloaded.
     * 
     * @throws SerialException
     */
    private void renderComponentsFull()
    throws SerialException {
        // Special case: clear/full redraw.  Render entire component hierarchy by rendering an
        // add directive to add the Window's child ContentPane to the root.   
        // Render all properties of Window. 
        Window window = userInstance.getApplicationInstance().getDefaultWindow();
        serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "CSyncIn", "cl");
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
    }
    
    /**
     * Renders an incremental update to the state of the client component hierarchy.
     * 
     * @throws SerialException
     */
    private void renderComponentsIncremental() 
    throws SerialException {
        ServerComponentUpdate[] componentUpdates = serverUpdateManager.getComponentUpdates();
        
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
            Set removedIdSet = new HashSet(); // Set containing removed ids, to avoid removing same id multiple times.
            StringBuffer out = new StringBuffer();
            for (int j = 0; j < removedChildren.length; ++j) {
                String renderId = removedChildren[j].getLastRenderId();
                if (renderId != null) {
                    renderId = userInstance.getClientRenderId(renderId);
                } else {
                    renderId = userInstance.getClientRenderId(removedChildren[j]);
                }
                if (removedIdSet.contains(renderId)) {
                    continue;
                }
                if (j > 0) {
                    out.append(",");
                }
                out.append(renderId);
                removedIdSet.add(renderId);
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
                        indexedComponents.put(new Integer((parentComponent.visibleIndexOf(addedChild))), addedChild);
                    }
                    Iterator indexedComponentsIter = indexedComponents.entrySet().iterator();
                    int lastIndex = Integer.MIN_VALUE;
                    while (indexedComponentsIter.hasNext()) {
                        Entry entry = (Entry)indexedComponentsIter.next();
                        Element cElement = renderComponentState(upElement, (Component) entry.getValue());
                        int index = ((Integer) entry.getKey()).intValue();
                        if (index != lastIndex + 1) {
                            cElement.setAttribute("x", Integer.toString(index));
                        }
                        lastIndex = index;
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
    
    /**
     * Renders a single property of a component.
     * 
     * @param parentElement the component element ("c") or update element ("up") on which the property should be added. 
     * @param componentPeer the peer of the component
     * @param c the component
     * @param propertyName the name of the property
     * @param renderNulls flag indicating whether null values should be rendered (i.e., when updating an existing) 
     *        or ignored (i.e., when rendering a complete component)
     * @throws SerialException
     */
    private void renderComponentProperty(Element parentElement, ComponentSynchronizePeer componentPeer, 
            Component c, String propertyName, boolean renderNulls) 
    throws SerialException {
        boolean indexedProperty = componentPeer.isOutputPropertyIndexed(context, c, propertyName);
        if (indexedProperty) {
            Iterator indicesIt = componentPeer.getOutputPropertyIndices(context, c, propertyName);
            if (indicesIt == null) {
                // Abort immediately if no indices can be determined.
                return;
            }
            while (indicesIt.hasNext()) {
                int index = ((Integer) indicesIt.next()).intValue();
                renderComponentPropertyImpl(parentElement, componentPeer, c, propertyName, index, renderNulls);
            }
        } else {
            renderComponentPropertyImpl(parentElement, componentPeer, c, propertyName, -1, renderNulls);
        }
    }
    
    /**
     * Implementation method for renderComponentProperty().
     * This method is invoked by renderComponentProperty() to render a non-indexed property or to render individual
     * indices of an indexed property
     * 
     * @param parentElement the component element ("c") or update element ("up") on which the property should be added. 
     * @param componentPeer the peer of the component
     * @param c the component
     * @param propertyName the name of the property
     * @param propertyIndex the index of the property (-1 for a non-indexed property)
     * @param renderNulls flag indicating whether null values should be rendered (i.e., when updating an existing) 
     *        or ignored (i.e., when rendering a complete component)
     * @throws SerialException
     */
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
            if (rpElement == null) {
                // Create "reference property" container element ("rp").
                rpElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "CSyncUp", "rp");
            }
            
            if (propertyValueToKeyMap == null) {
                propertyValueToKeyMap = new HashMap();
            } else {
                propertyKey = (String) propertyValueToKeyMap.get(propertyValue);
            }
            
            if (propertyKey == null) {
                propertyKey = Integer.toString(nextPropertyKey++);
                propertyValueToKeyMap.put(propertyValue, propertyKey);

                propertyDataElement = document.createElement("p");
                propertyDataElement.setAttribute("i", propertyKey);
                
                rpElement.appendChild(propertyDataElement);
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
            // Set null property value.
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

        cElement.setAttribute("t", componentPeer.getClientComponentType(true));
        
        componentPeer.init(context, c);

        renderComponentStyleName(cElement, c, false);
        renderComponentStyle(cElement, c, false);
        
        // Render focus traversal information.
        if (c.getFocusNextId() != null || c.getFocusPreviousId() != null) {
            Element fElement = document.createElement("f");
            if (c.getFocusNextId() != null) {
                Component focusComponent = c.getApplicationInstance().getComponentByRenderId(c.getFocusNextId());
                if (focusComponent != null) {
                    fElement.setAttribute("n", userInstance.getClientRenderId(focusComponent));
                }
            }
            if (c.getFocusPreviousId() != null) {
                Component focusComponent = c.getApplicationInstance().getComponentByRenderId(c.getFocusPreviousId());
                if (focusComponent != null) {
                    fElement.setAttribute("p", userInstance.getClientRenderId(focusComponent));
                }
            }
            cElement.appendChild(fElement);
        }
        
        // Render enabled state.
        if (!c.isEnabled()) {
            Element enElement = document.createElement("en");
            enElement.appendChild(document.createTextNode("false"));
            cElement.appendChild(enElement);
        }
        
        // Render locale.
        if (c.getLocale() != null) {
            Element localeElement = document.createElement("locale");
            localeElement.appendChild(document.createTextNode(getClientLocaleString(c.getLocale())));
            cElement.appendChild(localeElement);
        }
        
        // Render layout direction.
        if (c.getLayoutDirection() != null) {
            Element dirElement = document.createElement("dir");
            dirElement.appendChild(document.createTextNode(c.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl"));
            cElement.appendChild(dirElement);
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
     * Sets the directly referenced style of a component.
     * If the style has not been rendered in the current synchronization message,
     * it will be added to it.
     */
    private void renderComponentStyle(Element element, Component c, boolean required) 
    throws SerialException {
        Style style = c.getStyle();
        if (style == null) {
            if (required) {
                element.appendChild(document.createElement("sr"));
            }
            return;
        }
        
        if (rsElement == null) {
            rsElement = serverMessage.addDirective(ServerMessage.GROUP_ID_INIT, "CSyncUp", "rs");
        }

        String styleKey = null;
        if (styleValueToKeyMap == null) {
            styleValueToKeyMap = new HashMap();
        } else {
            styleKey = (String) styleValueToKeyMap.get(style);
        }
        
        if (styleKey == null) {
            styleKey = Integer.toString(nextStyleKey++);
            styleValueToKeyMap.put(style, styleKey);

            Element sElement = document.createElement("s");
            sElement.setAttribute("i", styleKey);
            renderStyle(c.getClass(), sElement, style);
            rsElement.appendChild(sElement);
        }
        
        Element srElement = document.createElement("sr");
        srElement.appendChild(document.createTextNode(styleKey));
        element.appendChild(srElement);
    }

    /**
     * Sets the style name attribute on a component (c) element.
     * 
     * @param element the element to append the style attributes to
     * @param c the rendering component
     * @param required require attribute to be rendered, even if style is null
     *        (used when updating style)
     */ 
    private void renderComponentStyleName(Element element, Component c, boolean required) 
    throws SerialException {
        StyleSheet styleSheet = c.getApplicationInstance().getStyleSheet();
        String styleName = c.getStyleName();
        
        if (styleSheet == null || (!required && styleName == null)) { 
            return;
        }
        
        // Determine the class of the style that will be used to render the component.
        // This may be the component's class, or one of its ancestor classes.
        Class styleClass = c.getClass();
        Style style = styleSheet.getStyle(styleName, styleClass, false);
        while (style == null && styleClass != Component.class) {
            styleClass = styleClass.getSuperclass();
            style = styleSheet.getStyle(styleName, styleClass, false);
        }
        
        // Retrieve the component peer for the style class.
        ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(styleClass, false);
        
        if (componentPeer == null) {
            // A synchronize peer DOES NOT exist for the style class, the style name will be rendered as:
            // styleName:styleClass.
            componentPeer = SynchronizePeerFactory.getPeerForComponent(styleClass, true);
            if (componentPeer == null) {
                // Should not occur.
                throw new SerialException("No peer available for component: " + styleClass.getName(), null);
            }
            Element sElement = document.createElement("s");
            sElement.appendChild(document.createTextNode((styleName == null ? "" : styleName) + ":" + styleClass.getName()));
            element.appendChild(sElement);
        } else {
            // A synchronize peer exists for the style class, simply render the style name.
            Element sElement = document.createElement("s");
            sElement.appendChild(document.createTextNode(styleName == null ? "" : styleName));
            element.appendChild(sElement);
        }
    }
    
    /**
     * Renders updated properties of a component.
     * 
     * @param upElement the "up" update element
     * @param c the updating component
     * @param update the <code>ServerComponentUpdate</code>
     * @throws SerialException
     */
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
                renderComponentStyleName(upElement, c, true);
            }
            
            if (update.hasUpdatedProperty(Component.STYLE_CHANGED_PROPERTY)) {
                renderComponentStyle(upElement, c, true);
            }
            
            // Render enabled state update.
            if (update.hasUpdatedProperty(Component.ENABLED_CHANGED_PROPERTY)) {
                Element enElement = document.createElement("en");
                enElement.appendChild(document.createTextNode(update.getParent().isEnabled() ? "true" : "false"));
                upElement.appendChild(enElement);
            }
            
            // Render locale update.
            if (update.hasUpdatedProperty(Component.LOCALE_CHANGED_PROPERTY)) {
                Element localeElement = document.createElement("locale");
                if (c.getLocale() != null) {
                    localeElement.appendChild(document.createTextNode(getClientLocaleString(c.getLocale())));
                }
                upElement.appendChild(localeElement);
            }

            // Render layout direction update.
            if (update.hasUpdatedProperty(Component.LAYOUT_DIRECTION_CHANGED_PROPERTY)) {
                Element dirElement = document.createElement("dir");
                if (c.getLayoutDirection() != null) {
                    dirElement.appendChild(document.createTextNode(c.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl"));
                }
                upElement.appendChild(dirElement);
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
    
    /**
     * Renders the focus state of the application, if necessary.
     */
    private void renderFocus() {
        Component focusedComponent = userInstance.getApplicationInstance().getFocusedComponent();
        if (focusedComponent != null) {
            Element focusElement = serverMessage.addDirective(ServerMessage.GROUP_ID_UPDATE, "CFocus", "focus");
            focusElement.setAttribute("i", userInstance.getClientRenderId(focusedComponent));
        }
    }
    
    /**
     * Renders an individual style.
     * 
     * @param componentClass the component class
     * @param sElement the style ("s") element into which the style should be rendered
     * @param style the style
     * @throws SerialException
     */
    private void renderStyle(Class componentClass, Element sElement, Style style)
    throws SerialException {
        Document document = sElement.getOwnerDocument();
        
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
                    Object propertyValue = style.getIndex(propertyName, index);
                    if (propertyValue == null) {
                        continue;
                    }
                    SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
                    if (propertySyncPeer == null) {
                        // Log and ignore property value that cannot be serialized. 
                        Log.log("No peer found for property class: " + propertyValue.getClass());
                        continue;
                    }
                    Element pElement = document.createElement("p");
                    pElement.setAttribute("n", propertyName);
                    // Set property index.
                    pElement.setAttribute("x", Integer.toString(index));
                    propertySyncPeer.toXml(context, componentClass, pElement, propertyValue);
                    sElement.appendChild(pElement);
                }
            } else {
                Object propertyValue = style.get(propertyName);
                if (propertyValue == null) {
                    continue;
                }
                SerialPropertyPeer propertySyncPeer = propertyPeerFactory.getPeerForProperty(propertyValue.getClass());
                if (propertySyncPeer == null) {
                    Log.log("No peer found for property class: " + propertyValue.getClass());
                    // Log and ignore property value that cannot be serialized.
                    continue;
                }
                
                Element pElement = document.createElement("p");
                pElement.setAttribute("n", propertyName);
                propertySyncPeer.toXml(context, componentClass, pElement, propertyValue);
                sElement.appendChild(pElement);
            }
        }
    }
    
    /**
     * Renders the complete style sheet of an application to the ServerMessage.
     * 
     * @throws SerialException
     */
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
                
                // Retrieve component synchronize peer for style's SPECIFIC component class (not searching superclasses).
                ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(componentClass, false);
                if (componentPeer == null) {
                    // No synchronize peer exists for style's specific component class, find synchronize peer for
                    // a superclass.
                    componentPeer = SynchronizePeerFactory.getPeerForComponent(componentClass, true);
                    if (componentPeer == null) {
                        // No synchronize peer for any superclass.
                        throw new SerialException("No peer available for component: " + componentClass.getName(), null);
                    }
                    
                    // Render style name as styleName:styleClass.
                    sElement.setAttribute("n", (styleName == null ? "" : styleName) + ":" + componentClass.getName());
                } else {
                    // Synchronize peer does exist for style's specific component class, render style name unmodified.
                    if (styleName != null) {
                        sElement.setAttribute("n", styleName);
                    }
                }

                sElement.setAttribute("t", componentPeer.getClientComponentType(false));
                
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
