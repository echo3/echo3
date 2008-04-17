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

package chatclient;

import java.util.EventListener;

import nextapp.echo.app.Button;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * A generic modal dialog that displays a message.
 */
public class MessageDialog extends WindowPane {

    public static final int TYPE_ERROR = 1;    
    public static final int TYPE_CONFIRM = 1;    
    
    public static final int CONTROLS_OK = 1;
    public static final int CONTROLS_YES_NO = 2;
    
    public static final String COMMAND_OK = "ok";
    public static final String COMMAND_CANCEL = "cancel";
    
    private ActionListener actionProcessor = new ActionListener() {

        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent e) {
            getParent().remove(MessageDialog.this);
            EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
            ActionEvent outgoingEvent = new ActionEvent(this, e.getActionCommand());
            for (int i = 0; i < listeners.length; ++i) {
                ((ActionListener) listeners[i]).actionPerformed(outgoingEvent);
            }
        }
    };
    
    /**
     * Creates a new <code>MessageDialog</code>.
     * 
     * @param title the dialog title
     * @param message the message to display
     * @param type the type of dialog, one of the following values:
     *        <ul>
     *         <li><code>TYPE_ERROR</code></li>
     *         <li><code>TYPE_CONFIRM</code></li>
     *        </ul>
     * @param controlConfiguration the control configuration, one of the 
     *        following values:
     *        <ul>
     *         <li><code>CONTROLS_OK</code></li>
     *         <li><code>CONTROLS_YES_NO</code></li>
     *        </ul>
     */
    public MessageDialog(String title, String message, int type, int controlConfiguration) {
        super(title, new Extent(320), new Extent(240));
        setStyleName("Default");
        setClosable(false);
        setModal(true);

        SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP, new Extent(32));
        add(splitPane);
        
        Row controlsRow = new Row();
        controlsRow.setStyleName("ControlPane");
        splitPane.add(controlsRow);

        Button button;
        switch (controlConfiguration) {
        case CONTROLS_OK:
            button = new Button(Messages.getString("Generic.Ok"), Styles.ICON_24_YES);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_OK);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            break;
        case CONTROLS_YES_NO:
            button = new Button(Messages.getString("Generic.Yes"), Styles.ICON_24_YES);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_OK);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            button = new Button(Messages.getString("Generic.No"), Styles.ICON_24_NO);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_CANCEL);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            break;
        }
        
        Label contentLabel = new Label(message);
        contentLabel.setStyleName("MessageDialog.ContentLabel");
        splitPane.add(contentLabel);
        
        setModal(true);
    }
    
    /**
     * Adds an <code>ActionListener</code> to receive notification when the
     * user selects a choice.  The fired <code>command</code> of the fired 
     * <code>ActionEvent</code> will contain be one of the 
     * <code>COMMAND_XXX</code> constants.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
    }
    
    /**
     * Removes an <code>ActionListener</code> from receiving notification 
     * when the user selects a choice.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        getEventListenerList().removeListener(ActionListener.class, l);
    }
}
