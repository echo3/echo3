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

package nextapp.echo.app;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * A mutable implementation of a <code>StyleSheet</code>. 
 */
public class MutableStyleSheet 
implements StyleSheet {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private Map namedStyleMap = new HashMap();
    private Map defaultStyleMap = new HashMap();

    /**
     * Adds a <code>Style</code> to the <code>StyleSheet</code>.
     * 
     * @param componentClass the <code>Class</code> of the 
     *        <code>Component</code> for which the style is to be used
     * @param styleName the name of the style
     * @param style the <code>Style</code> to be added
     */
    public void addStyle(Class componentClass, String styleName, Style style) {
        if (styleName == null) {
            defaultStyleMap.put(componentClass, style);
        } else {
            Map styleMap = (Map) namedStyleMap.get(styleName);
            if (styleMap == null) {
                styleMap = new HashMap();
                namedStyleMap.put(styleName, styleMap);
            }
            styleMap.put(componentClass, style);
        }
    }
    
    /**
     * Adds the contents of another <code>StyleSheet</code> to this
     * <code>StyleSheet</code>.  Future changes to the added 
     * <code>StyleSheet</code> will not be reflected, unless it is re-added.
     * 
     * @param styleSheet the <code>StyleSheet</code> to add
     */
    public void addStyleSheet(MutableStyleSheet styleSheet) {
        namedStyleMap.putAll(styleSheet.namedStyleMap);
        defaultStyleMap.putAll(styleSheet.defaultStyleMap);
    }
    
    /**
     * @see nextapp.echo.app.StyleSheet#getComponentTypes(java.lang.String)
     */
    public Iterator getComponentTypes(String styleName) {
        if (styleName == null) {
            return Collections.unmodifiableSet(defaultStyleMap.keySet()).iterator();
        } else {
            Map styleMap = (Map) namedStyleMap.get(styleName);
            return Collections.unmodifiableSet(styleMap.keySet()).iterator();
        }
    }

    /**
     * @see nextapp.echo.app.StyleSheet#getStyle(java.lang.String, java.lang.Class, boolean)
     */
    public Style getStyle(String styleName, Class componentClass, boolean searchSuperClasses) {
        if (styleName == null) {
            // Retrieve generic style.
            while (componentClass != Object.class) {
                Style style = (Style) defaultStyleMap.get(componentClass);
                if (!searchSuperClasses || style != null) {
                    return style;
                }
                componentClass = componentClass.getSuperclass();
            }
            return null;
        } else {
            // Retrieve named style.   
            Map styleMap = (Map) namedStyleMap.get(styleName);
            if (styleMap == null) {
                 return null;
            }
            while (componentClass != Object.class) {
                Style style = (Style) styleMap.get(componentClass);
                if (!searchSuperClasses || style != null) {
                    return style;
                }
                componentClass = componentClass.getSuperclass();
            }
            return null;
        }
    }
    
    /**
     * @see nextapp.echo.app.StyleSheet#getStyleNames()
     */
    public Iterator getStyleNames() {
        return new Iterator() {

            boolean returnDefault = defaultStyleMap.size() > 0;
            Iterator namedStyleIterator = namedStyleMap.keySet().iterator();
            
            /**
             * @see java.util.Iterator#hasNext()
             */
            public boolean hasNext() {
                if (returnDefault) {
                    return true;
                } else {
                    return namedStyleIterator.hasNext();
                }
            }
    
            /**
             * @see java.util.Iterator#next()
             */
            public Object next() {
                if (returnDefault) {
                    returnDefault = false;
                    return null;
                } else {
                    return namedStyleIterator.next();
                }
            }
    
            /**
             * @see java.util.Iterator#remove()
             */
            public void remove() {
                throw new UnsupportedOperationException();
            }        
        };
    }
}
