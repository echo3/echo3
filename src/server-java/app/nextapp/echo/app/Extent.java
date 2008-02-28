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
 * A representation of a linear distance with units. <code>Extent</code>
 * objects are immutable once constructed.
 * <p>
 * <strong>WARNING:</strong> Many <code>Component</code>s will have
 * <code>Extent</code>-based properties that allow only certain types of
 * units. Make certain to verify the API specification of any
 * <code>Component</code> to ensure that you are using <code>Extent</code>s
 * correctly with it. The <code>Extent</code>-based <code>getXXX()</code>
 * and <code>setXXX()</code> property methods of a <code>Component</code>
 * will explain what types of <code>Extent</code>s are allowed.
 */
public class Extent 
implements Comparable, Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * Adds one <code>Extent</code> to another, returning the sum as a new
     * <code>Extent</code>.  Null is returned if the <code>Extent</code>s have
     * incompatible units.  If either provided <code>Extent</code> is null, the
     * other is returned.
     * 
     * @param a the first <code>Extent</code>
     * @param b the second <code>Extent</code>
     * @return the sum of the <code>Extent</code>s, if calculable 
     */
    public static Extent add(Extent a, Extent b) {
        if (a == null) {
            return b;
        }
        if (b == null) {
            return a;
        }
        if (a.getUnits() == b.getUnits()) {
            return new Extent(a.getValue() + b.getValue(), a.getUnits());
        }
        if (a.isPrint() && b.isPrint()) {
            if (a.isEnglish() && b.isEnglish()) {
                return new Extent(a.toPoint() + b.toPoint(), PT);
            }
            return new Extent(a.toMm() + b.toMm(), MM);
        }
        return null;
    }
    
    /**
     * Validates that the specified <code>Extent</code> is acceptable for use
     * in a particular environment, by ensuring that its units are of a
     * supported type.
     * 
     * @param value the <code>Extent</code> to validate
     * @param validUnits a bitmask containing one or more of the unit constants
     *        (multiple unit constants may be ORed together)
     * @throws IllegalArgumentException if the <code>Extent</code> is invalid
     */
    public static void validate(Extent value, int validUnits) {
        if (value != null && (value.getUnits() & validUnits) == 0) {
            throw new IllegalArgumentException("Specified units are unsupported in this context.");
        }
    }

    /**
     * Pixel units.
     */
    public static final int PX = 1;
    
    /**
     * Percentage units.
     */
    public static final int PERCENT = 2;
        
    /**
     * Points (1pt = 1/72in).
     */
    public static final int PT = 4;
    
    /**
     * Centimeter units.
     */
    public static final int CM = 8;
    
    /**
     * Millimeter units.
     */
    public static final int MM = 16;
    
    /**
     * Inch units.
     */
    public static final int IN = 32;
    
    /**
     * Em units (height of font).
     */
    public static final int EM = 64;
    
    /**
     * Ex units (height of character 'x' in font).
     */
    public static final int EX = 128;
    
    /**
     * Picas (1pc = 12pt)
     */
    public static final int PC = 256;
    
    
    private int value;
    private int units;
    
    /**
     * Creates a new <code>Extent</code> with pixel units.
     * 
     * @param value the value of the extent in pixels
     */
    public Extent(int value) {
        this.value = value;
        this.units = Extent.PX;
    }
    
    /**
     * Creates a new <code>Extent</code>.
     * 
     * @param value the value of the extent
     * @param units the units of the value, one of the following constants:
     *        <ul>
     *         <li><code>PC</code>: Pixels</li>
     *         <li><code>PERCENT</code>: Percent (of size of containing 
     *          component)</li>
     *         <li><code>PT</code>: Points</li>
     *         <li><code>CM</code>: Centimeters</li>
     *         <li><code>MM</code>: Millimeters</li>
     *         <li><code>IN</code>: Inches</li>
     *         <li><code>EM</code>: Ems (height of 'M' character)</li>
     *         <li><code>EX</code>: Exs (height of 'x' character)</li>
     *         <li><code>PC</code>: Picas</li>
     *        </ul>
     */
    public Extent(int value, int units) {
        this.value = value;
        this.units = units;
    }
    
    /**
     * @see java.lang.Comparable#compareTo(java.lang.Object)
     */
    public int compareTo(Object o) {
        Extent that = (Extent) o;
        if (this.units == that.units) {
            return this.value - that.value;
        }
        if (this.isPrint() && that.isPrint()) {
            return this.toPoint() - that.toPoint();
        }
        return this.units - that.units;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        } else if (o == null) {
            return false;
        } else if (o instanceof Extent) {
            Extent that = (Extent) o;
            return this.value == that.value && this.units == that.units;
        } else {
            return false;
        }
    }

    /**
     * Returns the value of the <code>Extent</code>.
     * 
     * @return The value of the <code>Extent</code>
     */
    public int getValue() {
        return value;
    }
    
    /**
     * Returns the units of the <code>Extent</code>.
     * 
     * @return The units of the <code>Extent</code>, one of the following 
     *         constants:
     *         <ul>
     *          <li><code>PC</code>: Pixels</li>
     *          <li><code>PERCENT</code>: Percent (of size of containing 
     *           component)</li>
     *          <li><code>PT</code>: Points</li>
     *          <li><code>CM</code>: Centimeters</li>
     *          <li><code>MM</code>: Millimeters</li>
     *          <li><code>IN</code>: Inches</li>
     *          <li><code>EM</code>: Ems (height of 'M' character)</li>
     *          <li><code>EX</code>: Exs (height of 'x' character)</li>
     *          <li><code>PC</code>: Picas</li>
     *         </ul>
     */
    public int getUnits() {
        return units;
    }
    
    /**
     * Determines whether this <code>Extent</code> can be compared to another
     * <code>Extent</code> to determine which is a greater length.
     * 
     * @param that the <code>Extent</code> to test comparability to
     * @return true if the <code>Extent</code>s can be compared
     */
    public boolean isComparableTo(Extent that) {
        return this.units == that.units || (this.isPrint() && that.isPrint());
    }
    
    /**
     * Determines if the <code>Extent</code> has English units, i.e., the
     * units are of type <code>IN</code> (inches), <code>PC</code> (picas), or
     * <code>PT</code> (points).
     * 
     * @return true if this <code>Extent</code> has English units
     */
    public boolean isEnglish() {
        return units == IN || units == PC || units == PT;
    }

    /**
     * Determines if the <code>Extent</code> has SI (Metric) units, i.e., the
     * units are of type <code>MM</code> (millimeters) or <code>CM</code>
     * (centimeters).
     * 
     * @return true if this <code>Extent</code> has SI units
     */
    public boolean isSI() {
        return units == MM || units == CM;
    }
    
    /**
     * Determines if the <code>Extent</code> has percentage-based units.
     * 
     * @return true if the <code>Extent</code> has percentage-based units
     */
    public boolean isPercentage() {
        return units == PERCENT;
    }
    
    /**
     * Determines if this <code>Extent</code> has 'print' based units, i.e.,
     * the units are in real dimensions, such as SI or English values, rather 
     * than screen-based units such as pixels or percentages.
     * 
     * @return true if this <code>Extent</code> has 'print' based units
     */
    public boolean isPrint() {
        return units == IN || units == PC || units == PT || units == MM || units == CM;
    }
    
    /**
     * Returns the value of the extent in millimeters.
     * 
     * @return the value of the extent in millimeters
     * @throws IllegalStateException if the value cannot be returned in 
     *         millimeters.
     *         Verify that <code>isPrint()</code> returns true to avoid 
     *         potentially receiving this exception.
     */
    public int toMm() {
        switch (units) {
        case MM:
            return value;
        case CM:
            return value * 10;
        case IN:
            return (int) (value * 25.4);
        case PT:
            return (int) ((value / 72) * 25.4);
        case PC:
            return (int) ((value / 6) * 25.4);
        }
        throw new IllegalStateException("Cannot convert to mm.");
    }
    
    /**
     * Returns the value of the extent in points.
     * 
     * @return the value of the extent in points
     * @throws IllegalStateException if the value cannot be returned in points
     *         (verify that <code>isPrint()</code> returns true to avoid 
     *         potentially receiving this exception).
     */
    public int toPoint() {
        switch (units) {
        case PT:
            return value;
        case PC:
            return value * 12;
        case IN:
            return value * 72;
        case MM:
            return (int) ((value / 25.4) * 72);
        case CM:
            return (int) ((value / 2.54) * 72);
        }
        throw new IllegalStateException("Cannot convert to pt.");
    }
    
    /**
     * Returns a string describing the state of the Extent.  
     * For debugging purposes only, do not rely on formatting.
     * 
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append(value);
        switch (units) {
        case Extent.CM:
            out.append("cm");
            break;
        case Extent.EM:
            out.append("em");
            break;
        case Extent.EX:
            out.append("ex");
            break;
        case Extent.IN:
            out.append("in");
            break;
        case Extent.MM:
            out.append("mm");
            break;
        case Extent.PC:
            out.append("pc");
            break;
        case Extent.PERCENT:
            out.append("%");
            break;
        case Extent.PT:
            out.append("pt");
            break;
        case Extent.PX:
            out.append("px");
            break;
        }
        return out.toString();
    }
}
