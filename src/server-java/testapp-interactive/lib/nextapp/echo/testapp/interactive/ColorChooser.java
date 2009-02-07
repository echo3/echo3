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

package nextapp.echo.testapp.interactive;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.RadioButton;
import nextapp.echo.app.Row;
import nextapp.echo.app.Style;
import nextapp.echo.app.button.ButtonGroup;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * An awful little Color chooser.  Use the one in Extras, it's vastly superior.
 */
public class ColorChooser extends Row {

    private static final Color[] COLORS = new Color[] { Color.BLACK, Color.BLUE, Color.GREEN, Color.CYAN, Color.RED, Color.MAGENTA, 
            Color.YELLOW, Color.WHITE };
    
    
    private static Style BUTTON_STYLE;
    static {
        MutableStyle style = new MutableStyle();
        style.set(Button.PROPERTY_INSETS, new Insets(5));
        style.set(Button.PROPERTY_WIDTH, new Extent(30, Extent.PX));
        style.set(Button.PROPERTY_ALIGNMENT, Alignment.ALIGN_CENTER);
        BUTTON_STYLE = style;
    }
    
    private class ColorButton extends RadioButton {
        
        public ColorButton(Color color) {
            super();
            setBackground(color);
            setStyle(BUTTON_STYLE);
            setGroup(group);
        }
    }
    
    private ButtonGroup group = new ButtonGroup();
    private Color color;
    
    public ColorChooser() {
        super();
        setCellSpacing(new Extent(1, Extent.EM));
        for (int i = 0; i < COLORS.length; ++i) {
            final ColorButton colorButton = new ColorButton(COLORS[i]);
            colorButton.addActionListener(new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    ColorChooser.this.color = colorButton.getBackground(); 
                }
            });
            add(colorButton);
        }
    }
    
    public Color getColor() {
        return color;
    }
}
