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
 * A representation of a simple border.
 */
public class Border 
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final int SIDE_TOP = 0;
    public static final int SIDE_RIGHT = 1;
    public static final int SIDE_BOTTOM = 2;
    public static final int SIDE_LEFT = 3;
    
    /**
     * A border style that causes no border to be rendered.
     */
    public static final int STYLE_NONE = 0;
    
    /**
     * A border style that causes a single solid monochrome border around an
     * object.
     */
    public static final int STYLE_SOLID = 1;
    
    /**
     * A border style that causes a simulated 3D border to be rendered, such 
     * that an object appears recessed.
     */
    public static final int STYLE_INSET = 2;
    
    /**
     * A border style that causes a simulated 3D border to be rendered, such 
     * that an object appears raised.
     */
    public static final int STYLE_OUTSET = 3;
    
    /**
     * A border style that causes a simulated 3D border to be rendered, such 
     * that the border appears to have been carved out.
     */
    public static final int STYLE_GROOVE = 4;
    
    /**
     * A border style that causes a simulated 3D border to be rendered, such
     * that the border appears as a ridge around an object.
     */
    public static final int STYLE_RIDGE = 5;
    
    /**
     * A border style that creates two solid monochrome borders around an 
     * object.
     */
    public static final int STYLE_DOUBLE = 6;
    
    /**
     * A border style that appears as a series of dots.
     */
    public static final int STYLE_DOTTED = 7;
    
    /**
     * A border style that appears as a series of short line segments.
     */
    public static final int STYLE_DASHED = 8;
    
    /**
     * A representation of one or more sides of a border.
     */
    public static class Side
    implements Serializable {
        
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        private Extent size;
        private Color color;
        private int style;
        
        /**
         * Creates a new border <code>Side</code> with a pixel-based size.
         * 
         * @param sizePx the size of the border side, in pixels
         * @param color the color of the border side
         * @param style the style of the border side, one of the following constant values:
         *        <ul>
         *         <li><code>STYLE_NONE</code></li>
         *         <li><code>STYLE_SOLID</code></li>
         *         <li><code>STYLE_INSET</code></li>
         *         <li><code>STYLE_OUTSET</code></li>
         *         <li><code>STYLE_GROOVE</code></li>
         *         <li><code>STYLE_RIDGE</code></li>
         *         <li><code>STYLE_DOUBLE</code></li>
         *         <li><code>STYLE_DOTTED</code></li>
         *         <li><code>STYLE_DASHED</code></li>
         *        </ul>
         */
        public Side(int sizePx, Color color, int style) {
            this(new Extent(sizePx), color, style);
        }
        
        /**
         * Creates a new border <code>side</code>.
         * 
         * @param size the size of the border side (this property only supports
         *        <code>Extent</code>s with fixed (i.e., not percent) units)
         * @param color the color of the border side 
         * @param style the style of the border side, one of the following constant
         *        values:
         *        <ul>
         *        <li><code>STYLE_NONE</code></li>
         *        <li><code>STYLE_SOLID</code></li>
         *        <li><code>STYLE_INSET</code></li>
         *        <li><code>STYLE_OUTSET</code></li>
         *        <li><code>STYLE_GROOVE</code></li>
         *        <li><code>STYLE_RIDGE</code></li>
         *        <li><code>STYLE_DOUBLE</code></li>
         *        <li><code>STYLE_DOTTED</code></li>
         *        <li><code>STYLE_DASHED</code></li>
         *        </ul>
         */
        public Side(Extent size, Color color, int style) {
            super();
            this.size = size;
            this.color = color;
            this.style = style;
        }
    
        /**
         * @see java.lang.Object#equals(java.lang.Object)
         */
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof Side)) {
                return false;
            }
            Side that = (Side) o;
            if (this.style != that.style) {
                return false;
            }
            if (color == null) {
                if (that.color != null) {
                    return false;
                }
            } else {
                if (!this.color.equals(that.color)) {
                    return false;
                }
            }
            if (size == null) {
                if (that.size != null) {
                    return false;
                }
            } else {
                if (!this.size.equals(that.size)) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Returns the border side color.
         * 
         * @return the color
         */
        public Color getColor() {
            return color;
        }
        
        /**
         * Returns the border side size.
         * 
         * @return the size
         */
        public Extent getSize() {
            return size;
        }
        
        /**
         * Returns the border side style.
         * 
         * @return the style
         */
        public int getStyle() {
            return style;
        }
    }
    
    private Side[] sides;
    
    /**
     * Creates a new <code>Border</code> with a pixel-based size.
     * 
     * @param sizePx the size of the border, in pixels
     * @param color the color of the border
     * @param style the style of the border, one of the following constant values:
     *        <ul>
     *         <li><code>STYLE_NONE</code></li>
     *         <li><code>STYLE_SOLID</code></li>
     *         <li><code>STYLE_INSET</code></li>
     *         <li><code>STYLE_OUTSET</code></li>
     *         <li><code>STYLE_GROOVE</code></li>
     *         <li><code>STYLE_RIDGE</code></li>
     *         <li><code>STYLE_DOUBLE</code></li>
     *         <li><code>STYLE_DOTTED</code></li>
     *         <li><code>STYLE_DASHED</code></li>
     *        </ul>
     */
    public Border(int sizePx, Color color, int style) {
        this(new Extent(sizePx), color, style);
    }
    
    /**
     * Creates a new <code>Border</code>.
     * 
     * @param size the size of the border (this property only supports
     *        <code>Extent</code>s with fixed (i.e., not percent) units)
     * @param color the color of the border
     * @param style the style of the border, one of the following constant
     *        values:
     *        <ul>
     *        <li><code>STYLE_NONE</code></li>
     *        <li><code>STYLE_SOLID</code></li>
     *        <li><code>STYLE_INSET</code></li>
     *        <li><code>STYLE_OUTSET</code></li>
     *        <li><code>STYLE_GROOVE</code></li>
     *        <li><code>STYLE_RIDGE</code></li>
     *        <li><code>STYLE_DOUBLE</code></li>
     *        <li><code>STYLE_DOTTED</code></li>
     *        <li><code>STYLE_DASHED</code></li>
     *        </ul>
     */
    public Border(Extent size, Color color, int style) {
        super();
        sides = new Side[] { new Side(size, color, style) } ;
    }
    
    public Border(Side[] sides) {
        super();
        if (sides.length < 1 || sides.length > 4) {
            throw new IllegalArgumentException("Invalid number of border sides: " + sides.length);
        }
        this.sides = sides;
    }
    
    /**
     * Note that this implementation of equals will return FALSE if two borders 
     * have a different number of sides but are nevertheless equivalent.
     * 
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Border)) {
            return false;
        }
        Border that = (Border) o;
        if (this.sides.length != that.sides.length) {
            return false;
        }
        for (int i = 0; i < this.sides.length; ++i) {
            if (!this.sides[i].equals(that.sides[i])) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Returns the border color.
     * 
     * @return the color
     */
    public Color getColor() {
        return sides[0].getColor();
    }
    
    /**
     * Returns the border size.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the size
     */
    public Extent getSize() {
        return sides[0].getSize();
    }

    /**
     * Returns the border style.
     * 
     * @return the style, one of the following values:
     *         <ul>
     *          <li><code>STYLE_NONE</code></li>
     *          <li><code>STYLE_SOLID</code></li>
     *          <li><code>STYLE_INSET</code></li>
     *          <li><code>STYLE_OUTSET</code></li>
     *          <li><code>STYLE_GROOVE</code></li>
     *          <li><code>STYLE_RIDGE</code></li>
     *          <li><code>STYLE_DOUBLE</code></li>
     *          <li><code>STYLE_DOTTED</code></li>
     *          <li><code>STYLE_DASHED</code></li>
     *         </ul>
     */
    public int getStyle() {
        return sides[0].getStyle();
    }
    
    public Side[] getSides() {
        return sides;
    }
    
    public boolean isMultisided() {
        return sides.length > 1;
    }
}
