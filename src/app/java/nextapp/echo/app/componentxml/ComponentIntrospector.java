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

package nextapp.echo.app.componentxml;

import java.beans.BeanInfo;
import java.beans.IndexedPropertyDescriptor;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Provides introspection into Echo components.
 * 
 * A wrapper for JavaBean APIs to preform introspection on 
 * Echo Components.  Provides convenience methods to retrieve
 * available property names, types, and other bean-related
 * information.  
 */
public class ComponentIntrospector {

    /**
     * Modifier requirements for style constant name fields.
     */
    private static final int CONSTANT_MODIFERS = Modifier.STATIC | Modifier.PUBLIC | Modifier.FINAL;
    
    /**
     * A map containing references from <code>ClassLoader</code> to 
     * <code>ComponentIntrospector</code> caches.
     */
    private static final Map classLoaderCache = new HashMap();
    
    /**
     * Creates a new <code>ComponentIntrospector</code> for a type of
     * Echo component.
     * 
     * @param typeName the type name of Echo component
     * @param classLoader the class loader from which the type class
     *        may be retrieved
     */
    public static ComponentIntrospector forName(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        // Find or Create Component Introspector Store based on ClassLoader Cache.
        Map ciStore;
        synchronized (classLoaderCache) {
            ciStore = (Map) classLoaderCache.get(classLoader);
            if (ciStore == null) {
                ciStore = new HashMap();
                classLoaderCache.put(classLoader, ciStore);
            }
        }
        
        // Find or Create Component Introspector from Component Introspector Store.
        ComponentIntrospector ci;
        synchronized (ciStore) {
            ci =  (ComponentIntrospector) ciStore.get(typeName);
            if (ci == null) {
                ci = new ComponentIntrospector(typeName, classLoader);
                ciStore.put(typeName, ci);
            }
        }
        return ci;
    }
    
    
    private Class componentClass;
    private BeanInfo beanInfo;
    private Map constants;
    
    /**
     * A mapping between the component's property names and JavaBean 
     * <code>PropertyDescriptor</code>s.
     */
    private Map propertyDescriptorMap = new HashMap();
    
    /**
     * Creates a new <code>ComponentIntrospector</code> for the specified
     * type.
     * 
     * @param typeName the component type name
     */
    private ComponentIntrospector(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        super();
        componentClass = Class.forName(typeName, true, classLoader);
        try {
            beanInfo = Introspector.getBeanInfo(componentClass, Introspector.IGNORE_ALL_BEANINFO);
        } catch (IntrospectionException ex) {
            // Should not occur.
            throw new RuntimeException("Introspection Error", ex);
        }

        loadConstants();
        loadPropertyData();
    }

    /**
     * Retrieves the names of all constants.
     * A constant is defined to be any public static final variable
     * declared in the introspected class.
     * 
     * @return an iterator over the constant names
     */
    public Iterator getConstantNames() {
        return constants.keySet().iterator();
    }
    
    /**
     * Retrieves the value of the constant with the specified name.
     * 
     * @param constantName the name of the constant (unqualified)
     * @return the constant value, or null if no such constant exists
     * @see #getConstantNames()
     */
    public Object getConstantValue(String constantName) {
        return constants.get(constantName);
    }
    
    /**
     * Returns the class being introspected.
     * 
     * @return the introspected class
     */
    public Class getObjectClass() {
        return componentClass;
    }
    
    /**
     * Returns the <code>Class</code> of a specific property.
     * 
     * @param propertyName the name of the property
     * @return the <code>Class</code> of the property
     */
    public Class getPropertyClass(String propertyName) {
        PropertyDescriptor propertyDescriptor = getPropertyDescriptor(propertyName);
        if (propertyDescriptor == null) {
            return null;
        } else if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
            return ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedPropertyType();
        } else {
            return propertyDescriptor.getPropertyType();
        }        
    }
    
    /**
     * Returns the <code>PropertyDescriptor</code> for the specified property.
     * 
     * @param propertyName the name of the property
     * @return the <code>PropertyDescriptor</code> associated with the property
     */
    public PropertyDescriptor getPropertyDescriptor(String propertyName) {
        return (PropertyDescriptor) propertyDescriptorMap.get(propertyName);
    }

    /**
     * Returns a write (setter) method for a specific property.
     * 
     * @param propertyName the name of the property
     * @return the write method (if available)
     */
    public Method getWriteMethod(String propertyName) {
        PropertyDescriptor propertyDescriptor = getPropertyDescriptor(propertyName);
        if (propertyDescriptor == null) {
            return null;
        } else {
            if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
                return ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedWriteMethod();
            } else {
                return propertyDescriptor.getWriteMethod();
            }
        }
    }
    
    /**
     * Determines whether a property is an indexed property.
     * 
     * @param propertyName the name of the property to query
     * @return true if the specified property is indexed
     */
    public boolean isIndexedProperty(String propertyName) {
        return propertyDescriptorMap.get(propertyName) instanceof IndexedPropertyDescriptor;
    }

    /**
     * Initialization method to load data related to style constants.
     */
    private void loadConstants() {
        constants = new HashMap();
        Field[] fields = componentClass.getFields();
        for (int index = 0; index < fields.length; ++index) {
            if ((fields[index].getModifiers() & CONSTANT_MODIFERS) != 0) {
                String constantName = fields[index].getName();
                try {
                    Object constantValue = fields[index].get(null);         
                    constants.put(constantName, constantValue);
                } catch (IllegalAccessException ex) {
                    // Should not occur.
                }
            }
        }         
    }
    
    /**
     * Initialization method to load property information.
     */
    private void loadPropertyData() {
        PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
        for (int index = 0; index < propertyDescriptors.length; ++index) {
            // Limit to mutable properties only.
            
            if (propertyDescriptors[index] instanceof IndexedPropertyDescriptor) {
                if (((IndexedPropertyDescriptor) propertyDescriptors[index]).getIndexedWriteMethod() != null) {
                    String name = propertyDescriptors[index].getName();
                    
                    // Store JavaBean PropertyDescriptor.
                    propertyDescriptorMap.put(name, propertyDescriptors[index]);
                }
            } else {
                if (propertyDescriptors[index].getWriteMethod() != null) {
                    String name = propertyDescriptors[index].getName();
                    
                    // Store JavaBean PropertyDescriptor.
                    propertyDescriptorMap.put(name, propertyDescriptors[index]);
                }
            }
        }
    }
}
