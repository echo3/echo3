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
        } catch (SAXException ex) {
            throw new IOException("Provided InputStream cannot be parsed: " + ex);
        } catch (IOException ex) {
            throw new IOException("Provided InputStream cannot be parsed: " + ex);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } }
        }
    }

}
