/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Provides information about changes to <code>UserInstance</code> properties
 * of which the client engine needs to be informed.
 */
public class UserInstanceUpdateManager 
implements Serializable {

    private static final String[] EMPTY_STRING_ARRAY = new String[0];
    private Set updatedPropertyNames = new HashSet();
    
    /**
     * Retrieves the names of updated properties.
     * This method is queried by the <code>SynchronizeService</code>.
     * 
     * @return an array of the updated property names (returns an empty array
     *         if no properties have changed)
     */
    public String[] getPropertyUpdateNames() {
        int size = updatedPropertyNames.size(); 
        if (size == 0) {
            return EMPTY_STRING_ARRAY;
        }
        return (String[]) updatedPropertyNames.toArray(new String[size]);
    }
    
    /**
     * Processes a property update from the <code>UserInstance</code>, storing
     * the name of the property in the list of properties to be updated.
     * 
     * @param name the name of the property
     */
    void processPropertyUpdate(String name) {
        updatedPropertyNames.add(name);
    }
    
    /**
     * Purges list of updated property names.
     * This method is invoked by the <code>SynchronizeService</code> when it 
     * has finished rendering the updates to the client.
     */
    public void purge() {
        updatedPropertyNames.clear();
    }
}
