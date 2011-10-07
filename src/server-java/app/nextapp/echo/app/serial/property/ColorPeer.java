/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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

import nextapp.echo.app.Color;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>Color</code> properties.
 */
public class ColorPeer 
implements SerialPropertyPeer {

    private static final String COLOR_MASK = "#000000";
    private static final String COLOR_TRANSPARENT = "#transparent";
    
    /**
     * Generates a <code>Color</code> based on a string representation.
     * 
     * @param value the string value
     * @return the generated <code>Color</code>
     * @throws SerialException if the string is not a valid representation of a color
     */
    public static final Color fromString(String value) 
    throws SerialException {
        try {
            if(value.trim().toLowerCase().equals(COLOR_TRANSPARENT)) {
                return Color.TRANSPARENT;
            }
            int colorValue = Integer.parseInt(value.trim().substring(1), 16);
            return new Color(colorValue);
        } catch (IndexOutOfBoundsException ex) {
            throw new SerialException("Invalid color value: " + value, ex);
        } catch (NumberFormatException ex) {
            throw new SerialException("Invalid color value: " + value, ex);
        }
    }

    /**
     * Generates a string representation of a <code>Color</code>.
     * 
     * @param color the <code>Color</code>
     * @return a string representation
     * @throws SerialException
     */
    public static final String toString(Color color) 
    throws SerialException {
        int rgb = color.getRgb();
        if(rgb == -1 || color.equals(Color.TRANSPARENT)) {
            // if we have TRANSPARENT, we return '#-1'
            return COLOR_MASK.substring(0,1) + rgb;
        }
        String colorString = Integer.toString(rgb, 16);
        return COLOR_MASK.substring(0, 7 - colorString.length()) + colorString;
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        return fromString(DomUtil.getElementText(propertyElement));
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue)
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        propertyElement.appendChild(serialContext.getDocument().createTextNode(toString((Color) propertyValue)));
    }
}
