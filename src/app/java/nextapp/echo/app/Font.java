/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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
 * An immutable representation of a text font, including typeface, size, and 
 * style.
 */
public class Font 
implements Serializable {
    
    /**
     * An immutable representation of a type face.
     * A typeface may specify an alternate <code>TypeFace</code> object
     * in the event that the primary one is not available on a given
     * client.  In this way, a chain of alternates may be created for
     * a very specific face, e.g.:
     * &quot;Verdana-&gt;Arial-&gt;Helvetica-&gt;Sans-Serif&quot;
     */
    public static class Typeface 
    implements Serializable {
        
        private String name;
        private Typeface alternate;
        
        /**
         * Creates a new <code>Typeface</code>.
         * 
         * @param name the typeface name
         */
        public Typeface(String name) {
            this(name, null);
        }

        /**
         * Creates a new <code>Typeface</code>.
         * 
         * @param name the typeface name
         * @param alternate the alternate typeface which should be used, in
         *        case the client does not support the specified typeface
         */
        public Typeface(String name, Typeface alternate) {
            super();
            if (name == null) {
                throw new IllegalArgumentException("'name' argument cannot be null.");
            }
            this.name = name;
            this.alternate = alternate;
        }
        
        /**
         * @see java.lang.Object#equals(java.lang.Object)
         */
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof Typeface)) {
                return false;
            }
            Typeface that = (Typeface) o;
            if (!this.name.equals(that.name)) {
                return false;
            }
            if (this.alternate == null) {
                return that.alternate == null;
            }
            return this.alternate.equals(that.alternate);
        }
            
        /**
         * Returns the alternate typeface.
         * This method should be queried recursively until it returns null
         * in order to determine all alternate typefaces.
         * 
         * @return the alternate <code>Typeface</code>
         */
        public Typeface getAlternate() {
            return alternate;
        }
        
        /**
         * Returns the name of the typeface.
         * 
         * @return the name of the typeface, e.g., 'Helvetica'
         */
        public String getName() {
            return name;
        }
        
        /**
         * Renders a debug representation of the object.
         * 
         * @see java.lang.Object#toString()
         */
        public String toString() {
            return alternate == null ? name : name + ", " + alternate;
        }
    }
    
    public static final Typeface SANS_SERIF = new Typeface("Sans-Serif");
    public static final Typeface SERIF = new Typeface("Serif");
    public static final Typeface MONOSPACE = new Typeface("Monospace");
    public static final Typeface HELVETICA = new Typeface("Helvetica", SANS_SERIF);
    public static final Typeface ARIAL = new Typeface("Arial", HELVETICA);
    public static final Typeface VERDANA = new Typeface("Verdana", ARIAL);
    public static final Typeface TIMES = new Typeface("Times", SERIF);
    public static final Typeface TIMES_ROMAN = new Typeface("Times Roman", TIMES);
    public static final Typeface TIMES_NEW_ROMAN = new Typeface("Times New Roman", TIMES_ROMAN);
    public static final Typeface COURIER = new Typeface("Courier", MONOSPACE);
    public static final Typeface COURIER_NEW = new Typeface("Courier New", COURIER);

    /**
     * A style value indicating no text attributes.
     */
    public static final int PLAIN = 0x0;
    
    /**
     * A style value indicating bold.
     */
    public static final int BOLD = 0x1;

    /**
     * A style value indicating bold.
     */
    public static final int ITALIC = 0x2;

    /**
     * A style value indicating underline.
     */
    public static final int UNDERLINE = 0x4;
    
    /**
     * A style value indicating overline.
     */
    public static final int OVERLINE = 0x8;
    
    /**
     * A style value indicating line-through.
     */
    public static final int LINE_THROUGH = 0x10;
    
    private Typeface typeface;
    private Extent size;
    private int style;
    
    /**
     * Creates a new <code>Font</code> with the specified <code>Typeface</code>,
     * size, and style.
     * 
     * @param typeface a <code>Typeface</code> describing the typeface of the font.
     * @param style the style of the font, one or more of the following values:
     *        <ul>
     *        <li>PLAIN</li>
     *        <li>BOLD</li>
     *        <li>ITALIC</li>
     *        <li>OVERLINE</li>
     *        <li>LINE_THROUGH</li>
     *        <li>UNDERLINE</li>
     *        </ul>
     *        If it is necessary create a font with multiple style attributes,
     *        they should be bitwise-ORed together, using an expression such as
     *        <code>BOLD | UNDERLINE</code>.
     * @param size the size of the font as a <code>Extent</code>
     */
    public Font(Typeface typeface, int style, Extent size) {
        super();
        this.typeface = typeface;
        this.style = style;
        this.size = size;
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Font)) {
            return false;
        }
        Font that = (Font) o;
        if (this.style != that.style) {
            return false;
        }
        if (typeface == null) {
            if (that.typeface != null) {
                return false;
            }
        } else {
            if (!this.typeface.equals(that.typeface)) {
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
     * Returns the size of the font.
     * 
     * @return the size of the font
     */
    public Extent getSize() {
        return size;
    }
    
    /**
     * Returns the typeface of the font.
     * 
     * @return the typeface of the font
     */
    public Typeface getTypeface() {
        return typeface;
    }
    
    /**
     * Determines whether the font is bold.
     *
     * @return true if the font is bold
     */
    public boolean isBold() {
        return (style & BOLD) != 0;
    }
    
    /**
     * Determines whether the font is italicized.
     *
     * @return true if the font is italicized
     */
    public boolean isItalic() {
        return (style & ITALIC) != 0;
    }
    
    /**
     * Determines whether the font has line-through enabled.
     *
     * @return true if the font has line-through enabled
     */
    public boolean isLineThrough() {
        return (style & LINE_THROUGH) != 0;
    }
    
    /**
     * Determines whether the font is plain (i.e., the font has no style
     * attributes set).
     *
     * @return true if the font is plain
     */
    public boolean isPlain() {
        return style == 0;
    }
    
    /**
     * Determines whether the font has an overline.
     *
     * @return true if the font has an overline
     */
    public boolean isOverline() {
        return (style & OVERLINE) != 0;
    }
    
    /**
     * Determines whether the font is underlined.
     *
     * @return true if the font is underlined
     */
    public boolean isUnderline() {
        return (style & UNDERLINE) != 0;
    }
    
    /**
     * Renders a debug representation of the object.
     * 
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer(Font.class.getName());
        out.append(" (");
        out.append(getTypeface());
        out.append(" /");
        if (isPlain()) {
            out.append(" Plain");
        }
        if (isBold()) {
            out.append(" Bold");
        }
        if (isItalic()) {
            out.append(" Italic");
        }
        if (isLineThrough()) {
            out.append(" LineThrough");
        }
        if (isOverline()) {
            out.append(" Overline");
        }
        if (isUnderline()) {
            out.append(" Underline");
        }
        out.append(" / ");
        out.append(getSize());
        out.append(")");
        return out.toString();
    }
}
