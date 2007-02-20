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

package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Border;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

/**
 * <code>PropertySynchronizationPeer</code> implementation for <code>Color</code>s.
 */
public class BorderPeer 
implements PropertySynchronizePeer {

    private static final String[] borderSideAttributeNames = new String[]{"t", "r", "b", "l"};
    
    public static final String toString(Border border) {
        return toString(border.getSides()[0]);
    }
    
    public static final String toString(Border.Side side) {
        StringBuffer out = new StringBuffer();
        out.append(ExtentPeer.toString(side.getSize()));
        out.append(" ");
        switch (side.getStyle()) {
        case Border.STYLE_NONE:   out.append("none");   break;
        case Border.STYLE_SOLID:  out.append("solid");  break;
        case Border.STYLE_INSET:  out.append("inset");  break;
        case Border.STYLE_OUTSET: out.append("outset"); break;
        case Border.STYLE_GROOVE: out.append("groove"); break;
        case Border.STYLE_RIDGE:  out.append("ridge");  break;
        case Border.STYLE_DOTTED: out.append("dotted"); break;
        case Border.STYLE_DASHED: out.append("dashed"); break;
        case Border.STYLE_DOUBLE: out.append("double"); break;
        }
        out.append(" ");
        out.append(ColorPeer.toString(side.getColor()));
        return out.toString();
    }
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(XmlContext, Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) {
        //TODO implement
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Border");
        Border border = (Border) propertyValue;
        if (border.isMultisided()) {
            Element borderElement = context.getDocument().createElement("b");
            Border.Side[] sides = border.getSides();
            for (int i = 0; i < sides.length; ++i) {
                borderElement.setAttribute(borderSideAttributeNames[i], toString(sides[i]));
            }
            propertyElement.appendChild(borderElement);
        } else {
            propertyElement.setAttribute("v", toString(border));
        }
    }
}
