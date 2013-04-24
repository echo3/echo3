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

import nextapp.echo.app.Border;
import nextapp.echo.app.BoxShadow;
import nextapp.echo.app.BoxShadow.BoxStyle;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.RadioButton;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.testapp.interactive.ButtonColumn;

/**
 * Interactive test module for <code>BoxShadow</code>s.
 */
public class BoxShadowTest extends SplitPane {

    private static final long serialVersionUID = 1L;

    private WindowPane windowPane;
    private ContentPane contentPane;
    private Button btn1;
    private Button btn2;
    private Button btn3;
    private RadioButton btn4;

    public BoxShadowTest() {
        super();
        setStyleName("TestControls");

        Column groupContainerColumn = new Column();
        groupContainerColumn.setCellSpacing(new Extent(5));
        groupContainerColumn.setStyleName("TestControlsColumn");
        add(groupContainerColumn);

        contentPane = new ContentPane();
        add(contentPane);
        windowPane = new WindowPane();
        BoxShadow shadow = new BoxShadow(new Extent(30), new Extent(20), new Extent(15), new Extent(15), Color.DARKGRAY, BoxStyle.DEFAULT);
        windowPane.setBoxShadow(shadow);
        contentPane.add(windowPane);

        Grid grd = new Grid(1);
        grd.setInsets(new Insets(16));
        windowPane.add(grd);

        btn1 = new Button("Button normal");
        btn1.setInsets(new Insets(6));
        btn1.setBackground(Color.CYAN);
        shadow = new BoxShadow(new Extent(8), new Extent(8), new Extent(3), new Extent(5), Color.DARKGRAY, BoxStyle.DEFAULT);
        btn1.setBoxShadow(shadow);
        btn1.setRolloverEnabled(true);
        grd.add(btn1);

        btn2 = new Button("with border");
        btn2.setInsets(new Insets(6));
        btn2.setBackground(Color.CYAN);
        btn2.setBorder(new Border(4, Color.BLACK, Border.STYLE_DOTTED));
        shadow = new BoxShadow(new Extent(8), new Extent(8), new Extent(3), new Extent(5), Color.DARKGRAY, BoxStyle.DEFAULT);
        btn2.setBoxShadow(shadow);
        grd.add(btn2);

        btn3 = new Button("with rollover border");
        btn3.setInsets(new Insets(6));
        btn3.setBackground(Color.CYAN);
        btn3.setRolloverBorder(new Border(4, Color.BLACK, Border.STYLE_DOTTED));
        btn3.setRolloverEnabled(true);
        shadow = new BoxShadow(new Extent(8), new Extent(8), new Extent(3), new Extent(5), Color.DARKGRAY, BoxStyle.DEFAULT);
        btn3.setBoxShadow(shadow);
        grd.add(btn3);

        btn4 = new RadioButton("RadioButton");
        btn4.setInsets(new Insets(6));
        btn4.setBackground(Color.CYAN);
        shadow = new BoxShadow(new Extent(8), new Extent(8), new Extent(3), new Extent(5), Color.DARKGRAY, BoxStyle.DEFAULT);
        btn4.setBoxShadow(shadow);
        grd.add(btn4);

        // Content
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.add(new Label("Content"));
        groupContainerColumn.add(controlsColumn);

        controlsColumn.addButton("x: 10, y: 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(new BoxShadow(10, 0));
            }
        });
        controlsColumn.addButton("x: 0, y: 10", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(new BoxShadow(0, 10));
            }
        });
        controlsColumn.addButton("x:8, y: 8, blur:6, extent: 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(new BoxShadow(new Extent(8), new Extent(8), new Extent(6), new Extent(0), Color.DARKGRAY, BoxStyle.DEFAULT));
            }
        });
        controlsColumn.addButton("x:8, y: -8, blur:0, extent: 6", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(new BoxShadow(new Extent(8), new Extent(-8), new Extent(0), new Extent(6), Color.DARKGRAY, BoxStyle.DEFAULT));
            }
        });
        controlsColumn.addButton("x:4, y: 4, blur:6, extent: 0, INSET", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(new BoxShadow(new Extent(4), new Extent(4), new Extent(6), new Extent(0), Color.DARKGRAY, BoxStyle.INSET));
            }
        });
        controlsColumn.addButton("set null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                setShadow(null);
            }
        });
    }

    private void setShadow(BoxShadow shadow) {
        windowPane.setBoxShadow(shadow);
        btn1.setBoxShadow(shadow);
        btn2.setBoxShadow(shadow);
        btn3.setBoxShadow(shadow);
        btn4.setBoxShadow(shadow);
    }
}
