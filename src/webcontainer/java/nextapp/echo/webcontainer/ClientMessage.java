/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";
    
    public static interface Processor {
        
        public String getProcessorName();
        
        public void process(Context context, Element dirElement)
        throws IOException ;
    }

    private static final Map processorNameToClass = new HashMap();
    
    public static void register(String name, Class processorClass) {
        processorNameToClass.put(name, processorClass);
    }
    
    private Document document;
    private String type;
    
    public ClientMessage(Document document) 
    throws IOException {
        super();

        // Retrieve message type.
        this.document = document;
        type = document.getDocumentElement().getAttribute("t");
    }
    
    public Document getDocument() {
        return document;
    }
    
    public String getType() {
        return type;
    }
    
    public void process(Context context)
    throws IOException {
        Element[] dirElements = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "dir");
        for (int i = 0; i < dirElements.length; ++i) {
            String processorName = dirElements[i].getAttribute("proc");
            
            // Find processor class, first check local cache, then 
            Class processorClass = (Class) processorNameToClass.get(processorName);
            if (processorClass == null) {
                throw new IOException("No processor exists for processor name: " + processorName);
            }

            try {
                Processor processor = (Processor) processorClass.newInstance();
                processor.process(context, dirElements[i]);
            } catch (InstantiationException ex) {
                throw new IOException("Cannot instantiate process class: " + processorClass.getName() + ": " + ex);
            } catch (IllegalAccessException ex) {
                throw new IOException("Cannot instantiate process class: " + processorClass.getName() + ": " + ex);
            }
        }
    }
}
