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

package nextapp.echo.app.serial.property;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import nextapp.echo.app.Color;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>XmlPropertyPeer</code> for <code>FillImageBorder</code> properties.
 */
public class FillImageBorderPeer
implements SerialPropertyPeer {

    public Object toProperty(Context context, Class objectClass, Element propertyElement) throws SerialException {
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        FillImagePeer fillImagePeer = (FillImagePeer) propertyPeerFactory.getPeerForProperty(FillImage.class);

        Element fibElement = DomUtil.getChildElementByTagName(propertyElement, "fib");
        
        Color borderColor = fibElement.hasAttribute("bc") ? ColorPeer.fromString(fibElement.getAttribute("bc")) : null;
        Insets borderInsets = fibElement.hasAttribute("bi") ? InsetsPeer.fromString(fibElement.getAttribute("bi")) : null;
        Insets contentInsets = fibElement.hasAttribute("ci") ? InsetsPeer.fromString(fibElement.getAttribute("ci")) : null;
        FillImageBorder border = new FillImageBorder(borderColor, borderInsets, contentInsets);
        
        int fiCount = 0;
        NodeList fibChildNodes = fibElement.getChildNodes();
        for (int i = 0; i < fibChildNodes.getLength() && fiCount < 8; ++i) {
            Node fiNode = fibChildNodes.item(i);
            if ("fi".equals(fiNode.getNodeName())) {
                border.setFillImage(fiCount, fillImagePeer.parseFillImageElement(context, (Element)fiNode));
                fiCount++;
            } else if ("null-fi".equals(fiNode.getNodeName())) {
                fiCount++;
            }
        }
        if (fiCount != 8) {
            throw new SerialException("Invalid FillImageBorder image count: " + fiCount, null);
        }
        return border;
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        FillImageBorder border = (FillImageBorder) propertyValue;
        propertyElement.setAttribute("t", 
                (serialContext.getFlags() & SerialContext.FLAG_RENDER_SHORT_NAMES) == 0 ? "FillImageBorder" : "FIB");
        
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        FillImagePeer fillImagePeer = (FillImagePeer) propertyPeerFactory.getPeerForProperty(FillImage.class);
        
        Element fibElement = serialContext.getDocument().createElement("fib");
        
        if (border.getBorderInsets() != null) {
            fibElement.setAttribute("bi", InsetsPeer.toString(border.getBorderInsets()));
        }
        if (border.getContentInsets() != null) {
            fibElement.setAttribute("ci", InsetsPeer.toString(border.getContentInsets()));
        }
        if (border.getColor() != null) {
            fibElement.setAttribute("bc", ColorPeer.toString(border.getColor()));
        }
        
        for (int i = 0; i < 8; ++i) {
            FillImage fillImage = border.getFillImage(i);
            if (fillImage == null) {
                fibElement.appendChild(serialContext.getDocument().createElement("null-fi"));
            } else {
                fibElement.appendChild(fillImagePeer.createFillImageElement(context, fillImage));
            }
        }
        
        propertyElement.appendChild(fibElement);
    }
}