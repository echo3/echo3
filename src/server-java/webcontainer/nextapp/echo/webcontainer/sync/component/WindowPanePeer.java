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
import nextapp.echo.app.Extent;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>WindowPane</code>s.
 */
public class WindowPanePeer extends AbstractComponentSynchronizePeer {

    /** The associated client-side JavaScript module <code>Service</code>. */
    private static final Service WINDOW_PANE_SERVICE = JavaScriptService.forResource("Echo.WindowPane", 
            "nextapp/echo/webcontainer/resource/Sync.WindowPane.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(WINDOW_PANE_SERVICE);
        WebContainerServlet.getResourceRegistry().add("Echo", "resource/WindowPaneClose.gif", ContentType.IMAGE_GIF);
        WebContainerServlet.getResourceRegistry().add("Echo", "resource/WindowPaneMaximize.gif", ContentType.IMAGE_GIF);
        WebContainerServlet.getResourceRegistry().add("Echo", "resource/WindowPaneMinimize.gif", ContentType.IMAGE_GIF);
    }
    
    /**
     * Default constructor.
     */
    public WindowPanePeer() {
        super();
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(WindowPane.INPUT_CLOSE, null));
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(WindowPane.INPUT_MAXIMIZE, null));
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(WindowPane.INPUT_MINIMIZE, null));
        addOutputProperty(WindowPane.MODAL_CHANGED_PROPERTY);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
        return mode ? "WP" : "WindowPane";
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return WindowPane.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (WindowPane.PROPERTY_POSITION_X.equals(propertyName)) {
            return Extent.class;
        } else if (WindowPane.PROPERTY_POSITION_Y.equals(propertyName)) {
            return Extent.class;
        } else if (WindowPane.PROPERTY_WIDTH.equals(propertyName)) {
            return Extent.class;
        } else if (WindowPane.PROPERTY_HEIGHT.equals(propertyName)) {
            return Extent.class;
        } else if (WindowPane.PROPERTY_Z_INDEX.equals(propertyName)) {
            return Integer.class;
        } else {
            return null;
        }
    };
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *     nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        WindowPane windowPane = (WindowPane) component;
        if (WindowPane.MODAL_CHANGED_PROPERTY.equals(propertyName)) {
            return Boolean.valueOf(windowPane.isModal());
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
        serverMessage.addLibrary(WINDOW_PANE_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#storeInputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String, int, java.lang.Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
        if (WindowPane.PROPERTY_POSITION_X.equals(propertyName)) {
            clientUpdateManager.setComponentProperty(component, WindowPane.PROPERTY_POSITION_X, newValue);
        } else if (WindowPane.PROPERTY_POSITION_Y.equals(propertyName)) {
            clientUpdateManager.setComponentProperty(component, WindowPane.PROPERTY_POSITION_Y, newValue);
        } else if (WindowPane.PROPERTY_WIDTH.equals(propertyName)) {
            clientUpdateManager.setComponentProperty(component, WindowPane.PROPERTY_WIDTH, newValue);
        } else if (WindowPane.PROPERTY_HEIGHT.equals(propertyName)) {
            clientUpdateManager.setComponentProperty(component, WindowPane.PROPERTY_HEIGHT, newValue);
        } else if (WindowPane.PROPERTY_Z_INDEX.equals(propertyName)) {
            clientUpdateManager.setComponentProperty(component, WindowPane.PROPERTY_Z_INDEX, newValue);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#processEvent(nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component, java.lang.String, java.lang.Object)
     */
    public void processEvent(Context context, Component component, String eventType, Object eventData) {
        ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
        if (WindowPane.INPUT_CLOSE.equals(eventType)) {
            clientUpdateManager.setComponentAction(component, WindowPane.INPUT_CLOSE, null);
        } else if (WindowPane.INPUT_MINIMIZE.equals(eventType)) {
            clientUpdateManager.setComponentAction(component, WindowPane.INPUT_MINIMIZE, null);
        } else if (WindowPane.INPUT_MAXIMIZE.equals(eventType)) {
            clientUpdateManager.setComponentAction(component, WindowPane.INPUT_MAXIMIZE, null);
        }
    }
}
