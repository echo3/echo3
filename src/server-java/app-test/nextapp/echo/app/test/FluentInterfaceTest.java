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

package nextapp.echo.app.test;

import junit.framework.TestCase;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.LayoutData;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.layout.GridLayoutData;
import nextapp.echo.app.layout.RowLayoutData;
import nextapp.echo.app.layout.SplitPaneLayoutData;

/**
 * Unit tests for the LayoutData fluent interface pattern
 */
public class FluentInterfaceTest extends TestCase {
    
    /**
     * Test applying an existing ColumnLayoutData 
     */
    public void testColumnExisting() {
        Column column = new Column();
        ColumnLayoutData cld = new ColumnLayoutData();
        cld.setHeight(new Extent(40));
        cld.setInsets(new Insets(4));
        cld.setBackground(Color.BLUE);
        Label lbl = new Label();
        lbl.setLayoutData(cld);
        ColumnLayoutData cld2 = column.add(lbl);
        assertTrue(cld == cld2);
        assertEquals(40, cld.getHeight().getValue());
        assertEquals(4, cld.getInsets().getLeft().getValue());
        assertEquals(Color.BLUE, cld2.getBackground());
    }
    
    /**
     * Test standard use case for ColumnLayoutData
     */
    public void testColumnNew() {
        ColumnLayoutData cld = new Column().add(new Label()).setHeight(new Extent(50)).setInsets(new Insets(5)).setBackground(Color.RED);
        assertEquals(50, cld.getHeight().getValue());
        assertEquals(5, cld.getInsets().getLeft().getValue());
        assertEquals(Color.RED, cld.getBackground());
    }
    
    /**
     * Test applying a wrong existing LayoutData to a Column object
     * (should throw a runtime exception)
     */
    public void testColumnWrongLayoutData() {
        Column column = new Column();
        GridLayoutData gld = new GridLayoutData();
        gld.setRowSpan(50);
        Label lbl = new Label();
        lbl.setLayoutData(gld);  //a ColumnLayoutData is supposed here!
        try {
            column.add(lbl);
            fail("Should throw an exception here!");
        } catch (IllegalArgumentException e) {
            assertEquals("Parent class requires layout data of type class " +
                    "nextapp.echo.app.layout.ColumnLayoutData, object of invalid " +
                    "type class nextapp.echo.app.layout.GridLayoutData had " +
                    "been provided instead!", e.getMessage());
        }
    }
    
    /**
     * Test applying an existing GridLayoutData 
     */
    public void testGridExisting() {
        Grid grid = new Grid();
        GridLayoutData gld = new GridLayoutData();
        gld.setColumnSpan(3);
        gld.setRowSpan(4);
        gld.setBackground(Color.BLUE);
        Label lbl = new Label();
        lbl.setLayoutData(gld);
        GridLayoutData gld2 = grid.add(lbl);
        assertEquals(gld, gld2);
        assertEquals(3, gld2.getColumnSpan());
        assertEquals(4, gld2.getRowSpan());
        assertEquals(Color.BLUE, gld2.getBackground());
    }
    
    /**
     * Test standard use case for GridLayoutData
     */
    public void testGridNew() {
        GridLayoutData gld = new Grid().add(new Label()).setColumnSpan(2).setRowSpan(3).setBackground(Color.RED);
        assertEquals(2, gld.getColumnSpan());
        assertEquals(3, gld.getRowSpan());
        assertEquals(Color.RED, gld.getBackground());
    }
    
    /**
     * Test applying a wrong existing LayoutData to a Grid object
     * (should throw a runtime exception)
     */
    public void testGridWrongLayoutData() {
        Grid grid = new Grid();
        ColumnLayoutData cld = new ColumnLayoutData();
        cld.setHeight(new Extent(100));
        Label lbl = new Label();
        lbl.setLayoutData(cld);  //a GridLayoutData is supposed here!
        try {
            grid.add(lbl);
            fail("Should throw an exception here!");
        } catch (IllegalArgumentException e) {
            assertEquals("Parent class requires layout data of type class " +
                    "nextapp.echo.app.layout.GridLayoutData, object of invalid " +
                    "type class nextapp.echo.app.layout.ColumnLayoutData had " +
                    "been provided instead!", e.getMessage());
        }
    }
    
