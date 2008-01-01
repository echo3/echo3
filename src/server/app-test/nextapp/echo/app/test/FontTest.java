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

import junit.framework.TestCase;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Font</code> property 
 * value object.
 */
public class FontTest extends TestCase {
    
    /**
     * Test equality.
     */
    public void testFontEquals() {
        Font font1 = new Font(Font.SANS_SERIF, Font.PLAIN, new Extent(12, Extent.PT));
        Font font2 = new Font(Font.SANS_SERIF, Font.PLAIN, new Extent(12, Extent.PT));
        Font font3 = new Font(Font.SANS_SERIF, Font.BOLD, new Extent(12, Extent.PT));
        Font font4 = new Font(Font.SANS_SERIF, Font.BOLD | Font.ITALIC, new Extent(12, Extent.PT));
        Font font5 = new Font(Font.SANS_SERIF, Font.PLAIN, new Extent(13, Extent.PT));
        Font font6 = new Font(Font.SANS_SERIF, Font.PLAIN, new Extent(12, Extent.PX));

        assertEquals(true, font1.equals(font1));
        assertEquals(true, font1.equals(font2));
        assertEquals(false, font1.equals(font3));
        assertEquals(false, font1.equals(font4));
        assertEquals(false, font1.equals(font5));
        assertEquals(false, font1.equals(font6));
        assertEquals(false, font1.equals(null));
    }
    
    /**
     * Test <code>toString()</code> (debug).
     */
    public void testToString() {
        Font font;
        
        font = new Font(Font.SANS_SERIF, Font.PLAIN, new Extent(12, Extent.PT));
        assertEquals("nextapp.echo.app.Font (Sans-Serif / Plain / 12pt)", font.toString());
        
        font = new Font(Font.VERDANA, Font.PLAIN, new Extent(12, Extent.PT));
        assertEquals("nextapp.echo.app.Font (Verdana, Arial, Helvetica, Sans-Serif / Plain / 12pt)", font.toString());
        
        font = new Font(Font.TIMES_NEW_ROMAN, Font.BOLD | Font.ITALIC | Font.UNDERLINE, new Extent(24, Extent.PX));
        assertEquals("nextapp.echo.app.Font (Times New Roman, Times Roman, Times, Serif / Bold Italic Underline / 24px)", 
                font.toString());
        
        font = new Font(Font.SANS_SERIF, Font.BOLD | Font.ITALIC | Font.LINE_THROUGH | Font.OVERLINE | Font.UNDERLINE, 
                new Extent(12, Extent.PT));
        assertEquals("nextapp.echo.app.Font (Sans-Serif / Bold Italic LineThrough Overline Underline / 12pt)", font.toString());
    }

    /**
     * Test equality of <code>Font.TypeFace</code> objects.
     */
    public void testTypefaceEquals() {
        assertEquals(false, Font.TIMES_NEW_ROMAN.equals(Font.TIMES_ROMAN));
        assertEquals(true, Font.TIMES_ROMAN.equals(Font.TIMES_ROMAN));
        assertEquals(true, Font.HELVETICA.equals(new Font.Typeface("Helvetica", new Font.Typeface("Sans-Serif"))));
        assertEquals(false, Font.HELVETICA.equals(new Font.Typeface("Helvetica", new Font.Typeface("Serif"))));
        assertEquals(false, Font.HELVETICA.equals(null));
    }
}
