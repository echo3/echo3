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

import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Label;
import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.MutableStyleSheet;
import junit.framework.TestCase;

/**
 * Unit test(s) for <code>nextapp.echo.app.StyleSheet</code>.
 */
public class StyleSheetTest extends TestCase {
    
    public void testBasicOperation() {
        MutableStyleSheet styleSheet = new MutableStyleSheet();
        
        MutableStyle alphaButtonStyle = new MutableStyle();
        alphaButtonStyle.set(Button.PROPERTY_BORDER, TestConstants.BORDER_THICK_ORANGE);
        alphaButtonStyle.set(Button.PROPERTY_BACKGROUND, Color.YELLOW);
        styleSheet.addStyle(Button.class, "alpha", alphaButtonStyle);
        
        assertEquals(alphaButtonStyle, styleSheet.getStyle("alpha", Button.class, true));
        assertNull(styleSheet.getStyle("bravo", Button.class, true));
        
        MutableStyle bravoButtonStyle = new MutableStyle();
        bravoButtonStyle.set(Button.PROPERTY_BORDER, TestConstants.BORDER_THIN_YELLOW);
        bravoButtonStyle.set(Button.PROPERTY_BACKGROUND, Color.GREEN);
        styleSheet.addStyle(Button.class, "bravo", bravoButtonStyle);

        assertEquals(alphaButtonStyle, styleSheet.getStyle("alpha", Button.class, true));
        assertEquals(bravoButtonStyle, styleSheet.getStyle("bravo", Button.class, true));
        
        MutableStyle bravoLabelStyle = new MutableStyle();
        bravoLabelStyle.set(Label.PROPERTY_FOREGROUND, Color.RED);
        styleSheet.addStyle(Label.class, "bravo", bravoLabelStyle);

        assertEquals(alphaButtonStyle, styleSheet.getStyle("alpha", Button.class, true));
        assertEquals(bravoButtonStyle, styleSheet.getStyle("bravo", Button.class, true));
        assertEquals(bravoLabelStyle, styleSheet.getStyle("bravo", Label.class, true));
    }
}
