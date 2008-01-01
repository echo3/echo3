/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

package nextapp.echo.app.test;

import java.util.Arrays;
import java.util.List;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Command;
import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.app.TextField;
import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.update.PropertyUpdate;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.update.UpdateManager;
import junit.framework.TestCase;

/**
 * Unit test(s) for update management subsystem.
 */
public class UpdateManagerTest extends TestCase  {
    
    /**
     * Test <code>Command</code>.
     */
    private static class ExampleCommand implements Command { }
    
    /**
     * Test <code>ApplicationInstance</code>.
     */
    private ColumnApp columnApp;
    
    /**
     * <code>UpdateManager</code> for <code>columnApp</code>.
     */
    private UpdateManager manager;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp() {
        columnApp = new ColumnApp();
        ApplicationInstance.setActive(columnApp);        
        columnApp.doInit();
        manager = columnApp.getUpdateManager();
    }
    
    /**
     * @see junit.framework.TestCase#tearDown()
     */
    public void tearDown() {
        ApplicationInstance.setActive(null);        
    }
    
    /**
     * Test adding children to an parent that is being added in current 
     * transaction.
     */
    public void testAddChlidToAddedParent() {
        ServerComponentUpdate[] componentUpdates;
        Component[] addedChildren;
        manager.purge();

        // Add a column.
        Column column1 = new Column();
        columnApp.getColumn().add(column1);
        
        // Ensure only 1 update w/ 1 child added.
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        addedChildren = componentUpdates[0].getAddedChildren();
        assertEquals(1, addedChildren.length);
        assertEquals(0, componentUpdates[0].getRemovedChildren().length);
        assertEquals(column1, addedChildren[0]);
        
        // Add a label to column.
        column1.add(new Label("A"));

        // Ensure only 1 update w/ 1 child added.
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        addedChildren = componentUpdates[0].getAddedChildren();
        assertEquals(1, addedChildren.length);
        assertEquals(0, componentUpdates[0].getRemovedChildren().length);
        assertEquals(column1, addedChildren[0]);

        // Add another column.
        Column column2 = new Column();
        Label labelB = new Label("B");
        column2.add(labelB);
        columnApp.getColumn().add(column2);
        
        // Ensure only 1 update w/ 2 children added.
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        addedChildren = componentUpdates[0].getAddedChildren();
        assertEquals(2, addedChildren.length);
        assertEquals(0, componentUpdates[0].getRemovedChildren().length);
        
        List addedChildrenList = Arrays.asList(addedChildren);
        assertTrue(addedChildrenList.contains(column1));
        assertTrue(addedChildrenList.contains(column2));
        assertFalse(addedChildrenList.contains(labelB));
    }
    
    /**
     * Ensure adding an invisible component does not add entries.
     */
    public void testAddInvisibleComponent() {
        ServerComponentUpdate[] componentUpdates;
 
        manager.purge();
        
        Label label = new Label("Label1");
        label.setVisible(false);
        columnApp.getColumn().add(label);
        
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(0, componentUpdates.length);
    }
    
    /**
     * Test storage/retrieval of application property update.
     */
    public void testApplicationPropertyUpdate() {
        manager.purge();
        columnApp.setFocusedComponent(columnApp.getLabel());
        PropertyUpdate propertyUpdate = manager.getServerUpdateManager().getApplicationPropertyUpdate(
                ApplicationInstance.FOCUSED_COMPONENT_CHANGED_PROPERTY);
        assertNotNull(propertyUpdate);
        assertNull(propertyUpdate.getOldValue());
        assertEquals(columnApp.getLabel(), propertyUpdate.getNewValue());
    }

    /**
     * Ensure that an application property update is stored in the
     * <code>ServerUpdateManager</code> even if an update to the same
     * property was received from the <code>ClientUpdateManager</code> BUT
     * the property value is now different.
     */
    public void testApplicationPropertyUpdateWithDifferentClientUpdate() {
        manager.purge();
        manager.getClientUpdateManager().setApplicationProperty(ApplicationInstance.FOCUSED_COMPONENT_CHANGED_PROPERTY, 
                columnApp.getColumn());
        manager.processClientUpdates();
        assertEquals(columnApp.getColumn(), columnApp.getFocusedComponent());
        
        columnApp.setFocusedComponent(columnApp.getLabel());
        PropertyUpdate propertyUpdate = manager.getServerUpdateManager().getApplicationPropertyUpdate(
                ApplicationInstance.FOCUSED_COMPONENT_CHANGED_PROPERTY);
        assertNotNull(propertyUpdate);
        assertEquals(columnApp.getColumn(), propertyUpdate.getOldValue());
        assertEquals(columnApp.getLabel(), propertyUpdate.getNewValue());
    }
    
