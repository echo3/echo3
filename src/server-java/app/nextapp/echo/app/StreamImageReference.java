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

package nextapp.echo.app;

import java.io.IOException;
import java.io.OutputStream;

/**
 * Base class for <code>ImageReference</code>s whose content is delivered by an <code>OutputStream</code>.
 * Some internal <code>ImageReference</code> types are based on this class, and it may also be used for
 * images streamed by an application.
 */
public abstract class StreamImageReference 
implements ImageReference {

    /**
     * Default constructor.
     */
    public StreamImageReference() {
        super();
    }
    
    /**
     * Returns the valid RFC 1521 image content type (e.g., image/png, 
     * image/jpeg, image/gif, etc) of the image.
     * 
     * @return the content type of the image
     */
    public abstract String getContentType();
    
    /**
     * @see nextapp.echo.app.ImageReference#getHeight()
     */
    public Extent getHeight() {
        return null;
    }
    
    /**
     * @see nextapp.echo.app.ImageReference#getWidth()
     */
    public Extent getWidth() {
        return null;
    }
    
    /**
     * Renders the image data in its native format to the given output stream.
     *
     * @param out the output stream to write the image
     */
    public abstract void render(OutputStream out) 
    throws IOException;
}
