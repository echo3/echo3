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

package nextapp.echo.app.text;

import java.util.EventListener;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.BorderedComponent;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Font;
import nextapp.echo.app.Insets;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.DocumentEvent;
import nextapp.echo.app.event.DocumentListener;

/**
 * Abstract base class for text-entry components.
 */
public abstract class TextComponent extends BorderedComponent {
    
    public static final String INPUT_ACTION = "action";

    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    public static final String PROPERTY_ALIGNMENT = "alignment";
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BACKGROUND_IMAGE = "disabledBackgroundImage";
    public static final String PROPERTY_DISABLED_BORDER = "disabledBorder";
    public static final String PROPERTY_DISABLED_FONT = "disabledFont";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_EDITABLE = "editable";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_HORIZONTAL_SCROLL = "horizontalScroll";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_MAXIMUM_LENGTH = "maximumLength";
    public static final String PROPERTY_READONLY_BACKGROUND = "readOnlyBackground";
    public static final String PROPERTY_READONLY_BACKGROUND_IMAGE = "readOnlyBackgroundImage";
    public static final String PROPERTY_READONLY_BORDER = "readOnlyBorder";
    public static final String PROPERTY_READONLY_FONT = "readOnlyFont";
    public static final String PROPERTY_READONLY_FOREGROUND = "readOnlyForeground";
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";
    public static final String PROPERTY_VERTICAL_SCROLL = "verticalScroll";
    public static final String PROPERTY_WIDTH = "width";
    
    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String DOCUMENT_CHANGED_PROPERTY = "document";
    public static final String TEXT_CHANGED_PROPERTY = "text";
    
    private Document document;
    
    /**
     * Local listener to monitor changes to document.
     */
    private DocumentListener documentListener = new DocumentListener() {

        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;
    
        /**
         * @see nextapp.echo.app.event.DocumentListener#documentUpdate(nextapp.echo.app.event.DocumentEvent)
         */
        public void documentUpdate(DocumentEvent e) {
            firePropertyChange(TEXT_CHANGED_PROPERTY, null, ((Document) e.getSource()).getText());
        }
    };
    
    /**
     * Creates a new <code>TextComponent</code> with the specified
     * <code>Document</code> as its model.
     * 
     * @param document the desired model
     */
    public TextComponent(Document document) {
        super();
        setDocument(document);
    }
    
