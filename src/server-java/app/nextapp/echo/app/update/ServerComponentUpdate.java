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

package nextapp.echo.app.update;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.Component;

/**
 * A description of a server-side update to a single component, i.e.,
 * an update which has occurred on the server and must be propagated
 * to the client.
 * 
 * Describes the addition and removal of children to the component.
 * Describes modifications to properties of the component.
 * Describes modifications to the <code>LayoutData</code> states of
 * children of the component.
 */
public class ServerComponentUpdate 
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private static final Component[] EMPTY_COMPONENT_ARRAY = new Component[0];
    private static final String[] EMPTY_STRING_ARRAY = new String[0];
    
    /** The set of child <code>Component</code>s added to the <code>parent</code>. */
    private Set addedChildren;
    
    /** The parent component represented in this <code>ServerComponentUpdate</code>. */
    private Component parent;
    
    /**A mapping between property names of the <code>parent</code> component and <code>PropertyUpdate</code>s. */
    private Map propertyUpdates;
    
    /** The set of child <code>Component</code>s removed from the <code>parent</code>. */
    private Set removedChildren;
    
    /** The set of descendant <code>Component</code>s which are implicitly removed as they were children of removed children. */
    private Set removedDescendants;

    /** The set of child <code>Component</code>s whose <code>LayoutData</code> was updated. */
    private Set updatedLayoutDataChildren;
    
    /**
     * Creates a new <code>ServerComponentUpdate</code> representing the given
     * <code>parent</code> <code>Component</code>.
     * 
     * @param parent the updating parent <code>Component</code>
     */
    public ServerComponentUpdate(Component parent) {
        this.parent = parent;
    }
    
    /**
     * Adds a description of an added child to the 
     * <code>ServerComponentUpdate</code>.
     * 
     * @param child the child being added
     */
    public void addChild(Component child) {
        if (addedChildren == null) {
            addedChildren = new HashSet();
        }
        addedChildren.add(child);
    }
    
    /**
     * Cancels an update to a property.  A cancellation of a property update
     * is performed when the update manager discovers that the state of a 
     * property is already correct on the client.
     * 
     * @param propertyName the property update to cancel
     */
    public void cancelUpdateProperty(String propertyName) {
        if (propertyUpdates == null) {
            return;
        }
        propertyUpdates.remove(propertyName);
        if (propertyUpdates.size() == 0) {
            propertyUpdates = null;
        }
    }
    
    /**
     * Appends the removed child and descendant components of the given <code>ServerComponentUpdate</code> to this
     * <code>ServerComponentUpdate</code>'s list of removed descendants. This method is invoked by the
     * <code>ServerUpdateManager</code> when a component is removed that is an ancestor of a component that has been updated. In
     * such a case, the descendant <code>ServerComponentUpdate</code> is destroyed, and thus its removed descendant components must
     * be stored in the ancestor <code>ServerComponentUpdate</code>.
     * 
     * @param update the <code>ServerComponentUpdate</code> whose removed descendants are to be appended
     */
    public void appendRemovedDescendants(ServerComponentUpdate update) {
        // Append removed descendants.
        if (update.removedDescendants != null) {
            if (removedDescendants == null) {
                removedDescendants = new HashSet();
            }
            removedDescendants.addAll(update.removedDescendants);
        }
        // Append removed children.
        if (update.removedChildren != null) {
            if (removedDescendants == null) {
                removedDescendants = new HashSet();
            }
            removedDescendants.addAll(update.removedChildren);
        }
    }
    
    /**
     * Returns the child components which have been added to the parent.
     * 
     * @return the added child components
     */
    public Component[] getAddedChildren() {
        if (addedChildren == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            return (Component[]) addedChildren.toArray(new Component[addedChildren.size()]);
        }
    }
    
    /**
     * Returns the parent component being updated.
     * 
     * @return the parent component
     */
    public Component getParent() {
        return parent;
    }
    
    /**
     * Returns the child components which have been removed from the parent.
     * These components may or may not have ever been rendered by the container,
     * e.g., if a component was added and removed in a single synchronization it
     * will show up as a removed component even though the container may have
     * never rendered it.
     * 
     * @return the removed child components
     * @see #getRemovedDescendants()
     */
    public Component[] getRemovedChildren() {
        if (removedChildren == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            return (Component[]) removedChildren.toArray(new Component[removedChildren.size()]);
        }
    }
    
    /**
     * Returns all descendants of the child components which have been 
     * removed from the parent.  This returned array DOES NOT contain the
     * children which were directly removed from the parent component.
     * These components may or may not have ever been rendered by the container,
     * e.g., if a component was added and removed in a single synchronization it
     * will show up as a removed descendant even though the container may have
     * never rendered it.
     * 
     * @return the removed descendant components
     * @see #getRemovedChildren()
     */
    public Component[] getRemovedDescendants() {
        if (removedDescendants == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            return (Component[]) removedDescendants.toArray(new Component[removedDescendants.size()]);
        }
    }
    
    /**
     * Returns the child components whose <code>LayoutData</code> properties
     * have been updated.
     * 
     * @return the changed child components
     */
    public Component[] getUpdatedLayoutDataChildren() {
        if (updatedLayoutDataChildren == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            return (Component[]) updatedLayoutDataChildren.toArray(new Component[updatedLayoutDataChildren.size()]);
        }
    }
    
    /**
     * Returns a <code>PropertyUpdate</code> describing an update to the
     * property with the given <code>name</code>.
     * 
     * @param name the name of the property being updated
     * @return the <code>PropertyUpdate</code>, or null if none exists
     * @see #getUpdatedPropertyNames() 
     */
    public PropertyUpdate getUpdatedProperty(String name) {
        return propertyUpdates == null ? null : (PropertyUpdate) propertyUpdates.get(name);
    }
    
    /**
     * Returns the names of all properties being updated in this update.
     * 
     * @return the names of all updated properties
     * @see #getUpdatedPropertyNames() 
     */
    public String[] getUpdatedPropertyNames() {
        if (propertyUpdates == null) {
            return EMPTY_STRING_ARRAY;
        } else {
            return (String[]) propertyUpdates.keySet().toArray(new String[propertyUpdates.size()]);
        }
    }
    
    /**
     * Determines if the specified component has been added 
     * as a child in this update.
     * 
     * @param component the component to test
     * @return true if the component was added
     */
    public boolean hasAddedChild(Component component) {
        return addedChildren != null && addedChildren.contains(component);
    }
    
    /**
     * Determines if the update is adding any children to the parent component.
     * 
     * @return true if children are being added
     */
    public boolean hasAddedChildren() {
        return addedChildren != null;
    }
    
    /**
     * Determines if the specified child was removed from the parent component.
     * 
     * @param component the potentially removed child
     * @return true if the child was removed
     */
    public boolean hasRemovedChild(Component component) {
        return removedChildren != null && removedChildren.contains(component);
    }
    
    /**
     * Determines if the update is removing children from the parent 
     * component.
     * 
     * @return true if children are being removed
     */
    public boolean hasRemovedChildren() {
        return removedChildren != null;
    }
    
    /**
     * Determines if the specified component is a removed child or descendant of the parent component.
     * 
     * @param component the potentially removed child/descendant
     * @return true if the component is a removed child/descendant
     */
    public boolean hasRemovedDescendant(Component component) {
        return removedChildren != null && (removedChildren.contains(component) || 
                (removedDescendants != null && removedDescendants.contains(component)));
    }
    
    /**
     * Determines if the update is removing children from the parent that 
     * have descendants.
     * Having removed descendants implies having removed children.  
     * If none of the children being removed have children, this method 
     * will return false.
     * 
     * @return true if descendants are being removed
     */
    public boolean hasRemovedDescendants() {
        return removedDescendants != null;
    }
    
    /**
     * Determines if the update has child components whose 
     * <code>LayoutData</code> states have changed.
     * 
     * @return true if <code>LayoutData</code> properties are being updated
     */
    public boolean hasUpdatedLayoutDataChildren() {
        return updatedLayoutDataChildren != null;
    }
    
    /**
     * Determines if the update is updating properties of the parent component.
     * 
     * @return true if properties are being updated
     */
    public boolean hasUpdatedProperties() {
        return propertyUpdates != null;
    }
    
    /**
     * Determines if the update is updating a specific property of the parent component.
     * 
     * @param propertyName the property name
     * @return true if the specified property is being updated
     */
    public boolean hasUpdatedProperty(String propertyName) {
        return propertyUpdates != null && propertyUpdates.containsKey(propertyName);
    }
    
    /**
     * Adds a description of a removed child to the 
     * <code>ServerComponentUpdate</code>.
     * 
     * @param child the child being removed
     */
    public void removeChild(Component child) {
        if (addedChildren != null && addedChildren.contains(child)) {
            // Remove child from add list if found.
            addedChildren.remove(child);
        }
        if (updatedLayoutDataChildren != null && updatedLayoutDataChildren.contains(child)) {
            // Remove child from updated layout data list if found.
            updatedLayoutDataChildren.remove(child);
        }
        if (removedChildren == null) {
            removedChildren = new HashSet();
        }
        removedChildren.add(child);
        
        Component[] descendants = child.getComponents();
        for (int i = 0; i < descendants.length; ++i) {
            removeDescendant(descendants[i]);
        }
    }
    
    /**
     * Recursive method to add descriptions of descendants which were
     * removed.
     * 
     * @param descendant the removed descendant
     */
    public void removeDescendant(Component descendant) {
        if (removedDescendants == null) {
            removedDescendants = new HashSet();
        }
        removedDescendants.add(descendant);
        Component[] descendants = descendant.getComponents();
        for (int i = 0; i < descendants.length; ++i) {
            removeDescendant(descendants[i]);
        }
    }
    
    /**
     * Display debug representation.
     * 
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append(ServerComponentUpdate.class.getName() + "\n");
        out.append("- Parent: " + getParent() + "\n");
        out.append("- Adds: " + addedChildren + "\n");
        out.append("- Removes: " + removedChildren + "\n");
        out.append("- DescendantRemoves: " + removedDescendants + "\n");
        out.append("- ChildLayoutDataUpdates: " + updatedLayoutDataChildren + "\n");
        out.append("- PropertyUpdates: " + propertyUpdates + "\n");
        return out.toString();
    }
    
    /**
     * Adds a description of an update to a child component's 
     * <code>LayoutData</code> information to the 
     * <code>ServerComponentUpdate</code>.
     * 
     * @param child the updated child 
     */
    public void updateLayoutData(Component child) {
        if (updatedLayoutDataChildren == null) {
            updatedLayoutDataChildren = new HashSet();
        }
        updatedLayoutDataChildren.add(child);
    }
    
    /**
     * Adds a description of an update to a property of the parent component 
     * to the <code>ServerComponentUpdate</code>.
     * 
     * @param propertyName the name of the property
     * @param oldValue the previous value of the property
     * @param newValue the current value of the property
     */
    public void updateProperty(String propertyName, Object oldValue, Object newValue) {
        if (propertyUpdates == null) {
            propertyUpdates = new HashMap();
        }
        PropertyUpdate propertyUpdate = new PropertyUpdate(oldValue, newValue);
        propertyUpdates.put(propertyName, propertyUpdate);
    }
}
