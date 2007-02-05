/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

package nextapp.echo.app.util;

import java.util.ArrayList;

/**
 * An <code>ArrayList</code> based collection which automatically increases and 
 * decreases in size (by adding/removing trailing nulls) to allow the ability
 * to invoke <code>add()</code> and <code>set()</code> methods to store
 * values at indices beyond the current size of the collection.
 */
public class ResizingArrayList extends ArrayList {

    /**
     * @see java.util.List#add(int, java.lang.Object)
     */
    public void add(int i, Object o) {
        while (i > size()) {
            super.add(null);
        }
        super.add(i, o);
    }
    
    /**
     * @see java.util.List#remove(int)
     */
    public Object remove(int i) {
        Object o = super.remove(i);
        while (size() > 0 && get(size() - 1) == null) {
            super.remove(size() - 1);
        }
        return o;
    }
    
    /**
     * @see java.util.Collection#remove(java.lang.Object)
     */
    public boolean remove(Object o) {
        if (super.remove(o)) {
            while (size() > 0 && get(size() - 1) == null) {
                super.remove(size() - 1);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * @see java.util.List#add(int, java.lang.Object)
     */
    public Object set(int i, Object o) {
        while (i >= size()) {
            super.add(null);
        }
        return super.set(i, o);
    }
}
