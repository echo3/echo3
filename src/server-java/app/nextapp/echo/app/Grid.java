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

package nextapp.echo.app;

/**
 * A layout <code>Component</code> which renders its contents in a grid. Each
 * component is contained within a "cell" of the grid.
 * <code>GridLayoutData</code> layout data objects may used to cause cells to
 * expand to fill multiple columns or rows.
 * <p>
 * <b>Child LayoutData</b>: Children of this component may provide layout
 * information using the <code>nextapp.echo.app.layout.GridLayoutData</code>
 * layout data object.
 * 
 * @see nextapp.echo.app.layout.GridLayoutData
 */
public class Grid extends Component {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /** Default grid column (or row) size (2). */
    public static final int DEFAULT_SIZE = 2;
    
    /**
     * Constant value for <code>orientation</code> property indicating cells 
     * should be laid out horizontally and then vertically.
     * <code>ORIENTATION_HORIZONTAL</code> is the default orientation setting.
     */
    public static final int ORIENTATION_HORIZONTAL = 0;

    /**
     * Constant value for <code>orientation</code> property indicating cells 
     * should be laid out vertically and then horizontally. 
     */
    public static final int ORIENTATION_VERTICAL = 1;
    
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_COLUMN_WIDTH = "columnWidth";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_ORIENTATION = "orientation";
    public static final String PROPERTY_ROW_HEIGHT = "rowHeight";
    public static final String PROPERTY_SIZE = "size";
    public static final String PROPERTY_WIDTH = "width";

    /**
     * Creates a new horizontally-oriented <code>Grid</code> with the
     * default size (2).
     */
    public Grid() {
        super();
    }
    
    /**
     * Creates a new horizontally-oriented <code>Grid</code> with the 
     * specified size.
     * 
     * @param size the number of columns
     * @see #getSize()
     */
    public Grid(int size) {
        super();
        setSize(size);
    }

    /**
     * Returns the <code>Border</code>.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }

    /**
     * Returns the width of the specified column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param columnIndex the column index
     * @return the width
     */
    public Extent getColumnWidth(int columnIndex) {
        return (Extent) getIndex(PROPERTY_COLUMN_WIDTH, columnIndex);
    }
    
    /**
     * Returns the overall height.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }
    
    /**
     * Returns the default cell insets. The default cell insets will be used for
     * individual child cells that do not provide an <code>Insets</code> value
     * in their <code>GridLayoutData</code>.
     * 
     * @return the default cell insets
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Returns the orientation of the grid (either horizontal or vertical).
     * The orientation describes the direction in which cells are laid out.
     * An orientation of <code>ORIENTATION_HORIZONTAL</code> (the default)
     * specifies that cells should be laid out in horizontal rows
     * with the <code>size</code> property specifying the number of columns
     * per row.
     * An orientation of <code>ORIENTATION_VERTICAL</code>
     * specifies that cells should be laid out in vertical columns
     * with the <code>size</code> property specifying the number of rows
     * per column.
     * 
     * @return the orientation, one of the following values:
     *         <ul>
     *         <li><code>ORIENTATION_HORIZONTAL</code> (the default)</li>
     *         <li><code>ORIENTATION_VERTICAL</code></li>
     *         </ul>
     * @see #setOrientation
     */
    public int getOrientation() {
        Integer orientationValue = (Integer) get(PROPERTY_ORIENTATION);
        return orientationValue == null ? ORIENTATION_HORIZONTAL : orientationValue.intValue();
    }
    
    /**
     * Returns the height of the specified row.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param rowIndex the row index
     * @return the height
     */
    public Extent getRowHeight(int rowIndex) {
        return (Extent) getIndex(PROPERTY_ROW_HEIGHT, rowIndex);
    }
    
    /**
     * Returns the number of columns or rows in the <code>Grid</code>.
     * If the <code>orientation</code> property is set to 
     * <code>ORIENTATION_HORIZONTAL</code>, this property represents the
     * number of columns in the <code>Grid</code>.
     * If the <code>orientation</code> property is set to 
     * <code>ORIENTATION_VERTICAL</code>, this property represents the
     * number of rows in the <code>Grid</code>.
     * 
     * @return the number of columns or rows  
     */
    public int getSize() {
        Integer sizeValue = (Integer) get(PROPERTY_SIZE);
        if (sizeValue == null) {
            return DEFAULT_SIZE;
        } else {
            return sizeValue.intValue();
        }
    }
    
    /**
     * Returns the overall width of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
    }
    
    /**
     * Sets the <code>Border</code>.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the width of the specified column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param columnIndex the column index
     * @param newValue the new width
     */
    public void setColumnWidth(int columnIndex, Extent newValue) {
        setIndex(PROPERTY_COLUMN_WIDTH, columnIndex, newValue);
    }
    
    /**
     * Sets the overall height of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }
    
    /**
     * Sets the default cell insets. The default cell insets will be used for
     * individual child cells that do not provide an <code>Insets</code> value
     * in their <code>GridLayoutData</code>.
     * 
     * @param newValue the new default cell insets
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }

    /**
     * Sets the orientation of the grid (either horizontal or vertical).
     * The orientation describes the direction in which cells are laid out.
     * An orientation of <code>ORIENTATION_HORIZONTAL</code> (the default)
     * specifies that cells should be laid out in horizontal rows
     * with the <code>size</code> property specifying the number of columns
     * per row.
     * An orientation of <code>ORIENTATION_VERTICAL</code>
     * specifies that cells should be laid out in vertical columns
     * with the <code>size</code> property specifying the number of rows
     * per column.
     * 
     * @param newValue the new orientation, one of the following values:
     *        <ul>
     *        <li><code>ORIENTATION_HORIZONTAL</code> (the default)</li>
     *        <li><code>ORIENTATION_VERTICAL</code></li>
     *        </ul>
     */
    public void setOrientation(int newValue) {
        set(PROPERTY_ORIENTATION, new Integer(newValue));
    }
    
    /**
     * Sets the height of the specified row.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param rowIndex the row index
     * @param newValue the new height
     */
    public void setRowHeight(int rowIndex, Extent newValue) {
        setIndex(PROPERTY_ROW_HEIGHT, rowIndex, newValue);
    }
    
    /**
     * Sets the number of columns or rows in the grid.
     * If the <code>orientation</code> property is set to 
     * <code>ORIENTATION_HORIZONTAL</code>, this property represents the
     * number of columns in the <code>Grid</code>.
     * If the <code>orientation</code> property is set to 
     * <code>ORIENTATION_VERTICAL</code>, this property represents the
     * number of rows in the <code>Grid</code>.
     * 
     * @param newValue the number of columns or rows
     * @see #getSize()
     */
    public void setSize(int newValue) {
        set(PROPERTY_SIZE, new Integer(newValue));
    }
    
    /**
     * Sets the overall width of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
    }
}
