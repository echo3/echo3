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

package nextapp.echo.app.test;

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ResourceImageReference;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.FillImage</code> property 
 * value object.
 */
public class FillImageTest extends TestCase {

    private static final ResourceImageReference image1 = new ResourceImageReference("image1.png", "image/png", 
            new Extent(50), new Extent(40));
    private static final ResourceImageReference image1Copy = new ResourceImageReference("image1.png", "image/png", 
            new Extent(50), new Extent(40));
    private static final ResourceImageReference image2 = new ResourceImageReference("image2.png", "image/png", 
            new Extent(50), new Extent(40));
    private static final FillImage fillImage1 = new FillImage(image1, new Extent(5), new Extent(3, Extent.PX), 
            FillImage.REPEAT_HORIZONTAL);
    private static final FillImage fillImage1Copy = new FillImage(image1Copy, new Extent(5), new Extent(3, Extent.PX), 
            FillImage.REPEAT_HORIZONTAL);
    private static final FillImage fillImage2 = new FillImage(image2, new Extent(5), new Extent(3, Extent.PX), 
            FillImage.REPEAT_HORIZONTAL);
    
    /**
     * Test equality.
     */
    public void testEquals() {
        assertTrue(fillImage1.equals(fillImage1Copy));
        assertFalse(fillImage1.equals(fillImage2));
        assertFalse(fillImage1.equals(null));
    }
}
