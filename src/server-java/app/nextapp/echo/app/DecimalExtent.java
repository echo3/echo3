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

//FIXME Experimental (update docs).

/**
 * EXPERIMENTAL, Do not use.
 * 
 * A representation of an integer linear distance with units. <code>DecimalExtent</code>
 * objects are immutable once constructed.
 * This object should only be used when an extent requires a fractional (decimal) part, in all other
 * cases the plain <code>Extent</code> object should be used.
 */
public class DecimalExtent extends Extent {

    /**
     * The decimal value.
     */
    private final double decimalValue;
    
    /**
     * Creates a new <code>DecimalExtent</code> with pixel units.
     * 
     * @param value the value of the extent in pixels
     */
    public DecimalExtent(double decimalValue) {
        this(decimalValue, Extent.PX);
    }
    
    /**
     * Creates a new <code>DecimalExtent</code>.
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
    public DecimalExtent(double decimalValue, int units) {
        super((int) Math.round(decimalValue), units);
        this.decimalValue = decimalValue;
    }
    
    /**
     * Returns the decimal value of the extent.
     * 
     * @return the decimal value
     */
    public double getDecimalValue() {
        return decimalValue;
    }

    /**
     * @see nextapp.echo.app.Extent#toMm()
     */
    public int toMm() {
        switch (getUnits()) {
        case MM:
            return (int) decimalValue;
        case CM:
            return (int) (decimalValue * 10);
        case IN:
            return (int) (decimalValue * 25.4);
        case PT:
            return (int) ((decimalValue / 72) * 25.4);
        case PC:
            return (int) ((decimalValue / 6) * 25.4);
        }
        throw new IllegalStateException("Cannot convert to mm.");
    }
    
    /**
     * @see nextapp.echo.app.Extent#toPoint()
     */
    public int toPoint() {
        switch (getUnits()) {
        case PT:
            return (int) decimalValue;
        case PC:
            return (int) (decimalValue * 12);
        case IN:
            return (int) (decimalValue * 72);
        case MM:
            return (int) ((decimalValue / 25.4) * 72);
        case CM:
            return (int) ((decimalValue / 2.54) * 72);
        }
        throw new IllegalStateException("Cannot convert to pt.");
    }
}
