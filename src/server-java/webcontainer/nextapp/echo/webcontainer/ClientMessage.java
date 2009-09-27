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
import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * The incoming XML message which synchronizes the state of the server to that of the client.
 * Provides global facility to register processors to handle directive types.
 * Processes DOm and invokes registered processors on individual messages.
 */
public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";
    
    /**
     * Interface for <code>Processor</code>s which may be associated with a specific type of <code>&lt;dir&gt;</code>
     * (directive) element in the XML message.  Registered processors will be invoked by <code>ClientMessage.process()</code>.
     */
    public static interface Processor {
        
        /**
         * Processes a client message directive.
         * 
         * @param context the relevant <code>Context</code>
         * @param dirElement the <code>&lt;dir&gt;</code> (directive) element
         * @throws IOException if the directive contains invalid information
         */
        public void process(Context context, Element dirElement)
        throws IOException ;
    }

    /**
     * Mapping between <code>Processor</code> names and classes.
     */
    private static final Map processorNameToClass = new HashMap();
    
    /**
     * Registers a <code>ClientMessage.Processor</code>.  
     * 
     * @param name the directive name for which the processor will be invoked
     * @param processorClass the <code>Class</code> of the processor which should be instantiated to process
     *        the specified directive name
     */
    public static void register(String name, Class processorClass) {
        synchronized(processorNameToClass) {
            if (processorNameToClass.containsKey(name)) {
                throw new IllegalStateException("A ClientMessage Processor has already been registered for the directive \""
                        + name + "\"");
            }
            processorNameToClass.put(name, processorClass);
        }
    }
    
    /** The XML DOM. */
    private Document document;
    
    /** The request type. */
    private String type;
    
    /** Unique client-generated window identifier. */
    private String windowId;
    
    /** The sequential transaction identifier, used for determining if the client has the current application state. */
    private int transactionId;
    
    /**
     * the server-generated initialization request identifier, used to distinguish initial HTTP requests to an application.
     * (Used specifically for storing initialization request parameters.)
     */
    private String initId;
    
    /**
     * Creates a new <Code>ClientMessage</code>.
     * 
     * @param document the XML DOM received from the client
     * @throws IOException
     */
    public ClientMessage(Document document) 
    throws IOException {
        super();
        this.document = document;

        // Retrieve message type, transaction id.
        Element cmsg = document.getDocumentElement();
        type = cmsg.getAttribute("t");
        initId = cmsg.hasAttribute("ii") ? cmsg.getAttribute("ii") : null;
        transactionId = Integer.parseInt(cmsg.getAttribute("i"));
        windowId = cmsg.hasAttribute("w") ? cmsg.getAttribute("w") : null;
    }
    
    /**
     * Returns the XML DOM received from the client.
     * 
     * @return the XML DOM
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * Returns the transaction identifier, used for determining if the client has the current application state.
     * 
     * @return the transaction identifier
     */
    public int getTransactionId() {
        return transactionId;
    }
    
    /**
     * Returns the server-generated initialization request identifier, used to distinguish initial HTTP requests to an application.
     * (Used specifically for storing initialization request parameters.)
     * 
     * @return the identifier
     */
    public String getInitId() {
        return initId;
    }
    
    /**
     * Returns the client-generated unique window identifier, used to differentiate between multiple browser windows.
     * 
     * @return the identifier
     */
    public String getWindowId() {
        return windowId;
    }
    
    /**
     * Returns the request type, if provided, e.g., <code>TYPE_INITIALIZE</code> to indicate the initial synchronization.
     * 
     * @return the request type
     */
    public String getType() {
        return type;
    }
    
    /**
     * Processes the top-level directives of the <code>ClientMessage</code>, invoking the registered 
     * <code>ClientMesage.Processor</code>s associated with each top-level directive type.
     * 
     * @param context the <code>Context</code>
     * @throws IOException
     */
    public void process(Context context)
    throws IOException {
        Element[] dirElements = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "dir");
        for (int i = 0; i < dirElements.length; ++i) {
            String processorName = dirElements[i].getAttribute("proc");
            
            // Find processor class, first check local cache, then 
            Class processorClass = (Class) processorNameToClass.get(processorName);
            if (processorClass == null) {
                throw new SynchronizationException("No processor exists for processor name: " + processorName, null);
            }

            try {
                Processor processor = (Processor) processorClass.newInstance();
                processor.process(context, dirElements[i]);
            } catch (InstantiationException ex) {
                throw new SynchronizationException("Cannot instantiate process class: " + processorClass.getName(), ex);
            } catch (IllegalAccessException ex) {
                throw new SynchronizationException("Cannot instantiate process class: " + processorClass.getName(), ex);
            }
        }
    }
}
