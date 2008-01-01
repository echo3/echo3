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

package nextapp.echo.app.event;

import java.util.EventObject;

import nextapp.echo.app.table.TableColumnModel;

/**
 * An event which describes an update to a <code>TableColumnModel</code>
 */
public class TableColumnModelEvent extends EventObject {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private int fromIndex;
    private int toIndex;

    /**
     * Creates a new <code>TableColumnModelEvent</code>.
     *
     * @param source the updated <code>TableColumnModel</code>.
     * @param fromIndex the index from which the column was moved or removed
     *        (relevant to remove and move operations)
     * @param toIndex the index to which the column was moved or added 
     *        (relevant to move and add operations)
     */
    public TableColumnModelEvent(TableColumnModel source, int fromIndex, int toIndex) {
        super(source);
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
    }
    
    /**
     * Returns the index from which the column was moved or removed.
     * This method is only relevant to remove and move operations.
     *
     * @return the index from which the column was moved or removed
     */
    public int getFromIndex() {
        return fromIndex;
    }
    
    /**
     * Returns the index to which the column was moved or added.
     * This method is only relevant to move and add operations.
     *
     * @return the index to which the column was moved or added
     */
    public int getToIndex() {
        return toIndex;
    }
}