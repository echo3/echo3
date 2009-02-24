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

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * Chat Server Servlet
 */
public class ChatServerServlet extends HttpServlet {
    
    private static final Server server = new Server();
    
    /**
     * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException, IOException {
        Document requestDocument = loadRequestDocument(request);
        Document responseDocument = createResponseDocument();
        processUserAdd(requestDocument, responseDocument);
        processUserRemove(requestDocument, responseDocument);
        processPostMessage(requestDocument, responseDocument);
        processGetMessages(requestDocument, responseDocument);
        renderResponseDocument(response, responseDocument);
    }
    
    /**
     * Creates the response DOM document, containing a 'chat-server-response' 
     * document element.
     * 
     * @return the response document
     */
    private Document createResponseDocument() 
    throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();
            document.appendChild(document.createElement("chat-server-response"));
            return document;
        } catch (ParserConfigurationException ex) {
            throw new IOException("Cannot create document: " + ex);
        }
    }
    
    /**
     * Retrieves the request DOM document from an incoming 
     * <code>httpServletRequest</code>. 
     * 
     * @param request the <code>HttpServletRequest</code>
     * @return the request DOM document
     */
    private Document loadRequestDocument(HttpServletRequest request) 
    throws IOException {
        InputStream in = null;
        try {
            request.setCharacterEncoding("UTF-8");
            in = request.getInputStream();
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            builder.setEntityResolver(new EntityResolver() {
            
                /**
                 * @see org.xml.sax.EntityResolver#resolveEntity(java.lang.String, java.lang.String)
                 */
                public InputSource resolveEntity(String publicId, String systemId)
                throws SAXException, IOException {
                    throw new SAXException("External entities not supported.");
                }
            });
            return builder.parse(in);
        } catch (ParserConfigurationException ex) {
            throw new IOException("Provided InputStream cannot be parsed: " + ex);
        } catch (SAXException ex) {
            throw new IOException("Provided InputStream cannot be parsed: " + ex);
        } catch (IOException ex) {
            throw new IOException("Provided InputStream cannot be parsed: " + ex);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } }
        }
    }
    
    /**
     * Retrieves new messages posted with id values higher than the
     * request document's specified 'last-retrieved-id' value.
     * 
     * @param requestDocument the request DOM document
     * @param responseDocument the response DOM document
     */
    private void processGetMessages(Document requestDocument, Document responseDocument) {
        String lastRetrievedIdString = requestDocument.getDocumentElement().getAttribute("last-retrieved-id");
        Message[] messages;
        if (lastRetrievedIdString == null || lastRetrievedIdString.trim().length() == 0) {
            messages = server.getRecentMessages();
        } else {
            long lastRetrievedId = Long.parseLong(lastRetrievedIdString);
            messages = server.getMessages(lastRetrievedId);
        }
        for (int i = 0; i < messages.length; ++i) {
            Element messageElement = responseDocument.createElement("message");
            messageElement.setAttribute("id", Long.toString(messages[i].getId()));
            if (messages[i].getUserName() != null) {
                messageElement.setAttribute("user-name", messages[i].getUserName());
            }
            messageElement.setAttribute("time", Long.toString(messages[i].getPostTime()));
            messageElement.appendChild(responseDocument.createTextNode(messages[i].getContent()));
            responseDocument.getDocumentElement().appendChild(messageElement);
        }
    }
    
    /**
     * Processes a request (if applicable) to post a message to the chat
     * server.
     * 
     * @param requestDocument the request DOM document
     * @param responseDocument the response DOM document
     */
    private void processPostMessage(Document requestDocument, Document responseDocument) {
        NodeList postMessageNodes = requestDocument.getDocumentElement().getElementsByTagName("post-message");
        if (postMessageNodes.getLength() == 0) {
            // Posting not requested.
            return;
        }
        
        String remoteHost = requestDocument.getDocumentElement().getAttribute("remote-host");

        Element postMessageElement = (Element) postMessageNodes.item(0);
        String userName = postMessageElement.getAttribute("user-name");
        String authToken = postMessageElement.getAttribute("auth-token");
        NodeList postMessageContentNodes = postMessageElement.getChildNodes();
        int length = postMessageContentNodes.getLength();
        for (int i = 0; i < length; ++i) {
            if (postMessageContentNodes.item(i) instanceof Text) {
                server.postMessage(userName, authToken, remoteHost, ((Text) postMessageContentNodes.item(i)).getNodeValue());
            }
        }
    }
    
    /**
     * Process a request (if applicable) to add a user to the chat.
     * 
     * @param requestDocument the request DOM document
     * @param responseDocument the response DOM document
     */
    private void processUserAdd(Document requestDocument, Document responseDocument) {
        NodeList userAddNodes = requestDocument.getDocumentElement().getElementsByTagName("user-add");
        if (userAddNodes.getLength() == 0) {
            // User add not requested.
            return;
        }

        String remoteHost = requestDocument.getDocumentElement().getAttribute("remote-host");
        
        // Attempt to authenticate.
        Element userAddElement = (Element) userAddNodes.item(0);
        String userName = userAddElement.getAttribute("name");
        String authToken = server.addUser(userName, remoteHost);
        
        Element userAuthElement = responseDocument.createElement("user-auth");
        if (authToken == null) {
            userAuthElement.setAttribute("failed", "true");
        } else {
            userAuthElement.setAttribute("auth-token", authToken);
        }
        responseDocument.getDocumentElement().appendChild(userAuthElement);
    }
    
    /**
     * Process a request (if applicable) to remove a user from the chat.
     * 
     * @param requestDocument the request DOM document
     * @param responseDocument the response DOM document
     */
    private void processUserRemove(Document requestDocument, Document responseDocument) {
        NodeList userRemoveNodes = requestDocument.getDocumentElement().getElementsByTagName("user-remove");
        if (userRemoveNodes.getLength() == 0) {
            // User remove not requested.
            return;
        }
        
        Element userRemoveElement = (Element) userRemoveNodes.item(0);
        String userName = userRemoveElement.getAttribute("name");
        String authToken = userRemoveElement.getAttribute("auth-token");
        
        String remoteHost = requestDocument.getDocumentElement().getAttribute("remote-host");

        server.removeUser(userName, authToken, remoteHost);
    }
    
    /**
     * Renders the response DOM document to the 
     * <code>HttpServletResponse</code>.
     * 
     * @param response the outgoing <code>HttpServletResponse</code>
     * @param responseDocument the response DOM document
     */
    private void renderResponseDocument(HttpServletResponse response, Document responseDocument) 
    throws IOException {
        response.setContentType("text/xml; charset=UTF-8");
        try {
            TransformerFactory tFactory = TransformerFactory.newInstance();
            Transformer transformer = tFactory.newTransformer();
            DOMSource source = new DOMSource(responseDocument);
            StreamResult result = new StreamResult(response.getWriter());
            transformer.transform(source, result);
        } catch (TransformerException ex) {
            throw new IOException("Unable to write document to OutputStream: " + ex.toString());
        }
    }
}
