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

package nextapp.echo.testapp.interactive;

import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * A <code>WindowPane</code> which contains an event console.
 */
public class ConsoleWindowPane extends WindowPane {
    
    private Column column;
    private ContentPane logPane;
    
    public ConsoleWindowPane() {
        super();
        setTitle("Console");
        setStyleName("Default");
        
        SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP, new Extent(32));
        add(splitPane);
        
        Row controlRow = new Row();
        controlRow.setStyleName("ControlPane");
        splitPane.add(controlRow);
        
        Button button = new Button("Clear", Styles.ICON_24_NO);
        button.setStyleName("ControlPane.Button");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                column.removeAll();
            }
        });
        controlRow.add(button);
        
        logPane = new ContentPane();
        logPane.setFont(new Font(Font.MONOSPACE, Font.PLAIN, new Extent(10)));
        logPane.setForeground(Color.GREEN);
        logPane.setBackground(Color.BLACK);
        splitPane.add(logPane);
        
        column = new Column();
        column.setInsets(new Insets(5));
        logPane.add(column);
    }
    
    public void writeMessage(String message) {
        column.add(new Label(message));
        logPane.setVerticalScroll(new Extent(-1));
    }
}
