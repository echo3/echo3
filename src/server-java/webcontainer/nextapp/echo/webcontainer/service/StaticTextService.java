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

import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.util.Resource;

/**
 * A service which renders a text resource, such as a text or XML document.
 */
public class StaticTextService 
implements Service {
    
    /**
     * Creates a new <code>StaticTextService</code> based on the content in the
     * specified <code>CLASSPATH</code> resource.  A runtime exception will be 
     * thrown in the even the resource does not exist (it generally should not
     * be caught).
     * 
     * @param id the <code>Service</code> identifier
     * @param contentType the content type of the document
     * @param resourceName the path to the content resource in the 
     *        <code>CLASSPATH</code>
     * @return the created <code>StaticTextService</code>
     */
    public static StaticTextService forResource(String id, String contentType, String resourceName) {
        String content = Resource.getResourceAsString(resourceName);
        return new StaticTextService(id, contentType, content);
    }

    /** The <code>Service</code> identifier. */
    private String id;
    
    /** The text content to be served. */
    private String content;
    
    /** The content type of the data. */
    private String contentType;
    
    /**
     * Creates a new <code>StaticTextService</code>.
     * 
     * @param id the <code>Service</code> identifier
     * @param contentType the content type of the document
     * @param content the text
     */
    public StaticTextService(String id, String contentType, String content) {
        super();
        this.id = id;
        this.contentType = contentType;
        this.content = content;
    }
    
    /**
     * @see Service#getId()
     */
    public String getId() {
        return id;
    }
    
    /**
     * @see Service#getVersion()
     */
    public int getVersion() {
        return 0;
    }
    
    /**
     * @see Service#service(nextapp.echo.webcontainer.Connection)
     */
    public void service(Connection conn) throws IOException {
        conn.getResponse().setContentType(contentType);
        conn.getWriter().print(content);
    }
}
