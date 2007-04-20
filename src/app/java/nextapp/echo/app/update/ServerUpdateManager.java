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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Command;
import nextapp.echo.app.Component;

/**
 * Monitors updates to component hierarchy and records deltas between 
 * server state of application and client state of application.
 */
public class ServerUpdateManager
implements Serializable {

    /**
     * <code>Comparator</code> to sort components by their depth in the 
     * hierarchy.
     */
    private static final Comparator hierarchyDepthUpdateComparator = new Comparator() {

        /**
         * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
         */
        public int compare(Object a, Object b) {
            return getDepth(((ServerComponentUpdate) a).getParent()) - getDepth(((ServerComponentUpdate) b).getParent());
        }
        
        /**
         * @see java.lang.Object#equals(java.lang.Object)
         */
        public boolean equals(Object o) {
            return false;
        }
        
        /**
         * Returns the depth of the specified component in the hierarchy.
         * 
         * @param component the component
         * @return the depth
         */
        private int getDepth(Component component) {
            int count = 0;
            while (component != null) {
                component = component.getParent();
                ++count;
            }
            return count;
        }
    };
    
    private Map applicationUpdateMap;
    private ArrayList commands;
    private Map componentUpdateMap;
    private ServerComponentUpdate fullRefreshUpdate;
    private ClientUpdateManager clientUpdateManager;
    private ApplicationInstance applicationInstance;
    
    /**
     * Creates a new <code>ServerUpdateManager</code>.
     * 
     * <strong>Warning:</strong> the <code>init()</code> method must be 
     * invoked before the <code>ServerUpdateManager</code> is used.
     * 
     * @param applicationInstance the relevant <code>ApplicationInstance</code>
     * @see #init(nextapp.echo.app.update.ClientUpdateManager)
     */
    public ServerUpdateManager(ApplicationInstance applicationInstance) {
        super();
        this.applicationInstance = applicationInstance;
        applicationUpdateMap = new HashMap();
        commands = new ArrayList();
        componentUpdateMap = new HashMap();
        fullRefreshUpdate = new ServerComponentUpdate(null);
    }
    
    /**
     * Creates or retrieves a <code>ComponentUpdate</code> for the given
     * parent component.  If a <code>ComponentUpdate</code> is created, it
     * is automatically stored in the update queue.
     * 
     * @param parent the parent component of the update, i.e., the component
     *        which has had children added, removed, or its properties updated
     * @return the created or retrieved update
     */
    private ServerComponentUpdate createComponentUpdate(Component parent) {
        
        ServerComponentUpdate update;
        if (componentUpdateMap.containsKey(parent)) {
            update = (ServerComponentUpdate) componentUpdateMap.get(parent);
        } else {
            update = new ServerComponentUpdate(parent);
            componentUpdateMap.put(parent, update);
        }
        return update;
    }
    
    /**
     * Enqueues a <code>Command</code> for processing.
     * 
     * @param command the command
     */
    public void enqueueCommand(Command command) {
        commands.add(command);
    }
    
    /**
     * Returns a <code>PropertyUpdate</code> representing the 
     * application-level property update with the specified name.
     * If the specified property has not been updated, null is returned.
     * 
     * @param propertyName the name of the property
     * @return the <code>PropertyUpdate</code>
     */
    public PropertyUpdate getApplicationPropertyUpdate(String propertyName) {
        return (PropertyUpdate) applicationUpdateMap.get(propertyName);
    }
    
    /**
     * Returns the stored <code>Command</code>s.  The commands
     * are NOT removed or modified by this call.  
     * 
     * @return the commands
     */
    public Command[] getCommands() {
        return (Command[])commands.toArray(new Command[commands.size()]);
    }
    
    /**
     * Returns the stored <code>ServerComponentUpdate</code>s.  The updates
     * are NOT removed or modified by this call.  The updates will be returned
     * sorted by depth of their parent components within the hierarchy, but in 
     * otherwise random order.
     * 
     * @return the updates
     */
    public ServerComponentUpdate[] getComponentUpdates() {
        if (isFullRefreshRequired()) {
            return new ServerComponentUpdate[]{fullRefreshUpdate};
        } else {
            Collection hierarchyUpdates = componentUpdateMap.values();
            ServerComponentUpdate[] serverComponentUpdates = (ServerComponentUpdate[])
                     hierarchyUpdates.toArray(new ServerComponentUpdate[hierarchyUpdates.size()]);
            Arrays.sort(serverComponentUpdates, hierarchyDepthUpdateComparator);
            return serverComponentUpdates;
        }
    }
    
    /**
     * Initialization life-cycle method.  Must be invoked before using 
     * the <code>ServerUpdateManager</code>.
     * 
     * @param clientUpdateManager the <code>ClientUpdateManager</code> that
     *        will be used to process input from the client
     */
    public void init(ClientUpdateManager clientUpdateManager) {
        this.clientUpdateManager = clientUpdateManager;
    }
    
    /**
     * Determines if an ancestor of the given component is being added.
     * 
     * @param component the <code>Component</code> to investigate
     * @return true if an ancestor of the component is being added
     */
    private boolean isAncestorBeingAdded(Component component) {
        Component child = component;
        Component parent = component.getParent();
        while (parent != null) {
            ServerComponentUpdate update = (ServerComponentUpdate) componentUpdateMap.get(parent);
            if (update != null) {
                if (update.hasAddedChild(child)) {
                    return true;
                }
            }
            child = parent;
            parent = parent.getParent();
        }
        return false;
    }
    
    /**
     * Determines if the manager has no updates.
     * 
     * @return true if the manager has no updates
     */
    public boolean isEmpty() {
        return componentUpdateMap.size() == 0;
    }
    
    /**
     * Determines if a full refresh of the client state is required.
     * 
     * @return true if a full refresh is required
     */
    public boolean isFullRefreshRequired() {
        return fullRefreshUpdate != null;
    }
    
    /**
     * Processes an update to a property of the <code>ApplicationInstance</code>.
     * 
     * @param propertyName the name of the property
     * @param oldValue the previous value of the property
     * @param newValue the current value of the property
     */
    public void processApplicationPropertyUpdate(String propertyName, Object oldValue, Object newValue) {
        Object clientValue = clientUpdateManager.getApplicationUpdatePropertyValue(propertyName);
        if (clientValue == newValue || (clientValue != null && clientValue.equals(newValue))) {
            // New value is same as client value, thus client is already in sync: cancel the update.
            applicationUpdateMap.remove(propertyName);
        } else {
            applicationUpdateMap.put(propertyName, new PropertyUpdate(oldValue, newValue)); 
        }
    }
    
    /**
     * Processes the addition of a component to the hierarchy.
     * Creates/updates a <code>ServerComponentUpdate</code> if required.
     * 
     * @param parent a component which currently exists in the hierarchy
     * @param child the component which was added to <code>parent</code>
     */
    public void processComponentAdd(Component parent, Component child) {
        if (isFullRefreshRequired()) {
            return;
        }
        if (!child.isRenderVisible()) {
            return;
        }
        if (isAncestorBeingAdded(child)) {
            return;
        }
        
        ServerComponentUpdate update = createComponentUpdate(parent);
        update.addChild(child);
    }
    
    /**
     * Processes an update to the <code>LayoutData</code> of a component.
     * Creates/updates a <code>ServerComponentUpdate</code> if required.
     * 
     * @param updatedComponent a component which currently exists in the 
     *        hierarchy whose <code>LayoutData</code> has changed
     */
    public void processComponentLayoutDataUpdate(Component updatedComponent) {
        if (isFullRefreshRequired()) {
            return;
        }
        if (!updatedComponent.isRenderVisible()) {
            return;
        }

        Component parentComponent = updatedComponent.getParent();
        if (parentComponent == null || isAncestorBeingAdded(parentComponent)) {
            // Do nothing.
            return;
        }
        ServerComponentUpdate update = createComponentUpdate(parentComponent);
        update.updateLayoutData(updatedComponent);
    }
    
    /**
     * Processes an update to a property of a component (other than the
     * <code>LayoutData</code> property).
     * Creates/updates a <code>ServerComponentUpdate</code> if required.
     * 
     * @param updatedComponent the component whose property(s) changed.
     * @param propertyName the name of the changed property
     * @param oldValue The previous value of the property
     * @param newValue The new value of the property
     */
    public void processComponentPropertyUpdate(Component updatedComponent, String propertyName, Object oldValue, Object newValue) {
        if (isFullRefreshRequired()) {
            return;
        }
        if (!updatedComponent.isRenderVisible()) {
            return;
        }
        if (isAncestorBeingAdded(updatedComponent)) {
            return;
        }
        
        // Do not add update (and if necessary cancel any update) if the property is being updated
        // as the result of input from the client (and thus client and server state of property are
        // already synchronized).
        ClientComponentUpdate clientComponentUpdate = clientUpdateManager.getComponentUpdate(updatedComponent);
        if (clientComponentUpdate != null) {
            if (clientComponentUpdate.hasInput(propertyName)) {
                Object inputValue = clientComponentUpdate.getInputValue(propertyName);
                if (inputValue == newValue || (inputValue != null && inputValue.equals(newValue))) {
                    ServerComponentUpdate update = (ServerComponentUpdate) componentUpdateMap.get(updatedComponent);
                    if (update != null) {
                        update.cancelUpdateProperty(propertyName);
                    }
                    return;
                }
            }
        }
        
        ServerComponentUpdate update = createComponentUpdate(updatedComponent);
        update.updateProperty(propertyName, oldValue, newValue);
    }

    /**
     * Processes the removal of a component from the hierarchy.
     * Creates/updates a <code>ServerComponentUpdate</code> if required.
     * 
     * @param parent a component which currently exists in the hierarchy
     * @param child the component which was removed from <code>parent</code>
     */
    public void processComponentRemove(Component parent, Component child) {
        if (isFullRefreshRequired()) {
            return;
        }
        if (!parent.isRenderVisible()) {
            return;
        }
        if (isAncestorBeingAdded(parent)) {
            return;
        }
        ServerComponentUpdate update = createComponentUpdate(parent);
        update.removeChild(child);
        
        // Search updated components for descendants of removed component.
        // Any found descendants will be removed and added to this update's 
        // list of removed descendants.
        Iterator it = componentUpdateMap.keySet().iterator();
        while (it.hasNext()) {
            Component testComponent = (Component) it.next();
            if (child.isAncestorOf(testComponent)) {
                ServerComponentUpdate childUpdate = (ServerComponentUpdate) componentUpdateMap.get(testComponent);
                update.appendRemovedDescendants(childUpdate);
                it.remove();
            }
        }
    }
    
    /**
     * Processes an update to the visible state of a component.
     * Creates/updates a <code>ServerComponentUpdate</code> if required.
     * 
     * @param updatedComponent a component which currently exists in the 
     *        hierarchy whose visible state has changed.
     */
    public void processComponentVisibilityUpdate(Component updatedComponent) {
        Component parentComponent = updatedComponent.getParent();
        if (updatedComponent.isVisible()) {
            processComponentAdd(parentComponent, updatedComponent);
        } else {
            processComponentRemove(parentComponent, updatedComponent);
        }
    }
    
    /**
     * Processes a full refresh of the application state, in response to a 
     * severe change, such as application locale or style sheet.
     */
    public void processFullRefresh() {
        if (fullRefreshUpdate != null) {
            return;
        }
        
        fullRefreshUpdate = new ServerComponentUpdate(null);

        if (applicationInstance.getDefaultWindow() != null) {
            // Default window may be null if an operation is invoked from within the
            // ApplicationInstsance.init() implementation that causes a full refresh.
            fullRefreshUpdate.removeDescendant(applicationInstance.getDefaultWindow());
        }

        Iterator it = componentUpdateMap.keySet().iterator();
        while (it.hasNext()) {
            Component testComponent = (Component) it.next();
            ServerComponentUpdate childUpdate = (ServerComponentUpdate) componentUpdateMap.get(testComponent);
            fullRefreshUpdate.appendRemovedDescendants(childUpdate);
            it.remove();
        }
    }
    
    /**
     * Removes all <code>ServerComponentUpdate</code>s from the manager,
     * resetting its state to zero.  This method is invoked by the
     * container once it has retrieved and processed all available updates.
     */
    void purge() {
        applicationUpdateMap.clear();
        componentUpdateMap.clear();
        commands.clear();
        fullRefreshUpdate = null;
    }
}
