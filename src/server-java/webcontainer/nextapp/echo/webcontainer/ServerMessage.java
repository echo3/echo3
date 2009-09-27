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

import java.util.HashSet;
import java.util.Set;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import nextapp.echo.app.util.DomUtil;

/**
 * The outgoing XML message which synchronizes the state of the client to that
 * of the server.
 */
public class ServerMessage {
    
    /**
     * Constant for the "init" message part group. Message parts in this group are
     * processed before the "update" group.
     */
    public static final String GROUP_ID_INIT = "init";

    /**
     * Constant for the "update" message part group. Message parts in this group are
     * processed after the "init" group.
     */
    public static final String GROUP_ID_UPDATE = "update";

    /** Set of added script libraries. */
    private Set addedLibraries;

    /**
     * DOM <code>libraries</code> Element to which <code>library</code>
     * elements are added to represent individual dynamically loaded JavaScript
     * libraries.
     */
    private Element librariesElement;

    /** Root DOM <code>server-message</code> element. */
    private Element serverMessageElement;
    
    /** The XML DOM. */
    private Document document;

    /**
     * Creates a new <code>ServerMessage</code>.
     */
    public ServerMessage() {
        super();
        document = DomUtil.createDocument("smsg", null, null, "http://www.nextapp.com/products/echo/svrmsg/servermessage.3.0");
        serverMessageElement = document.getDocumentElement();
        librariesElement = document.createElement("libs");
        serverMessageElement.appendChild(librariesElement);

        // Add basic part groups.
        addPartGroup(GROUP_ID_INIT);
        addPartGroup(GROUP_ID_UPDATE);
    }

    /**
     * Adds a JavaScript library service to be dynamically loaded.
     * 
     * @param serviceId the id of the service to load (the service must return
     *        JavaScript code with content-type "text/javascript")
     */
    public void addLibrary(String serviceId) {
        if (addedLibraries == null) {
            addedLibraries = new HashSet();
        }
        if (addedLibraries.contains(serviceId)) {
            return;
        }
        Element libraryElement = document.createElement("lib");
        libraryElement.appendChild(document.createTextNode(serviceId));
        librariesElement.appendChild(libraryElement);
        addedLibraries.add(serviceId);
    }

    /**
     * Adds a "group" to the document. Part groups enable certain groups of
     * operations, e.g., remove operations, to be performed before others, e.g.,
     * add operations.
     * 
     * @param groupId the identifier of the group
     * @return the created "message-part-group" element.
     */
    public Element addPartGroup(String groupId) {
        Element messagePartGroupElement = document.createElement("group");
        messagePartGroupElement.setAttribute("i", groupId);
        serverMessageElement.appendChild(messagePartGroupElement);
        return messagePartGroupElement;
    }

    /**
     * Retrieves the "message-part-group" element pertaining to a specific group.
     * 
     * @param groupId the id of the group
     * @return the "message-part-group" element
     */
    public Element getPartGroup(String groupId) {
        NodeList groupList = serverMessageElement.getElementsByTagName("group");
        int length = groupList.getLength();
        for (int i = 0; i < length; ++i) {
            Element groupElement = (Element) groupList.item(i);
            if (groupId.equals(groupElement.getAttribute("i"))) {
                return groupElement;
            }
        }
        return null;
    }

    /**
     * Adds a "message-part" to the document that will be processed by the
     * specified client-side processor object.
     * 
     * @param groupId the id of the group to which the "message-part" element
     *        should be added
     * @param processor the name of the client-side processor object which will
     *        process the message part, e.g., "EchoEventUpdate", or
     *        "EchoDomUpdate"
     * @return the created "message-part" element
     */
    public Element addDirective(String groupId, String processor) {
        Element messagePartGroupElement = getPartGroup(groupId);
        Element messagePartElement = document.createElement("dir");
        messagePartElement.setAttribute("proc", processor);
        messagePartGroupElement.appendChild(messagePartElement);
        return messagePartElement;
    }

    /**
     * Creates and appends a directive element beneath to a message part.
     * Attempts to append the directive to an existing message part if the last
     * message part in the specified group happens to have the same processor as
     * is specified by the <code>processor</code> argument. If this is not
     * possible, a new "message-part" element is created and the directive is
     * added to it.
     * 
     * @param groupId
     * @param processor the name of the client-side processor object which will
     *        process the message part, e.g., "EchoEventUpdate", or
     *        "EchoDomUpdate"
     * @param directiveName the name of the directive, e.g., "event-add" or
     *        "dom-remove".
     * @return the directive element
     */
    public Element addDirective(String groupId, String processor, String directiveName) {
        Element messagePartElement = null;
        Element groupElement = getPartGroup(groupId);

        Element lastChild = (Element) groupElement.getLastChild();
        if (lastChild != null && processor.equals(lastChild.getAttribute("proc"))) {
            messagePartElement = lastChild;
        } else {
            messagePartElement = addDirective(groupId, processor);
        }
        
        Element directiveElement = document.createElement(directiveName);
        messagePartElement.appendChild(directiveElement);
        return directiveElement;
    }

    /**
     * Returns the XML DOM.
     * 
     * @return the XML DOM
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * Sets an arbitrary attribute on the root element.
     * 
     * @param attributeName the attribute name
     * @param attributeValue the attribute value
     */
    public void setAttribute(String attributeName, String attributeValue) {
        serverMessageElement.setAttribute(attributeName, attributeValue);
    }
    
    /**
     * Sets the "resync" attribute to true, indicating that the server
     * is recovering from a condition where the client has become out of sync.
     * This can occur if two browsers are manipulating the same user instance.
     */
    public void setResync() {
        serverMessageElement.setAttribute("resync", "true");
    }
    
    /**
     * Sets the numeric identifier for this transaction, which will be returned
     * in next client message.
     * 
     * @param transactionId the transaction identifier
     */
    public void setTransactionId(long transactionId) {
        serverMessageElement.setAttribute("i", Long.toString(transactionId));
    }

    public void setUserInstanceId(String userInstanceId) {
        serverMessageElement.setAttribute("u", userInstanceId);
    }
}
