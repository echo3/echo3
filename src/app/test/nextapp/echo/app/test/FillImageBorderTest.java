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

import nextapp.echo.app.Color;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.ResourceImageReference;
import junit.framework.TestCase;

/**
 * Unit test for <code>nextapp.echo.app.FillImageBorder</code> property.
 */
public class FillImageBorderTest extends TestCase {
    
    public void testEquals() {
        assertTrue(new FillImageBorder().equals(new FillImageBorder()));
        assertTrue(new FillImageBorder(Color.RED, new Insets(10), new Insets(20))
                .equals(new FillImageBorder(Color.RED, new Insets(10), new Insets(20))));
        assertFalse(new FillImageBorder(Color.RED, new Insets(10), new Insets(10))
                .equals(new FillImageBorder(Color.RED, new Insets(10), new Insets(20))));

        FillImageBorder fib1 = new FillImageBorder();
        fib1.setFillImage(FillImageBorder.TOP_LEFT, new FillImage(new ResourceImageReference("topleft.gif")));
        fib1.setFillImage(FillImageBorder.TOP, new FillImage(new ResourceImageReference("top.gif")));
        fib1.setFillImage(FillImageBorder.TOP_RIGHT, new FillImage(new ResourceImageReference("topright.gif")));
        fib1.setFillImage(FillImageBorder.LEFT, new FillImage(new ResourceImageReference("left.gif")));
        fib1.setFillImage(FillImageBorder.RIGHT, new FillImage(new ResourceImageReference("right.gif")));
        fib1.setFillImage(FillImageBorder.BOTTOM_LEFT, new FillImage(new ResourceImageReference("bottomleft.gif")));
        fib1.setFillImage(FillImageBorder.BOTTOM, new FillImage(new ResourceImageReference("bottom.gif")));
        fib1.setFillImage(FillImageBorder.BOTTOM_RIGHT, new FillImage(new ResourceImageReference("bottomright.gif")));
        FillImageBorder fib2 = new FillImageBorder();
        fib2.setFillImage(FillImageBorder.TOP_LEFT, new FillImage(new ResourceImageReference("topleft.gif")));
        fib2.setFillImage(FillImageBorder.TOP, new FillImage(new ResourceImageReference("top.gif")));
        fib2.setFillImage(FillImageBorder.TOP_RIGHT, new FillImage(new ResourceImageReference("topright.gif")));
        fib2.setFillImage(FillImageBorder.LEFT, new FillImage(new ResourceImageReference("left.gif")));
        fib2.setFillImage(FillImageBorder.RIGHT, new FillImage(new ResourceImageReference("right.gif")));
        fib2.setFillImage(FillImageBorder.BOTTOM_LEFT, new FillImage(new ResourceImageReference("bottomleft.gif")));
        fib2.setFillImage(FillImageBorder.BOTTOM, new FillImage(new ResourceImageReference("bottom.gif")));
        fib2.setFillImage(FillImageBorder.BOTTOM_RIGHT, new FillImage(new ResourceImageReference("bottomright2.gif")));
        assertFalse(fib1.equals(fib2));

        fib2.setFillImage(FillImageBorder.BOTTOM_RIGHT, new FillImage(new ResourceImageReference("bottomright.gif")));
        assertTrue(fib1.equals(fib2));
        
        fib1.setBorderInsets(new Insets(20));
        assertFalse(fib1.equals(fib2));
        fib2.setBorderInsets(new Insets(20));
        assertTrue(fib1.equals(fib2));
        
        fib1.setContentInsets(new Insets(30));
        assertFalse(fib1.equals(fib2));
        fib2.setContentInsets(new Insets(30));
        assertTrue(fib1.equals(fib2));
        
        fib1.setColor(Color.RED);
        assertFalse(fib1.equals(fib2));
        fib2.setColor(Color.RED);
        assertTrue(fib1.equals(fib2));
    }
}
