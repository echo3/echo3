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

//import java.util.Locale;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.layout.GridLayoutData;
import junit.framework.TestCase;

/**
 * Unit test(s) for the <code>nextapp.echo.app.Component</code> object. 
 */
public class ComponentTest extends TestCase {
    
    /**
     * Test <code>background</code> property.
     */
    public void testBackground() {
        NullComponent c = new NullComponent();
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        c.setBackground(new Color(0x12, 0x34, 0x56));
        assertEquals(new Color(0x12, 0x34, 0x56), c.getBackground());
        assertEquals(Component.PROPERTY_BACKGROUND, pce.lastEvent.getPropertyName());
    }
    
    /**
     * Test <code>enabled</code> property.
     */
    public void testEnabled() {
        NullComponent c = new NullComponent();
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        assertTrue(c.isEnabled());
        c.setEnabled(false);
        assertFalse(c.isEnabled());
        assertEquals(Component.ENABLED_CHANGED_PROPERTY, pce.lastEvent.getPropertyName());
        c.setEnabled(false);
        assertFalse(c.isEnabled());
        c.setEnabled(true);
        assertTrue(c.isEnabled());
        c.setEnabled(true);
        assertTrue(c.isEnabled());
    }
    
    /**
     * Test <code>font</code> property. 
     */
    public void testFont() {
        NullComponent c = new NullComponent();
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        c.setFont(new Font(Font.COURIER, Font.BOLD, new Extent(12, Extent.PT)));
        assertEquals(new Font(Font.COURIER, Font.BOLD, new Extent(12, Extent.PT)), c.getFont());
        assertEquals(Component.PROPERTY_FONT, pce.lastEvent.getPropertyName());
    }

    /**
     * Test <code>foreground</code> property.
     */
    public void testForeground() {
        NullComponent c = new NullComponent();
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        c.setForeground(new Color(0x12, 0x34, 0x56));
        assertEquals(new Color(0x12, 0x34, 0x56), c.getForeground());
        assertEquals(Component.PROPERTY_FOREGROUND, pce.lastEvent.getPropertyName());
    }

    /**
     * Test adding multiple child components and retrieving one at a specific
     * index via <code>getComponent()</code>.
     */
    public void testGetComponent() {
        NullComponent c = new NullComponent();
        for (int i = 0; i < 5; ++ i) {
            c.add(new NullComponent());
        }
        NullComponent sixthComponent = new NullComponent();
        c.add(sixthComponent);
        for (int i = 0; i < 5; ++ i) {
            c.add(new NullComponent());
        }
        assertTrue(sixthComponent == c.getComponent(5));
    }

    /**
     * Tests <code>getComponent(String)</code>,
     * and <code>getId()</code>/<code>setId()</code> methods.
     */
    public void testGetComponentById() {
        NullComponent c1 = new NullComponent();
        c1.setId("c1");
        NullComponent c2 = new NullComponent();
        c2.setId("c2");
        c1.add(c2);
        NullComponent c3 = new NullComponent();
        c3.setId("c3");
        c1.add(c3);
        NullComponent c4 = new NullComponent();
        c4.setId("c4");
        c2.add(c4);
        NullComponent c5 = new NullComponent();
        c5.setId("c5");
        c2.add(c5);
        NullComponent c6 = new NullComponent();
        c6.setId("c6");
        c5.add(c6);
        
        assertEquals("c1", c1.getId());
        assertEquals("c2", c2.getId());
        assertEquals("c3", c3.getId());
        assertEquals("c4", c4.getId());
        assertEquals("c5", c5.getId());
        assertEquals("c6", c6.getId());

        assertEquals(c1, c1.getComponent("c1"));
        assertEquals(c2, c1.getComponent("c2"));
        assertEquals(c3, c1.getComponent("c3"));
        assertEquals(c4, c1.getComponent("c4"));
        assertEquals(c5, c1.getComponent("c5"));
        assertEquals(c6, c1.getComponent("c6"));
        
        assertEquals(null, c2.getComponent("c1"));
        assertEquals(c2, c2.getComponent("c2"));
        assertEquals(null, c2.getComponent("c3"));
        assertEquals(c4, c2.getComponent("c4"));
        assertEquals(c5, c2.getComponent("c5"));
        assertEquals(c6, c2.getComponent("c6"));
        
        assertEquals(null, c3.getComponent("c1"));
        assertEquals(null, c3.getComponent("c2"));
        assertEquals(c3, c3.getComponent("c3"));
        assertEquals(null, c3.getComponent("c4"));
        assertEquals(null, c3.getComponent("c5"));
        assertEquals(null, c3.getComponent("c6"));
    }

