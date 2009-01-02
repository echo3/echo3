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

import java.io.PrintStream;
import java.text.DateFormat;
import java.util.Date;

/**
 * Primitive utility to log posted messages and users entering and leaving 
 * chat room.
 */
public class Log {

    private static final DateFormat DATE_FORMAT = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT);
    
    public static final int ACTION_POST = 1; 
    public static final int ACTION_AUTH = 2; 
    public static final int ACTION_EXIT = 3;
    
    private static PrintStream logStream = System.err;
    
    /**
     * Sets the <code>PrintStream</code> to which log messages will be written.
     * 
     * @param logStream the log <code>PrintStream</code>
     */
    public static final void setLogStream(PrintStream logStream) {
        Log.logStream = logStream;
    }
    
    /**
     * Logs a chat operation.
     * 
     * @param action the type of action taken, one of the following values:
     *        <ul>
     *         <li><code>ACTION_POST</code></li>
     *         <li><code>ACTION_AUTH</code></li> 
     *         <li><code>ACTION_EXIT</code></li> 
     *        </ul>
     * @param remoteHost the remote host performing the action
     * @param userName the name of the user
     * @param message the posted message content, if applicable
     */
    public static final void log(int action, String remoteHost, String userName, String message) {
        if (logStream == null) {
            // Do nothing.
            return;
        }
        String time = DATE_FORMAT.format(new Date());
        String logMessage;
        switch (action) {
        case ACTION_POST:
            logMessage = "ECHOCHAT[" + time + "] POST: remoteHost=" + remoteHost + ", userName=" + userName 
                    + ", message=" + message;
            break;
        case ACTION_AUTH:
            logMessage = "ECHOCHAT[" + time + "] AUTH: remoteHost=" + remoteHost + ", userName=" + userName;
            break;
        case ACTION_EXIT:
            logMessage = "ECHOCHAT[" + time + "] EXIT: remoteHost=" + remoteHost + ", userName=" + userName;
            break;
        default:
            throw new IllegalArgumentException("Invalid action.");
        }
        logStream.println(logMessage);
    }
}
