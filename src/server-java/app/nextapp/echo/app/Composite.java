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

/**
 * Generic composite component base class.  
 * This class is intended to be used as base class for composite components.
 * This component will simply display its content without any modification to
 * its appearance or behavior.  This component may have at most one child
 * component.
 * <p>
 * See the <code>Panel</code> component for a default implementation of a 
 * single-child container component.
 * <p>
 * This class provides no benefit if you are providing a custom client/server
 * synchronization peer.  If you wish to create a component with a custom
 * client/server synchronization peer, <code>Component</code> itself should be
 * derived instead of this class.
 */
public abstract class Composite extends Component {

    /**
     * Default constructor.
     */
    public Composite() {
        super();
    }
    
    /**
     * Allow at most one child component.
     * 
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component child) {
        return getComponentCount() == 0 || indexOf(child) != -1;
    }
}