    /**
     * Test <code>getComponentCount()</code>.
     */
    public void testGetComponentCount() {
        NullComponent c = new NullComponent();
        for (int i = 0; i < 5; ++ i) {
            c.add(new NullComponent());
        }
        assertEquals(5, c.getComponentCount());
    }

    /**
     * Test <code>getComponents()</code>.
     */
    public void testGetComponents() {
        NullComponent parent = new NullComponent();
        NullComponent child1 = new NullComponent();
        NullComponent child2 = new NullComponent();
        parent.add(child1);
        parent.add(child2);
        Component[] children = parent.getComponents();
        assertSame(child1, children[0]);
        assertSame(child2, children[1]);
    }

    /**
     * Test <code>getVisibleComponent()</code>.
     */
    public void testGetVisibleComponent() {
        IndexOutOfBoundsException exception;
        NullComponent parent = new NullComponent();
        NullComponent child1 = new NullComponent();
        NullComponent child2 = new NullComponent();
        parent.add(child1);
        parent.add(child2);
        
        assertSame(child1, parent.getVisibleComponent(0));
        assertSame(child2, parent.getVisibleComponent(1));
        exception = null;
        try {
            parent.getVisibleComponent(2);
        } catch (IndexOutOfBoundsException ex) {
            exception = ex;
        }
        assertNotNull(exception);

        child1.setVisible(false);
        assertSame(child2, parent.getVisibleComponent(0));
        exception = null;
        try {
            parent.getVisibleComponent(1);
        } catch (IndexOutOfBoundsException ex) {
            exception = ex;
        }
        assertNotNull(exception);
        
        child2.setVisible(false);
        exception = null;
        try {
            parent.getVisibleComponent(0);
        } catch (IndexOutOfBoundsException ex) {
            exception = ex;
        }
        assertNotNull(exception);

        child1.setVisible(true);
        assertSame(child1, parent.getVisibleComponent(0));
        exception = null;
        try {
            parent.getVisibleComponent(1);
        } catch (IndexOutOfBoundsException ex) {
            exception = ex;
        }
        assertNotNull(exception);
    }

    /**
     * Test <code>getVisibleComponent()</code>.
     */
    public void testGetVisibleComponent2() {
        NullComponent c = new NullComponent();
        Exception exception = null;
        try {
            c.getVisibleComponent(0);
        } catch (IndexOutOfBoundsException ex) {
            exception = ex;
        }
        assertNotNull(exception);
    }
    
    /**
     * Test <code>getVisibleComponentCount()</code>.
     */
    public void testGetVisibleComponentCount() {
        NullComponent c = new NullComponent();
        for (int i = 0; i < 5; ++ i) {
            c.add(new NullComponent());
        }
        assertEquals(5, c.getVisibleComponentCount());
        c.getComponent(1).setVisible(false);
        assertEquals(4, c.getVisibleComponentCount());
        c.getComponent(2).setVisible(false);
        assertEquals(3, c.getVisibleComponentCount());
    }
    
