/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

package nextapp.echo.testapp.interactive;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;

/**
 * 
 */
public class StyleUtil {
    
    public static final String QUASI_LATIN_TEXT_1 = 
            "Ymo, lobortis camur qui typicus voco.  Jugis similis wisi singularis dolor suscipit.  " +
            "Fatua premo regula fatua huic, vereor dolus aptent tego, quidne vero valetudo esse enim exerci.  " +
            "Refero quae ut importunus si sit.  Aliquam illum, nostrud qui duis nimis refero esse jugis " +
            "sit jus, duis, tum vel capio.  Quadrum pertineo dignissim diam in ut adipiscing magna eros " +
            "neque exerci vulputate commodo indoles.  Sed dolor, oppeto pala eu veniam.  Ullamcorper typicus " +
            "hos erat neque suscipere defui feugiat velit acsi pneum vel comis luptatum." +
            "Zelus quidem, natu, delenit, veniam, tristique eligo transverbero.  Ea, plaga vel et illum " +
            "sed diam quia iriure.  Ludus quidem, tation pecus, interdico quis sit mos cui ideo feugait nutus " +
            "utinam at iriure.  Secundum vulputate inhibeo wisi pneum fatua facilisi fatua consequat facilisi " +
            "lucidus.  Validus verto vel sudo letalis molior eum exerci epulae nostrud haero esse.  Utrum " +
            "aliquip, pneum typicus similis minim sed laoreet, quidem.  Oppeto ille nutus neque veniam, et, " +
            "abdo, conventio sit, ea wisi neo dolore. At, inhibeo laoreet validus nulla, delenit nimis et " +
            "quis turpis neo dignissim abigo adsum.  Aliquam illum, nostrud qui duis nimis refero esse jugis " +
            "sit jus, duis, tum vel capio.  Nobis vero refero valetudo huic enim nobis wisi comis haero " +
            "validus.  Consequat foras, opto torqueo illum, adipiscing nobis.  Te patria, feugiat, feugiat ut " +
            "tincidunt ventosus nisl amet lucidus, premo vel illum exerci.  Exerci imputo meus ut ingenium " +
            "tincidunt vulpes, multo ut, vindico luptatum.  Duis hendrerit brevitas tristique esse abluo in " +
            "persto praesent, in ibidem augue melior delenit quadrum.  Veniam lobortis duis wisi gilvus immitto " +
            "defui amet importunus indoles pneum odio hos minim.  Olim nimis suscipere ullamcorper, utinam ut " +
            "odio, praemitto, praesent facilisi ad consequat facilisi.  Duis hendrerit brevitas tristique esse " +
            "abluo in persto praesent, in ibidem augue melior delenit quadrum.  Sudo bis, inhibeo exerci proprius " +
            "magna macto feugiat autem vel veniam vulputate ut.  Aliquip, multo tego, esse letalis similis, " +
            "abbas abluo elit aliquam qui olim ymo, torqueo.  Jus suscipit valetudo velit virtus dolore autem " +
            "nulla imputo nostrud minim.  Nisl vero sino paratus acsi similis epulae odio euismod refero " +
            "tation.  Autem conventio regula accumsan fatua virtus.";

    
    // Everyone shares the "next" constants.
    private static int nextBorderStyle = 0;
    private static int nextBorderSize = 0;

    private static Font.Typeface[] TYPEFACES = new Font.Typeface[]{Font.COURIER_NEW, Font.VERDANA, Font.TIMES_NEW_ROMAN}; 
    
    private static int[] BORDER_SIZES = new int[]{0, 1, 2, 3, 4, 5, 10, 15, 20, 40, 80};
    
    private static int[] FONT_SIZES = new int[]{6, 8, 10, 12, 16, 24, 48, 72};
    
    private static final int[] BORDER_STYLES 
            = new int[]{Border.STYLE_NONE, Border.STYLE_INSET, Border.STYLE_OUTSET, Border.STYLE_SOLID,
            Border.STYLE_DASHED, Border.STYLE_DOTTED, Border.STYLE_DOUBLE, Border.STYLE_RIDGE, Border.STYLE_GROOVE};
    
    /**
     * Choices for random horizontal layout data. <code>Alignment.DEFAULT</code>
     * listed multiple times to create bias.
     */
    private static final int[] HORIZONTAL_ALIGNMENT_VALUES = new int[] { Alignment.DEFAULT, Alignment.DEFAULT, Alignment.DEFAULT,
            Alignment.LEADING, Alignment.LEFT, Alignment.CENTER, Alignment.RIGHT, Alignment.TRAILING };

    /**
     * Choices for random vertical layout data. <code>Alignment.DEFAULT</code>
     * listed multiple times to create bias.
     */
    private static final int[] VERTICAL_ALIGNMENT_VALUES = new int[] { Alignment.DEFAULT, Alignment.DEFAULT, Alignment.TOP,
            Alignment.CENTER, Alignment.BOTTOM };
    
    public static Alignment randomAlignmentHV() {
        return new Alignment(HORIZONTAL_ALIGNMENT_VALUES[(int) (Math.random() * HORIZONTAL_ALIGNMENT_VALUES.length)],
                VERTICAL_ALIGNMENT_VALUES[(int) (Math.random() * VERTICAL_ALIGNMENT_VALUES.length)]);
    }
    
    public static Border randomBorder() {
        return new Border(randomExtent(25), randomColor(), randomBorderStyle());
    }
    
    public static int randomBorderStyle() {
        return BORDER_STYLES[(int) (Math.random() * BORDER_STYLES.length)];
    }
    
    public static  Color randomBrightColor() {
        return new Color(((int) (16777216 * Math.random())) | 0xb0b0b0);
    }

    public static Color randomColor() {
        return new Color((int) (16777216 * Math.random()));
    }
    
    public static Extent randomExtent(int max) {
        return new Extent((int) (Math.random() * max), Extent.PX);
    }
    
    public static Font randomFont() {
        Font.Typeface typeface = TYPEFACES[(int) (Math.random() * TYPEFACES.length)];
        Extent size = new Extent(FONT_SIZES[(int) (Math.random() * FONT_SIZES.length)]);
        
        // 1-in-4 chance of each style flag being set:
        int style = 0;
        style |= (((int) (Math.random() * 4)) == 0) ? Font.BOLD : 0;
        style |= (((int) (Math.random() * 4)) == 0) ? Font.ITALIC : 0;
        style |= (((int) (Math.random() * 4)) == 0) ? Font.UNDERLINE : 0;
        style |= (((int) (Math.random() * 4)) == 0) ? Font.OVERLINE : 0;
        style |= (((int) (Math.random() * 4)) == 0) ? Font.LINE_THROUGH : 0;
        
        return new Font(typeface, style, size);
    }
    
    public static Border nextBorderStyle(Border border) {
        if (border == null) {
            return new Border(1, Color.BLACK, Border.STYLE_SOLID);
        } else {
            return new Border(border.getSize(), border.getColor(), 
                    BORDER_STYLES[nextBorderStyle++ % BORDER_STYLES.length]);
        }
    }
    
    public static Border nextBorderSize(Border border) {
        if (border == null) {
            return new Border(1, Color.BLACK, Border.STYLE_SOLID);
        } else {
            return new Border(BORDER_SIZES[nextBorderSize++ % BORDER_SIZES.length],
                    border.getColor(), border.getStyle());
        }
    }
}
