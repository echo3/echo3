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

package nextapp.echo.testapp.interactive;

import java.util.EventListener;
import java.util.ResourceBundle;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Button;
import nextapp.echo.app.Extent;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.RowLayoutData;

/**
 * A generic modal dialog that displays a message.
 */
public class MessageDialog extends WindowPane {
    
    /**
     * Command provided in <code>ActionEvent</code>s when the user presses the 
     * 'cancel' or 'no' button.
     */
    public static final String COMMAND_CANCEL = "cancel";
    
    /**
     * Command provided in <code>ActionEvent</code>s when the user presses the 
     * 'ok' or 'yes' button.
     */
    public static final String COMMAND_OK = "ok";
    
    /**
     * Control configuration constant indicating that only an 'ok' button should
     * be displayed.
     */
    public static final int CONTROLS_OK = 1;
    
    /**
     * Control configuration constant indicating that only an 'yes' and 'no' 
     * buttons should be displayed.
     */
    public static final int CONTROLS_YES_NO = 2;
    
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

    private int controlConfiguration;
    private Row controlsRow;
    private ResourceBundle resourceBundle;

    private Label contentLabel;

    private Label iconLabel;

    /**
     * Creates a new <code>MessageDialog</code>.
     */
    public MessageDialog() {
        super();

        resourceBundle = ResourceBundle.getBundle(
                "nextapp.echo.testapp.interactive.resource.i18n.Messages",
                ApplicationInstance.getActive().getLocale());
        setWidth(new Extent(400, Extent.PX));
        setHeight(new Extent(300, Extent.PX));
        setMinimumHeight(new Extent(300, Extent.PX));
        setClosable(false);
        setMinimumWidth(new Extent(400, Extent.PX));
        setStyleName("Default");
        setModal(true);
        SplitPane splitPane1 = new SplitPane();
        splitPane1.setStyleName("ControlPane.Container.Bottom");
        add(splitPane1);
        controlsRow = new Row();
        controlsRow.setStyleName("ControlPane");
        splitPane1.add(controlsRow);
        Row row1 = new Row();
        row1.setInsets(new Insets(new Extent(20, Extent.PX)));
        row1.setCellSpacing(new Extent(20, Extent.PX));
        splitPane1.add(row1);
        iconLabel = new Label();
        iconLabel.setVisible(false);
        row1.add(iconLabel).setAlignment(new Alignment(Alignment.DEFAULT, Alignment.TOP));
        contentLabel = new Label();
        contentLabel.setStyleName("MessageDialog.ContentLabel");
        row1.add(contentLabel);
    }
    
    /**
     * Creates a new <code>MessageDialog</code>.
     * Icon is automatically set based on control configuration.
     * 
     * @param title the dialog title
     * @param message the message to display
     * @param controlConfiguration the control configuration, one of the 
     *        following values:
     *        <ul>
     *         <li><code>CONTROLS_OK</code></li>
     *         <li><code>CONTROLS_YES_NO</code></li>
     *        </ul>
     */
    public MessageDialog(String title, String message, int controlConfiguration) {
        this();
        setTitle(title);
        setMessage(message);
        switch (controlConfiguration) {
        case CONTROLS_OK:
            setMessageIcon(Styles.ICON_64_INFORMATION);
            break;
        case CONTROLS_YES_NO:
            setMessageIcon(Styles.ICON_64_QUESTION);
            break;
        }
        setControlConfiguration(controlConfiguration);
    }
    
    /**
     * Creates a new <code>MessageDialog</code>.
     * 
     * @param title the dialog title
     * @param message the message to display
     * @param controlConfiguration the control configuration, one of the 
     *        following values:
     *        <ul>
     *         <li><code>CONTROLS_OK</code></li>
     *         <li><code>CONTROLS_YES_NO</code></li>
     *        </ul>
     */
    public MessageDialog(String title, String message, ImageReference messageIcon, int controlConfiguration) {
        this();
        setTitle(title);
        setMessageIcon(messageIcon);
        setMessage(message);
        setControlConfiguration(controlConfiguration);
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
     * Returns the control configuration.
     * 
     * @return the control configuration, one of the following values:
     *         <ul>
     *          <li><code>CONTROLS_OK</code></li>
     *          <li><code>CONTROLS_YES_NO</code></li>
     *         </ul>
     */
    public int getControlConfiguration() {
        return controlConfiguration;
    }
    
    /**
     * Returns the displayed message.
     * 
     * @return the displayed message
     */
    public String getMessage() {
        return contentLabel.getText();
    }
    
    /**
     * Returns the displayed message icon.
     * 
     * @return the displayed message icon
     */
    public ImageReference getMessageIcon() {
        return iconLabel.getIcon();
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
    
    /**
     * Sets the control configuration.
     * 
     * @param newValue the new configuration, one of the following values:
     *        <ul>
     *         <li><code>CONTROLS_OK</code></li>
     *         <li><code>CONTROLS_YES_NO</code></li>
     *        </ul>
     */
    public void setControlConfiguration(int newValue) {
        controlConfiguration = newValue;
        controlsRow.removeAll();
        Button button;
        switch (controlConfiguration) {
        case CONTROLS_OK:
            button = new Button(resourceBundle.getString("Generic.Ok"), Styles.ICON_24_YES);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_OK);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            break;
        case CONTROLS_YES_NO:
            button = new Button(resourceBundle.getString("Generic.Yes"), Styles.ICON_24_YES);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_OK);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            button = new Button(resourceBundle.getString("Generic.No"), Styles.ICON_24_NO);
            button.setStyleName("ControlPane.Button");
            button.setActionCommand(COMMAND_CANCEL);
            button.addActionListener(actionProcessor);
            controlsRow.add(button);
            break;
        }
    }

    /**
     * Sets the displayed message.
     * 
     * @param message the displayed message text.
     */
    public void setMessage(String message) {
        contentLabel.setText(message);
    }

    /**
     * Sets the displayed message icon.
     * 
     * @param message the displayed message icon.
     */
    public void setMessageIcon(ImageReference messageIcon) {
        iconLabel.setIcon(messageIcon);
        iconLabel.setVisible(messageIcon != null);
    }
}
