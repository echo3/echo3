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

import java.awt.Graphics;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.awt.image.DataBuffer;
import java.awt.image.IndexColorModel;
import java.awt.image.PixelGrabber;
import java.awt.image.Raster;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.zip.CheckedOutputStream;
import java.util.zip.Checksum;
import java.util.zip.CRC32;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;

import javax.swing.ImageIcon;

/**
 * Encodes a java.awt.Image into PNG format.
 * For more information on the PNG specification, see the W3C PNG page at 
 * <a href="http://www.w3.org/TR/REC-png.html">http://www.w3.org/TR/REC-png.html</a>.
 */
public class PngEncoder {

    /**
     * Utility class for converting <code>Image</code>s to <code>BufferedImage</code>s.
     */
    private static class ImageToBufferedImage {
    
        /**
         * Converts an <code>Image</code> to a <code>BufferedImage</code>.
         * If the image is already a <code>BufferedImage</code>, the original is returned.
         * 
         * @param image the image to convert
         * @return the image as a <code>BufferedImage</code>
         */
        static BufferedImage toBufferedImage(Image image) {
            if (image instanceof BufferedImage) {
                // Return image unchanged if it is already a BufferedImage.
                return (BufferedImage) image;
            }
            
            // Ensure image is loaded.
            image = new ImageIcon(image).getImage();        
            
            int type = hasAlpha(image) ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB;
            BufferedImage bufferedImage = new BufferedImage(image.getWidth(null), image.getHeight(null), type);
            Graphics g = bufferedImage.createGraphics();
            g.drawImage(image, 0, 0, null);
            g.dispose();
            
            return bufferedImage;
        }
        
        /**
         * Determines if an image has an alpha channel.
         * 
         * @param image the <code>Image</code>
         * @return true if the image has an alpha channel
         */
        static boolean hasAlpha(Image image) {
            PixelGrabber pg = new PixelGrabber(image, 0, 0, 1, 1, false);
            try {
                pg.grabPixels();
            } catch (InterruptedException ex) { }
            return pg.getColorModel().hasAlpha();
        }
    }

    /** <code>SubFilter</code> singleton. */
    public static final Filter SUB_FILTER = new SubFilter();
    
    /** <code>UpFilter</code> singleton. */
    public static final Filter UP_FILTER = new UpFilter();
    
    /** <code>AverageFilter</code> singleton. */
    public static final Filter AVERAGE_FILTER = new AverageFilter();

    /** <code>PaethFilter</code> singleton. */
    public static final Filter PAETH_FILTER = new PaethFilter();
    
    /** PNG signature bytes. */
    private static final byte[] SIGNATURE = { (byte)0x89, (byte)0x50, (byte)0x4e, (byte)0x47, 
                                              (byte)0x0d, (byte)0x0a, (byte)0x1a, (byte)0x0a };
    
    /** Image header (IHDR) chunk header. */
    private static final byte[] IHDR = { (byte) 'I', (byte) 'H', (byte) 'D', (byte) 'R' };
    
    /** Palate (PLTE) chunk header. */
    private static final byte[] PLTE = { (byte) 'P', (byte) 'L', (byte) 'T', (byte) 'E' };
    
    /** Image Data (IDAT) chunk header. */
    private static final byte[] IDAT = { (byte) 'I', (byte) 'D', (byte) 'A', (byte) 'T' };
    
    /** End-of-file (IEND) chunk header. */
    private static final byte[] IEND = { (byte) 'I', (byte) 'E', (byte) 'N', (byte) 'D' };
    
    /** Sub filter type constant. */
    private static final int SUB_FILTER_TYPE = 1;

    /** Up filter type constant. */
    private static final int UP_FILTER_TYPE = 2;
    
    /** Average filter type constant. */
    private static final int AVERAGE_FILTER_TYPE = 3;

    /** Paeth filter type constant. */
    private static final int PAETH_FILTER_TYPE = 4;

    /** Image bit depth. */
    private static final byte BIT_DEPTH = (byte) 8;

    /** Indexed color type rendered value. */
    private static final byte COLOR_TYPE_INDEXED  = (byte) 3;
    
    /** RGB color type rendered value. */
    private static final byte COLOR_TYPE_RGB      = (byte) 2;
    
    /** RGBA color type rendered value. */
    private static final byte COLOR_TYPE_RGBA     = (byte) 6;

    /** Integer-to-integer map used for RGBA/ARGB conversion. */
    private static final int[] INT_TRANSLATOR_CHANNEL_MAP = new int[]{2, 1, 0, 3};
    
    /**
     * Writes an 32-bit integer value to the output stream.
     *
     * @param out the stream
     * @param i the value
     */
    private static void writeInt(OutputStream out, int i) 
    throws IOException {
        out.write(new byte[]{(byte) (i >> 24), 
                             (byte) ((i >> 16) & 0xff), 
                             (byte) ((i >> 8) & 0xff), 
                             (byte) (i & 0xff)});
    }

