/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2012 NextApp, Inc.
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

package jetty;

import java.io.IOException;

import nextapp.echo.webcontainer.ApplicationWebSocket;

import org.eclipse.jetty.websocket.WebSocket;

/**
 * Jetty WebSocket implementation
 * 
 * @author sieskei
 * @author chrismay
 *
 */
public class JettyWebSocket extends ApplicationWebSocket implements WebSocket {

    private final class EchoConnection implements ApplicationWebSocket.Connection {

        private final org.eclipse.jetty.websocket.WebSocket.Connection conn;

        public EchoConnection(WebSocket.Connection conn) {
            this.conn = conn;
        }

        @Override
        public void close() {
            this.conn.close();
        }

        @Override
        public void close(int i, String string) {
            this.conn.close(i, string);
        }

        @Override
        public boolean isOpen() {
            return this.conn.isOpen();
        }

        @Override
        public void sendMessage(String string) throws IOException {
            this.conn.sendMessage(string);
        }
    }

    @Override
    public void onOpen(WebSocket.Connection connection) {
        processOpen(new EchoConnection(connection));
    }

    @Override
    public void onClose(int i, String string) {
        this.processClose(i, string);
    }
}