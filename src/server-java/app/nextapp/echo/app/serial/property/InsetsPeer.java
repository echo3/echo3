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

import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>Insets</code> properties.
 */
public class InsetsPeer 
implements SerialPropertyPeer {
    
    /**
     * Generates an <code>Insets</code> property from a string representation.
     * 
     * @param value the string representation
     * @return the generated <code>Insets</code> value
     * @throws SerialException if the provided string representation is not valid
     */
    public static Insets fromString(String value) 
    throws SerialException {
        if (value == null) {
            return null;
        }
        Extent[] extents = new Extent[4];
        value = value.trim();
        StringTokenizer st = new StringTokenizer(value, " ");
        int count = 0;
        for (int i = 0; i < extents.length && st.hasMoreTokens(); ++i) {
            extents[i] = ExtentPeer.fromString(st.nextToken());
            ++count;
        }
        switch (count) {
        case 1:
            return new Insets(extents[0]);
        case 2:
            return new Insets(extents[1], extents[0]);
        case 3:
            return new Insets(extents[1], extents[0], extents[1], extents[2]);
        case 4:
            return new Insets(extents[3], extents[0], extents[1], extents[2]);
        default:
            throw new SerialException("Invalid extent string: " + value, null);
        }
    }
    
    /**
     * Determines if two extent values are equivalent.
     * 
     * @param extent1 the first extent
     * @param extent2 the second extent
     * @return true if the extents are equivalent.
     */
    private static boolean equals(Extent extent1, Extent extent2) {
       if (extent1 == null && extent2 == null) {
           return true;
       } else if (extent1 == null || extent2 == null) {
           return false;
       }
       return extent1.equals(extent2);
    }
    
    /**
     * Utility method; converts an extent to a string, returning 0 for null values.
     * 
     * @param extent the <code>extent</code>
     * @return a string representation of the extent, or 0 if the extent is null
     * @throws SerialException
     */
    private static String toString(Extent extent) 
    throws SerialException {
        return extent == null ? "0px" : ExtentPeer.toString(extent); 
    }
    
    /**
     * Generates a string representation of an <code>Insets</code> property.
     * 
     * @param insets the <code>Insets</code> property
     * @return a string representation
     * @throws SerialException
     */
    public static String toString(Insets insets) 
    throws SerialException {
        if (equals(insets.getTop(), insets.getBottom())) {
            if (equals(insets.getLeft(), insets.getRight())) {
                if (equals(insets.getTop(), insets.getLeft())) {
                    // All sides are equal.
                    return toString(insets.getTop());
                } else {
                    // Horizontal and vertical are equal.
                    return toString(insets.getTop()) + " " + toString(insets.getLeft());
                }
            }
        }
        return toString(insets.getTop()) 
                + " " + toString(insets.getRight())
                + " " + toString(insets.getBottom())
                + " " + toString(insets.getLeft());
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        return fromString(propertyElement.hasAttribute("v") 
                ? propertyElement.getAttribute("v") : DomUtil.getElementText(propertyElement));
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        propertyElement.setAttribute("t", 
                (serialContext.getFlags() & SerialContext.FLAG_RENDER_SHORT_NAMES) == 0 ? "Insets" : "N");
        propertyElement.appendChild(serialContext.getDocument().createTextNode(toString((Insets) propertyValue)));
    }
}
