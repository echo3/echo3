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

import nextapp.echo.app.Extent;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>ResourceImageReference</code> properties.
 */
public class ResourceImageReferencePeer 
implements SerialPropertyPeer {
    
    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        Element iElement = DomUtil.getChildElementByTagName(propertyElement, "i");
        if (iElement == null) {
            return new ResourceImageReference(DomUtil.getElementText(propertyElement));
        } else {
            String url = DomUtil.getElementText(iElement);
            if (url == null) {
                // "r" attribute provided for backward compatibility, but should be considered deprecated.
                url = iElement.getAttribute("r");
            }
            String contentType = iElement.hasAttribute("t") ? iElement.getAttribute("t") : null;
            Extent width = iElement.hasAttribute("w") ? ExtentPeer.fromString(iElement.getAttribute("w")) : null;
            Extent height = iElement.hasAttribute("h") ? ExtentPeer.fromString(iElement.getAttribute("h")) : null;
            return new ResourceImageReference(url, contentType, width, height);
        }
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        ResourceImageReference resourceImage = (ResourceImageReference) propertyValue;
        Element iElement = serialContext.getDocument().createElement("i");
        propertyElement.appendChild(iElement);
        iElement.appendChild(serialContext.getDocument().createTextNode(resourceImage.getResource()));
        iElement.setAttribute("t", resourceImage.getContentType());
        if (resourceImage.getWidth() != null) {
            iElement.setAttribute("w", ExtentPeer.toString(resourceImage.getWidth()));
        }
        if (resourceImage.getHeight() != null) {
            iElement.setAttribute("h", ExtentPeer.toString(resourceImage.getHeight()));
        }
    }
}
