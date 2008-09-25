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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Panel;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;

/**
 * Interactive test for the <code>Panel</code> component.
 */
public class PanelTest extends SplitPane {
    
    public PanelTest() {
        super();
        setStyleName("TestControls");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        final Panel panel = new Panel() { };
        add(panel);

        controlsColumn.addButton("Reset", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBackground(null);
                panel.setForeground(null);
                panel.setFont(null);
            }
        });
        controlsColumn.addButton("Change Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Change Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Change Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setFont(StyleUtil.randomFont());
            }
        });
        controlsColumn.addButton("Set Content (Label)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (panel.getComponentCount() > 0) {
                    panel.removeAll();
                }
                panel.add(new Label("Hello, world!"));
            }
        });
        controlsColumn.addButton("Set Content (Long Label)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (panel.getComponentCount() > 0) {
                    panel.removeAll();
                }
                panel.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
        controlsColumn.addButton("Set Content (Grid)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (panel.getComponentCount() > 0) {
                    panel.removeAll();
                }
                Grid grid = new Grid();
                grid.setBorder(StyleUtil.randomBorder());
                grid.setInsets(new Insets(StyleUtil.randomExtent(8)));
                grid.add(new Label("A label"));
                grid.add(new Label("A label"));
                grid.add(new Label("A label"));
                grid.add(new Label("A label"));
                grid.add(new Label("A label"));
                panel.add(grid);
            }
        });
        controlsColumn.addButton("Clear Content", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.removeAll();
            }
        });
        controlsColumn.addButton("Add Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (panel.getParent() == null) {
                    PanelTest.this.add(panel);
                }
            }
        });
        controlsColumn.addButton("Remove Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (panel.getParent() != null) {
                    PanelTest.this.remove(panel);
                }
            }
        });
        controlsColumn.addButton("Set Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBorder(StyleUtil.randomBorder());
            }
        });
        controlsColumn.addButton("Set Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = panel.getBorder();
                if (border == null) {
                    border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                }
                panel.setBorder(new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle()));
            }
        });
        controlsColumn.addButton("Set Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBorder(StyleUtil.nextBorderSize(panel.getBorder()));
            }
        });
        controlsColumn.addButton("Set Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBorder(StyleUtil.nextBorderStyle(panel.getBorder()));
            }
        });
        controlsColumn.addButton("Remove Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setBorder(null);
            }
        });
        controlsColumn.addButton("Insets -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setInsets(null);
            }
        });
        controlsColumn.addButton("Insets -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Insets -> 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Insets -> 10/20/30/40px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                panel.setInsets(new Insets(10, 20, 30, 40));
            }
        });
    }
}
