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

package nextapp.echo.webcontainer.service;


import java.io.IOException;

import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.util.Resource;

/**
 * A <code>Service</code> which renders a static binary resource.
 */
public class StaticBinaryService 
implements Service {

   /**
     * Creates a new <code>StaticBinaryService</code> based on the data in the
     * specified <code>CLASSPATH</code> resource.  A runtime exception will be 
     * thrown in the even the resource does not exist (it generally should not
     * be caught).
     * 
     * @param id the <code>Service</code> identifier
     * @param contentType the content type 
     * @param resourceName the path to the content data in the 
     *        <code>CLASSPATH</code>
     * @return the created <code>StaticBinaryService</code>
     */
    public static StaticBinaryService forResource(String id, String contentType, String resourceName) {
        byte[] data = Resource.getResourceAsByteArray(resourceName);
        return new StaticBinaryService(id, contentType, data);
    }

    /** The <code>Service</code> identifier. */
    private String id;
    
    /** The binary data to be served. */
    private byte[] data;
    
    /** The content type of the data. */
    private String contentType;
    
    /**
     * Creates a new <code>StaticBinaryService</code>.
     * 
     * @param id the <code>Service</code> identifier
     * @param contentType the content type 
     * @param data the binary data
     */
    public StaticBinaryService(String id, String contentType, byte[] data) {
        super();
        this.id = id;
        this.contentType = contentType;
        this.data = data;
    }
    
    /**
     * @see Service#getId()
     */
    public String getId() {
        return id;
    }

    /**
     * @see Service#getVersion()
     */
    public int getVersion() {
        return 0;
    }

    /**
     * @see Service#service(nextapp.echo.webcontainer.Connection)
     */
    public void service(Connection conn) 
    throws IOException {
        try {
            conn.getResponse().setContentType(contentType);
            conn.getOutputStream().write(data);
        } catch (IOException ex) {
            // Internet Explorer appears to enjoy making half-hearted requests for images, wherein it resets the connection
            // leaving us with an IOException.  This exception is silently eaten.
            // It would preferable to only ignore SocketExceptions, however the API documentation does not provide
            // enough information to suggest that such a strategy would be adequate..
        }
    }
}
