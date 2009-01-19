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
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.GhostTask;
import nextapp.echo.testapp.interactive.InteractiveApp;

/**
 * Test to initiate a client-server push "loop" that autonomously clicks random
 * on-screen buttons.
 */
public class PushGhostTest extends Column {
    
    /**
     * Default constructor.
     */
    public PushGhostTest() {
        super();
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        setCellSpacing(new Extent(3));
        
        Label label; 
        label = new Label("This test will cause the application to continuously push asynchronous updates "
                + "to the client by clicking buttons randomly on the screen.  Once started, the test cannot be "
                + "stopped until your application session is destroyed, i.e., by exiting your browser or "
                + "manually clearing the session cookie.");
        add(label);
        
        if (InteractiveApp.LIVE_DEMO_SERVER) {
            label = new Label("Because you are visiting this application on the nextapp.com server, we have disabled "
                    + "the options to run this test indefinitely and/or with a 0ms callback interval.  If you install this "
                    + "application on your own server, you will be given the option of running the more extreme version "
                    + "of this test.  A binary Web Archive (WAR file) version of this application is provided by the "
                    + "standard Echo download.");
            add(label);
        }
        
        addTestButton(500, 20, 1);
        
        if (!InteractiveApp.LIVE_DEMO_SERVER) {
            addTestButton(0, 10, 1);
            addTestButton(0, 20, 1);
            addTestButton(0, 60, 1);
            addTestButton(0, 300, 1);
            addTestButton(0, 600, 1);
            addTestButton(0, 3600, 1);
            addTestButton(0, 0, 1);

            addTestButton(0, 10, 10);
            addTestButton(0, 20, 10);
            addTestButton(0, 60, 10);
            addTestButton(0, 300, 10);
            addTestButton(0, 600, 10);
            addTestButton(0, 3600, 10);
            addTestButton(0, 0, 10);

            addTestButton(0, 10, 100);
            addTestButton(0, 20, 100);
            addTestButton(0, 60, 100);
            addTestButton(0, 300, 100);
            addTestButton(0, 600, 100);
            addTestButton(0, 3600, 100);
            addTestButton(0, 0, 100);

            addCountTestButton(0, 60);
            addCountTestButton(10, 60);
            addCountTestButton(20, 60);
            addCountTestButton(100, 60);
            addCountTestButton(1000, 60);
            addCountTestButton(3000, 60);
        }
        
    }
    
    private void addTestButton(final int callbackInterval, final int runTimeInSeconds, final int clicksPerIteration) {
        StringBuffer text = new StringBuffer("START (Runtime: ");
        text.append(runTimeInSeconds == 0 ? "Indefinite" : (runTimeInSeconds + "s"));
        text.append(", Callback interval: ");
        text.append(callbackInterval);
        text.append("ms, Clicks Per Iteration: ");
        text.append(clicksPerIteration);
        Button startButton = new Button(text.toString());
        startButton.setStyleName("Default");
        startButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                InteractiveApp app = (InteractiveApp)getApplicationInstance();
                GhostTask ghostTask = new GhostTask();
                ghostTask.setClicksPerIteration(clicksPerIteration);
                if (runTimeInSeconds > 0) {
                    ghostTask.setRunTime(runTimeInSeconds * 1000);
                }
                app.startGhostTask(ghostTask, callbackInterval);
            }
        });
        add(startButton);
    }
    
    private void addCountTestButton(final int callbackInterval, final int runTimeInSeconds) {
        StringBuffer text = new StringBuffer("COUNT ONLY (Runtime: ");
        text.append(runTimeInSeconds == 0 ? "Indefinite" : (runTimeInSeconds + "s"));
        text.append(", Callback interval: ");
        text.append(callbackInterval);
        text.append("ms");
        Button startButton = new Button(text.toString());
        startButton.setStyleName("Default");
        startButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                InteractiveApp app = (InteractiveApp)getApplicationInstance();
                GhostTask ghostTask = new GhostTask();
                ghostTask.setCountOnly(true);
                if (runTimeInSeconds > 0) {
                    ghostTask.setRunTime(runTimeInSeconds * 1000);
                }
                app.startGhostTask(ghostTask, callbackInterval);
            }
        });
        add(startButton);
    }
}
