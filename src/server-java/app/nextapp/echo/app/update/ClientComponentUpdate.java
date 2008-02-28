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

package nextapp.echo.app.update;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.Component;

/**
 * A representation of all updates made on the client to an individual
 * component.
 */
public class ClientComponentUpdate 
implements Serializable {
        
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private Component component;
    private Map inputs;
    
    /**
     * Creates a <code>ClientComponentUpdate</code>.
     * 
     * @param component the updated component
     */
    ClientComponentUpdate(Component component) {
        super();
        this.component = component;
        inputs = new HashMap();
    }
    
    /**
     * Adds an input property to the update, describing a single change
     * to the component's client-side state.
     * 
     * @param inputName the name of the input property
     * @param inputValue the new state of the property
     */
    public void addInput(String inputName, Object inputValue) {
        inputs.put(inputName, inputValue);
    }

    /**
     * Returns the updated component.
     * 
     * @return the component
     */
    public Component getComponent() {
        return component;
    }
    
    /**
     * Returns an iterator over the names of all input properties.
     * 
     * @return the <code>Iterator</code>
     */
    public Iterator getInputNames() {
        return Collections.unmodifiableSet(inputs.keySet()).iterator();
    }

    /**
     * Retrieves the new state of the specified input property.
     * 
     * @param inputName the name of the input property
     * @return the new state
     */
    public Object getInputValue(String inputName) {
        return inputs.get(inputName);
    }
    
    /**
     * Determines if an input was posted with the specified property name.
     * 
     * @param inputName the input property name
     * @return true if an input is posted
     */
    public boolean hasInput(String inputName) {
        return inputs.containsKey(inputName);
    }
}
