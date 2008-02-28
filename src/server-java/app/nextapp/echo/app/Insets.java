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
import java.io.Serializable;

/**
 * A property which describes an &quot;inset&quot; within a rectangular 
 * region.  This property is commonly used to specify margins of a 
 * <code>Component</code> relative to its container.
 * Null values for top/left/right/bottom margins indicate a 0-pixel inset 
 * for that margin.
 */
public class Insets 
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private Extent top;
    private Extent bottom;
    private Extent left;
    private Extent right;
    
    /**
     * Creates a new Insets object with the given pixel margin sizes.
     *
     * @param leftPx the size of the left margin in pixels
     * @param topPx the size of the top margin in pixels
     * @param rightPx the size of the right margin in pixels
     * @param bottomPx the size of the bottom margin in pixels
     */
    public Insets(int leftPx, int topPx, int rightPx, int bottomPx) {
        super();
        
        this.left = leftPx == 0 ? null : new Extent(leftPx, Extent.PX);
        this.top = topPx == 0 ? null : new Extent(topPx, Extent.PX);
        this.right = rightPx == 0 ? null : new Extent(rightPx, Extent.PX);
        this.bottom = bottomPx == 0 ? null : new Extent(bottomPx, Extent.PX);
    }
    
    /**
     * Creates a new Insets object with the given margin sizes.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @param left the size of the left margin
     * @param top the size of the top margin
     * @param right the size of the right margin
     * @param bottom the size of the bottom margin
     */
    public Insets(Extent left, Extent top, Extent right, Extent bottom) {
        super();
        
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    
    /**
     * Creates a new Insets object, defining all margins to be the provided 
     * value.
     *
     * @param sizePx the margin size in pixels
     */
    public Insets(int sizePx) {
        this(new Extent(sizePx, Extent.PX));
    }
    
    /**
     * Creates a new Insets object, defining all margins to be the provided 
     * value.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @param size the margin size
     */
    public Insets(Extent size) {
        this(size, size, size, size);
    }
    
    /**
     * Creates a new Insets object by defining values for the horizontal and
     * vertical margins.
     *
     * @param horizontal the size of the horizontal (left and right) margins in pixels
     * @param vertical the size of the vertical (top and bottom) margins in pixels
     */
    public Insets(int horizontal, int vertical) {
        this(new Extent(horizontal, Extent.PX), new Extent(vertical, Extent.PX));
    }
    
    /**
     * Creates a new Insets object by defining values for the horizontal and
     * vertical margins.
     *
     * @param horizontal the size of the horizontal (left and right) margins
     * @param vertical the size of the vertical (top and bottom) margins
     */
    public Insets(Extent horizontal, Extent vertical) {
        this(horizontal, vertical, horizontal, vertical);
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof Insets)) {
            return false;
        }
        Insets that = (Insets) o;
        if (this.left != that.left && (this.left == null || !this.left.equals(that.left))) {
            return false;
        }
        if (this.top != that.top && (this.top == null || !this.top.equals(that.top))) {
            return false;
        }
        if (this.right != that.right && (this.right == null || !this.right.equals(that.right))) {
            return false;
        }
        if (this.bottom != that.bottom && (this.bottom == null || !this.bottom.equals(that.bottom))) {
            return false;
        }
        return true;
    }
    
    /**
     * Returns the size of the bottom margin.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @return the size of the bottom margin
     */
    public Extent getBottom() {
        return bottom;
    }
    
    /**
     * Returns the size of the left margin.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @return the size of the left margin
     */
    public Extent getLeft() {
        return left;
    }
    
    /**
     * Returns the size of the right margin.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @return the size of the right margin
     */
    public Extent getRight() {
        return right;
    }

    /**
     * Returns the size of the top margin.
     * <code>Insets</code> only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     *
     * @return the size of the top margin
     */
    public Extent getTop() {
        return top;
    }
}
