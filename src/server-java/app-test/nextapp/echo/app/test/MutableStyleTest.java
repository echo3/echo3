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

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import nextapp.echo.app.MutableStyle;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.MutableStyle</code>. 
 */
public class MutableStyleTest extends TestCase {
    
    public void testAddStyle() {
        MutableStyle style1 = new MutableStyle();
        style1.setIndexedProperty("alpha", 0, "tango");
        style1.setIndexedProperty("alpha", 2, "uniform");
        style1.setIndexedProperty("alpha", 3, "victor");
        style1.setProperty("charlie", "delta");
        style1.setProperty("echo", "foxtrot");
        
        MutableStyle style2 = new MutableStyle();
        style2.setProperty("charlie", "golf");
        assertEquals("golf", style2.getProperty("charlie"));
        
        style2.addStyleContent(style1);
        
        assertEquals("tango", style2.getIndexedProperty("alpha", 0));
        assertEquals("uniform", style2.getIndexedProperty("alpha", 2));
        assertEquals("victor", style2.getIndexedProperty("alpha", 3));
        assertEquals("delta", style2.getProperty("charlie"));
        assertEquals("foxtrot", style2.getProperty("echo"));
        
        style2.setIndexedProperty("alpha", 3, "whiskey");
        assertEquals("whiskey", style2.getIndexedProperty("alpha", 3));
        assertEquals("victor", style1.getIndexedProperty("alpha", 3));
        
        style2.setProperty("echo", "hotel");
        assertEquals("hotel", style2.getProperty("echo"));
        assertEquals("foxtrot", style1.getProperty("echo"));
    }
    
    public void testBasic() {
        MutableStyle style = new MutableStyle();
        assertEquals(0, style.size());
        assertFalse(style.isPropertySet("alpha"));
        assertNull(style.getProperty("alpha"));
        
        style.setProperty("alpha", "bravo");
        assertEquals(1, style.size());
        assertTrue(style.isPropertySet("alpha"));
        assertFalse(style.isPropertySet("bravo"));
        
        style.setProperty("bravo", "charlie");
        assertEquals(2, style.size());
        assertEquals("bravo", style.getProperty("alpha"));
        assertEquals("charlie", style.getProperty("bravo"));
        
        style.setProperty("bravo", "delta");
        assertEquals(2, style.size());
        assertEquals("bravo", style.getProperty("alpha"));
        assertEquals("delta", style.getProperty("bravo"));
        
        style.setProperty("echo", "foxtrot");
        style.setProperty("golf", "hotel");
        style.setProperty("india", "juliet");
        style.setProperty("kilo", "lima");
        assertEquals(6, style.size());
        assertEquals("juliet", style.getProperty("india"));
        
        style.removeProperty("kilo");
        assertEquals(5, style.size());
        assertNull(style.getProperty("kilo"));

        style.removeProperty("alpha");
        assertEquals(4, style.size());
        assertNull(style.getProperty("alpha"));
        
        style.removeProperty("mike");
        assertEquals(4, style.size());
        
        style.removeProperty("echo");
        style.removeProperty("golf");
        style.removeProperty("india");
        assertEquals(1, style.size());
        
        style.removeProperty("bravo");
        assertEquals(0, style.size());
    }
    
    public void testGetPropertyIndices() {
        MutableStyle style = new MutableStyle();
        style.setIndexedProperty("alpha", 0, "zero");
        style.setIndexedProperty("alpha", 1, "one");
        style.setIndexedProperty("alpha", 5, "five");
        Iterator it = style.getPropertyIndices("alpha");
        assertNotNull(it);
        Set indices = new HashSet();
        while (it.hasNext()) {
            indices.add(it.next());
        }
        assertTrue(indices.contains(new Integer(0)));
        assertTrue(indices.contains(new Integer(1)));
        assertFalse(indices.contains(new Integer(2)));
        assertTrue(indices.contains(new Integer(5)));
    }
    
    public void testGetPropertyNames() {
        MutableStyle style = new MutableStyle();
        style.setProperty("alpha", "bravo");
        style.setProperty("charlie", "delta");
        style.setProperty("echo", "foxtrot");
        Iterator it = style.getPropertyNames();
        assertNotNull(it);
        Set names = new HashSet();
        while (it.hasNext()) {
            names.add(it.next());
        }
        assertTrue(names.contains("alpha"));
        assertTrue(names.contains("charlie"));
        assertTrue(names.contains("echo"));
        assertFalse(names.contains("bravo"));
        assertFalse(names.contains("delta"));
        assertFalse(names.contains("foxtrot"));
    }
    
    public void testIndexedProperty() {
        MutableStyle style = new MutableStyle();
        style.setIndexedProperty("alpha", 0, "0");
        style.setIndexedProperty("alpha", 1, "1");
        style.setIndexedProperty("alpha", 2, "2");
        style.setIndexedProperty("alpha", 0, "3");
        
        assertFalse(style.isIndexedPropertySet("alpha", -1));
        assertTrue(style.isIndexedPropertySet("alpha", 0));
        assertTrue(style.isIndexedPropertySet("alpha", 1));
        assertTrue(style.isIndexedPropertySet("alpha", 2));
        assertFalse(style.isIndexedPropertySet("alpha", 3));
        assertEquals("3", style.getIndexedProperty("alpha", 0));
        assertEquals("1", style.getIndexedProperty("alpha", 1));
        assertEquals("2", style.getIndexedProperty("alpha", 2));
        
        style.removeIndexedProperty("alpha", 1);
        assertFalse(style.isIndexedPropertySet("alpha", 1));
    }
    
    public void testSet1Set2Remove2Set2() {
        MutableStyle style = new MutableStyle();
        style.setProperty("golf", "hotel");
        style.setProperty("alpha", "bravo");
        assertEquals("hotel", style.getProperty("golf"));
        assertEquals("bravo", style.getProperty("alpha"));
        style.setProperty("alpha", null);
        assertEquals("hotel", style.getProperty("golf"));
        assertEquals(null, style.getProperty("alpha"));
        style.setProperty("alpha", "bravo");
        assertEquals("hotel", style.getProperty("golf"));
        assertEquals("bravo", style.getProperty("alpha"));
    }
}