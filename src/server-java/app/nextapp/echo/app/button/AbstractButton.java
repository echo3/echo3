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

package nextapp.echo.app.button;

import java.util.EventListener;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * An abstract base class for button components.  Provides basic properties, a
 * model, and event handling facilities.
 */
public abstract class AbstractButton extends Component {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final String INPUT_ACTION = "action";
    
    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BACKGROUND_IMAGE = "disabledBackgroundImage";
    public static final String PROPERTY_DISABLED_BORDER = "disabledBorder";
    public static final String PROPERTY_DISABLED_FONT = "disabledFont";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_DISABLED_ICON = "disabledIcon";
    public static final String PROPERTY_FOCUSED_BACKGROUND = "focusedBackground";
    public static final String PROPERTY_FOCUSED_BACKGROUND_IMAGE = "focusedBackgroundImage";
    public static final String PROPERTY_FOCUSED_BORDER = "focusedBorder";
    public static final String PROPERTY_FOCUSED_ENABLED = "focusedEnabled";
    public static final String PROPERTY_FOCUSED_FONT = "focusedFont";
    public static final String PROPERTY_FOCUSED_FOREGROUND = "focusedForeground";
    public static final String PROPERTY_FOCUSED_ICON = "focusedIcon";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_ICON = "icon";
    public static final String PROPERTY_ALIGNMENT = "alignment";
    public static final String PROPERTY_ICON_TEXT_MARGIN = "iconTextMargin";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_LINE_WRAP = "lineWrap";
    public static final String PROPERTY_MODEL = "model";
    public static final String PROPERTY_PRESSED_BACKGROUND = "pressedBackground";
    public static final String PROPERTY_PRESSED_BACKGROUND_IMAGE = "pressedBackgroundImage";
    public static final String PROPERTY_PRESSED_BORDER = "pressedBorder";
    public static final String PROPERTY_PRESSED_ENABLED = "pressedEnabled";
    public static final String PROPERTY_PRESSED_FONT = "pressedFont";
    public static final String PROPERTY_PRESSED_FOREGROUND = "pressedForeground";
    public static final String PROPERTY_PRESSED_ICON = "pressedIcon";
    public static final String PROPERTY_ROLLOVER_BACKGROUND = "rolloverBackground";
    public static final String PROPERTY_ROLLOVER_BACKGROUND_IMAGE = "rolloverBackgroundImage";
    public static final String PROPERTY_ROLLOVER_BORDER = "rolloverBorder";
    public static final String PROPERTY_ROLLOVER_ENABLED = "rolloverEnabled";
    public static final String PROPERTY_ROLLOVER_FONT = "rolloverFont";
    public static final String PROPERTY_ROLLOVER_FOREGROUND = "rolloverForeground";
    public static final String PROPERTY_ROLLOVER_ICON = "rolloverIcon";
    public static final String PROPERTY_TEXT = "text";
    public static final String PROPERTY_TEXT_ALIGNMENT = "textAlignment";
    public static final String PROPERTY_TEXT_POSITION = "textPosition";
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";
    public static final String PROPERTY_WIDTH = "width";

