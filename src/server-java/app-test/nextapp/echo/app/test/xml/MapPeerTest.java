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

package nextapp.echo.app.test.xml;

import java.io.InputStream;
import java.util.Map;

import junit.framework.TestCase;

import nextapp.echo.app.Component;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.serial.StyleSheetLoader;

/**
 * Unit test(s) for <code>nextapp.echo.app.serial.property.NumberPeer</code>.
 */
public class MapPeerTest extends TestCase {

    public static class MapComponent extends Component {
        
        public static final String PROPERTY_MAP = "map";
        
        public Map getMap() {
            return (Map) get(PROPERTY_MAP);
        }
        
        public void setMap(Map newValue) {
            set(PROPERTY_MAP, newValue);
        }
    }
    
    private StyleSheet styleSheet;
    
    /**
     * @see junit.framework.TestCase#setUp()
     */
    public void setUp()
    throws Exception {
        InputStream in = MapPeerTest.class.getClassLoader().getResourceAsStream(
                "nextapp/echo/app/test/xml/MapPeerTest.stylesheet.xml");
        styleSheet = StyleSheetLoader.load(in, StyleSheetLoaderTest.class.getClassLoader());
        in.close();
    }
    
    public void testZero() {
        Style style = styleSheet.getStyle("zero", MapComponent.class, true);
        assertNotNull(style);
        Map m = (Map) style.get(MapComponent.PROPERTY_MAP);
        assertNotNull(m);
        assertEquals(3, m.size());
        assertEquals("bravo", m.get("alpha"));
        assertEquals("delta", m.get("charlie"));
        assertEquals(new Integer(5), m.get("delta"));
    }
    
    public void testEmpty() {
        Style style = styleSheet.getStyle("empty", MapComponent.class, true);
        assertNotNull(style);
        Map m = (Map) style.get(MapComponent.PROPERTY_MAP);
        assertNotNull(m);
        assertEquals(0, m.size());
    }
}
