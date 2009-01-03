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

/**
 * An interface for objects that process <code>Connection</code>s, parsing an
 * HTTP request and producing an HTTP response. <br>
 * <br>
 * Every service is identified by a unique identifier.  When the client 
 * browser makes a request of the server and provides the identifier of this 
 * service, its <code>service()</code> method will be invoked.  Every request 
 * to an Echo application from a client browser will invoke a service.  
 */
public interface Service {
    
    /**
     * A value returned by <code>getVersion()</code> to indicate that a
     * service should not be cached.
     */
    public static final int DO_NOT_CACHE = -1;
    
    /**
     * Returns the unique identifier of this service.
     * 
     * @return the unique identifier of this service
     */
    public String getId();

    /**
     * Returns the version of the service to be retrieved.  When a service is
     * requested with an updated version number, a non-cached copy will be used.
     * <code>getVersion()</code> should return distinct values whenever the 
     * service's content may have changed.
     *
     * @return the current version number of the service
     */
    public int getVersion();
    
    /**
     * Services an HTTP request.  Information about the HTTP request as well
     * as methods for issuing a response are available from the provided
     * Connection object.
     *
     * @param conn a <code>Connection</code> object which wraps 
     *        <code>HttpServletRequest</code> and 
     *        <code>HttpServletResponse</code> objects and provides
     *        access to the facilities of the Echo application container
     * @throws IOException in the event of errors related to processing the
     *         HTTP request or producing a response
     */
    public void service(Connection conn)
    throws IOException;
}
