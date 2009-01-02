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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.testapp.interactive.ButtonColumn;

/**
 * A test for <code>Style</code>s.
 */
public class StyleTest extends SplitPane {

    public StyleTest() {
        super();
        setStyleName("TestControls");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);

        final Button testButton1 = new Button("Test button 1");
        final Button testButton2 = new Button("Test button 2");
        final Button testButton3 = new Button("Test button 3");
        
        final Column testColumn = new Column();
        testColumn.add(testButton1);
        testColumn.add(testButton2);
        testColumn.add(testButton3);
        add(testColumn);
        
        controlsColumn.addButton("Set Test Button Style (1,2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                MutableStyle style = new MutableStyle();
                style.set(Button.PROPERTY_BACKGROUND, Color.GREEN);
                testButton1.setStyle(style);
                testButton2.setStyle(style);
            }
        });
        
        controlsColumn.addButton("Set Test Button Style (1,2:red, 3:blue)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                MutableStyle style12 = new MutableStyle();
                style12.set(Button.PROPERTY_BACKGROUND, Color.RED);
                testButton1.setStyle(style12);
                testButton2.setStyle(style12);

                MutableStyle style3 = new MutableStyle();
                style3.set(Button.PROPERTY_BACKGROUND, Color.BLUE);
                testButton3.setStyle(style3);
            }
        });
        
        controlsColumn.addButton("Clear Test Button Style (1,2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testButton1.setStyle(null);
                testButton2.setStyle(null);
            }
        });
        
        controlsColumn.addButton("Clear Test Button Style (1,2,3)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testButton1.setStyle(null);
                testButton2.setStyle(null);
                testButton3.setStyle(null);
            }
        });
        
        controlsColumn.addButton("Set Test Button StyleName", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testButton1.setStyleName("Default");
                testButton2.setStyleName("Default");
                testButton3.setStyleName("Default");
            }
        });
        
        controlsColumn.addButton("Clear Test Button StyleName", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testButton1.setStyleName(null);
                testButton2.setStyleName(null);
                testButton3.setStyleName(null);
            }
        });
    }
}
