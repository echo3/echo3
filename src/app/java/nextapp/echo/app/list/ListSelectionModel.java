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

package nextapp.echo.app.list;

import java.io.Serializable;

import nextapp.echo.app.event.ChangeListener;

/**
 * A representation of the selected items in a list component.
 */
public interface ListSelectionModel 
extends Serializable {

    public static final int SINGLE_SELECTION = 0;
    public static final int MULTIPLE_SELECTION = 2;
    
    /**
     * Adds a <code>ChangeListenerb</code> to the selection model, which will
     * be notified when the selection changes.
     *
     * @param l the <code>ChangeListener</code> to add
     */
    public void addChangeListener(ChangeListener l);
    
    /**
     * Deselects all items.
     */
    public void clearSelection();
    
    /**
     * Returns the maximum selected index.
     * Returns -1 when no items are selected.
     *
     * @return the maximum selected index
     */
    public int getMaxSelectedIndex();
    
    /**
     * Returns the minimum selected index.
     * Returns -1 when no items are selected.
     *
     * @return the minimum selected index
     */
    public int getMinSelectedIndex();
    
    /**
     * Returns the selection mode.  
     * 
     * @return the selection mode, one of the following values:
     *         <ul>
     *          <li><code>ListSelectionModel.SINGLE_SELECTION</code>: only 
     *          one list element may be selected.</li>
     *          <li><code>ListSelectionModel.MULTIPLE_SELECTION</code>: 
     *          multiple list elements may be selected.</li>
     *         </ul>
     */
    public int getSelectionMode();

    /**
     * Determines whether an index is selected.
     *
     * @param index the index
     * @return true if the index is selected
     */
    public boolean isSelectedIndex(int index);
    
    /**
     * Determines if no items are selected.
     *
     * @return true if no items are selected
     */
    public boolean isSelectionEmpty();
        
    /**
     * Removes a <code>ChangeListener</code> from being notified of when the
     * selection changes.
     *
     * @param l the <code>ChangeListener</code> to remove
     */
    public void removeChangeListener(ChangeListener l);
    
    /**
     * Sets the selection state of the given index.
     *
     * @param index the index
     * @param selected the new selection state
     */
    public void setSelectedIndex(int index, boolean selected);
    
    /**
     * Sets the selection mode.  
     * 
     * @param selectionMode the selection mode, one of the following values:
     *        <ul>
     *         <li><code>ListSelectionModel.SINGLE_SELECTION</code>: only one list element 
     *         may be selected.</li>
     *         <li><code>ListSelectionModel.MULTIPLE_SELECTION</code>: multiple list elements
     *         may be selected.</li>
     *        </ul>
     */
    public void setSelectionMode(int selectionMode);
}
