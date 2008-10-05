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

import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

/**
 * Interactive test module for <code>WindowPane</code>s.
 */
public class WindowPaneTest extends SplitPane {
    
    private WindowPane windowPane;
    private ContentPane contentPane;
    
    public WindowPaneTest() {
        super();
        setStyleName("TestControls");
        
        Column groupContainerColumn = new Column();
        groupContainerColumn.setCellSpacing(new Extent(5));
        groupContainerColumn.setStyleName("TestControlsColumn");
        add(groupContainerColumn);
        
        contentPane = new ContentPane();
        add(contentPane);
        windowPane = new WindowPane();
        contentPane.add(windowPane);

        ButtonColumn controlsColumn;
        
        // Content
        
        controlsColumn = new ButtonColumn();
        controlsColumn.add(new Label("Content"));
        groupContainerColumn.add(controlsColumn);
        
        controlsColumn.addButton("Set Content = Small Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.removeAll();
                windowPane.add(new Label("Hello, World!"));
            }
        });
        
        controlsColumn.addButton("Set Content = Big Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.removeAll();
                windowPane.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
        
        controlsColumn.addButton("Set Content = WindowPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.removeAll();
                windowPane.add(new WindowPaneTest());
            }
        });
        
        controlsColumn.addButton("Set Content = Nothing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.removeAll();
            }
        });
        
        controlsColumn.addButton("Add-Remove-Add", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.removeAll();
                Label label = new Label("Hello, World!");
                windowPane.add(label);
                windowPane.remove(label);
                windowPane.add(label);
            }
        });
        
        // Properties
        
        controlsColumn = new ButtonColumn();
        controlsColumn.add(new Label("Properties"));
        groupContainerColumn.add(controlsColumn);
        
        controlsColumn.addButton("Set Style Name = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setStyleName("Default");
            }
        });
        controlsColumn.addButton("Clear Style Name", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setStyleName(null);
            }
        });
        controlsColumn.addButton("Set Border = Blue Fade", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBorder((FillImageBorder) InteractiveApp.getApp().getStyleSheet().getStyle("Default", 
                        WindowPane.class, false).get(WindowPane.PROPERTY_BORDER));
            }
        });
        controlsColumn.addButton("Set Border = Solid Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBorder(new FillImageBorder(Color.GREEN, new Insets(30), new Insets(15)));
            }
        });
        controlsColumn.addButton("Set Border = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBorder(null);
            }
        });
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setForeground(null);
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBackground(null);
            }
        });
        controlsColumn.addButton("Set Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setFont(StyleUtil.randomFont());
            }
        });
        controlsColumn.addButton("Clear Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setFont(null);
            }
        });
        controlsColumn.addButton("Set Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
            }
        });
        controlsColumn.addButton("Clear Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setBackgroundImage(null);
            }
        });
        controlsColumn.addButton("Set Content Insets to 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Set Content Insets to 5", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Set Content Insets to 10/20/40/80", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setInsets(new Insets(10, 20, 40, 80));
            }
        });
        controlsColumn.addButton("Clear Content Insets", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setInsets(null);
            }
        });

        controlsColumn.addButton("Set Position Random", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setPositionX(new Extent((int) (Math.random() * 600)));
                windowPane.setPositionY(new Extent((int) (Math.random() * 500)));
            }
        });
        controlsColumn.addButton("Set Size 400x300", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setWidth(new Extent(400));
                windowPane.setHeight(new Extent(300));
            }
        });
        controlsColumn.addButton("Set Size Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setWidth(null);
                windowPane.setHeight(null);
            }
        });
        controlsColumn.addButton("Set Content Size 400x300", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setContentWidth(new Extent(400));
                windowPane.setContentHeight(new Extent(300));
            }
        });
        controlsColumn.addButton("Set Content Size Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setContentWidth(null);
                windowPane.setContentHeight(null);
            }
        });
        controlsColumn.addButton("Set Size Random", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setWidth(new Extent(100 + (int) (Math.random() * 400)));
                windowPane.setHeight(new Extent(100 + (int) (Math.random() * 300)));
            }
        });
        controlsColumn.addButton("Set Position&Size Random", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setPositionX(new Extent((int) (Math.random() * 600)));
                windowPane.setPositionY(new Extent((int) (Math.random() * 500)));
                windowPane.setWidth(new Extent(100 + (int) (Math.random() * 400)));
                windowPane.setHeight(new Extent(100 + (int) (Math.random() * 300)));
            }
        });        
        controlsColumn.addButton("Toggle Closable", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setClosable(!windowPane.isClosable());
            }
        });        
        controlsColumn.addButton("Toggle Movable", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setMovable(!windowPane.isMovable());
            }
        });        
        controlsColumn.addButton("Toggle Resizable", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setResizable(!windowPane.isResizable());
            }
        });        
        controlsColumn.addButton("Toggle Maximize Enabled", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setMaximizeEnabled(!windowPane.isMaximizeEnabled());
            }
        });        
        controlsColumn.addButton("Toggle Minimize Enabled", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setMinimizeEnabled(!windowPane.isMinimizeEnabled());
            }
        });
        
        // Title-Related Properties
        
        controlsColumn = new ButtonColumn();
        controlsColumn.add(new Label("Properties"));
        groupContainerColumn.add(controlsColumn);
        
        controlsColumn.addButton("Set Title", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitle("Window Title");
            }
        });
        controlsColumn.addButton("Set Title Long", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitle("This is a fairly long window title that goes on for a little to long to see if " +
                        "wrapping is handled properly and such.");
            }
        });
        controlsColumn.addButton("Clear Title", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitle(null);
            }
        });
        controlsColumn.addButton("Set Title Height", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleHeight(new Extent(((int) (Math.random() * 24)) + 24));
            }
        });
        controlsColumn.addButton("Clear Title Height", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleHeight(null);
            }
        });
        controlsColumn.addButton("Set Title Insets to 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Set Title Insets to 5", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Set Title Insets to 10/20/40/80", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleInsets(new Insets(10, 20, 40, 80));
            }
        });
        controlsColumn.addButton("Clear Title Insets", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleInsets(null);
            }
        });
        controlsColumn.addButton("Set Title Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Title Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleForeground(null);
            }
        });
        controlsColumn.addButton("Set Title Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Title Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleBackground(null);
            }
        });
        controlsColumn.addButton("Set Title Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleFont(StyleUtil.randomFont());
            }
        });
        controlsColumn.addButton("Clear Title Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setTitleFont(null);
            }
        });
        controlsColumn.addButton("Set Controls Spacing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setControlsSpacing(new Extent(((int) (Math.random() * 24)) + 24));
            }
        });
        controlsColumn.addButton("Clear Controls Spacing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setControlsSpacing(null);
            }
        });

        // Integration Tests
        
        controlsColumn = new ButtonColumn();
        controlsColumn.add(new Label("Content"));
        groupContainerColumn.add(controlsColumn);

        controlsColumn.addButton("Add Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (contentPane.getComponentCount() == 0) {
                    contentPane.add(windowPane);
                }
            }
        });

        controlsColumn.addButton("Remove Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                contentPane.remove(windowPane);
            }
        });

        controlsColumn.addButton("Enable Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setEnabled(true);
            }
        });

        controlsColumn.addButton("Disable Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setEnabled(false);
            }
        });

        controlsColumn.addButton("Add Modal WindowPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                WindowPane modalWindow = new WindowPane();
                modalWindow.setTitle("Blocking Modal WindowPane");
                modalWindow.setModal(true);
                InteractiveApp.getApp().getDefaultWindow().getContent().add(modalWindow);
            }
        });
    }
}
