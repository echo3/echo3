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

package nextapp.echo.webcontainer;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpSession;

import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.webcontainer.Service;

/**
 * Contextual information about the application container provided to an
 * application instance.  The <code>ContainerContext</code> will be stored
 * as a context property of an application's <code>ApplicationInstance</code>,
 * under the key constant <code>CONTEXT_PROPERTY_NAME</code>.
 * 
 * This interface should not be implemented outside of the core 
 * framework.
 */
public interface ContainerContext {
    
    /**
     * Property name by which a <code>ContainerContext</code> may be retrieved
     * from an <code>ApplicationInstance</code>'s context properties.
     * 
     * @see nextapp.echo2.app.ApplicationInstance#getContextProperty(java.lang.String)
     */
    public static final String CONTEXT_PROPERTY_NAME = ContainerContext.class.getName();

    /**
     * Adds a <code>Cookie</code> to the client on the outgoing connection, if one is available.
     * 
     * @param cookie the cookie to add
     * @throws IllegalStateException if no connection is available to store the cookie
     */
    public void addCookie(Cookie cookie)
    throws IllegalStateException;

    /**
     * Returns the <code>ClientProperties</code> describing the user's
     * client web browser environment.
     * 
     * @return the <code>ClientProperties</code>
     */
    public ClientProperties getClientProperties();
    
    /**
     * Return any <code>Cookie</code>s sent on the current HTTP request. 
     * 
     * @return the <code>Cookie</code>s
     */
    public Cookie[] getCookies();
    
    /**
     * Returns an immutable <code>Map</code> containing the HTTP request 
     * parameters sent on the initial request to the application.
     * 
     * @return the initial request parameter map
     */
    public Map getInitialRequestParameterMap();
    
    /**
     * Returns the URI of the specified <code>Service</code>.
     * 
     * @param service the <code>Service</code>
     * @return the URI
     */
    public String getServiceUri(Service service);
    
    /**
     * Returns the URI of the Echo2 servlet.
     * 
     * @return the servlet URI
     */
    public String getServletUri();
    
    /**
     * Returns the <code>HttpSession</code> in which the application is 
     * being stored.
     * 
     * @return the <code>HttpSession</code>
     */
    public HttpSession getSession();
    
    /**
     * Returns the authenticated user <code>Principal</code>.
     * 
     * @return the authenticated user <code>Principal</code>
     */
    public Principal getUserPrincipal();
    
    /**
     * Determines if the authenticated user is in the specified logical "role",
     * by querying the inbound servlet request. 
     */
    public boolean isUserInRole(String role);

    /**
     * Sets the <code>ClientConfiguration</code> describing
     * application-specific client configuration settings.
     * 
     * @param clientConfiguration the new <code>ClientConfiguration</code>
     */
    public void setClientConfiguration(ClientConfiguration clientConfiguration);
    
    /**
     * Sets the interval between asynchronous callbacks from the client to check
     * for queued tasks for a given <code>TaskQueue</code>.  If multiple 
     * <code>TaskQueue</code>s are active, the smallest specified interval should
     * be used.  The default interval is 500ms.
     * 
     * @param taskQueue the <code>TaskQueue</code>
     * @param ms the number of milliseconds between asynchronous client 
     *        callbacks
     */
    public void setTaskQueueCallbackInterval(TaskQueueHandle taskQueue, int ms);
}
