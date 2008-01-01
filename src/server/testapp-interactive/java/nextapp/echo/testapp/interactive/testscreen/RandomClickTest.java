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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.RandomClick;

/**
 * Test to randomly click "n" buttons in InteractiveTest in a single server
 * interaction. The primary purpose of this test is to ensure proper behavior of
 * the ServerUpdateManager under extreme conditions.
 */
public class RandomClickTest extends Column {

    /**
     * Default constructor.
     */
    public RandomClickTest() {
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        setCellSpacing(new Extent(20));
        
        add(new Label("This test will randomly click a number of buttons within this application in a single server interaction. " +
                "The primary purpose of this test is to ensure proper behavior of the ServerUpdateManager.  Durations of greater " +
                "than 100 clicks are disabled on the live demo server.  Note that the 1,000,000 click test may take one or two " +
                "minutes to complete depending on the performance of the server."));
        
        addRandomClickButton(1);
        addRandomClickButton(10);
        addRandomClickButton(100);
        if (!InteractiveApp.LIVE_DEMO_SERVER) {
            addRandomClickButton(1000);
            addRandomClickButton(10000);
            addRandomClickButton(100000);
            addRandomClickButton(1000000);
        }
        
        Button button = new Button("Exit-ReEnter");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().displayWelcomePane();
                InteractiveApp.getApp().displayTestPane();
            }
        });
        add(button);
    }
        
    /**
     * Adds a test button that will randomly click the specified number of 
     * buttons when invoked.
     * 
     * @param clickCount the number of buttons to click
     */
    private void addRandomClickButton(final int clickCount) {
        Button button = new Button("Perform " + clickCount + " Random Click" + (clickCount == 1 ? "" : "s"));
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < clickCount; ++i) {
                    RandomClick.clickRandomButton();
                }
            }
        });
        add(button);
    }
}
