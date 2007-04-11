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

package nextapp.echo.app.serial.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialUtil;
import nextapp.echo.app.util.Context;

/**
 * <code>XmlPropertyPeer</code> for <code>SplitPane</code> properties.
 */
public class SplitPaneLayoutDataPeer
extends LayoutDataPeer {

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        SplitPaneLayoutData layoutData = (SplitPaneLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "alignment", layoutData.getAlignment());
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "background", layoutData.getBackground());
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "insets", layoutData.getInsets());
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "maximumSize", layoutData.getMaximumSize());
        SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "minimumSize", layoutData.getMinimumSize());
        if (layoutData.getOverflow() != SplitPaneLayoutData.OVERFLOW_AUTO) {
            SerialUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "overflow", 
                    new Integer(layoutData.getOverflow()));
        }
    }
}
