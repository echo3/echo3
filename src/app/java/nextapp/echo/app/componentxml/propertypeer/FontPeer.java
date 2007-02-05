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

package nextapp.echo.app.componentxml.propertypeer;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.Font</code> properties.
 */
public class FontPeer 
implements PropertyXmlPeer {

    private static final Map TYPEFACE_TEXT_TO_CONSTANT;
    static {
        Map constantMap = new HashMap();
        constantMap.put("Helvetica", Font.HELVETICA);
        constantMap.put("Arial", Font.ARIAL);
        constantMap.put("Verdana", Font.VERDANA);
        constantMap.put("Times", Font.TIMES);
        constantMap.put("Times Roman", Font.TIMES_ROMAN);
        constantMap.put("Times New Roman", Font.TIMES_NEW_ROMAN);
        constantMap.put("Courier", Font.COURIER);
        constantMap.put("Courier New", Font.COURIER_NEW);
        TYPEFACE_TEXT_TO_CONSTANT = Collections.unmodifiableMap(constantMap);
    }

    private Font.Typeface getSimpleTypeface(String name) {
        if (TYPEFACE_TEXT_TO_CONSTANT.containsKey(name)) {
            return (Font.Typeface) TYPEFACE_TEXT_TO_CONSTANT.get(name);
        } else {
            return new Font.Typeface(name);
        }
    }

    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        Element fontElement = DomUtil.getChildElementByTagName(propertyElement, "font");
        Extent size = null;
        if (fontElement.hasAttribute("size")) {
            String sizeString = fontElement.getAttribute("size");
            size = ExtentPeer.toExtent(sizeString);
        }
        int style = 0;
        if ("true".equals(fontElement.getAttribute("bold"))) {
            style |= Font.BOLD;
        }
        if ("true".equals(fontElement.getAttribute("italic"))) {
            style |= Font.ITALIC;
        }
        if ("true".equals(fontElement.getAttribute("underline"))) {
            style |= Font.UNDERLINE;
        }
        if ("true".equals(fontElement.getAttribute("overline"))) {
            style |= Font.OVERLINE;
        }
        if ("true".equals(fontElement.getAttribute("line-through"))) {
            style |= Font.LINE_THROUGH;
        }
        Element[] typefaces = DomUtil.getChildElementsByTagName(fontElement, "typeface");
        Font.Typeface typeface;
        if (typefaces.length == 0) {
            if (fontElement.hasAttribute("typeface")) {
                typeface = getSimpleTypeface(fontElement.getAttribute("typeface"));
            } else {
                typeface = null;
            }
        } else if (typefaces.length == 1) {
            typeface = getSimpleTypeface(typefaces[0].getAttribute("name"));
        } else {
            typeface = new Font.Typeface(typefaces[typefaces.length - 1].getAttribute("name"));
            for (int i = typefaces.length - 2; i >= 0; --i) {
                typeface = new Font.Typeface(typefaces[i].getAttribute("name"), typeface);
            }
        }
        return new Font(typeface, style, size);
    }
}
