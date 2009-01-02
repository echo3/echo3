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

import java.io.Serializable;
import java.util.Iterator;

/**
 * A collection of component-specific named styles. 
 */
public interface StyleSheet
extends Serializable {

    /**
     * Retrieves the names of all styles present in the <code>StyleSheet</code>
     * 
     * @return an iterator containing <code>String</code>s naming all styles present
     */
    public Iterator getStyleNames();
    
    /**
     * Retrieves the names of all component types present in the <code>StyleSheet</code> with the specified name.
     * 
     * @param styleName the style name
     * @return an iterator containing <code>Class</code>es providing the fully qualified names of all component types
     *         which provide styles for the <code>styleName</code> value
     */
    public Iterator getComponentTypes(String styleName);
    
    /**
     * Retrieves the appropriate style for the specified component class 
     * and style name.
     * 
     * @param styleName the name of the <code>Component</code>'s specified named style
     * @param componentClass the <code>Class</code> of the <code>Component</code> for which style information is being determined
     * @param searchSuperClasses flag indicating whether a style for a superclass should be returned in the event that no 
     *        specific style can be found for the specified <code>componentClass</code>
     *        
     * 
     * @return the appropriate <code>Style</code> if found, or null otherwise
     */
    public Style getStyle(String styleName, Class componentClass, boolean searchSuperClasses);
}