    /**
     * Components which do not support LayoutData must return a 
     * null LayoutData
     */
    public void testNullLayoutData() {
        LayoutData layoutData = new WindowPane().add(new Label());
        assertNull(layoutData);
    }
    
    /**
     * Test applying an existing ColumnLayoutData 
     */
    public void testRowExisting() {
        Row row = new Row();
        RowLayoutData rld = new RowLayoutData();
        rld.setWidth(new Extent(40));
        rld.setInsets(new Insets(4));
        rld.setBackground(Color.BLUE);
        Label lbl = new Label();
        lbl.setLayoutData(rld);
        RowLayoutData rld2 = row.add(lbl);
        assertTrue(rld == rld2);
        assertEquals(40, rld.getWidth().getValue());
        assertEquals(4, rld.getInsets().getLeft().getValue());
        assertEquals(Color.BLUE, rld2.getBackground());
    }
    
    /**
     * Test standard use case for RowLayoutData
     */
    public void testRowNew() {
        RowLayoutData rld = new Row().add(new Label()).setWidth(new Extent(50)).setInsets(new Insets(5)).setBackground(Color.RED);
        assertEquals(50, rld.getWidth().getValue());
        assertEquals(5, rld.getInsets().getLeft().getValue());
        assertEquals(Color.RED, rld.getBackground());
    }
    
    /**
     * Test applying a wrong existing LayoutData to a Column object
     * (should throw a runtime exception)
     */
    public void testRowWrongLayoutData() {
        Row row = new Row();
        GridLayoutData gld = new GridLayoutData();
        gld.setRowSpan(50);
        Label lbl = new Label();
        lbl.setLayoutData(gld);  //a RowLayoutData is supposed here!
        try {
            row.add(lbl);
            fail("Should throw an exception here!");
        } catch (IllegalArgumentException e) {
            assertEquals("Parent class requires layout data of type class " +
                    "nextapp.echo.app.layout.RowLayoutData, object of invalid " +
                    "type class nextapp.echo.app.layout.GridLayoutData had " +
                    "been provided instead!", e.getMessage());
        }
    }
    
    /**
     * Test applying an existing SplitPaneLayoutData
     */
    public void testSplitPaneExisting() {
        SplitPane row = new SplitPane();
        SplitPaneLayoutData rld = new SplitPaneLayoutData();
        rld.setMinimumSize(new Extent(40));
        rld.setInsets(new Insets(4));
        rld.setBackground(Color.BLUE);
        Label lbl = new Label();
        lbl.setLayoutData(rld);
        SplitPaneLayoutData rld2 = row.add(lbl);
        assertTrue(rld == rld2);
        assertEquals(40, rld.getMinimumSize().getValue());
        assertEquals(4, rld.getInsets().getLeft().getValue());
        assertEquals(Color.BLUE, rld2.getBackground());
    }
    
    /**
     * Test standard use case for SplitPaneLayoutData
     */
    public void testSplitPaneNew() {
        SplitPaneLayoutData rld = new SplitPane().add(new Label()).setMinimumSize(new Extent(50)).setInsets(new Insets(5)).setBackground(Color.RED);
        assertEquals(50, rld.getMinimumSize().getValue());
        assertEquals(5, rld.getInsets().getLeft().getValue());
        assertEquals(Color.RED, rld.getBackground());
    }
    
    /**
     * Test applying a wrong existing LayoutData to a SplitPane object
     * (should throw a runtime exception)
     */
    public void testSplitPaneWrongLayoutData() {
        SplitPane splitPane = new SplitPane();
        GridLayoutData gld = new GridLayoutData();
        gld.setRowSpan(50);
        Label lbl = new Label();
        lbl.setLayoutData(gld);  //a SplitPaneLayoutData is supposed here!
        try {
            splitPane.add(lbl);
            fail("Should throw an exception here!");
        } catch (IllegalArgumentException e) {
            assertEquals("Parent class requires layout data of type class " +
                    "nextapp.echo.app.layout.SplitPaneLayoutData, object of invalid " +
                    "type class nextapp.echo.app.layout.GridLayoutData had " +
                    "been provided instead!", e.getMessage());
        }
    }
}
