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

package nextapp.echo.webcontainer.command;

import nextapp.echo.app.Command;
import nextapp.echo.app.Extent;

/**
 * A Web Application Container-specific <code>Command</code> to 
 * open a new browser window displaying a specific URI.
 * This action may not propagate to a client if the client has 
 * pop-up blocking algorithm enabled.
 */  
public class BrowserOpenWindowCommand 
implements Command {
    
    /** 
     * Flag to replace entry in browser's navigation history with new window content.  
     * Note that some browsers may ignore this flag. 
     */
    public static final int FLAG_REPLACE = 0x1;
    
    /** Flag to enable the browser's menu bar. */
    public static final int FLAG_MENUBAR = 0x2;
    
    /** Flag to enable the browser's tool bar. */
    public static final int FLAG_TOOLBAR = 0x4;
    
    /** Flag to enable the browser's location input field. */
    public static final int FLAG_LOCATION = 0x8;
    
    /** Flag to enable the browser's status field. */
    public static final int FLAG_STATUS = 0x10;
    
    /** 
     * Flag to recommend that the browser allow resizing of the window.  
     * Some environments may always allow the window to be resized.
     */
    public static final int FLAG_RESIZABLE = 0x20;
    
    /** The URI to display. */
    private String uri;
    
    /** The window name. */
    private String name;
    
    /** The width of the window. */
    private Extent width;
    
    /** The height of the window. */
    private Extent height;
    
    /** Bitwise settings for the window. */
    private int flags;
    
    /**
     * Creates a new <code>BrowserOpenWindowCommand</code>.
     * 
     * @param uri the target URI
     * @param name the window name (may be null)
     */
    public BrowserOpenWindowCommand(String uri, String name) {
        this(uri, name, null, null, FLAG_MENUBAR | FLAG_TOOLBAR | FLAG_LOCATION | FLAG_RESIZABLE);
    }
    
    /**
     * Creates a new <code>BrowserOpenWindowCommand</code>.
     * 
     * @param uri the target URI
     * @param name the window name (may be null)
     * @param width the window width (may be null)
     * @param height the window width (may be null)
     * @param flags the configuration flags, zero or more of the following values ORed together:
     *        <ul>
     *         <li><code>FLAG_REPLACE</code></li>
     *         <li><code>FLAG_MENUBAR</code></li>
     *         <li><code>FLAG_TOOLBAR</code></li>
     *         <li><code>FLAG_LOCATION</code></li>
     *         <li><code>FLAG_STATUS</code></li>
     *         <li><code>FLAG_RESIZABLE</code></li>
     *        </ul>
     */
    public BrowserOpenWindowCommand(String uri, String name, Extent width, Extent height, int flags) {
        super();
        this.uri = uri;
        this.name = name;
        this.width = width;
        this.height = height;
        this.flags = flags;
    }
    
    /**
     * Returns the width of the window to be opened.
     * 
     * @return the width
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
     * Returns the configuration flags, zero or more of the following values ORed together:
     * <ul>
     *  <li><code>FLAG_REPLACE</code></li>
     *  <li><code>FLAG_MENUBAR</code></li>
     *  <li><code>FLAG_TOOLBAR</code></li>
     *  <li><code>FLAG_LOCATION</code></li>
     *  <li><code>FLAG_STATUS</code></li>
     *  <li><code>FLAG_RESIZABLE</code></li>
     * </ul>
     * 
     * @return the configuration flags
     */
    public int getFlags() {
        return flags;
    }
}
