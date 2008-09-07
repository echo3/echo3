/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
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

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * A <code>MutableStyle</code> which will retrieve properties from a 
 * "parent" style when they are not set locally.
 */
public class DerivedMutableStyle extends MutableStyle {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private Style parentStyle;
    
    /**
     * Default constructor.
     */
    public DerivedMutableStyle() {
        super();
    }
    
    /**
     * Creates a new <code>DerivedMutableStyle</code>.
     * 
     * @param parentStyle the style from which to retrieve properties
     *        when they are not set within this style
     */
    public DerivedMutableStyle(Style parentStyle) {
        this.parentStyle = parentStyle;
    }
    
    /**
     * Returns the parent style.
     * 
     * @return the parent style
     */
    public Style getParentStyle() {
        return parentStyle;
    }
    
    /**
     * @see nextapp.echo.app.Style#getIndex(java.lang.String, int)
     */
    public Object getIndex(String propertyName, int propertyIndex) {
        if (super.isIndexedPropertySet(propertyName, propertyIndex)) {
            return super.getIndex(propertyName, propertyIndex);
        } else if (parentStyle != null) {
            return parentStyle.getIndex(propertyName, propertyIndex);
        } else {
            return null;
        }
    }

    /**
     * @see nextapp.echo.app.Style#get(java.lang.String)
     */
    public Object get(String propertyName) {
        if (super.isPropertySet(propertyName)) {
            return super.get(propertyName);
        } else if (parentStyle != null) {
            return parentStyle.get(propertyName);
        } else {
            return null;
        }
    }
    
    /**
     * @see nextapp.echo.app.Style#getPropertyNames()
     */
    public Iterator getPropertyNames() {
        Iterator it = super.getPropertyNames();
        Set propertyNames = new HashSet();
        while (it.hasNext()) {
            propertyNames.add(it.next());
        }
        if (parentStyle != null) {
            it = parentStyle.getPropertyNames();
            while (it.hasNext()) {
                propertyNames.add(it.next());
            }
        }
        return propertyNames.iterator();
    }

    /**
     * @see nextapp.echo.app.Style#isIndexedPropertySet(java.lang.String, int)
     */
    public boolean isIndexedPropertySet(String propertyName, int propertyIndex) {
        return super.isIndexedPropertySet(propertyName, propertyIndex) 
                || (parentStyle != null && parentStyle.isIndexedPropertySet(propertyName, propertyIndex));
    }
    
    /**
     * @see nextapp.echo.app.Style#isPropertySet(java.lang.String)
     */
    public boolean isPropertySet(String propertyName) {
        return super.isPropertySet(propertyName) || (parentStyle != null && parentStyle.isPropertySet(propertyName));
    }
    
    /**
     * Sets the parent style, from which properties will be retrieved if they
     * are not found in this style.
     * 
     * @param parentStyle the parent style
     */
    public void setParentStyle(Style parentStyle) {
        this.parentStyle = parentStyle;
    }
}
