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

package nextapp.echo.app.layout;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.LayoutData;

/**
 * A <code>LayoutData</code> object used to describe how a 
 * <code>Component</code> is rendered within a <code>SplitPane</code>. 
 */
public class SplitPaneLayoutData 
implements LayoutData {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final int OVERFLOW_AUTO = 0;
    public static final int OVERFLOW_HIDDEN = 1;
    public static final int OVERFLOW_SCROLL = 2;
    
    private int overflow;
    private Alignment alignment;
    private Color background;
    private Extent maximumSize;
    private Extent minimumSize;
    private FillImage backgroundImage;
    private Insets insets;
    
    /**
     * Returns the alignment of the containing pane.
     * 
     * @return the alignment
     */
    public Alignment getAlignment() {
        return alignment;
    }
    
    /**
     * Returns the background color of the containing pane.
     * 
     * @return the background color
     */
    public Color getBackground() {
        return background;
    }
    
    /**
     * Returns the <code>BackgroundImage</code> displayed in the 
     * containing pane.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return backgroundImage;
    }
    
    /**
     * Returns the inset margins of the containing pane.
     * This property is not rendered when the <code>SplitPaneLayoutData</code>
     * instance is attached to a <code>Pane</code> component.
     * 
     * @return the inset margins
     */
    public Insets getInsets() {
        return insets;
    }
    
    /**
     * Returns the preferred maximum size of the containing pane.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @return the maximum size
     */
    public Extent getMaximumSize() {
        return maximumSize;
    }
    
    /**
     * Returns the preferred minimum size of the containing pane.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @return the minimum size
     */
    public Extent getMinimumSize() {
        return minimumSize;
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
        return overflow;
    }
    
    /**
     * Sets the alignment of the containing pane.
     * 
     * @param newValue the new alignment
     */
    public void setAlignment(Alignment newValue) {
        alignment = newValue;
    }
    
    /**
     * Sets the background color of the containing pane.
     * 
     * @param newValue the new background color
     */
    public void setBackground(Color newValue) {
        background = newValue;
    }
    
    /**
     * Sets the <code>BackgroundImage</code> displayed in the 
     * containing pane.
     * 
     * @param newValue the new <code>BackgroundImage</code>
     */
    public void setBackgroundImage(FillImage newValue) {
        backgroundImage = newValue;
    }
    
    /**
     * Sets the inset margins of the containing pane.
     * This property is not rendered when the <code>SplitPaneLayoutData</code>
     * instance is attached to a <code>Pane</code> component.
     * 
     * @param newValue the new inset margins
     */
    public void setInsets(Insets newValue) {
        insets = newValue;
    }
    
    /**
     * Sets the preferred maximum size of the containing pane.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new maximum size
     */
    public void setMaximumSize(Extent newValue) {
        maximumSize = newValue;
    }
    
    /**
     * Sets the preferred minimum size of the containing pane.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new minimum size
     */
    public void setMinimumSize(Extent newValue) {
        minimumSize = newValue;
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
        overflow = newValue;
    }
}
