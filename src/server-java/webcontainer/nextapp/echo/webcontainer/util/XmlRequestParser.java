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

package nextapp.echo.webcontainer.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import nextapp.echo.app.util.DomUtil;

public class XmlRequestParser {
    
    /**
     * Trims an XML <code>InputStream</code> to work around the issue 
     * of the XML parser crashing on trailing whitespace.   This issue is present 
     * with requests from Konqueror/KHTML browsers. 
     * 
     * @param in the <code>InputStream</code>
     * @param characterEncoding the character encoding of the stream 
     * @return a cleaned version of the stream, as a 
     *         <code>ByteArrayInputStream</code>.
     */
    private static InputStream cleanXmlInputStream(InputStream in, String characterEncoding) 
    throws IOException{
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        
        byte[] buffer = new byte[4096];
        int bytesRead = 0;
        
        try {
            do {
                bytesRead = in.read(buffer);
                if (bytesRead > 0) {
                    byteOut.write(buffer, 0, bytesRead);
                }
            } while (bytesRead > 0);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } } 
        }
        
        in.close();
        
        byte[] data = byteOut.toByteArray();
        data = new String(data, characterEncoding).trim().getBytes(characterEncoding);
        
        return new ByteArrayInputStream(data);
    }
    
    /**
     * Generates a DOM representation of the XML input POSTed to a servlet.
     * 
     * @param request the incoming <code>HttpServletRequest</code>
     * @param characterEncoding the character encoding of the incoming request
     *        (specifying this is necessary for certain misbehaving browsers)
     * @return a DOM representation of the POSTed XML input
     * @throws IOException if the input is invalid
     */
    public static Document parse(HttpServletRequest request, String characterEncoding) 
    throws IOException {
        InputStream in = null;
        try {
            String userAgent = request.getHeader("user-agent");
            if (userAgent != null && userAgent.indexOf("onqueror") != -1) {
                // Invoke XML 'cleaner', but only for  user agents that contain the string "onqueror",
                // such as Konqueror, for example.
                in = cleanXmlInputStream(request.getInputStream(), characterEncoding);
            } else {
                in = request.getInputStream();
            }
            return DomUtil.getDocumentBuilder().parse(in);
        } catch (final SAXException ex) {
            throw new IOException("Provided InputStream cannot be parsed.") {
                public Throwable getCause() {
                    return ex;
                }
            };
        } catch (final IOException ex) {
            throw new IOException("Provided InputStream cannot be parsed.") {
                public Throwable getCause() {
                    return ex;
                }
            };
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } }
        }
    }
}