    /**
     * Adds an <code>ActionListener</code> to the <code>TextComponent</code>.
     * The <code>ActionListener</code> will be invoked when the user
     * presses the ENTER key in the field.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }

    /**
     * Fires an action event to all listeners.
     */
    private void fireActionEvent() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        ActionEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new ActionEvent(this, (String) getRenderProperty(PROPERTY_ACTION_COMMAND));
            } 
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }
    
    /**
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this <code>TextComponent</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) get(PROPERTY_ACTION_COMMAND);
    }
    
    /**
     * Returns the alignment of the text component.
     * 
     * @return the alignment
     */
    public Alignment getAlignment() {
        return (Alignment) get(PROPERTY_ALIGNMENT);
    }
    
    /**
     * Returns the default background image of the text component.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the background color displayed when the text component is 
     * disabled.
     * 
     * @return the color
     */
    public Color getDisabledBackground() {
        return (Color) get(PROPERTY_DISABLED_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the text component is 
     * disabled.
     * 
     * @return the background image
     */
    public FillImage getDisabledBackgroundImage() {
        return (FillImage) get(PROPERTY_DISABLED_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed when the text component is 
     * disabled.
     * 
     * @return the border
     */
    public Border getDisabledBorder() {
        return (Border) get(PROPERTY_DISABLED_BORDER);
    }

    /**
     * Returns the font displayed when the text component is 
     * disabled.
     * 
     * @return the font
     */
    public Font getDisabledFont() {
        return (Font) get(PROPERTY_DISABLED_FONT);
    }

    /**
     * Returns the foreground color displayed when the text component is 
     * disabled.
     * 
     * @return the color
     */
    public Color getDisabledForeground() {
        return (Color) get(PROPERTY_DISABLED_FOREGROUND);
    }

    /**
     * Returns the model associated with this <code>TextComponent</code>.
     * 
     * @return the model
     */
    public Document getDocument() {
        return document;
    }

    /**
     * Returns the height of the text component.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }
    
    /**
     * Returns the horizontal scroll bar position.
     * 
     * @return the scroll bar position
     */
    public Extent getHorizontalScroll() {
        return (Extent) get(PROPERTY_HORIZONTAL_SCROLL);
    }
    
    /**
     * Returns the insets of the text component.
     * 
     * @return the insets
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Returns the maximum length (in characters) of the text which may be
     * entered into the component.
     * 
     * @return the maximum length, or -1 if no value is specified
     */
    public int getMaximumLength() {
        Integer value = (Integer) get(PROPERTY_MAXIMUM_LENGTH);
        return value == null ? -1 : value.intValue();
    }

    /**
     * Returns the background color displayed when the text component is
     * read only.
     *
     * @return the color
     */
    public Color getReadOnlyBackground() {
        return (Color) get(PROPERTY_READONLY_BACKGROUND);
    }

    /**
     * Returns the background image displayed when the text component is
     * read only.
     *
     * @return the background image
     */
    public FillImage getReadOnlyBackgroundImage() {
        return (FillImage) get(PROPERTY_READONLY_BACKGROUND_IMAGE);
    }

    /**
     * Returns the border displayed when the text component is
     * read only.
     *
     * @return the border
     */
    public Border getReadOnlyBorder() {
        return (Border) get(PROPERTY_READONLY_BORDER);
    }

    /**
     * Returns the font displayed when the text component is
     * read only.
     *
     * @return the font
     */
    public Font getReadOnlyFont() {
        return (Font) get(PROPERTY_READONLY_FONT);
    }

    /**
     * Returns the foreground color displayed when the text component is
     * read only.
     *
     * @return the color
     */
    public Color getReadOnlyForeground() {
        return (Color) get(PROPERTY_READONLY_FOREGROUND);
    }
    
    /**
     * Returns the text contained in the <code>Document</code> model of
     * this text component.
     * 
     * @return the text contained in the document
     */
    public String getText() {
        return document.getText();
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
     * Returns the vertical scroll bar position.
     * 
     * @return the scroll bar position
     */
    public Extent getVerticalScroll() {
        return (Extent) get(PROPERTY_VERTICAL_SCROLL);
    }
    
    /**
     * Returns the width of the text component.
     * This property supports <code>Extent</code>s with
     * either fixed or percentage-based units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
    }
    
    /**
     * Determines if any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
    
    /**
     * Determines the editable state of this component. Components that are not
     * editable do not receive user input, but they do gain focus, so it is
     * possible to, say, copy the component's text using keyboard shortcuts.
     * 
     * @return <code>true</code> if this component is editable
     */
    public boolean isEditable() {
        Object property = get(PROPERTY_EDITABLE);
        return null == property ? true : ((Boolean) property).booleanValue();
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
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        
        if (TEXT_CHANGED_PROPERTY.equals(inputName)) {
            setText((String) inputValue);
        } else if (PROPERTY_HORIZONTAL_SCROLL.equals(inputName)) {
            setHorizontalScroll((Extent) inputValue);
        } else if (PROPERTY_VERTICAL_SCROLL.equals(inputName)) {
            setVerticalScroll((Extent) inputValue);
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionEvent();
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from the <code>TextComponent</code>.
     * 
     * @param l the <code>ActionListener</code> to remove
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
     * Sets the action command which will be provided in
     * <code>ActionEvent</code>s fired by this <code>TextComponent</code>.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        set(PROPERTY_ACTION_COMMAND, newValue);
    }

    /**
     * Sets the alignment of the text component.
     * 
     * @param newValue the new alignment
     */
    public void setAlignment(Alignment newValue) {
        set(PROPERTY_ALIGNMENT, newValue);
    }
    
    /**
     * Sets the default background image of the text component.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the background color displayed when the component is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledBackground(Color newValue) {
        set(PROPERTY_DISABLED_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the component is disabled.
     * 
     * @param newValue the new background image
     */
    public void setDisabledBackgroundImage(FillImage newValue) {
        set(PROPERTY_DISABLED_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed when the component is disabled.
     * 
     * @param newValue the new border
     */
    public void setDisabledBorder(Border newValue) {
        set(PROPERTY_DISABLED_BORDER, newValue);
    }

    /**
     * Sets the font displayed when the component is disabled.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setDisabledFont(Font newValue) {
        set(PROPERTY_DISABLED_FONT, newValue);
    }

    /**
     * Sets the foreground color displayed when the component is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledForeground(Color newValue) {
        set(PROPERTY_DISABLED_FOREGROUND, newValue);
    }

    /**
     * Sets the model associated with this <code>TextComponent</code>.
     * 
     * @param newValue the new model (may not be null)
     */
    public void setDocument(Document newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Document may not be null.");
        }
        Document oldValue = getDocument();
        if (oldValue != null) {
            oldValue.removeDocumentListener(documentListener);
        }
        newValue.addDocumentListener(documentListener);
        document = newValue;
    }
    
    /**
     * Sets the editable state of this component. Components that are not
     * editable do not receive user input, but they do gain focus, so it is
     * possible to, say, copy the component's text using keyboard shortcuts.
     * 
     * @param newValue the new editable state
     */
    public void setEditable(boolean newValue) {
        set(PROPERTY_EDITABLE, Boolean.valueOf(newValue));
    }

    /**
     * Sets the height of the text component.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }
    
    /**
     * Sets the horizontal scroll bar position.
     * The provided <code>Extent</code> value must be in pixel units.
     * 
     * @param newValue the new scroll bar position
     */
    public void setHorizontalScroll(Extent newValue) {
        set(PROPERTY_HORIZONTAL_SCROLL, newValue);
    }
    
    /**
     * Sets the insets of the text component.
     * 
     * @param newValue the new insets
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the maximum length (in characters) of the text which may be
     * entered into the component.
     * 
     * @param newValue the new maximum length, or -1 if to specify an 
     *        unlimited length
     */
    public void setMaximumLength(int newValue) {
        if (newValue < 0) {
            set(PROPERTY_MAXIMUM_LENGTH, null);
        } else {
            set(PROPERTY_MAXIMUM_LENGTH, new Integer(newValue));
        }
    }

    /**
     * Sets the background color displayed when the component is read only.
     *
     * @param newValue the new <code>Color</code>
     */
    public void setReadOnlyBackground(Color newValue) {
        set(PROPERTY_READONLY_BACKGROUND, newValue);
    }

    /**
     * Sets the background image displayed when the component is read only.
     *
     * @param newValue the new background image
     */
    public void setReadOnlyBackgroundImage(FillImage newValue) {
        set(PROPERTY_READONLY_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border displayed when the component is read only.
     *
     * @param newValue the new border
     */
    public void setReadOnlyBorder(Border newValue) {
        set(PROPERTY_READONLY_BORDER, newValue);
    }

    /**
     * Sets the font displayed when the component is read only.
     *
     * @param newValue the new <code>Font</code>
     */
    public void setReadOnlyFont(Font newValue) {
        set(PROPERTY_READONLY_FONT, newValue);
    }

    /**
     * Sets the foreground color displayed when the component is read only.
     *
     * @param newValue the new <code>Color</code>
     */
    public void setReadOnlyForeground(Color newValue) {
        set(PROPERTY_READONLY_FOREGROUND, newValue);
    }
    
    /**
     * Sets the text of document model of this text component.
     * 
     * @param newValue the new text
     */
    public void setText(String newValue) {
        Integer maxLength = (Integer) get(PROPERTY_MAXIMUM_LENGTH);
        if (newValue != null && maxLength != null && maxLength.intValue() > 0 
                && newValue.length() > maxLength.intValue()) {
            getDocument().setText(newValue.substring(0, maxLength.intValue()));
        } else {
            getDocument().setText(newValue);
        }
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
     * Sets the vertical scroll bar position.
     * The provided <code>Extent</code> value must be in pixel units.
     * 
     * @param newValue the new scroll bar position
     */
    public void setVerticalScroll(Extent newValue) {
        set(PROPERTY_VERTICAL_SCROLL, newValue);
    }
    
    /**
     * Sets the width of the text component.
     * This property supports <code>Extent</code>s with
     * either fixed or percentage-based units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
    }
}
