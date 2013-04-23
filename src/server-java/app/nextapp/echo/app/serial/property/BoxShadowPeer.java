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

import nextapp.echo.app.BoxShadow;
import nextapp.echo.app.BoxShadow.BoxStyle;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * <code>SerialPropertyPeer</code> for <code>BoxShadow</code> properties.
 * 
 * @author sieskei (XSoft Ltd.)
 */
public class BoxShadowPeer implements SerialPropertyPeer {

	/**
	 * Creates a <code>Node</code> representation of the box shadow state suitable for appending to a property element.
	 * 
	 * @param context
	 *            the relevant <code>Context</code>
	 * @param boxShadow
	 *            the box shadow to render
	 * @return the created <code>Element</code> node
	 */
	public static final Node toNode(Context context, BoxShadow boxShadow) throws SerialException {
		SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
		Element boxElement = serialContext.getDocument().createElement("box");
		boxElement.setAttribute("h", ExtentPeer.toString(boxShadow.getHorizontalShadowPosition()));
		boxElement.setAttribute("v", ExtentPeer.toString(boxShadow.getVerticalShadowPosition()));
		boxElement.setAttribute("b", ExtentPeer.toString(boxShadow.getBlurDistance()));
		boxElement.setAttribute("s", ExtentPeer.toString(boxShadow.getSpreadSize()));
		boxElement.setAttribute("c", ColorPeer.toString(boxShadow.getColor()));
		boxElement.setAttribute("i", boxShadow.getStyle().name());
		return boxElement;
	}

	public Object toProperty(Context context, Class objectClass, Element propertyElement) throws SerialException {
		Element boxElement = DomUtil.getChildElementByTagName(propertyElement, "box");
		final Extent hShadow = ExtentPeer.fromString(boxElement.getAttribute("h"));
		final Extent vShadow = ExtentPeer.fromString(boxElement.getAttribute("v"));
		final Extent blurDistance = ExtentPeer.fromString(boxElement.getAttribute("b"));
		final Extent spreadSize = ExtentPeer.fromString(boxElement.getAttribute("s"));
		final Color color = ColorPeer.fromString(boxElement.getAttribute("v"));
		final BoxStyle style = BoxStyle.valueOf(boxElement.getAttribute("i"));
		return new BoxShadow(hShadow, vShadow, blurDistance, spreadSize, color, style);
	}

	public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) throws SerialException {
		propertyElement.setAttribute("t", "BoxShadow");
		BoxShadow boxShadow = (BoxShadow) propertyValue;
		propertyElement.appendChild(toNode(context, boxShadow));
	}
}
