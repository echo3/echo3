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

import java.util.ArrayList;
import java.util.List;

/**
 * The default <code>TableModel</code> implementation.
 */
public class DefaultTableModel extends AbstractTableModel {
    
    private List rows;
    private List columnNames;
    
    /**
     * Creates a new table model of 0x0 size.
     */
    public DefaultTableModel() {
        super();
        
        columnNames = new ArrayList();
        rows = new ArrayList();
    }
    
    /**
     * Creates a new table model with the specified dimensions.
     *
     * @param columns the initial number of columns
     * @param rows the initial number of rows
     */
    public DefaultTableModel(int columns, int rows) {
        this();
        
        setRowCount(rows);
        setColumnCount(columns);
    }
    
    /**
     * Creates a new Table Model with the specified data and column names.
     *
     * @param data a two dimensional array containing the table data
     *        (the first index of the array represents the column index,
     *        and the second index represents the row index)
     * @param names the column names
     */
    public DefaultTableModel(Object[][] data, Object[] names) {
        super();
        
        if (data == null) {
            columnNames = new ArrayList();
            rows = new ArrayList();
        } else {
            ArrayList rowList;
            int height = data.length;
            int width = 0;
            if (height > 0 && data[0] != null) {
                width = data[0].length;
            }

            // Add column names
            columnNames = new ArrayList(width);
            for (int column = 0; column < width; ++column) {
                columnNames.add(names[column]);
            }
            
            // Add table data
            rows = new ArrayList(height);
            for (int row = 0; row < height; ++row) {
                if (width != 0) {
                    rowList = new ArrayList(width);
                    for (int column = 0; column < width; ++column) {
                        rowList.add(data[row][column]);
                    }
                    rows.add(rowList);
                }
            }
        }
    }
    
    /**
     * Adds a row containing the provided data to the end of the model.
     *
     * @param rowData the row data
     */
    public void addRow(Object[] rowData) {
        insertRow(rows.size(), rowData);
    }
    
    /**
     * Deletes the specified row.
     *
     * @param row the row to delete
     */
    public void deleteRow(int row) {
        rows.remove(row);
        fireTableRowsDeleted(row, row);
    }

    /**
     * @see nextapp.echo.app.table.TableModel#getColumnCount()
     */
    public int getColumnCount() {
        return columnNames.size();
    }

    /**
     * @see nextapp.echo.app.table.TableModel#getColumnName(int)
     */
    public String getColumnName(int column) {
        String name = null;
        if (column < columnNames.size()) {
            name = (String) columnNames.get(column);
        }
        if (name == null) {
            name = super.getColumnName(column);
        }
        return name;
    }
    
    /**
     * @see nextapp.echo.app.table.TableModel#getRowCount()
     */
    public int getRowCount() {
        return rows.size();
    }
    
    /**
     * @see nextapp.echo.app.table.TableModel#getValueAt(int, int)
     */
    public Object getValueAt(int column, int row) {
        Object value;
        List rowList;
    
        if (row < rows.size()) {
            if (column < columnNames.size()) {
                rowList = (List) rows.get(row);
                if (rowList == null) {
                    value = null;
                } else {
                    value = rowList.get(column);
                }
            } else {
                throw new ArrayIndexOutOfBoundsException("Table column " + column + " does not exist.");
            }
        } else {
            throw new ArrayIndexOutOfBoundsException("Table row " + row + " does not exist.");
        }
        
        return value;
    }
    
    /**
     * Inserts a row containing the provided data.
     *
     * @param row the insertion index
     * @param rowData the row data
     */
    public void insertRow(int row, Object[] rowData) {
        int maxIndex = rowData.length > columnNames.size() ? columnNames.size() : rowData.length;
        List rowList = new ArrayList(columnNames.size());
    
        for (int index = 0; index < maxIndex; ++index) {
            rowList.add(rowData[index]);
        }

        rows.add(row, rowList);
        
        fireTableRowsInserted(row, row);
    }
    
    /**
     * Sets the number of columns in the table.
     * Empty columns will be added at the end of the table if the new column 
     * count exceeds the number of existing columns.  Existing columns will be
     * hidden if the number of existing columns exceeds the new column count.
     *
     * @param newValue the new column count
     */
    public void setColumnCount(int newValue) {
        while (columnNames.size() > newValue) {
            columnNames.remove(columnNames.size() - 1);
        }
        
        while (columnNames.size() < newValue) {
            columnNames.add(null);
        }
        
        fireTableStructureChanged();
    }
    
    /**
     * Sets the name of the specified column.
     * 
     * @param column the column index
     * @param columnName the new column name
     */
    public void setColumnName(int column, String columnName) {
        columnNames.set(column, columnName);
    }

    /**
     * Sets the number of rows in the table.
     * Empty rows will be added at the end of the table if the new row 
     * count exceeds the number of existing rows.  Existing rows will be
     * hidden if the number of existing rows exceeds the new row count.
     *
     * @param newValue the new row count
     */
    public void setRowCount(int newValue) {
        // Remove excess rows
        while (rows.size() > newValue) {
            rows.remove(rows.size() - 1);
        }
        
        while (rows.size() < newValue) {
            rows.add(null);
        }
        
        fireTableDataChanged();
    }

    /**
     * Sets the contents of the table cell at the specified coordinate.
     *
     * @param newValue the new value
     * @param column the column index
     * @param row the row index
     * @throws ArrayIndexOutOfBoundsException if the column or row index
     *         exceed the column or row count
     */
    public void setValueAt(Object newValue, int column, int row) {
        if (rows.size() < row || columnNames.size() < column) {
            throw new ArrayIndexOutOfBoundsException("Table coordinate (" + column + ", " + row + ") does not exist");
        }

        List rowList = (List) rows.get(row);
        if (rowList == null && newValue != null) {
            rowList = new ArrayList(columnNames.size());
            rows.set(row, rowList);
        }
        
        while (rowList.size() <= column) {
            rowList.add(null);
        }
        
        rowList.set(column, newValue);
        
        fireTableCellUpdated(column, row);
    }
}
