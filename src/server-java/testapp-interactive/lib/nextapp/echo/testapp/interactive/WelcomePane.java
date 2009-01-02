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

import nextapp.echo.app.Button;
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
 * <code>ContentPane</code> which displays a welcome/instruction message to 
 * users when they initially visit the application.
 */
public class WelcomePane extends ContentPane {
    
    private Button continueButton;

    /**
     * Default constructor.
     */
    public WelcomePane() {
        super();
        
        setStyleName("WelcomePane");
        setRenderId("WelcomePane");
        
        Label label;

        Column column = new Column();
        column.setRenderId("MainColumn");
        column.setStyleName("WelcomePane.Column");
        add(column);
        
        label = new Label(Styles.NEXTAPP_LOGO);
        column.add(label);
        
        label = new Label(Styles.ECHO_IMAGE);
        column.add(label);
        
        label = new Label(Styles.INTERACTIVE_TEST_APPLICATION_IMAGE);
        column.add(label);
        
        WindowPane loginWindow = new WindowPane();
        loginWindow.setMaximizeEnabled(true);
        loginWindow.setTitle("Welcome to the NextApp Echo Test Application");
        loginWindow.setStyleName("WelcomePane");
        loginWindow.setClosable(false);
        add(loginWindow);
        
        SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP, true);
        loginWindow.add(splitPane);
        
        Row controlRow = new Row();
        controlRow.setStyleName("ControlPane");
        splitPane.add(controlRow);
        
        continueButton = new Button("Continue", Styles.ICON_24_YES);
        continueButton.setRenderId("WelcomePaneEnter");
        continueButton.setId("EnterTestApplication");
        continueButton.setStyleName("ControlPane.Button");
        continueButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().displayTestPane();
            }
        });
        controlRow.add(continueButton);
        
        Column infoColumn = new Column();
        infoColumn.setInsets(new Insets(20, 5));
        infoColumn.setCellSpacing(new Extent(10));
        splitPane.add(infoColumn);
        
        label = new Label("Please read the following before using the test application:");
        label.setFont(new Font(null, Font.BOLD, null));
        infoColumn.add(label);
        
        label = new Label("This application was built to interactively test components of Echo during development.  "
                + "It is also being (mis)used as a public demonstration of Echo's capabilities. "
                + "Note that if this is a development version of Echo, then some "
                + "of the features and capabilities demonstrated in this application may not be complete.");
        infoColumn.add(label);

        label = new Label("Please visit the Echo Home Page @ http://www.nextapp.com/products/echo for more information.");
        infoColumn.add(label);
    }
    
    /**
     * @see nextapp.echo.app.Component#init()
     */
    public void init() {
        super.init();
        getApplicationInstance().setFocusedComponent(continueButton);
    }
}
