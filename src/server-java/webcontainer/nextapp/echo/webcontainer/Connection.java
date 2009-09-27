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
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;


/**
 * A representation of a connection to the server by the client, encapsulating
 * the servlet request and response objects, and providing access to the
 * relevant application instance.
 * <code>Connection</code>s also manage the life-cycle of 
 * <code>UserInstance</code>s within the <code>HttpSession</code>.
 */
public class Connection {

    /**
     * Prefix to use for <code>UserInstanceContainer</code> <code>HttpSession</code> keys.
     */
    private static final String USER_INSTANCE_CONTAINER_SESSION_KEY_PREFIX = "EchoUserInstanceContainer";

    private HttpServletRequest request;
    private HttpServletResponse response;
    private WebContainerServlet servlet;
    private UserInstance userInstance;
    private UserInstanceContainer userInstanceContainer;
    private Map propertyMap;
    private String uiid;
    
    /**
     * Creates a <code>connection</code> object that will handle the given 
     * request and response.  The <code>UserInstance</code> will be acquired from the session 
     * if one exists.  A session will NOT be created if one does not exist.
     *
     * @param servlet the <code>WebContainerServlet</code> generating the connection
     * @param request the HTTP request object that was passed to the servlet
     * @param response the HTTP response object that was passed to the servlet
     */
    Connection(WebContainerServlet servlet, HttpServletRequest request, HttpServletResponse response) throws IOException,
            ServletException {
        super();

        this.servlet = servlet;
        this.request = request;
        this.response = response;
        
        if (servlet.getInstanceMode() == WebContainerServlet.INSTANCE_MODE_WINDOW) {
            uiid = request.getParameter("uiid");
        }
System.err.println("UIID: " + uiid);
System.err.println("SID: " + request.getParameter("sid"));

        // Configure connection for Multipart Request if required.
        String contentType = request.getContentType();
        if (contentType != null && contentType.startsWith(ContentType.MULTIPART_FORM_DATA.getMimeType())) {
            if (WebContainerServlet.getMultipartRequestWrapper() != null) {
                this.request = WebContainerServlet.getMultipartRequestWrapper().getWrappedRequest(request);
            }
        }
        
        HttpSession session = request.getSession(false);
System.err.println("Session Created: " + (session != null));            
        if (session != null) {
            userInstanceContainer = (UserInstanceContainer) session.getAttribute(getUserInstanceContainerSessionKey());
            userInstance = userInstanceContainer.getUserInstanceById(uiid);
System.err.println((userInstanceContainer != null) + "/" + (userInstance != null));            
        }
    }

    /**
     * Disposes of the <code>UserInstance</code> associated with this 
     * <code>Connection</code>.
     */
    void disposeUserInstance() {
        if (userInstanceContainer != null && userInstance != null) {
            userInstanceContainer.unloadUserInstance(userInstance);
        }
    }

    /**
     * Returns the <code>OutputStream</code> object that may be used to 
     * generate a response.  This method may be called once.  If it is called, 
     * the getPrintWriter() method may not be called.  This method wraps a 
     * call to <code>HttpServletResponse.getOutputStream()</code>.  The 
     * <code>OutputStream</code> will be closed by the servlet container.
     *
     * @return the <code>OutputStream</code> object that may be used to 
     *         generate a response to the client
     */
    public OutputStream getOutputStream() {
        try {
            return response.getOutputStream();
        } catch (IOException ex) {
            throw new WebContainerServletException("Unable to get PrintWriter.", ex);
        }
    }
    
    /**
     * Returns a property from the <code>Connection</code>-persistent 
     * property map.  (Properties are disposed of when <code>Connection</code>
     * has completed). 
     * 
     * @param key the property key (for namespacing purposes, keys should 
     *        be prefaced with the full class name of the object setting the
     *        property)
     * @return the property value
     */
    public Object getProperty(String key) {
        return propertyMap == null ? null : propertyMap.get(key);
    }

