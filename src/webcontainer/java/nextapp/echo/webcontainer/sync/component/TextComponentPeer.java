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

package nextapp.echo.webcontainer.sync.component;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.text.TextComponent;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;

public abstract class TextComponentPeer extends AbstractComponentSynchronizePeer {

    private static final Service TEXT_COMPONENT_SERVICE = JavaScriptService.forResource("Echo.TextComponent", 
            "/nextapp/echo/webcontainer/resource/js/Render.TextComponent.js");
    
    private static final String[] EVENT_TYPES_ACTION = new String[] { TextComponent.INPUT_ACTION };
    
    static {
        WebContainerServlet.getServiceRegistry().add(TEXT_COMPONENT_SERVICE);
    }
    
    public TextComponentPeer() {
        super();
        addOutputProperty(TextComponent.TEXT_CHANGED_PROPERTY);
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

    public Class getInputPropertyClass(String propertyName) {
        if (TextComponent.TEXT_CHANGED_PROPERTY.equals(propertyName)) {
            return String.class;
        }
        return null;
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(TEXT_COMPONENT_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getImmediateEventTypes(Context, nextapp.echo.app.Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        TextComponent textComponent = (TextComponent)component;
        if (textComponent.hasActionListeners()) {
            return new ArrayIterator(EVENT_TYPES_ACTION);
        }
        return super.getImmediateEventTypes(context, component);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(TextComponent.TEXT_CHANGED_PROPERTY)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, TextComponent.TEXT_CHANGED_PROPERTY, newValue);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#processEvent(nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, java.lang.Object)
     */
    public void processEvent(Context context, Component component, String eventType, Object eventData) {
        if (TextComponent.INPUT_ACTION.equals(eventType)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentAction(component, TextComponent.INPUT_ACTION, null);
        }
    }
}
