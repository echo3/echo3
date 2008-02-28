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
 * A property object which describes the alignment or positioning of a 
 * particular item relative to others.
 */
public class Alignment
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * A predefined alignment instance specifying left horizontal alignment and default vertical alignment.
     */
    public static final Alignment ALIGN_LEFT = new Alignment(Alignment.LEFT, Alignment.DEFAULT);
    
    /**
     * A predefined alignment instance specifying center horizontal alignment and default vertical alignment.
     */
    public static final Alignment ALIGN_CENTER = new Alignment(Alignment.CENTER, Alignment.DEFAULT);

    /**
     * A predefined alignment instance specifying right horizontal alignment and default vertical alignment.
     */
    public static final Alignment ALIGN_RIGHT = new Alignment(Alignment.RIGHT, Alignment.DEFAULT);
    
    /**
     * A predefined alignment instance specifying default horizontal alignment and top vertical alignment.
     */
    public static final Alignment ALIGN_TOP = new Alignment(Alignment.DEFAULT, Alignment.TOP);
    
    /**
     * A predefined alignment instance specifying default horizontal alignment and bottom vertical alignment.
     */
    public static final Alignment ALIGN_BOTTOM = new Alignment(Alignment.DEFAULT, Alignment.BOTTOM);
    
    /**
     * Specifies default alignment.
     */
    public static final int DEFAULT = 0;
    
    /**
     * Specifies leading alignment (left in LTR languages, right in RTL languages).
     */
    public static final int LEADING = 1;

    /**
     * Specifies trailing alignment (right in LTR languages, left in RTL languages).
     */
    public static final int TRAILING  = 2;
    
    /**
     * Specifies left alignment.
     */
    public static final int LEFT = 3;

    /**
     * Specifies center alignment.
     */
    public static final int CENTER = 4;

    /**
     * Specifies right alignment.
     */
    public static final int RIGHT = 5;
    
    /**
     * Specifies top alignment.
     */
    public static final int TOP = 6;

    /**
     * Specifies bottom alignment.
     */
    public static final int BOTTOM = 7;
    
    private int horizontal;
    private int vertical;
    
    /**
     * Creates a new <code>Alignment</code>.
     * 
     * @param horizontal The horizontal alignment setting, one of the
     *        following values:
     *        <ul>
     *         <li><code>DEFAULT</code></li>
     *         <li><code>LEADING</code></li>
     *         <li><code>TRAILING</code></li>
     *         <li><code>LEFT</code></li>
     *         <li><code>CENTER</code></li>
     *         <li><code>RIGHT</code></li>
     *        </ul>
     * @param vertical The vertical alignment setting, one of the 
     *        following values:
     *        <ul>
     *         <li><code>DEFAULT</code></li>
     *         <li><code>TOP</code></li>
     *         <li><code>CENTER</code></li>
     *         <li><code>BOTTOM</code></li>
     *        </ul>
     */
    public Alignment (int horizontal, int vertical) {
        super();
        this.horizontal = horizontal;
        this.vertical = vertical;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof Alignment)) {
            return false;
        }
        Alignment that = (Alignment) o;
        return this.horizontal == that.horizontal && this.vertical == that.vertical;
    }
    
    /**
     * Returns the horizontal setting of this <code>Alignment</code>.
     * 
     * @return the horizontal setting of this <code>Alignment</code>,
     *         one of the following values:
     *         <ul>
     *          <li><code>DEFAULT</code></li>
     *          <li><code>LEADING</code></li>
     *          <li><code>TRAILING</code></li>
     *          <li><code>LEFT</code></li>
     *          <li><code>CENTER</code></li>
     *          <li><code>RIGHT</code></li>
     *         </ul>
     */
    public int getHorizontal() {
        return horizontal;
    }
    
    /**
     * Returns the vertical setting of this <code>Alignment</code>.
     * 
     * @return the vertical setting of this <code>Alignment</code>,
     *         one of the following values:
     *         <ul>
     *          <li><code>DEFAULT</code></li>
     *          <li><code>TOP</code></li>
     *          <li><code>CENTER</code></li>
     *          <li><code>BOTTOM</code></li>
     *         </ul>
     */
    public int getVertical() {
        return vertical;
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer("h:");
        switch (horizontal) {
        case DEFAULT: out.append("default"); break;
        case LEADING: out.append("leading"); break;
        case TRAILING: out.append("trailing"); break;
        case LEFT: out.append("left"); break;
        case CENTER: out.append("center"); break;
        case RIGHT: out.append("right"); break;
        default: out.append("(invalid)"); break;
        }
        out.append(",v:");
        switch(vertical) {
        case DEFAULT: out.append("default"); break;
        case TOP: out.append("top"); break;
        case CENTER: out.append("center"); break;
        case BOTTOM: out.append("bottom"); break;
        default: out.append("(invalid)"); break;
        }
        return out.toString();
    }
}
