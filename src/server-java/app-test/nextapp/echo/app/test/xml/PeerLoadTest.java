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

package nextapp.echo.app.test.xml;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.serial.SerialPeerFactory;
import nextapp.echo.app.serial.property.AlignmentPeer;
import nextapp.echo.app.serial.property.BooleanPeer;
import nextapp.echo.app.serial.property.BorderPeer;
import nextapp.echo.app.serial.property.ColorPeer;
import nextapp.echo.app.serial.property.ExtentPeer;
import nextapp.echo.app.serial.property.FillImagePeer;
import nextapp.echo.app.serial.property.InsetsPeer;
import nextapp.echo.app.serial.property.IntegerPeer;
import nextapp.echo.app.serial.property.StringPeer;
import junit.framework.TestCase;

public class PeerLoadTest extends TestCase {
    
    public void testPeerLoad() {
        SerialPeerFactory factory = SerialPeerFactory.forClassLoader(Thread.currentThread().getContextClassLoader());

        assertTrue(factory.getPeerForProperty(Boolean.class) instanceof BooleanPeer);
        assertTrue(factory.getPeerForProperty(Integer.class) instanceof IntegerPeer);
        assertTrue(factory.getPeerForProperty(String.class) instanceof StringPeer);

        assertTrue(factory.getPeerForProperty(Alignment.class) instanceof AlignmentPeer);
        assertTrue(factory.getPeerForProperty(Border.class) instanceof BorderPeer);
        assertTrue(factory.getPeerForProperty(Color.class) instanceof ColorPeer);
        assertTrue(factory.getPeerForProperty(Extent.class) instanceof ExtentPeer);
        assertTrue(factory.getPeerForProperty(Insets.class) instanceof InsetsPeer);
        assertTrue(factory.getPeerForProperty(FillImage.class) instanceof FillImagePeer);
    }
}
