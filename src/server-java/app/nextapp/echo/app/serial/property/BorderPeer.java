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

package nextapp.echo.app.serial.property;

import java.util.StringTokenizer;

import org.w3c.dom.Element;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.ConstantMap;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>Border</code> properties.
 */
public class BorderPeer 
implements SerialPropertyPeer {
    
    private static final ConstantMap STYLE_CONSTANT_MAP = new ConstantMap();
    static {
        STYLE_CONSTANT_MAP.add(Border.STYLE_NONE, "none");
        STYLE_CONSTANT_MAP.add(Border.STYLE_SOLID, "solid");
        STYLE_CONSTANT_MAP.add(Border.STYLE_INSET, "inset");
        STYLE_CONSTANT_MAP.add(Border.STYLE_OUTSET, "outset");
        STYLE_CONSTANT_MAP.add(Border.STYLE_GROOVE, "groove");
        STYLE_CONSTANT_MAP.add(Border.STYLE_RIDGE, "ridge");
        STYLE_CONSTANT_MAP.add(Border.STYLE_DOTTED, "dotted");
        STYLE_CONSTANT_MAP.add(Border.STYLE_DASHED, "dashed");
        STYLE_CONSTANT_MAP.add(Border.STYLE_DOUBLE, "double");
    }

    private static final String[] borderSideAttributeNames = new String[]{"t", "r", "b", "l"};
    
    /**
     * Generates a string representation of a <code>Border</code>
     * 
     * @param border the border
     * @return the string representation
     * @throws SerialException
     */
    public static final String toString(Border border) 
    throws SerialException {
        return toString(border.getSides()[0]);
    }
    
    /**
     * Generates a string representation of a <code>Border.Side</code>
     * 
     * @param side the border side
     * @return the string representation
     * @throws SerialException
     */
    public static final String toString(Border.Side side) 
    throws SerialException {
        StringBuffer out = new StringBuffer();
        out.append(ExtentPeer.toString(side.getSize()));
        out.append(" ");
        out.append(STYLE_CONSTANT_MAP.get(side.getStyle()));
        out.append(" ");
        out.append(ColorPeer.toString(side.getColor()));
        return out.toString();
    }
    
    /**
     * Generates a <code>Border.Side</code> from a string representation.
     * To create a non-multisided border from a string, simply pass the returned
     * <code>Border.Side</code> to the constructor of a new <code>Border</code>.
     * 
     * @param value the string representation
     * @return the generated <code>Border.Side</code>
     * @throws SerialException if the string is not a valid representation of a <code>Border.Side</code>
     */
    public static final Border.Side fromString(String value) 
    throws SerialException {
        StringTokenizer st = new StringTokenizer(value, " ");
        String sizeString = st.nextToken();
        String styleString = st.nextToken();
        String colorString = st.nextToken();

        Extent size = ExtentPeer.fromString(sizeString);
        int style = STYLE_CONSTANT_MAP.get(styleString, Border.STYLE_SOLID);
        Color color = ColorPeer.fromString(colorString);
        
        return new Border.Side(size, color, style);
    }
    
    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        String value = DomUtil.getElementText(propertyElement);
        if (value != null) {
            value = value.trim();
        }
        if (value != null && value.length() > 0) {
            Border.Side side = fromString(value);
            return new Border(new Border.Side[]{side});
        } else if (propertyElement.hasAttribute("v")) {
            Border.Side side = fromString(propertyElement.getAttribute("v"));
            return new Border(new Border.Side[]{side});
        } else {
            Element borderElement = DomUtil.getChildElementByTagName(propertyElement, "b");
            
            // Determine number of side attributes.
            int sideCount = 0;
            while (sideCount < borderSideAttributeNames.length) {
                if (!borderElement.hasAttribute(borderSideAttributeNames[sideCount])) {
                    break;
                }
                ++sideCount;
            }
            
            Border.Side[] sides = new Border.Side[sideCount];
            for (int i = 0; i < sides.length; ++i) {
                sides[i] = fromString(borderElement.getAttribute(borderSideAttributeNames[i]));
            }
            return new Border(sides);
        }
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue)
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        propertyElement.setAttribute("t", 
                (serialContext.getFlags() & SerialContext.FLAG_RENDER_SHORT_NAMES) == 0 ? "Border" : "BO");
        Border border = (Border) propertyValue;
        if (border.isMultisided()) {
            Element borderElement = serialContext.getDocument().createElement("b");
            Border.Side[] sides = border.getSides();
            for (int i = 0; i < sides.length; ++i) {
                if (sides[i] == null) {
                    borderElement.setAttribute(borderSideAttributeNames[i], "");
                } else {
                    borderElement.setAttribute(borderSideAttributeNames[i], toString(sides[i]));
                }
            }
            propertyElement.appendChild(borderElement);
        } else {
            propertyElement.appendChild(serialContext.getDocument().createTextNode(toString(border)));
        }
    }
}
