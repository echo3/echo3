/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.RowLayoutData;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

public class RowTest extends SplitPane {
    
    private int nextValue = 0;
    
    private static final SplitPaneLayoutData insetLayoutData;
    static {
        insetLayoutData = new SplitPaneLayoutData();
        insetLayoutData.setInsets(new Insets(10));
    }
    
    public RowTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250));
        setStyleName("DefaultResizable");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);

        final Row testRow = new Row();
        testRow.setBorder(new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID));
        testRow.setLayoutData(insetLayoutData);
        add(testRow);
        
        controlsColumn.addButton("Add Item (at beginning)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.add(new Label("Added item [" + nextValue++ + "]"), 0);
            }
        });
        controlsColumn.addButton("Add Item (at index 1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() >= 1) {
                    testRow.add(new Label("Added item [" + nextValue++ + "]"), 1);
                }
            }
        });
        controlsColumn.addButton("Add Item (at index 2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() >= 2) {
                    testRow.add(new Label("Added item [" + nextValue++ + "]"), 2);
                }
            }
        });
        controlsColumn.addButton("Add Item (at end - 1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() >= 1) {
                    testRow.add(new Label("Added item [" + nextValue++ + "]"), testRow.getComponentCount() - 1);
                }
            }
        });
        controlsColumn.addButton("Add Item (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.add(new Label("Added item [" + nextValue++ + "]"));
            }
        });
        controlsColumn.addButton("Add Two Items (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.add(new Label("Added item [" + nextValue++ + "]"));
                testRow.add(new Label("Added item [" + nextValue++ + "]"));
            }
        });
        controlsColumn.addButton("Remove Item 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() > 0) {
                    testRow.remove(0);
                }
            }
        });
        controlsColumn.addButton("Remove Item 1", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() > 1) {
                    testRow.remove(1);
                }
            }
        });
        controlsColumn.addButton("Remove Item 2", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() > 2) {
                    testRow.remove(2);
                }
            }
        });
        controlsColumn.addButton("Remove Second-to-Last Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() >= 2) {
                    testRow.remove(testRow.getComponentCount() - 2);
                }
            }
        });
        controlsColumn.addButton("Remove Last Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getComponentCount() > 0) {
                    testRow.remove(testRow.getComponentCount() - 1);
                }
            }
        });
        controlsColumn.addButton("Add-Remove-Add Item (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Added item [" + nextValue++ + "]");
                testRow.add(label);
                testRow.remove(label);
                testRow.add(label);
            }
        });
        controlsColumn.addButton("Add Some Items, Remove Some Items", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 10));
                for (int i = 0; i < count; ++i) {
                    int componentCount = testRow.getComponentCount();
                    if (componentCount > 0 && ((int) (Math.random() * 2)) == 0) {
                        // Perform remove.
                        int position = (int) (Math.random() * componentCount);
                        testRow.remove(position);
                    } else {
                        // Perform add.
                        int position = (int) (Math.random() * (componentCount + 1));
                        testRow.add(new Label("Added item [" + nextValue++ + "]"), position);
                    }
                }
            }
        });
        controlsColumn.addButton("Add Changing Button", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Button button = new Button(Integer.toString(nextValue++));
                button.setStyleName("Default");
                button.addActionListener(new ActionListener(){
                
                    public void actionPerformed(ActionEvent e) {
                        try {
                            int newValue = Integer.parseInt(button.getText()) + 1;
                            button.setText(Integer.toString(newValue));
                        } catch (NumberFormatException ex) {
                            button.setText("0");
                        }
                    }
                });
                testRow.add(button);
            }
        });
        controlsColumn.addButton("Randomly Remove and Re-insert Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int itemCount = testRow.getComponentCount();
                if (itemCount == 0) {
                    return;
                }
                Component item = testRow.getComponent((int) (Math.random() * itemCount));
                testRow.remove(item);
                testRow.add(item, (int) (Math.random() * (itemCount - 1)));
            }
        }); 
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setForeground(null);
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBackground(null);
            }
        });
        controlsColumn.addButton("Set Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBorder(StyleUtil.randomBorder());
            }
        });
        controlsColumn.addButton("Set Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = testRow.getBorder();
                if (border == null) {
                    border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                }
                testRow.setBorder(new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle()));
            }
        });
        controlsColumn.addButton("Set Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBorder(StyleUtil.nextBorderSize(testRow.getBorder()));
            }
        });
        controlsColumn.addButton("Set Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBorder(StyleUtil.nextBorderStyle(testRow.getBorder()));
            }
        });
        controlsColumn.addButton("Remove Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setBorder(null);
            }
        });
        controlsColumn.addButton("Cell Spacing -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setCellSpacing(new Extent(0, Extent.PX));
            }
        });
        controlsColumn.addButton("Cell Spacing -> 2px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setCellSpacing(new Extent(2, Extent.PX));
            }
        });
        controlsColumn.addButton("Cell Spacing -> 20px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setCellSpacing(new Extent(20, Extent.PX));
            }
        });
        controlsColumn.addButton("Insets -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setInsets(null);
            }
        });
        controlsColumn.addButton("Insets -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Insets -> 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Insets -> 10/20/30/40px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.setInsets(new Insets(10, 20, 30, 40));
            }
        });
        controlsColumn.addButton("Alignment -> Leading", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
            }
        });
        controlsColumn.addButton("Alignment -> Trailing", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
            }
        });
        controlsColumn.addButton("Alignment -> Left", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
            }
        });
        controlsColumn.addButton("Alignment -> Center", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
            }
        });
        controlsColumn.addButton("Alignment -> Right", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
            }
        });
        controlsColumn.addButton("Alignment -> Default", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                testRow.setAlignment(new Alignment(Alignment.DEFAULT, Alignment.DEFAULT));
            }
        });
        
        controlsColumn.addButton("Set Layout Data (of random item)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int componentCount = testRow.getComponentCount();
                if (componentCount == 0) {
                    return;
                }
                Component component =  testRow.getComponent((int) (Math.random() * componentCount));
                RowLayoutData rowLayoutData = new RowLayoutData();
                rowLayoutData.setAlignment(StyleUtil.randomAlignmentHV());
                rowLayoutData.setBackground(StyleUtil.randomBrightColor());
                rowLayoutData.setInsets(new Insets((int) (Math.random() * 30)));
                switch((int) (Math.random() * 7)) {
                case 0:
                     rowLayoutData.setBackgroundImage(Styles.BG_SHADOW_DARK_BLUE);
                     break;
                case 1:
                     rowLayoutData.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                     break;
                default:
                     rowLayoutData.setBackgroundImage(null);
                }
                
                component.setLayoutData(rowLayoutData);
            }
        });
        controlsColumn.addButton("Add Item, Randomize Column Insets", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testRow.add(new Label("Added item [" + nextValue++ + "]"));
                testRow.setInsets(new Insets((int) (Math.random() * 50)));
            }
        });
        controlsColumn.addButton("Toggle Test Inset", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testRow.getLayoutData() == null) {
                    testRow.setLayoutData(insetLayoutData);
                } else {
                    testRow.setLayoutData(null);
                }
            }
        });
    }
}
