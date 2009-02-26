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

import org.w3c.dom.Document;

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.util.Context;

/**
 * Basic <code>Context</code> implementation used by <code>InputProcessor</code> and <code>OutputProcessor</code> to parse
 * inbound and produce outbound XML synchronization messages.
 * 
 * Provides the following properties:
 * <code>Document</code> (provided by constructor)
 * <code>Connection</code> (provided by constructor)
 * <code>SerialContext</code>
 * <code>PropertyPeerFactory</code>
 * <code>UserInstance</code>
 * 
 */
public class SynchronizationContext 
implements Context {

    private ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
    private Connection conn;
    private Document document;
    private PropertySerialPeerFactory propertyPeerFactory;

    /**
     * <code>SerialContext</code> implementation.
     */
    private SerialContext serialContext = new SerialContext() {
        
        /**
         * @see nextapp.echo.app.serial.SerialContext#getClassLoader()
         */
        public ClassLoader getClassLoader() {
            return classLoader;
        }
    
        /**
         * @see nextapp.echo.app.serial.SerialContext#getDocument()
         */
        public Document getDocument() {
            return document;
        }

        /**
         * @see nextapp.echo.app.serial.SerialContext#getFlags()
         */
        public int getFlags() {
            return FLAG_RENDER_SHORT_NAMES;
        }
    };
    
    /**
     * Creates a new <code>SynchronizationContext</code>.
     * 
     * @param conn the <code>Connection</code>
     * @param document the inbound or outbound XML <code>Document</code>
     */
    public SynchronizationContext(Connection conn, Document document) {
        this.conn = conn;
        this.document = document;
    }
    
    /**
     * @see nextapp.echo.app.util.Context#get(java.lang.Class)
     */
    public Object get(Class specificContextClass) {
        if (specificContextClass == SerialContext.class) {
            return serialContext;
        } else if (specificContextClass == Connection.class) {
            return conn;
        } else if (specificContextClass == PropertyPeerFactory.class) {
            if (propertyPeerFactory == null) {
                propertyPeerFactory = PropertySerialPeerFactory.forClassLoader(classLoader);
            }
            return propertyPeerFactory;
        } else if (specificContextClass == UserInstance.class) {
            return conn.getUserInstance();
        } else {
            return null;
        }
    }
}