    /**
     * Test <code>getVisibleComponents()</code>.
     */
    public void testGetVisibleComponents() {
        NullComponent parent = new NullComponent();
        NullComponent child1 = new NullComponent();
        NullComponent child2 = new NullComponent();
        parent.add(child1);
        parent.add(child2);
        Component[] children = parent.getVisibleComponents();
        assertEquals(2, children.length);
        assertSame(child1, children[0]);
        assertSame(child2, children[1]);

        child1.setVisible(false);
        children = parent.getVisibleComponents();
        assertEquals(1, children.length);
        assertSame(child2, children[0]);
        
        child2.setVisible(false);
        children = parent.getVisibleComponents();
        assertEquals(0, children.length);

        child1.setVisible(true);
        children = parent.getVisibleComponents();
        assertEquals(1, children.length);
        assertSame(child1, children[0]);
    }
    
    /**
     * Test <code>indexOf()</code> method.
     */
    public void testIndexOf() {
        NullComponent parent = new NullComponent();
        NullComponent a = new NullComponent();
        NullComponent b = new NullComponent();
        NullComponent c = new NullComponent();
        NullComponent d = new NullComponent();
        parent.add(a);
        parent.add(b);
        parent.add(c);
        assertEquals(0, parent.indexOf(a));
        assertEquals(1, parent.indexOf(b));
        assertEquals(2, parent.indexOf(c));
        assertEquals(-1, parent.indexOf(d));
    }
    
    /**
     * Tests invocation of the <code>init()</code>/<code>dispose</code>
     * life-cycle methods with a single <code>Component</code>.
     */
    public void testLifecycleSingleComponent() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        
        LifecycleTestComponent ltc1 = new LifecycleTestComponent();
        assertEquals(0, ltc1.getInitCount());
        assertEquals(0, ltc1.getDisposeCount());
        app.getColumn().add(ltc1);
        assertEquals(1, ltc1.getInitCount());
        assertEquals(0, ltc1.getDisposeCount());
        app.getColumn().remove(ltc1);
        assertEquals(1, ltc1.getInitCount());
        assertEquals(1, ltc1.getDisposeCount());
        app.getColumn().add(ltc1);
        assertEquals(2, ltc1.getInitCount());
        assertEquals(1, ltc1.getDisposeCount());
        app.getColumn().add(ltc1);
        assertEquals(3, ltc1.getInitCount());
        assertEquals(2, ltc1.getDisposeCount());
        app.getColumn().remove(ltc1);
        assertEquals(3, ltc1.getInitCount());
        assertEquals(3, ltc1.getDisposeCount());
        app.getColumn().remove(ltc1);
        assertEquals(3, ltc1.getInitCount());
        assertEquals(3, ltc1.getDisposeCount());
        