    /**
     * Forwards events generated by the model to listeners registered with the
     * component instance.
     */
    private ActionListener actionForwarder = new ActionListener() {

        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent modelEvent) {
            ActionEvent buttonEvent = new ActionEvent(AbstractButton.this, modelEvent.getActionCommand());
            fireActionPerformed(buttonEvent);
        }
    };
    
    /**
     * Adds an <code>ActionListener</code> to receive notification of user
     * actions, i.e., button presses.
     * 
     * @param l the listener to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }

    /**
     * Programmatically performs a click/activation of the button.
     */
    public void doAction() {
        getModel().doAction();
    }

    /**
     * Notifies all listeners that have registered for this event type.
     * 
     * @param e the <code>ActionEvent</code> to send
     */
    public void fireActionPerformed(ActionEvent e) {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ActionListener) listeners[index]).actionPerformed(e);
        }
    }

    /**
     * Retrieves the action command from the <code>ButtonModel</code>.
     * 
     * @return the action command
     * @see nextapp.echo.app.button.ButtonModel#getActionCommand()
     */
    public String getActionCommand() {
        return getModel().getActionCommand();
    }
    
    /**
     * Returns the alignment of the button's content.
     * Only horizontal alignments are supported.
     * 
     * @return the alignment
     */
    public Alignment getAlignment() {
        return (Alignment) get(PROPERTY_ALIGNMENT);
    }

    /**
     * Returns the background image of the button.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed around the button.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the background color of the button when the button is disabled.
     * 
     * @return the color
     */
    public Color getDisabledBackground() {
        return (Color) get(PROPERTY_DISABLED_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the button is disabled. 
     * 
     * @return the background image
     */
    public FillImage getDisabledBackgroundImage() {
        return (FillImage) get(PROPERTY_DISABLED_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed around the button when the button is
     * disabled.
     * 
     * @return the border
     */
    public Border getDisabledBorder() {
        return (Border) get(PROPERTY_DISABLED_BORDER);
    }

    /**
     * Returns the font of the button when the button is disabled.
     * 
     * @return the font
     */
    public Font getDisabledFont() {
        return (Font) get(PROPERTY_DISABLED_FONT);
    }

    /**
     * Returns the foreground color of the button when the button is disabled.
     * 
     * @return the color
     */
    public Color getDisabledForeground() {
        return (Color) get(PROPERTY_DISABLED_FOREGROUND);
    }

    /**
     * Returns the icon of the button that is displayed when the button is
     * disabled.
     * 
     * @return the icon
     */
    public ImageReference getDisabledIcon() {
        return (ImageReference) get(PROPERTY_DISABLED_ICON);
    }

    /**
     * Returns the background color of the button when the button is focused.
     * 
     * @return the color
     */
    public Color getFocusedBackground() {
        return (Color) get(PROPERTY_FOCUSED_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the button is focused. 
     * 
     * @return the background image
     */
    public FillImage getFocusedBackgroundImage() {
        return (FillImage) get(PROPERTY_FOCUSED_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed around the button when the button is
     * focused.
     * 
     * @return the border
     */
    public Border getFocusedBorder() {
        return (Border) get(PROPERTY_FOCUSED_BORDER);
    }

    /**
     * Returns the font of the button when the button is focused.
     * 
     * @return the font
     */
    public Font getFocusedFont() {
        return (Font) get(PROPERTY_FOCUSED_FONT);
    }

    /**
     * Returns the foreground color of the button when the button is focused.
     * 
     * @return the color
     */
    public Color getFocusedForeground() {
        return (Color) get(PROPERTY_FOCUSED_FOREGROUND);
    }

    /**
     * Returns the icon of the button that is displayed when the button is
     * focused.
     * 
     * @return the icon
     */
    public ImageReference getFocusedIcon() {
        return (ImageReference) get(PROPERTY_FOCUSED_ICON);
    }

    /**
     * Returns the height of the button.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }

    /**
     * Returns the icon displayed in the button.
     * 
     * @return the icon
     */
    public ImageReference getIcon() {
        return (ImageReference) get(PROPERTY_ICON);
    }

    /**
     * Returns the margin size between the icon and the text.
     * The margin will only be displayed if the button has both
     * icon and text properties set.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the margin size 
     */
    public Extent getIconTextMargin() {
        return (Extent) get(PROPERTY_ICON_TEXT_MARGIN);
    }
    
    /**
     * Returns the margin between the buttons edge and its content.
     * 
     * @return the margin
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }

    /**
     * Returns the model that this button represents.
     * 
     * @return the model
     */
    public ButtonModel getModel() {
        return (ButtonModel) get(PROPERTY_MODEL);
    }

    /**
     * Returns the background color of the button when the button is pressed.
     * 
     * @return the color
     */
    public Color getPressedBackground() {
        return (Color) get(PROPERTY_PRESSED_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the button is pressed. 
     * 
     * @return the background image
     */
    public FillImage getPressedBackgroundImage() {
        return (FillImage) get(PROPERTY_PRESSED_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed around the button when the button is
     * pressed.
     * 
     * @return the border
     */
    public Border getPressedBorder() {
        return (Border) get(PROPERTY_PRESSED_BORDER);
    }

    /**
     * Returns the font of the button when the button is pressed.
     * 
     * @return the font
     */
    public Font getPressedFont() {
        return (Font) get(PROPERTY_PRESSED_FONT);
    }

    /**
     * Returns the foreground color of the button when the button is pressed.
     * 
     * @return the color
     */
    public Color getPressedForeground() {
        return (Color) get(PROPERTY_PRESSED_FOREGROUND);
    }

    /**
     * Returns the icon of the button that is displayed when the button is
     * pressed.
     * 
     * @return the icon
     */
    public ImageReference getPressedIcon() {
        return (ImageReference) get(PROPERTY_PRESSED_ICON);
    }

    /**
     * Returns the background color of the button when the mouse cursor is
     * inside its bounds.
     * 
     * @return the color
     */
    public Color getRolloverBackground() {
        return (Color) get(PROPERTY_ROLLOVER_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the mouse cursor is inside
     * the button's bounds. 
     * 
     * @return the background image
     */
    public FillImage getRolloverBackgroundImage() {
        return (FillImage) get(PROPERTY_ROLLOVER_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed around the button when the mouse cursor is
     * inside its bounds.
     * 
     * @return the border
     */
    public Border getRolloverBorder() {
        return (Border) get(PROPERTY_ROLLOVER_BORDER);
    }

    /**
     * Returns the font of the button when the mouse cursor is inside its
     * bounds.
     * 
     * @return the font
     */
    public Font getRolloverFont() {
        return (Font) get(PROPERTY_ROLLOVER_FONT);
    }

    /**
     * Returns the foreground color of the button when the mouse cursor is
     * inside its bounds.
     * 
     * @return the color
     */
    public Color getRolloverForeground() {
        return (Color) get(PROPERTY_ROLLOVER_FOREGROUND);
    }

    /**
     * Returns the icon of the button that is displayed when the mouse cursor is
     * inside its bounds.
     * 
     * @return the icon
     */
    public ImageReference getRolloverIcon() {
        return (ImageReference) get(PROPERTY_ROLLOVER_ICON);
    }

    /**
     * Returns the text label of the button.
     * 
     * @return the text label
     */
    public String getText() {
        return (String) get(PROPERTY_TEXT);
    }

    /**
     * Returns the alignment of the text relative to the icon.
     * 
     * @return the text alignment
     */
    public Alignment getTextAlignment() {
        return (Alignment) get(PROPERTY_TEXT_ALIGNMENT);
    }

    /**
     * Returns the position of the text relative to the icon.
     * 
     * @return the text position
     */
    public Alignment getTextPosition() {
        return (Alignment) get(PROPERTY_TEXT_POSITION);
    }
    
    /**
     * Returns the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @return the tool tip text
     */
    public String getToolTipText() {
        return (String) get(PROPERTY_TOOL_TIP_TEXT);
    }
    
    /**
     * Returns the width of the button.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
    }

    /**
     * Determines if the button has any <code>ActionListener</code>s 
     * registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
    
    /**
     * Determines if focused effects are enabled.
     * 
     * @return true if focused effects are enabled
     * @see #setFocusedEnabled(boolean)
     */
    public boolean isFocusedEnabled() {
        Boolean value = (Boolean) get(PROPERTY_PRESSED_ENABLED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * Determines if the text of the button should wrap in the event that 
     * horizontal space is limited.  Default value is true.
     * 
     * @return the line wrap state
     */
    public boolean isLineWrap() {
        Boolean value = (Boolean) get(PROPERTY_LINE_WRAP);
        return value == null ? true : value.booleanValue();
    }
    
    /**
     * Determines if pressed effects are enabled.
     * 
     * @return true if pressed effects are enabled
     * @see #setPressedEnabled(boolean)
     */
    public boolean isPressedEnabled() {
        Boolean value = (Boolean) get(PROPERTY_PRESSED_ENABLED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * Determines if rollover effects are enabled.
     * 
     * @return true if rollover effects are enabled
     * @see #setRolloverEnabled(boolean)
     */
    public boolean isRolloverEnabled() {
        Boolean value = (Boolean) get(PROPERTY_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * This component does not support children.
     * 
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component component) {
        return false;
    }

    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String name, Object value) {
        super.processInput(name, value);
        if (INPUT_ACTION.equals(name)) {
            doAction();
        }
    }

    /**
     * Removes an <code>ActionListener</code> from being notified of user
     * actions, i.e., button presses.
     * 
     * @param l the listener to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }

    /**
     * Sets the action command of the <code>ButtonModel</code>.
     * 
     * @param newValue the action command
     * @see nextapp.echo.app.button.ButtonModel#setActionCommand(java.lang.String)
     */
    public void setActionCommand(String newValue) {
        getModel().setActionCommand(newValue);
    }
    
    /**
     * Sets the alignment of the button's content.
     * Only horizontal alignments are supported.
     * 
     * @param newValue the new alignment
     */
    public void setAlignment(Alignment newValue) {
        set(PROPERTY_ALIGNMENT, newValue);
    }

    /**
     * Sets the background image of the button.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed around the button.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }

    /**
     * Sets the background color of the button when the button is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledBackground(Color newValue) {
        set(PROPERTY_DISABLED_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the button is disabled.
     * 
     * @param newValue the new background image
     */
    public void setDisabledBackgroundImage(FillImage newValue) {
        set(PROPERTY_DISABLED_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed around the button when the button is disabled.
     * 
     * @param newValue the new border
     */
    public void setDisabledBorder(Border newValue) {
        set(PROPERTY_DISABLED_BORDER, newValue);
    }

    /**
     * Sets the font of the button when the button is disabled.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setDisabledFont(Font newValue) {
        set(PROPERTY_DISABLED_FONT, newValue);
    }

    /**
     * Sets the foreground color of the button when the button is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledForeground(Color newValue) {
        set(PROPERTY_DISABLED_FOREGROUND, newValue);
    }

    /**
     * Sets the icon of the button that is displayed when the button is 
     * disabled.
     * 
     * @param newValue the new icon
     */
    public void setDisabledIcon(ImageReference newValue) {
        set(PROPERTY_DISABLED_ICON, newValue);
    }

    /**
     * Sets the background color of the button when the button is focused.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setFocusedBackground(Color newValue) {
        set(PROPERTY_FOCUSED_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the button is focused.
     * 
     * @param newValue the new background image
     */
    public void setFocusedBackgroundImage(FillImage newValue) {
        set(PROPERTY_FOCUSED_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed around the button when the button is focused.
     * 
     * @param newValue the new border
     */
    public void setFocusedBorder(Border newValue) {
        set(PROPERTY_FOCUSED_BORDER, newValue);
    }

    /**
     * Sets whether focused effects are enabled when the button is focused. 
     * Focused properties have no effect unless this
     * property is set to true. The default value is false.
     * 
     * @param newValue true if focused effects should be enabled
     */
    public void setFocusedEnabled(boolean newValue) {
        set(PROPERTY_FOCUSED_ENABLED, new Boolean(newValue));
    }

    /**
     * Sets the font of the button when the button is focused.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setFocusedFont(Font newValue) {
        set(PROPERTY_FOCUSED_FONT, newValue);
    }

    /**
     * Sets the foreground color of the button when the button is focused.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setFocusedForeground(Color newValue) {
        set(PROPERTY_FOCUSED_FOREGROUND, newValue);
    }

    /**
     * Sets the icon of the button that is displayed when the button is 
     * focused.
     * 
     * @param newValue the new icon
     */
    public void setFocusedIcon(ImageReference newValue) {
        set(PROPERTY_FOCUSED_ICON, newValue);
    }

    /**
     * Sets the height of the button.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }

    /**
     * Sets the icon displayed in the button.
     * 
     * @param newValue the new icon
     */
    public void setIcon(ImageReference newValue) {
        set(PROPERTY_ICON, newValue);
    }

    /**
     * Sets the margin size between the icon and the text.
     * The margin will only be displayed if the button has both
     * icon and text properties set.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param newValue the margin size 
     */
    public void setIconTextMargin(Extent newValue) {
        set(PROPERTY_ICON_TEXT_MARGIN, newValue);
    }

    /**
     * Sets the margin between the buttons edge and its content.
     * 
     * @param newValue the new margin
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }

    /**
     * Sets whether the text of the button should wrap in the event that 
     * horizontal space is limited.  Default value is true.
     * 
     * @param newValue the new line wrap state
     */
    public void setLineWrap(boolean newValue) {
        set(PROPERTY_LINE_WRAP, new Boolean(newValue));
    }
    
    /**
     * Sets the model that this button represents. The model may not be null.
     * 
     * @param newValue the new <code>ButtonModel</code>
     */
    public void setModel(ButtonModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Model may not be null.");
        }

        ButtonModel oldValue = getModel();

        if (oldValue != null) {
            oldValue.removeActionListener(actionForwarder);
        }

        newValue.addActionListener(actionForwarder);

        set(PROPERTY_MODEL, newValue);
    }

    /**
     * Sets the background color of the button when the button is pressed.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setPressedBackground(Color newValue) {
        set(PROPERTY_PRESSED_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the button is pressed.
     * 
     * @param newValue the new background image
     */
    public void setPressedBackgroundImage(FillImage newValue) {
        set(PROPERTY_PRESSED_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed around the button when the button is pressed.
     * 
     * @param newValue the new border
     */
    public void setPressedBorder(Border newValue) {
        set(PROPERTY_PRESSED_BORDER, newValue);
    }

    /**
     * Sets whether pressed effects are enabled when the button is pressed.
     * Pressed properties have no effect unless this property is set to true.
     * The default value is false.
     * 
     * @param newValue true if pressed effects should be enabled
     */
    public void setPressedEnabled(boolean newValue) {
        set(PROPERTY_PRESSED_ENABLED, new Boolean(newValue));
    }

    /**
     * Sets the font of the button when the button is pressed.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setPressedFont(Font newValue) {
        set(PROPERTY_PRESSED_FONT, newValue);
    }

    /**
     * Sets the foreground color of the button when the button is pressed.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setPressedForeground(Color newValue) {
        set(PROPERTY_PRESSED_FOREGROUND, newValue);
    }

    /**
     * Sets the icon of the button that is displayed when the button is pressed.
     * 
     * @param newValue the new icon
     */
    public void setPressedIcon(ImageReference newValue) {
        set(PROPERTY_PRESSED_ICON, newValue);
    }

    /**
     * Sets the background color of the button when the mouse cursor is inside
     * its bounds.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverBackground(Color newValue) {
        set(PROPERTY_ROLLOVER_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the mouse cursor is inside the
     * button's bounds
     * 
     * @param newValue the new background image
     */
    public void setRolloverBackgroundImage(FillImage newValue) {
        set(PROPERTY_ROLLOVER_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed around the button when the mouse cursor is
     * inside its bounds.
     * 
     * @param newValue the new border
     */
    public void setRolloverBorder(Border newValue) {
        set(PROPERTY_ROLLOVER_BORDER, newValue);
    }

    /**
     * Sets whether rollover effects are enabled when the mouse cursor is inside
     * the button's bounds. Rollover properties have no effect unless this
     * property is set to true. The default value is false.
     * 
     * @param newValue true if rollover effects should be enabled
     */
    public void setRolloverEnabled(boolean newValue) {
        set(PROPERTY_ROLLOVER_ENABLED, new Boolean(newValue));
    }

    /**
     * Sets the font of the button when the mouse cursor is inside its bounds.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setRolloverFont(Font newValue) {
        set(PROPERTY_ROLLOVER_FONT, newValue);
    }

    /**
     * Sets the foreground color of the button when the mouse cursor is inside
     * its bounds.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverForeground(Color newValue) {
        set(PROPERTY_ROLLOVER_FOREGROUND, newValue);
    }

    /**
     * Sets the icon of the button that is displayed when the mouse cursor is
     * inside its bounds.
     * 
     * @param newValue the new icon
     */
    public void setRolloverIcon(ImageReference newValue) {
        set(PROPERTY_ROLLOVER_ICON, newValue);
    }

    /**
     * Sets the text label of the button.
     * 
     * @param newValue the new text label
     */
    public void setText(String newValue) {
        set(PROPERTY_TEXT, newValue);
    }

    /**
     * Sets the alignment of the text relative to the icon.
     * Note that only one of the provided <code>Alignment</code>'s
     * settings should be non-default.
     * 
     * @param newValue the new text alignment
     */
    public void setTextAlignment(Alignment newValue) {
        set(PROPERTY_TEXT_ALIGNMENT, newValue);
    }
    
    /**
     * Sets the position of the text relative to the icon.
     * Note that only one of the provided <code>Alignment</code>'s
     * settings should be non-default.
     * 
     * @param newValue the new text position
     */
    public void setTextPosition(Alignment newValue) {
        set(PROPERTY_TEXT_POSITION, newValue);
    }
    
    /**
     * Sets the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @param newValue the new tool tip text
     */
    public void setToolTipText(String newValue) {
        set(PROPERTY_TOOL_TIP_TEXT, newValue);
    }

    /**
     * Sets the width of the button.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
    }
}
