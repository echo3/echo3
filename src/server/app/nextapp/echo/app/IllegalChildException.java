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

/**
 * An exception thrown when attempting to add a child to the component 
 * hierarchy where either the parent is incompatible with the child or
 * the child is incompatible with the parent.  This exception may be thrown
 * in cases such as attempting to add children to a component that does not
 * support children (e.g., a <code>Label</code>), or adding too many children 
 * to an object (e.g., adding more than two children to a 
 * <code>SplitPane</code>. 
 */
public class IllegalChildException extends RuntimeException {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private Component illegalChild;
    private Component parent;
    
    /**
     * Creates a new <code>IllegalChildException</code>.
     * 
     * @param parent the parent component
     * @param illegalChild the child that was attempted to be illegally added
     */
    protected IllegalChildException(Component parent, Component illegalChild) {
        super("Child \"" + illegalChild + "\" illegally added to component \"" + parent + "\".");
        this.illegalChild = illegalChild;
        this.parent = parent;
    }
    
    /**
     * Returns the illegally added child.
     * 
     * @return the child
     */
    public Component getIllegalChild() {
        return illegalChild;
    }
    
    /**
     * Returns the parent component to which the child was to be added.
     * 
     * @return the parent
     */
    public Component getParent() {
        return parent;
    }
}