        ApplicationInstance.setActive(null);
    }
    
    /**
     * Tests invocation of the <code>init()</code>/<code>dispose</code>
     * life-cycle methods with a <code>Component</code> hierarchy.
     */
    public void testLifecycleComponentHierarchy() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        
        LifecycleTestComponent ltc1 = new LifecycleTestComponent();
        LifecycleTestComponent ltc2 = new LifecycleTestComponent();

        assertEquals(0, ltc1.getInitCount());
        assertEquals(0, ltc1.getDisposeCount());
        assertEquals(0, ltc2.getInitCount());
        assertEquals(0, ltc2.getDisposeCount());
        
        ltc1.add(ltc2);
        
        assertEquals(0, ltc1.getInitCount());
        assertEquals(0, ltc1.getDisposeCount());
        assertEquals(0, ltc2.getInitCount());
        assertEquals(0, ltc2.getDisposeCount());
        
        app.getColumn().add(ltc1);
        
        assertEquals(1, ltc1.getInitCount());
        assertEquals(0, ltc1.getDisposeCount());
        assertEquals(1, ltc2.getInitCount());
        assertEquals(0, ltc2.getDisposeCount());

        app.getColumn().remove(ltc1);
        
        assertEquals(1, ltc1.getInitCount());
        assertEquals(1, ltc1.getDisposeCount());
        assertEquals(1, ltc2.getInitCount());
        assertEquals(1, ltc2.getDisposeCount());
        
        app.getColumn().add(ltc1);
        
        assertEquals(2, ltc1.getInitCount());
        assertEquals(1, ltc1.getDisposeCount());
        assertEquals(2, ltc2.getInitCount());
        assertEquals(1, ltc2.getDisposeCount());

        app.getColumn().add(ltc1);
        
        assertEquals(3, ltc1.getInitCount());
        assertEquals(2, ltc1.getDisposeCount());
        assertEquals(3, ltc2.getInitCount());
        assertEquals(2, ltc2.getDisposeCount());

        app.getColumn().remove(ltc1);
        
        assertEquals(3, ltc1.getInitCount());
        assertEquals(3, ltc1.getDisposeCount());
        assertEquals(3, ltc2.getInitCount());
        assertEquals(3, ltc2.getDisposeCount());

        app.getColumn().remove(ltc1);
        
        assertEquals(3, ltc1.getInitCount());
        assertEquals(3, ltc1.getDisposeCount());
        assertEquals(3, ltc2.getInitCount());
        assertEquals(3, ltc2.getDisposeCount());

        ApplicationInstance.setActive(null);
    }
    
    /**
     * Ensure <code>IllegalStateException</code> is thrown if an attempt is
     * made to remove a <code>Component</code> from its hierarchy during the
     * execution of the <code>Component.init()</code> method.
     */
    public void testLifecycleRemoveDuringInit() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        
        LifecycleTestComponent special = new LifecycleTestComponent(){
        
            public void init() {
                super.init();
                getParent().remove(this);
            }
        };
        
        try {
            app.getColumn().add(special);
            fail("Did not throw IllegalStateException as expected.");
        } catch (IllegalStateException ex) {
            // Expected.
        } finally {
            ApplicationInstance.setActive(null);
        }
    }
    
    /**
     * Ensure <code>IllegalStateException</code> is thrown if an attempt is
     * made to add a <code>Component</code> back to a hierarchy during the
     * execution of the <code>Component.dispose()</code> method.
     */
    public void testLifecycleAddDuringDispose() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        
        LifecycleTestComponent special = new LifecycleTestComponent(){
        
            public void dispose() {
                super.init();
                getParent().add(this);
            }
        };
        
        app.getColumn().add(special);

        try {
            app.getColumn().remove(special);
            fail("Did not throw IllegalStateException as expected.");
        } catch (IllegalStateException ex) {
            // Expected.
        } finally {
            ApplicationInstance.setActive(null);
        }
    }
    
    /**
     * Test <code>layoutData</code> property.
     */
    public void testLayoutData() {
        NullComponent c = new NullComponent();
        assertNull(c.getLayoutData());
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        GridLayoutData data = new GridLayoutData();
        data.setColumnSpan(2);
        c.setLayoutData(data);
        assertEquals(2, ((GridLayoutData) c.getLayoutData()).getColumnSpan());
        assertEquals(Component.PROPERTY_LAYOUT_DATA, pce.lastEvent.getPropertyName());
    }

