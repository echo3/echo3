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

package nextapp.echo.webcontainer.command;

import nextapp.echo.app.Command;
import nextapp.echo.app.Extent;

/**
 * A Web Application Container-specific <code>Command</code> to 
 * open a new browser window displaying a specific URI.
 * This action may not propogate to a client if the client has 
 * pop-up blocking algorithm enabled.
 */  
public class BrowserOpenWindowCommand 
implements Command {

    private String uri;
    private String name;
    private Extent width;
    private Extent height;
    private boolean replace;
    
    /**
     * Creates a new <code>BrowserOpenWindowCommand</code>.
     * 
     * @param uri the target URI
     * @param name the window name (may be null)
     * @param features the 'features' string which will be used to configure the
     *        new browser window (may be null)
     */
    public BrowserOpenWindowCommand(String uri, String name) {
        this(uri, name, null, null, false);
    }
    
    /**
     * Creates a new <code>BrowserOpenWindowCommand</code>.
     * 
     * @param uri the target URI
     * @param name the window name (may be null)
     * @param features the 'features' string which will be used to configure the
     *        new browser window (may be null)
     * @param replace a flag indicating whether the new URI should replace the
     *        previous URI in the window's history.  This flag is only relevant
     *        when using this command to replace a browser window.
     */
    public BrowserOpenWindowCommand(String uri, String name, Extent width, Extent height, boolean replace) {
        super();
        this.uri = uri;
        this.name = name;
        this.width = width;
        this.height = height;
    }
    
    /**
     * Returns the width of the window to be opened.
     * 
     * @returnthe width
     */
    public Extent getWidth() {
        return width;
    }
    
    /**
     * Returns the height of the window to be opened.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return height;
    }

    /**
     * Returns the window name.
     * 
     * @return the window name
     */
    public String getName() {
        return name;
    }
    
    /**
     * Returns the target URI.
     * 
     * @return the target URI
     */
    public String getUri() {
        return uri;
    }
    
    /**
     * Determines if the new URI should replace the old one in the history.
     * 
     * @return true if the new URI should replace the old one in the history
     */
    public boolean isReplace() {
        return replace;
    }
}
