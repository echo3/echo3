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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * A store of active users.
 */
public class UserManager {
    
    /**
     * User timeout (15min * 60sec/min * 1000ms/sec).
     */
    private static final int TIMEOUT_MS = 15 * 60 * 1000;
    
    /**
     * User name to <code>User</code> mapping.
     */
    private Map userMap = new HashMap();
    
    /**
     * Attempts to add a new user.
     * 
     * @param userName the name of the user
     * @return an authentication token, if the user name is available or 
     *         null if it is not
     */
    public String add(String userName) {
        // Ensure no leading/trailing spaces are present in user name.
        if (userName.length() != userName.trim().length()) {
            return null; 
        }
        
        // Ensure user name is at least two characters in length.
        if (userName.length() < 2) {
            return null; 
        }
        
        User user = null;
        synchronized (userMap) {
            // Ensure user name is available.
            if (userMap.containsKey(userName)) {
                return null;
            }
            
            user = new User(userName);
            userMap.put(userName, user);
        }
        return user.getAuthToken();
    }
    
    /**
     * Authenticates a user based on user name and an authentication token.
     * 
     * @param userName the user's name
     * @param authToken the authentication token
     * @return true if the user is authenticated
     */
    public boolean authenticate(String userName, String authToken) {
        User user = (User) userMap.get(userName);
        if (user == null) {
            return false;
        }
        return user.authenticate(authToken);
    }
    
    /**
     * Performs clean-up operations, i.e., removing stale users.
     */
    public void purge() {
        long time = System.currentTimeMillis();
        synchronized (userMap) {
            Iterator userNameIt = userMap.keySet().iterator();
            while (userNameIt.hasNext()) {
                String userName = (String) userNameIt.next();
                User user = (User) userMap.get(userName);
                if (time - user.getLastActionTime() > TIMEOUT_MS) {
                    userNameIt.remove();
                }
            }
        }
    }

    /**
     * Removes the specified user.
     * 
     * @param userName the user's name
     */
    public void remove(String userName) {
        synchronized (userMap) {
            userMap.remove(userName);
        }
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer out = new StringBuffer();
        synchronized (userMap) {
            Iterator it = userMap.keySet().iterator();
            while (it.hasNext()) {
                out.append(it.next());
                if (it.hasNext()) {
                    out.append(", ");
                }
            }
        }
        return out.toString();
    }
}
