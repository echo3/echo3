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
import java.util.EventListener;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.app.event.TableModelEvent;
import nextapp.echo.app.event.TableModelListener;

/**
 * An abstract implementation of a <code>TableModel</code>.  
 * This class provides the following conveniences for <code>TableModel</code>
 * implementation development:
 * <ul>
 *  <li>event listener management and notification</li>
 *  <li>a generic implementation of <code>getColumnClass()</code> which 
 *      returns <code>Object.class</code></li>
 *  <li>a generic implementation of <code>getColumnName()</code> which
 *      returns "spreadsheet-style" column names, i.e., 
 *      A, B, C...Y, Z, AA, AB, AC....</li>
 * </ul>
 * 
 * @see DefaultTableModel
 */
public abstract class AbstractTableModel 
implements Serializable, TableModel {

    private EventListenerList listenerList = new EventListenerList();
    
    /** 
     * Default constructor.
     */
    public AbstractTableModel() {
        super();
    }
    
    /**
     * @see nextapp.echo.app.table.TableModel#addTableModelListener(nextapp.echo.app.event.TableModelListener)
     */
    public void addTableModelListener(TableModelListener l) {
        listenerList.addListener(TableModelListener.class, l);
    }
    
    /**
     * Notifies <code>TableModelListener</code>s that the contents of the cell 
     * at the specified coordinate were changed.
     *
     * @param column the column index
     * @param row the row index
     */
    public void fireTableCellUpdated(int column, int row) {
        fireTableChanged(new TableModelEvent(this, row, row, column, TableModelEvent.UPDATE));
    }
    
    /**
     * Notifies  <code>TableModelListener</code>s that the content of the table 
     * (possibly including the number of rows) was changed, but that the table's 
     * structure has remained intact.
     */
    public void fireTableDataChanged() {
        fireTableChanged(new TableModelEvent(this));
    }
    
    /**
     * Notifies <code>TableModelListener</code>s that rows from
     * <code>firstRow</code> to <code>lastRow</code> were deleted.
     *
     * @param firstRow the index of the first deleted row
     * @param lastRow the index of the last deleted row
     */
    public void fireTableRowsDeleted(int firstRow, int lastRow) {
        fireTableChanged(new TableModelEvent(this, TableModelEvent.ALL_COLUMNS, firstRow, lastRow, TableModelEvent.DELETE));
    }
    
    /**
     * Notifies <code>TableModelListener</code>s that the rows from
     * <code>firstRow</code> to <code>lastRow</code> were inserted. 
     *
     * @param firstRow the index of the first inserted row
     * @param lastRow the index of the last inserted row
     */
    public void fireTableRowsInserted(int firstRow, int lastRow) {
        fireTableChanged(new TableModelEvent(this, TableModelEvent.ALL_COLUMNS, firstRow, lastRow, TableModelEvent.INSERT));
    }
    
    /**
     * Notifies <code>TableModelListener</code>s that the data in the rows
     * from <code>firstRow</code> to <code>lastRow</code> was updated. 
     * in the specified rows was updated.
     *
     * @param firstRow the index of the first inserted row
     * @param lastRow the index of the last inserted row
     */
    public void fireTableRowsUpdated(int firstRow, int lastRow) {
        fireTableChanged(new TableModelEvent(this, TableModelEvent.ALL_COLUMNS, firstRow, lastRow, TableModelEvent.UPDATE));
    }
    
    /**
     * Notifies <code>TableModelListener</code> that all data in the table may
     * have changed, including the size and structure of the table.
     */
    public void fireTableStructureChanged() {
        fireTableChanged(new TableModelEvent(this, TableModelEvent.ALL_COLUMNS, TableModelEvent.HEADER_ROW,
                TableModelEvent.HEADER_ROW, TableModelEvent.STRUCTURE_CHANGED));
    }
    
    /**
     * Notifies <code>TableModelListener</code>s of the specified event.
     *
     * @param e the event
     */
    public void fireTableChanged(TableModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TableModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TableModelListener) listeners[index]).tableChanged(e);
        }
    }

    /**
     * Returns <code>Object.class</code>
     * 
     * @see nextapp.echo.app.table.TableModel#getColumnClass(int)
     */
    public Class getColumnClass(int column) {
        return Object.class;
    }

    /**
     * Returns column names using a "spreadsheet-style" convention, i.e., 
     * A, B, C...Y, Z, AA, AB, AC...
     * 
     * @see nextapp.echo.app.table.TableModel#getColumnName(int)
     */
    public String getColumnName(int column) {
        StringBuffer sb = new StringBuffer();
        int value = column;
        do {
            int digit = value % 26;
            sb.insert(0, (char) ('A' + digit));
            value = value / 26 - 1;
        } while (value >= 0);
        
        return sb.toString();
    }
    
    /**
     * Returns the <code>EventListenerList</code> used to register listeners.
     * 
     * @return the <code>EventListenerList</code>
     */
    public EventListenerList getEventListenerList() {
        return listenerList;
    }
    
    /**
     * @see nextapp.echo.app.table.TableModel#removeTableModelListener(nextapp.echo.app.event.TableModelListener)
     */
    public void removeTableModelListener(TableModelListener l) {
        listenerList.removeListener(TableModelListener.class, l);
    }
}
