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

package nextapp.echo.app;

import java.util.Iterator;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * A <code>Style</code> implementation which may be modified.
 * Note that modifications to the <code>Style</code> will not necessarily be
 * reflected in <code>Component</code>s that use the <code>Style</code>
 * unless the <code>Component</code>s are specifically informed of the changes,
 * i.e., by resetting the shared style of a <code>Component</code>.
 * As such, shared <code>Style</code>s  should not be updated once they are 
 * in use by <code>Component</code>s, as it will result in undefined behavior.
 */
public class MutableStyle 
implements Style {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private static final int GROW_RATE = 5 * 2;  // Must be a multiple of 2.
    
    private static final Object[] EMPTY = new Object[0];
    
    /**
     * An <code>Iterator</code> which returns the names of properties which
     * are set in the style.
     */
    private class PropertyNameIterator 
    implements Iterator {

        private int index = 0;
        
        /**
         * @see java.util.Iterator#hasNext()
         */
        public boolean hasNext() {
            return index < length;
        }
        
        /**
         * @see java.util.Iterator#next()
         */
        public Object next() {
            Object value = data[index];
            index += 2;
            return value;
        }

        /**
         * @see java.util.Iterator#remove()
         */
        public void remove() {
            throw new UnsupportedOperationException();
        }
    }
    
    /**
     * A value object which stores the indexed values of a property. 
     */
    public class IndexedPropertyValue {

        private SortedMap indicesToValues;
        
        /**
         * Returns the value at the specified index.
         * 
         * @param index the index
         * @return the value
         */
        public Object getValue(int index) {
            if (indicesToValues == null) {
                return null;
            } else {
                return indicesToValues.get(new Integer(index));
            }
        }
        
        /**
         * Returns the set property indices as an 
         * <code>Integer</code>-returning <code>Iterator</code>.
         * 
         * @return an iterator over the indices
         */
        public Iterator getIndices() {
            return indicesToValues.keySet().iterator();
        }
        
        /**
         * Determines if a value is set at the specified index.
         * 
         * @param index the index
         * @return true if a value is set
         */
        public boolean hasValue(int index) {
            return indicesToValues != null && indicesToValues.containsKey(new Integer(index));
        }
        
        /**
         * Removes the value at the specified index.
         * 
         * @param index the index
         */
        private void removeValue(int index) {
            if (indicesToValues != null) {
                indicesToValues.remove(new Integer(index));
                if (indicesToValues.size() == 0) {
                    indicesToValues = null;
                }
            }
        }
        
        /**
         * Sets the value at the specified index.
         * 
         * @param index the index
         * @param value the new property value
         */
        private void setValue(int index, Object value) {
            if (indicesToValues == null) {
                indicesToValues = new TreeMap();
            } 
            indicesToValues.put(new Integer(index), value);
        }
    }
    
    private Object[] data = EMPTY;
    int length = 0; // Number of items * 2;

    /**
     * Default constructor.
     */
    public MutableStyle() {
        super();
    }
    
    /**
     * Adds the content of the specified style to this style.
     * 
     * @param style the style to add
     */
    public void addStyleContent(Style style) {
        Iterator nameIt = style.getPropertyNames();
        while (nameIt.hasNext()) {
            String name = (String) nameIt.next();
            Object value = style.getProperty(name);
            if (value instanceof IndexedPropertyValue) {
                IndexedPropertyValue indexedPropertyValue = (IndexedPropertyValue) value;
                Iterator indexIt = indexedPropertyValue.getIndices();
                while (indexIt.hasNext()) {
                    int index = ((Integer) indexIt.next()).intValue();
                    setIndexedProperty(name, index, indexedPropertyValue.getValue(index));
                }
            } else {
                setProperty(name, value);
            }
        }
    }
    
    /**
     * @see nextapp.echo.app.Style#getIndexedProperty(java.lang.String, int)
     */
    public Object getIndexedProperty(String propertyName, int propertyIndex) {
        Object value = retrieveProperty(propertyName);
        if (!(value instanceof IndexedPropertyValue)) {
            return null;
        }
        return ((IndexedPropertyValue) value).getValue(propertyIndex);
    }
    
    /**
     * @see nextapp.echo.app.Style#getProperty(java.lang.String)
     */
    public Object getProperty(String propertyName) {
        return retrieveProperty(propertyName);
    }
    
    /**
     * @see nextapp.echo.app.Style#getPropertyIndices(java.lang.String)
     */
    public Iterator getPropertyIndices(String propertyName) {
        Object value = getProperty(propertyName);
        if (!(value instanceof IndexedPropertyValue)) {
            return null;
        }
        return ((IndexedPropertyValue) value).getIndices();
    }
    
    /**
     * @see nextapp.echo.app.Style#getPropertyNames()
     */
    public Iterator getPropertyNames() {
        return new PropertyNameIterator();
    }
    
    /**
     * @see nextapp.echo.app.Style#isIndexedPropertySet(java.lang.String, int)
     */
    public boolean isIndexedPropertySet(String propertyName, int index) {
        Object value = retrieveProperty(propertyName);
        if (!(value instanceof IndexedPropertyValue)) {
            return false;
        }
        return ((IndexedPropertyValue) value).hasValue(index);
    }
    
    /**
     * @see nextapp.echo.app.Style#isPropertySet(java.lang.String)
     */
    public boolean isPropertySet(String propertyName) {
        int propertyNameHashCode = propertyName.hashCode();
        for (int i = 0; i < length; i += 2) {
            if (propertyNameHashCode == data[i].hashCode() && propertyName.equals(data[i])) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Removes a value of an indexed property from the <code>Style</code>.
     * 
     * @param propertyName the name of the property
     * @param propertyIndex the index of the property to remove
     */
    public void removeIndexedProperty(String propertyName, int propertyIndex) {
        Object value = retrieveProperty(propertyName);
        if (!(value instanceof IndexedPropertyValue)) {
            return;
        }
        ((IndexedPropertyValue) value).removeValue(propertyIndex);
    }
    
    /**
     * Removes a property from the <code>Style</code>.
     * 
     * @param propertyName the name of the property to remove
     */
    public void removeProperty(String propertyName) {
        int propertyNameHashCode = propertyName.hashCode();
        for (int i = 0; i < length; i += 2) {
            if (propertyNameHashCode == data[i].hashCode() && propertyName.equals(data[i])) {
                data[i] = data[length - 2];
                data[i + 1] = data[length - 1];
                data[length - 2] = null;
                data[length - 1] = null;
                length -= 2;
                break;
            }
        }
        
        if (length == 0) {
            data = EMPTY;
        }
    }
    
    /**
     * Retrieves locally stored value of property.
     * 
     * @param propertyName the name of the property
     * @return the value of the property
     */
    private Object retrieveProperty(String propertyName) {
        int propertyNameHashCode = propertyName.hashCode();
        for (int i = 0; i < length; i += 2) {
            if (propertyNameHashCode == data[i].hashCode() && propertyName.equals(data[i])) {
                return data[i + 1];
            }
        }
        return null;
    }
    
    /**
     * Sets an indexed property of the <code>Style</code>
     * 
     * @param propertyName the name of the property
     * @param propertyIndex the index of the property
     * @param propertyValue the value of the property
     */
    public void setIndexedProperty(String propertyName, int propertyIndex, Object propertyValue) {
        Object value = retrieveProperty(propertyName);
        if (!(value instanceof IndexedPropertyValue)) {
            value = new IndexedPropertyValue();
            setProperty(propertyName, value);
        }
        ((IndexedPropertyValue) value).setValue(propertyIndex, propertyValue);
    }
    
    /**
     * Sets a property of the <code>Style</code>.
     * If <code>propertyValue</code> is null, the property will be
     * removed.
     * 
     * @param propertyName the name of the property
     * @param propertyValue the value of the property
     */
    public void setProperty(String propertyName, Object propertyValue) {
        if (propertyValue == null) {
            removeProperty(propertyName);
            return;
        }
        
        if (data == EMPTY) {
            data = new Object[GROW_RATE];
        }

        int propertyNameHashCode = propertyName.hashCode();
        for (int i = 0; i < data.length; i += 2) {
            if (data[i] == null) {
                // Property is not set, space remains to set property.
                // Add property at end.
                data[i] = propertyName;
                data[i + 1] = propertyValue;
                length += 2;
                return;
            }
            if (propertyNameHashCode == data[i].hashCode() && propertyName.equals(data[i])) {
                // Found property, overwrite.
                data[i + 1] = propertyValue;
                return;
            }
        }
        
        // Array is full: grow array.
        Object[] newData = new Object[data.length + GROW_RATE];
        System.arraycopy(data, 0, newData, 0, data.length);
        
        newData[data.length] = propertyName;
        newData[data.length + 1] = propertyValue;
        length += 2;
        data = newData;
    }
    
    /**
     * Returns the number of properties set.
     * 
     * @return the number of properties set
     */
    public int size() {
        return length / 2;
    }
    
    /**
     * Returns a debug representation.
     * 
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer("MutableStyle {");
        for (int i = 0; i < length; i += 2) {
            out.append(data[i]);
            out.append("=");
            out.append(data[i + 1]);
            if (i < length - 2) {
                out.append(", ");
            }
        }
        out.append("}");
        return out.toString();
    }
}
