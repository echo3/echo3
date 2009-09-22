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

/**
 * <code>SelectField</code> component: a selection component which displays selection items in a drop-down field. Allows the
 * selection of only one item at a time. Does not support child components.
 * <p>
 * One item of the select field will always be displayed as being selected.  If the model does not specify a selected item,
 * the first item will be selected.  Note that the <code>getSelectedItem()</code> and <code>getSelectedIndex()</code> methods
 * of this object will reflect such selection, even when the model itself does not.
 */
public class SelectField extends AbstractListComponent {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * Creates a new, empty <code>SelectField</code>.
     */
    public SelectField() {
        this((ListModel) null);
    }
    
    /**
     * Creates a new <code>SelectField</code> with the provided model.
     *
     * @param model the model for the <code>SelectField</code>
     */
    public SelectField(ListModel model) {
        super(model, null);
    }
    
    /**
     * Creates a new <code>SelectField</code> that will initially contain the
     * provided array of items.
     *
     * @param items the items the <code>SelectField</code> will initially 
     *        contain
     */
    public SelectField(Object[] items) {
        this(new DefaultListModel(items));
    }
    
    /**
     * Returns the index of the currently selected item. If the selection model does not specify a selection, a value of zero is
     * returned indicating the default (first) item of the SelectField is selected. If the model itself has no items, a value of -1
     * will be returned.
     * 
     * @return the index of the currently selected item
     */
    public int getSelectedIndex() {
        int selectedIndex = getSelectionModel().getMinSelectedIndex();
        if (selectedIndex == -1) {
            // Return -1 only if model is empty, otherwise return default selected index of 0.
            return getModel().size() > 0 ? 0 : -1;
        } else {
            return selectedIndex;
        }
    }
    
    /**
     * Returns the currently selected item. This is a convenience method that returns the item from the model whose index is
     * selected. If the selection model is empty, the default (item) of the SelectField is returned. If the model itself has not
     * item, null will be returned.
     * 
     * @return the currently selected item
     */
    public Object getSelectedItem() {
        int selectedIndex = getSelectionModel().getMinSelectedIndex();
        if (selectedIndex == -1) {
            return getModel().size() > 0 ? getModel().get(0): null;
        } else {
            return getModel().get(selectedIndex);
        }
    }
    
    /**
     * Sets the selected index.
     *
     * @param index the new selected index
     */
    public void setSelectedIndex(int index) {
        if (index == -1) {
            getSelectionModel().clearSelection();
        } else {
            getSelectionModel().setSelectedIndex(index, true);
        }
    }

    /**
     * Sets the selected item.
     * This is a convenience method.  It iterates the model and sets the
     * selected index to that of the first item that is found to test equal 
     * (using Object.equals()) to the specified item.
     *
     * @param item the new selected item
     */
    public void setSelectedItem(Object item) {
        if (item != null) {
            ListModel model = getModel();
            int size = model.size();
            for (int i = 0; i < size; i++) {
                if (item.equals(model.get(i))) {
                    setSelectedIndex(i);
                    return;
                }
            }
        }
        setSelectedIndex(-1);
    } 
}
