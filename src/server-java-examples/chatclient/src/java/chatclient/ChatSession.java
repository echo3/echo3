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

package chatclient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import nextapp.echo.webcontainer.ContainerContext;
import nextapp.echo.webcontainer.ClientProperties;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.WebContainerServlet;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

/**
 * Representation of a chat-room session for a single user.
 * This object handles life-cycle of a user in the chat room and provides
 * capability to post messages and retrieve messages from the chat room.
 */
public class ChatSession {
    
    /**
     * A representation of a single message posted in the chat session.
     */
    public static class Message {
        
        private String content;
        private Date date;
        private String userName;
        
        /**
         * Creates a new <code>Message</code>.
         * 
         * @param userName the name of the user posting the message
         *        (null for system announcements)
         * @param date the time the message was posted
         * @param content the content of the message
         */
        private Message(String userName, Date date, String content) {
            super();
            this.userName = userName;
            this.date = date;
            this.content = content;
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
         * Returns the time the message was posted
         * 
         * @return the post time
         */
        public Date getDate() {
            return date;
        }

        /**
         * Returns the name of the user who posted the message
         * 
         * @return the name of the user, or null in the case of a system 
         *         announcement
         */
        public String getUserName() {
            return userName;
        }
    }
    
    /**
     * Factory method to create a new <code>ChatSession</code> for a user.
     * 
     * @param userName the desired user name
     * @return the <code>ChatSession</code> if one could be created or null
     *         otherwise (e.g., in the case the user name was taken)
     */
    public static ChatSession forUserName(String userName) 
    throws IOException {
        ChatSession chatSession = new ChatSession(userName);
        return chatSession.authToken == null ? null : chatSession;
    }

    /**
     * The id of the last retrieved chat message.
     */
    private String lastRetrievedId;
    
    /**
     * The authentication token associated with the user name.  This token is
     * used to authenticate in order to post messages with the user name and
     * release the user name.
     */
    private String authToken;
    
    /**
     * The name of the user.
     */
    private String userName;
    
    /**
     * List of new messages recently retrieved from the chat server which have 
     * not yet been retrieved by the application.
     */
    private List newMessages = new ArrayList();
    
    /**
     * The URI of the chat server's web service.
     */
    private String chatServerUri;
    
    /**
     * Creates a new <code>ChatSession</code>.
     * Attempts to connect to chat server and obtain lock / authentication token
     * for user name.
     * 
     * @param userName the desired user name for the session
     */
    private ChatSession(String userName) 
    throws IOException {
        super();
        this.userName = userName;
        loadServerUri();
        
        Document requestDocument = createRequestDocument();
        
        Element userAddElement = requestDocument.createElement("user-add");
        userAddElement.setAttribute("name", userName);
        requestDocument.getDocumentElement().appendChild(userAddElement);
        
        Document responseDocument = XmlHttpConnection.send(this.chatServerUri, requestDocument);
        NodeList userAuthNodes = responseDocument.getElementsByTagName("user-auth");
        if (userAuthNodes.getLength() != 1) {
            throw new IOException("Unexpected response.");
        }
        Element userAuthElement = (Element) userAuthNodes.item(0);
        if ("true".equals(userAuthElement.getAttribute("failed"))) {
        } else {
            authToken = userAuthElement.getAttribute("auth-token");
        }
    }

    /**
     * Determines the URI of the chat server based on either 
     */
    private void loadServerUri() {
        Connection conn = WebContainerServlet.getActiveConnection();
        String chatServerUri = conn.getServlet().getInitParameter("ChatServerURI");
        if (chatServerUri != null && chatServerUri.trim().length() > 0) {
            this.chatServerUri = chatServerUri;
        } else {
            this.chatServerUri = (conn.getRequest().isSecure() ? "https" : "http") 
                    + "://" + conn.getRequest().getServerName() + ":" + conn.getRequest().getServerPort() + "/ChatServer/app";
        }
    }
    
    /**
     * Creates an XML DOM for a request to the Chat Server's Web Service.
     * The returned DOM will contain a 'chat-server-request' document element.
     * 
     * @return the created DOM
     */
    private Document createRequestDocument() 
    throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();
            Element rootElement = document.createElement("chat-server-request");
            
