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

package nextapp.echo.webcontainer.util;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.lang.ref.Reference;
import java.lang.ref.ReferenceQueue;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.RenderIdSupport;

/**
 * A table which provides an identifier-to-object mapping, with the objects 
 * being weakly referenced (i.e., the fact that they are held within this table
 * will not prevent them from being garbage collected).
 * 
 * When deserialized by Java serialization API, the references will be hard until
 * <code>purge()</code> is invoked for the first time.
 */
public class IdTable 
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /** 
     * Flag indicating whether hard references need to be converted to weak references (as a result of the object having been
     * recently deserialized. 
     */
    private boolean hasHardReferences = false;
    
    /** Mapping between identifiers and <code>WeakReference</code>s. */
    private transient Map idToReferenceMap = new HashMap();
    
    /** <code>ReferenceQueue</code> for garbage collected <code>WeakReference</code>s. */
    private transient ReferenceQueue referenceQueue = new ReferenceQueue();
    
    /**
     * Registers an object with the <code>IdTable</code>
     * 
     * @param object the object to identify
     */
    public void register(RenderIdSupport object) {
        purge();
        String id = object.getRenderId();
        WeakReference weakReference;
        synchronized(idToReferenceMap) {
            if (!idToReferenceMap.containsKey(id)) {
                weakReference = new WeakReference(object, referenceQueue);
                idToReferenceMap.put(id, weakReference);
            }
        }
    }
    
    /**
     * Retrieves the object associated with the specified identifier.
     * 
     * @param id the identifier
     * @return the object (or null, if the object is not in the queue, perhaps
     *         due to having been dereferenced and garbage collected)
     */
    public Object getObject(String id) {
        purge();
        WeakReference weakReference;
        synchronized(idToReferenceMap) {
            weakReference = (WeakReference) idToReferenceMap.get(id);
        }
        if (weakReference == null) {
            return null;
        }
        Object object = weakReference.get();
        return object;
    }
    
    /**
     * Purges dereferenced/garbage collected entries from the 
     * <code>IdTable</code>.
     */
    private void purge() {
        // Convert any hard references to weak references.
        if (hasHardReferences) {
            synchronized (idToReferenceMap) {
                Iterator idIt = idToReferenceMap.keySet().iterator();
                while (idIt.hasNext()) {
                    String id = (String) idIt.next();
                    Object object = idToReferenceMap.get(id); 
                    if (!(object instanceof WeakReference)) {
                        WeakReference weakReference = new WeakReference(object, referenceQueue);
                        idToReferenceMap.put(id, weakReference);
                    }
                }
                hasHardReferences = false;
            }
        }
        
        // Purge weak references that are no longer hard referenced elsewhere.
        Reference reference = referenceQueue.poll();
        if (reference == null) {
            // No such references exist.
            return;
        }
        Set referenceSet = new HashSet();
        while (reference != null) {
            referenceSet.add(reference);
            reference = referenceQueue.poll();
        }
        
        synchronized (idToReferenceMap) {
            Iterator idIt = idToReferenceMap.keySet().iterator();
            while (idIt.hasNext()) {
                String id = (String) idIt.next();
                if (referenceSet.contains(idToReferenceMap.get(id))) {
                    idIt.remove();
                }
            }
        }
    }

    /**
     * @see java.io.Serializable
     * 
     * Writes objects directly into values of Map as straight references.
     * The values will be changed to <code>WeakReference</code>s when 
     * purge() is called.
     */
    private void readObject(ObjectInputStream in)
    throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        
        idToReferenceMap = new HashMap();
        referenceQueue = new ReferenceQueue();
       
        String id = (String) in.readObject();
        if (id != null) {
            // Hard references will be written.
            hasHardReferences = true;

            // Load map and store objects as hard references.
            while (id != null) {
                RenderIdSupport object = (RenderIdSupport) in.readObject();
                idToReferenceMap.put(id, object);
                id = (String) in.readObject();
            }
        }
    }

    /**
     * @see java.io.Serializable
     */
    private void writeObject(ObjectOutputStream out) 
    throws IOException {
        out.defaultWriteObject();
        Iterator it = idToReferenceMap.keySet().iterator();
        while (it.hasNext()) {
            String id = (String) it.next();
            out.writeObject(id);
            Object object = idToReferenceMap.get(id);
            if (object instanceof WeakReference) {
                object = ((WeakReference) object).get();
            }
            out.writeObject(object);
        }
        // Write null to specify end of object.
        out.writeObject(null);
    }
}