    /**
     * Ensure that an application property update is NOT stored in the
     * <code>ServerUpdateManager</code> as a result of a property update
     * received from the <code>ClientUpdateManager</code>.
     */
    public void testApplicationPropertyUpdateWithEquivalentClientUpdate() {
        manager.purge();
        manager.getClientUpdateManager().setApplicationProperty(ApplicationInstance.FOCUSED_COMPONENT_CHANGED_PROPERTY, 
                columnApp.getLabel());
        manager.processClientUpdates();
        assertEquals(columnApp.getLabel(), columnApp.getFocusedComponent());
        PropertyUpdate propertyUpdate = manager.getServerUpdateManager().getApplicationPropertyUpdate(
                ApplicationInstance.FOCUSED_COMPONENT_CHANGED_PROPERTY);
        assertNull(propertyUpdate);
    }

    /**
     * Ensure property handling of <code>Command</code>s.
     */
    public void testCommand() {
        Command command = new ExampleCommand();

        manager.purge();
        columnApp.enqueueCommand(command);

        // Test basic command queuing.
        assertEquals(1, manager.getServerUpdateManager().getCommands().length);
        assertEquals(command, manager.getServerUpdateManager().getCommands()[0]);
        
        manager.getServerUpdateManager().processFullRefresh();

        // Ensure command survives full refresh.
        assertEquals(1, manager.getServerUpdateManager().getCommands().length);
        assertEquals(command, manager.getServerUpdateManager().getCommands()[0]);
        
        manager.purge();
        
        // Ensure command purged.
        assertEquals(0, manager.getServerUpdateManager().getCommands().length);

        manager.getServerUpdateManager().processFullRefresh();
        columnApp.enqueueCommand(command);
        
        // Ensure commands can be enqueued even if a full refresh is present.
        assertEquals(1, manager.getServerUpdateManager().getCommands().length);
        assertEquals(command, manager.getServerUpdateManager().getCommands()[0]);
    }
    
    /**
     * Ensure updates to invisible hierarchy do not add entries.
     */
    public void testInvisibleHierarchyUpdate() {
        ServerComponentUpdate[] componentUpdates;
        columnApp.getColumn().setVisible(false);
 
        manager.purge();
        
        Column column = new Column();
        columnApp.getColumn().add(column);
        Label label1 = new Label("Label1");
        column.add(label1);
        Label label2 = new Label("Label2");
        label2.setVisible(false);
        column.add(label2);
        
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(0, componentUpdates.length);
    }
    
    /**
     * Test updating of <code>LayoutData</code> properties, ensuring that
     * these properties correctly register updates for the 
     * <strong>parent</strong> <code>Component</code>.
     */
    public void testLayoutDataUpdate() {
        ServerComponentUpdate[] componentUpdates;
        ColumnLayoutData columnLayoutData;
 
        manager.purge();
        
        // Setup.
        Column column = new Column();
        columnApp.getColumn().add(column);
        Label label1 = new Label("Label1");
        column.add(label1);
        Label label2 = new Label("Label2");
        column.add(label2);
        label2.setLayoutData(new ColumnLayoutData());

        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertEquals(false, componentUpdates[0].hasUpdatedLayoutDataChildren());
        
        manager.purge();
        
        columnLayoutData = new ColumnLayoutData();
        columnLayoutData.setAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
        label1.setLayoutData(columnLayoutData);
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertEquals(column, componentUpdates[0].getParent());
        assertFalse(componentUpdates[0].hasAddedChildren());
        assertFalse(componentUpdates[0].hasRemovedChildren());
        assertFalse(componentUpdates[0].hasUpdatedProperties());
        assertTrue(componentUpdates[0].hasUpdatedLayoutDataChildren());
        
        Component[] components = componentUpdates[0].getUpdatedLayoutDataChildren();
        assertEquals(1, components.length);
        assertEquals(label1, components[0]);
    }
    
    
    /**
     * Test recording of simple property updates, and their removal
     * in the event that the updated <code>Component</code> is later
     * removed.
     */
    public void testPropertyUpdate() {
        ServerComponentUpdate[] componentUpdates;
        // Remove previous updates.
        manager.purge();
        
        // Update text property of label and verify.
        columnApp.getLabel().setText("Hi there");
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(columnApp.getLabel(), componentUpdates[0].getParent());
        assertEquals(1, componentUpdates.length);
        assertEquals(0, componentUpdates[0].getAddedChildren().length);
        assertEquals(0, componentUpdates[0].getRemovedChildren().length);
        
        String[] updatedPropertyNames = componentUpdates[0].getUpdatedPropertyNames(); 
        assertEquals(1, updatedPropertyNames.length);
        assertEquals(Label.PROPERTY_TEXT, updatedPropertyNames[0]);
        PropertyUpdate propertyUpdate = componentUpdates[0].getUpdatedProperty(Label.PROPERTY_TEXT);
        assertEquals("Label", propertyUpdate.getOldValue());
        assertEquals("Hi there", propertyUpdate.getNewValue());
        
        // Remove label entirely and ensure property update disappears.
        columnApp.getColumn().remove(columnApp.getLabel());
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertEquals(0, componentUpdates[0].getUpdatedPropertyNames().length);
        assertEquals(0, componentUpdates[0].getAddedChildren().length);
    }
    
