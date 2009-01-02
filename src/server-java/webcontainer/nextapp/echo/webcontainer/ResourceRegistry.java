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

public class ResourceRegistry {

    private Map packageToLocationMap = new HashMap();
    private Map packageToResourceMap = new HashMap();
    
    public synchronized void addPackage(String packageId, String location) {
        String existingLocation = (String) packageToLocationMap.get(packageId);
        if (existingLocation != null) {
            if (existingLocation.equals(location)) {
                // Do nothing.
                return;
            } else {
                throw new IllegalArgumentException("Cannot change location of resource package \"" + packageId + "\".");
            }
        }
        
        packageToLocationMap.put(packageId, location);
        packageToResourceMap.put(packageId, new HashMap());
    }
    
    public synchronized void add(String packageId, String resourceName, ContentType contentType) {
        Map resourceMap = (Map) packageToResourceMap.get(packageId);
        if (resourceMap == null) {
            throw new IllegalArgumentException("Resource package \"" + packageId + "\" has not been registered."); 
        }
        
        if (resourceMap.get(resourceName) != null) {
            throw new IllegalArgumentException("Resource \"" + packageId + ":" + resourceName + "\" already registered.");
        }
        resourceMap.put(resourceName, contentType);
    }
    
    public ContentType getContentType(String packageId, String resourceName) {
        Map resourceMap = (Map) packageToResourceMap.get(packageId);
        if (resourceMap == null) {
            return null;
        }
        return (ContentType) resourceMap.get(resourceName);
    }

    public String getLocation(String packageId, String resourceName) {
        String packageLocation = (String) packageToLocationMap.get(packageId);
        if (packageLocation == null) {
            throw new IllegalArgumentException("Resource package \"" + packageId + "\" has not been registered."); 
        }
        
        Map resourceMap = (Map) packageToResourceMap.get(packageId);
        if (!resourceMap.containsKey(resourceName)) {
            throw new IllegalArgumentException("Resource \"" + packageId + ":" + resourceName + "\" has not been registered.");
        }
        
        return packageLocation + resourceName;
    }
}
