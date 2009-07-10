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
 *  A registry of CLASSPATH resources which are provided to the client via the <code>ResourceService</code>.
 *  Only specifically added resources are provided, for obvious security reasons.
 */
public class ResourceRegistry {

    /**
     * Describes a specific resource package.
     */
    private class PackageData {
        
        /** The package root location. */
        String location;
        
        /** Mapping between resource names and content types. */
        Map resourceNameToContentType = new HashMap();
        
        /**
         * Creates a new <code>PackageData</code>.
         * 
         * @param location the package root location
         */
        PackageData(String location) {
            this.location = location;
        }
    }
    
    /**
     * Mapping between package names and <code>PackageData</code> descriptors.
     */
    private Map packageMap = new HashMap();
    
    /**
     * Registers a new resource package.
     * 
     * @param packageId the identifier to use for the package, e.g., "Echo" is used for core resources.
     * @param location the root location from which package resources can be retrieved (resource locations
     *        are relative to this location)
     */
    public synchronized void addPackage(String packageId, String location) {
        // Ensure existing package data is not being overwritten. 
        PackageData packageData = (PackageData) packageMap.get(packageId);
        if (packageData != null) {
            if (packageData.location.equals(location)) {
                // Do nothing.
                return;
            } else {
                throw new IllegalArgumentException("Cannot change location of resource package \"" + packageId + "\".");
            }
        }
        
        // Store new package data object.
        packageMap.put(packageId, new PackageData(location));
    }
    
    /**
     * Adds a resource to a package.
     * 
     * @param packageId the package identifier
     * @param resourceName the name of the resource (the location of the resource relative to the package root location)
     * @param contentType the content type of the resource
     */
    public synchronized void add(String packageId, String resourceName, ContentType contentType) {
        // Retrieve package data.
        PackageData packageData = (PackageData) packageMap.get(packageId);
        
        // Ensure package exists.
        if (packageData == null) {
            throw new IllegalArgumentException("Resource package \"" + packageId + "\" has not been registered."); 
        }
        
        // Ensure another resource is not being overwritten.
        if (packageData.resourceNameToContentType.get(resourceName) != null) {
            throw new IllegalArgumentException("Resource \"" + packageId + ":" + resourceName + "\" already registered.");
        }
        
        // Store content type.
        packageData.resourceNameToContentType.put(resourceName, contentType);
    }

    /**
     * Determines the content type of a resource.
     * 
     * @param packageId the package identifier
     * @param resourceName the resource name
     * @return the content type of the resource (or null if none exists)
     */
    public ContentType getContentType(String packageId, String resourceName) {
        PackageData packageData = (PackageData) packageMap.get(packageId);
        if (packageData == null) {
            return null;
        }
        return (ContentType) packageData.resourceNameToContentType.get(resourceName);
    }

    /**
     * Determines the location of a resource.
     * 
     * @param packageId the package identifier
     * @param resourceName the resource name
     * @return the location of the resource
     */
    public String getLocation(String packageId, String resourceName) {
        PackageData packageData = (PackageData) packageMap.get(packageId);
        if (packageData == null) {
            throw new IllegalArgumentException("Resource package \"" + packageId + "\" has not been registered."); 
        }
        
        if (!packageData.resourceNameToContentType.containsKey(resourceName)) {
            throw new IllegalArgumentException("Resource \"" + packageId + ":" + resourceName + "\" has not been registered.");
        }
        
        return packageData.location + resourceName;
    }
}
