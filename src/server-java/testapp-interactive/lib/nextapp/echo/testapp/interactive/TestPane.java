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

package nextapp.echo.testapp.interactive;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

/**
 * Main InteractiveTest <code>ContentPane</code> which displays a menu
 * of available tests.
 */
public class TestPane extends ContentPane {
    
    private ActionListener commandActionListener = new ActionListener() {
        
        private Button activeButton = null;
        
        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent e) {
            try {
                if (activeButton != null) {
                    activeButton.setStyleName("Default");
                }
                Button button = (Button) e.getSource();
                button.setStyleName("Selected");
                activeButton = button;
                
                Class screenClass = getScreenClass(e.getActionCommand());
                Component content = (Component) screenClass.newInstance();
                if (horizontalPane.getComponentCount() > 1) {
                    horizontalPane.remove(1);
                }
                horizontalPane.add(content);
            } catch (InstantiationException ex) {
                throw new RuntimeException(ex.toString());
            } catch (IllegalAccessException ex) {
                throw new RuntimeException(ex.toString());
            }
        }
    };
    
    private SplitPane horizontalPane;
    
    private Column testLaunchButtonsColumn;
    
    public TestPane() {
        super();
        
        setRenderId("TestPane");
        
        SplitPane verticalPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL, true);
        verticalPane.setStyleName("TestPane");
        add(verticalPane);

        Label titleLabel = new Label("NextApp Echo Test Application");
        titleLabel.setStyleName("TitleLabel");
        verticalPane.add(titleLabel);
        
        horizontalPane = new SplitPane();
        horizontalPane.setStyleName("TestControls");
        verticalPane.add(horizontalPane);
        
        Column controlsColumn = new Column();
        controlsColumn.setStyleName("ApplicationControlsColumn");
        controlsColumn.setCellSpacing(new Extent(5));
        
        horizontalPane.add(controlsColumn);
        
        testLaunchButtonsColumn = new Column();
        controlsColumn.add(testLaunchButtonsColumn);

        addTest("Application Rendered Components", "ArcTest");
        addTest("BoxShadow", "BoxShadowTest");
        addTest("Button", "ButtonTest");
        addTest("Client Configuration", "ClientConfigurationTest");
        addTest("Client Exception", "ClientExceptionTest");
        addTest("Column", "ColumnTest");
        addTest("Command", "CommandTest");
        addTest("Composite", "CompositeTest");
        addTest("Container Context", "ContainerContextTest");
        addTest("ContentPane", "ContentPaneTest");
        addTest("Delay", "DelayTest");
        addTest("Exception", "ExceptionTest");
        addTest("Focus", "FocusTest");
        addTest("Grid", "GridTest");
        addTest("Hierarchy", "HierarchyTest");
        addTest("Image", "ImageReferenceTest");
        addTest("Label", "LabelTest");
        addTest("ListBox", "ListBoxTest");
        addTest("ListBox (Large Quantity)", "ListRenderTableTest");
        addTest("Localization", "LocalizationTest");
        addTest("Panel", "PanelTest");
        addTest("Push (Basic)", "PushTest");
        addTest("Push (Ghost Test)", "PushGhostTest");
        addTest("Random Click", "RandomClickTest");
        addTest("RenderHide", "RenderHideTest");
        addTest("Reparent", "ReparentTest");
        addTest("Row", "RowTest");
        addTest("SplitPane (Basic)", "SplitPaneTest");
        addTest("SplitPane (Nested)", "SplitPaneNestedTest");
        addTest("Style", "StyleTest");
        addTest("StyleSheet", "StyleSheetTest");
        addTest("Table", "TableTest");
        addTest("Table (Performance)", "TablePerformanceTest");
        addTest("TextComponent", "TextComponentTest");
        addTest("Text Sync", "TextSyncTest");
        addTest("Visibility", "VisibilityTest");
        addTest("Window", "WindowTest");
        addTest("WindowPane", "WindowPaneTest");
        addTest("WindowPane Examples", "WindowPaneExamplesTest");
        addTest("{ Scratch Test }", "ScratchTest");
        
        Column applicationControlsColumn = new Column();
        controlsColumn.add(applicationControlsColumn);

        Button button;

        button = new Button("Serial Test");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doSerialTest();
            }
        });
        applicationControlsColumn.add(button);
        
        button = new Button("Exit");
        button.setRenderId("Exit");
        button.setId("ExitTestApplication");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().displayWelcomePane();
            }
        });
        applicationControlsColumn.add(button);

    }
    
    private void addTest(String name, String action) {
        Button button = new Button(name);
        button.setRenderId("StartTest" + action);
        button.setId("StartTest:" + action);
        button.setActionCommand(action);
        button.setStyleName("Default");
        button.addActionListener(commandActionListener);
        if (getScreenClass(action) == null) {
            button.setEnabled(false);
        }
        testLaunchButtonsColumn.add(button);
    }

     
    private void doSerialTest() {
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        ObjectOutputStream objectOut;
        
        try {
            objectOut = new ObjectOutputStream(byteOut);
            objectOut.writeObject(this.getApplicationInstance());
            objectOut.flush();
            objectOut.close();
            byte[] data = byteOut.toByteArray();
            InteractiveApp.getApp().consoleWrite("Serialized.  Length: " + data.length);
        } catch (IOException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        }
    }
    
    private Class getScreenClass(String testName) {
        try {
            return Class.forName("nextapp.echo.testapp.interactive.testscreen." + testName);
        } catch (ClassNotFoundException ex) {
            return null;
        }
    }
    
    /**
     * @see nextapp.echo.app.Component#init()
     */
    public void init() {
        super.init();
        getApplicationInstance().setFocusedComponent(testLaunchButtonsColumn.getComponent(0));
    };
}
