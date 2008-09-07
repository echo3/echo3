/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
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
 * A top-level window.
 */
public class Window extends Component {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    public static final String PROPERTY_TITLE = "title";
    
    /**
     * Creates a new window.
     */
    public Window() {
        super();
        add(new ContentPane());
    }
    
    /**
     * Returns the content of the window.
     * 
     * @return the content of the window
     */
    public ContentPane getContent() {
        if (getComponentCount() == 0) {
            return null;
        } else {
            return (ContentPane) getComponent(0);
        }
    }
    
    /**
     * Returns the window title.
     * 
     * @return the window title
     */
    public String getTitle() {
        return (String) get(PROPERTY_TITLE);
    }
    
    /**
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component component) {
        return getComponentCount() == 0 && component instanceof ContentPane;
    }
    
    /**
     * Reject all parents (<code>Window</code> may only be used as a 
     * top-level component).
     * 
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component parent) {
        return false;
    }
    
    /**
     * Sets the content of the window.
     * 
     * @param newValue the new window content
     */
    public void setContent(ContentPane newValue) {
        removeAll();
        add(newValue);
    }
    
    /**
     * Sets the window title.
     * 
     * @param newValue the new window title
     */
    public void setTitle(String newValue) {
        set(PROPERTY_TITLE, newValue);
    }
}
