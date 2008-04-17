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

package chatclient;

import java.io.IOException;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.app.Window;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.webcontainer.ContainerContext;

/**
 * Chat Client <code>ApplicationInstance</code> implementation.
 */
public class ChatApp extends ApplicationInstance {

    /**
     * Returns the active <code>ChatApp</code>.
     * 
     * @return the active <code>ChatApp</code>
     */
    public static ChatApp getApp() {
        return (ChatApp) getActive();
    }
    
    private ChatSession chatSession;
    private TaskQueueHandle incomingMessageQueue;
    
    // Auto-logout times set very short for demonstration purposes.
    private static final int POST_INTERVAL_AUTO_LOGOUT_WARNING = 2 * 60 * 1000; // 2 minutes
    private static final int POST_INTERVAL_AUTO_LOGOUT = 3 * 60 * 1000;         // 3 minutes
    
    private long lastActionTime;
    private long lastPostTime;
    private int pollingInterval = 1000;
    
    private MessageDialog logoutWarningDialog;
    
    /**
     * Calculates the appropriate client-server polling interval based on the
     * delta between the current time and the last interesting event (i.e.
     * posted message in the chat) which occurred.
     * 
     * @return the appropriate polling interval
     */
    private int calculatePollingInterval() {
        long delta = System.currentTimeMillis() - lastActionTime;
        if (delta < 10 * 1000) {
            // Last action 0-10 seconds ago: 1 second poll update intervals.
            return 1000;
        } else if (delta < 20 * 1000) {
            // Last action 10-20 seconds ago: 2 second poll update intervals.
            return 2000;
        } else if (delta < 30 * 1000) {
            // Last action 20-30 seconds ago: 3 second poll update intervals.
            return 3000;
        } else if (delta < 60 * 1000) {
            // Last action 30-60 seconds ago: 5 second poll update intervals.
            return 5000;
        } else {
            // Last action > 60 seconds ago: 10 second poll update intervals.
            return 10000;
        }
    }
    
