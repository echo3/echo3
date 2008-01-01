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

import java.io.Serializable;
import java.util.Iterator;

/**
 * A representation of stylistic property information about a single instance 
 * or type of component.
 */
public interface Style 
extends Serializable {
    
    /**
     * Retrieves the value of the specified indexed property.
     */
    public Object getIndexedProperty(String propertyName, int index);
    
    /**
     * Retrieves the value of the specified property.
     */
    public Object getProperty(String propertyName);
    
    /**
     * Determines which indices of a particular property are set.
     * 
     * @return an <code>Iterator</code> that returns the set indices in
     *         incrementing order as <code>Integer</code>s
     */
    public Iterator getPropertyIndices(String propertyName);
    
    /**
     * Retrieves the names of all set properties.
     * 
     * @return an <code>Iterator</code> that returns the names of all set 
     *         properties
     */
    public Iterator getPropertyNames();
    
    /**
     * Determines if a particular index of an indexed property is set.
     * 
     * @param propertyName the property name
     * @param index the index
     * @return true if the index is set
     */
    public boolean isIndexedPropertySet(String propertyName, int index);
    
    /**
     * Determines if a particular property is set.
     * In the case of an indexed property, this method will return true
     * if any indices are set.
     * 
     * @param propertyName the property name
     * @return true if the property is set
     */
    public boolean isPropertySet(String propertyName);
}
