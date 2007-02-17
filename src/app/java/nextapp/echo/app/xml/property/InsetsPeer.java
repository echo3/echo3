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

package nextapp.echo.app.xml.property;

import java.util.StringTokenizer;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

/**
 * <code>XmlPropertyPeer</code> for <code>Insets</code> properties.
 */
public class InsetsPeer 
implements XmlPropertyPeer {
    
    public static Insets fromString(String value) 
    throws XmlException {
        Extent[] extents = new Extent[4];
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
            throw new XmlException("Invalid extent string: " + value, null);
        }
    }
    
    public static String toString(Insets insets) {
        if (insets.getTop().equals(insets.getBottom())) {
            if (insets.getLeft().equals(insets.getRight())) {
                if (insets.getTop().equals(insets.getLeft())) {
                    // All sides are equals.
                    return ExtentPeer.toString(insets.getTop());
                } else {
                    // Horizontal and vertical are equal.
                    return ExtentPeer.toString(insets.getTop()) + " " + ExtentPeer.toString(insets.getLeft());
                }
            }
        }
        return ExtentPeer.toString(insets.getTop()) 
                + " " + ExtentPeer.toString(insets.getRight())
                + " " + ExtentPeer.toString(insets.getBottom())
                + " " + ExtentPeer.toString(insets.getLeft());
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) 
    throws XmlException {
        return fromString(propertyElement.getAttribute("v"));
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Class objectClass,
            Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Insets");
        Insets insets = (Insets) propertyValue;
        propertyElement.setAttribute("v", toString(insets));
    }
}