    /**
     * Attempts to connect to the chat server with the specified user name.
     * Displays a <code>ChatScreen</code> for the user if the user
     * is successfully connected.  Performs no action if the user is not
     * successfully connected.
     * 
     * @return true if the operation was successfully completed,
     *         false otherwise
     */
    public boolean connect(String userName) {
        try {
            chatSession = ChatSession.forUserName(userName);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        if (chatSession == null) {
            return false;
        } else {
            if (incomingMessageQueue != null) {
                throw new IllegalStateException();
            }
            incomingMessageQueue = createTaskQueue();
            updatePollingInterval(true);
            lastPostTime = System.currentTimeMillis();
            
            getDefaultWindow().setContent(new ChatScreen());
            return true;
        }
    }
    
    /**
     * Disconnects from the chat server and logs the current user out.
     * Displays the <code>LoginScreen</code>.
     */
    public void disconnect() {
        try {
            chatSession.dispose();
            chatSession = null;
            if (incomingMessageQueue != null) {
                removeTaskQueue(incomingMessageQueue);
                incomingMessageQueue = null;
            }
            logoutWarningDialog = null;
            getDefaultWindow().setContent(new LoginScreen());
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }
    
    /**
     * Retrieves new messages from the <code>ChatSession</code>.  
     * Once the new messages are deleted they are removed from the queue of 
     * 'new' messages.
     * Invoking this method thus alters the state of the new message queue.
     * 
     * @return an array of new messages 
     */
    public ChatSession.Message[] getNewMessages() {
        return chatSession.getNewMessages();
    }
    
    /**
     * Returns the user name of the currently logged-in user.
     * 
     * @return the user name
     */
    public String getUserName() {
        return chatSession == null ? null : chatSession.getUserName();
    }
    
    /**
     * The <code>hasQueuedTasks()</code> method has been overridden such that we
     * can perform checks at every polling interval.  Alternatively tasks could
     * be added using threads running in the background, but for compliance 
     * with earlier versions of the J2EE specification which do not allow 
     * multi-threading, such work is accomplished in this method. 
     * 
     * @see nextapp.echo.app.ApplicationInstance#hasQueuedTasks()
     */
    public boolean hasQueuedTasks() {
        // Poll server and determine if any new messages have been posted.
        if (pollServer()) {
            // Add new messages to ChatScreen.
            final ChatScreen chatScreen = (ChatScreen) getDefaultWindow().getContent();
            enqueueTask(incomingMessageQueue, new Runnable(){
                public void run() {
                    chatScreen.updateMessageList();
                    updatePollingInterval(true);
                }
            });
        }
        
        // Determine if the polling interval should be updated, and if 
        // necessary, queue a task to update it.
        if (pollingInterval != calculatePollingInterval()) {
            enqueueTask(incomingMessageQueue, new Runnable() {
                public void run() {
                    updatePollingInterval(false);
                }
            });
        }
        
        if (System.currentTimeMillis() - lastPostTime > POST_INTERVAL_AUTO_LOGOUT) {
            // If the user has not posted any messages in a period of
            // time, automatically log the user out.
            enqueueTask(incomingMessageQueue, new Runnable() {
                public void run() {
                    disconnect();
                }
            });
        } else if (System.currentTimeMillis() - lastPostTime > POST_INTERVAL_AUTO_LOGOUT_WARNING) {
            // If the user has not posted any messages in a period of
            // time, raise a dialog box to warn him/her that s/he may
            // soon be automatically logged out.
            enqueueTask(incomingMessageQueue, new Runnable() {
                public void run() {
                    if (logoutWarningDialog == null) {
                        logoutWarningDialog = new MessageDialog(Messages.getString("AutoLogoutWarningDialog.Title"),
                                Messages.getString("AutoLogoutWarningDialog.Message"), MessageDialog.TYPE_CONFIRM, 
                                MessageDialog.CONTROLS_OK);
                        getDefaultWindow().getContent().add(logoutWarningDialog);
                        logoutWarningDialog.addActionListener(new ActionListener() {
                        
                            /**
                             * Reset last post time if user engages the dialog.
                             * 
                             * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
                             */
                            public void actionPerformed(ActionEvent e) {
                                lastPostTime = System.currentTimeMillis();
                                logoutWarningDialog = null;
                            }
                        });
                    }
                }
            });
        }
        
        return super.hasQueuedTasks();
    }
    
    /**
     * @see nextapp.echo.app.ApplicationInstance#init()
     */
    public Window init() {
        setStyleSheet(Styles.DEFAULT_STYLE_SHEET);
        Window window = new Window();
        window.setTitle(Messages.getString("Application.Title.Window"));
        window.setContent(new LoginScreen());
        return window;
    }
    
    /**
     * Polls the <code>Server</code> to determine if any new messages are
     * present.
     * 
     * @return true if any new messages are present
     */
    private boolean pollServer() {
        if (chatSession == null) {
            return false;
        }
        try {
            chatSession.pollServer();
            return chatSession.hasNewMessages();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }
    
    /**
     * Posts a message to the chat server for the logged-in user.
     * 
     * @param content the content of the message to post
     */
    public void postMessage(String content) {
        try {
            chatSession.postMessage(content);
            updatePollingInterval(true);
            lastPostTime = System.currentTimeMillis();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }
    
    /**
     * Updates the client-server polling interval based on the time since 
     * the last event of interest.  The interval is increased when nothing 
     * interesting appears to be occurring.
     * 
     * @param reset flag indicating whether an action has occurred, if true,
     *        the current time will be marked as the time of the last action
     *        and used in future calculations of polling interval.
     */
    private void updatePollingInterval(boolean reset) {
        if (reset) {
            lastActionTime = System.currentTimeMillis();
        }
        pollingInterval = calculatePollingInterval();
        ContainerContext containerContext = (ContainerContext) getContextProperty(
                ContainerContext.CONTEXT_PROPERTY_NAME);
        containerContext.setTaskQueueCallbackInterval(incomingMessageQueue, pollingInterval);
    }
}
