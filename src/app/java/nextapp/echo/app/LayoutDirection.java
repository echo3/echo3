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
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;

/**
 * Describes the layout direction of text and content to provide support 
 * for bidirectional localization.
 */
public class LayoutDirection 
implements Serializable {
    
    private static final Collection RTL_LANGUAGES;
    static {
        Collection rtlLanguages = new HashSet();
        rtlLanguages.add("ar"); // Arabic
        rtlLanguages.add("fa"); // Persian
        rtlLanguages.add("iw"); // Hebrew
        rtlLanguages.add("ur"); // Urdu
        RTL_LANGUAGES = Collections.unmodifiableCollection(rtlLanguages);
    }
    
    public static final LayoutDirection LTR = new LayoutDirection(true);
    public static final LayoutDirection RTL = new LayoutDirection(false);
    
    /**
     * Returns the default <code>LayoutDirection</code> for the specified
     * <code>Locale</code>.
     * 
     * @param locale the locale
     * @return the default layout direction
     */
    public static LayoutDirection forLocale(Locale locale) {
        return RTL_LANGUAGES.contains(locale.getLanguage()) ? RTL : LTR;
    }
    
    private boolean leftToRight;
    
    /**
     * Creates a new <code>LayoutDirection</code>
     * 
     * @param leftToRight a flag indicating whether the layout direction 
     *        is left-to-right.
     */
    private LayoutDirection(boolean leftToRight) {
        super();
        this.leftToRight = leftToRight;
    }
    
    /**
     * Determines if the <code>LayoutDirection</code> is left-to-right.
     * 
     * @return true if the <code>LayoutDirection</code> is left-to-right.
     */
    public boolean isLeftToRight() {
        return leftToRight;
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        return leftToRight ? "LTR" : "RTL";
    }
}
