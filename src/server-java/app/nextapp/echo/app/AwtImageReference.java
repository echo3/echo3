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

package nextapp.echo.app;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.ColorModel;
import java.awt.image.ImageObserver;
import java.awt.image.MemoryImageSource;
import java.awt.image.PixelGrabber;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

/**
 * An ImageReference describing an image which may be rendered from a <code>java.awt.Image</code>. Note that the JVM running the
 * Echo Application Container will require access to a graphics context for the Java AWT to function.
 * <p>
 * <strong>WARNING:</strong> Use of this class is <strong>STRONGLY DISCOURAGED</strong> unless you specifically need to dynamically
 * render or modify image content. Rendering AWT images requires that the image be brought into memory as a bitmap and then
 * rendered to a client-compatible format (e.g., PNG). DO NOT use this class unless you absolutely must.
 * <p>
 * The preferred means of serving images is by using <code>ResourceImageReference</code>s or <code>HttpImageReference</code>s.
 * 
 * @see ResourceImageReference
 * @see HttpImageReference
 */
public class AwtImageReference 
implements ImageReference {

    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    private transient Image image;
    private String id;
    
    /**
     * Default constructor for use only when a class is derived from 
     * <code>AwtImageReference</code> and the 
     * <code>getImage()</code> method is overridden.
     */
    public AwtImageReference() {
        this(null);
    }
    
    /**
     * Creates an <code>AwtImageReference</code> to the specified 
     * <code>java.awt.Image</code>.
     * Note that changes to the underlying image will not necessarily be 
     * reflected on the client unless the image-containing property of the 
     * target component is update.
     *
     * @param image the <code>java.awt.Image </code>to be displayed.
     */
    public AwtImageReference(Image image) {
        super();
        this.image = image;
        id = ApplicationInstance.generateSystemId();
    }
    
    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object o) {
        if (!(o instanceof AwtImageReference)) {
            return false;
        }
        AwtImageReference that = (AwtImageReference) o;
        if (!(this.image == that.image || (this.image != null && this.image.equals(that.image)))) {
            return false;
        }
        return true;
    }

    /**
     * @see nextapp.echo.app.ImageReference#getHeight()
     */
    public Extent getHeight() {
        if (image == null) {
            return null;
        }
        int height = image.getHeight(null);
        if (height > 0) {
            return new Extent(height, Extent.PX);
        } else {
            return null;
        }
    }
    
    /**
     * @see nextapp.echo.app.RenderIdSupport#getRenderId()
     */
    public String getRenderId() {
        return id;
    }

    /**
     * Retrieves the image.  Calls to this method will be minimized such that
     * applications may extend this class and override this method such that
     * images are created only when they are needed, thereby reducing memory
     * usage at the cost of increased processor workload.
     * You should also override the <code>getWidth()</code> and 
     * <code>getHeight()</code> methods.
     */
    public Image getImage() {
        return image;
    }
    
    /**
     * @see nextapp.echo.app.ImageReference#getWidth()
     */
    public Extent getWidth() {
        if (image == null) {
            return null;
        }
        int width = image.getWidth(null);
        if (width > 0) {
            return new Extent(width, Extent.PX);
        } else {
            return null;
        }
    }

    /**
     * @see java.io.Serializable
     */
    private void readObject(ObjectInputStream in)
    throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        
        int width = in.readInt();
        int height = in.readInt();
        int[] pixels = (int[]) in.readObject();
        
        if (pixels != null) {
            Toolkit toolkit = Toolkit.getDefaultToolkit();
            ColorModel colorModel = ColorModel.getRGBdefault();
            image = toolkit.createImage(new MemoryImageSource(width, height, colorModel, pixels, 0, width));
        }
    }

    /**
     * @see java.io.Serializable
     */
    private void writeObject(ObjectOutputStream out) 
    throws IOException {
        out.defaultWriteObject();
        
        int width = image.getWidth(null);
        int height = image.getHeight(null);
        
        out.writeInt(width);
        out.writeInt(height);
        
        if (image == null) {
            out.writeObject(null);
        } else {
            int[] pixels = new int[width * height];
            try {
                PixelGrabber pg = new PixelGrabber(image, 0, 0, width, height, pixels, 0, width);
                pg.grabPixels();
                if ((pg.getStatus() & ImageObserver.ABORT) != 0) {
                    throw new IOException("Unable to serialize java.awt.image: PixelGrabber aborted.");
                }
            } catch (InterruptedException ex) {
                throw new IOException("Unable to serialize java.awt.Image: PixelGrabber interrupted.");
            }
            out.writeObject(pixels);
        }
    }
}
