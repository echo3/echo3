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

package nextapp.echo.webcontainer;

import java.util.HashMap;
import java.util.Map;

/**
 * A registry of <code>Service</code> objects that may be recalled based
 * on <code>Id</code> values.
 */
public class ServiceRegistry {

    /** Maps service Ids to services */
    private final Map serviceMap = new HashMap();
    
    /**
     * Creates a new <code>ServiceRegistry</code>.
     */
    public ServiceRegistry() {
        super();
    }
    
    /** 
     * Adds a service to the registry.
     * <p>
     * By default, this will throw an <code>IllegalArgumentException</code>
     * if an attempt to register two different service objects under the same
     * service id is made.
     * </p>
     * <p>
     * However, there may be times when it is desirable to simply ignore these
     * extra requests and return without throwing an exception, such as when
     * a JVM-level shared memory cache is in operation within a cluster.  In this
     * situation, the service registry may have already been populated by another
     * node member, and when the application is first invoked an another node
     * member, attempts will be made to populate the registry again.  In this
     * situation, we just ignore the superfluous requests.
     * </p>
     * <p>
     * In order to turn off the duplicate service id exception for this scenario,
     * specify the system property <code>nextapp.echo.webcontainer.ServiceRegistry.disableDuplicateServiceCheck</code>
     * with a value of <code>true</code>.
     *
     * @param service The service to be added.
     */
    public synchronized void add(Service service) {
        if (serviceMap.containsKey(service.getId()) 
                && !serviceMap.get(service.getId()).getClass().getName().equals(service.getClass().getName())) {
            throw new IllegalArgumentException("Identifier already in use by another service."
                    + " id: " + service.getId()
                    + " installed service: " + serviceMap.get(service.getId()).getClass().getName()
                    + " added service: " + service.getClass().getName());
        }
        serviceMap.put(service.getId(), service);
    }
    
    /**
     * Returns the service with the specified <code>Id</code>.
     *
     * @param id The <code>Id</code> of the service to be retrieved.
     * @return The service which is identified by <code>id</code>.
     */
    public Service get(String id) {
        return (Service) serviceMap.get(id);
    }
    
    /** 
     * Removes a service from the registry.
     *
     * @param service The service to be removed.
     */
    public synchronized void remove(Service service) {
        serviceMap.remove(service.getId());
    }
}
