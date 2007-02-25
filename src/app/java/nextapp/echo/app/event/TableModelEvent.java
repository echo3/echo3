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

import nextapp.echo.app.table.TableModel;

/**
 * An event describing a change to a <code>TableModel</code>.
 */
public class TableModelEvent extends EventObject {

    /**
     * A value for <code>column</code> parameters indicating that all columns 
     * of the table were affected by the change.
     */
    public static final int ALL_COLUMNS = -2;

    /**
     * A value row-describing parameters/properties, (i.e., <code>row</code>, 
     * <code>firstRow</code>, and <code>lastRow</code>) 
     * indicating the table header was affected.
     */
    public static final int HEADER_ROW = -1;
    
    /**
     * An event type indicating one or more table rows were deleted.
     */
    public static final int DELETE = 1;
    
    /**
     * An event type indicating one or more table rows were inserted.
     */
    public static final int INSERT = 2;
    
    /**
     * An event type indicating one or more table rows were updated.
     */
    public static final int UPDATE = 3;
    
    /**
     * An event type indicating the table structure was modified.
     */
    public static final int STRUCTURE_CHANGED = 4;
    
    private int firstRow;
    private int lastRow;
    private int column;
    private int type;

    /**
     * Creates a <code>TableModelEvent</code> describing a change to any or 
     * all rows of a table.
     *
     * @param source the changed <code>TableModel</code>
     */
    public TableModelEvent(TableModel source) {
        this(source, ALL_COLUMNS, 0, Integer.MAX_VALUE, UPDATE);
    }
    
    /**
     * Creates a <code>TableModel</code>Event indicating a change to any or 
     * all columns of a single table row.
     *
     * @param source the changed <code>TableModel</code>
     * @param row the index of the affected row
     */
    public TableModelEvent(TableModel source, int row) {
        this(source, ALL_COLUMNS, row, row, UPDATE);
    }
    
    /**
     * Creates a <code>TableModel</code>Event indicating a change to any or 
     * all columns of an interval of table rows.
     *
     * @param source the changed <code>TableModel</code>
     * @param firstRow the first table row affected by the update
     * @param lastRow the last table row affected by the update
     */
    public TableModelEvent(TableModel source, int firstRow, int lastRow) {
        this(source, ALL_COLUMNS, firstRow, lastRow, UPDATE);
    }
    
    /**
     * Creates a <code>TableModelEvent</code> indicating a change to a 
     * particular column of a single table row or an interval of table rows.
     *
     * @param source the changed <code>TableModel</code>
     * @param column the column that was affected by the update
     * @param firstRow the first table row affected by the update
     * @param lastRow the last table row affected by the update
     */
    public TableModelEvent(TableModel source, int column, int firstRow, int lastRow) {
        this(source, column, firstRow, lastRow, UPDATE);
    }
    
    /**
     * Primary constructor for creating <code>TableModelEvent</code>s.
     * All other constructors are for convenience and must invoke this
     * constructor.
     *
     * @param source the changed <code>TableModel</code>
     * @param column the column that was affected by the update, 
     *        or <code>ALL_COLUMNS</code> if all columns were affected.
     * @param firstRow the first table row affected by the update
     * @param lastRow the last table row affected by the update
     * @param type The type of change that occurred, one of the following 
     *        values:
     *        <ul>
     *        <li>STRUCTURE_CHANGED - indicates the table's structure 
     *        changed.</li>
     *        <li>DELETE - indicates one or more rows were deleted.</li>
     *        <li>INSERT - indicates one or more rows were inserted.</li>
     *        <li>UPDATE - indicates one or more rows were updated.</li>
     *        </ul>
     */
    public TableModelEvent(TableModel source, int column, int firstRow, int lastRow, int type) {
        super(source);
        
        this.firstRow = firstRow;
        this.lastRow = lastRow;
        this.column = column;
        this.type = type;
    }
    
    /**
     * Returns the column that was affected by the update.
     *
     * @return the column that was affected by the update.
     */
    public int getColumn() {
         return column;
    }
    
    /**
     * Returns the first row that was affected by the update.
     *
     * @return the first row that was affected by the update
     */
    public int getFirstRow() {
        return firstRow;
    }
    
    /**
     * Returns the last row that was affected by the update.
     *
     * @return the last row that was affected by the update
     */
    public int getLastRow() {
        return lastRow;
    }

    /**
     * Returns the type of update that occurred.
     *
     * @return the type of update that occurred, one of the following values:
     *         <ul>
     *         <li>STRUCTURE_CHANGED - indicates the table's structure 
     *         changed.</li>
     *         <li>DELETE - indicates one or more rows were deleted.</li>
     *         <li>INSERT - indicates one or more rows were inserted.</li>
     *         <li>UPDATE - indicates one or more rows were updated.</li>
     *         </ul>
     */
    public int getType() {
        return type;
    }
}
