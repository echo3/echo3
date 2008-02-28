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
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.ResourceImageReference;

/**
 * Property constants used in component tests.
 */
public class TestConstants {
    
    public static final FillImageBorder FILL_IMAGE_BORDER = new FillImageBorder(Color.BLUE, new Insets(3), new Insets(5));
    
    public static final Font MONOSPACE_12 = new Font(Font.MONOSPACE, Font.PLAIN, new Extent(12, Extent.PT));
    public static final Font TIMES_72 = new Font(Font.MONOSPACE, Font.PLAIN, new Extent(72, Extent.PT));
    
    public static final Border BORDER_THIN_YELLOW = new Border(new Extent(1, Extent.PX), Color.YELLOW, Border.STYLE_DASHED);
    public static final Border BORDER_THICK_ORANGE = new Border(new Extent(20, Extent.PX), Color.ORANGE, Border.STYLE_DOUBLE);

    public static final ImageReference ICON = new ResourceImageReference("/icon.jpg");
    public static final ImageReference ROLLOVER_ICON = new ResourceImageReference("/rollovericon.jpg");
    public static final ImageReference PRESSED_ICON = new ResourceImageReference("/pressedicon.jpg");
    
    public static final Insets INSETS_SIMPLE = new Insets(new Extent(10, Extent.PX));
    public static final Insets INSETS_1234 = new Insets(new Extent(1, Extent.PX), new Extent(2, Extent.PX), 
            new Extent(3, Extent.PX), new Extent(4, Extent.PX));
    
    public static final FillImage BACKGROUND_IMAGE = new FillImage(ICON, new Extent(5), new Extent(30), 
            FillImage.REPEAT_HORIZONTAL);

    public static final Extent EXTENT_500_PX = new Extent(500);
    public static final Extent EXTENT_200_PX = new Extent(200);
    public static final Extent EXTENT_100_PX = new Extent(100);
    public static final Extent EXTENT_30_PX = new Extent(30);
    public static final Extent EXTENT_50_PERCENT = new Extent(50, Extent.PERCENT);
}