    /**
     * An interface for PNG filters.  Filters are used to modify the method in 
     * which pixels of the image are stored in ways that will achieve better
     * compression.
     */ 
    public interface Filter {
    
        /** 
         * Filters the data in a given row of the image.
         *
         * @param currentRow a byte array containing the data of the row of the
         *        image to be filtered
         * @param previousRow a byte array containing the data of the previous 
         *        row of the image to be filtered
         * @param filterOutput a byte array into which the filtered data will
         *        be placed
         */
        public void filter(byte[] filterOutput, byte[] currentRow, byte[] previousRow, int outputBpp);
        
        /**
         * Returns the PNG type code for the filter.
         */
        public int getType();
    }
    
    /**
     * An implementation of a "Sub" filter.
     */
    private static class SubFilter
    implements Filter {
    
        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#filter(byte[], byte[], byte[], int)
         */
        public void filter(byte[] filterOutput, byte[] currentRow, byte[] previousRow, int outputBpp) {
            for (int index = 0; index < filterOutput.length; ++index) {
                if (index < outputBpp) {
                    filterOutput[index] = currentRow[index];
                } else {
                    filterOutput[index] = (byte) (currentRow[index] - currentRow[index - outputBpp]);
                }
            }
        }

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#getType()
         */
        public int getType() {
            return SUB_FILTER_TYPE;
        }
    }
        
    /**
     * An implementation of an "Up" filter.
     */
    private static class UpFilter
    implements Filter {

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#filter(byte[], byte[], byte[], int)
         */
        public void filter(byte[] filterOutput, byte[] currentRow, byte[] previousRow, int outputBpp) {
            for (int index = 0; index < currentRow.length; ++index) {
                filterOutput[index] = (byte) (currentRow[index] - previousRow[index]);
            }
        }

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#getType()
         */
        public int getType() {
            return UP_FILTER_TYPE;
        }
    }
    
    /**
     * An implementation of an "Average" filter.
     */
    private static class AverageFilter
    implements Filter {
        
        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#filter(byte[], byte[], byte[], int)
         */
        public void filter(byte[] filterOutput, byte[] currentRow, byte[] previousRow, int outputBpp) {
            int w, n;
            
            for (int index = 0; index < filterOutput.length; ++index) {
                n = (previousRow[index] + 0x100) & 0xff;
                if (index < outputBpp) {
                    w = 0;
                } else {
                    w = (currentRow[index - outputBpp] + 0x100) & 0xff;
                }
                filterOutput[index] = (byte) (currentRow[index] - (byte) ((w + n) / 2));
            }
        }

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#getType()
         */
        public int getType() {
            return AVERAGE_FILTER_TYPE;
        }
    }

    /**
     * An implementation of a "Paeth" filter.
     */
    private static class PaethFilter
    implements Filter {
    
        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#filter(byte[], byte[], byte[], int)
         */
        public void filter(byte[] filterOutput, byte[] currentRow, byte[] previousRow, int outputBpp) {
            byte pv;
            int  n, w, nw, p, pn, pw, pnw;
            
            for (int index = 0; index < filterOutput.length; ++index) {
                n = (previousRow[index] + 0x100) & 0xff;
                if (index < outputBpp) {
                    w = 0;
                    nw = 0;
                } else {
                    w = (currentRow[index - outputBpp] + 0x100) & 0xff;
                    nw = (previousRow[index - outputBpp] + 0x100) & 0xff;
                }
                
                p = w + n - nw;
                pw = Math.abs(p - w);
                pn = Math.abs(p - n);
                pnw = Math.abs(p - w);
                if (pw <= pn && pw <= pnw) {
                    pv = (byte) w;
                } else if (pn <= pnw) {
                    pv = (byte) n;
                } else {
                    pv = (byte) nw;
                }
                
                filterOutput[index] = (byte) (currentRow[index] - pv);
            }
        }

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Filter#getType()
         */
        public int getType() {
            return PAETH_FILTER_TYPE;
        }
    }
    
    /**
     * An interface for translators, which translate pixel data from a 
     * writable raster into an R/G/B/A ordering required by the PNG
     * specification.  Pixel data in the raster might be available
     * in three bytes per pixel, four bytes per pixel, or as integers.
     */
    interface Translator {
    
        /**
         * Translates a row of the image into a byte array ordered
         * properly for a PNG image.
         *
         * @param outputPixelQueue the byte array in which to store the
         *        translated pixels
         * @param row the row index of the image to translate
         */
        public void translate(byte[] outputPixelQueue, int row);
    }
    
