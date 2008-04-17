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

package chatserver;

/**
 * A representation of the state of the chat engine.
 * This object is the main entry-point for the servlet
 * to update and query the state of the chat room.
 */
public class Server {

    private UserManager userManager;
    private MessageStore messageStore;
    
    /**
     * Creates a new <code>Server</code>.
     */
    public Server() {
        super();
        userManager = new UserManager();
        messageStore = new MessageStore();
    }
    
    /**
     * Adds a user.
     * 
     * @param userName the user name
     * @param remoteHost the remote host requesting the operation
     * @return an authentication token if the user was successfully added or
     *         null if it was not (e.g., due to the name already being in use)
     */
    public String addUser(String userName, String remoteHost) {
        String token = userManager.add(userName);
        if (token != null) {
            messageStore.post(null, "User \"" + userName + "\" has joined the chat.");
            Log.log(Log.ACTION_AUTH, remoteHost, userName, null);
        }
        return token;
    }
    
    /**
     * Retrieves all messages with ids greater than the specified id.
     * 
     * @param lastRetrievedId the id of the last message retrieved
     * @return an array containing messages posted after the message identified
     */
    public Message[] getMessages(long lastRetrievedId) {
        return messageStore.getMessages(lastRetrievedId);
    }
    
    /**
     * Returns an array of recently posted messages.
     * This method is queried by clients that have just joined the chat room
     * to retrieve context on the chat.
     * 
     * @return the recently posted messages
     */
    public Message[] getRecentMessages() {
        return messageStore.getRecentMessages();
    }
    
    /**
     * Removes a user from the chat room.
     * 
     * @param userName the name of the user
     * @param authToken the authentication token provided to the
     *        user when s/he was authenticated
     * @param remoteHost the remote host requesting the operation
     * @return true if the user was successfully removed
     */
    public boolean removeUser(String userName, String authToken, String remoteHost) {
        if (userManager.authenticate(userName, authToken)) {
            userManager.remove(userName);
            messageStore.post(null, "User \"" + userName + "\" has exited the chat.");
            Log.log(Log.ACTION_EXIT, remoteHost, userName, null);
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Posts a message.
     * 
     * @param userName the name of the posting user
     * @param authToken the authentication token provided to the posting
     *        user when s/he was authenticated
     * @param remoteHost the remote host requesting the operation
     * @param messageContent the content of the message to post
     * @return true if the message was successfully posted
     */
    public boolean postMessage(String userName, String authToken, String remoteHost, String messageContent) {
        if (userManager.authenticate(userName, authToken)) {
            messageStore.post(userName, messageContent);
            Log.log(Log.ACTION_POST, remoteHost, userName, messageContent);
            return true;
        } else {
            return false;
        }
    }
}