    /**
     * Returns the <code>HttpServletRequest</code> wrapped by this 
     * <code>Connection</code>.
     *
     * @return the <code>HttpServletRequest</code> wrapped by this 
     *         <code>Connection</code>
     */
    public HttpServletRequest getRequest() {
        return request;
    }

    /**
     * Returns the <code>HttpServletResponse</code> wrapped by this 
     * <code>Connection</code>.
     *
     * @return the <code>HttpServletResponse</code> wrapped by this 
     *         <code>Connection</code>
     */
    public HttpServletResponse getResponse() {
        return response;
    }
    
    private String getUserInstanceContainerSessionKey() {
        return USER_INSTANCE_CONTAINER_SESSION_KEY_PREFIX + ":" + servlet.getServletName();
    }
    
    /**
     * Returns the <code>WebContainerServlet</code> wrapped by this 
     * <code>Connection</code>.
     *
     * @return the <code>WebContainerServlet</code> wrapped by this 
     *         <code>Connection</code>
     */
    public WebContainerServlet getServlet() {
        return servlet;
    }

    /**
     * Returns the <code>UserInstance</code> associated with 
     * this connection.  If the session has not been initialized, null is 
     * returned.
     *
     * @return the <code>UserInstance</code> associated with  
     *         this connection
     */
    public UserInstance getUserInstance() {
        return userInstance;
    }
    
    public UserInstance getUserInstance(String windowId, String initId) {
        if (userInstanceContainer == null) {
            return null;
        }
        
        synchronized(userInstanceContainer) {
            if (userInstance == null && windowId != null) {
                userInstance = userInstanceContainer.loadUserInstance(windowId, initId);
System.err.println("Created:" + userInstance.getId());                
            }
        }
        
        return userInstance;
    }
    
    public UserInstanceContainer getUserInstanceContainer() {
        return userInstanceContainer;
    }

    /**
     * Returns the <code>PrintWriter</code> object that may be used to 
     * generate a response.  This method may be called once.  If it is called, 
     * the getOuputStream() method may not be called.  This method wraps a 
     * call to <code>HttpServletResponse.getWriter()</code>.  The 
     * <code>PrintWriter</code> will be closed by the servlet container.
     *
     * @return the <code>PrintWriter</code> object that may be used to 
     *         generate a response to the client
     */
    public PrintWriter getWriter() {
        try {
            return response.getWriter();
        } catch (IOException ex) {
            throw new WebContainerServletException("Unable to get PrintWriter.", ex);
        }
    }
    
    /**
     * Initializes the state of the new <code>UserInstanceContainer</code> and associates
     * it with this <code>Connection</code> and the underlying <code>HttpSession</code>
     * 
     * @param userInstanceContainer the <code>UserInstanceContaienr</code>
     */
    void initUserInstanceContainer(UserInstanceContainer userInstanceContainer) {
        this.userInstanceContainer = userInstanceContainer;
        userInstanceContainer.setServletUri(request.getRequestURI());
        HttpSession session = request.getSession(true);
        session.setAttribute(getUserInstanceContainerSessionKey(), userInstanceContainer);
    }
    
    /**
     * Sets the content type of the response.
     * This method will automatically append a character encoding to
     * non-binary content types.
     * 
     * @param contentType the content type of the response
     */
    public void setContentType(ContentType contentType) {
        UserInstance userInstance = getUserInstance();
        if (contentType.isBinary() || userInstance == null) {
            response.setContentType(contentType.getMimeType());
        } else {
            response.setContentType(contentType.getMimeType() + "; charset=" + userInstance.getCharacterEncoding());
        }
    }
    
    /**
     * Sets a property in the <code>Connection</code>-persistent 
     * property map.  (Properties are disposed of when <code>Connection</code>
     * has completed). 
     * 
     * @param key the property key (for namespacing purposes, keys should 
     *        be prefaced with the full class name of the object setting the
     *        property)
     * @param value the new property value
     */
    public void setProperty(String key, Object value) {
        if (propertyMap == null) {
            propertyMap = new HashMap();
        }
        propertyMap.put(key, value);
    }
}
