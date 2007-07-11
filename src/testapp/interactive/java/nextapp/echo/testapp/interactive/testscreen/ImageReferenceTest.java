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

package nextapp.echo.testapp.interactive.testscreen;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

import javax.swing.ImageIcon;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.AwtImageReference;
import nextapp.echo.app.HttpImageReference;
import nextapp.echo.app.Label;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.StreamImageReference;
import nextapp.echo.testapp.interactive.Styles;
import nextapp.echo.testapp.interactive.TestGrid;

/**
 * An interactive test for <code>ImageReference</code>s.
 */
public class ImageReferenceTest extends TestGrid {
    
    private static final String RESOURCE_IMAGE_LOCATION = Styles.IMAGE_PATH + "Two.jpg";
    
    private static final int BUFFER_SIZE = 4096;
    
    // Static for memory conservation w/ live demos.
    private static final AwtImageReference AWT_IMAGE_REFERENCE;
    static {
        URL resourceUrl = ImageReferenceTest.class.getResource(RESOURCE_IMAGE_LOCATION);
        ImageIcon imageIcon = new ImageIcon(resourceUrl);
        BufferedImage image = new BufferedImage(85, 100, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = (Graphics2D) image.getGraphics();
        graphics.drawImage(imageIcon.getImage(), 0, 0, null);
        graphics.setColor(java.awt.Color.BLUE);
        graphics.drawString("Java2D", 5, 40);
        AWT_IMAGE_REFERENCE = new AwtImageReference(image);
    }
    
    private StreamImageReference streamImageReference = new StreamImageReference() {

        private String id = ApplicationInstance.generateSystemId();
        
        /**
         * @see nextapp.echo.app.StreamImageReference#getContentType()
         */
        public String getContentType() {
            return "image/jpeg";
        }
        
        /**
         * @see nextapp.echo.app.RenderIdSupport#getRenderId()
         */
        public String getRenderId() {
            return id;
        }

        /**
         * @see nextapp.echo.app.StreamImageReference#render(java.io.OutputStream)
         */
        public void render(OutputStream out) throws IOException {
            InputStream in = null;
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead = 0;
            
            try {
                in = ImageReferenceTest.class.getResourceAsStream(RESOURCE_IMAGE_LOCATION);
                do {
                    bytesRead = in.read(buffer);
                    if (bytesRead > 0) {
                        out.write(buffer, 0, bytesRead);
                    }
                } while (bytesRead > 0);
            } finally {
                if (in != null) { try { in.close(); } catch (IOException ex) { } } 
            }
        }
    };
    
    public ImageReferenceTest() {
        addHeaderRow("ImageReference Types");
        HttpImageReference httpImageReference = new HttpImageReference("images/two.jpg");
        ResourceImageReference resourceImageReference 
                = new ResourceImageReference(RESOURCE_IMAGE_LOCATION);
        addTestRow("AwtImageReference", new Label(AWT_IMAGE_REFERENCE));
        addTestRow("HttpImageReference", new Label(httpImageReference));
        addTestRow("ResourceImageReference", new Label(resourceImageReference));
        addTestRow("StreamImageReference", new Label(streamImageReference));
    }
}
