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

package nextapp.echo.app.text;

import java.io.Serializable;
import java.util.EventListener;

import nextapp.echo.app.event.DocumentEvent;
import nextapp.echo.app.event.DocumentListener;
import nextapp.echo.app.event.EventListenerList;

/**
 * An abstract implementation of a text component model.
 * Provides listener management and notification facilities.
 */
public abstract class AbstractDocument 
implements Document, Serializable {

    /**
     * A listener storage facility.
     */
    protected EventListenerList listenerList = new EventListenerList();

    /**
     * Default constructor.
     */
    public AbstractDocument() {
        super();
    }

    /**
     * Adds a listener which will be notified of changes to the document.
     *
     * @param l The listener to add.
     *
     * @see nextapp.echo.app.text.Document#addDocumentListener(DocumentListener)
     */
    public void addDocumentListener(DocumentListener l) {
        listenerList.addListener(DocumentListener.class, l);
    }
    
    /**
     * Notifies listeners about an update to the document.
     *
     * @param e An event describing the changes to the document.
     */
    public void fireDocumentUpdate(DocumentEvent e) {
        EventListener[] listeners = listenerList.getListeners(DocumentListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((DocumentListener) listeners[index]).documentUpdate(e);
        }
    }
    
    /**
     * Removes a listener from being notified of changes to the document.
     *
     * @param l The listener to remove.
     * 
     * @see nextapp.echo.app.text.Document#removeDocumentListener(DocumentListener)
     */
    public void removeDocumentListener(DocumentListener l) {
        listenerList.removeListener(DocumentListener.class, l);
    }
}
