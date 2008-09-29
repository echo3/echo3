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

import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.list.DefaultListSelectionModel;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.list.ListSelectionModel</code>
 * and derivatives. 
 */
public class ListSelectionModelTest extends TestCase {
    
    public class TestChangeListener
    implements ChangeListener {
        
        private ChangeEvent e;
        
        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            this.e = e;
        }
    }
    
    public void testChangeSelectionMode() {
        DefaultListSelectionModel selectionModel = new DefaultListSelectionModel();
        TestChangeListener changeListener = new TestChangeListener();
        selectionModel.addChangeListener(changeListener);
        selectionModel.setSelectionMode(DefaultListSelectionModel.MULTIPLE_SELECTION);
        assertEquals(DefaultListSelectionModel.MULTIPLE_SELECTION, selectionModel.getSelectionMode());
        selectionModel.setSelectedIndex(25, true);
        selectionModel.setSelectedIndex(27, true);
        selectionModel.setSelectedIndex(50, true);
        selectionModel.setSelectedIndex(44, true);
        assertEquals(25, selectionModel.getMinSelectedIndex());
        assertEquals(50, selectionModel.getMaxSelectedIndex());
        changeListener.e = null;
        
        selectionModel.setSelectionMode(DefaultListSelectionModel.SINGLE_SELECTION);
        assertEquals(DefaultListSelectionModel.SINGLE_SELECTION, selectionModel.getSelectionMode());
        assertEquals(25, selectionModel.getMinSelectedIndex());
        assertEquals(25, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
    }
    
    public void testInitialState() {
        DefaultListSelectionModel selectionModel = new DefaultListSelectionModel();
        
        assertTrue(selectionModel.isSelectionEmpty());
        assertEquals(-1, selectionModel.getMinSelectedIndex());
        assertEquals(-1, selectionModel.getMaxSelectedIndex());
        assertFalse(selectionModel.isSelectedIndex(0));
        assertFalse(selectionModel.isSelectedIndex(1));
        assertFalse(selectionModel.isSelectedIndex(2));
    }
    
    public void testMultipleSelection() {
        DefaultListSelectionModel selectionModel = new DefaultListSelectionModel();
        selectionModel.setSelectionMode(DefaultListSelectionModel.MULTIPLE_SELECTION);
        assertEquals(DefaultListSelectionModel.MULTIPLE_SELECTION, selectionModel.getSelectionMode());
        
        TestChangeListener changeListener = new TestChangeListener();
        selectionModel.addChangeListener(changeListener);
        
        selectionModel.setSelectedIndex(50, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(50));
        assertFalse(selectionModel.isSelectedIndex(0));
        assertFalse(selectionModel.isSelectedIndex(5));
        assertFalse(selectionModel.isSelectedIndex(49));
        assertFalse(selectionModel.isSelectedIndex(51));
        assertEquals(50, selectionModel.getMinSelectedIndex());
        assertEquals(50, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
        
        selectionModel.setSelectedIndex(75, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(75));
        assertEquals(50, selectionModel.getMinSelectedIndex());
        assertEquals(75, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
        
        selectionModel.setSelectedIndex(67, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(67));
        assertTrue(selectionModel.isSelectedIndex(75));
        assertEquals(50, selectionModel.getMinSelectedIndex());
        assertEquals(75, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
        
        selectionModel.setSelectedIndex(21, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(21));
        assertTrue(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(67));
        assertTrue(selectionModel.isSelectedIndex(75));
        assertEquals(21, selectionModel.getMinSelectedIndex());
        assertEquals(75, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;

        selectionModel.setSelectedIndex(75, false);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(21));
        assertTrue(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(67));
        assertFalse(selectionModel.isSelectedIndex(75));
        assertEquals(21, selectionModel.getMinSelectedIndex());
        assertEquals(67, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;

        selectionModel.setSelectedIndex(21, false);
        assertFalse(selectionModel.isSelectionEmpty());
        assertFalse(selectionModel.isSelectedIndex(21));
        assertTrue(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(67));
        assertFalse(selectionModel.isSelectedIndex(75));
        assertEquals(50, selectionModel.getMinSelectedIndex());
        assertEquals(67, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
        
        selectionModel.clearSelection();
        assertTrue(selectionModel.isSelectionEmpty());
        assertFalse(selectionModel.isSelectedIndex(21));
        assertFalse(selectionModel.isSelectedIndex(50));
        assertFalse(selectionModel.isSelectedIndex(67));
        assertFalse(selectionModel.isSelectedIndex(75));
        assertEquals(-1, selectionModel.getMinSelectedIndex());
        assertEquals(-1, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
    }
    
    public void testSingleSelection() {
        DefaultListSelectionModel selectionModel = new DefaultListSelectionModel();
        assertEquals(DefaultListSelectionModel.SINGLE_SELECTION, selectionModel.getSelectionMode());
        TestChangeListener changeListener = new TestChangeListener();
        selectionModel.addChangeListener(changeListener);
        
        selectionModel.setSelectedIndex(50, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertTrue(selectionModel.isSelectedIndex(50));
        assertFalse(selectionModel.isSelectedIndex(0));
        assertFalse(selectionModel.isSelectedIndex(5));
        assertFalse(selectionModel.isSelectedIndex(49));
        assertFalse(selectionModel.isSelectedIndex(51));
        assertEquals(50, selectionModel.getMinSelectedIndex());
        assertEquals(50, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
        
        selectionModel.setSelectedIndex(75, true);
        assertFalse(selectionModel.isSelectionEmpty());
        assertFalse(selectionModel.isSelectedIndex(50));
        assertTrue(selectionModel.isSelectedIndex(75));
        assertEquals(75, selectionModel.getMinSelectedIndex());
        assertEquals(75, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;

        selectionModel.clearSelection();
        assertTrue(selectionModel.isSelectionEmpty());
        assertFalse(selectionModel.isSelectedIndex(50));
        assertFalse(selectionModel.isSelectedIndex(75));
        assertEquals(-1, selectionModel.getMinSelectedIndex());
        assertEquals(-1, selectionModel.getMaxSelectedIndex());
        assertNotNull(changeListener.e);
        assertEquals(selectionModel, changeListener.e.getSource());
        changeListener.e = null;
    }
}
