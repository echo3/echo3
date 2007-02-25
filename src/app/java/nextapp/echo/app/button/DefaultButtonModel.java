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

package nextapp.echo.app.button;

import java.util.EventListener;

import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.EventListenerList;

/**
 * Default <code>ButtonModel</code> implementation.
 */
public class DefaultButtonModel 
implements ButtonModel {
    
    private EventListenerList listenerList = new EventListenerList();
    private String actionCommand;

    /**
     * @see nextapp.echo.app.button.ButtonModel#addActionListener(nextapp.echo.app.event.ActionListener)
     */
    public void addActionListener(ActionListener l) {
        listenerList.addListener(ActionListener.class, l);
    }
    
    /**
     * @see nextapp.echo.app.button.ButtonModel#doAction()
     */
    public void doAction() {
        fireActionPerformed(new ActionEvent(this, getActionCommand()));
    }

    /**
     * Notifies registered <code>ActionListener</code>s of an 
     * <code>ActionEvent</code>.
     *
     * @param e The <code>ActionEvent</code> to send.
     */
    public void fireActionPerformed(ActionEvent e) {
        EventListener[] listeners = listenerList.getListeners(ActionListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ActionListener) listeners[index]).actionPerformed(e);
        }
    }
    
    /**
     * @see nextapp.echo.app.button.ButtonModel#getActionCommand()
     */
    public String getActionCommand() {
        return actionCommand;
    }
    
    /**
     * Returns the local <code>EventListenerList</code>.
     * 
     * @return the listener list
     */
    protected EventListenerList getEventListenerList() {
        return listenerList;
    }
    
    /**
     * @see nextapp.echo.app.button.ButtonModel#removeActionListener(nextapp.echo.app.event.ActionListener)
     */
    public void removeActionListener(ActionListener l) {
        listenerList.removeListener(ActionListener.class, l);
    }
    
    /**
     * @see nextapp.echo.app.button.ButtonModel#setActionCommand(java.lang.String)
     */
    public void setActionCommand(String actionCommand) {
        this.actionCommand = actionCommand;
    }
}
