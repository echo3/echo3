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

import nextapp.echo.app.event.ListDataEvent;
import nextapp.echo.app.event.ListDataListener;
import nextapp.echo.app.list.DefaultListModel;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.list.ListModel</code> and 
 * derivatives. 
 */
public class ListModelTest extends TestCase {
    
    private class ListenerTestDefaultListModel extends DefaultListModel {
        
        public int getEventListenerCount() {
            return getEventListenerList().getListenerCount(ListDataListener.class);
        }
    }
    
    private class TestListDataListener 
    implements ListDataListener {
        
        private ListDataEvent changeEvent, addEvent, removeEvent;
        
        /**
         * @see nextapp.echo.app.event.ListDataListener#contentsChanged(nextapp.echo.app.event.ListDataEvent)
         */
        public void contentsChanged(ListDataEvent e) {
            changeEvent = e;
        }

        /**
         * @see nextapp.echo.app.event.ListDataListener#intervalAdded(nextapp.echo.app.event.ListDataEvent)
         */
        public void intervalAdded(ListDataEvent e) {
            addEvent = e;
        }

        /**
         * @see nextapp.echo.app.event.ListDataListener#intervalRemoved(nextapp.echo.app.event.ListDataEvent)
         */
        public void intervalRemoved(ListDataEvent e) {
            removeEvent = e;
        }
    }
    
    public void testAddAtEnd() {
        DefaultListModel listModel = new DefaultListModel(new Object[]{"alpha", "bravo", "charlie"});
        TestListDataListener testListener = new TestListDataListener();
        listModel.addListDataListener(testListener);
        listModel.add("delta");
        assertEquals(4, listModel.size());
        assertEquals("alpha", listModel.get(0));
        assertEquals("bravo", listModel.get(1));
        assertEquals("charlie", listModel.get(2));
        assertEquals("delta", listModel.get(3));
        assertNull(testListener.changeEvent);
        assertNull(testListener.removeEvent);
        assertNotNull(testListener.addEvent);
        assertEquals(listModel, testListener.addEvent.getSource());
        assertEquals(3, testListener.addEvent.getIndex0());
        assertEquals(3, testListener.addEvent.getIndex1());
        assertEquals(ListDataEvent.INTERVAL_ADDED, testListener.addEvent.getType());
    }

    public void testAddAtIndex() {
        DefaultListModel listModel = new DefaultListModel(new Object[]{"alpha", "bravo", "charlie"});
        TestListDataListener testListener = new TestListDataListener();
        listModel.addListDataListener(testListener);
        listModel.add(2, "delta");
        assertEquals(4, listModel.size());
        assertEquals("alpha", listModel.get(0));
        assertEquals("bravo", listModel.get(1));
        assertEquals("delta", listModel.get(2));
        assertEquals("charlie", listModel.get(3));
        assertNull(testListener.changeEvent);
        assertNull(testListener.removeEvent);
        assertNotNull(testListener.addEvent);
        assertEquals(listModel, testListener.addEvent.getSource());
        assertEquals(2, testListener.addEvent.getIndex0());
        assertEquals(2, testListener.addEvent.getIndex1());
        assertEquals(ListDataEvent.INTERVAL_ADDED, testListener.addEvent.getType());
    }
    
    public void testBasic() {
        DefaultListModel listModel = new DefaultListModel(new Object[]{"alpha", "bravo", "charlie"});
        assertEquals(3, listModel.size());
        assertEquals("alpha", listModel.get(0));
        assertEquals("bravo", listModel.get(1));
        assertEquals("charlie", listModel.get(2));
        assertEquals(1, listModel.indexOf("bravo"));
    }
    
    public void testListenerManagement() {
        ListenerTestDefaultListModel listModel = new ListenerTestDefaultListModel();
        TestListDataListener testListener = new TestListDataListener();
        assertEquals(0, listModel.getEventListenerCount());
        listModel.addListDataListener(testListener);
        assertEquals(1, listModel.getEventListenerCount());
        listModel.removeListDataListener(testListener);
        assertEquals(0, listModel.getEventListenerCount());
    }
    
    public void testRemoveByIndex() {
        DefaultListModel listModel = new DefaultListModel(new Object[]{"alpha", "bravo", "charlie"});
        TestListDataListener testListener = new TestListDataListener();
        listModel.addListDataListener(testListener);
        listModel.remove(1);
        assertEquals(2, listModel.size());
        assertEquals("alpha", listModel.get(0));
        assertEquals("charlie", listModel.get(1));
        assertNull(testListener.changeEvent);
        assertNull(testListener.addEvent);
        assertNotNull(testListener.removeEvent);
        assertEquals(listModel, testListener.removeEvent.getSource());
        assertEquals(1, testListener.removeEvent.getIndex0());
        assertEquals(1, testListener.removeEvent.getIndex1());
        assertEquals(ListDataEvent.INTERVAL_REMOVED, testListener.removeEvent.getType());
    }
    
    public void testRemoveByItem() {
        DefaultListModel listModel = new DefaultListModel(new Object[]{"alpha", "bravo", "charlie"});
        TestListDataListener testListener = new TestListDataListener();
        listModel.addListDataListener(testListener);
        listModel.remove("bravo");
        assertEquals(2, listModel.size());
        assertEquals("alpha", listModel.get(0));
        assertEquals("charlie", listModel.get(1));
        assertNull(testListener.changeEvent);
        assertNull(testListener.addEvent);
        assertNotNull(testListener.removeEvent);
        assertEquals(listModel, testListener.removeEvent.getSource());
        assertEquals(1, testListener.removeEvent.getIndex0());
        assertEquals(1, testListener.removeEvent.getIndex1());
        assertEquals(ListDataEvent.INTERVAL_REMOVED, testListener.removeEvent.getType());
    }
}
