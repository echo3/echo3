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

package nextapp.echo.app.reflect;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

/**
 * Extends <code>ObjectIntrospector</code> to proivde
 * <code>nextapp.echo.app.Component</code>-specific functionality,
 * i.e., introspection of style constants names.
 */
public class ComponentIntrospector extends ObjectIntrospector {

    /**
     * A mapping between the component's property names and their
     * style constants.
     */
    private Map styleConstantNames = new HashMap();
    
    /**
     * Creates a new <code>ComponentIntrospector</code> for the specified
     * type.
     * 
     * @param typeName the component type name
     */
    protected ComponentIntrospector(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        super(typeName, classLoader);
        loadStyleConstantData();
    }
    
    /**
     * Returns the name of the style constant for the given 
     * property name.
     * 
     * @param propertyName The name of the property.
     * @return the style constant name, or null if no style constant
     *         exists
     */
    public String getStyleConstantName(String propertyName) {
        return (String) styleConstantNames.get(propertyName);
    }
    
    /**
     * Initialization method to load data related to style constants.
     */
    private void loadStyleConstantData() {
        Field[] fields = getObjectClass().getFields();
        for (int index = 0; index < fields.length; ++index) {
            if (fields[index].getType() == String.class 
                    && (fields[index].getModifiers() & PUBLIC_CONSTANT_MODIFERS) != 0
                    && fields[index].getName().startsWith("PROPERTY_")) {
                String styleConstant = fields[index].getName();
                try {
                    String propertyName = (String) fields[index].get(null);         
                    styleConstantNames.put(propertyName, styleConstant);
                } catch (IllegalAccessException ex) {
                    // Should not occur.
                }
            }
        }
    }
}
