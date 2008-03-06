/*
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
 * 
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.app;

import java.io.Serializable;

/**
 * A representation of a graphical border drawn using a series of 
 * eight <code>FillImage</code>s.  The eight images are used to describe
 * the four corners and four sides of the border.
 * The <code>BorderInsets</code> property is used to describe the width and 
 * height of the border images, i.e. the inset to which the border images
 * extend inward from the outer edges of the box.
 * The <code>ContentInsets</code> property is used to describe the inset of
 * the content displayed within the border.  If the content inset is less
 * than the border inset, the content will be drawn above the border.
 * The <code>Color</code> property may be used in addition to or in lieu of
 * setting <code>FillImage</code>s.  The color will be drawn <em>behind</em>
 * the <code>FillImage</code>s in the case where both are used.
 */
public class FillImageBorder 
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final int TOP_LEFT = 0;
    public static final int TOP = 1;
    public static final int TOP_RIGHT= 2;
    public static final int LEFT = 3;
    public static final int RIGHT = 4;
    public static final int BOTTOM_LEFT= 5;
    public static final int BOTTOM = 6;
    public static final int BOTTOM_RIGHT = 7;
    
    private Insets contentInsets, borderInsets;
    private Color color;
    private FillImage[] fillImages;

    /**
     * Creates a new <code>FillImageBorder</code>.
     */
    public FillImageBorder() {
        super();
    }
    
    /**
     * Creates a new <code>FillImageBorder</code> with the specified color,
     * border inset, and content inset.
     *
     * @param color the solid color background of the border
     * @param borderInsets the border inset
     * @param contentInsets the content inset
     * @see #setBorderInsets(nextapp.echo.app.Insets)
     * @see #setContentInsets(nextapp.echo.app.Insets)
     * @see #setColor(nextapp.echo.app.Color)
     */
    public FillImageBorder(Color color, Insets borderInsets, Insets contentInsets) {
        super();
        this.color = color;
        this.borderInsets = borderInsets;
        this.contentInsets = contentInsets;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof FillImageBorder)) {
            return false;
        }
        FillImageBorder that = (FillImageBorder) o;
        if (!(this.color == that.color || 
                (this.color != null && this.color.equals(that.color)))) {
            return false;
        }
        if (!(this.borderInsets == that.borderInsets || 
                (this.borderInsets != null && this.borderInsets.equals(that.borderInsets)))) {
            return false;
        }
        if (!(this.contentInsets == that.contentInsets || 
                (this.contentInsets != null && this.contentInsets.equals(that.contentInsets)))) {
            return false;
        }
        if (this.fillImages != null || that.fillImages != null) {
            if (this.fillImages == null || that.fillImages == null) {
                return false;
            }
            for (int i = 0; i < fillImages.length; ++i) {
                if (!(this.fillImages[i] == that.fillImages[i] || 
                        (this.fillImages[i] != null && this.fillImages[i].equals(that.fillImages[i])))) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns the content inset.
     * 
     * @see #setBorderInsets(nextapp.echo.app.Insets)
     * @return the border inset
     */
    public Insets getBorderInsets() {
        return borderInsets;
    }
    
    /**
     * Returns the solid color background of the border.
     * 
     * @see #setColor(nextapp.echo.app.Color)
     * @return the color
     */
    public Color getColor() {
        return color;
    }

    /**
     * Sets the content inset.
     * 
     * @see #setContentInsets(nextapp.echo.app.Insets)
     * @return the content inset
     */
    public Insets getContentInsets() {
        return contentInsets;
    }

    /**
     * Retrieves the <code>FillImage</code> at the specified position.
     * 
     * @param position the position, one of the following values:
     *        <ul>
     *         <li><code>TOP_LEFT</code> the top left corner image</li>
     *         <li><code>TOP</code> the top side image</li>
     *         <li><code>TOP_RIGHT</code> the top right corner image</li>
     *         <li><code>LEFT</code> the left side image</li>
     *         <li><code>RIGHT</code> the right side image</li>
     *         <li><code>BOTTOM_LFET</code> the bottom left corner image</li>
     *         <li><code>BOTTOM</code> the bottom side image</li>
     *         <li><code>BOTTOM_RIGHT</code> the bottom right corner image</li>
     *        </ul>
     * @return the <code>FillImage</code>
     */
    public FillImage getFillImage(int position) {
        if (fillImages == null) {
            return null;
        } else {
            return fillImages[position];
        }
    }
    
    /**
     * Determines if the border has any fill images configured.
     * 
     * @return true if the border has any fill images
     */
    public boolean hasFillImages() {
        return fillImages != null;
    }
    
    /**
     * Sets the inset of the border images, thus defining the width and 
     * height of the border images.
     * The provided <code>Insets</code> value must only contain margins defined
     * in pixel units.
     * 
     * @param borderInsets the new border inset
     */
    public void setBorderInsets(Insets borderInsets) {
        this.borderInsets = borderInsets;
    }
    
    /**
     * Sets the solid color background of the border.
     * Note that setting a solid background color for the border will cause
     * the alpha channel of any <code>FillImage</code>s to be rendered against
     * this color.
     * 
     * @param color the color
     */
    public void setColor(Color color) {
        this.color = color;
    }

    /**
     * Sets the inset of the content that is contained within the border 
     * relative to the outside of the border.  If this inset value is smaller
     * than the the border inset, the content will be rendered partially on top
     * of the border.  A null value for this property specifies that the
     * content should be drawn at the border inset.
     * The provided <code>Insets</code> value must only contain margins defined
     * in pixel units.
     * 
     * @param contentInsets the new content inset
     */
    public void setContentInsets(Insets contentInsets) {
        this.contentInsets = contentInsets;
    }

    /**
     * Sets the <code>FillImage</code> at the specified position.
     * 
     * @param position the position, one of the following values:
     *        <ul>
     *         <li><code>TOP_LEFT</code> the top left corner image</li>
     *         <li><code>TOP</code> the top side image</li>
     *         <li><code>TOP_RIGHT</code> the top right corner image</li>
     *         <li><code>LEFT</code> the left side image</li>
     *         <li><code>RIGHT</code> the right side image</li>
     *         <li><code>BOTTOM_LFET</code> the bottom left corner image</li>
     *         <li><code>BOTTOM</code> the bottom side image</li>
     *         <li><code>BOTTOM_RIGHT</code> the bottom right corner image</li>
     *        </ul>
     * @param fillImage the new <code>FillIamge</code>
     */
    public void setFillImage(int position, FillImage fillImage) {
        if (fillImages == null) {
            if (fillImage == null) {
                return;
            }
            fillImages = new FillImage[8];
        }
        fillImages[position] = fillImage;
        if (fillImage == null) {
            // Set fillImages property to null in the event that no fill images exist.
            boolean hasFillImages = false;
            for (int i = 0 ; i < fillImages.length; ++i) {
                if (fillImages[i] != null) {
                    hasFillImages = true;
                    break;
                }
            }
            if (!hasFillImages) {
                fillImages = null;
            }
        }
    }
}
