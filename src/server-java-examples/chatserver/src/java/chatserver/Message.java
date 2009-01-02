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

package chatserver;

/**
 * A representation of a single posted message.
 */
public class Message {

    private static int nextId = 0;
    
    private String userName;
    private long postTime;
    private String content;
    private long id;
    
    /**
     * Creates a new <code>Message</code>.
     * 
     * @param userName the name of the user posting the message
     * @param content the content of the message
     */
    public Message(String userName, String content) {
        super();
        this.userName = userName;
        this.content = content;
        postTime = System.currentTimeMillis();
        id = ++nextId;
    }
    
    /**
     * Returns the content of the message.
     * 
     * @return the content
     */
    public String getContent() {
        return content;
    }
    
    /**
     * Returns the sequentially assigned message id.
     * 
     * @return the message id
     */
    public long getId() {
        return id;
    }
    
    /**
     * Returns the name of user who posted the message.
     * 
     * @return the user name
     */
    public String getUserName() {
        return userName;
    }
    
    /**
     * Returns the time the message was posted.
     * 
     * @return the time
     */
    public long getPostTime() {
        return postTime;
    }
}
