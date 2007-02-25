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

package nextapp.echo.app.serial;

import org.w3c.dom.Element;
import nextapp.echo.app.util.Context;

/**
 * Serialization utilities.
 */
public class SerialUtil {
    
    /**
     * Translates an arbitrary property to XML.
     * The appropriate peer for the property will be retrieved and the property will be 
     * handed to it for processing.  An XML representation of the property will be added
     * as a child to the specified <code>parentElement</code>.
     * 
     * @param context the relevant <code>Context</code> (must provide a <code>SerialContext</code>
     *        and a <code>PropertyPeerFactory</code>)
     * @param objectClass the class on which the property is set.
     * @param parentElement the XML element to which the property value's XML 
     *        representation will be added as a child
     * @param propertyName the name of the property
     * @param propertyValue the value of the property
     */
    public static void toXml(Context context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) 
    throws SerialException {
        if (propertyValue != null) {
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            Element childPropertyElement = serialContext.getDocument().createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            
            PropertyPeerFactory peerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
            
            peerFactory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}
