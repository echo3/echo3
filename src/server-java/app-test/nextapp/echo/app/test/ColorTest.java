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

import nextapp.echo.app.Color;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Color</code> property 
 * value object.
 */
public class ColorTest extends TestCase {

    /**
     * Test equality.
     */
    public void testEquals() {
        assertEquals(Color.RED, new Color(0xff0000));
        assertFalse(Color.RED.equals(new Color(0xfe0000)));
    }
    
    /**
     * Test constructor with combined (single int) RGB value.
     */
    public void testConstructorCombined() {
        Color color = new Color(0xabcdef);
        assertEquals(color.getRed(), 0xab);
        assertEquals(color.getGreen(), 0xcd);
        assertEquals(color.getBlue(), 0xef);
    }
    
    /**
     * Test constructor with independent R/G/B values.
     */
    public void testConstructorIndependent() {
        Color color = new Color(0xab, 0xcd, 0xef);
        assertEquals(color.getRed(), 0xab);
        assertEquals(color.getGreen(), 0xcd);
        assertEquals(color.getBlue(), 0xef);
    }
}
