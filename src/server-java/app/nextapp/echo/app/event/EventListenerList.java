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

package nextapp.echo.app.event;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.EventListener;

/**
 * A generic storage facility for listeners.
 */
public class EventListenerList
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private static final Object[] EMPTY = new Object[0];
    private static final EventListener[] NO_LISTENERS = new EventListener[0];
    
    /**
     * The number of empty slots that should be added when all available 
     * slots are filled and more are required.
     */
    private static final int INCREMENT = 3;
    
    /**
     * The number of empty slots available before the storage array should
     * be trimmed.
     */
    private static final int DECREMENT = 5;

    private transient Object[] listeners = EMPTY;
    private transient int size = 0;
    
    /**
     * Creates a new listener list.
     */
    public EventListenerList() {
        super();
    }
    
    /**
     * Adds a listener of the given class to the list.
     *
     * @param listenerClass the <code>Class</code> of the listener being added
     * @param l the listener to add
     */
    public void addListener(Class listenerClass, EventListener l) {
        if (size * 2 == listeners.length) {
            // Expand storage array if necessary.
            Object[] newListeners = new Object[listeners.length + INCREMENT * 2];
            System.arraycopy(listeners, 0, newListeners, 0, listeners.length);
            listeners = newListeners;
        }
        
        listeners[size * 2] = listenerClass;
        listeners[size * 2 + 1] = l;
        ++size;
    }
    
    /**
     * Returns the number of listeners present of the given class.
     *
     * @param listenerClass the <code>Class</code> of the listener for which
     *        the listener count is desired
     * @return the number of listeners present for the specified listener 
     *         <code>Class</code>
     */
    public int getListenerCount(Class listenerClass) {
        int count = 0;
        for (int index = 0; index < size; ++index) {
            if (listeners[index * 2] == listenerClass) {
                ++count;
            }
        }
        return count;
    }
    
    /**
     * Returns an array of listeners of the given class.
     *
     * @param listenerClass the desired <code>Class</code> of listener
     * @return an array of listeners of the given <code>Class</code>
     *         (if no listeners of the specified class exist, an empty 
     *         array is returned)
     */
    public EventListener[] getListeners(Class listenerClass) {
        int listenerCount = getListenerCount(listenerClass);
        if (listenerCount == 0) {
            return NO_LISTENERS;
        } else {
            EventListener[] matchingListeners = new EventListener[listenerCount];
            int matchIndex = 0;
            for (int index = 0; index < size; ++index) {
                if (listeners[index * 2] == listenerClass) {
                    matchingListeners[matchIndex++] = (EventListener) listeners[index * 2 + 1];
                }
            }
            return matchingListeners;
        }
    }
    
    /**
     * @see java.io.Serializable
     */
    private void readObject(ObjectInputStream in) 
    throws ClassNotFoundException, IOException {
        in.defaultReadObject();
        listeners = EMPTY;
        size = 0;
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Object listenerClassName = in.readObject();
        while (listenerClassName != null) {
            EventListener listener = (EventListener) in.readObject();
            addListener(Class.forName((String) listenerClassName, true, classLoader), listener);
            listenerClassName = in.readObject();
        }
    }
    
    /**
     * Removes a listener of the given class from the list.
     *
     * @param listenerClass the <code>Class</code> of the listener being 
     *        removed
     * @param l the listener to remove
     */
    public void removeListener(Class listenerClass, EventListener l) {
        for (int index = 0; index < size; ++index) {
            if (listeners[index * 2] == listenerClass && listeners[index * 2 + 1] == l) {
                // Last listener replaces current listener.
                listeners[index * 2] = listeners[(size - 1) * 2];
                listeners[index * 2 + 1] = listeners[(size - 1) * 2 + 1];
                --size;
                break;
            }
        }
        
        // Reduce list size if necessary.
        if (size == 0) {
            listeners = EMPTY;
        } else if (listeners.length / 2 - size > DECREMENT) {
            // more than DECREMENT empty slots exist: trim to size.
            Object[] newListeners = new Object[size * 2];
            System.arraycopy(listeners, 0, newListeners, 0, newListeners.length);
            listeners = newListeners;
        }
    }
    
    /**
     * @see java.io.Serializable
     */
    private void writeObject(ObjectOutputStream out) 
    throws IOException {
        out.defaultWriteObject();
        for (int index = 0; index < size; ++index) {
            String listenerClassName = ((Class) listeners[index * 2]).getName();
            EventListener listener = (EventListener) listeners[index * 2 + 1];
            if (listener instanceof Serializable) {
                out.writeObject(listenerClassName);
                out.writeObject(listener);
            }
        }
        out.writeObject(null); // Note end of listener list.
    }
}
