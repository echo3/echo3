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
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;

public class ReparentTest extends SplitPane {

    private Row testRow;
    
    private Column parentA;
    private Column parentB;
    private Button movingButton;
    
    public ReparentTest() {
        super();
        setStyleName("TestControls");

        SplitPaneLayoutData splitPaneLayoutData;

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        controlsColumn.addButton("Reparent!", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                if (movingButton.getParent() == parentA) {
                    parentB.add(movingButton);
                } else {
                    parentA.add(movingButton);
                }
            }
        });

        testRow = new Row();
        testRow.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testRow.setLayoutData(splitPaneLayoutData);
        add(testRow);
        
        parentA = new Column();
        parentA.setBorder(new Border(1, Color.BLUE, Border.STYLE_OUTSET));
        parentA.setBackground(Color.BLUE);
        parentA.setInsets(new Insets(15));
        testRow.add(parentA);
        
        parentB = new Column();
        parentB.setBorder(new Border(1, Color.GREEN, Border.STYLE_OUTSET));
        parentB.setBackground(Color.GREEN);
        parentB.setInsets(new Insets(15));
        testRow.add(parentB);
        
        movingButton = new Button("I move.");
        movingButton.setBorder(new Border(1, Color.CYAN, Border.STYLE_OUTSET));
        movingButton.setBackground(Color.CYAN);
        movingButton.setInsets(new Insets(15));
        movingButton.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                movingButton.setBackground(StyleUtil.randomBrightColor());
                movingButton.setBorder(new Border(1, movingButton.getBackground(), Border.STYLE_OUTSET));
            }
        });
        parentA.add(movingButton);
    }
}
