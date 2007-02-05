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

package nextapp.echo.app.table;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.EventListener;
import java.util.Iterator;
import java.util.List;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.app.event.TableColumnModelEvent;
import nextapp.echo.app.event.TableColumnModelListener;

/**
 * The default <code>TableColumnModel</code> implementation.
 */
public class DefaultTableColumnModel
implements Serializable, TableColumnModel {
    
    /**
     * A collection of all columns in the column model in order.
     */
    private List columns = new ArrayList();
    
    /**
     * A listener storage facility.
     */
    protected EventListenerList listenerList = new EventListenerList();
    
    /**
     * Creates a new DefaultTableColumnModel.
     */
    public DefaultTableColumnModel() {
        super();
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#addColumn(nextapp.echo.app.table.TableColumn)
     */
    public void addColumn(TableColumn column) {
        columns.add(column);
        fireColumnAdded(new TableColumnModelEvent(this, -1, columns.size() - 1));
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#addColumnModelListener(nextapp.echo.app.event.TableColumnModelListener)
     */
    public void addColumnModelListener(TableColumnModelListener l) {
        listenerList.addListener(TableColumnModelListener.class, l);
    }
        
    /**
     * Notifies <code>TableColumnModelListener</code>s that a column was 
     * added.
     *
     * @param e the <code>TableColumnModelEvent</code> to fire
     */
    protected void fireColumnAdded(TableColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TableColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TableColumnModelListener) listeners[index]).columnAdded(e);
        }   
    }
    
    /**
     * Notifies <code>TableColumnModelListener</code>s that a column was 
     * moved.
     *
     * @param e the <code>TableColumnModelEvent</code> to fire
     */
    protected void fireColumnMoved(TableColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TableColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TableColumnModelListener) listeners[index]).columnMoved(e);
        }   
    }
    
    /**
     * Notifies <code>TableColumnModelListener</code>s that a column was 
     * removed.
     *
     * @param e the <code>TableColumnModelEvent</code> to fire
     */
    protected void fireColumnRemoved(TableColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TableColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TableColumnModelListener) listeners[index]).columnRemoved(e);
        }   
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#getColumn(int)
     */
    public TableColumn getColumn(int index) {
        if ((getColumnCount() - 1) < index) {
            return null;
        }

        return (TableColumn) columns.get(index);
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#getColumnCount()
     */
    public int getColumnCount() {
        return columns.size();
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#getColumnIndex(java.lang.Object)
     */
    public int getColumnIndex(Object identifier) {
        if (identifier == null) {
            throw new IllegalArgumentException("Null not allowed as identifier value.");
        }
    
        Iterator it = columns.iterator();
        int index = 0;
        
        while (it.hasNext()) {
            TableColumn column = (TableColumn) it.next();
            if (identifier.equals(column.getIdentifier())) {
                return index;
            }
            ++index;
        }
        
        throw new IllegalArgumentException("No column found with specified identifier: " + identifier);
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#getColumns()
     */
    public Iterator getColumns() {
        return columns.iterator();
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#moveColumn(int, int)
     */
    public void moveColumn(int columnIndex, int newIndex) {
        if (columnIndex < 0 || columnIndex >= columns.size()) {
            throw new IllegalArgumentException("No column exists at index: " + columnIndex);
        }
        if (newIndex < 0 || newIndex >= columns.size()) {
            throw new IllegalArgumentException("Attempt to move column to invalid index: " + newIndex);
        }
        
        TableColumn column = (TableColumn) columns.remove(columnIndex);
        columns.add(newIndex, column);
        fireColumnMoved(new TableColumnModelEvent(this, columnIndex, newIndex));
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#removeColumn(nextapp.echo.app.table.TableColumn)
     */
    public void removeColumn(TableColumn column) {
        int columnIndex = columns.indexOf(column);
        if (columnIndex == -1) {
            // Do nothing, column is not in model.
            return;
        }
        columns.remove(columnIndex);
        fireColumnAdded(new TableColumnModelEvent(this, columnIndex, -1));
    }
    
    /**
     * @see nextapp.echo.app.table.TableColumnModel#removeColumnModelListener(nextapp.echo.app.event.TableColumnModelListener)
     */
    public void removeColumnModelListener(TableColumnModelListener l) {
        listenerList.removeListener(TableColumnModelListener.class, l);
    }
}
