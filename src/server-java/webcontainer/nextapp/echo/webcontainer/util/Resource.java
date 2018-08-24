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

package nextapp.echo.webcontainer.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Provides functionality for obtaining text and binary resource files.
 */
public class Resource {
    
    /** Buffer size for use in streaming an <code>InputStream</code> to an <code>OutputStream</code>. */
    private static final int BUFFER_SIZE = 4096;
    
    /**
     * A RuntimeException exception that will be thrown in the event that
     * problems are encountered obtaining a resource.
     */
    public static class ResourceException extends RuntimeException {
    
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;
    
        /**
         * Creates a resource exception.
         *
         * @param message a description of the error
         * @param cause the causal exception
         */
        private ResourceException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Retrieves the specified resource as a <code>String</code>.
     *
     * @param resourceName the name of the resource to be retrieved
     * @return the specified resource as a <code>String</code>
     */
    public static String getResourceAsString(String resourceName) {
        return getResource(resourceName).toString();
    }
    
    /**
     * Retrieves the specified resource as an array of <code>byte</code>s.
     *
     * @param resourceName the name of the resource to be retrieved
     * @return the specified resource as an array of <code>byte</code>s
     */
    public static byte[] getResourceAsByteArray(String resourceName) {
        return getResource(resourceName).toByteArray();
    }
    
    /**
     * An internal method used to retrieve a resource as a
     * <code>ByteArrayOutputStream</code>.
     *
     * @param resourceName the name of the resource to be retrieved
     * @return a <code>ByteArrayOutputStream</code> of the content of the
     *         resource
     */
    private static ByteArrayOutputStream getResource(String resourceName) {
        InputStream in = null;
        byte[] buffer = new byte[BUFFER_SIZE];
        ByteArrayOutputStream out = null;
        int bytesRead = 0;
        
        try {
            in = Resource.class.getClassLoader().getResourceAsStream(resourceName);
            if (in == null) {
                throw new ResourceException("Resource does not exist: \"" + resourceName + "\".", null);
            }
            out = new ByteArrayOutputStream();
            do {
                bytesRead = in.read(buffer);
                if (bytesRead > 0) {
                    out.write(buffer, 0, bytesRead);
                }
            } while (bytesRead > 0);
        } catch (IOException ex) {
            throw new ResourceException("Cannot get resource: \"" + resourceName + "\".", ex);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } } 
        }
        
        return out;
    }

    /** Non-instantiable class. */
    private Resource() { }
}
