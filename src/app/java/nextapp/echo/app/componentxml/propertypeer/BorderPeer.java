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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.Border</code> properties.
 */
public class BorderPeer 
implements PropertyXmlPeer {
    
    private static final Map STYLE_TEXT_TO_CONSTANT;
    static {
        Map constantMap = new HashMap();
        constantMap.put("dashed", new Integer(Border.STYLE_DASHED));
        constantMap.put("dotted", new Integer(Border.STYLE_DOTTED));
        constantMap.put("double", new Integer(Border.STYLE_DOUBLE));
        constantMap.put("groove", new Integer(Border.STYLE_GROOVE));
        constantMap.put("inset", new Integer(Border.STYLE_INSET));
        constantMap.put("none", new Integer(Border.STYLE_NONE));
        constantMap.put("outset", new Integer(Border.STYLE_OUTSET));
        constantMap.put("ridge", new Integer(Border.STYLE_RIDGE));
        constantMap.put("solid", new Integer(Border.STYLE_SOLID));
        STYLE_TEXT_TO_CONSTANT = Collections.unmodifiableMap(constantMap);
    }
    
    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        Element borderElement = DomUtil.getChildElementByTagName(propertyElement, "border");
        
        Color color = borderElement.hasAttribute("color") ? ColorPeer.toColor(borderElement.getAttribute("color")) : null;
        Extent size = borderElement.hasAttribute("size") ? ExtentPeer.toExtent(borderElement.getAttribute("size")) : null;
        
        String styleString = borderElement.getAttribute("style");
        int style;
        if (styleString == null) {
            style = Border.STYLE_NONE;
        } else if (!STYLE_TEXT_TO_CONSTANT.containsKey(styleString)) {
            throw new IllegalArgumentException("Invalid border style: " + styleString);
        } else {
            style = ((Integer) STYLE_TEXT_TO_CONSTANT.get(styleString)).intValue();
        }
        
        return new Border(size, color, style);
    }
}
