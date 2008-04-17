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
 * A store for posted <code>Message</code>s.
 */
public class MessageStore {

    private static final int MAX_MESSAGES = 1000;
    private static final int RECENT_MESSAGES = 15;
    
    private long[] messageIds = new long[MAX_MESSAGES];
    private Message[] messages = new Message[MAX_MESSAGES];
    private int firstMessageIndex = 0;
    private int messageCount = 0;
    
    /**
     * Creates a new <code>MessageStore</code>.
     */
    public MessageStore() {
        super();
    }
    
    /**
     * Returns the message at the specified index.
     * 
     * @param index the index
     * @return the message
     */
    private Message getMessage(int index) {
        return messages[(firstMessageIndex + index) % MAX_MESSAGES];
    }
    
    /**
     * Retrieves all messages with ids greater than the specified id.
     * 
     * @param lastRetrievedId the id of the last message retrieved
     * @return an array containing messages posted after the message identified
     */
    public Message[] getMessages(long lastRetrievedId) {
        int startIndex = 0;
        while (startIndex < messageCount) {
            Message message = getMessage(startIndex);
            if (message.getId() > lastRetrievedId) {
                break;
            }
            ++startIndex;
        }
        Message[] matchingMessages = new Message[messageCount - startIndex];
        for (int i = startIndex; i < messageCount; ++i) {
            matchingMessages[i - startIndex] = getMessage(i);
        }
        return matchingMessages;
    }
    
    /**
     * Returns an array of recently posted messages.
     * This method is queried by clients that have just joined the chat room
     * to retrieve context on the chat.
     * 
     * @return the recently posted messages
     */
    public Message[] getRecentMessages() {
        Message[] matchingMessages = new Message[messageCount < RECENT_MESSAGES ? messageCount : RECENT_MESSAGES];
        for (int i = 0; i < matchingMessages.length; ++i) {
            matchingMessages[i] = getMessage(messageCount - matchingMessages.length + i); 
        }
        return matchingMessages;
    }
    
    /**
     * Posts a message.
     * 
     * @param userName the name of the user
     * @param messageContent the message content to post
     */
    public synchronized void post(String userName, String messageContent) {
        int messageIndex = (firstMessageIndex + messageCount) % MAX_MESSAGES;
        
        Message message = new Message(userName, messageContent);
        messages[messageIndex] = message;
        messageIds[messageIndex] = message.getId();

        if (messageCount < MAX_MESSAGES) {
            ++messageCount;
        } else {
            firstMessageIndex = (firstMessageIndex + 1) % MAX_MESSAGES;
        }
    }
}
