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

import nextapp.echo.app.Extent;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Extent</code> property 
 * value object.
 */
public class ExtentTest extends TestCase {
    
    private static final Extent _50_CENTIMETERS = new Extent(50, Extent.CM);
    private static final Extent _50_EM = new Extent(50, Extent.EM);
    private static final Extent _50_EX = new Extent(50, Extent.EX);
    private static final Extent _50_INCHES = new Extent(50, Extent.IN);
    private static final Extent _50_MILLIMETERS = new Extent(50, Extent.MM);
    private static final Extent _50_PERCENT = new Extent(50, Extent.PERCENT);
    private static final Extent _50_PICAS = new Extent(50, Extent.PC);
    private static final Extent _50_PIXELS = new Extent(50, Extent.PX);
    private static final Extent _50_POINT = new Extent(50, Extent.PT);

    /**
     * Test extent addition.
     */
    public void testAdd() {
        assertEquals(Extent.add(_50_EM, _50_EM), new Extent(100, Extent.EM));
    }
    
    /**
     * Test equality.
     */
    public void testEquals() {
        assertEquals(new Extent(20, Extent.CM), new Extent(20, Extent.CM));
        assertFalse(new Extent(20, Extent.CM).equals(new Extent(21, Extent.CM)));
        assertFalse(new Extent(20, Extent.MM).equals(new Extent(21, Extent.CM)));
    }

    /**
     * Test <code>Comparable</code> implementation.
     */
    public void testCompareTo() {
        assertTrue(_50_INCHES.compareTo(_50_INCHES) == 0);
        assertTrue(_50_CENTIMETERS.compareTo(_50_INCHES) < 0);
        assertTrue(_50_MILLIMETERS.compareTo(_50_INCHES) < 0);
        assertTrue(_50_PICAS.compareTo(_50_INCHES) < 0);
        assertTrue(_50_POINT.compareTo(_50_INCHES) < 0);
        assertTrue(_50_INCHES.compareTo(_50_CENTIMETERS) == 0 - _50_CENTIMETERS.compareTo(_50_INCHES));
        assertTrue(_50_POINT.compareTo(_50_INCHES) == 0 - _50_INCHES.compareTo(_50_POINT));
        
        assertTrue(_50_EX.compareTo(_50_PIXELS) != 0);
        assertTrue(_50_EX.compareTo(_50_PIXELS) == 0 - _50_PIXELS.compareTo(_50_EX));
    }

    /**
     * Test <code>isComparableTo()</code>.
     */
    public void testIsComparableTo() {
        assertTrue(_50_CENTIMETERS.isComparableTo(_50_MILLIMETERS));
        assertTrue(_50_INCHES.isComparableTo(_50_MILLIMETERS));
        assertTrue(_50_PICAS.isComparableTo(_50_MILLIMETERS));
        assertTrue(_50_POINT.isComparableTo(_50_MILLIMETERS));
        assertTrue(_50_PIXELS.isComparableTo(_50_PIXELS));
        assertFalse(_50_PERCENT.isComparableTo(_50_MILLIMETERS));
        assertFalse(_50_PERCENT.isComparableTo(_50_PIXELS));
    }

    /**
     * Test <code>isEnglish()</code>.
     */
    public void testIsEnglish() {
        assertFalse(_50_CENTIMETERS.isEnglish());
        assertFalse(_50_EM.isEnglish());
        assertFalse(_50_EX.isEnglish());
        assertTrue(_50_INCHES.isEnglish());
        assertFalse(_50_MILLIMETERS.isEnglish());
        assertFalse(_50_PERCENT.isEnglish());
        assertTrue(_50_PICAS.isEnglish());
        assertFalse(_50_PIXELS.isEnglish());
        assertTrue(_50_POINT.isEnglish());
    }

    /**
     * Test <code>isSI()</code>.
     */
    public void testIsSI() {
        assertTrue(_50_CENTIMETERS.isSI());
        assertFalse(_50_EM.isSI());
        assertFalse(_50_EX.isSI());
        assertFalse(_50_INCHES.isSI());
        assertTrue(_50_MILLIMETERS.isSI());
        assertFalse(_50_PERCENT.isSI());
        assertFalse(_50_PICAS.isSI());
        assertFalse(_50_PIXELS.isSI());
        assertFalse(_50_POINT.isSI());
    }

    /**
     * Test <code>isPercentage()</code>.
     */
    public void testIsPercentage() {
        assertFalse(_50_CENTIMETERS.isPercentage());
        assertFalse(_50_EM.isPercentage());
        assertFalse(_50_EX.isPercentage());
        assertFalse(_50_INCHES.isPercentage());
        assertFalse(_50_MILLIMETERS.isPercentage());
        assertTrue(_50_PERCENT.isPercentage());
        assertFalse(_50_PICAS.isPercentage());
        assertFalse(_50_PIXELS.isPercentage());
        assertFalse(_50_POINT.isPercentage());
    }

    /**
     * Test <code>isPrint()</code>.
     */
    public void testIsPrint() {
        assertTrue(_50_CENTIMETERS.isPrint());
        assertFalse(_50_EM.isPrint());
        assertFalse(_50_EX.isPrint());
        assertTrue(_50_INCHES.isPrint());
        assertTrue(_50_MILLIMETERS.isPrint());
        assertFalse(_50_PERCENT.isPrint());
        assertTrue(_50_PICAS.isPrint());
        assertFalse(_50_PIXELS.isPrint());
        assertTrue(_50_POINT.isPrint());
    }

    /**
     * Test conversion to millimeters.
     */
    public void testToMm() {
        assertEquals(20, new Extent(20, Extent.MM).toMm());
        assertEquals(20, new Extent(2, Extent.CM).toMm());
        assertEquals(2540, new Extent(100, Extent.IN).toMm());
        assertEquals(2540, new Extent(7200, Extent.PT).toMm());
        assertEquals(2540, new Extent(600, Extent.PC).toMm());
        
        try {
            new Extent(1, Extent.EM).toMm();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.EX).toMm();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.PERCENT).toMm();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.PX).toMm();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
    }

    /**
     * Test conversion to points.
     */
    public void testToPoint() {
        assertEquals(20, new Extent(20, Extent.PT).toPoint());
        assertEquals(7200, new Extent(2540, Extent.MM).toPoint());
        assertEquals(7200, new Extent(254, Extent.CM).toPoint());
        assertEquals(7200, new Extent(100, Extent.IN).toPoint());
        assertEquals(7200, new Extent(600, Extent.PC).toPoint());
        
        try {
            new Extent(1, Extent.EM).toPoint();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.EX).toPoint();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.PERCENT).toPoint();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
        
        try {
            new Extent(1, Extent.PX).toPoint();
            fail("Did not throw IllegalStateException.");
        } catch (IllegalStateException ex) {
            // Expected.
        }
    }
}
