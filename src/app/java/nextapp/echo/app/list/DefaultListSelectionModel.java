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
import java.util.BitSet;
import java.util.EventListener;

import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.event.EventListenerList;

/**
 * Default <code>ListSelectionModel</code> implementation.
 */
public class DefaultListSelectionModel 
implements ListSelectionModel, Serializable {

    private EventListenerList listenerList = new EventListenerList();
    private int selectionMode = SINGLE_SELECTION;
    private BitSet selection = new BitSet();
    private int minSelectedIndex = -1;
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#addChangeListener(
     *      nextapp.echo.app.event.ChangeListener)
     */
    public void addChangeListener(ChangeListener l) {
        listenerList.addListener(ChangeListener.class, l);
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#clearSelection()
     */
    public void clearSelection() {
        selection = new BitSet();
        minSelectedIndex = -1;
        fireValueChanged();
    }
    
    /**
     * Notifies <code>ChangeListener</code>s that the selection has 
     * changed.
     */
    protected void fireValueChanged() {
        ChangeEvent e = new ChangeEvent(this);
        EventListener[] listeners = listenerList.getListeners(ChangeListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ChangeListener) listeners[index]).stateChanged(e);
        }
    }
        
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#getMaxSelectedIndex()
     */
    public int getMaxSelectedIndex() {
        return selection.length() - 1;
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#getMinSelectedIndex()
     */
    public int getMinSelectedIndex() {
        return minSelectedIndex;
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#getSelectionMode()
     */
    public int getSelectionMode() {
        return selectionMode;
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#isSelectedIndex(int)
     */
    public boolean isSelectedIndex(int index) {
        return selection.get(index);
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#isSelectionEmpty()
     */
    public boolean isSelectionEmpty() {
        return selection.length() == 0;
    }
    
    /**
     * @see nextapp.echo.app.list.ListSelectionModel#removeChangeListener(nextapp.echo.app.event.ChangeListener)
     */
    public void removeChangeListener(ChangeListener l) {
        listenerList.removeListener(ChangeListener.class, l);
    }

    /**
     * @see nextapp.echo.app.list.ListSelectionModel#setSelectedIndex(int, boolean)
     */
    public void setSelectedIndex(int index, boolean newValue) {
        boolean oldValue = isSelectedIndex(index);
    
        if (newValue ^ oldValue) {
            if (newValue) {
                if (selectionMode == SINGLE_SELECTION && getMinSelectedIndex() != -1) {
                    setSelectedIndex(getMinSelectedIndex(), false);
                }
                selection.set(index);
                if (index < minSelectedIndex || minSelectedIndex == -1) {
                    minSelectedIndex = index;
                }
            } else {
                selection.clear(index);
                if (index == minSelectedIndex) {
                    // Minimum selected index has been deselected, find new minimum selected index.
                    int max = getMaxSelectedIndex();
                    minSelectedIndex = -1;
                    for (int i = 0; i <= max; ++i) {
                        if (selection.get(i)) {
                            minSelectedIndex = i;
                            break;
                        }
                    }
                }
            }
            fireValueChanged();
        }
    }

    /**
     * @see nextapp.echo.app.list.ListSelectionModel#setSelectionMode(int)
     */
    public void setSelectionMode(int selectionMode) {
        if (selectionMode != MULTIPLE_SELECTION && this.selectionMode == MULTIPLE_SELECTION) {
            // deselect all but first selected element.
            int maxSelectedIndex = getMaxSelectedIndex();
            for (int i = minSelectedIndex + 1; i <= maxSelectedIndex; ++i) {
                setSelectedIndex(i, false);
            }
        }
        this.selectionMode = selectionMode;
        fireValueChanged();
    }
}
