/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
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
import nextapp.echo.app.button.ToggleButton;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.ComponentSynchronizePeer;

/**
 * Synchronization peer for <code>ToggleButton</code>s.
 * 
 * @author n.beekman
 */
public class ToggleButtonPeer extends AbstractButtonPeer {

    public ToggleButtonPeer() {
        super();
        addOutputProperty(ToggleButton.SELECTED_CHANGED_PROPERTY);
    }
    
    /**
     * @see nextapp.echo.webcontainer.sync.component.AbstractButtonPeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return shortType ? "TB" : "ToggleButton";
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return ToggleButton.class;
    }
    
    /**
     * @see ComponentSynchronizePeer#getOutputProperty(Context, Component, String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (ToggleButton.SELECTED_CHANGED_PROPERTY.equals(propertyName)) {
            ToggleButton toggleButton = (ToggleButton)component;
            return Boolean.valueOf(toggleButton.isSelected());
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    /**
     * @see ComponentSynchronizePeer#getInputPropertyClass(String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (ToggleButton.SELECTED_CHANGED_PROPERTY.equals(propertyName)) {
            return Boolean.class;
        }
        return super.getInputPropertyClass(propertyName);
    }
    
    /**
     * @see ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        if (ToggleButton.SELECTED_CHANGED_PROPERTY.equals(propertyName)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, ToggleButton.SELECTED_CHANGED_PROPERTY, newValue);
        } else {
            super.storeInputProperty(context, component, propertyName, index, newValue);
        }
    }
}
