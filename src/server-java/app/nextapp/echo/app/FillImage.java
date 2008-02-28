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
 * Describes how an image should 'fill' a particular component or region of
 * the user interface.  Includes information about the image itself, its
 * positioning, repetition, and scrolling.
 */
public class FillImage 
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final int NO_REPEAT = 0;
    public static final int REPEAT_HORIZONTAL = 1;
    public static final int REPEAT_VERTICAL = 2;
    public static final int REPEAT = 3;
    
    private ImageReference image;
    private Extent horizontalOffset;
    private Extent verticalOffset;
    private int repeat;
    
    /**
     * Creates a new <code>FillImage</code> with no horizontal/vertical 
     * offset that scrolls with content and repeats both horizontally and 
     * vertically.
     * 
     * @param image the <code>ImageReference</code> to be displayed in the 
     *        fill
     */
    public FillImage(ImageReference image) {
        this(image, null, null, REPEAT);
    }

    /**
     * Creates a new <code>FillImage</code>.
     * 
     * @param image the <code>ImageReference</code> to be displayed in the 
     *        fill
     * @param horizontalOffset the horizontal offset of the fill image:
     *        Positive values indicate an offset from the left side of the 
     *        region.
     *        Negative values indicate an offset from the right side of the 
     *        region.
     *        Both fixed and percentage units are supported.
     * @param verticalOffset the vertical offset of the fill image:
     *        Positive values indicate an offset from the top of the region.
     *        Negative values indicate an offset from the bottom of the region.
     *        Both fixed and percentage units are supported.
     * @param repeat the repeat mode of the image, one of the following values:
     *        <ul>
     *         <li><code>NO_REPEAT</code></li>
     *         <li><code>REPEAT_HORIZONTAL</code></li>
     *         <li><code>REPEAT_VERTICAL</code></li>
     *         <li><code>REPEAT</code> (the default)</li>
     *        </ul>
     */
    public FillImage(ImageReference image, Extent horizontalOffset, Extent verticalOffset, int repeat) {
        super();
        this.image = image;
        this.horizontalOffset = horizontalOffset;
        this.verticalOffset = verticalOffset;
        this.repeat = repeat;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof FillImage)) {
            return false;
        }
        FillImage that = (FillImage) o;
        if (this.repeat != that.repeat) {
            return false;
        }
        if (!(this.image == that.image || (this.image != null && this.image.equals(that.image)))) {
            return false;
        }
        if (!(this.horizontalOffset == that.horizontalOffset || 
                (this.horizontalOffset != null && this.horizontalOffset.equals(that.horizontalOffset)))) {
            return false;
        }
        if (!(this.verticalOffset == that.verticalOffset || 
                (this.verticalOffset != null && this.verticalOffset.equals(that.verticalOffset)))) {
            return false;
        }
        return true;
    }
    
    /**
     * Returns the horizontal offset of the fill image.
     * Positive values indicate an offset from the left side of the region.
     * Negative values indicate an offset from the right side of the region.
     * 
     * @return the horizontal offset
     */
    public Extent getHorizontalOffset() {
        return horizontalOffset;
    }
    /**
     * Returns the fill image.
     * 
     * @return the fill image
     */
    public ImageReference getImage() {
        return image;
    }

    /**
     * Returns the repetition mode of the image.
     * 
     * @return the repetition mode, one of the following values:
     *         <ul>
     *          <li><code>NO_REPEAT</code></li>
     *          <li><code>REPEAT_HORIZONTAL</code></li>
     *          <li><code>REPEAT_VERTICAL</code></li>
     *          <li><code>REPEAT</code> (the default)</li>
     *         </ul>
     */
    public int getRepeat() {
        return repeat;
    }
    
    /**
     * Returns the vertical offset of the fill image.
     * Positive values indicate an offset from the top of the region.
     * Negative values indicate an offset from the bottom of the region.
     * 
     * @return the vertical offset
     */
    public Extent getVerticalOffset() {
        return verticalOffset;
    }
}
