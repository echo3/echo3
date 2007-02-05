/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

import java.util.EventListener;

import nextapp.echo.app.event.WindowPaneEvent;
import nextapp.echo.app.event.WindowPaneListener;

/**
 * A <code>Component</code> which renders its contents in a floating, 
 * movable window.
 * <p>
 * <b>NOTE:</b> A <code>WindowPane</code> may only be added to 
 * a <code>ContentPane</code>.
 */
public class WindowPane extends Component 
implements FloatingPane, ModalSupport, PaneContainer {

    public static final String INPUT_CLOSE = "input_close";
    
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_CLOSABLE = "closable";
    public static final String PROPERTY_CLOSE_ICON = "closeIcon";
    public static final String PROPERTY_CLOSE_ICON_INSETS = "closeIconInsets";
    public static final String PROPERTY_DEFAULT_CLOSE_OPERATION = "defaultCloseOperation";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_ICON = "icon";
    public static final String PROPERTY_ICON_INSETS = "iconInsets";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_MAXIMUM_HEIGHT = "maximumHeight";
    public static final String PROPERTY_MAXIMUM_WIDTH = "maximumWidth";
    public static final String PROPERTY_MINIMUM_HEIGHT = "minimumHeight";
    public static final String PROPERTY_MINIMUM_WIDTH = "minimumWidth";
    public static final String PROPERTY_MOVABLE = "movable";
    public static final String PROPERTY_POSITION_X = "positionX";
    public static final String PROPERTY_POSITION_Y = "positionY";
    public static final String PROPERTY_RESIZABLE = "resizable";
    public static final String PROPERTY_TITLE = "title";
    public static final String PROPERTY_TITLE_BACKGROUND = "titleBackground";
    public static final String PROPERTY_TITLE_BACKGROUND_IMAGE = "titleBackgroundImage";
    public static final String PROPERTY_TITLE_FONT = "titleFont";
    public static final String PROPERTY_TITLE_FOREGROUND = "titleForeground";
    public static final String PROPERTY_TITLE_HEIGHT = "titleHeight";
    public static final String PROPERTY_TITLE_INSETS = "titleInsets";
    public static final String PROPERTY_WIDTH = "width";
    
    public static final String Z_INDEX_CHANGED_PROPERTY = "zIndex";

    /**
     * A constant for the <code>defaultCloseOperation</code> property 
     * indicating that nothing should be done when the user attempts 
     * to close a window.
     */
    public static final int DO_NOTHING_ON_CLOSE = 0;

    /**
     * A constant for the <code>defaultCloseOperation</code> property 
     * indicating that a window should be hidden when the user attempts 
     * to close it.
     */
    public static final int HIDE_ON_CLOSE = 1;

    /**
     * A constant for the <code>defaultCloseOperation</code> property 
     * indicating that a window should be removed from the component
     * hierarchy when a user attempts to close it.
     */
    public static final int DISPOSE_ON_CLOSE = 2;
    
    private boolean modal = false;
    private int zIndex = 0;
    
    /**
     * Creates a  new <code>WindowPane</code>.
     */    
    public WindowPane() {
        this(null, null, null);
    }
    
    /**
     * Creates a new <code>WindowPane</code> with the specified title
     * and dimensions.
     *
     * @param title the title
     * @param width The width
     * @param height The height
     */
    public WindowPane(String title, Extent width, Extent height) {
        super();
        if (title != null) {
            setTitle(title);
        }
        if (width != null) {
            setWidth(width);
        }
        if (height != null) {
            setHeight(height);
        }
    }
    
    /**
     * Adds a <code>WindowPaneListener</code> to receive event notifications.
     * 
     * @param l the <code>WindowPaneListener</code> to add
     */
    public void addWindowPaneListener(WindowPaneListener l) {
        getEventListenerList().addListener(WindowPaneListener.class, l);
    }
    
    /**
     * Notifies <code>WindowPaneListener</code>s that the user has requested 
     * to close this <code>WindowPane</code>. 
     */
    protected void fireWindowClosing() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(WindowPaneListener.class);
        if (listeners.length == 0) {
            return;
        }
        WindowPaneEvent e = new WindowPaneEvent(this);
        for (int i = 0; i < listeners.length; ++i) {
            ((WindowPaneListener) listeners[i]).windowPaneClosing(e);
        }
    }
    
    /**
     * Returns the background image of the <code>WindowPane</code>.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border which surrounds the entire <code>WindowPane</code>.
     * 
     * @return border
     */
    public FillImageBorder getBorder() {
        return (FillImageBorder) getProperty(PROPERTY_BORDER);
    }
    
    /**
     * Returns the close button icon.
     * 
     * @return the icon
     */
    public ImageReference getCloseIcon() {
        return (ImageReference) getProperty(PROPERTY_CLOSE_ICON);
    }
    
    /**
     * Returns the inset margin around the close button icon.
     * 
     * @return the inset margin
     */
    public Insets getCloseIconInsets() {
        return (Insets) getProperty(PROPERTY_CLOSE_ICON_INSETS);
    }
    
    /**
     * Returns the default close operation.
     * 
     * @return the default close operation, one of the following values:
     *         <ul>
     *          <li>DO_NOTHING_ON_CLOSE</li>
     *          <li>HIDE_ON_CLOSE</li>
     *          <li>DISPOSE_ON_CLOSE</li>
     *         </ul>
     */
    public int getDefaultCloseOperation() {
        Integer defaultCloseOperationValue = (Integer) getProperty(PROPERTY_DEFAULT_CLOSE_OPERATION);
        return defaultCloseOperationValue == null ? 0 : defaultCloseOperationValue.intValue();
    }
    
    /**
     * Returns the height of the content region of the window.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) getProperty(PROPERTY_HEIGHT);
    }
    
    /**
     * Returns the icon displayed in the title region.
     * 
     * @return the icon
     */
    public ImageReference getIcon() {
        return (ImageReference) getProperty(PROPERTY_ICON);
    }
    
    /**
     * Returns the inset margin around the icon.
     * 
     * @return the inset margin
     */
    public Insets getIconInsets() {
        return (Insets) getProperty(PROPERTY_CLOSE_ICON_INSETS);
    }
    
    /**
     * Returns the inset of the window content.
     * This property is not rendered when the content is a <code>Pane</code>
     * component.
     * 
     * @return the inset
     */
    public Insets getInsets() {
        return (Insets) getProperty(PROPERTY_INSETS);
    }
    
    /**
     * Returns the maximum height of the content region of the 
     * <code>WindowPane</code>.
     * 
     * @return the maximum height
     */
    public Extent getMaximumHeight() {
        return (Extent) getProperty(PROPERTY_MAXIMUM_HEIGHT);
    }
    
    /**
     * Returns the maximum width of the content region of the 
     * <code>WindowPane</code>.
     * 
     * @return the maximum width
     */
    public Extent getMaximumWidth() {
        return (Extent) getProperty(PROPERTY_MAXIMUM_WIDTH);
    }
    
    /**
     * Returns the minimum height of the content region of the 
     * <code>WindowPane</code>.
     * 
     * @return the minimum height
     */
    public Extent getMinimumHeight() {
        return (Extent) getProperty(PROPERTY_MINIMUM_HEIGHT);
    }
    
    /**
     * Returns the minimum width of the content region of the 
     * <code>WindowPane</code>.
     * 
     * @return the minimum width
     */
    public Extent getMinimumWidth() {
        return (Extent) getProperty(PROPERTY_MINIMUM_WIDTH);
    }
    
    /**
     * Returns the horizontal (Y) position of the <code>WindowPane</code> with
     * respect to its container.
     * 
     * @return the position
     */
    public Extent getPositionX() {
        return (Extent) getProperty(PROPERTY_POSITION_X);
    }
    
    /**
     * Returns the vertical (Y) position of the <code>WindowPane</code> with
     * respect to its container.
     * 
     * @return the position
     */
    public Extent getPositionY() {
        return (Extent) getProperty(PROPERTY_POSITION_Y);
    }
    
    /**
     * Returns the title of the <code>WindowPane</code>.
     *
     * @return the title
     */
    public String getTitle() {
        return (String) getProperty(PROPERTY_TITLE);
    }
    
    /**
     * Returns the background color of the title region.
     * 
     * @return the color
     */
    public Color getTitleBackground() {
        return (Color) getProperty(PROPERTY_TITLE_BACKGROUND);
    }
    
    /**
     * Returns the background image of the title region.
     * 
     * @return the background image
     */
    public FillImage getTitleBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_TITLE_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the font of the title region.
     * 
     * @return the font
     */
    public Font getTitleFont() {
        return (Font) getProperty(PROPERTY_TITLE_FONT);
    }
    
    /**
     * Returns the foreground color of the title region.
     * 
     * @return the color
     */
    public Color getTitleForeground() {
        return (Color) getProperty(PROPERTY_TITLE_FOREGROUND);
    }
    
    /**
     * Returns the height of the title region.
     * 
     * @return the height
     */
    public Extent getTitleHeight() {
        return (Extent) getProperty(PROPERTY_TITLE_HEIGHT);
    }

    /**
     * Returns the insets of the title region.
     * 
     * @return the insets
     */
    public Insets getTitleInsets() {
        return (Insets) getProperty(PROPERTY_TITLE_INSETS);
    }

    /**
     * Returns the width of the content region of the window.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) getProperty(PROPERTY_WIDTH);
    }
    
    /**
     * Returns the z-index of the window with respect to its parent
     * <code>ContentPane</code>.  Windows with higher z-indices will
     * visually obscure windows with lower z-indices.
     * 
     * @return the z-index 
     */
    public int getZIndex() {
        return zIndex;
    }
    
    /**
     * Determines if the window is closable via a provided close button in
     * the title bar.
     * 
     * @return true if the window is closable
     */
    public boolean isClosable() {
        Boolean value = (Boolean) getProperty(PROPERTY_CLOSABLE);
        return value == null ? true: value.booleanValue();
    }
    
    /**
     * @see nextapp.echo.app.ModalSupport#isModal()
     */
    public boolean isModal() {
        return modal;
    }
    
    /**
     * Determines if the window is movable.
     * 
     * @return true if the window is movable
     */
    public boolean isMovable() {
        Boolean value = (Boolean) getProperty(PROPERTY_MOVABLE);
        return value == null ? true : value.booleanValue();
    }

    /**
     * Determines if the window is resizable.
     * 
     * @return true if the window is resizable
     */
    public boolean isResizable() {
        Boolean value = (Boolean) getProperty(PROPERTY_RESIZABLE);
        return value == null ? true : value.booleanValue(); 
    }
    
    /**
     * Limit content to a single child.
     * 
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component component) {
        return getComponentCount() == 0;
    }
    
    /**
     * Only allow <code>ContentPane</code>s as parents.
     * 
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component parent) {
        return parent instanceof ContentPane;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (INPUT_CLOSE.equals(inputName)) {
            userClose();
        } else if (PROPERTY_POSITION_X.equals(inputName)) {
            setPositionX((Extent) inputValue);
        } else if (PROPERTY_POSITION_Y.equals(inputName)) {
            setPositionY((Extent) inputValue);
        } else if (PROPERTY_WIDTH.equals(inputName)) {
            setWidth((Extent) inputValue);
        } else if (PROPERTY_HEIGHT.equals(inputName)) {
            setHeight((Extent) inputValue);
        } else if (Z_INDEX_CHANGED_PROPERTY.equals(inputName)) {
            setZIndex(((Integer) inputValue).intValue());
        }
    }
    
    /**
     * Sets the background image of the <code>WindowPane</code>.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border which surrounds the entire <code>WindowPane</code>.
     * 
     * @param newValue the new border
     */
    public void setBorder(FillImageBorder newValue) {
        setProperty(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets whether the window is closable via a provided close button in
     * the title bar.
     * 
     * @param newValue true if the window is closable
     */
    public void setClosable(boolean newValue) {
        setProperty(PROPERTY_CLOSABLE, new Boolean(newValue));
    }
    
    /**
     * Sets the close button icon.
     * 
     * @param newValue the new icon
     */
    public void setCloseIcon(ImageReference newValue) {
        setProperty(PROPERTY_CLOSE_ICON, newValue);
    }
    
    /**
     * Sets the inset margin around the close button icon.
     * 
     * @param newValue the new inset margin
     */
    public void setCloseIconInsets(Insets newValue) {
        setProperty(PROPERTY_CLOSE_ICON_INSETS, newValue);
    }
    
    /**
     * Sets the default close operation.
     * 
     * @param newValue the new default close operation, one of the following 
     *        values:
     *        <ul>
     *         <li>DO_NOTHING_ON_CLOSE</li>
     *         <li>HIDE_ON_CLOSE</li>
     *         <li>DISPOSE_ON_CLOSE</li>
     *        </ul>
     */
    public void setDefaultCloseOperation(int newValue) {
        setProperty(PROPERTY_DEFAULT_CLOSE_OPERATION, new Integer(newValue));
    }
    
    /**
     * Sets the height of the content region of the <code>WindowPane</code>.
     * Values must be in pixel units.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_HEIGHT, newValue);
    }
    
    /**
     * Sets the icon displayed in the title region.
     * 
     * @param newValue the new icon
     */
    public void setIcon(ImageReference newValue) {
        setProperty(PROPERTY_ICON, newValue);
    }
    
    /**
     * Sets the inset margin around the icon.
     * 
     * @param newValue the new inset margin
     */
    public void setIconInsets(Insets newValue) {
        setProperty(PROPERTY_ICON_INSETS, newValue);
    }
    
    /**
     * Sets the inset of the window content.
     * This property is not rendered when the content is a <code>Pane</code>
     * component.
     * 
     * @param newValue the new inset
     */
    public void setInsets(Insets newValue) {
        setProperty(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the maximum height of the content region of the 
     * <code>WindowPane</code>.
     * Values must be in pixel units.
     * 
     * @param newValue the new maximum height
     */
    public void setMaximumHeight(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_MAXIMUM_HEIGHT, newValue);
    }
    
    /**
     * Sets the maximum width of the content region of the 
     * <code>WindowPane</code>.
     * Values must be in pixel units.
     * 
     * @param newValue the new maximum width
     */
    public void setMaximumWidth(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_MAXIMUM_WIDTH, newValue);
    }
    
    /**
     * Sets the minimum height of the content region of the 
     * <code>WindowPane</code>.
     * Values must be in pixel units.
     * 
     * @param newValue the new minimum height
     */
    public void setMinimumHeight(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_MINIMUM_HEIGHT, newValue);
    }
    
    /**
     * Sets the minimum width of the content region of the 
     * <code>WindowPane</code>.
     * Values must be in pixel units.
     * 
     * @param newValue the new minimum width
     */
    public void setMinimumWidth(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_MINIMUM_WIDTH, newValue);
    }
    
    /**
     * @see nextapp.echo.app.ModalSupport#setModal(boolean)
     */
    public void setModal(boolean newValue) {
        boolean oldValue = modal;
        modal = newValue;
        firePropertyChange(MODAL_CHANGED_PROPERTY, new Boolean(oldValue), new Boolean(newValue));
    }
    
    /**
     * Sets whether the window is movable.
     * 
     * @param newValue true if the window may be moved by the user
     */
    public void setMovable(boolean newValue) {
        setProperty(PROPERTY_MOVABLE, new Boolean(newValue));
    }
    
    /**
     * Sets the horizontal (X) position of the <code>WindowPane</code> with
     * respect to its container.
     * Values must be in pixel units.
     * 
     * @param newValue the new position
     */
    public void setPositionX(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_POSITION_X, newValue);
    }
    
    /**
     * Sets the vertical (Y) position of the <code>WindowPane</code> with
     * respect to its container.
     * Values must be in pixel units.
     * 
     * @param newValue the new position
     */
    public void setPositionY(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_POSITION_Y, newValue);
    }

    /**
     * Sets whether the window is resizable.
     * 
     * @param newValue true if the window may be resized by the user
     */
    public void setResizable(boolean newValue) {
        setProperty(PROPERTY_RESIZABLE, new Boolean(newValue));
    }
    
    /**
     * Sets the title of the <code>WindowPane</code>.
     *
     * @param newValue the title
     */
    public void setTitle(String newValue) {
        setProperty(PROPERTY_TITLE, newValue);
    }
    
    /**
     * Sets the font of the title region.
     * 
     * @param newValue the new font
     */
    public void setTitleFont(Font newValue) {
        setProperty(PROPERTY_TITLE_FONT, newValue);
    }
    
    /**
     * Sets the background color of the title region.
     * 
     * @param newValue the new color
     */
    public void setTitleBackground(Color newValue) {
        setProperty(PROPERTY_TITLE_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image of the title region.
     * 
     * @param newValue the new background image
     */
    public void setTitleBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_TITLE_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the foreground color of the title region.
     * 
     * @param newValue the new color
     */
    public void setTitleForeground(Color newValue) {
        setProperty(PROPERTY_TITLE_FOREGROUND, newValue);
    }
    
    /**
     * Sets the height of the title region.
     * Values must be in pixel units.
     * 
     * @param newValue the new height
     */
    public void setTitleHeight(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_TITLE_HEIGHT, newValue);
    }
    
    /**
     * Sets the insets of the title region.
     * 
     * @param newValue the new insets
     */
    public void setTitleInsets(Insets newValue) {
        setProperty(PROPERTY_TITLE_INSETS, newValue);
    }
    
    /**
     * Sets the width of the content region of the window.
     * Values must be in pixel units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        setProperty(PROPERTY_WIDTH, newValue);
    }
    
    /**
     * Sets the z-index of the window with respect to its parent
     * <code>ContentPane</code>.  Windows with higher z-indices will
     * visually obscure windows with lower z-indices.
     * 
     * @param newValue the new z-index 
     */
    public void setZIndex(int newValue) {
        int oldValue = zIndex;
        zIndex = newValue;
        firePropertyChange(Z_INDEX_CHANGED_PROPERTY, new Integer(oldValue), new Integer(newValue));
    }
    
    /**
     * Removes a <code>WindowPaneListener</code> from receiving event notifications.
     * 
     * @param l the <code>WindowPaneListener</code> to remove
     */
    public void removeWindowPaneListener(WindowPaneListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(WindowPaneListener.class, l);
    }
    
    /**
     * Processes a user request to close the window (via the close button).
     */
    public void userClose() {
        fireWindowClosing();
        Integer defaultCloseOperationValue = (Integer) getRenderProperty(PROPERTY_DEFAULT_CLOSE_OPERATION);
        int defaultCloseOperation = defaultCloseOperationValue == null 
                ? DISPOSE_ON_CLOSE : defaultCloseOperationValue.intValue();
        switch (defaultCloseOperation) {
        case DISPOSE_ON_CLOSE:
            getParent().remove(this);
            break;
        case HIDE_ON_CLOSE:
            setVisible(false);
            break;
        }
    }
}
