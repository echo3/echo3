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

package nextapp.echo.app.table;

import java.io.Serializable;
import java.util.Iterator;

import nextapp.echo.app.event.TableColumnModelListener;

/**
 * A representation of the collection of <code>TableColumn</code>s of a
 * <code>Table</code>.
 */
public interface TableColumnModel
extends Serializable {
    
    /**
     * Adds a table column to the end of the model.
     *
     * @param column the column to add
     */
    public void addColumn(TableColumn column);
    
    /**
     * Adds a listener to be notified of updates to this
     * <code>TableColumnModel</code>.
     *
     * @param l the listener to add
     */ 
    public void addColumnModelListener(TableColumnModelListener l);

    /**
     * Returns the <code>TableColumn</code> at the specified index.
     *
     * @param columnIndex the index
     * @return the column
     */
    public TableColumn getColumn(int columnIndex);
    
    /**
     * Returns the number of columns in the column model.
     *
     * @return the number of columns
     */
    public int getColumnCount();
    
    /**
     * Returns the index of the table column with the given identifier.
     *
     * @param identifier the identifier 
     * @return the index
     * @throws IllegalArgumentException if the value of <code>identifier</code>
     *         is null or if the no column was found with the given identifier
     */
    public int getColumnIndex(Object identifier);
    
    /**
     * Returns an <code>Iterator</code> over the columns of the column model.
     *
     * @return the <code>Iterator</code>
     */
    public Iterator getColumns();
    
    /**
     * Moves a table column to a new index within the model.
     *
     * @param columnIndex the index of the column to move
     * @param newIndex the new index of the specified column
     */
    public void moveColumn(int columnIndex, int newIndex);
    
    /**
     * Remove a table column from the model.
     *
     * @param column the column to remove
     */
    public void removeColumn(TableColumn column);
    
    /**
     * Removes a listener from being notified of updates to this
     * <code>TableColumnModel</code>.
     *
     * @param l the listener to remove
     */ 
    public void removeColumnModelListener(TableColumnModelListener l);
}
