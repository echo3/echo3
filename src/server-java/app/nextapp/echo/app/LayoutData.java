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

/**
 * Describes the interface between a child <code>Component</code> and its
 * parent <code>Component</code>. A <code>LayoutData</code> object may
 * contain layout, position, color, or other data to describe how a given
 * <code>Component</code> should be rendered within its parent.
 * <code>LayoutData</code> objects are used as values of the
 * <code>layoutData</code> property defined in the <code>Component</code>
 * class.
 * <p>
 * <code>LayoutData</code> is a marker interface which is implemented by all
 * objects providing such layout information. A component which needs to present
 * layout information to its parent should use the specific derivative of
 * <code>LayoutData</code> applicable to its parent component, e.g., a child
 * of a <code>Grid</code> might use the <code>GridLayoutData</code>
 * implementation. The specific <code>LayoutData</code> implementations
 * available for use with a given parent component will be described in the
 * parent component's documentation.
 * <p>
 * <strong>WARNING: </strong> Setting an incompatible <code>LayoutData</code>
 * property on a <code>Component</code> may result in a run-time exception
 * being thrown. Instead, use the add() method of the container component to
 * create and automatically assign the appropriate LayoutData object, and use
 * it subsequently according to the Fluent Interface Pattern
 * (see also http://de.wikipedia.org/wiki/Fluent_Interface)
 */
public interface LayoutData extends Serializable {
    
    /**
     * Has at least one of the properties been changed?
     * 
     * If not, this LayoutData will not be sent to the client
     * in order to avoid unnecessary traffic
     */
    public boolean isChanged();
}
