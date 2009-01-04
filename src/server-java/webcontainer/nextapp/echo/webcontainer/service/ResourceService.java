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
import java.io.InputStream;
import java.io.OutputStream;

import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;

/**
 * Serves a static resource that has been added to the <code>ResourceRegistry</code>.
 */
public class ResourceService 
implements Service {
    
    /** Singleton instance. */
    public static final ResourceService INSTANCE = new ResourceService();

    /** URL parameter used to specify package. */
    private static final String PARAMETER_PACKAGE = "pkg";
    
    /** URL parameter used to specify resource name. */
    private static final String PARAMETER_RESOURCE = "res";
    
    /** Default constructor. */
    private ResourceService() { }
    
    /**
     * @see nextapp.echo.webcontainer.Service#getId()
     */
    public String getId() {
        return "Echo.Resource";
    }

    /**
     * @see nextapp.echo.webcontainer.Service#getVersion()
     */
    public int getVersion() {
        return 0;
    }

    /**
     * @see nextapp.echo.webcontainer.Service#service(nextapp.echo.webcontainer.Connection)
     */
    public void service(Connection conn) throws IOException {
        ResourceRegistry registry = WebContainerServlet.getResourceRegistry();
        String packageId = conn.getRequest().getParameter(PARAMETER_PACKAGE);
        String resourceName = conn.getRequest().getParameter(PARAMETER_RESOURCE);
        
        ContentType contentType = registry.getContentType(packageId, resourceName);
        if (contentType == null) {
            throw new IllegalArgumentException("Resource \"" + packageId + ":" + resourceName + "\" is not registered.");
        }
        
        conn.setContentType(contentType);
        
        String location = registry.getLocation(packageId, resourceName);
        
        InputStream in = ResourceService.class.getClassLoader().getResourceAsStream(location);
        if (in == null) {
            throw new IllegalArgumentException("Resource does not exist: \"" + resourceName + "\".  " 
                    + "Looking in: \"" + location + "\".");
        }
        OutputStream out = conn.getOutputStream();

        byte[] buffer = new byte[4096];
        int bytesRead = 0;
        
        try {
            do {
                bytesRead = in.read(buffer);
                if (bytesRead > 0) {
                    out.write(buffer, 0, bytesRead);
                }
            } while (bytesRead > 0);
        } catch (final IOException ex) {
            throw new IllegalArgumentException("Cannot get resource: \"" + resourceName + "\".") {
                public Throwable getCause() {
                    return ex;
                }
            };
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } } 
        }
    }
}
