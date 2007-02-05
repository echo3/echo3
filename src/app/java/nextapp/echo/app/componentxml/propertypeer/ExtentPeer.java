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

import nextapp.echo.app.Extent;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyXmlPeer;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.Extent</code> properties.
 */
public class ExtentPeer 
implements PropertyXmlPeer {
    
    private static final Map UNITS_TEXT_TO_CONSTANT;
    static {
        Map constantMap = new HashMap();
        constantMap.put("cm", new Integer(Extent.CM));
        constantMap.put("em", new Integer(Extent.EM));
        constantMap.put("ex", new Integer(Extent.EX));
        constantMap.put("in", new Integer(Extent.IN));
        constantMap.put("mm", new Integer(Extent.MM));
        constantMap.put("pc", new Integer(Extent.PC));
        constantMap.put("pt", new Integer(Extent.PT));
        constantMap.put("px", new Integer(Extent.PX));
        constantMap.put("%", new Integer(Extent.PERCENT));
        UNITS_TEXT_TO_CONSTANT = Collections.unmodifiableMap(constantMap);
    }
    
    /**
     * Converts the given string value to an <code>Extent</code> equivalent.
     * 
     * @param value a string representation of an <code>Extent</code>
     * @return the <code>Extent</code>
     * @throws IllegalArgumentException if the string is improperly formatted.
     */
    public static Extent toExtent(String value) {
        int suffixIndex = -1;
        for (int i = 0; i < value.length(); ++i) {
            char ch = value.charAt(i);
            if (!((i == 0 && ch == '-') || Character.isDigit(ch))) {
                // Not a digit (nor a minus at first position)
                suffixIndex = i;
                break;
            }
        }
        if (suffixIndex < 1) {
            throw new IllegalArgumentException("Invalid Extent value: " + value);
        }
        
        int size = Integer.parseInt(value.substring(0, suffixIndex));
        String unitsText = value.substring(suffixIndex);
        
        if (!UNITS_TEXT_TO_CONSTANT.containsKey(unitsText)) {
            throw new IllegalArgumentException("Invalid Extent units: " + value);
        }
        int units = ((Integer) UNITS_TEXT_TO_CONSTANT.get(unitsText)).intValue();
        
        return new Extent(size, units);
    }

    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        return(toExtent(propertyElement.getAttribute("value")));
    }
}
