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
 * A container which displays two components horizontally or vertically
 * adjacent to one another.
 * <p>
 * <b>Child LayoutData</b>: Children of this component may provide
 * layout information using the 
 * <code>nextapp.echo.app.layout.SplitPaneLayoutData</code> layout data object.
 * 
 * @see nextapp.echo.app.layout.SplitPaneLayoutData
 */
public class SplitPane extends Component
implements Pane, PaneContainer {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out horizontally with the
     * first (fixed-size) pane in the leading position.
     * The leading position is on the left side for left-to-right languages
     * and on the right side for right-to-left languages.
     */
    public static final int ORIENTATION_HORIZONTAL_LEADING_TRAILING = 0;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out horizontally with the
     * first (fixed-size) pane in the trailing position.
     * The trailing position is on the right side for left-to-right languages
     * and on the left side for right-to-left languages.
     */
    public static final int ORIENTATION_HORIZONTAL_TRAILING_LEADING = 1;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out horizontally with the
     * first (fixed-size) pane in the left position.
     */
    public static final int ORIENTATION_HORIZONTAL_LEFT_RIGHT = 2;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out horizontally with the
     * first (fixed-size) pane in the right position.
     */
    public static final int ORIENTATION_HORIZONTAL_RIGHT_LEFT = 3;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out vertically with the
     * first (fixed-size) pane in the top position.
     */
    public static final int ORIENTATION_VERTICAL_TOP_BOTTOM = 4;

    /**
     * An <code>orientation</code> constant indicating that the 
     * <code>SplitPane</code> should be laid out vertically with the
     * first (fixed-size) pane in the bottom position.
     */
    public static final int ORIENTATION_VERTICAL_BOTTOM_TOP = 5;
    
    /**
     * Shorthand for <code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code>.
     */
    public static final int ORIENTATION_HORIZONTAL = ORIENTATION_HORIZONTAL_LEADING_TRAILING;

    /**
     * Shorthand for <code>ORIENTATION_VERTICAL_TOP_BOTTOM</code>.
     */
    public static final int ORIENTATION_VERTICAL = ORIENTATION_VERTICAL_TOP_BOTTOM;
    
    public static final String PROPERTY_AUTO_POSITIONED = "autoPositioned";
    public static final String PROPERTY_ORIENTATION = "orientation";
    public static final String PROPERTY_RESIZABLE = "resizable";
    public static final String PROPERTY_SEPARATOR_COLOR = "separatorColor";
    public static final String PROPERTY_SEPARATOR_HEIGHT = "separatorHeight";
    public static final String PROPERTY_SEPARATOR_HORIZONTAL_IMAGE = "separatorHorizontalImage";
    public static final String PROPERTY_SEPARATOR_POSITION = "separatorPosition";
    public static final String PROPERTY_SEPARATOR_WIDTH = "separatorWidth";
    public static final String PROPERTY_SEPARATOR_VERTICAL_IMAGE = "separatorVerticalImage";
    public static final String PROPERTY_SEPARATOR_VISIBLE = "separatorVisible";
    
    /**
     * Creates a new <code>SplitPane</code> with default (horizontal) 
     * orientation.
     */
    public SplitPane() {
        super();
    }
    
    /**
     * Creates a new <code>SplitPane</code> with the specified orientation.
     *
     * @param orientation a constant representing the orientation, one of the 
     *        following values:
     *        <ul>
     *         <li><code>ORIENTATION_HORIZONTAL</code></li>
     *         <li><code>ORIENTATION_VERTICAL</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
     *         <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
     *         <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
     *        </ul>
     */
    public SplitPane(int orientation) {
        super();
        setOrientation(orientation);
    }
    
    /**
     * [EXPERIMENTAL] Creates a new <code>SplitPane</code> with the specified orientation
     * and auto-positioned state.
     * 
     * @param orientation a constant representing the orientation, one of the 
     *        following values:
     *        <ul>
     *         <li><code>ORIENTATION_HORIZONTAL</code></li>
     *         <li><code>ORIENTATION_VERTICAL</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
     *         <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
     *         <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
     *        </ul>
     * @param autoPositioned flag indicating whether the separator position
     *        should be automatically positioned
     */
    public SplitPane(int orientation, boolean autoPositioned) {
        super();
        setOrientation(orientation);
        setAutoPositioned(autoPositioned);
    }
    
    /**
     * Creates a new <code>SplitPane</code> with the specified orientation and
     * separator position.
     *
     * @param orientation a constant representing the orientation, one of the 
     *        following values:
     *        <ul>
     *         <li><code>ORIENTATION_HORIZONTAL</code></li>
     *         <li><code>ORIENTATION_VERTICAL</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
     *         <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
     *         <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
     *        </ul>
     * @param separatorPosition the initial position of the separator 
     *        (in pixel units)
     */
    public SplitPane(int orientation, Extent separatorPosition) {
        super();
        setOrientation(orientation);
        if (separatorPosition != null) {
            setSeparatorPosition(separatorPosition);
        }
    }
    
    /**
     * Returns the orientation of the <code>SplitPane</code>.
     * 
     * @return a constant representing the orientation, one of the following 
     *         values:
     *         <ul>
     *          <li><code>ORIENTATION_HORIZONTAL</code></li>
     *          <li><code>ORIENTATION_VERTICAL</code></li>
     *          <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code></li>
     *          <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
     *          <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
     *          <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
     *          <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
     *          <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
     *         </ul>
     */
    public int getOrientation() {
        Integer orientation = (Integer) get(PROPERTY_ORIENTATION); 
        return orientation == null ? ORIENTATION_VERTICAL : orientation.intValue();
    }
    
    /**
     * Returns the color of the pane separator.
     * 
     * @return the color
     */
    public Color getSeparatorColor() {
        return (Color) get(PROPERTY_SEPARATOR_COLOR);
    }
    
    /**
     * Returns the height of the pane separator.  This value is relevant only 
     * when the <code>SplitPane</code> has a vertical orientation.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @return the separator width
     */
    public Extent getSeparatorHeight() {
        return (Extent) get(PROPERTY_SEPARATOR_HEIGHT);
    }
    
    /**
     * Returns the fill image of the pane separator that is displayed when the
     * <code>SplitPane</code> has a horizontal orientation.
     * 
     * @return the image
     */
    public FillImage getSeparatorHorizontalImage() {
        return (FillImage) get(PROPERTY_SEPARATOR_HORIZONTAL_IMAGE);
    }
    
    /**
     * Returns the position of the pane separator.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @return the separator position
     */
    public Extent getSeparatorPosition() {
        return (Extent) get(PROPERTY_SEPARATOR_POSITION);
    }
    
    /**
     * Returns the fill image of the pane separator that is displayed when the
     * <code>SplitPane</code> has a vertical orientation.
     * 
     * @return the image
     */
    public FillImage getSeparatorVerticalImage() {
        return (FillImage) get(PROPERTY_SEPARATOR_VERTICAL_IMAGE);
    }
    
    /**
     * Returns the width of the pane separator.  This value is relevant only 
     * when the <code>SplitPane</code> has a horizontal orientation.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @return the separator width
     */
    public Extent getSeparatorWidth() {
        return (Extent) get(PROPERTY_SEPARATOR_WIDTH);
    }
    
    /**
     * [EXPERIMENTAL] Determines if the <code>SplitPane</code> is auto-positioned.
     * Auto positioning indicates that the separator position should
     * be set automatically based on the size of the first child.
     * This feature is only available on vertically oriented panes, where the
     * first child contains non-pane content.
     *   
     * @return true if the <code>SplitPane</code> is auto-positioned
     */
    public boolean isAutoPositioned() {
        Boolean value = (Boolean) get(PROPERTY_AUTO_POSITIONED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * Determines if the <code>SplitPane</code> is resizable.
     * 
     * @return true if the <code>SplitPane</code> is resizable
     */
    public boolean isResizable() {
        Boolean value = (Boolean) get(PROPERTY_RESIZABLE);
        return value == null ? false : value.booleanValue();
    }

    /**
     * Determines if the separator should be rendered visible.
     * The separator will always be displayed if a <code>SplitPane</code>
     * is resizable, regardless of the value of this property.
     * This property has a default value of <code>true</code>.
     * 
     * @return true if the <code>SplitPane</code> should provide
     *         a visible separator.
     */
    public boolean isSeparatorVisible(boolean newValue) {
        Boolean value = (Boolean) get(PROPERTY_SEPARATOR_VISIBLE);
        return value == null ? true : value.booleanValue();
    }
    
    /**
     * No more than two children may be added.
     * 
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component component) {
        return getComponentCount() <= 1;
    }

    /**
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component parent) {
        return parent instanceof PaneContainer;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (PROPERTY_SEPARATOR_POSITION.equals(inputName)) {
            setSeparatorPosition((Extent) inputValue);
        }
    }
    
    /**
     * [EXPERIMENTAL] Sets whether the <code>SplitPane</code> is auto-positioned.
     * Auto positioning indicates that the separator position should
     * be set automatically based on the size of the first child.
     * This feature is only available on vertically oriented panes, where the
     * first child contains non-pane content.
     * 
     * @param newValue true if the <code>SplitPane</code> separator
     *        should be automatically positioned.
     */
    public void setAutoPositioned(boolean newValue) {
        set(PROPERTY_AUTO_POSITIONED, new Boolean(newValue));
    }
    /**
     * Sets the orientation of the <code>SplitPane</code>.
     * 
     * @param newValue a constant representing the orientation, one of the 
     *        following values:
     *        <ul>
     *         <li><code>ORIENTATION_HORIZONTAL</code></li>
     *         <li><code>ORIENTATION_VERTICAL</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEADING_TRAILING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_TRAILING_LEADING</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_LEFT_RIGHT</code></li>
     *         <li><code>ORIENTATION_HORIZONTAL_RIGHT_LEFT</code></li>
     *         <li><code>ORIENTATION_VERTICAL_TOP_BOTTOM</code></li>
     *         <li><code>ORIENTATION_VERTICAL_BOTTOM_TOP</code></li>
     *        </ul>
     */
    public void setOrientation(int newValue) {
        set(PROPERTY_ORIENTATION, new Integer(newValue));
    }
    
    /**
     * Sets whether the <code>SplitPane</code> is resizable.
     * 
     * @param newValue true if the <code>SplitPane</code> should allow the
     *        resizing of panes by dragging the separator, false if it should
     *        not
     */
    public void setResizable(boolean newValue) {
        set(PROPERTY_RESIZABLE, new Boolean(newValue));
    }
    
    /**
     * Sets whether the separator is visible.
     * The separator will always be displayed if a <code>SplitPane</code>
     * is resizable, regardless of the value of this property.
     * This property has a default value of <code>true</code>.
     * 
     * @param newValue true if the <code>SplitPane</code> should provide
     *        a visible separator.
     */
    public void setSeparatorVisible(boolean newValue) {
        set(PROPERTY_SEPARATOR_VISIBLE, new Boolean(newValue));
    }
    
    /**
     * Sets the color of the pane separator.
     * 
     * @param newValue the new color
     */
    public void setSeparatorColor(Color newValue) {
        set(PROPERTY_SEPARATOR_COLOR, newValue);
    }
    
    /**
     * Sets the height of the pane separator.  This value is only relevant
     * when the <code>SplitPane</code> has a vertical orientation.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new height
     */
    public void setSeparatorHeight(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        set(PROPERTY_SEPARATOR_HEIGHT, newValue);
    }
    
    /**
     * Sets the fill image of the pane separator that is displayed when the
     * <code>SplitPane</code> has a horizontal orientation.
     * 
     * @param newValue the new image
     */
    public void setSeparatorHorizontalImage(FillImage newValue) {
        set(PROPERTY_SEPARATOR_HORIZONTAL_IMAGE, newValue);
    }

    /**
     * Sets the position of the pane separator.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new position
     */
    public void setSeparatorPosition(Extent newValue) {
        if (newValue != null && newValue.getValue() < 0) {
            throw new IllegalArgumentException("Extent value may not be negative.");
        }
        set(PROPERTY_SEPARATOR_POSITION, newValue);
    }
    
    /**
     * Sets the fill image of the pane separator that is displayed when the
     * <code>SplitPane</code> has a vertical orientation.
     * 
     * @param newValue the new image
     */
    public void setSeparatorVerticalImage(FillImage newValue) {
        set(PROPERTY_SEPARATOR_VERTICAL_IMAGE, newValue);
    }
    
    /**
     * Sets the width of the pane separator.  This value is only relevant
     * when the <code>SplitPane</code> has a horizontal orientation.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new width
     */
    public void setSeparatorWidth(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        set(PROPERTY_SEPARATOR_WIDTH, newValue);
    }
}
