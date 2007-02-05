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

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyLoader;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.FillImage</code> properties.
 */
public class FillImagePeer 
implements PropertyXmlPeer {

    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        Element fillImageElement = DomUtil.getChildElementByTagName(propertyElement, "fill-image");
        if (fillImageElement == null) {
            throw new InvalidPropertyException("Invalid FillImage property.", null);
        }
        
        Extent offsetX = fillImageElement.hasAttribute("horizontal")
                ? ExtentPeer.toExtent(fillImageElement.getAttribute("horizontal")) : null;
        Extent offsetY = fillImageElement.hasAttribute("vertical")
                ? ExtentPeer.toExtent(fillImageElement.getAttribute("vertical")) : null;
        
        int repeat;
        String repeatString = fillImageElement.getAttribute("repeat");
        if ("horizontal".equals(repeatString)) {
            repeat = FillImage.REPEAT_HORIZONTAL;
        } else if ("vertical".equals(repeatString)) {
            repeat = FillImage.REPEAT_VERTICAL;
        } else if ("none".equals(repeatString)) {
            repeat = FillImage.NO_REPEAT;
        } else {
            repeat = FillImage.REPEAT;
        }
        
        Element imageElement = DomUtil.getChildElementByTagName(fillImageElement, "image");
        if (imageElement == null) {
            throw new InvalidPropertyException("Invalid FillImage property.", null);
        }
        String imageType = imageElement.getAttribute("type");
        PropertyLoader propertyLoader = PropertyLoader.forClassLoader(classLoader);
        
        Class propertyClass;
        try {
            propertyClass = Class.forName(imageType, true, classLoader);
        } catch (ClassNotFoundException ex) {
            throw new InvalidPropertyException("Invalid FillImage property (type \"" + imageType + "\" not found.", ex);
        }
        
        Object imagePropertyValue = propertyLoader.getPropertyValue(FillImage.class, propertyClass, imageElement);
        if (!(imagePropertyValue instanceof ImageReference)) {
            throw new InvalidPropertyException("Invalid FillImage property (type \"" + imageType 
                    + "\" is not an ImageReference.", null);
        }

        ImageReference imageReference = (ImageReference) imagePropertyValue;
        FillImage fillImage = new FillImage(imageReference, offsetX, offsetY, repeat);
        
        return fillImage;
    }
}