    /**
     * Ensure that a property update whose state is already reflected on the
     * client (because the end-user made the property change) is properly
     * canceled.
     */
    public void testPropertyUpdateCancellation1() {
        TextField textField = new TextField();
        columnApp.getColumn().add(textField);
        
        manager.purge();
        manager.getClientUpdateManager().setComponentProperty(textField, TextField.TEXT_CHANGED_PROPERTY, "a user typed this.");
        manager.processClientUpdates();
        
        ServerComponentUpdate[] componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(0, componentUpdates.length);
    }
    
    /**
     * Ensure that a property update whose state is already reflected on the
     * client (because the end-user made the property change) is properly
     * canceled.  This test will ensure that if additional properties changed
     * on a user-updated component, that only the non-user-updated properties
     * are reflected by the <code>UpdateManager</code>.
     */
    public void testPropertyUpdateCancellation2() {
        TextField textField = new TextField();
        columnApp.getColumn().add(textField);
        
        manager.purge();
        textField.setBackground(Color.BLUE);
        manager.getClientUpdateManager().setComponentProperty(textField, TextField.TEXT_CHANGED_PROPERTY, "a user typed this.");
        manager.processClientUpdates();
        
        ServerComponentUpdate[] componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        PropertyUpdate backgroundUpdate = 
                  componentUpdates[0].getUpdatedProperty(TextField.PROPERTY_BACKGROUND);
        assertNotNull(backgroundUpdate);
        assertEquals(Color.BLUE, backgroundUpdate.getNewValue());
        assertNull(componentUpdates[0].getUpdatedProperty(TextField.TEXT_CHANGED_PROPERTY));
    }
    
    /**
     * Ensure that a property update whose state is already reflected on the
     * client (because the end-user made the property change) is properly
     * canceled.  This test will ensure that user-changed properties are 
     * canceled even in the event that the application ALSO updated the
     * property, though it was later overwritten by a user update.
     */
    public void testPropertyUpdateCancellation3() {
        TextField textField = new TextField();
        columnApp.getColumn().add(textField);
        
        manager.purge();
        textField.setText("first the application set it to this.");
        manager.getClientUpdateManager().setComponentProperty(textField, TextField.TEXT_CHANGED_PROPERTY, "a user typed this.");
        manager.processClientUpdates();
        
        ServerComponentUpdate[] componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertFalse(componentUpdates[0].hasUpdatedProperties());
    }
    
    /**
     * Test basic operation <code>UpdateManager.purge()</code> method.
     */
    public void testPurge() {
        assertFalse(manager.getServerUpdateManager().getComponentUpdates().length == 0);
        manager.purge();
        assertTrue(manager.getServerUpdateManager().getComponentUpdates().length == 0);
    }

    /**
     * Ensure that component removes and descendant removes are properly stored.
     */
    public void testRemove1() {
        Column column = new Column();
        Label label = new Label();
        column.add(label);
        columnApp.getColumn().add(column);
        manager.purge();
        
        columnApp.getColumn().remove(column);
        
        ServerComponentUpdate[] componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        
        assertEquals(true, componentUpdates[0].hasRemovedChildren());
        assertEquals(true, componentUpdates[0].hasRemovedDescendants());
        
        Component[] removedChildren = componentUpdates[0].getRemovedChildren();
        assertEquals(1, removedChildren.length);
        assertEquals(column, removedChildren[0]);
        
        Component[] removedDescendants = componentUpdates[0].getRemovedDescendants();
        assertEquals(1, removedDescendants.length);
        assertEquals(label, removedDescendants[0]);
    }

