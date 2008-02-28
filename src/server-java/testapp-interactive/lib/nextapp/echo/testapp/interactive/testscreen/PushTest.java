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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Button;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.app.Column;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;

/**
 * Test for asynchronous (server push) operations.
 */
public class PushTest extends Column {
    
    /**
     * Thread to simulate long-running operation on server.
     * Note that threading is not allowed by J2EE containers
     * conforming to the 1.3 (or earlier) J2EE specification.
     * If you plan on deploying an Echo user interface to such
     * a container, please refrain from using this class as 
     * an example.
     */
    private class SimulatedServerOperation 
    extends Thread {
        
        private int percentComplete = 0;
        
        public void run() {
            while (percentComplete < 100) {
                percentComplete += (Math.random() * 20);
                if (percentComplete > 100) {
                    percentComplete = 100;
                }
                ApplicationInstance app = getApplicationInstance();
                if (app != null) {
                    app.enqueueTask(taskQueue, new ProgressUpdateTask(percentComplete));
                    try {
                        Thread.sleep((long) (Math.random() * 1000));
                    } catch (InterruptedException ex) { }
                }
            }
        }
    }
    
    private class ProgressUpdateTask 
    implements Runnable {
        
        private int percentComplete;
        
        private ProgressUpdateTask(int percentComplete) {
            this.percentComplete = percentComplete;
        }
        
        /**
         * @see java.lang.Runnable#run()
         */
        public void run() {
            if (percentComplete < 100) {
                statusLabel.setText("Asynchronous operation in progress; " + percentComplete 
                        + "% complete.");
            } else {
                statusLabel.setText("Asynchronous operation complete.");
                getApplicationInstance().removeTaskQueue(taskQueue);
                taskQueue = null;
            }
        }
    }
    
    private TaskQueueHandle taskQueue;
    private Label statusLabel;
    
    public PushTest() {
        super();
        
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        setCellSpacing(new Extent(20));
        
        statusLabel = new Label("Asynchronous operation not active.");
        add(statusLabel);
        
        Button startButton = new Button("Start Asynchronous (Server Push) Operation");
        startButton.setStyleName("Default");
        startButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (taskQueue == null) {
                    // Only start new operation if taskQueue is null, indicating that last operation has completed.
                    taskQueue = getApplicationInstance().createTaskQueue();
                    new SimulatedServerOperation().start();
                }
            }
        });
        add(startButton);
    }
    
    /**
     * @see nextapp.echo.app.Component#dispose()
     */
    public void dispose() {
        if (taskQueue != null) {
            getApplicationInstance().removeTaskQueue(taskQueue);
        }
        super.dispose();
    }
    
}
