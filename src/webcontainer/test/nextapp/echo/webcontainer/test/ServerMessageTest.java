/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

package nextapp.echo.webcontainer.test;


import nextapp.echo.webcontainer.ServerMessage;

import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import junit.framework.TestCase;

/**
 * Unit tests for <code>ServerMessage</code>.
 */
public class ServerMessageTest extends TestCase {
    
    /**
     * Test <code>addLibrary()</code>.
     */
    public void testAddLibrary() {
        NodeList libraryNodeList;
        ServerMessage message = new ServerMessage();
        
        message.addLibrary("service1");
        libraryNodeList = message.getDocument().getElementsByTagName("library");
        assertEquals(1, libraryNodeList.getLength());
        
        message.addLibrary("service2");
        libraryNodeList = message.getDocument().getElementsByTagName("library");
        assertEquals(2, libraryNodeList.getLength());
        
        message.addLibrary("service1");
        libraryNodeList = message.getDocument().getElementsByTagName("library");
        assertEquals(2, libraryNodeList.getLength());
    }
    
    /**
     * Test <code>appendPartDirective()</code>.
     */
    public void testAppendPartDirective() {
        ServerMessage message = new ServerMessage();
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "DomUpdate", "dom-add");
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "DomUpdate", "dom-remove");
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "DomUpdate", "dom-add");
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "SomethingElse", "thing");
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "DomUpdate", "dom-remove");
        message.addDirective(ServerMessage.GROUP_ID_UPDATE, "DomUpdate", "dom-add");
        assertEquals(3, message.getDocument().getElementsByTagName("message-part").getLength());
    }

//    /**
//     * Test itemized directive capability.
//     */
//    public void testItemizedDirective() {
//        ServerMessage message = new ServerMessage();
//        String[] keyAttributeNames = new String[]{"alpha", "bravo"};
//        
//        Element directiveElement1 = message.getItemizedDirective(ServerMessage.GROUP_ID_UPDATE, "Processor", "Directive", 
//                keyAttributeNames, new String[]{"alpha1", "bravo1"});
//        assertEquals("Directive", directiveElement1.getNodeName());
//        assertEquals("alpha1", directiveElement1.getAttribute("alpha"));
//        assertEquals("bravo1", directiveElement1.getAttribute("bravo"));
//        
//        Element directiveElement2 = message.getItemizedDirective(ServerMessage.GROUP_ID_UPDATE, "Processor", "Directive", 
//                keyAttributeNames, new String[]{"alpha1", "bravo1"});
//        assertEquals("Directive", directiveElement2.getNodeName());
//        assertEquals("alpha1", directiveElement2.getAttribute("alpha"));
//        assertEquals("bravo1", directiveElement2.getAttribute("bravo"));
//        
//        assertTrue(directiveElement1.equals(directiveElement2));
//
//        Element directiveElement3 = message.getItemizedDirective(ServerMessage.GROUP_ID_UPDATE, "Processor", "Directive", 
//                keyAttributeNames, new String[]{"alpha2", "bravo2"});
//        assertEquals("Directive", directiveElement3.getNodeName());
//        assertEquals("alpha2", directiveElement3.getAttribute("alpha"));
//        assertEquals("bravo2", directiveElement3.getAttribute("bravo"));
//        
//        assertFalse(directiveElement1.equals(directiveElement3));
//        assertFalse(directiveElement2.equals(directiveElement3));
//    }
    
    /**
     * Test group identifiers.
     */
    public void testGroupIds() {
        ServerMessage message = new ServerMessage();
        Element directiveElement, messagePartGroupElement;

        directiveElement = message.addDirective(ServerMessage.GROUP_ID_INIT, "Something", "do-something");
        messagePartGroupElement = (Element) directiveElement.getParentNode().getParentNode();
        assertEquals("message-part-group", messagePartGroupElement.getNodeName());
        assertEquals(ServerMessage.GROUP_ID_INIT, messagePartGroupElement.getAttribute("id"));
        
        directiveElement = message.addDirective(ServerMessage.GROUP_ID_UPDATE, "Something", "do-something");
        messagePartGroupElement = (Element) directiveElement.getParentNode().getParentNode();
        assertEquals("message-part-group", messagePartGroupElement.getNodeName());
        assertEquals(ServerMessage.GROUP_ID_UPDATE, messagePartGroupElement.getAttribute("id"));
    }
}