    /**
     * Another slightly more complex test to ensure that component
     * removes/descendant removes are properly stored.
     * 
     * -- Initial State --
     * [ColumnApp]
     *  * Window
     *    * ContentPane
     *      * Column
     *        * Column1
     *          * Column2
     *            * label
     * 
     * -- New State --
     * [ColumnApp]
     *  * Window
     *    * ContentPane
     *      * Column
     *        * Column1 [REMOVED]
     *          X Column2 [REMOVED DESCENDANT]
     *            X label [REMOVED DESCENDANT]
     */
    public void testRemove2() {
        Column column1 = new Column();
        Column column2 = new Column();
        column1.add(column2);
        Label label = new Label();
        column2.add(label);
        columnApp.getColumn().add(column1);
        manager.purge();
        
        column1.remove(column2);
        columnApp.getColumn().remove(column1);
        
        ServerComponentUpdate[] componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        
        assertEquals(true, componentUpdates[0].hasRemovedChildren());
        assertEquals(true, componentUpdates[0].hasRemovedDescendants());
        
        Component[] removedChildren = componentUpdates[0].getRemovedChildren();
        assertEquals(1, removedChildren.length);
        assertEquals(column1, removedChildren[0]);
        
        Component[] removedDescendants = componentUpdates[0].getRemovedDescendants();
        assertEquals(2, removedDescendants.length);
        assertTrue(removedDescendants[0].equals(column2) || removedDescendants[1].equals(column2));
        assertTrue(removedDescendants[0].equals(label) || removedDescendants[1].equals(label));
    }

    /**
     * Ensure updates are returned sorted by component depth.
     */
    public void testUpdateSorting1() {
        ServerComponentUpdate[] componentUpdates;
        manager.purge();

        columnApp.getLabel().setBackground(Color.BLUE);
        columnApp.getContentPane().setBackground(Color.RED);
        columnApp.getColumn().setBackground(Color.GREEN);
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();

        assertEquals(3, componentUpdates.length);
        assertEquals(columnApp.getContentPane(), componentUpdates[0].getParent());
        assertEquals(columnApp.getColumn(), componentUpdates[1].getParent());
        assertEquals(columnApp.getLabel(), componentUpdates[2].getParent());
    }
    
    /**
     * Ensure updates are returned sorted by component depth.
     */
    public void testUpdateSorting2() {
        ServerComponentUpdate[] componentUpdates;
        Column column2 = new Column();
        columnApp.getColumn().add(column2);
        Label label2 = new Label();
        column2.add(label2);
        manager.purge();

        columnApp.getLabel().setBackground(Color.BLUE);
        columnApp.getContentPane().setBackground(Color.RED);
        columnApp.getColumn().setBackground(Color.GREEN);
        label2.setBackground(Color.YELLOW);
        column2.setBackground(Color.ORANGE);

        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(5, componentUpdates.length);
        assertEquals(columnApp.getContentPane(), componentUpdates[0].getParent());
        assertEquals(columnApp.getColumn(), componentUpdates[1].getParent());
        assertTrue(columnApp.getLabel().equals(componentUpdates[2].getParent()) 
                || columnApp.getLabel().equals(componentUpdates[3].getParent()));
        assertTrue(column2.equals(componentUpdates[2].getParent()) 
                || column2.equals(componentUpdates[3].getParent()));
        assertEquals(label2, componentUpdates[4].getParent());
    }
    
    /**
     * Ensure that visible updates are treated as adds/removes.
     */
    public void testVisibleUpdate() {
        ServerComponentUpdate[] componentUpdates;
 
        manager.purge();
        
        // Setup.
        Column column = new Column();
        columnApp.getColumn().add(column);
        Label label1 = new Label("Label1");
        column.add(label1);
        Label label2 = new Label("Label2");
        label2.setVisible(false);
        column.add(label2);
        label2.setLayoutData(new ColumnLayoutData());

        manager.purge();
        
        label1.setVisible(false);
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertEquals(column, componentUpdates[0].getParent());
        assertFalse(componentUpdates[0].hasAddedChildren());
        assertTrue(componentUpdates[0].hasRemovedChildren());
        assertFalse(componentUpdates[0].hasUpdatedProperties());
        assertFalse(componentUpdates[0].hasUpdatedLayoutDataChildren());
        
        Component[] components = componentUpdates[0].getRemovedChildren();
        assertEquals(1, components.length);
        assertEquals(label1, components[0]);
        
        manager.purge();
        
        label2.setVisible(true);
        componentUpdates = manager.getServerUpdateManager().getComponentUpdates();
        assertEquals(1, componentUpdates.length);
        assertEquals(column, componentUpdates[0].getParent());
        assertTrue(componentUpdates[0].hasAddedChildren());
        assertFalse(componentUpdates[0].hasRemovedChildren());
        assertFalse(componentUpdates[0].hasUpdatedProperties());
        assertFalse(componentUpdates[0].hasUpdatedLayoutDataChildren());

        components = componentUpdates[0].getAddedChildren();
        assertEquals(1, components.length);
        assertEquals(label2, components[0]);
        
        label1.setVisible(true);
    }
}
