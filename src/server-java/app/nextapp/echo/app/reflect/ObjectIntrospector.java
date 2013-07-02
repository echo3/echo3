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

package nextapp.echo.app.reflect;

import java.beans.BeanInfo;
import java.beans.EventSetDescriptor;
import java.beans.IndexedPropertyDescriptor;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.MethodDescriptor;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.TreeSet;

import nextapp.echo.app.LayoutData;

/**
 * Provides introspection/reflection capabilities for components, properties, 
 * and layout data objects.  Wraps Java beans and reflection APIs.
 */
public class ObjectIntrospector {

    /**
     * Modifier requirements for style constant name fields.
     */
    public static final int PUBLIC_CONSTANT_MODIFERS = Modifier.STATIC | Modifier.PUBLIC | Modifier.FINAL;
    
    /**
     * A <code>java.beans.BeanInfo</code> object used to introspect
     * information about the target <code>Object</code>.
     */
    private BeanInfo beanInfo;

    /**
     * A mapping between the object's event set names and JavaBean
     * <code>EventSetDescriptor</code>s.
     */
    private Map eventSetDescriptorMap = new HashMap();
    
    /**
     * The <code>Class</code> of the analyzed introspected 
     * <code>Object</code>.
     */
    private Class objectClass;
    
    /**
     * Mapping between public static final constants and their values.
     */
    private Map constants;

    /**
     * A mapping between the object's property names and JavaBean 
     * <code>PropertyDescriptor</code>s.
     */
    private SortedMap propertyDescriptorMap = new TreeMap();
    
    /**
     * Creates a new <code>ObjectIntrospector</code> for the specified
     * type.
     * 
     * @param typeName the object type name
     * @param classLoader the <code>ClassLoader</code> to use for introspection
     */
    protected ObjectIntrospector(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        super();
        objectClass = Class.forName(typeName, true, classLoader);
        try {
            beanInfo = Introspector.getBeanInfo(objectClass, Introspector.IGNORE_ALL_BEANINFO);
        } catch (IntrospectionException ex) {
            // Should not occur.
            throw new RuntimeException("Introspection Error", ex);
        }
        
        loadBeanPropertyData();
        loadEventData();
        loadConstants();
    }
    
    /**
     * Returns the constant names of the object.
     * 
     * @return a <code>Set</code> containing the constant names of the object
     */
    public Set getConstantNames() {
        return Collections.unmodifiableSet(constants.keySet());
    }
    
    /**
     * Retrieves the value of the constant with the specified name.
     * 
     * @param constantName the name of the constant (unqualified)
     * @return the constant value, or null if no such constant exists
     */
    public Object getConstantValue(String constantName) {
        return constants.get(constantName);
    }

    /**
     * Returns event handler names for a given event set.
     * 
     * @param eventSetName the name of the event set, e.g., 
     *        'nextapp.echo.app.event.Action' for <code>ActionEvent</code>s
     * @return a <code>Set</code> containing the names of event listener 
     *         methods
     */
    public Set getEventHandlerNames(String eventSetName) {
        EventSetDescriptor eventSetDescriptor = getEventSetDescriptor(eventSetName);
        if (eventSetDescriptor == null) {
            return Collections.EMPTY_SET;
        } else {
            MethodDescriptor[] methodDescriptors = eventSetDescriptor.getListenerMethodDescriptors();
            Set eventHandlerNames = new TreeSet(); 
            for (int index = 0; index < methodDescriptors.length; ++index) {
                eventHandlerNames.add(methodDescriptors[index].getName());
            }
            return Collections.unmodifiableSet(eventHandlerNames);
        }
    }
    
    /**
     * Returns the <code>EventSetDescriptor</code> for the specified event set.
     * 
     * @param eventSetName The name of the event set.
     * @return the <code>EventSetDescriptor</code> associated with the event set
     */
    public EventSetDescriptor getEventSetDescriptor(String eventSetName) {
        return (EventSetDescriptor) eventSetDescriptorMap.get(eventSetName);
    }
    
    /**
     * Returns the event set names of the object.
     * 
     * @return a <code>Set</code> containing the event set names of the object
     */
    public Set getEventSetNames() {
        return Collections.unmodifiableSet(eventSetDescriptorMap.keySet());
    }
    
