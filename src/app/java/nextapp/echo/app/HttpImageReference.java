/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

/**
 * A reference to an image that may be retrieved through an HTTP request.
 */
public class HttpImageReference
implements ImageReference {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private String uri;
    private Extent width, height;
    private String id;
    
    /**
     * Creates a reference to an image at the specified URI of unknown size.
     *
     * @param uri a URI from which the image data may be obtained
     */
    public HttpImageReference(String uri) {
        this(uri, null,  null);
    }
    
    /**
     * Creates a reference to an image at the specified URI of the given width
     * and height.  If the image is not of the given width and height, it will
     * be scaled to the given width and height.
     *
     * @param uri a URI from which the image data may be obtained
     * @param width The width at which to render the image
     * @param height The height at which to render the image
     */
    public HttpImageReference(String uri, Extent width, Extent height) {
        super();
        this.uri = uri;
        this.width = width;
        this.height = height;
        id = ApplicationInstance.generateSystemId();
    }

    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof HttpImageReference)) {
            return false;
        }
        HttpImageReference that = (HttpImageReference) o;
        if (!(this.uri == that.uri || (this.uri != null && this.uri.equals(that.uri)))) {
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
     * Returns the URI from which the image may be obtained.
     *
     * @return the URI of the image
     */
    public String getUri() {
        return uri;
    }
    
    /**
     * @see nextapp.echo.app.ImageReference#getWidth()
     */
    public Extent getWidth() {
        return width;
    }
}
