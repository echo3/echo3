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

package nextapp.echo.app.test.componentxml;

import java.io.InputStream;

import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.componentxml.StyleSheetLoader;
import junit.framework.TestCase;

/**
 * Unit test(s) for <code>nextapp.echo.app.componentxml.propertypeer.FontPeer</code>.
 */
public class FontPeerTest extends TestCase {

    private StyleSheet styleSheet;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp()
    throws Exception {
        InputStream in = FontPeerTest.class.getResourceAsStream("FontPeerTest.stylesheet");
        styleSheet = StyleSheetLoader.load(in, StyleSheetLoaderTest.class.getClassLoader());
        in.close();
    }
    
    public void testMappedTypeface() {
        Style style = styleSheet.getStyle("alpha", Component.class, true);
        Font font = (Font) style.getProperty(Component.PROPERTY_FONT);
        assertEquals(new Font(Font.VERDANA, Font.BOLD, new Extent(24, Extent.PT)), font);
    }
    
    public void testMultipleSpecifiedTypefaces() {
        Style style = styleSheet.getStyle("bravo", Component.class, true);
        Font font = (Font) style.getProperty(Component.PROPERTY_FONT);
        Font.Typeface customFace = new Font.Typeface("Verdana", new Font.Typeface("Arial"));
        assertEquals(new Font(customFace, Font.BOLD, new Extent(24, Extent.PT)), font);
    }
    
    public void testStyleConstants() {
        Style style = styleSheet.getStyle("charlie", Component.class, true);
        Font font = (Font) style.getProperty(Component.PROPERTY_FONT);
        assertEquals(new Font(Font.VERDANA, Font.BOLD | Font.ITALIC | Font.UNDERLINE | Font.OVERLINE | Font.LINE_THROUGH, 
                new Extent(24, Extent.PT)), font);
    }
    
    public void testInlineTypeface() {
        Style style = styleSheet.getStyle("delta", Component.class, true);
        Font font = (Font) style.getProperty(Component.PROPERTY_FONT);
        assertEquals(new Font(Font.VERDANA, Font.BOLD, new Extent(24, Extent.PT)), font);
    }
}
