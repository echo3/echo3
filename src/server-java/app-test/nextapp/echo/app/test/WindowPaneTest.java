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
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.IllegalChildException;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;

/**
 * Unit test(s) for the <code>nextapp.echo.app.WindowPane</code> component.
 */
public class WindowPaneTest extends TestCase {
    
    /**
     * Test receiving input from client.
     */
    public void testInput() {
        WindowPane windowPane = new WindowPane();
        windowPane.add(new Label("a label"));
        windowPane.setPositionX(TestConstants.EXTENT_100_PX);
        windowPane.setPositionY(TestConstants.EXTENT_100_PX);
        windowPane.processInput(WindowPane.PROPERTY_POSITION_X, TestConstants.EXTENT_200_PX);
        windowPane.processInput(WindowPane.PROPERTY_POSITION_Y, TestConstants.EXTENT_30_PX);
        assertEquals(TestConstants.EXTENT_200_PX, windowPane.getPositionX());
        assertEquals(TestConstants.EXTENT_30_PX, windowPane.getPositionY());
    }
    
    /**
     * Attempt to illegally add WindowPane to SplitPane, test for failure.
     */
    public void testInvalidParent() {
        SplitPane splitPane = new SplitPane();
        WindowPane windowPane = new WindowPane();
        boolean exceptionThrown = false;
        try {
            splitPane.add(windowPane);
        } catch (IllegalChildException ex) {
            exceptionThrown = true;
        }
        assertTrue(exceptionThrown);
    }
    
    /**
     * Ensure WindowPane can be legally added to a ContentPane.
     */
    public void testValidParent() {
        ContentPane contentPane = new ContentPane();
        WindowPane windowPane = new WindowPane();
        contentPane.add(windowPane);
    }
    
    /**
     * Attempt to illegally add more than one child, test for failure.
     */
    public void testOverload() {
        WindowPane windowPane = new WindowPane();
        windowPane.add(new Label("one label"));
        boolean exceptionThrown = false;
        try {
            windowPane.add(new Label("one label too many"));
        } catch (IllegalChildException ex) {
            exceptionThrown = true;
        }
        assertTrue(exceptionThrown);
    }
    
    /**
     * Test primary constructor.
     */
    public void testPrimaryConstructor() {
        WindowPane windowPane = new WindowPane("Hello", TestConstants.EXTENT_500_PX, TestConstants.EXTENT_200_PX);
        assertEquals(TestConstants.EXTENT_500_PX, windowPane.getWidth());
        assertEquals(TestConstants.EXTENT_200_PX, windowPane.getHeight());
        assertEquals("Hello", windowPane.getTitle());
    }
    
    /**
     * Test property accessors and mutators.
     */
    public void testProperties() {
        WindowPane windowPane = new WindowPane();
        windowPane.setBorder(TestConstants.FILL_IMAGE_BORDER);
        assertEquals(TestConstants.FILL_IMAGE_BORDER, windowPane.getBorder());
        windowPane.setHeight(TestConstants.EXTENT_200_PX);
        assertEquals(TestConstants.EXTENT_200_PX, windowPane.getHeight());
        windowPane.setPositionX(TestConstants.EXTENT_100_PX);
        assertEquals(TestConstants.EXTENT_100_PX, windowPane.getPositionX());
        windowPane.setPositionY(TestConstants.EXTENT_30_PX);
        assertEquals(TestConstants.EXTENT_30_PX, windowPane.getPositionY());
        windowPane.setTitle("Title!");
        assertEquals("Title!", windowPane.getTitle());
        windowPane.setTitleBackground(Color.ORANGE);
        assertEquals(Color.ORANGE, windowPane.getTitleBackground());
        windowPane.setTitleFont(TestConstants.MONOSPACE_12);
        assertEquals(TestConstants.MONOSPACE_12, windowPane.getTitleFont());
        windowPane.setTitleForeground(Color.PINK);
        assertEquals(Color.PINK, windowPane.getTitleForeground());
        windowPane.setWidth(TestConstants.EXTENT_500_PX);
        assertEquals(TestConstants.EXTENT_500_PX, windowPane.getWidth());
        windowPane.setClosable(false);
        assertFalse(windowPane.isClosable());
    }
}
