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

import nextapp.echo.app.Color;
import nextapp.echo.app.ListBox;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import junit.framework.TestCase;

/**
 * Unit tests for the <code>nextapp.echo.app.ListBox</code> component.
 */
public class ListBoxTest extends TestCase {

    private class ActionHandler implements ActionListener {
        
        private ActionEvent lastEvent;
        
        public void actionPerformed(ActionEvent e) {
            lastEvent = e;
        }
    }
    
    /**
     * Test Adding/Removing <code>ActionListener</code>s and
     * receiving events.
     */
    public void testActionListeners() {
        ListBox listBox = new ListBox();
        listBox.setActionCommand("action!");
        
        assertFalse(listBox.hasActionListeners());
        
        ActionHandler actionHandler = new ActionHandler();
        listBox.addActionListener(actionHandler);

        assertTrue(listBox.hasActionListeners());
        
        listBox.processInput(ListBox.INPUT_ACTION, null);
        assertNotNull(actionHandler.lastEvent);
        assertEquals(listBox, actionHandler.lastEvent.getSource());
        assertEquals("action!", actionHandler.lastEvent.getActionCommand());

        listBox.removeActionListener(actionHandler);

        assertFalse(listBox.hasActionListeners());
    }
    
    /**
     * Test property accessors and mutators.
     */
    public void testProperties() {
        ListBox listBox = new ListBox();
        listBox.setActionCommand("action!");
        listBox.setBorder(TestConstants.BORDER_THICK_ORANGE);
        listBox.setHeight(TestConstants.EXTENT_30_PX);
        listBox.setInsets(TestConstants.INSETS_1234);
        listBox.setRolloverEnabled(true);
        listBox.setRolloverBackground(Color.GREEN);
        listBox.setRolloverFont(TestConstants.MONOSPACE_12);
        listBox.setRolloverForeground(Color.YELLOW);
        listBox.setWidth(TestConstants.EXTENT_100_PX);
        assertEquals("action!", listBox.getActionCommand());
        assertEquals(TestConstants.BORDER_THICK_ORANGE, listBox.getBorder());
        assertEquals(Color.GREEN, listBox.getRolloverBackground());
        assertEquals(true, listBox.isRolloverEnabled());
        assertEquals(TestConstants.MONOSPACE_12, listBox.getRolloverFont());
        assertEquals(Color.YELLOW, listBox.getRolloverForeground());
        assertEquals(TestConstants.EXTENT_30_PX, listBox.getHeight());
        assertEquals(TestConstants.INSETS_1234, listBox.getInsets());
        assertEquals(TestConstants.EXTENT_100_PX, listBox.getWidth());
    }
}
