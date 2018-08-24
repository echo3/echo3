/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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

package nextapp.echo.app.layout;

/**
 * A <code>LayoutData</code> object used to describe how a 
 * <code>Component</code> is rendered within a <code>Grid</code>. 
 */
public class GridLayoutData extends CellLayoutData {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * A constant value for column and row spans indicating that a cell should
     * fill all remaining cells.  
     * <p>
     * <strong>WARNING</strong>: This value may ONLY be used for spans in the
     * direction of the layout of the <code>Grid</code>, i.e., it may only be 
     * used for column-spans if the orientation is horizontal, and it may only
     * be used for row-spans if the orientation is vertical.
     */
    public static final int SPAN_FILL = -1;
    
    private int columnSpan;
    private int rowSpan;
    
    /**
     * Creates a new <code>GridLayoutData</code> instance with no column span/row span. 
     */
    public GridLayoutData() {
        this(1, 1);
    }
    
    /**
     * Creates a new <code>GridLayoutData</code> instance with the specified column and row spans.
     * 
     * @param columnSpan the columnSpan (a value of 1 indicates only one column is occupied)
     * @param rowSpan the rowSpan (a value of 1 indicates only one row is occupied)
     */
    public GridLayoutData(int columnSpan, int rowSpan) {
        super();
        this.columnSpan = columnSpan;
        this.rowSpan = rowSpan;
    }
    
    /**
     * Returns the column span of the cell.  A value of 1 indicates only column row is occupied.
     * 
     * @return the column span
     */
    public int getColumnSpan() {
        return columnSpan;
    }
    
    /**
     * Returns the row span of the cell.  A value of 1 indicates only one row is occupied.
     * 
     * @return the row span
     */
    public int getRowSpan() {
        return rowSpan;
    }
    
    /**
     * Sets the column span of the cell.  A value of 1 indicates only column row is occupied.
     * 
     * @param newValue the new column span
     */
    public void setColumnSpan(int newValue) {
        columnSpan = newValue;
    }
    
    /**
     * Sets the row span of the cell.  A value of 1 indicates only one row is occupied.
     * 
     * @param newValue the new row span
     */
    public void setRowSpan(int newValue) {
        rowSpan = newValue;
    }
}
