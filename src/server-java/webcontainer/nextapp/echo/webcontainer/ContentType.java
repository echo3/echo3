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

/**
 * A representation of a content-type.
 * This object contains a MIME-type and a flag indicating whether the 
 * content-type is used exclusively for binary data (i.e., indicating whether
 * a character encoding needs to be specified).
 */
public class ContentType 
implements Serializable {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final ContentType IMAGE_GIF = new ContentType("image/gif", true);
    public static final ContentType IMAGE_PNG = new ContentType("image/png", true);
    public static final ContentType IMAGE_JPEG = new ContentType("image/jpeg", true);
    public static final ContentType MULTIPART_FORM_DATA = new ContentType("multipart/form-data", false);
    public static final ContentType TEXT_HTML = new ContentType("text/html", false);
    public static final ContentType TEXT_JAVASCRIPT = new ContentType("text/javascript", false);
    public static final ContentType TEXT_PLAIN = new ContentType("text/plain", false);
    public static final ContentType TEXT_XML = new ContentType("text/xml", false);
    public static final ContentType TEXT_CSS = new ContentType("text/css", false);
    public static final ContentType APPLICATION_FLASH = new ContentType("application/x-shockwave-flash", true);

    /** The mime type. */
    private String mimeType = null;
    
    /** Flag indicating whether the content type is binary (true) or text (false). */
    private boolean binary = false;
    
    /**
     * Creates a new content type.
     *
     * @param mimeType The MIME type of the content type.
     * @param binary True if the content type is used exclusively for binary 
     *        data, i.e., it does not require any character encoding
     */
    public ContentType(String mimeType, boolean binary) {
        super();
        
        if (mimeType == null) {
            throw new NullPointerException("Cannot create content type with null MIME type");
        }
        
        this.mimeType = mimeType;
        this.binary = binary;
    }
    
    /**
     * @see java.lang.Object#equals(Object)
     */
    public boolean equals(Object o) {
        boolean equal;
        
        if (o instanceof ContentType) {
            ContentType that = (ContentType) o;
            equal = this.mimeType.equals(that.mimeType);
        } else {
            equal = false;
        }
        
        return equal;
    }
    
    /** 
     * Returns the MIME type.
     *
     * @return The MIME type.
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * Determines if the content type is used exclusively for binary 
     *        data, i.e., it does not require any character encoding
     *
     * @return true if the content type is binary
     */
    public boolean isBinary() {
        return binary;
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        return mimeType;
    }
}
