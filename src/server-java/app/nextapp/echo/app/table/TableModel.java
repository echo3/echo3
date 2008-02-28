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

package nextapp.echo.app.table;

import java.io.Serializable;

import nextapp.echo.app.event.TableModelListener;

/**
 * A model which represents data in a table format.
 */
public interface TableModel
extends Serializable {
    
    /**
     * Adds a listener that will be notified of changes/
     *
     * @param l the listener to add
     */
    public void addTableModelListener(TableModelListener l);
    
    /**
     * Returns the most-specific class of objects found in a given table 
     * column.  Every object in the specified column must be an instance
     * of the returned class.
     *
     * @param column the column index (0-based)
     * @return the most-specific class of object found in the specified
     *         column
     */
    public Class getColumnClass(int column);

    /**
     * Returns the number of columns in the table.
     *
     * @return the column count
     */
    public int getColumnCount();
    
    /**
     * Returns the name of the specified column number.
     *
     * @param column the column index (0-based)
     * @return the column name
     */
    public String getColumnName(int column);
    
    /**
     * Returns the number of rows in the table.
     *
     * @return the row count
     */
    public int getRowCount();
    
    /**
     * Returns the value found at the given coordinate within the table.
     * Column and row values are 0-based.
     * <strong>WARNING: Take note that the column is the first parameter 
     * passed to this method, and the row is the second parameter.</strong>
     *
     * @param column the column index (0-based)
     * @param row the row index (0-based)
     */
    public Object getValueAt(int column, int row);
    
    /**
     * Removes a listener from being notified of changes.
     *
     * @param l the listener to remove
     */
    public void removeTableModelListener(TableModelListener l);
}
