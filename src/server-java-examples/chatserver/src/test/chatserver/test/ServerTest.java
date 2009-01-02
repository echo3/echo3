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

package chatserver.test;

import chatserver.Log;
import chatserver.Message;
import chatserver.Server;
import junit.framework.TestCase;

/**
 * Unit tests for the chat server.
 */
public class ServerTest extends TestCase {
   
    private static final String REMOTE_HOST = "192.168.0.20";
    
    public void testAuthenticationAndPosting() {
        Log.setLogStream(null);
        Server server = new Server();
        String bobAuthToken = server.addUser("Bob.Smith", REMOTE_HOST);
        assertNotNull(bobAuthToken);
        String sallyAuthToken = server.addUser("Sally.Jones", REMOTE_HOST);
        assertNotNull(sallyAuthToken);
        assertNull(server.addUser("Bob.Smith", REMOTE_HOST));
        assertTrue(server.postMessage("Bob.Smith", bobAuthToken, REMOTE_HOST, "Hi, everyone!"));
        assertFalse(server.postMessage("Bob.Smith", sallyAuthToken, REMOTE_HOST, "Hi, everyone!"));
        assertFalse(server.postMessage("Bob.Smith", null, REMOTE_HOST, "Hi, everyone!"));
        assertFalse(server.postMessage("Bob.Smith", bobAuthToken + "x", REMOTE_HOST, "Hi, everyone!"));
        assertTrue(server.postMessage("Sally.Jones", sallyAuthToken, REMOTE_HOST, "Hi, Bob!"));
    }
    
    public void testMessageRetrieval() 
    throws InterruptedException {
        Server server = new Server();
        Message[] messages;
        long lastRetrievedId;

        // Retrieve recent messages.
        messages = server.getRecentMessages();
        assertEquals(0, messages.length);
        
        String bobAuthToken = server.addUser("Bob.Smith", REMOTE_HOST);

        // Retrieve authentication message.
        messages = server.getRecentMessages();
        assertEquals(1, messages.length);
        
        // Post ten messages.
        for (int i = 0; i < 10; ++i) {
            server.postMessage("Bob.Smith", bobAuthToken, REMOTE_HOST, Integer.toString(i));
        }
        
        // Retrieve all messages.
        messages = server.getMessages(-1);
        assertEquals(11, messages.length);
        assertEquals("0", messages[1].getContent());
        assertEquals("1", messages[2].getContent());
        assertEquals("9", messages[10].getContent());
        
        lastRetrievedId = messages[10].getId();
        
        // Retrieve recent messages.
        messages = server.getRecentMessages();
        assertEquals(11, messages.length);
        assertEquals("0", messages[1].getContent());
        assertEquals("1", messages[2].getContent());
        assertEquals("9", messages[10].getContent());
        
        // Post ten messages.
        for (int i = 10; i < 20; ++i) {
            server.postMessage("Bob.Smith", bobAuthToken, REMOTE_HOST, Integer.toString(i));
        }
        
        // Retrieve messages.
        messages = server.getMessages(lastRetrievedId);
        assertEquals(10, messages.length);
        assertEquals("10", messages[0].getContent());
        assertEquals("11", messages[1].getContent());
        assertEquals("19", messages[9].getContent());

        lastRetrievedId = messages[9].getId();

        // Post one thousand messages.
        for (int i = 20; i < 1020; ++i) {
            server.postMessage("Bob.Smith", bobAuthToken, REMOTE_HOST, Integer.toString(i));
        }
        
        // Retrieve messages.
        messages = server.getMessages(lastRetrievedId);
        assertEquals(1000, messages.length);
        assertEquals("20", messages[0].getContent());
        assertEquals("21", messages[1].getContent());
        assertEquals("520", messages[500].getContent());
        assertEquals("1018", messages[998].getContent());
        assertEquals("1019", messages[999].getContent());
        
        // Retrieve messages from a different starting point.
        messages = server.getMessages(messages[500].getId());
        assertEquals(499, messages.length);
        assertEquals("521", messages[0].getContent());
        assertEquals("1019", messages[498].getContent());
        
        // Retrieve recent messages.
        messages = server.getRecentMessages();
        assertEquals(15, messages.length);
        assertEquals("1005", messages[0].getContent());
        assertEquals("1006", messages[1].getContent());
        assertEquals("1019", messages[14].getContent());
        
        lastRetrievedId = messages[14].getId();
        
        // Post message with UTF-8 characters.
        server.postMessage("Bob.Smith", bobAuthToken, REMOTE_HOST, "\u0416\u066f");
        messages = server.getMessages(lastRetrievedId);
        assertEquals("\u0416\u066f", messages[0].getContent());
    }
}
