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

import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FloatingPane;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

/**
 * Interactive test module for <code>ContentPane</code>s.
 */
public class ContentPaneTest extends SplitPane {

    public ContentPaneTest() {
        super();
        setStyleName("TestControls");
        
        final ContentPane rootContentPane = InteractiveApp.getApp().getDefaultWindow().getContent();
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        final ContentPane testContentPane = new ContentPane();
        add(testContentPane);

        controlsColumn.add(new Label("Root Content Pane"));

        controlsColumn.addButton("Reset", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                rootContentPane.setBackground(null);
                rootContentPane.setForeground(null);
                rootContentPane.setFont(null);
            }
        });
        controlsColumn.addButton("Change Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                rootContentPane.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Change Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                rootContentPane.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Change Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                rootContentPane.setFont(StyleUtil.randomFont());
            }
        });
        
        controlsColumn.add(new Label("Test Content Pane"));

        controlsColumn.addButton("Add WindowPane (Root + Test)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                rootContentPane.add(new WindowPane());
                testContentPane.add(new WindowPane());
            }
        });

        controlsColumn.addButton("Reset", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackground(null);
                testContentPane.setForeground(null);
                testContentPane.setFont(null);
            }
        });
        controlsColumn.addButton("Change Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Change Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
            }
        });
        controlsColumn.addButton("Background Image @ 50px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE_50_PX_REPEAT);
            }
        });
        controlsColumn.addButton("Background Image @ 50%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE_50_PERCENT_REPEAT);
            }
        });
        controlsColumn.addButton("Background Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setBackgroundImage(null);
            }
        });
        controlsColumn.addButton("Change Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setFont(StyleUtil.randomFont());
            }
        });
        controlsColumn.addButton("Add Short Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                removeAllContent(testContentPane);
                testContentPane.add(new Label("Hello, world!"));
            }
        });
        controlsColumn.addButton("Add Long Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                removeAllContent(testContentPane);
                testContentPane.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1 + StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
        controlsColumn.addButton("Add Long Label w/ Horizontal Scrolling", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                removeAllContent(testContentPane);
                Column column = new Column();

                Label label = new Label(StyleUtil.QUASI_LATIN_TEXT_1 + StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLineWrap(false);
                column.add(label);

                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1 + StyleUtil.QUASI_LATIN_TEXT_1);
                column.add(label);
                
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1 + StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLineWrap(false);
                column.add(label);
                
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1 + StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLineWrap(false);
                column.add(label);
                
                testContentPane.add(column);
            }
        });
        controlsColumn.addButton("Add SplitPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                removeAllContent(testContentPane);
                SplitPane splitPane = new SplitPane();
                splitPane.setResizable(true);
                
                Label label;
                SplitPaneLayoutData layoutData;

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafafff));
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLayoutData(layoutData);
                splitPane.add(label);

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafffaf));
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLayoutData(layoutData);
                splitPane.add(label);

                testContentPane.add(splitPane);
            }
        });
        controlsColumn.addButton("Add SplitPane / ContentPane / Button", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                removeAllContent(testContentPane);
                SplitPane splitPane = new SplitPane();
                splitPane.setResizable(true);
                
                Label label;
                SplitPaneLayoutData layoutData;

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafafff));
                ContentPane subContentPane = new ContentPane();
                subContentPane.setLayoutData(layoutData);
                splitPane.add(subContentPane);
                
                SplitPane splitPane2 = new SplitPane(SplitPane.ORIENTATION_VERTICAL);
                subContentPane.add(splitPane2);
                
                ContentPane subContentPane2 = new ContentPane();
                splitPane2.add(subContentPane2);
                subContentPane2.add(new Label("Test!"));
                
                ContentPane subContentPane3 = new ContentPane();
                splitPane2.add(subContentPane3); 
                
                final Button button = new Button("Alpha");
                button.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent e) {
                        button.setText("Alpha".equals(button.getText()) ? "Omega" : "Alpha"); 
                    }
                });
                subContentPane3.add(button);

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafffaf));
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLayoutData(layoutData);
                splitPane.add(label);

                testContentPane.add(splitPane);
            }
        });
        
        controlsColumn.addButton("Add WindowPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.add(new WindowPane());
            }
        });
        controlsColumn.addButton("Set Overflow = Auto", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setOverflow(ContentPane.OVERFLOW_AUTO);
            }
        });
        controlsColumn.addButton("Set Overflow = Hidden", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setOverflow(ContentPane.OVERFLOW_HIDDEN);
            }
        });
        controlsColumn.addButton("Set Overflow = Scroll", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setOverflow(ContentPane.OVERFLOW_SCROLL);
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(null);
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(0));
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = 50", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(50));
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = 100", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(100));
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = 25%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(25, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = 50%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(50, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Set Horizontal Scroll = End (-1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setHorizontalScroll(new Extent(-1));
            }
        });

        controlsColumn.addButton("Set Vertical Scroll = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(null);
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(0));
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = 50", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(50));
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = 100", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(100));
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = 25%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(25, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = 50%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(50, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Set Vertical Scroll = End (-1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setVerticalScroll(new Extent(-1));
            }
        });

        controlsColumn.addButton("Insets -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setInsets(null);
            }
        });
        controlsColumn.addButton("Insets -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Insets -> 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Insets -> 10/20/30/40px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testContentPane.setInsets(new Insets(10, 20, 30, 40));
            }
        });
    }

    private void removeAllContent(ContentPane contentPane) {
        int count = contentPane.getComponentCount();
        for (int i = count - 1; i >= 0; --i) {
            if (contentPane.getComponent(i) instanceof FloatingPane) {
                continue;
            }
            contentPane.remove(i);
        }
    }
}
