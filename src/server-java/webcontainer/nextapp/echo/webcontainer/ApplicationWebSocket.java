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

package nextapp.echo.webcontainer;

import java.io.IOException;
import nextapp.echo.app.util.Log;
import nextapp.echo.app.util.Uid;

/**
 * Basic interface for communication with Web Sockets.
 * 
 * @author Miro Yozov
 */
public abstract class ApplicationWebSocket {

    private static int SYNC_CLOSE_CODE = 8807;
    private static int DISPOSE_CLOSE_CODE = 8806;
    
    public interface Connection {
        public void close();
        public void close(int code, String message);
        public boolean isOpen();
        public void sendMessage(String string) throws IOException;
    }
    
    private Connection conn = null;
    
    protected final void processOpen(ApplicationWebSocket.Connection connection) {
        if (conn != null && conn.isOpen()) {
            conn.close(SYNC_CLOSE_CODE, "UserInstance open new socket!");
        }
        conn = connection;
    }
    
    protected final void processClose(int code, String message) {
        conn = null;
    }
    
    final void sendMessage(String message) {
        try {
            conn.sendMessage(message);
        } catch (IOException ex) {
            Log.log("Server Exception. ID: " + Uid.generateUidString(), ex);
            conn.close(-1, "fatal");
            throw new RuntimeException(ex);
        }
    }
    
    final boolean isOpen() {
        return conn != null && conn.isOpen();
    }
    
    final void dispose() {
        if (isOpen()) {
          this.conn.close(DISPOSE_CLOSE_CODE, "Application instance is disposed !!!");
        }
    }
}