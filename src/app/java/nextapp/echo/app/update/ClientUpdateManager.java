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

package nextapp.echo.app.update;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Component;

/**
 * Stores inputs received from the application container and notifies
 * components about them via the  <code>Component.processInput()</code> method.
 * 
 * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
 */
public class ClientUpdateManager 
implements Serializable {
     
    private Map clientComponentUpdateMap = new HashMap();
    private Map applicationUpdateMap = new HashMap();
    private Component actionComponent;
    private String actionName;
    private Object actionValue;
    private ApplicationInstance applicationInstance;
    
    /**
     * Creates a new <Code>ClientUpdateManager</code>.
     * 
     * @param applicationInstance the <code>ApplicationInstance</code> being supported
     */
    ClientUpdateManager(ApplicationInstance applicationInstance) {
        this.applicationInstance = applicationInstance;
    }
    
    /**
     * Retrieves the <code>ClientComponentUpdate</code> object representing
     * the specified <code>Component</code>, or null, if no client updates
     * have been made to the <code>Component</code>.
     * 
     * @param component the <code>Component</code>
     * @return the representing <code>ClientComponentUpdate</code>
     */
    ClientComponentUpdate getComponentUpdate(Component component) {
        return (ClientComponentUpdate) clientComponentUpdateMap.get(component); 
    }

    /**
     * Retrieves the value of the application-level property update with the
     * specified name.
     * 
     * @param propertyName the name of the property update
     * @return the value of the property update, or null if none exists
     */
    Object getApplicationUpdatePropertyValue(String propertyName) {
        return applicationUpdateMap.get(propertyName);
    }
    
    /**
     * Notifies components of input from the client via the 
     * <code>Component.processInput()</code> method.
     * 
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    void process() {
        // Process application-level property updates.
        Iterator applicationUpdateIt = applicationUpdateMap.keySet().iterator();
        while (applicationUpdateIt.hasNext()) {
            String propertyName = (String) applicationUpdateIt.next();
            Object propertyValue = applicationUpdateMap.get(propertyName);
            applicationInstance.processInput(propertyName, propertyValue);
        }
        
        // Process property updates. 
        Iterator componentUpdateIt = clientComponentUpdateMap.values().iterator();
        while (componentUpdateIt.hasNext()) {
            ClientComponentUpdate update = (ClientComponentUpdate) componentUpdateIt.next();
            Iterator inputNameIt = update.getInputNames();
            while (inputNameIt.hasNext()) {
                String inputName = (String) inputNameIt.next();
                update.getComponent().processInput(inputName, update.getInputValue(inputName));
            }
        }
        
        // Process action.
        if (actionComponent != null) {
            actionComponent.processInput(actionName, actionValue);
        }
    }

    /**
     * Purges all updates from the <code>ClientUpdateManager</code>.
     */
    void purge() {
        clientComponentUpdateMap.clear();
        applicationUpdateMap.clear();
        actionComponent = null;
        actionName = null;
        actionValue = null;
    }
    
    /**
     * Sets an application-level property received from the client.
     * 
     * @param propertyName the name of the property
     * @param propertyValue the value of the property
     */
    public void setApplicationProperty(String propertyName, Object propertyValue) {
        applicationUpdateMap.put(propertyName, propertyValue);
    }

    /**
     * Sets the action received from the client.  The 'action' describes the
     * client-side update which necessitated the occurrence of this 
     * client-server interaction.  The application will be notified of the 
     * action AFTER it has been notified of all other property updates.
     * 
     * @param actionComponent the action-producing component
     * @param actionName the name of the action
     * @param actionValue the value of the action
     */
    public void setComponentAction(Component actionComponent, String actionName, Object actionValue) {
        if (!actionComponent.verifyInput(actionName, actionValue)) {
            // Invalid input.
            return;
        }

        this.actionComponent = actionComponent;
        this.actionName = actionName;
        this.actionValue = actionValue;
    }
    
    /**
     * Adds a property update received from the client.
     * 
     * @param component the updated component
     * @param inputName the name of the input property
     * @param inputValue the value of the input property
     */
    public void setComponentProperty(Component component, String inputName, Object inputValue) {
        if (!component.verifyInput(inputName, inputValue)) {
            // Invalid input.
            return;
        }
        
        ClientComponentUpdate clientUpdate = (ClientComponentUpdate) clientComponentUpdateMap.get(component);
        if (clientUpdate == null) {
            clientUpdate = new ClientComponentUpdate(component);
            clientComponentUpdateMap.put(component, clientUpdate);
        }
        clientUpdate.addInput(inputName, inputValue);
    }
    
}
