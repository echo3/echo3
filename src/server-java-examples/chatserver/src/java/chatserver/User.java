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
 * A representation of a chat user.
 */
public class User {

    private String name;
    private String authToken;
    private long lastActionTime;
    
    /**
     * Creates a new <code>User</code> with the specified name.
     * 
     * @param name the name of the user
     */
    public User(String name) {
        this.name = name;
        authToken = Long.toString(((long) (Math.random() * Long.MAX_VALUE)), 36);
        touch();
    }
    
    /**
     * Validates an authentication token against the user's authentication 
     * token.
     * 
     * @param authToken the token to validate
     * @return true if the token is valid
     */
    public boolean authenticate(String authToken) {
        return this.authToken.equals(authToken);
    }
    
    /**
     * Returns the user's authentication token.
     * 
     * @return the token
     */
    public String getAuthToken() {
        return authToken;
    }
    
    /**
     * Returns the time of the user's last action.
     * 
     * @return the time 
     */
    public long getLastActionTime() {
        return lastActionTime;
    }
    
    /**
     * Returns the user's name.
     * 
     * @return the user's name
     */
    public String getName() {
        return name;
    }
    
    /**
     * Updates the time of the user's last action.
     */
    public void touch() {
        lastActionTime = System.currentTimeMillis();
    }
}
