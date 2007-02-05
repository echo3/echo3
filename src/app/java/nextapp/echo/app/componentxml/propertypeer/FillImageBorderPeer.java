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

import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import nextapp.echo.app.Color;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyLoader;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.FillImageBorder</code> properties.
 */
public class FillImageBorderPeer 
implements PropertyXmlPeer {

    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement) 
    throws InvalidPropertyException {
        Element fillImageBorderElement = DomUtil.getChildElementByTagName(propertyElement, "fill-image-border");
        if (fillImageBorderElement == null) {
            throw new InvalidPropertyException("Invalid FillImageBorder property.", null);
        }

        FillImageBorder fillImageBorder = new FillImageBorder();
        PropertyLoader propertyLoader = PropertyLoader.forClassLoader(classLoader);
        
        if (fillImageBorderElement.hasAttribute("color")) {
            Color color = ColorPeer.toColor(fillImageBorderElement.getAttribute("color"));
            fillImageBorder.setColor(color);
        }
        if (fillImageBorderElement.hasAttribute("border-insets")) {
            Insets insets = InsetsPeer.toInsets(fillImageBorderElement.getAttribute("border-insets"));
            fillImageBorder.setBorderInsets(insets);
        }
        if (fillImageBorderElement.hasAttribute("content-insets")) {
            Insets insets = InsetsPeer.toInsets(fillImageBorderElement.getAttribute("content-insets"));
            fillImageBorder.setContentInsets(insets);
        }
        
        NodeList borderPartList = fillImageBorderElement.getElementsByTagName("border-part");
        int borderPartCount = borderPartList.getLength();
        for (int i = 0; i < borderPartCount; ++i) {
            Element borderPartElement = (Element) borderPartList.item(i);
            String position = borderPartElement.getAttribute("position");

            FillImage fillImage = (FillImage) propertyLoader.getPropertyValue(FillImageBorder.class, FillImage.class, 
                    borderPartElement);
            
            if ("top-left".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.TOP_LEFT, fillImage);
            } else if ("top".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.TOP, fillImage);
            } else if ("top-right".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.TOP_RIGHT, fillImage);
            } else if ("left".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.LEFT, fillImage);
            } else if ("right".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.RIGHT, fillImage);
            } else if ("bottom-left".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.BOTTOM_LEFT, fillImage);
            } else if ("bottom".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.BOTTOM, fillImage);
            } else if ("bottom-right".equals(position)) {
                fillImageBorder.setFillImage(FillImageBorder.BOTTOM_RIGHT, fillImage);
            }
        }
        
        return fillImageBorder;
    }
}