//    /**
//     * Test querying rendered <code>locale</code> property when no application 
//     * is active. 
//     */
//    public void testRenderLocaleWithoutApplication() {
//        NullComponent c = new NullComponent();
//        assertNull(c.getRenderLocale());
//        c.setLocale(Locale.TRADITIONAL_CHINESE);
//        assertEquals(Locale.TRADITIONAL_CHINESE, c.getRenderLocale());
//    }
    
    /**
     * Test basic <code>PropertyChangeListener</code> functionality.
     */
    public void testPropertyChangeListeners() {
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        NullComponent c = new NullComponent();
        c.addPropertyChangeListener(pce);
        c.setBackground(new Color(0xabcdef));
        assertEquals(null, pce.lastEvent.getOldValue());
        assertEquals(new Color(0xabcdef), pce.lastEvent.getNewValue());
        assertEquals(c, pce.lastEvent.getSource());
        assertEquals(Component.PROPERTY_BACKGROUND, pce.lastEvent.getPropertyName());
        c.setBackground(new Color(0xfedcba));
        assertEquals(new Color(0xabcdef), pce.lastEvent.getOldValue());
        assertEquals(new Color(0xfedcba), pce.lastEvent.getNewValue());
        c.setBackground(null);
        assertEquals(new Color(0xfedcba), pce.lastEvent.getOldValue());
        assertEquals(null, pce.lastEvent.getNewValue());
    }
    
    /**
     * Test <code>removeAll()</code> method.
     */
    public void testRemoveAll() {
        NullComponent c = new NullComponent();
        c.add(new NullComponent());
        c.add(new NullComponent());
        c.add(new NullComponent());
        assertEquals(3, c.getComponentCount());
        c.removeAll();
        assertEquals(0, c.getComponentCount());
    }
    
    /**
     * Test <code>remove(index)</code> method.
     */
    public void testRemoveByIndex() {
        NullComponent parent = new NullComponent();
        NullComponent a = new NullComponent();
        NullComponent b = new NullComponent();
        NullComponent c = new NullComponent();
        NullComponent d = new NullComponent();
        parent.add(a);
        parent.add(b);
        parent.add(c);
        parent.add(d);
        parent.remove(2);
        assertEquals(0, parent.indexOf(a));
        assertEquals(1, parent.indexOf(b));
        assertEquals(2, parent.indexOf(d));
        assertEquals(-1, parent.indexOf(c));
    }
    
    /**
     * Tests assignment/reassignment of render ids.
     */
    public void testRenderId() {
        ColumnApp app1 = new ColumnApp();
        ApplicationInstance.setActive(app1);
        app1.doInit();
        NullComponent component1 = new NullComponent();
        assertNull(component1.getRenderId());
        app1.getColumn().add(component1);
        assertNotNull(component1.getApplicationInstance());
        assertNotNull(component1.getRenderId());
        ApplicationInstance.setActive(null);

        ColumnApp app2 = new ColumnApp();
        ApplicationInstance.setActive(app2);
        app2.doInit();
        NullComponent component2 = new NullComponent();
        assertNull(component2.getRenderId());
        app2.getColumn().add(component2);
        assertNotNull(component2.getApplicationInstance());
        assertNotNull(component2.getRenderId());
        ApplicationInstance.setActive(null);
        
        // This code relies on fact that ids are handed out sequentially, so sequence counters should be at same index.
        assertTrue(component1.getRenderId().equals(component2.getRenderId()));
        
        ApplicationInstance.setActive(app1);
        app1.getColumn().remove(component1);
        ApplicationInstance.setActive(null);

        ApplicationInstance.setActive(app2);
        app2.getColumn().add(component1);
        ApplicationInstance.setActive(null);

        assertFalse(component1.getRenderId().equals(component2.getRenderId()));
    }
    
    /**
     * Test render-enabled state.
     */
    public void testRenderEnabled() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        assertTrue(app.getContentPane().isRenderEnabled());
        assertTrue(app.getColumn().isRenderEnabled());
        assertTrue(app.getLabel().isRenderEnabled());
        app.getColumn().setEnabled(false);
        assertTrue(app.getContentPane().isRenderEnabled());
        assertFalse(app.getColumn().isRenderEnabled());
        assertFalse(app.getLabel().isRenderEnabled());
        app.getLabel().setEnabled(false);
        assertTrue(app.getContentPane().isRenderEnabled());
        assertFalse(app.getColumn().isRenderEnabled());
        assertFalse(app.getLabel().isRenderEnabled());
        app.getColumn().setEnabled(true);
        assertTrue(app.getContentPane().isRenderEnabled());
        assertTrue(app.getColumn().isRenderEnabled());
        assertFalse(app.getLabel().isRenderEnabled());
        app.getLabel().setEnabled(true);
        assertTrue(app.getContentPane().isRenderEnabled());
        assertTrue(app.getColumn().isRenderEnabled());
        assertTrue(app.getLabel().isRenderEnabled());
        ApplicationInstance.setActive(null);
    }
    
    /**
     * Test render-visible state.
     */
    public void testRenderVisible() {
        ColumnApp app = new ColumnApp();
        ApplicationInstance.setActive(app);
        app.doInit();
        assertTrue(app.getContentPane().isRenderVisible());
        assertTrue(app.getColumn().isRenderVisible());
        assertTrue(app.getLabel().isRenderVisible());
        app.getColumn().setVisible(false);
        assertTrue(app.getContentPane().isRenderVisible());
        assertFalse(app.getColumn().isRenderVisible());
        assertFalse(app.getLabel().isRenderVisible());
        app.getLabel().setVisible(false);
        assertTrue(app.getContentPane().isRenderVisible());
        assertFalse(app.getColumn().isRenderVisible());
        assertFalse(app.getLabel().isRenderVisible());
        app.getColumn().setVisible(true);
        assertTrue(app.getContentPane().isRenderVisible());
        assertTrue(app.getColumn().isRenderVisible());
        assertFalse(app.getLabel().isRenderVisible());
        app.getLabel().setVisible(true);
        assertTrue(app.getContentPane().isRenderVisible());
        assertTrue(app.getColumn().isRenderVisible());
        assertTrue(app.getLabel().isRenderVisible());
        ApplicationInstance.setActive(null);
    }
    
    /**
     * Test <code>visible</code> property.
     */
    public void testVisible() {
        NullComponent c = new NullComponent();
        PropertyChangeEvaluator pce = new PropertyChangeEvaluator();
        c.addPropertyChangeListener(pce);
        assertTrue(c.isVisible());
        c.setVisible(false);
        assertFalse(c.isVisible());
        assertEquals(Component.VISIBLE_CHANGED_PROPERTY, pce.lastEvent.getPropertyName());
        c.setVisible(false);
        assertFalse(c.isVisible());
        c.setVisible(true);
        assertTrue(c.isVisible());
        c.setVisible(true);
        assertTrue(c.isVisible());
    }
    
    /**
     * Test <code>visibleIndexOf()</code> method.
     */
    public void testVisibleIndexOf() {
        NullComponent parent = new NullComponent();
        NullComponent a = new NullComponent();
        NullComponent b = new NullComponent();
        NullComponent c = new NullComponent();
        NullComponent d = new NullComponent();
        parent.add(a);
        parent.add(b);
        parent.add(c);
        assertEquals(0, parent.visibleIndexOf(a));
        assertEquals(1, parent.visibleIndexOf(b));
        assertEquals(2, parent.visibleIndexOf(c));
        assertEquals(-1, parent.visibleIndexOf(d));
        b.setVisible(false);
        assertEquals(0, parent.visibleIndexOf(a));
        assertEquals(-1, parent.visibleIndexOf(b));
        assertEquals(1, parent.visibleIndexOf(c));
        assertEquals(-1, parent.visibleIndexOf(d));
        a.setVisible(false);
        assertEquals(-1, parent.visibleIndexOf(a));
        assertEquals(-1, parent.visibleIndexOf(b));
        assertEquals(0, parent.visibleIndexOf(c));
        assertEquals(-1, parent.visibleIndexOf(d));
        c.setVisible(false);
        assertEquals(-1, parent.visibleIndexOf(a));
        assertEquals(-1, parent.visibleIndexOf(b));
        assertEquals(-1, parent.visibleIndexOf(c));
        assertEquals(-1, parent.visibleIndexOf(d));
    }
}