    /**
     * Returns the <code>Class</code> of the object being introspected.
     * 
     * @return the object <code>Class</code>
     */
    public Class getObjectClass() {
        return objectClass;
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
            throw new IllegalArgumentException("Invalid property name: " + propertyName);
        }
        if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
            return ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedPropertyType();
        } else {
            return propertyDescriptor.getPropertyType();
        }
    }
    
    /**
     * Returns the number of mutable properties provided by the introspected
     * <code>Object</code>.
     * 
     * @return the number of mutable properties
     */
    public int getPropertyCount() {
        return propertyDescriptorMap.size();
    }
    
    /**
     * Returns the name of the type that defines the specified property.
     * 
     * @param propertyName the name of the property
     * @return the defining class
     */
    public String getPropertyDefinitionConcreteType(String propertyName) {
        PropertyDescriptor propertyDescriptor = getPropertyDescriptor(propertyName);
        if (propertyDescriptor == null) {
            return null;
        } else {
            Method readMethod;
            if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
                readMethod = ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedReadMethod();
            } else {
                readMethod = propertyDescriptor.getReadMethod();
            }
            if (readMethod == null) {
                return null;
            } else {
                Class definitionClass = readMethod.getDeclaringClass();
                while ((definitionClass.getModifiers() & Modifier.ABSTRACT) != 0) {
                    definitionClass = definitionClass.getSuperclass();
                }
                return definitionClass.getName();
            }
        }
    }
    
    /**
     * Returns the name of the type that defines the specified property.
     * 
     * @param propertyName the name of the property
     * @return the defining class
     */
    public String getPropertyDefinitionType(String propertyName) {
        PropertyDescriptor propertyDescriptor = getPropertyDescriptor(propertyName);
        if (propertyDescriptor == null) {
            return null;
        } else {
            Method readMethod;
            if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
                readMethod = ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedReadMethod();
            } else {
                readMethod = propertyDescriptor.getReadMethod();
            }
            if (readMethod == null) {
                return null;
            } else {
                return readMethod.getDeclaringClass().getName();
            }
        }
    }
    
    /**
     * Returns the <code>PropertyDescriptor</code> for the specified property.
     * 
     * @param propertyName The name of the property.
     * @return the <code>PropertyDescriptor</code> associated with the property
     */
    public PropertyDescriptor getPropertyDescriptor(String propertyName) {
        return (PropertyDescriptor) propertyDescriptorMap.get(propertyName);
    }
    
    /**
     * Returns an <code>Iterator</code> over the property names of the object.
     * 
     * @return an <code>Iterator</code> over the property names of the object
     */
    public Iterator getPropertyNames() {
        return propertyDescriptorMap.keySet().iterator();
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
        Field[] fields = objectClass.getFields();
        for (int index = 0; index < fields.length; ++index) {
            if ((fields[index].getModifiers() & PUBLIC_CONSTANT_MODIFERS) != 0) {
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
    private void loadBeanPropertyData() {
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
                String name = propertyDescriptors[index].getName();
                //WORK_AROUND:
                //write method is null when returning a non-null value due to a bug
                //in JDK7 (http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=7172865) 
                //so this messes up with the Fluent Interface used in conjunction with LayoutData
                //so we set the write methods manually in case they are not there
                if (propertyDescriptors[index].getWriteMethod() == null && LayoutData.class.isAssignableFrom(objectClass)) {
                    String methodName = "set" + name.substring(0,  1).toUpperCase() + name.substring(1);
                    try {
                        Method writeMethod = objectClass.getMethod(methodName, propertyDescriptors[index].getPropertyType());
                        propertyDescriptors[index].setWriteMethod(writeMethod);
                    } catch (NoSuchMethodException e) {
                        //ignore if no setter provided
                    } catch (SecurityException e) {
                        //should never happen...
                    } catch (IntrospectionException e) {
                        //should never happen...
                    }
                }
                if (propertyDescriptors[index].getWriteMethod() != null) {
                    // Store JavaBean PropertyDescriptor.
                    propertyDescriptorMap.put(name, propertyDescriptors[index]);
                }
            }
        }
    }
    
    /**
     * Initialization method to load event related information.
     */
    private void loadEventData() {
        EventSetDescriptor[] eventSetDescriptors = beanInfo.getEventSetDescriptors();
        for (int index = 0; index < eventSetDescriptors.length; ++index) {
            eventSetDescriptorMap.put(eventSetDescriptors[index].getName(), eventSetDescriptors[index]);
        }
    }
    
    /**
     * Sets a property on an object instance.
     * 
     * @param object the object to modify
     * @param propertyName the property name to be set
     * @param propertyValue the new property value
     */
    public void setProperty(Object object, String propertyName, int index, Object propertyValue)
    throws IllegalArgumentException, IllegalAccessException, InvocationTargetException {
        PropertyDescriptor propertyDescriptor = getPropertyDescriptor(propertyName);
        if (propertyDescriptor instanceof IndexedPropertyDescriptor) {
            Method writeMethod = ((IndexedPropertyDescriptor) propertyDescriptor).getIndexedWriteMethod();
            writeMethod.invoke(object, new Object[]{new Integer(index), propertyValue});
        } else {
            Method writeMethod = propertyDescriptor.getWriteMethod();
            writeMethod.invoke(object, new Object[]{propertyValue});
        }
    }

}
