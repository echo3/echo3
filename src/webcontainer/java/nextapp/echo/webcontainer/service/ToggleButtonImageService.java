/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.webcontainer.service;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.StreamImageService;

/**
 * Service for rendering default images used by <code>ToggleButton</code>s. 
 *
 * @author n.beekman
 */
public class ToggleButtonImageService extends StreamImageService {

    /** <code>Service</code> identifier. */
    private static final String SERVICE_ID = "Echo.ToggleButton.Image"; 
    
    /** Singleton instance of this <code>Service</code>. */
    public static final ToggleButtonImageService INSTANCE = new ToggleButtonImageService();

    private static final String IMAGE_PREFIX = "/nextapp/echo/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_ICON_CHECKBOX_OFF = new ResourceImageReference(IMAGE_PREFIX + "CheckBoxOff.gif");
    private static final ImageReference DEFAULT_ICON_CHECKBOX_ON = new ResourceImageReference(IMAGE_PREFIX + "CheckBoxOn.gif");
    private static final ImageReference DEFAULT_ICON_RADIOBUTTON_OFF = new ResourceImageReference(IMAGE_PREFIX + "RadioButtonOff.gif");
    private static final ImageReference DEFAULT_ICON_RADIOBUTTON_ON = new ResourceImageReference(IMAGE_PREFIX + "RadioButtonOn.gif");
    
    private static final String IMAGE_ID_CHECKBOX_OFF = "checkBoxOff";
    private static final String IMAGE_ID_CHECKBOX_ON = "checkBoxOn";
    private static final String IMAGE_ID_RADIOBUTTON_OFF = "radioButtonOff";
    private static final String IMAGE_ID_RADIOBUTTON_ON = "radioButtonOn";

    static {
        WebContainerServlet.getServiceRegistry().add(INSTANCE);
    }
    
    public static void install() {
        // Do nothing, simply ensure static directives are executed.
    }
    
    /**
     * @see nextapp.echo.webcontainer.Service#getId()
     */
    public String getId() {
        return SERVICE_ID;
    }

    /**
     * @see StreamImageService#getImage(UserInstance, String)
     */
    public ImageReference getImage(UserInstance userInstance, String imageId) {
        if (IMAGE_ID_CHECKBOX_OFF.equals(imageId)) {
            return DEFAULT_ICON_CHECKBOX_OFF;
        } else if (IMAGE_ID_CHECKBOX_ON.equals(imageId)) {
            return DEFAULT_ICON_CHECKBOX_ON;
        } else if (IMAGE_ID_RADIOBUTTON_OFF.equals(imageId)) {
            return DEFAULT_ICON_RADIOBUTTON_OFF;
        } else if (IMAGE_ID_RADIOBUTTON_ON.equals(imageId)) {
            return DEFAULT_ICON_RADIOBUTTON_ON;
        } else {
            return null;
        }
    }
}