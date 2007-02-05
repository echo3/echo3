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

import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Alignment</code> property 
 * value object.
 */
public class InsetsTest extends TestCase {
    
    private static final Extent PX_1 = new Extent(1, Extent.PX);
    private static final Extent PX_2 = new Extent(2, Extent.PX);
    private static final Extent PX_3 = new Extent(3, Extent.PX);
    private static final Extent PX_4 = new Extent(4, Extent.PX);
    
    /**
     * Test all-margins equal constructor.
     */
    public void testConstructorEqual() {
        Insets insets = new Insets(PX_1);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_1);
        assertEquals(insets.getRight(), PX_1);
        assertEquals(insets.getBottom(), PX_1);
    }
    
    /**
     * Test horizontal = vertical constructor.
     */
    public void testConstructorHV() {
        Insets insets = new Insets(PX_1, PX_2);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_2);
        assertEquals(insets.getRight(), PX_1);
        assertEquals(insets.getBottom(), PX_2);
    }
    
    /**
     * Test all-margins specific constructor.
     */
    public void testConstructorSpecific() {
        Insets insets = new Insets(PX_1, PX_2, PX_3, PX_4);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_2);
        assertEquals(insets.getRight(), PX_3);
        assertEquals(insets.getBottom(), PX_4);
    }
    
    /**
     * Test integer/pixel all-margins equal constructor.
     */
    public void testConstructorPixelEqual() {
        Insets insets = new Insets(1);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_1);
        assertEquals(insets.getRight(), PX_1);
        assertEquals(insets.getBottom(), PX_1);
    }
    
    /**
     * Test integer/pixel horizontal = vertical constructor.
     */
    public void testConstructorPixelHV() {
        Insets insets = new Insets(1, 2);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_2);
        assertEquals(insets.getRight(), PX_1);
        assertEquals(insets.getBottom(), PX_2);
    }
    
    /**
     * Test integer/pixel all-margins specific constructor.
     */
    public void testConstructorPixelSpecific() {
        Insets insets = new Insets(1, 2, 3, 4);
        assertEquals(insets.getLeft(), PX_1);
        assertEquals(insets.getTop(), PX_2);
        assertEquals(insets.getRight(), PX_3);
        assertEquals(insets.getBottom(), PX_4);
    }
    
    /**
     * Test <code>equals()</code> method.
     */
    public void testEquals() {
        assertEquals(new Insets(1), new Insets(1));
        assertEquals(new Insets(1, 2), new Insets(1, 2));
        assertEquals(new Insets(1, 2, 3, 4), new Insets(1, 2, 3, 4));
        assertEquals(new Insets(null, null, null, null), new Insets(null, null, null, null));
        assertFalse(new Insets(1, 2, 3, 4).equals(new Insets(1, 2, 3, 5)));
        assertFalse(new Insets(1, 2, 3, 4).equals(new Insets(1, 2, 5, 4)));
        assertFalse(new Insets(1, 2, 3, 4).equals(new Insets(1, 5, 3, 4)));
        assertFalse(new Insets(1, 2, 3, 4).equals(new Insets(5, 2, 3, 4)));
        assertTrue(new Insets(PX_1, PX_2, PX_3, PX_4).equals(new Insets(PX_1, PX_2, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, PX_3, PX_4).equals(new Insets(null, PX_2, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, PX_3, PX_4).equals(new Insets(PX_1, null, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, PX_3, PX_4).equals(new Insets(PX_1, PX_2, null, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, PX_3, PX_4).equals(new Insets(PX_1, PX_2, PX_3, null)));
        assertFalse(new Insets(null, PX_2, PX_3, PX_4).equals(new Insets(PX_1, PX_2, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, null, PX_3, PX_4).equals(new Insets(PX_1, PX_2, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, null, PX_4).equals(new Insets(PX_1, PX_2, PX_3, PX_4)));
        assertFalse(new Insets(PX_1, PX_2, PX_3, null).equals(new Insets(PX_1, PX_2, PX_3, PX_4)));
    }
}
