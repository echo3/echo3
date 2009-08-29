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

/**
 * <code>ContentPane</code> component: a high-level container/layout object which fills a region and optionally provides the
 * capability to add <code>FloatingPane</code>s (e.g. <code>WindowPane</code>s) above that content. A <code>ContentPane</code> is
 * often suitable for use as a base class to extend when creating a composite (pane) component. May contain at most one non-
 * <code>FloatingPane</code> component as a child. May contain zero or more <code>FloatingPane</code> components as children.
 * 
 * <p>
 * A <code>ContentPane</code> may only be added to a <code>Component</code> which implements <code>PaneContainer</code>.
 * <p>
 * At most one <code>Component</code> that does NOT implement <code>FloatingPane</code> may be added to a <code>ContentPane</code>.
 * Any number of <code>FloatingPane</code>s may be added as children.
 */
public class ContentPane extends Component 
implements Pane, PaneContainer {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;
    
    private static final Extent PX_0 = new Extent(0);
    private static final Extent SCROLL_BOTTOM = new Extent(-1);
    
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_HORIZONTAL_SCROLL = "horizontalScroll";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_OVERFLOW = "overflow";
    public static final String PROPERTY_VERTICAL_SCROLL = "verticalScroll";
    
    public static final int OVERFLOW_AUTO = 0;
    public static final int OVERFLOW_HIDDEN = 1;
    public static final int OVERFLOW_SCROLL = 2;
    
    /**
     * Creates a new <code>ContentPane</code>.
     */
    public ContentPane() {
        super();
    }
    
    /**
     * Returns the background image.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the horizontal scrollbar position.
     * 
     * @return the horizontal scrollbar position
     */
    public Extent getHorizontalScroll() {
        return (Extent) get(PROPERTY_HORIZONTAL_SCROLL);
    }
    
    /**
     * Returns the overflow state, describing how the pane will behave when
     * the content is larger than display area.
     * 
     * @return the overflow state, one of the following values:
     *         <ul>
     *          <li><code>OVERFLOW_AUTO</code>: provide scrollbars as necessary</li>
     *          <li><code>OVERFLOW_HIDDEN</code>: never display scrollbars, hide overflow content</li>
     *          <li><code>OVERFLOW_SCROLL</code>: always display scrollbars</li>
     *         </ul>
     */
    public int getOverflow() {
        Integer overflow = (Integer) get(PROPERTY_OVERFLOW); 
        return overflow == null ? OVERFLOW_AUTO : overflow.intValue();
    }

    /**
     * Returns the inset margin of the content. 
     * Note that <code>FloatingPane</code>s, such as 
     * <code>WindowPane</code>s, will NOT be constrained by
     * this margin. 
     * Values may only be specified in pixel-based units.
     * 
     * @return newValue the inset margin
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Returns the vertical scrollbar position.
     * 
     * @return the vertical scrollbar position
     */
    public Extent getVerticalScroll() {
        return (Extent) get(PROPERTY_VERTICAL_SCROLL);
    }

    /**
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component child) {
        if (child instanceof FloatingPane) {
            // Allow addition of any number of FloatingPanes.
            return true;
        }
        
        // allow only one Non-FloatingPane child.
        int componentCount = getComponentCount();
        for (int i = 0; i < componentCount; ++i) {
            if (!(getComponent(i) instanceof FloatingPane)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component parent) {
        return parent instanceof PaneContainer || parent instanceof Window;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (PROPERTY_HORIZONTAL_SCROLL.equals(inputName)) {
            setHorizontalScroll((Extent) inputValue);
        } else if (PROPERTY_VERTICAL_SCROLL.equals(inputName)) {
            setVerticalScroll((Extent) inputValue);
        }
    }
    
    /**
     * Sets the background image.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the horizontal scrollbar position.
     * Values must be in pixel units.
     * A value of -1px indicates that the scrollbar should be positioned
     * at the end of the range. 
     * 
     * @param newValue the new horizontal scrollbar position
     */
    public void setHorizontalScroll(Extent newValue) {
        set(PROPERTY_HORIZONTAL_SCROLL, newValue);
    }
    
    /**
     * Sets the inset margin of the content. 
     * Note that <code>FloatingPane</code>s, such as 
     * <code>WindowPane</code>s, will NOT be constrained by
     * this margin. 
     * Values may only be specified in pixel-based units.
     * 
     * @param newValue the new inset margin
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }

    /**
     * Sets the overflow state, describing how the pane will behave when
     * the content is larger than display area.
     * 
     * @param newValue the overflow state, one of the following values:
     *        <ul>
     *         <li><code>OVERFLOW_AUTO</code>: provide scrollbars as necessary</li>
     *         <li><code>OVERFLOW_HIDDEN</code>: never display scrollbars, hide overflow content</li>
     *         <li><code>OVERFLOW_SCROLL</code>: always display scrollbars</li>
     *        </ul>
     */
    public void setOverflow(int newValue) {
        set(PROPERTY_OVERFLOW, new Integer(newValue));
    }

    /**
     * Sets the vertical scrollbar position.
     * Values must be in pixel units.
     * A value of -1px indicates that the scrollbar should be positioned
     * at the end of the range. 
     * 
     * @param newValue the new vertical scrollbar position
     */
    public void setVerticalScroll(Extent newValue) {
        if (SCROLL_BOTTOM.equals(newValue)) {
            set(PROPERTY_VERTICAL_SCROLL, PX_0);
        }
        set(PROPERTY_VERTICAL_SCROLL, newValue);
    }
}
