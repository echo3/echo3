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

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.util.ConstantMap;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

/**
 * <code>XmlPropertyPeer</code> for <code>FillImage</code> properties.
 */
public class FillImagePeer
implements XmlPropertyPeer {
    
    private static final ConstantMap REPEAT_CONSTANTS = new ConstantMap();
    static {
        REPEAT_CONSTANTS.add(FillImage.NO_REPEAT, "0");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_HORIZONTAL, "x");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_VERTICAL, "y");
        REPEAT_CONSTANTS.add(FillImage.REPEAT, "xy");
    }

    public static Element createFillImageElement(Context context, FillImage fillImage) {
        XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
        Element fiElement = xmlContext.getDocument().createElement("fi");
        ImageReference imageReference = fillImage.getImage();
        XmlPropertyPeer propertyPeer = xmlContext.getPropertyPeer(imageReference.getClass());
        if (propertyPeer == null) {
            throw new IllegalArgumentException("Image peer not found for container image");
        } else if (!(propertyPeer instanceof ImageReferencePeer)) {
            throw new IllegalArgumentException("Property peer not found for contained image is not an ImageReferencePeer");
        }
        
        ImageReferencePeer imagePeer = (ImageReferencePeer) propertyPeer ;
        fiElement.setAttribute("u", imagePeer.getImageUrl(context, imageReference));
        
        fiElement.setAttribute("r", REPEAT_CONSTANTS.get(fillImage.getRepeat()));
        return fiElement;
    }
    
    public static FillImage parseFillImageElement(Context context, Element fiElement) 
    throws XmlException {
        XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
        
        String imageType = fiElement.getAttribute("t");
        ImageReference imageReference = null;
        if ("r".equals(imageType)) {
            XmlPropertyPeer imagePropertyPeer = xmlContext.getPropertyPeer(ResourceImageReference.class);
            imageReference = (ImageReference) imagePropertyPeer.toProperty(context, FillImage.class, fiElement);
        }
        int repeat = REPEAT_CONSTANTS.get(fiElement.getAttribute("r"), FillImage.REPEAT);
        Extent x = fiElement.hasAttribute("x") ? ExtentPeer.fromString(fiElement.getAttribute("x") ) : null;
        Extent y = fiElement.hasAttribute("y") ? ExtentPeer.fromString(fiElement.getAttribute("y") ) : null;
        return new FillImage(imageReference, x, y, repeat);
    }
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws XmlException {
        Element fiElement = DomUtil.getChildElementByTagName(propertyElement, "fi");
        return parseFillImageElement(context, fiElement);
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
        FillImage fillImage = (FillImage) propertyValue;
        propertyElement.setAttribute("t", "FillImage");
        propertyElement.appendChild(createFillImageElement(context, fillImage));
    }
}
