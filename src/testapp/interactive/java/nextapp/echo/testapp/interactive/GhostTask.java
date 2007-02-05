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

//import nextapp.echo.app.Button;
//import nextapp.echo.app.TaskQueueHandle;

/**
 * Note to developers who might use this class as an example:
 * Don't.  This is a *very unusual* use of asynchronous tasks.
 * See the documentation for examples of how asynchronous tasks
 * might normally be used.
 */
public class GhostTask {
    
//    private InteractiveApp app;
//    private int clicksPerIteration = 1;
//    private boolean indefiniteAllowed;
//    private int iteration = 0;
//    private String[] script;
//    private int scriptIndex = 0;
//    private String[] startupScript;
//    
//    private TaskQueueHandle taskQueue;
//    
//    private int totalIterations = -1;
//    private int runTime = -1;
//    private long stopTime = -1;
//
//    private Runnable task = new Runnable() {
//    
//        /**
//         * @see java.lang.Runnable#run()
//         */
//        public void run() {
//            for (int i = 0; i < clicksPerIteration; ++i) {
//                if (script == null) {
//                    RandomClick.clickRandomButton();
//                } else {
//                    Button button = (Button) app.getDefaultWindow().getComponent(script[scriptIndex]);
//                    button.doAction();
//                    ++scriptIndex;
//                    if (scriptIndex >= script.length) {
//                        scriptIndex = 0;
//                    }
//                }
//            }
//            if (stopTime != -1 && System.currentTimeMillis() > stopTime) {
//                app.setGhostIterationWindowTitle(-1);
//                // Test complete.
//                app.stopGhostTest();
//            } else if (totalIterations != -1 && iteration >= totalIterations) {
//                app.setGhostIterationWindowTitle(-1);
//                // Test complete.
//                app.stopGhostTest();
//            } else if (indefiniteAllowed) {
//                ++iteration;
//                app.setGhostIterationWindowTitle(iteration);
//                app.enqueueTask(taskQueue, this);
//            }
//        }
//    };
//    
//    /**
//     * Creates a new <code>GhostTask</code>.
//     * 
//     * @param app the application to test
//     * @param taskQueue the <code>TaskQueueHandle</code> to which tasks will be 
//     *        added
//     */
//    public GhostTask() {
//        super();
//        indefiniteAllowed = !InteractiveApp.LIVE_DEMO_SERVER;
//    }
//    
//    public int getClicksPerIteration() {
//        return clicksPerIteration;
//    }
//    
//    public int getRunTime() {
//        return runTime;
//    }
//
//    public String[] getScript() {
//        return script;
//    }
//
//    public String[] getStartupScript() {
//        return startupScript;
//    }
//
//    public int getTotalIterations() {
//        return totalIterations;
//    }
//
//    public void setClicksPerIteration(int clicksPerIteration) {
//        this.clicksPerIteration = clicksPerIteration;
//    }
//
//    public void setScript(String[] script) {
//        this.script = script;
//    }
//
//    public void setRunTime(int runTime) {
//        this.runTime = runTime;
//        this.totalIterations = -1;
//    }
//
//    public void setStartupScript(String[] startupScript) {
//        this.startupScript = startupScript;
//    }
//
//    public void setTotalIterations(int totalIterations) {
//        this.totalIterations = totalIterations;
//        this.runTime = -1;
//    }
//
//    void startTask(InteractiveApp app, TaskQueueHandle taskQueue) {
//        this.app = app;
//        this.taskQueue = taskQueue;
//        if (runTime != -1) {
//            stopTime = System.currentTimeMillis() + runTime;
//        }
//        app.enqueueTask(taskQueue, task);
//    }
}
