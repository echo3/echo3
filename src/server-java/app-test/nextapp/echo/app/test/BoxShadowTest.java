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

package nextapp.echo.app.test;

import junit.framework.TestCase;
import nextapp.echo.app.BoxShadow;
import nextapp.echo.app.BoxShadow.BoxStyle;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Label;
import nextapp.echo.app.WindowPane;

/**
 * Unit test(s) for the <code>nextapp.echo.app.BoxShadow</code> feature.
 */
public class BoxShadowTest extends TestCase {

	/**
	 * Test receiving input from client.
	 */
	public void testInput() {
		WindowPane windowPane = new WindowPane();
		windowPane.add(new Label("a label"));
		windowPane.setPositionX(TestConstants.EXTENT_100_PX);
		windowPane.setPositionY(TestConstants.EXTENT_100_PX);
		BoxShadow boxShadow = new BoxShadow(new Extent(10), new Extent(11), new Extent(12), new Extent(13), Color.BLUE, BoxStyle.INSET);
		windowPane.setBoxShadow(boxShadow);
		assertEquals(10, windowPane.getBoxShadow().getHorizontalShadowPosition().getValue());
		assertEquals(11, windowPane.getBoxShadow().getVerticalShadowPosition().getValue());
		assertEquals(12, windowPane.getBoxShadow().getBlurDistance().getValue());
		assertEquals(13, windowPane.getBoxShadow().getSpreadSize().getValue());
		assertEquals(BoxStyle.INSET, windowPane.getBoxShadow().getStyle());
	}
}
