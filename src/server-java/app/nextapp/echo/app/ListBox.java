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

package nextapp.echo.app;

import nextapp.echo.app.list.AbstractListComponent;
import nextapp.echo.app.list.DefaultListModel;
import nextapp.echo.app.list.ListModel;
import nextapp.echo.app.list.ListSelectionModel;


/**
 * A component which provides the ability to select one or more items.
 */
public class ListBox extends AbstractListComponent {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * Creates an empty <code>ListBox</code>.
     * A <code>DefaultListModel</code> will be created. 
     * A <code>DefaultListSelectionModel</code> will be created and used
     * to describe selections.
     */
    public ListBox() {
        super();
    }
    
    /** 
     * Creates a <code>ListBox</code> visualizing the specified model.
     * A <code>DefaultListSelectionModel</code> will be created and used
     * to describe selections.
     *
     * @param model the initial model
     */
    public ListBox(ListModel model) {
        super(model, null);
    }
    
    /**
     * Creates a <code>ListBox</code> visualizing the specified 
     * <code>ListModel</code> and describing selections using the specified
     * <code>ListSelectionModel</code>.
     * 
     * @param model the initial model
     * @param selectionModel the initial selection model
     */
    public ListBox(ListModel model, ListSelectionModel selectionModel) {
        super(model, selectionModel);
    }
    
    /**
     * Creates a <code>ListBox</code> with a <code>DefaultListModel</code>
     * that initially contains the specified array of items.
     * A <code>DefaultListSelectionModel</code> will be created and used
     * to describe selections.
     *
     * @param itemArray an array of items that will initially populate
     *        this <code>ListBox</code>
     */
    public ListBox(Object[] itemArray) {
        super(new DefaultListModel(itemArray), null);
    }
     
    /**
     * Returns the maximum selected index.
     *
     * @return the maximum selected index
     */
    public int getMaxSelectedIndex() {
        return getSelectionModel().getMaxSelectedIndex();
    }
        
    /**
     * Returns the minimum selected index.
     *
     * @return The minimum selected index
     */
    public int getMinSelectedIndex() {
        return getSelectionModel().getMinSelectedIndex();
    }
    
    /**
     * Returns all selected indices.
     *
     * @return an array containing all the selected indices
     */
    public int[] getSelectedIndices() {
        ListModel model = getModel();
        int min = getMinSelectedIndex();
        if (min == -1) {
            // No indices are selected, return empty array.
            return new int[0];
        }
        
        int selectionCount = 0;
        int max = getMaxSelectedIndex();
        int size = model.size();
        if (max >= size - 1) {
            max = size - 1;
        }

        for (int index = min; index <= max; ++index) {
            if (isSelectedIndex(index)) {
                ++selectionCount;
            }
        }

        int[] selectedIndices = new int[selectionCount];
        selectionCount = 0;
        for (int index = min; index <= max; ++index) {
            if (isSelectedIndex(index)) {
                selectedIndices[selectionCount] = index;
                ++selectionCount;
            }
        }
        
        return selectedIndices;
    }
        
    /**
     * Returns the selected item.  This method is intended to be used when the
     * when the selection model is configured to only allow one item to be 
     * selected at a time.  In the event multiple item selection is enabled, 
     * this method will return the item at the lowest selected index.
     *
     * @return the selected item
     */
    public Object getSelectedValue() {
        ListModel model = getModel();
        int selectedIndex = getMinSelectedIndex();
        Object value;
        
        if (selectedIndex == -1) {
            value = null;
        } else {
            value = model.get(getMinSelectedIndex());
        }

        return value;
    }
    
    /**
     * Returns all selected items.
     *
     * @return an array containing all the selected items
     */
    public Object[] getSelectedValues() {
        ListModel model = getModel();
        int min = getMinSelectedIndex();

        if (min == -1) {
            // No values are selected, return empty array.
            return new Object[0];
        }
        
        int selectionCount = 0;
        int max = getMaxSelectedIndex();
        int size = model.size();
        if (max >= size - 1) {
            max = size - 1;
        }

        for (int index = min; index <= max; ++index) {
            if (isSelectedIndex(index)) {
                ++selectionCount;
            }
        }

        Object[] selectedValues = new Object[selectionCount];
        selectionCount = 0;
        for (int index = min; index <= max; ++index) {
            if (isSelectedIndex(index)) {
                selectedValues[selectionCount] = model.get(index);
                ++selectionCount;
            }
        }
        
        return selectedValues;
    }

    /**
     * Returns the selection mode.
     * 
     * @return the selection mode, one of the following values:
     *         <ul>
     *          <li><code>ListSelectionModel.SINGLE_SELECTION</code>: only one 
     *          list element may be selected.</li>
     *          <li><code>ListSelectionModel.MULTIPLE_SELECTION</code>: 
     *          multiple list elements may be selected.</li>
     *         </ul>
     */
    public int getSelectionMode() {
        return getSelectionModel().getSelectionMode();
    }
    
    /**
     * Determines whether an index is selected.
     *
     * @param index the index
     * @return the selection state of the index
     */
    public boolean isSelectedIndex(int index) {
        return getSelectionModel().isSelectedIndex(index);
    }
    
    /**
     * Selects only the given index.
     *
     * @param index the index
     */
    public void setSelectedIndex(int index) {
        ListSelectionModel selectionModel = getSelectionModel();
        selectionModel.clearSelection();
        selectionModel.setSelectedIndex(index, true);    
    }
    
    /**
     * Sets the selection state of the given index.
     *
     * @param index the index
     * @param selected the selection state
     */
    public void setSelectedIndex(int index, boolean selected) {
        getSelectionModel().setSelectedIndex(index, selected);    
    }
    
    /**
     * Selects the specified indices, deselecting any other indices.
     *
     * @param indices the indices to be selected
     */
    public void setSelectedIndices(int[] indices) {
        ListSelectionModel selectionModel = getSelectionModel();
        selectionModel.clearSelection();
        for (int i = 0; i < indices.length; ++i) {
            selectionModel.setSelectedIndex(indices[i], true);
        }
    }
    
    /**
     * Sets the selection mode.  
     * 
     * @param newValue the selection mode, one of the following values:
     *        <ul>
     *         <li><code>ListSelectionModel.SINGLE_SELECTION</code>: only one 
     *         list element may be selected.</li>
     *         <li><code>ListSelectionModel.MULTIPLE_SELECTION</code>: 
     *         multiple list elements may be selected.</li>
     *        </ul>
     */
    public void setSelectionMode(int newValue) {
        getSelectionModel().setSelectionMode(newValue);
    }
}
