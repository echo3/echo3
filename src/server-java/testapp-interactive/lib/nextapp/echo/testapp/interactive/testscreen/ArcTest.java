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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.util.Context;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public class ArcTest extends SplitPane {

    private static final Service ARC_TEST_COMPONENT_SERVICE = JavaScriptService.forResource("Test.Arc", 
            "/nextapp/echo/testapp/interactive/resource/js/ArcTestComponents.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(ARC_TEST_COMPONENT_SERVICE);
    }
    
    public class ArcTestComponent extends Component {
        
        public static final String PROPERTY_TEXT = "text";
        
        public String getText() {
            return (String) getProperty(PROPERTY_TEXT);
        }
        
        public void setText(String newValue) {
            setProperty(PROPERTY_TEXT, newValue);
        }
    }
    
    public static class ArcTestComponentPeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestComponentPeer() {
            super();
            addRequiredComponentClass(Label.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean shortType) {
            return "ArcTestComponent";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestComponent.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }

    private class ArcTestPane extends Component {
        
    }
    
    public static class ArcTestPanePeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestPanePeer() {
            super();
            addRequiredComponentClass(Button.class);
            addRequiredComponentClass(Column.class);
            addRequiredComponentClass(ContentPane.class);
            addRequiredComponentClass(Label.class);
            addRequiredComponentClass(Row.class);
            addRequiredComponentClass(WindowPane.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean shortType) {
            return "ArcTestPane";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestPane.class;
        }

        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }

    public class ArcTestContainer extends Component {
        
    }
    
    public static class ArcTestContainerPeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestContainerPeer() {
            super();
            addRequiredComponentClass(ContentPane.class);
            addRequiredComponentClass(WindowPane.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean shortType) {
            return "ArcTestContainer";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestContainer.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }
    
    private Column testColumn;
    private ArcTestComponent arcTestComponent;
    private ArcTestContainer arcTestContainer;
    
    public ArcTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        controlsColumn.addButton("Change Background Color of Container", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                testColumn.setBackground(StyleUtil.randomColor());
            }
        });

        controlsColumn.addButton("Set component text: null", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                arcTestComponent.setText(null);
            }
        });

        controlsColumn.addButton("Set component text: \"text\"", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                arcTestComponent.setText("text");
            }
        });
        
        controlsColumn.addButton("Add to Container", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                arcTestContainer.add(new Label("TEST"));
            }
        });

        controlsColumn.addButton("Remove from Container", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (arcTestContainer.getComponentCount() > 0) {
                    arcTestContainer.remove(arcTestContainer.getComponentCount() - 1);
                }
            }
        });

        testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);
        
        arcTestComponent = new ArcTestComponent();
        testColumn.add(arcTestComponent);
        
        testColumn.add(new ArcTestPane());
        
        arcTestContainer = new ArcTestContainer();
        testColumn.add(arcTestContainer);
    }
}
