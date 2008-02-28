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

package nextapp.echo.app;

/**
 * A component which displays a text string, an icon, or both.
 */
public class Label extends Component {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final String PROPERTY_FORMAT_WHITESPACE = "formatWhitespace";
    public static final String PROPERTY_ICON = "icon";
    public static final String PROPERTY_ICON_TEXT_MARGIN = "iconTextMargin";
    public static final String PROPERTY_LINE_WRAP = "lineWrap";
    public static final String PROPERTY_TEXT = "text";
    public static final String PROPERTY_TEXT_ALIGNMENT = "textAlignment";
    public static final String PROPERTY_TEXT_POSITION = "textPosition";
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";

    /**
     * Creates a label with no text or icon.
     */
    public Label() {
        this(null, null);
    }
    
    /**
     * Creates a label with text.
     *
     * @param text the text to be displayed
     */
    public Label(String text) {
        this(text, null);
    }
    
    /**
     * Creates a label with an icon.
     *
     * @param icon the icon to be displayed
     */
    public Label(ImageReference icon) {
        this(null, icon);
    }

    /**
     * Creates a label with text and an icon.
     *
     * @param text the text to be displayed
     * @param icon the icon to be displayed
     */
    public Label(String text, ImageReference icon) {
        super();
    
        setIcon(icon);
        setText(text);
    }
    
    /**
     * Returns the icon of the label.
     * 
     * @return the icon
     */
    public ImageReference getIcon() {
        return (ImageReference) getProperty(PROPERTY_ICON);
    }
    
    /**
     * Returns the margin size between the icon and the text.
     * The margin will only be displayed if the label has both
     * icon and text properties set.
     * 
     * @return the margin size 
     */
    public Extent getIconTextMargin() {
        return (Extent) getProperty(PROPERTY_ICON_TEXT_MARGIN);
    }
    
    /**
     * Returns the text of the label.
     * 
     * @return the text
     */
    public String getText() {
        return (String) getProperty(PROPERTY_TEXT);
    }

    /**
     * Returns the alignment of the text relative to the icon.
     * 
     * @return the text alignment
     */
    public Alignment getTextAlignment() {
        return (Alignment) getProperty(PROPERTY_TEXT_ALIGNMENT);
    }

    /**
     * Returns the position of the text relative to the icon.
     * 
     * @return the text position
     */
    public Alignment getTextPosition() {
        return (Alignment) getProperty(PROPERTY_TEXT_POSITION);
    }

    /**
     * Returns the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @return the tool tip text
     */
    public String getToolTipText() {
        return (String) getProperty(PROPERTY_TOOL_TIP_TEXT);
    }
    
    /**
     * Determines if the text of the label should be formatted in case the 
     * target renderer does not preserve whitespace. Default value is false.
     * 
     * @return the format whitespace state
     */
    public boolean isFormatWhitespace() {
        Boolean value = (Boolean) getProperty(PROPERTY_FORMAT_WHITESPACE);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Determines if the text of the label should wrap in the event that 
     * horizontal space is limited.  Default value is true.
     * 
     * @return the line wrap state
     */
    public boolean isLineWrap() {
        Boolean value = (Boolean) getProperty(PROPERTY_LINE_WRAP);
        return value == null ? true : value.booleanValue();
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
     * Sets whether the text of the label should be formatted in case the target
     * renderer does not preserve whitespace. Default value is false.
     * 
     * @param newValue the new format whitespace state
     */
    public void setFormatWhitespace(boolean newValue) {
        setProperty(PROPERTY_FORMAT_WHITESPACE, newValue ? Boolean.TRUE : Boolean.FALSE);
    }
    
    /**
     * Sets the icon to be displayed.
     *
     * @param newValue the icon to be displayed
     */
    public void setIcon(ImageReference newValue) {
        setProperty(PROPERTY_ICON, newValue);
    }
    
    /**
     * Sets the margin size between the icon and the text.
     * The margin will only be displayed if the label has both
     * icon and text properties set.
     * 
     * @param newValue the margin size 
     */
    public void setIconTextMargin(Extent newValue) {
        setProperty(PROPERTY_ICON_TEXT_MARGIN, newValue);
    }
    
    /**
     * Sets whether the text of the label should wrap in the event that 
     * horizontal space is limited.  Default value is true.
     * 
     * @param newValue the new line wrap state
     */
    public void setLineWrap(boolean newValue) {
        setProperty(PROPERTY_LINE_WRAP, new Boolean(newValue));
    }
    
    /**
     * Sets the text to be displayed.
     *
     * @param newValue the text to be displayed
     */
    public void setText(String newValue) {
        setProperty(PROPERTY_TEXT, newValue);
    }
    
    /**
     * Sets the alignment of the text relative to the icon.
     * Note that only one of the provided <code>Alignment</code>'s
     * settings should be non-default.
     * 
     * @param newValue the new text position
     */
    public void setTextAlignment(Alignment newValue) {
        setProperty(PROPERTY_TEXT_ALIGNMENT, newValue);
    }
    
    /**
     * Sets the position of the text relative to the icon.
     * Note that only one of the provided <code>Alignment</code>'s
     * settings should be non-default.
     * 
     * @param newValue the new text position
     */
    public void setTextPosition(Alignment newValue) {
        setProperty(PROPERTY_TEXT_POSITION, newValue);
    }

    /**
     * Sets the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @param newValue the new tool tip text
     */
    public void setToolTipText(String newValue) {
        setProperty(PROPERTY_TOOL_TIP_TEXT, newValue);
    }
}
