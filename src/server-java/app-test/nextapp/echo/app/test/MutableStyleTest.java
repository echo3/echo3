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
        style1.setIndex("alpha", 0, "tango");
        style1.setIndex("alpha", 2, "uniform");
        style1.setIndex("alpha", 3, "victor");
        style1.set("charlie", "delta");
        style1.set("echo", "foxtrot");
        
        MutableStyle style2 = new MutableStyle();
        style2.set("charlie", "golf");
        assertEquals("golf", style2.get("charlie"));
        
        style2.addStyleContent(style1);
        
        assertEquals("tango", style2.getIndex("alpha", 0));
        assertEquals("uniform", style2.getIndex("alpha", 2));
        assertEquals("victor", style2.getIndex("alpha", 3));
        assertEquals("delta", style2.get("charlie"));
        assertEquals("foxtrot", style2.get("echo"));
        
        style2.setIndex("alpha", 3, "whiskey");
        assertEquals("whiskey", style2.getIndex("alpha", 3));
        assertEquals("victor", style1.getIndex("alpha", 3));
        
        style2.set("echo", "hotel");
        assertEquals("hotel", style2.get("echo"));
        assertEquals("foxtrot", style1.get("echo"));
    }
    
    public void testBasic() {
        MutableStyle style = new MutableStyle();
        assertEquals(0, style.size());
        assertFalse(style.isPropertySet("alpha"));
        assertNull(style.get("alpha"));
        
        style.set("alpha", "bravo");
        assertEquals(1, style.size());
        assertTrue(style.isPropertySet("alpha"));
        assertFalse(style.isPropertySet("bravo"));
        
        style.set("bravo", "charlie");
        assertEquals(2, style.size());
        assertEquals("bravo", style.get("alpha"));
        assertEquals("charlie", style.get("bravo"));
        
        style.set("bravo", "delta");
        assertEquals(2, style.size());
        assertEquals("bravo", style.get("alpha"));
        assertEquals("delta", style.get("bravo"));
        
        style.set("echo", "foxtrot");
        style.set("golf", "hotel");
        style.set("india", "juliet");
        style.set("kilo", "lima");
        assertEquals(6, style.size());
        assertEquals("juliet", style.get("india"));
        
        style.removeProperty("kilo");
        assertEquals(5, style.size());
        assertNull(style.get("kilo"));

        style.removeProperty("alpha");
        assertEquals(4, style.size());
        assertNull(style.get("alpha"));
        
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
        style.setIndex("alpha", 0, "zero");
        style.setIndex("alpha", 1, "one");
        style.setIndex("alpha", 5, "five");
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
        style.set("alpha", "bravo");
        style.set("charlie", "delta");
        style.set("echo", "foxtrot");
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
        style.setIndex("alpha", 0, "0");
        style.setIndex("alpha", 1, "1");
        style.setIndex("alpha", 2, "2");
        style.setIndex("alpha", 0, "3");
        
        assertFalse(style.isIndexedPropertySet("alpha", -1));
        assertTrue(style.isIndexedPropertySet("alpha", 0));
        assertTrue(style.isIndexedPropertySet("alpha", 1));
        assertTrue(style.isIndexedPropertySet("alpha", 2));
        assertFalse(style.isIndexedPropertySet("alpha", 3));
        assertEquals("3", style.getIndex("alpha", 0));
        assertEquals("1", style.getIndex("alpha", 1));
        assertEquals("2", style.getIndex("alpha", 2));
        
        style.removeIndexedProperty("alpha", 1);
        assertFalse(style.isIndexedPropertySet("alpha", 1));
    }
    
    public void testSet1Set2Remove2Set2() {
        MutableStyle style = new MutableStyle();
        style.set("golf", "hotel");
        style.set("alpha", "bravo");
        assertEquals("hotel", style.get("golf"));
        assertEquals("bravo", style.get("alpha"));
        style.set("alpha", null);
        assertEquals("hotel", style.get("golf"));
        assertEquals(null, style.get("alpha"));
        style.set("alpha", "bravo");
        assertEquals("hotel", style.get("golf"));
        assertEquals("bravo", style.get("alpha"));
    }
}
