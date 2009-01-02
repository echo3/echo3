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

import java.util.Locale;

import nextapp.echo.app.ApplicationInstance;
//import nextapp.echo.app.Component;
//import nextapp.echo.app.LayoutDirection;
import junit.framework.TestCase;

/**
 * Unit tests for <code>nextapp.echo.app.LayoutDirection</code>.
 */
public class LayoutDirectionTest extends TestCase {

    private static final Locale ARABIC = new Locale("ar");
    private static final Locale HEBREW = new Locale("iw");
    private static final Locale PERSIAN = new Locale("fa");
    private static final Locale URDU = new Locale("ur");

    private ColumnApp app;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp() {
        app = new ColumnApp();
        ApplicationInstance.setActive(app);        
        app.doInit();
    }
    
    /**
     * @see junit.framework.TestCase#tearDown()
     */
    public void tearDown() {
        ApplicationInstance.setActive(null);
    }
    
    public void testApplication() {
        app.setLocale(Locale.US);
        assertTrue(app.getLayoutDirection().isLeftToRight());
        app.setLocale(ARABIC);
        assertFalse(app.getLayoutDirection().isLeftToRight());
        app.setLocale(Locale.ENGLISH);
        assertTrue(app.getLayoutDirection().isLeftToRight());
        app.setLocale(URDU);
        assertFalse(app.getLayoutDirection().isLeftToRight());
        app.setLocale(Locale.GERMANY);
        assertTrue(app.getLayoutDirection().isLeftToRight());
        app.setLocale(PERSIAN);
        assertFalse(app.getLayoutDirection().isLeftToRight());
        app.setLocale(Locale.UK);
        assertTrue(app.getLayoutDirection().isLeftToRight());
        app.setLocale(HEBREW);
        assertFalse(app.getLayoutDirection().isLeftToRight());
        app.setLocale(Locale.ITALIAN);
        assertTrue(app.getLayoutDirection().isLeftToRight());
    }
    
//    public void testComponentInheritanceFromApplication() {
//        Component component = new NullComponent();
//        assertNull(component.getRenderLayoutDirection());
//        
//        app.getColumn().add(component);
//        
//        app.setLocale(Locale.US);
//        assertTrue(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.setLocale(ARABIC);
//        assertFalse(component.getRenderLayoutDirection().isLeftToRight());
//    }
    
//    public void testComponentInheritanceFromHierarchy() {
//        Component component = new NullComponent();
//        app.getColumn().add(component);
//        
//        app.setLocale(Locale.US);
//        assertTrue(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getDefaultWindow().setLocale(ARABIC);
//        assertFalse(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getContentPane().setLocale(Locale.ITALY);
//        assertTrue(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getContentPane().setLayoutDirection(LayoutDirection.RTL);
//        assertFalse(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getContentPane().setLayoutDirection(null);
//        assertTrue(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getColumn().setLocale(HEBREW);
//        assertFalse(component.getRenderLayoutDirection().isLeftToRight());
//        
//        app.getColumn().setLayoutDirection(LayoutDirection.LTR);
//        assertTrue(component.getRenderLayoutDirection().isLeftToRight());
//    }
}
