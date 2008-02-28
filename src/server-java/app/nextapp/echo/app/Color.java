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
 * A representation of a 24-bit RGB color.
 */
public class Color 
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;
    
    /** The color black. */
    public static final Color BLACK     = new Color(0x00, 0x00, 0x00);

    /** The color blue. */
    public static final Color BLUE      = new Color(0x00, 0x00, 0xff);

    /** The color green. */
    public static final Color GREEN     = new Color(0x00, 0xff, 0x00);

    /** The color cyan. */
    public static final Color CYAN      = new Color(0x00, 0xff, 0xff);

    /** The color red. */
    public static final Color RED       = new Color(0xff, 0x00, 0x00);

    /** The color magenta. */
    public static final Color MAGENTA   = new Color(0xff, 0x00, 0xff);

    /** The color yellow. */
    public static final Color YELLOW    = new Color(0xff, 0xff, 0x00);

    /** The color white. */
    public static final Color WHITE     = new Color(0xff, 0xff, 0xff);

    /** The color dark gray. */
    public static final Color DARKGRAY  = new Color(0x7f, 0x7f, 0x7f);

    /** The color light gray. */
    public static final Color LIGHTGRAY = new Color(0xaf, 0xaf, 0xaf);

    /** The color orange. */
    public static final Color ORANGE    = new Color(0xff, 0xaf, 0x00);

    /** The color pink. */
    public static final Color PINK      = new Color(0xff, 0xaf, 0xaf);

    private int rgb;
    
    /** 
     * Creates a new color from an integer value.  
     * The value should be of the for 0xRRGGBB.
     *
     * @param rgb an integer representation for a color
     */
    public Color(int rgb) {
        this.rgb = rgb;
    }
    
    /**
     * Creates a new color with specified red, green, and blue values.  Each 
     * value may range from 0 to 255.
     *
     * @param r the red component value
     * @param g the green component value
     * @param b the blue component value
     */
    public Color(int r, int g, int b) {
        this.rgb = ((r & 0xff) << 16) | ((g & 0xff) << 8) | b & 0xff;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        boolean equal;
    
        if (this == o) {
            equal = true;
        } else if (o instanceof Color) {
            Color that = (Color) o;
            equal = this.rgb == that.rgb;
        } else {
            equal = false;
        }
        
        return equal;
    }
    
    /**
     * Returns the blue component value of this color.
     *
     * @return the blue component value of this color, from 0 to 255
     */
    public int getBlue() {
        return rgb & 0xff;
    }
    
    /**
     * Returns the green component value of this color.
     *
     * @return the green component value of this color, from 0 to 255
     */
    public int getGreen() {
        return (rgb >> 8) & 0xff;
    }
    
    /**
     * Returns the red component value of this color.
     *
     * @return the red component value of this color, from 0 to 255
     */
    public int getRed() {
        return rgb >> 16;
    }
    
    /**
     * Returns the color as an RGB value.
     *
     * @return the color as an RGB value
     */
    public int getRgb() {
        return rgb;
    }

    /**
     * @see java.lang.Object#hashCode()
     */
    public int hashCode() {
        return getRgb();
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        return getClass().getName() + " [r=" + getRed() + ",g=" + getGreen() + ",b=" + getBlue() + "]";
    }
}