            ChatApp chatApp = ChatApp.getApp();
            if (chatApp != null) {
                ContainerContext containerContext = (ContainerContext) chatApp.getContextProperty(
                        ContainerContext.CONTEXT_PROPERTY_NAME);
                String remoteHost = containerContext.getClientProperties().getString(ClientProperties.REMOTE_HOST);
                rootElement.setAttribute("remote-host", remoteHost);
            }
            
            if (lastRetrievedId != null) {
                rootElement.setAttribute("last-retrieved-id", lastRetrievedId);
            }
            document.appendChild(rootElement);
            return document;
        } catch (ParserConfigurationException ex) {
            throw new IOException("Cannot create document: " + ex);
        }
    }
    
    /**
     * Disposes of the <code>ChatSession</code>.
     * This operation will make a request to the chat server to release the
     * user name being used by the session.
     */
    public void dispose() 
    throws IOException {
        Document requestDocument = createRequestDocument();
        Element userRemoveElement = requestDocument.createElement("user-remove");
        userRemoveElement.setAttribute("name", userName);
        userRemoveElement.setAttribute("auth-token", authToken);
        requestDocument.getDocumentElement().appendChild(userRemoveElement);
        XmlHttpConnection.send(chatServerUri, requestDocument);
    }
    
    /**
     * Retrieves new messages that have been posted to the server but which 
     * were not previously retrieved.
     * 
     * @return the new <code>Message</code>s
     */
    public Message[] getNewMessages() {
        Message[] messages = (Message[]) newMessages.toArray(new Message[newMessages.size()]);
        newMessages.clear();
        return messages;
    }
    
    /**
     * Determines if any new messages have been posted to the chat server.
     * 
     * @return true if any messages have been posted.
     */
    public boolean hasNewMessages() {
        return newMessages.size() != 0;
    }
    
    /**
     * Returns the name of the user.
     * 
     * @return the name of the user
     */
    public String getUserName() {
        return userName;
    }
    
    /**
     * Contacts the chat server's web service and loads new messages.
     * 
     * @throws IOException
     */
    public void pollServer() 
    throws IOException {
        Document requestDocument = createRequestDocument();
        Document responseDocument = XmlHttpConnection.send(chatServerUri, requestDocument);
        updateLocalMessages(responseDocument);
    }
    
    /**
     * Posts a message to the chat server.
     * Local messages will also be updated.
     * 
     * @param content the content of the message
     */
    public void postMessage(String content) 
    throws IOException {
        Document requestDocument = createRequestDocument();
        
        Element postMessageElement = requestDocument.createElement("post-message");
        postMessageElement.setAttribute("user-name", userName);
        postMessageElement.setAttribute("auth-token", authToken);
        postMessageElement.appendChild(requestDocument.createTextNode(content));
        requestDocument.getDocumentElement().appendChild(postMessageElement);
        
        Document responseDocument = XmlHttpConnection.send(chatServerUri, requestDocument);
        updateLocalMessages(responseDocument);
    }
    
    /**
     * Retrieves messages from the chat's server's web service's response 
     * message and stores them in the chat session.
     * 
     * @param responseDocument the response DOM from the web service
     */
    private void updateLocalMessages(Document responseDocument) {
        NodeList newMessageElements = responseDocument.getDocumentElement().getElementsByTagName("message");
        int length = newMessageElements.getLength();
        for (int i = 0; i < length; ++i) {
            Element messageElement = (Element) newMessageElements.item(i);
            lastRetrievedId = messageElement.getAttribute("id");
            String userName = messageElement.hasAttribute("user-name") ? messageElement.getAttribute("user-name") : null;
            NodeList childNodes = messageElement.getChildNodes();
            String content = null;
            for (int j = 0; j < childNodes.getLength(); ++j) {
                if (childNodes.item(j) instanceof Text) {
                    content = childNodes.item(j).getNodeValue();
                    break;
                }
            }
            long timeMs = Long.parseLong(messageElement.getAttribute("time"));
            Message message = new Message(userName, new Date(timeMs), content);
            newMessages.add(message);
        }
    }
}
