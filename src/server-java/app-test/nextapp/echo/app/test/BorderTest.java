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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Border</code> property 
 * value object.
 */
public class BorderTest extends TestCase {
    
    /**
     * Test constructor.
     */
    public void testConstructor() {
        Border border = new Border(new Extent(5, Extent.PX), Color.BLUE, Border.STYLE_OUTSET);
        assertEquals(new Extent(5, Extent.PX), border.getSize());
        assertEquals(Color.BLUE, border.getColor());
        assertEquals(Border.STYLE_OUTSET, border.getStyle());
    }
    
    /**
     * Test equality.
     */
    public void testEquals() {
        Border border1 = new Border(new Extent(5, Extent.PX), Color.BLUE, Border.STYLE_OUTSET);
        Border border2 = new Border(new Extent(5, Extent.PX), Color.BLUE, Border.STYLE_OUTSET);
        Border border3 = new Border(new Extent(5, Extent.PX), Color.GREEN, Border.STYLE_OUTSET);
        Border border4 = new Border(new Extent(5, Extent.PX), Color.BLUE, Border.STYLE_INSET);
        Border border5 = new Border(new Extent(4, Extent.PX), Color.BLUE, Border.STYLE_OUTSET);
        Border border6 = new Border(new Extent(5, Extent.PX), null, Border.STYLE_OUTSET);
        Border border7 = new Border(null, Color.BLUE, Border.STYLE_INSET);
        assertTrue(border1.equals(border1));
        assertTrue(border1.equals(border2));
        assertFalse(border1.equals(border3));
        assertFalse(border1.equals(border4));
        assertFalse(border1.equals(border5));
        assertFalse(border1.equals(border6));
        assertFalse(border1.equals(border7));
        assertFalse(border1.equals(null));
        assertFalse(border2.equals(border3));
        assertFalse(border2.equals(border4));
        assertFalse(border2.equals(border5));
        assertFalse(border2.equals(border6));
        assertFalse(border2.equals(border7));
        assertFalse(border3.equals(border4));
        assertFalse(border3.equals(border5));
        assertFalse(border3.equals(border6));
        assertFalse(border3.equals(border7));
        assertFalse(border4.equals(border3));
        assertFalse(border4.equals(border5));
        assertFalse(border4.equals(border6));
        assertFalse(border4.equals(border7));
    }
}