    /**
     * Translates byte-based rasters.
     */
    private class ByteTranslator 
    implements Translator {
    
        int rowWidth = width * outputBpp;                         // size of image data in a row in bytes.
        byte[] inputPixelQueue = new byte[rowWidth + outputBpp];
        int column;
        int channel;

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Translator#translate(byte[], int)
         */
        public void translate(byte[] outputPixelQueue, int row) {
            raster.getDataElements(0, row, width, 1, inputPixelQueue);
            for (column = 0; column < width; ++column) {
                for (channel = 0; channel < outputBpp; ++channel) {
                    outputPixelQueue[column * outputBpp + channel]
                            = inputPixelQueue[column * inputBpp + channel];
                }
            }
        }
    }
    
    /**
     * Translates integer-based rasters.
     */
    private class IntTranslator
    implements Translator  {
    
        int[] inputPixelQueue = new int[width];
        int column;
        int channel;

        /**
         * @see nextapp.echo.webcontainer.util.PngEncoder.Translator#translate(byte[], int)
         */
        public void translate(byte[] outputPixelQueue, int row) {
        
            image.getRGB(0, row, width, 1, inputPixelQueue, 0, width);

            // Line below (commented out) replaces line above, almost halving time to encode, but doesn't work with certain pixel 
            // arrangements.  Need to find method of determining pixel order (BGR vs RGB, ARGB, etc)
            //
            // raster.getDataElements(0, row, width, 1, inputPixelQueue);

            for (column = 0; column < width; ++column) {
                for (channel = 0; channel < outputBpp; ++channel) {
                    outputPixelQueue[column * outputBpp + channel]
                            = (byte) (inputPixelQueue[column] >> (INT_TRANSLATOR_CHANNEL_MAP[channel] * 8));
                }
            }
        }
    }
    
    /** The image being encoded. */
    private BufferedImage image;
    
    /** The PNG encoding filter to be used. */
    private Filter filter;
    
    /** The the deflater compression level. */
    private int compressionLevel;
    
    /** The pixel width of the image. */
    private int width;
    
    /** The pixel height of the image. */
    private int height;
    
    /** The image <code>Raster</code> transfer type. */
    private int transferType;
    
    /** The image <code>Raster</code> data. */
    private Raster raster;
    
    /** The source image bits-per-pixel. */
    private int inputBpp;
    
    /** The encoded image bits-per-pixel. */
    private int outputBpp;
    
    /** The <code>Translator</code> being used for encoding. */
    private Translator translator;
    
    /**
     * Creates a PNG encoder for an image.
     *
     * @param image the image to be encoded
     * @param encodeAlpha true if the image's alpha channel should be encoded
     * @param filter The filter to be applied to the image data, one of the 
     *        following values:
     *        <ul>
     *        <li>SUB_FILTER</li>
     *        <li>UP_FILTER</li>
     *        <li>AVERAGE_FILTER</li>
     *        <li>PAETH_FILTER</li>
     *        </ul>
     *        If a null value is specified, no filtering will be performed.
     * @param compressionLevel the deflater compression level that will be used
     *        for compressing the image data:  Valid values range from 0 to 9.
     *        Higher values result in smaller files and therefore decrease
     *        network traffic, but require more CPU time to encode.  The normal
     *        compromise value is 3.
     */
    public PngEncoder(Image image, boolean encodeAlpha, Filter filter, int compressionLevel) {
        super();
        
        this.image = ImageToBufferedImage.toBufferedImage(image);
        this.filter = filter;
        this.compressionLevel = compressionLevel;
        
        width = this.image.getWidth(null);
        height = this.image.getHeight(null);
        raster = this.image.getRaster();
        transferType = raster.getTransferType();

        // Establish storage information
        int dataBytes = raster.getNumDataElements();
        if (transferType == DataBuffer.TYPE_BYTE && dataBytes == 4) {
            outputBpp = encodeAlpha ? 4 : 3;
            inputBpp = 4;
            translator = new ByteTranslator();
        } else if (transferType == DataBuffer.TYPE_BYTE && dataBytes == 3) {
            outputBpp = 3;
            inputBpp = 3;
            encodeAlpha = false;
            translator = new ByteTranslator();
        } else if (transferType == DataBuffer.TYPE_INT && dataBytes == 1) {
            outputBpp = encodeAlpha ? 4 : 3;
            inputBpp = 4;
            translator = new IntTranslator();
        } else if (transferType == DataBuffer.TYPE_BYTE && dataBytes == 1) {
            throw new UnsupportedOperationException("Encoding indexed-color images not yet supported.");
        } else {
            throw new IllegalArgumentException(
                    "Cannot determine appropriate bits-per-pixel for provided image.");
        }
    }
    
