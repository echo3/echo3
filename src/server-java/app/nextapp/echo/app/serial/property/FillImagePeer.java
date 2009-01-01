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
import nextapp.echo.app.FillImage;
import nextapp.echo.app.HttpImageReference;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.ConstantMap;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>SerialPropertyPeer</code> for <code>FillImage</code> properties.
 */
public class FillImagePeer
implements SerialPropertyPeer {
    
    private static final ConstantMap REPEAT_CONSTANTS = new ConstantMap();
    static {
        REPEAT_CONSTANTS.add(FillImage.NO_REPEAT, "0");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_HORIZONTAL, "x");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_VERTICAL, "y");
        REPEAT_CONSTANTS.add(FillImage.REPEAT, "xy");
    }

    /**
     * Generates a <code>&lt;fi&gt;</code> DOM element representing a fill image.
     * This method is used internally and for <code>FillImageBorder</code> serialization.
     * 
     * @param context a <code>Context</code> object which provides a 
     *        <code>SerialContext</code> and <code>PropertyPeerFactory</code>
     * @param fillImage the <code>FillImage</code> to render
     * @return a generated <code>&lt;fi&gt;</code> element representing the fill image
     * @throws SerialException
     */
    public Element toElement(Context context, FillImage fillImage) 
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        Element fiElement = serialContext.getDocument().createElement("fi");
        ImageReference imageReference = fillImage.getImage();
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(imageReference.getClass());
        if (propertyPeer == null) {
            throw new IllegalArgumentException("Image peer not found for container image");
        } else if (!(propertyPeer instanceof ImageReferencePeer)) {
            throw new IllegalArgumentException("Property peer for contained image is not an ImageReferencePeer");
        }
        
        ImageReferencePeer imagePeer = (ImageReferencePeer) propertyPeer ;
        fiElement.setAttribute("u", imagePeer.getImageUrl(context, imageReference));
        Extent offsetX = fillImage.getHorizontalOffset();
        if (offsetX != null) {
            fiElement.setAttribute("x", ExtentPeer.toString(offsetX));
        }
        Extent offsetY = fillImage.getVerticalOffset();
        if (offsetY != null) {
            fiElement.setAttribute("y", ExtentPeer.toString(offsetY));
        }
        fiElement.setAttribute("r", REPEAT_CONSTANTS.get(fillImage.getRepeat()));
        return fiElement;
    }
    
    /**
     * Generates a <code>FillImage</code> based on a <code>&lt;fi&gt;</code> DOM element.
     * This method is used internally and for <code>FillImageBorder</code> serialization.
     * 
     * @param context a <code>Context</code> object which provides a 
     *        <code>SerialContext</code> and <code>PropertyPeerFactory</code>
     * @param fiElement the <code>&lt;fi&gt;</code> element to parse
     * @return a <code>FillImage</code> representation of the element
     * @throws SerialException
     */
    public FillImage fromElement(Context context, Element fiElement) 
    throws SerialException {
        String imageType = fiElement.getAttribute("t");
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        SerialPropertyPeer imagePropertyPeer = null;
        if ("r".equals(imageType)) {
            imagePropertyPeer = propertyPeerFactory.getPeerForProperty(ResourceImageReference.class);
        } else if ("h".equals(imageType)) {
            imagePropertyPeer = propertyPeerFactory.getPeerForProperty(HttpImageReference.class);
        } else if (imageType != null) {
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            try {
                imagePropertyPeer = propertyPeerFactory.getPeerForProperty(serialContext.getClassLoader().loadClass(imageType));
            } catch (ClassNotFoundException ex) {
                throw new SerialException("Object class not found.", ex);  
            }
        } else {
            throw new RuntimeException("No image type specified");
        }
        if (imagePropertyPeer == null) {
            throw new RuntimeException("Unknown image type: " + imageType);
        }
        ImageReference imageReference = (ImageReference) imagePropertyPeer.toProperty(context, FillImage.class, fiElement);
        int repeat = REPEAT_CONSTANTS.get(fiElement.getAttribute("r"), FillImage.REPEAT);
        Extent x = fiElement.hasAttribute("x") ? ExtentPeer.fromString(fiElement.getAttribute("x") ) : null;
        Extent y = fiElement.hasAttribute("y") ? ExtentPeer.fromString(fiElement.getAttribute("y") ) : null;
        return new FillImage(imageReference, x, y, repeat);
    }
    
    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        Element fiElement = DomUtil.getChildElementByTagName(propertyElement, "fi");
        return fromElement(context, fiElement);
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        FillImage fillImage = (FillImage) propertyValue;
        propertyElement.setAttribute("t", 
                (serialContext.getFlags() & SerialContext.FLAG_RENDER_SHORT_NAMES) == 0 ? "FillImage" : "FI");
        propertyElement.appendChild(toElement(context, fillImage));
    }
}
