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

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.app.Window;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.ApplicationInstance</code> object.
 */
public class ApplicationInstanceTest extends TestCase {
    
    private class RegistrationTestComponent extends Component {
        int initCount = 0;
        int disposeCount = 0;
        
        public void dispose() {
            super.dispose();
            ++disposeCount;
        }

        public void init() {
            super.init();
            ++initCount;
        }
    }  

    private class ValidatingLabel extends Label {
        
        boolean valid = false;
        
        public void invalidate() {
            valid = false;
        }
        
        public void validate() {
            super.validate();
            valid = true;
        }
    }
    
    /**
     * Test setting active (ThreadLocal) <code>ApplicationInstance</code>.
     */
    public void testActivation() {
        assertNull(ApplicationInstance.getActive());
        HelloWorldApp app = new HelloWorldApp();
        assertNull(ApplicationInstance.getActive());
        ApplicationInstance.setActive(app);
        assertTrue(app == ApplicationInstance.getActive());
        ApplicationInstance.setActive(null);
        assertNull(ApplicationInstance.getActive());
    }
    
    /**
     * Test setting and retrieving contextual information.
     */
    public void testContext() {
        HelloWorldApp app = new HelloWorldApp();
        assertNull(app.getContextProperty("alpha"));
        app.setContextProperty("alpha", "bravo");
        assertEquals("bravo", app.getContextProperty("alpha"));
        app.setContextProperty("alpha", null);
        assertNull(app.getContextProperty("alpha"));
    }

    /**
     * Test registration flag of components in hierarchies belong to the
     * <code>ApplicationInstance</code>.
     */
    public void testRegistration() {
        ColumnApp columnApp = new ColumnApp();
        ApplicationInstance.setActive(columnApp);
        
        Window window = columnApp.doInit();
        assertTrue(window.isRegistered());
        assertTrue(columnApp.getColumn().isRegistered());
        Label label = new Label();
        assertFalse(label.isRegistered());
        columnApp.getColumn().add(label);
        assertTrue(label.isRegistered());
        columnApp.getColumn().remove(label);
        assertFalse(label.isRegistered());
        columnApp.getColumn().add(label);
        assertTrue(label.isRegistered());
        columnApp.getContentPane().remove(columnApp.getColumn());
        assertFalse(label.isRegistered());

        ApplicationInstance.setActive(null);
    }
    
    /**
     * Test component-application registration life-cycle methods, i.e.,
     * <code>Component.init()</code> / <code>Component.dispose()</code>.
     */
    public void testRegistrationLifecycle() {
        ColumnApp columnApp = new ColumnApp();
        ApplicationInstance.setActive(columnApp);
        columnApp.doInit();
        Column column = columnApp.getColumn();

        RegistrationTestComponent rtc = new RegistrationTestComponent();
        
        assertEquals(0, rtc.initCount);
        assertEquals(0, rtc.disposeCount);
        
        column.add(rtc);
        
        assertEquals(1, rtc.initCount);
        assertEquals(0, rtc.disposeCount);
        
        column.remove(rtc);
        
        assertEquals(1, rtc.initCount);
        assertEquals(1, rtc.disposeCount);
        
        ApplicationInstance.setActive(null);
    }
    
    /**
     * Test component-application registration life-cycle methods, i.e.,
     * <code>Component.init()</code> / <code>Component.dispose()</code>
     * with regard to initial hierarchy.
     */
    public void testRegistrationLifecycleInitialHierarchy() {
        final RegistrationTestComponent rtc = new RegistrationTestComponent();

        assertEquals(0, rtc.initCount);
        assertEquals(0, rtc.disposeCount);
        
        ColumnApp columnApp = new ColumnApp(){
        
            public Window init() {
                Window window = super.init();
                getColumn().add(rtc);
                return window;
            }
        };
        ApplicationInstance.setActive(columnApp);
        columnApp.doInit();

        assertEquals(1, rtc.initCount);
        assertEquals(0, rtc.disposeCount);
        
        ApplicationInstance.setActive(null);
    }
    
    /**
     * Test <code>Component.validate()</code> being invoked at
     * application initialization and after client update processing.
     */
    public void testValidation() {
        final ValidatingLabel validatingLabel = new ValidatingLabel();
        ColumnApp app = new ColumnApp() {
            public Window init() {
                Window window = super.init();
                getColumn().add(validatingLabel);
                return window;
            }
        };
        
        assertFalse(validatingLabel.valid);
        
        ApplicationInstance.setActive(app);
        
        app.doInit();
        
        // Test for initial validation.
        assertTrue(validatingLabel.valid);

        validatingLabel.invalidate();
        assertFalse(validatingLabel.valid);
        
        // test validation after client update processing.
        app.getUpdateManager().processClientUpdates();
        assertTrue(validatingLabel.valid);
        
        ApplicationInstance.setActive(null);
    }
}
