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

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.componentxml.StyleSheetLoader;
import nextapp.echo.app.text.TextComponent;
import junit.framework.TestCase;

/**
 * Unit test(s) for <code>nextapp.echo.app.componentxml.propertypeer.FillImagePeer</code>.
 */
public class FillImagePeerTest extends TestCase {

    private StyleSheet styleSheet;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp()
    throws Exception {
        InputStream in = FillImagePeerTest.class.getResourceAsStream("FillImagePeerTest.stylesheet");
        styleSheet = StyleSheetLoader.load(in, StyleSheetLoaderTest.class.getClassLoader());
        in.close();
    }

    public void testCustom() {
        Style bravoStyle = styleSheet.getStyle("bravo", TextComponent.class, true);
        FillImage backgroundImage = (FillImage) bravoStyle.getProperty(TextComponent.PROPERTY_BACKGROUND_IMAGE);
        assertNotNull(backgroundImage);
        ImageReference imageReference = backgroundImage.getImage();
        assertNotNull(imageReference);
        assertTrue(imageReference instanceof ResourceImageReference);
        assertEquals("nextapp/echo/test/componentxml/BackgroundImage.png", 
                ((ResourceImageReference) imageReference).getResource());
        assertEquals(FillImage.REPEAT_HORIZONTAL, backgroundImage.getRepeat());
        assertEquals(new Extent(50), backgroundImage.getHorizontalOffset());
        assertEquals(new Extent(-30, Extent.PERCENT), backgroundImage.getVerticalOffset());
    }
    
    public void testSimple() {
        Style alphaStyle = styleSheet.getStyle("alpha", TextComponent.class, true);
        FillImage backgroundImage = (FillImage) alphaStyle.getProperty(TextComponent.PROPERTY_BACKGROUND_IMAGE);
        assertNotNull(backgroundImage);
        ImageReference imageReference = backgroundImage.getImage();
        assertNotNull(imageReference);
        assertTrue(imageReference instanceof ResourceImageReference);
        assertEquals("nextapp/echo/test/componentxml/BackgroundImage.png", 
                ((ResourceImageReference) imageReference).getResource());
    }
}
