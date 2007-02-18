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
     * Returns event handler names for a given event set.
     * 
     * @param eventSetName the name of the event set, e.g., 
     *        'nextapp.echo2.app.event.Action' for <code>ActionEvent</code>s
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
     * @return the <code>EventSetDescriptor</code> associated with the event
     *         set
     */
    public EventSetDescriptor getEventSetDescriptor(String eventSetName) {
        return (EventSetDescriptor) eventSetDescriptorMap.get(eventSetName);
    }
    
    /**
     * Returns an <code>Iterator</code> over the event set names of the 
     * object.
     * 
     * @return an <code>Iterator</code> over the event set names of the 
     *         object
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
     * Returns an <code>Iterator</code> over the property names of the
     * object.
     * 
     * @return an <code>Iterator</code> over the property names of the
     *         object
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
                if (propertyDescriptors[index].getWriteMethod() != null) {
                    String name = propertyDescriptors[index].getName();
                    
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
