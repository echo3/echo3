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
 * A component with an optional border around it. The border may be enriched with rounded
 * corners and a drop (box) shadow
 */
public abstract class BorderedComponent extends Component {

    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_BOX_SHADOW = "boxShadow";
    public static final String PROPERTY_RADIUS = "radius";

    /**
     * Default constructor.
     */
    public BorderedComponent() {
        super();
    }
    
    /**
     * Returns the border displayed around the component.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the specific box shadow (CSS3) setting of this component, if any.
     * This method will return null unless a <code>BoxShadow</code> is
     * specifically set on <strong>this</strong> <code>Component</code>.
     * 
     * @return the box shadow property of <strong>this</strong>
     *         <code>Component</code>
     */
    public BoxShadow getBoxShadow() {
        return (BoxShadow) get(PROPERTY_BOX_SHADOW);
    }
    
    /**
     * Returns the corder radius of the component (or null of radius applied).
     * 
     * @return the radius
     */
    public Insets getRadius() {
        return (Insets) get(PROPERTY_RADIUS);
    }

    /**
     * Sets the border displayed around the component.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }

    /**
     * Sets the <code>BoxShadow (CSS3)</code> of this <code>Component</code>.
     * 
     * @param newValue the new <code>BoxShadow</code>. 
     */
    public void setBoxShadow(BoxShadow newValue) {
        set(PROPERTY_BOX_SHADOW, newValue);
    }

    /**
     * Sets the radius of the corners of the component.
     * 
     * @param newValue the new radius
     */
    public void setRadius(Insets newValue) {
        set(PROPERTY_RADIUS, newValue);
    }
}