    /**
     * Encodes the image.
     *
     * @param out an OutputStream to which the encoded image will be
     *            written
     * @throws IOException if a problem is encountered writing the output
     */
    public synchronized void encode(OutputStream out) 
    throws IOException {
        Checksum csum = new CRC32();
        out = new CheckedOutputStream(out, csum);
    
        out.write(SIGNATURE);

        writeIhdrChunk(out, csum);

        if (outputBpp == 1) {
            writePlteChunk(out, csum);
        }
        
        writeIdatChunks(out, csum);
        
        writeIendChunk(out, csum);
    }
    
    /**
     * Writes the IDAT (Image data) chunks to the output stream.
     *
     * @param out the OutputStream to write the chunk to
     * @param csum the Checksum that is updated as data is written
     *             to the passed-in OutputStream
     * @throws IOException if a problem is encountered writing the output
     */
    private void writeIdatChunks(OutputStream out, Checksum csum)
    throws IOException {
        int rowWidth = width * outputBpp;                         // size of image data in a row in bytes.

        int row = 0;
                
        Deflater deflater = new Deflater(compressionLevel);
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        DeflaterOutputStream defOut = new DeflaterOutputStream(byteOut, deflater);

        byte[] filteredPixelQueue = new byte[rowWidth];

        // Output Pixel Queues
        byte[][] outputPixelQueue = new byte[2][rowWidth];
        Arrays.fill(outputPixelQueue[1], (byte) 0);
        int outputPixelQueueRow = 0;
        int outputPixelQueuePrevRow = 1;

        while (row < height) {
            if (filter == null) {
                defOut.write(0);
                translator.translate(outputPixelQueue[outputPixelQueueRow], row);
                defOut.write(outputPixelQueue[outputPixelQueueRow], 0, rowWidth);
            } else {
                defOut.write(filter.getType());
                translator.translate(outputPixelQueue[outputPixelQueueRow], row);
                filter.filter(filteredPixelQueue, outputPixelQueue[outputPixelQueueRow], 
                        outputPixelQueue[outputPixelQueuePrevRow], outputBpp);
                defOut.write(filteredPixelQueue, 0, rowWidth);
            }
            
            ++row;
            outputPixelQueueRow = row & 1;
            outputPixelQueuePrevRow = outputPixelQueueRow ^ 1;
        }
        defOut.finish();
        byteOut.close();
        
        writeInt(out, byteOut.size());
        csum.reset();
        out.write(IDAT);
        byteOut.writeTo(out);
        writeInt(out, (int) csum.getValue());
    }
    
    /**
     * Writes the IEND (End-of-file) chunk to the output stream.
     *
     * @param out the OutputStream to write the chunk to
     * @param csum the Checksum that is updated as data is written
     *             to the passed-in OutputStream
     * @throws IOException if a problem is encountered writing the output
     */
    private void writeIendChunk(OutputStream out, Checksum csum)
    throws IOException {
        writeInt(out, 0);
        csum.reset();
        out.write(IEND);
        writeInt(out, (int) csum.getValue());
    }
    
    /**
     * writes the IHDR (Image Header) chunk to the output stream
     *
     * @param out the OutputStream to write the chunk to
     * @param csum the Checksum that is updated as data is written
     *             to the passed-in OutputStream
     * @throws IOException if a problem is encountered writing the output
     */ 
    private void writeIhdrChunk(OutputStream out, Checksum csum) 
    throws IOException {
        writeInt(out, 13); // Chunk Size
        csum.reset();
        out.write(IHDR);
        writeInt(out, width);
        writeInt(out, height);
        out.write(BIT_DEPTH);
        switch (outputBpp) {
        case 1:
            out.write(COLOR_TYPE_INDEXED);
            break;
        case 3:
            out.write(COLOR_TYPE_RGB);
            break;
        case 4:
            out.write(COLOR_TYPE_RGBA);
            break;
        default:
            throw new IllegalStateException("Invalid bytes per pixel");
        }
        out.write(0); // Compression Method
        out.write(0); // Filter Method
        out.write(0); // Interlace
        writeInt(out, (int) csum.getValue());
    }
    
    /**
     * Writes the PLTE (Palate) chunk to the output stream.
     *
     * @param out the OutputStream to write the chunk to
     * @param csum the Checksum that is updated as data is written
     *             to the passed-in OutputStream
     * @throws IOException if a problem is encountered writing the output
     */
    private void writePlteChunk(OutputStream out, Checksum csum) 
    throws IOException {
        IndexColorModel icm = (IndexColorModel) image.getColorModel();
        
        writeInt(out, 768); // Chunk Size
        csum.reset();
        out.write(PLTE);
        
        byte[] reds = new byte[256];
        icm.getReds(reds);
        
        byte[] greens = new byte[256];
        icm.getGreens(greens);
        
        byte[] blues = new byte[256];
        icm.getBlues(blues);
        
        for (int index = 0; index < 256; ++index) {
            out.write(reds[index]);
            out.write(greens[index]);
            out.write(blues[index]);
        }
                
        writeInt(out, (int) csum.getValue());
    }
}
