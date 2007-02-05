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

import nextapp.echo.app.Button;
import nextapp.echo.app.Extent;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.componentxml.StyleSheetLoader;
import junit.framework.TestCase;

/**
 * Unit test(s) for <code>nextapp.echo.app.componentxml.propertypeer.FontPeer</code>.
 */
public class ImageReferencePeerTest extends TestCase {

    private StyleSheet styleSheet;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp()
    throws Exception {
        InputStream in = ImageReferencePeerTest.class.getResourceAsStream("ImageReferencePeerTest.stylesheet");
        styleSheet = StyleSheetLoader.load(in, StyleSheetLoaderTest.class.getClassLoader());
        in.close();
    }
    
    public void testResourceImageReferenceInline() {
        Style alphaStyle = styleSheet.getStyle("alpha", Button.class, true);
        assertTrue(alphaStyle.getProperty(Button.PROPERTY_ICON) instanceof ResourceImageReference);
        ResourceImageReference icon = (ResourceImageReference) alphaStyle.getProperty(Button.PROPERTY_ICON);
        assertEquals("nextapp.echo/test/componentxml/Alpha.png", icon.getResource());
    }
    
    public void testResourceImageReferencePlain() {
        Style bravoStyle = styleSheet.getStyle("bravo", Button.class, true);
        assertTrue(bravoStyle.getProperty(Button.PROPERTY_ICON) instanceof ResourceImageReference);
        ResourceImageReference icon = (ResourceImageReference) bravoStyle.getProperty(Button.PROPERTY_ICON);
        assertEquals("nextapp.echo/test/componentxml/Bravo.png", icon.getResource());
    }
    
    public void testResourceImageReferenceDimensioned() {
        Style charlieStyle = styleSheet.getStyle("charlie", Button.class, true);
        assertTrue(charlieStyle.getProperty(Button.PROPERTY_ICON) instanceof ResourceImageReference);
        ResourceImageReference icon = (ResourceImageReference) charlieStyle.getProperty(Button.PROPERTY_ICON);
        assertEquals("nextapp.echo/test/componentxml/Charlie.png", icon.getResource());
        assertEquals(new Extent(20), icon.getWidth());
        assertEquals(new Extent(30), icon.getHeight());
    }
    
    public void testResourceImageReferenceContentTypeHalfDimensioned() {
        Style deltaStyle = styleSheet.getStyle("delta", Button.class, true);
        assertTrue(deltaStyle.getProperty(Button.PROPERTY_ICON) instanceof ResourceImageReference);
        ResourceImageReference icon = (ResourceImageReference) deltaStyle.getProperty(Button.PROPERTY_ICON);
        assertEquals("nextapp.echo/test/componentxml/Delta.whoknows", icon.getResource());
        assertEquals("image/gif", icon.getContentType());
        assertEquals(new Extent(30), icon.getWidth());
        assertNull(icon.getHeight());
    }
}
