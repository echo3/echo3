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

package nextapp.echo.app.util;

import java.util.HashMap;
import java.util.Map;

/**
 * Mapping between constant names and integer constant values and vice-versa
 * (values can be queried by name, and names queried by value).
 */
public class ConstantMap {
    
    /**
     * Storage (only one map required, keys have different types).
     */
    private Map dualMap = new HashMap();
    
    /**
     * Adds a constant to the map
     * 
     * @param constantValue the value of the constant
     * @param constantName the name of the constant
     */
    public void add(int constantValue, String constantName) {
        Integer constantInteger = new Integer(constantValue);
        dualMap.put(constantName, constantInteger);
        dualMap.put(constantInteger, constantName);
    }
    
    /**
     * Returns a constant name for a given constant value, if available.
     * 
     * @param constantValue the constant value
     * @return the constant name
     */
    public String get(int constantValue) {
        return (String) dualMap.get(new Integer(constantValue));
    }
    
    /**
     * Returns a constant value for a given constant name, if available.
     * 
     * @param constantName the constant name
     * @param defaultValue the default value to return if a value is not found
     * @return the constant value
     */
    public int get(String constantName, int defaultValue) {
        Integer constantValue = (Integer) dualMap.get(constantName);
        return constantValue == null ? defaultValue : constantValue.intValue();
    }
}
