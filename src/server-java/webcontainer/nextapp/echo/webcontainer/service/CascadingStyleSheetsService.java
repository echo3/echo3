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

import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.util.Resource;

/**
 * A service which renders <code>CSS</code> resource files.
 * 
 * @author sieskei (XSoft Ltd.)
 */
public class CascadingStyleSheetsService extends DefaultStringVersionService {
    
    /**
     * Creates a new <code>CascadingStyleSheetsService</code> based on the content in
     * the specified <code>CLASSPATH</code> resource. A runtime exception will
     * be thrown in the event the resource does not exist (it generally should
     * not be caught).
     * 
     * Please Note that all urls in the StyleSheet must be relative to the
     * Servlet location when this method is used.
     * 
     * @param id the <code>Service</code> identifier
     * @param resourceName the path to the content resource in the <code>CLASSPATH</code>
     * @return the created <code>CascadingStyleSheetsService</code>
     */  
    public static CascadingStyleSheetsService forResource(String id, String resourceName) {
        String content = Resource.getResourceAsString(resourceName);
        return new CascadingStyleSheetsService(id, content);
    }
    
    /**
     * Creates a new <code>CascadingStyleSheetsService</code>.
     * 
     * @param id the <code>Service</code> id
     * @param content the <code>CSS content</code>
     */
    public CascadingStyleSheetsService(String id, String content) {
        super(id, content);
    }
  

    /**
     * @see DefaultStringVersionService#getContnentType()
     */
    @Override
    ContentType getContnentType() {
        return ContentType.TEXT_CSS;
    }
}
