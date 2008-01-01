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
import java.util.EventListener;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.app.event.ListDataEvent;
import nextapp.echo.app.event.ListDataListener;

/**
 * A base class from which <code>ListModel</code> implementations may be 
 * derived.  This class provides event listener management facilities.
 */
public abstract class AbstractListModel 
implements ListModel, Serializable {

    /**
     * A storage facility for <code>EventListener</code>s.
     */
    private EventListenerList listenerList = new EventListenerList();
 
    /**
     * Creates a new AbstractListModel.
     */
    public AbstractListModel() {
        super();
    }
 
    /**
     * @see nextapp.echo.app.list.ListModel#addListDataListener(nextapp.echo.app.event.ListDataListener)
     */
    public void addListDataListener(ListDataListener l) {
        listenerList.addListener(ListDataListener.class, l);
    }
    
    /**
     * Returns the <code>EventListenerList</code> being used to manage event 
     * listeners.
     * 
     * @return the listener list
     */
    protected EventListenerList getEventListenerList() {
        return listenerList;
    }

    /**
     * Notifies listeners that the contents of the list have changed.
     * Subclasses <strong>must</strong> call this method 
     * after one or elements are changed.
     * 
     * @param index0 the index of the first changed item
     * @param index1 the index of the last changed item 
     */ 
    protected void fireContentsChanged(int index0, int index1) {
        ListDataEvent e = new ListDataEvent(this, ListDataEvent.CONTENTS_CHANGED, index0, index1);

        EventListener[] listeners = listenerList.getListeners(ListDataListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ListDataListener) listeners[index]).contentsChanged(e);
        }
    }

    /**
     * Notifies listeners that an interval of items was added.
     * Subclasses <strong>must</strong> call this method 
     * after one or elements are added.
     * 
     * @param index0 the index of the first added item
     * @param index1 the index of the last added item
     */ 
    protected void fireIntervalAdded(int index0, int index1) {
        ListDataEvent e = new ListDataEvent(this, ListDataEvent.INTERVAL_ADDED, index0, index1);

        EventListener[] listeners = listenerList.getListeners(ListDataListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ListDataListener) listeners[index]).intervalAdded(e);
        }
    }
    
    /**
     * Notifies listeners that an interval of items was removed.
     * Subclasses <strong>must</strong> call this method 
     * after one or elements are removed.
     * 
     * @param index0 the index of the first removed index
     * @param index1 the index of the last removed index 
     */
    protected void fireIntervalRemoved(int index0, int index1) {
        ListDataEvent e = new ListDataEvent(this, ListDataEvent.INTERVAL_REMOVED, index0, index1);

        EventListener[] listeners = listenerList.getListeners(ListDataListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ListDataListener) listeners[index]).intervalRemoved(e);
        }
    }

    /**
     * @see nextapp.echo.app.list.ListModel#removeListDataListener(nextapp.echo.app.event.ListDataListener)
     */
    public void removeListDataListener(ListDataListener l) {
        listenerList.removeListener(ListDataListener.class, l);
    }
}
