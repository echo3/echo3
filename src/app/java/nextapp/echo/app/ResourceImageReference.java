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

package nextapp.echo.app;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * A representation of an image that will be retrieved as a resource from 
 * the CLASSPATH.
 */
public class ResourceImageReference
extends StreamImageReference {
    
    /**
     * Size of buffer used for reading image data from CLASSPATH and writing
     * it to <code>OutputStream</code>s.
     */
    private static final int BUFFER_SIZE = 4096;
    
    /**
     * Mapping of extensions to content types.
     */
    private static final Map extensionToContentType;
    static {
        Map map = new HashMap();
        map.put("gif",  "image/gif");
        map.put("png",  "image/png");
        map.put("jpeg", "image/jpeg");
        map.put("jpg",  "image/jpg");
        map.put("bmp",  "image/bmp");
        extensionToContentType = Collections.unmodifiableMap(map);
    }
    
    /**
     * Automatically determines the content type based on the name of a 
     * resource.
     * 
     * @param resourceName the resource name
     * @return the discovered content type
     * @throws IllegalArgumentException if no content type can be determined
     */
    private static final String getContentType(String resourceName) {
        String contentType;
    
        // Determine content type.
        int extensionDelimiterPosition = resourceName.lastIndexOf(".");
        if (extensionDelimiterPosition == -1) {
            throw new IllegalArgumentException("Invalid file extension (resource has no extension: " + resourceName + ")");
        } else {
            String extension = resourceName.substring(extensionDelimiterPosition + 1).toLowerCase();
            contentType = (String) extensionToContentType.get(extension);
            if (contentType == null) {
                throw new IllegalArgumentException("Invalid file extension (no matching content type: " + resourceName + ")");
            }
        }
        
        return contentType;
    }

    private Extent width, height;
    private String contentType;
    private String resource;
    private String id;
    
    /**
     * Creates a <code>ResourceImageReference</code>.
     * The content type will be automatically determined.
     * 
     * @param resource the resource name containing the binary image data
     */
    public ResourceImageReference(String resource) {
        this(resource, null, null, null);
    }
    
    /**
     * Creates a <code>ResourceImageReference</code>.
     * 
     * @param resource the resource name containing the binary image data
     *        (all resource names will be treated as absolute, it is 
     *        unnecessary to prepend a leading slash to the resource name)
     * @param contentType the content type of the image (or null to 
     *        automatically determine the content type based on the resource
     *        extension)
     */
    public ResourceImageReference(String resource, String contentType) {
        this(resource, contentType, null, null);
    }

    /**
     * Creates a <code>ResourceImageReference</code>.
     * The content type will be automatically determined.
     * 
     * @param resource the resource name containing the binary image data
     *        (all resource names will be treated as absolute, it is 
     *        unnecessary to prepend a leading slash to the resource name)
     * @param width the width of the image
     * @param height the height of the image
     */
    public ResourceImageReference(String resource, Extent width, Extent height) {
        this(resource, null, width, height);
    }

    /**
     * Creates a <code>ResourceImageReference</code>.
     * 
     * @param resource the resource name containing the binary image data
     *        (all resource names will be treated as absolute, it is 
     *        unnecessary to prepend a leading slash to the resource name)
     * @param contentType the content type of the image (or null to 
     *        automatically determine the content type based on the resource
     *        extension)
     * @param width the width of the image
     * @param height the height of the image
     */
    public ResourceImageReference(String resource, String contentType, Extent width, Extent height) {
        super();
        
        // Drop leading slash as all resource paths are absolute.
        if (resource.charAt(0) == '/') {
            this.resource = resource.substring(1);
        } else {
            this.resource = resource;
        }
        
        this.contentType = contentType == null ? getContentType(resource) : contentType;
        this.width = width;
        this.height = height;
        id = ApplicationInstance.generateSystemId();
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof ResourceImageReference)) {
            return false;
        }
        ResourceImageReference that = (ResourceImageReference) o;
        if (!(this.resource == that.resource || (this.resource != null && this.resource.equals(that.resource)))) {
            return false;
        }
        if (!(this.contentType == that.contentType || (this.contentType != null && this.contentType.equals(that.contentType)))) {
            return false;
        }
        if (!(this.width == that.width || (this.width != null && this.width.equals(that.width)))) {
            return false;
        }
        if (!(this.height == that.height || (this.height != null && this.height.equals(that.height)))) {
            return false;
        }
        return true;
    }
    
    /**
     * @see nextapp.echo.app.StreamImageReference#getContentType()
     */
    public String getContentType() {
        return contentType;
    }

    /**
     * @see nextapp.echo.app.ImageReference#getHeight()
     */
    public Extent getHeight() {
        return height;
    }

    /**
     * @see nextapp.echo.app.RenderIdSupport#getRenderId()
     */
    public String getRenderId() {
        return id;
    }
    
    /**
     * Returns the name of the resource.
     * 
     * @return the name of the resource
     */
    public String getResource() {
        return resource;
    }
    
    /**
     * @see nextapp.echo.app.ImageReference#getWidth()
     */
    public Extent getWidth() {
        return width;
    }

    /**
     * @see java.lang.Object#hashCode()
     */
    public int hashCode() {
        return resource == null ? 0 : resource.hashCode();
    }

    /**
     * @see nextapp.echo.app.StreamImageReference#render(java.io.OutputStream)
     */
    public void render(OutputStream out) 
    throws IOException {
        InputStream in = null;
        byte[] buffer = new byte[BUFFER_SIZE];
        int bytesRead = 0;
        
        try {
            in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
            if (in == null) {
                throw new IllegalArgumentException("Specified resource does not exist: " + resource + ".");
            }
            do {
                bytesRead = in.read(buffer);
                if (bytesRead > 0) {
                    out.write(buffer, 0, bytesRead);
                }
            } while (bytesRead > 0);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } } 
        }
    }
}
