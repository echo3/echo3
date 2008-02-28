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

package nextapp.echo.webcontainer.test;

import nextapp.echo.webcontainer.ServiceRegistry;
import junit.framework.TestCase;

/**
 * Test for <code>ServiceRegistry</code>.
 */
public class ServiceRegistryTest extends TestCase {
    
    /**
     * Test basic add/get/remove functionality of <code>ServiceRegistry</code>.
     */
    public void testBasic() {
        ServiceRegistry services = new ServiceRegistry();
        NullService alpha = new NullService("alpha");
        services.add(alpha);
        NullService bravo = new NullService("bravo");
        services.add(bravo);
        assertEquals(alpha, services.get("alpha"));
        assertEquals(bravo, services.get("bravo"));
        assertNull(services.get("charlie"));
        services.remove(bravo);
        assertNull(services.get("bravo"));
    }
    
    /**
     * Ensure that two services may not be added with the same service id.
     */
    public void testConflict() {
        ServiceRegistry services = new ServiceRegistry();
        NullService alpha = new NullService("alpha");
        services.add(alpha);
        NullService anotherAlpha = new NullService("alpha");
        try {
            services.add(anotherAlpha);
            fail();
        } catch (IllegalArgumentException ex) {
            // Expected.
        }
    }
    
    /**
     * Ensure that adding the same service twice does not throw an exception.
     */
    public void testReAdd() {
        ServiceRegistry services = new ServiceRegistry();
        NullService alpha = new NullService("alpha");
        services.add(alpha);
        services.add(alpha);
    }
}
