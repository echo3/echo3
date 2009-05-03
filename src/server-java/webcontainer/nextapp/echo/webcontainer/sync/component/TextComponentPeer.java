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

package nextapp.echo.webcontainer.sync.component;

import nextapp.echo.app.Component;
import nextapp.echo.app.text.TextComponent;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Base synchronization peer for <code>TextComponent</code>s.
 */
public class TextComponentPeer extends AbstractComponentSynchronizePeer {

    /**
     * Constant for <code>PROPERTY_SYNC_MODE</code> indicating that the server should be notified of text changes only
     * after an action event is fired.
     * 
     * <strong>EXPERIMENTAL, for testing purposes only, do not use.</strong>
     */
    public static final int SYNC_ON_ACTION = 0;

    /**
     * Constant for <code>PROPERTY_SYNC_MODE</code> indicating that the server should be notified of text changes after
     * each change.  The <code>PROPERTY_SYNC_DELAY</code> and <code>PROPERTY_SYNC_INITIAL_DELAY</code> properties may be used to
     * configure the amount of inactivity after which change events are fired.
     * 
     * <strong>EXPERIMENTAL, for testing purposes only, do not use.</strong>
     */
    public static final int SYNC_ON_CHANGE = 1;
    
    /**
     * The mode in which the server should be synchronized in response to changes to a text component's value.
     * One of the following values:
     * <ul>
     *  <li><code>SYNC_ON_ACTION</code> (the default)</li>
     *  <li><code>SYNC_ON_CHANGE</code></li>
     * </ul>
     * 
     * <strong>EXPERIMENTAL, for testing purposes only, do not use.</strong>
     */
    public static final String PROPERTY_SYNC_MODE = "syncMode";
    
    /**
     * The time in milliseconds after which the server will be notified of changes to a text component.  This value is used only
     * when the synchronization mode is set to <code>SYNC_ON_CHANGE</code>.
     * The default value is 250ms.
     * 
     * <strong>EXPERIMENTAL, for testing purposes only, do not use.</strong>
     */
    public static final String PROPERTY_SYNC_DELAY = "syncDelay";

    /**
     * The time in milliseconds after which the server will first be notified of changes to a text component.  
     * This value is used only when the synchronization mode is set to <code>SYNC_ON_CHANGE</code>.
     * The default value is 0ms, such that the first change to a text component will immediately notify the server.
     * 
     * <strong>EXPERIMENTAL, for testing purposes only, do not use.</strong>
     */
    public static final String PROPERTY_SYNC_INITIAL_DELAY = "syncInitialDelay";
    
    /**
     * Input property name for text change events.
     */
    public static final String INPUT_CHANGE = "change";
    
    /** The associated client-side JavaScript module <code>Service</code>. */
    private static final Service TEXT_COMPONENT_SERVICE = JavaScriptService.forResources("Echo.TextComponent", 
            new String[] { "nextapp/echo/webcontainer/resource/Sync.TextComponent.js",
            "nextapp/echo/webcontainer/resource/Sync.RemoteTextComponent.js" });
    
    static {
        WebContainerServlet.getServiceRegistry().add(TEXT_COMPONENT_SERVICE);
    }
    
    /** Default constructor. */
    public TextComponentPeer() {
        super();
        addOutputProperty(TextComponent.TEXT_CHANGED_PROPERTY);
        addOutputProperty(PROPERTY_SYNC_MODE);
        addEvent(new EventPeer(TextComponent.INPUT_ACTION, TextComponent.ACTION_LISTENERS_CHANGED_PROPERTY) {
            public boolean hasListeners(Context context, Component c) {
                return ((TextComponent) c).hasActionListeners();
            }
        });
        addEvent(new EventPeer(INPUT_CHANGE, PROPERTY_SYNC_MODE) {
            public boolean hasListeners(Context context, Component c) {
                return ((Integer) c.getRenderProperty(PROPERTY_SYNC_MODE, new Integer(SYNC_ON_ACTION))).intValue() 
                        == SYNC_ON_CHANGE;
            }
        });
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
        return mode ? "TC" : "TextComponent";
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return TextComponent.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (TextComponent.TEXT_CHANGED_PROPERTY.equals(propertyName)) {
            return String.class;
        }
        return null;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(TextComponent.TEXT_CHANGED_PROPERTY)) {
            TextComponent textComponent = (TextComponent) component;
            return textComponent.getText();
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(TEXT_COMPONENT_SERVICE.getId());
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(TextComponent.TEXT_CHANGED_PROPERTY)) {
            if (newValue == null) {
                // Set input value to empty string if null such that property will not be sent back to client as an update
                // when it is changed to an empty string by the document model.
                newValue = "";
            }
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            if (!Boolean.FALSE.equals(component.getRenderProperty(TextComponent.PROPERTY_EDITABLE))) {
                clientUpdateManager.setComponentProperty(component, TextComponent.TEXT_CHANGED_PROPERTY, newValue);
            }
        }
    }
}
