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

package nextapp.echo.app.test;

import nextapp.echo.app.ContentPane;
import nextapp.echo.app.IllegalChildException;
import nextapp.echo.app.Label;
import nextapp.echo.app.Window;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Window</code> component.
 */
public class WindowTest extends TestCase {
    
    /**
     * Tests changing content of window.
     */
    public void testChangeContent() {
        Window window = new Window();
        window.setContent(new ContentPane());
        ContentPane content = new ContentPane();
        window.setContent(content);
        assertEquals(content, window.getContent());
    }
    
    /**
     * Attempts to illegally add more than one <code>ContentPane</code>s to a 
     * <code>Window</code>, tests for failure.
     */
    public void testOverload() {
        Window window = new Window();
        window.removeAll();
        window.add(new ContentPane());
        boolean exceptionThrown = false;
        try {
            window.add(new ContentPane());
        } catch (IllegalChildException ex) {
            exceptionThrown = true;
        }
        assertTrue(exceptionThrown);
    }
    
    /**
     * Attempts to illegally add a <code>Label</code> to a 
     * <code>Window</code>, tests for failure.
     */
    public void testInvalidChild() {
        Window window = new Window();
        window.removeAll();
        boolean exceptionThrown = false;
        try {
            window.add(new Label());
        } catch (IllegalChildException ex) {
            exceptionThrown = true;
        }
        assertTrue(exceptionThrown);
    }
    
    /**
     * Tests property accessors and mutators.
     */
    public void testProperties() {
        Window window = new Window();
        window.setTitle("Title!!!");
        assertEquals("Title!!!", window.getTitle());
    }
}
