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

package nextapp.echo.testapp.interactive;

import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.componentxml.ComponentXmlException;
import nextapp.echo.app.componentxml.StyleSheetLoader;

/**
 * 
 */
public class Styles {
    
    public static final String IMAGE_PATH = "/nextapp/echo/testapp/interactive/resource/image/";
    public static final String STYLE_PATH = "/nextapp/echo/testapp/interactive/resource/style/";

    public static final ImageReference ICON_64_ERROR
            = new ResourceImageReference("/nextapp/echo/testapp/interactive/resource/image/Icon64Error.gif");
    public static final ImageReference ICON_64_INFORMATION
            = new ResourceImageReference("/nextapp/echo/testapp/interactive/resource/image/Icon64Information.gif");
    public static final ImageReference ICON_64_QUESTION
            = new ResourceImageReference("/nextapp/echo/testapp/interactive/resource/image/Icon64Question.gif");
    public static final ImageReference ICON_64_WARNING
            = new ResourceImageReference("/nextapp/echo/testapp/interactive/resource/image/Icon64Warning.gif");
    

    public static final ImageReference ICON_24_MAIL_COMPOSE = new ResourceImageReference(IMAGE_PATH + "Icon24MailCompose.gif"); 
    public static final ImageReference ICON_24_NO = new ResourceImageReference(IMAGE_PATH + "Icon24No.gif"); 
    public static final ImageReference ICON_24_YES = new ResourceImageReference(IMAGE_PATH + "Icon24Yes.gif");
    public static final ImageReference ECHO_IMAGE = new ResourceImageReference(IMAGE_PATH + "Echo.png");
    public static final ImageReference INTERACTIVE_TEST_APPLICATION_IMAGE 
            = new ResourceImageReference(IMAGE_PATH + "InteractiveTestApplication.png");
    public static final ImageReference NEXTAPP_LOGO = new ResourceImageReference(IMAGE_PATH + "NextAppLogo.png");
    
    public static final FillImage BG_SHADOW_DARK_BLUE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ShadowBackgroundDarkBlue.png"), null, null, FillImage.NO_REPEAT);
    public static final FillImage BG_SHADOW_LIGHT_BLUE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ShadowBackgroundLightBlue.png"), null, null, FillImage.NO_REPEAT);
    
    public static final ImageReference RG_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGStateIcon.gif");
    public static final ImageReference RG_SELECTED_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGSelectedStateIcon.gif");
    public static final ImageReference RG_ROLLOVER_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGRolloverStateIcon.gif");
    public static final ImageReference RG_ROLLOVER_SELECTED_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGRolloverSelectedStateIcon.gif");
    public static final ImageReference RG_PRESSED_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGPressedStateIcon.gif");
    public static final ImageReference RG_PRESSED_SELECTED_STATE_ICON = new ResourceImageReference(
            IMAGE_PATH + "RGPressedSelectedStateIcon.gif");
    
    public static final FillImage BUTTON_BACKGROUND_IMAGE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ButtonBackground.png"));
    public static final FillImage BUTTON_PRESSED_BACKGROUND_IMAGE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ButtonPressedBackground.png"));
    public static final FillImage BUTTON_DISABLED_BACKGROUND_IMAGE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ButtonDisabledBackground.png"));
    public static final FillImage BUTTON_ROLLOVER_BACKGROUND_IMAGE = new FillImage(new ResourceImageReference(
            IMAGE_PATH + "ButtonRolloverBackground.png"));
    
    
    public static final ImageReference ICON_LOGO =  new ResourceImageReference(IMAGE_PATH + "Logo.png");
    public static final ImageReference DISABLED_ICON_LOGO =  new ResourceImageReference(IMAGE_PATH + "LogoDisabled.png");
    public static final ImageReference ROLLOVER_ICON_LOGO 
            = new ResourceImageReference(IMAGE_PATH + "LogoRollover.png");
    public static final ImageReference PRESSED_ICON_LOGO 
            = new ResourceImageReference(IMAGE_PATH + "LogoPressed.png");

    public static final StyleSheet DEFAULT_STYLE_SHEET;
    public static final StyleSheet GREEN_STYLE_SHEET;
    static {
        try {
            DEFAULT_STYLE_SHEET = StyleSheetLoader.load(STYLE_PATH + "Default.stylesheet", 
                    Thread.currentThread().getContextClassLoader());
            GREEN_STYLE_SHEET = StyleSheetLoader.load(STYLE_PATH + "Green.stylesheet", 
                    Thread.currentThread().getContextClassLoader());
        } catch (ComponentXmlException ex) {
            throw new RuntimeException(ex);
        }
    }
}
