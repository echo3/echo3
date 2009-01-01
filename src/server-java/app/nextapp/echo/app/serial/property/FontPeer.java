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

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>Font</code> properties.
 */
public class FontPeer 
implements SerialPropertyPeer {
    
    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        Element fElement = DomUtil.getChildElementByTagName(propertyElement, "f");
        
        int style = Font.PLAIN;
        style |= "1".equals(fElement.getAttribute("bo")) ? Font.BOLD : 0;
        style |= "1".equals(fElement.getAttribute("it")) ? Font.ITALIC : 0;
        style |= "1".equals(fElement.getAttribute("un")) ? Font.UNDERLINE : 0;
        style |= "1".equals(fElement.getAttribute("ov")) ? Font.OVERLINE : 0;
        style |= "1".equals(fElement.getAttribute("lt")) ? Font.LINE_THROUGH : 0;
        Extent size = null;

        if (fElement.hasAttribute("sz")) {
            size = ExtentPeer.fromString(fElement.getAttribute("sz"));
        }
        
        Element[] tfElements = DomUtil.getChildElementsByTagName(fElement, "tf");
        Font.Typeface typeface = null;
        for (int i = tfElements.length - 1; i >= 0; --i) {
            String name;
            if (tfElements[i].hasAttribute("n")) {
                name = tfElements[i].getAttribute("n");
            } else {
                name = DomUtil.getElementText(tfElements[i]).trim();
            }
            if (typeface == null) {
                typeface = new Font.Typeface(name);
            } else {
                typeface = new Font.Typeface(name, typeface);
            }
        }
        
        return new Font(typeface, style, size);
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        propertyElement.setAttribute("t", 
                (serialContext.getFlags() & SerialContext.FLAG_RENDER_SHORT_NAMES) == 0 ? "Font" : "F");
        Font font = (Font) propertyValue;
        Element element = serialContext.getDocument().createElement("f");
        
        Font.Typeface typeface = font.getTypeface();
        while (typeface != null) {
            Element tfElement = serialContext.getDocument().createElement("tf");
            tfElement.appendChild(serialContext.getDocument().createTextNode(typeface.getName()));
            element.appendChild(tfElement);
            typeface = typeface.getAlternate();
        }
        
        Extent size = font.getSize();
        if (size != null) {
            element.setAttribute("sz", ExtentPeer.toString(size));
        }
        
        if (!font.isPlain()) {
            if (font.isBold()) {
                element.setAttribute("bo", "1");
            }
            if (font.isItalic()) {
                element.setAttribute("it", "1");
            }
            if (font.isUnderline()) {
                element.setAttribute("un", "1");
            }
            if (font.isOverline()) {
                element.setAttribute("ov", "1");
            }
            if (font.isLineThrough()) {
                element.setAttribute("lt", "1");
            }
        }
        propertyElement.appendChild(element);
    }
}
