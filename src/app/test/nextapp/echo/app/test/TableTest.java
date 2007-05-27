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

import nextapp.echo.app.CheckBox;
import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.app.Table;
import nextapp.echo.app.table.DefaultTableColumnModel;
import nextapp.echo.app.table.DefaultTableModel;
import nextapp.echo.app.table.TableCellRenderer;
import junit.framework.TestCase;

/**
 * Unit tests for <code>Table</code> components.
 */
public class TableTest extends TestCase {
    
    private DefaultTableModel createEmployeeTableModel() {
        DefaultTableModel model = new DefaultTableModel();
        model.setColumnCount(3);

        model.setColumnName(0, "Employee Name");
        model.setColumnName(1, "Age");
        model.setColumnName(2, "Manager");
        
        model.insertRow(0, new Object[]{"Bob Johnson", new Integer(32), Boolean.TRUE});
        model.insertRow(1, new Object[]{"Bill Simmons", new Integer(27), Boolean.TRUE});
        model.insertRow(2, new Object[]{"Tracy Smith", new Integer(54), Boolean.TRUE});
        model.insertRow(3, new Object[]{"Cathy Rogers", new Integer(21), Boolean.FALSE});
        model.insertRow(4, new Object[]{"Xavier Doe", new Integer(77), Boolean.TRUE});

        return model;
    }
    
    public void testDefaultColumnNames() {
        DefaultTableModel model = new DefaultTableModel();
        model.setColumnCount(3);
        
        assertEquals("A", model.getColumnName(0));
        assertEquals("B", model.getColumnName(1));
        assertEquals("C", model.getColumnName(2));
        
        model = new DefaultTableModel();
        model.setColumnCount(1379);
        
        assertEquals("A", model.getColumnName(0));
        assertEquals("B", model.getColumnName(1));
        assertEquals("C", model.getColumnName(2));
        assertEquals("Y", model.getColumnName(24));
        assertEquals("Z", model.getColumnName(25));
        assertEquals("AA", model.getColumnName(26));
        assertEquals("AB", model.getColumnName(27));
        assertEquals("AC", model.getColumnName(28));
        assertEquals("AY", model.getColumnName(50));
        assertEquals("AZ", model.getColumnName(51));
        assertEquals("BA", model.getColumnName(52));
        assertEquals("ZZ", model.getColumnName(701));
        assertEquals("AAA", model.getColumnName(702));
        assertEquals("AAB", model.getColumnName(703));
        assertEquals("AAC", model.getColumnName(704));
        assertEquals("ABA", model.getColumnName(728));
        assertEquals("AZZ", model.getColumnName(1377));
        assertEquals("BAA", model.getColumnName(1378));
    }

    public void testDefaultTableModel() {
        DefaultTableModel model = createEmployeeTableModel();
        
        assertEquals("Employee Name", model.getColumnName(0));
        assertEquals("Age", model.getColumnName(1));
        assertEquals("Manager", model.getColumnName(2));
        assertEquals(3, model.getColumnCount());
        assertEquals(5, model.getRowCount());
        assertEquals("Bob Johnson", model.getValueAt(0, 0));
        assertEquals("Xavier Doe", model.getValueAt(0, 4));
        assertEquals(new Integer(21), model.getValueAt(1, 3));
        assertEquals(Boolean.FALSE, model.getValueAt(2, 3));

        model.deleteRow(1);
        assertEquals(4, model.getRowCount());
        assertEquals("Bob Johnson", model.getValueAt(0, 0));
        assertEquals("Xavier Doe", model.getValueAt(0, 3));
        assertEquals(new Integer(21), model.getValueAt(1, 2));
        assertEquals(Boolean.FALSE, model.getValueAt(2, 2));
        
        model.insertRow(2, new Object[]{"Whitney Ford", new Integer(33), Boolean.FALSE});
        assertEquals(5, model.getRowCount());
        assertEquals("Whitney Ford", model.getValueAt(0, 2));
        assertEquals("Bob Johnson", model.getValueAt(0, 0));
        assertEquals("Xavier Doe", model.getValueAt(0, 4));
        assertEquals(new Integer(21), model.getValueAt(1, 3));
        assertEquals(Boolean.FALSE, model.getValueAt(2, 3));
    }

    public void testColumModelRendering() {
        Label label;
        DefaultTableModel model = createEmployeeTableModel();
        Table table = new Table(model);
        DefaultTableColumnModel columnModel = (DefaultTableColumnModel) table.getColumnModel();
        assertEquals(0, columnModel.getColumn(0).getModelIndex());
        assertEquals(1, columnModel.getColumn(1).getModelIndex());
        assertEquals(2, columnModel.getColumn(2).getModelIndex());
        table.setAutoCreateColumnsFromModel(false);
        table.validate();
        
        label = (Label) table.getComponent(4);
        assertEquals("32", label.getText());
        label = (Label) table.getComponent(5);
        assertEquals("true", label.getText());
        
        columnModel.getColumn(2).setModelIndex(1);
        columnModel.getColumn(1).setModelIndex(2);
        table.setColumnModel(columnModel);
        table.validate();
        
        // Indices should switch.
        label = (Label) table.getComponent(4);
        assertEquals("true", label.getText());
        label = (Label) table.getComponent(5);
        assertEquals("32", label.getText());
    }
    
    public void testEmptyConstructor() {
        Table table = new Table();
        assertNotNull(table.getModel());
        assertEquals(DefaultTableModel.class, table.getModel().getClass());
        DefaultTableModel model = (DefaultTableModel) table.getModel();
        assertEquals(0, model.getColumnCount());
        assertEquals(0, model.getRowCount());
    }
    
    public void testRender() {
        Table table = new Table();
        table.setDefaultRenderer(Object.class, new TableCellRenderer() {
            public Component getTableCellRendererComponent(Table table, Object value, int column, int row) {
                switch (column) {
                case 0:
                case 1:
                    return new Label(value.toString());
                case 2:
                    CheckBox checkBox = new CheckBox();
                    checkBox.setSelected(((Boolean) value).booleanValue());
                    return checkBox;
                default:
                    throw new IndexOutOfBoundsException();
                }
            }
        });
        DefaultTableModel model = (DefaultTableModel) table.getModel();
        model.setColumnCount(3);
        model.insertRow(0, new Object[]{"Bob Johnson", new Integer(32), Boolean.TRUE});
        model.insertRow(1, new Object[]{"Bill Simmons", new Integer(27), Boolean.TRUE});
        model.insertRow(2, new Object[]{"Tracy Smith", new Integer(54), Boolean.TRUE});
        model.insertRow(3, new Object[]{"Cathy Rogers", new Integer(21), Boolean.FALSE});
        model.insertRow(4, new Object[]{"Xavier Doe", new Integer(77), Boolean.TRUE});
        table.validate();
        assertEquals(18, table.getComponentCount());
        Component[] components = table.getComponents();
        for (int i = 3; i < components.length; ++i) {
            if (i % 3 == 2) {
                assertEquals(CheckBox.class, components[i].getClass());
            } else {
                assertEquals(Label.class, components[i].getClass());
            }
        }
        assertTrue(components[0] instanceof Label);
        assertEquals("A", ((Label) components[0]).getText());
        assertTrue(components[5] instanceof CheckBox);
        assertTrue(((CheckBox) components[5]).isSelected());
        assertTrue(components[8] instanceof CheckBox);
        assertTrue(((CheckBox) components[8]).isSelected());
        assertTrue(components[14] instanceof CheckBox);
        assertFalse(((CheckBox) components[14]).isSelected());
    }
}
