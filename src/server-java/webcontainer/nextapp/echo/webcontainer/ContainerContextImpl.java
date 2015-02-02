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

import java.io.Serializable;
import java.security.Principal;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpSession;

import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.webcontainer.ClientConfiguration;
import nextapp.echo.webcontainer.ClientProperties;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;;

/**
 * <code>ContainerContext</code> implementation.
 */
class ContainerContextImpl
implements ContainerContext, Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private UserInstance userInstance;

    /**
     * Creates a new <code>ContainerContextImpl</code>
     *
     * @param userInstance the relevant <code>UserInstance</code>
     */
    ContainerContextImpl(UserInstance userInstance) {
        super();
        this.userInstance = userInstance;
    }

    public void addCookie(Cookie cookie)
    throws IllegalStateException {
        Connection conn = WebContainerServlet.getActiveConnection();
        if (conn == null) {
            throw new IllegalStateException("No connection available to set cookie.");
        }
        conn.getResponse().addCookie(cookie);
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getClientProperties()
     */
    public ClientProperties getClientProperties() {
        return userInstance.getClientProperties();
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getCookies()
     */
    public Cookie[] getCookies() {
        Connection conn = WebContainerServlet.getActiveConnection();
        if (conn == null) {
            return null;
        } else {
            return conn.getRequest().getCookies();
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getInitialRequestParameterMap()
     */
    public Map getInitialRequestParameterMap() {
        return userInstance.getInitialRequestParameterMap();
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getServiceUri(nextapp.echo.webcontainer.Service)
     */
    public String getServiceUri(Service service) {
        return userInstance.getServiceUri(service);
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getServletUri()
     */
    public String getServletUri() {
        return userInstance.getServletUri();
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getSession()
     */
    public HttpSession getSession() {
        return userInstance.getSession();
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#getUserPrincipal()
     */
    public Principal getUserPrincipal() {
        Connection conn = WebContainerServlet.getActiveConnection();
        if (conn == null) {
            return null;
        } else {
            return conn.getRequest().getUserPrincipal();
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#isUserInRole(java.lang.String)
     */
    public boolean isUserInRole(String role) {
        Connection conn = WebContainerServlet.getActiveConnection();
        if (conn == null) {
            return false;
        } else {
            return conn.getRequest().isUserInRole(role);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#setClientConfiguration(nextapp.echo.webcontainer.ClientConfiguration)
     */
    public void setClientConfiguration(ClientConfiguration clientConfiguration) {
        userInstance.setClientConfiguration(clientConfiguration);
    }

    /**
     * @see nextapp.echo.webcontainer.ContainerContext#setTaskQueueCallbackInterval(nextapp.echo.app.TaskQueueHandle, int)
     */
    public void setTaskQueueCallbackInterval(TaskQueueHandle taskQueue, int ms) {
        userInstance.setTaskQueueCallbackInterval(taskQueue, ms);
    }
}
