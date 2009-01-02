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

import nextapp.echo.app.button.ButtonGroup;
import nextapp.echo.app.button.ButtonModel;
import nextapp.echo.app.button.DefaultToggleButtonModel;
import nextapp.echo.app.button.ToggleButton;
import nextapp.echo.app.button.ToggleButtonModel;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;

/**
 * A radio button implementation.
 */
public class RadioButton extends ToggleButton {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final String BUTTON_GROUP_CHANGED_PROPERTY = "buttonGroup";
    
    /**
     * Monitors state changes to enforce <code>ButtonGroup</code> behavior.
     */
    private ChangeListener changeMonitor = new ChangeListener() {

        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            if (buttonGroup != null) {
                buttonGroup.updateSelection(RadioButton.this);
            }
        }
    };

    private ButtonGroup buttonGroup;

    /**
     * Creates a radio button with no text or icon.
     */
    public RadioButton() {
        this(null, null);
    }
    
    /**
     * Creates a radio button with text.
     *
     * @param text the text to be displayed in the radio button
     */
    public RadioButton(String text) {
        this(text, null);
    }
    
    /**
     * Creates a radio button with an icon.
     *
     * @param icon the icon to be displayed in the radio button
     */
    public RadioButton(ImageReference icon) {
        this(null, icon);
    }

    /**
     * Creates a radio button with text and an icon.
     *
     * @param text the text to be displayed in the radio button
     * @param icon the icon to be displayed in the radio button
     */
    public RadioButton(String text, ImageReference icon) {
        super();
        
        setModel(new DefaultToggleButtonModel());
    
        setIcon(icon);
        setText(text);
    }
    
    /**
     * Retrieves the <code>ButtonGroup</code> to which this 
     * <code>RadioButton</code> belongs.
     * Only one radio button in a group may be selected at a time.
     * 
     * @return the button group
     */
    public ButtonGroup getGroup() {
        return buttonGroup;
    }
    
    /**
     * Sets the <code>ButtonGroup</code> to which this
     * <code>RadioButton</code> belongs.
     * Only one radio button in a group may be selected at a time.
     * 
     * @param newValue the new button group
     */
    public void setGroup(ButtonGroup newValue) {
        ButtonGroup oldValue = buttonGroup;
        buttonGroup = newValue;
        
        if (oldValue != null) {
            oldValue.removeButton(this);
        }
        if (newValue != null) {
            newValue.addButton(this);
        }
        
        firePropertyChange(BUTTON_GROUP_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * @see nextapp.echo.app.button.AbstractButton#setModel(nextapp.echo.app.button.ButtonModel)
     */
    public void setModel(ButtonModel newValue) {
        ButtonModel oldValue = getModel();
        super.setModel(newValue);
        if (oldValue != null) {
            ((ToggleButtonModel) oldValue).removeChangeListener(changeMonitor);
        }
        ((ToggleButtonModel) newValue).addChangeListener(changeMonitor);
        if (buttonGroup != null) {
            buttonGroup.updateSelection(this);
        }
    }
}
