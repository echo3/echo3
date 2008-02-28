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

package nextapp.echo.app.test;

import junit.framework.TestCase;

import nextapp.echo.app.Grid;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Grid</code> component.
 */
public class GridTest extends TestCase {
    
    /**
     * Test default values.
     */
    public void testDefaults() {
        Grid grid = new Grid();
        assertEquals(Grid.ORIENTATION_HORIZONTAL, grid.getOrientation());
        assertEquals(2, grid.getSize());
    }
    
    /**
     * Test property accessors and mutators.
     */
    public void testProperties() {
        Grid grid = new Grid();
        grid.setBorder(TestConstants.BORDER_THICK_ORANGE);
        grid.setInsets(TestConstants.INSETS_1234);
        grid.setOrientation(Grid.ORIENTATION_VERTICAL);
        grid.setSize(5);
        grid.setWidth(TestConstants.EXTENT_50_PERCENT);
        grid.setHeight(TestConstants.EXTENT_500_PX);
        grid.setColumnWidth(0, TestConstants.EXTENT_100_PX);
        grid.setColumnWidth(1, TestConstants.EXTENT_200_PX);
        grid.setRowHeight(0, TestConstants.EXTENT_30_PX);
        grid.setRowHeight(1, TestConstants.EXTENT_500_PX);
        assertEquals(TestConstants.BORDER_THICK_ORANGE, grid.getBorder());
        assertEquals(TestConstants.INSETS_1234, grid.getInsets());
        assertEquals(Grid.ORIENTATION_VERTICAL, grid.getOrientation());
        assertEquals(5, grid.getSize());
        assertEquals(TestConstants.EXTENT_50_PERCENT, grid.getWidth());
        assertEquals(TestConstants.EXTENT_500_PX, grid.getHeight());
        assertEquals(TestConstants.EXTENT_100_PX, grid.getColumnWidth(0));
        assertEquals(TestConstants.EXTENT_200_PX, grid.getColumnWidth(1));
        assertEquals(TestConstants.EXTENT_30_PX, grid.getRowHeight(0));
        assertEquals(TestConstants.EXTENT_500_PX, grid.getRowHeight(1));
    }
}
