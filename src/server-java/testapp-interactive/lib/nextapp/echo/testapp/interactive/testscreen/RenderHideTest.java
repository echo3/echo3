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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Label;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.util.Context;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Tests functionality of renderComponentHide() method.  This method is not currently used by any Echo3 core components,
 * so a special test component is used.
 */
public class RenderHideTest extends SplitPane {

    private static final Service TEST_SERVICE = JavaScriptService.forResource("FlashingTest", 
            "nextapp/echo/testapp/interactive/resource/js/FlashingTest.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(TEST_SERVICE);
    }
    

    public class TestComponent extends Component 
    implements Pane, PaneContainer { }
    
    public static class TestPeer extends AbstractComponentSynchronizePeer {
    
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean mode) {
            return "FlashingTest";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return TestComponent.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
         */
        public void init(Context context, Component component) {
            super.init(context, component);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(TEST_SERVICE.getId());
        }
    }
    
    public RenderHideTest() {
        super();
        setStyleName("TestControls");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        final TestComponent testComponent = new TestComponent();
        
        add(testComponent);

        controlsColumn.add(new Label("Tests"));
        
        controlsColumn.addButton("Add WindowPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.removeAll();
                ContentPane contentPane = new ContentPane();
                testComponent.add(contentPane);
                WindowPane windowPane = new WindowPane();
                windowPane.setStyleName("Default");
                contentPane.add(windowPane);
            }
        });
        
        controlsColumn.addButton("Add SplitPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.removeAll();
                SplitPane splitPane = new SplitPane();
                splitPane.setStyleName("DefaultResizable");
                testComponent.add(splitPane);
            }
        });
        
        controlsColumn.addButton("Remove", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.removeAll();
            }
        });
    }
}
