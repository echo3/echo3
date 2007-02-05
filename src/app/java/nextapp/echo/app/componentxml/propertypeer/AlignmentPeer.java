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

import nextapp.echo.app.Alignment;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.Alignment</code> properties.
 */
public class AlignmentPeer 
implements PropertyXmlPeer {
    
    private static final Map HORIZONTAL_CONSTANTS;
    static {
        Map constantMap = new HashMap();
        constantMap.put("leading", new Integer(Alignment.LEADING));
        constantMap.put("trailing", new Integer(Alignment.TRAILING));
        constantMap.put("left", new Integer(Alignment.LEFT));
        constantMap.put("center", new Integer(Alignment.CENTER));
        constantMap.put("right", new Integer(Alignment.RIGHT));
        HORIZONTAL_CONSTANTS = Collections.unmodifiableMap(constantMap);
    }
    
    private static final Map VERTICAL_CONSTANTS;
    static {
        Map constantMap = new HashMap();
        constantMap.put("top", new Integer(Alignment.TOP));
        constantMap.put("center", new Integer(Alignment.CENTER));
        constantMap.put("bottom", new Integer(Alignment.BOTTOM));
        VERTICAL_CONSTANTS = Collections.unmodifiableMap(constantMap);
    }

    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        Element alignmentElement = DomUtil.getChildElementByTagName(propertyElement, "alignment");
        int horizontal = Alignment.DEFAULT;
        int vertical = Alignment.DEFAULT;
        if (alignmentElement.hasAttribute("horizontal")) {
            Integer horizontalValue = (Integer) HORIZONTAL_CONSTANTS.get(alignmentElement.getAttribute("horizontal"));
            if (horizontalValue != null) {
                horizontal = horizontalValue.intValue();
            }
        }
        if (alignmentElement.hasAttribute("vertical")) {
            Integer verticalValue = (Integer) VERTICAL_CONSTANTS.get(alignmentElement.getAttribute("vertical"));
            if (verticalValue != null) {
                vertical = verticalValue.intValue();
            }
        }
        return new Alignment(horizontal, vertical);
    }
}
