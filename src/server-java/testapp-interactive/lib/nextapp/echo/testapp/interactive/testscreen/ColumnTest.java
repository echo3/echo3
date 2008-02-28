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
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

public class ColumnTest extends SplitPane {
    
    private static final SplitPaneLayoutData insetLayoutData;
    static {
        insetLayoutData = new SplitPaneLayoutData();
        insetLayoutData.setInsets(new Insets(10));
    }

    private int nextValue = 0;
    
    public ColumnTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250));
        setStyleName("DefaultResizable");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);

        final Column testColumn = new Column();
        testColumn.setBorder(new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID));
        testColumn.setLayoutData(insetLayoutData);
        add(testColumn);
        
        controlsColumn.addButton("Add Item (at beginning)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.add(new Label("Added item [" + nextValue++ + "]"), 0);
            }
        });
        controlsColumn.addButton("Add Item (at index 1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() >= 1) {
                    testColumn.add(new Label("Added item [" + nextValue++ + "]"), 1);
                }
            }
        });
        controlsColumn.addButton("Add Item (at index 2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() >= 2) {
                    testColumn.add(new Label("Added item [" + nextValue++ + "]"), 2);
                }
            }
        });
        controlsColumn.addButton("Add Item (at end - 1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() >= 1) {
                    testColumn.add(new Label("Added item [" + nextValue++ + "]"), testColumn.getComponentCount() - 1);
                }
            }
        });
        controlsColumn.addButton("Add Item (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.add(new Label("Added item [" + nextValue++ + "]"));
            }
        });
        controlsColumn.addButton("Add Two Items (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.add(new Label("Added item [" + nextValue++ + "]"));
                testColumn.add(new Label("Added item [" + nextValue++ + "]"));
            }
        });
        controlsColumn.addButton("Remove Item 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() > 0) {
                    testColumn.remove(0);
                }
            }
        });
        controlsColumn.addButton("Remove Item 1", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() > 1) {
                    testColumn.remove(1);
                }
            }
        });
        controlsColumn.addButton("Remove Item 2", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() > 2) {
                    testColumn.remove(2);
                }
            }
        });
        controlsColumn.addButton("Remove Second-to-Last Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() >= 2) {
                    testColumn.remove(testColumn.getComponentCount() - 2);
                }
            }
        });
        controlsColumn.addButton("Remove Last Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getComponentCount() > 0) {
                    testColumn.remove(testColumn.getComponentCount() - 1);
                }
            }
        });
        controlsColumn.addButton("Add-Remove-Add Item (at end)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Added item [" + nextValue++ + "]");
                testColumn.add(label);
                testColumn.remove(label);
                testColumn.add(label);
            }
        });
        controlsColumn.addButton("Add Some Items, Remove Some Items", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 10));
                for (int i = 0; i < count; ++i) {
                    int componentCount = testColumn.getComponentCount();
                    if (componentCount > 0 && ((int) (Math.random() * 2)) == 0) {
                        // Perform remove.
                        int position = (int) (Math.random() * componentCount);
                        testColumn.remove(position);
                    } else {
                        // Perform add.
                        int position = (int) (Math.random() * (componentCount + 1));
                        testColumn.add(new Label("Added item [" + nextValue++ + "]"), position);
                    }
                }
            }
        });
        controlsColumn.addButton("Randomly Remove and Re-insert Item", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int itemCount = testColumn.getComponentCount();
                if (itemCount == 0) {
                    return;
                }
                Component item = testColumn.getComponent((int) (Math.random() * itemCount));
                testColumn.remove(item);
                testColumn.add(item, (int) (Math.random() * (itemCount - 1)));
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
                testColumn.add(button);
            }
        });
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setForeground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setForeground(null);
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBackground(StyleUtil.randomColor());
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBackground(null);
            }
        });
        controlsColumn.addButton("Set Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBorder(StyleUtil.randomBorder());
            }
        });
        controlsColumn.addButton("Set Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = testColumn.getBorder();
                if (border == null) {
                    border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                }
                testColumn.setBorder(new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle()));
            }
        });
        controlsColumn.addButton("Set Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBorder(StyleUtil.nextBorderSize(testColumn.getBorder()));
            }
        });
        controlsColumn.addButton("Set Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBorder(StyleUtil.nextBorderStyle(testColumn.getBorder()));
            }
        });
        controlsColumn.addButton("Remove Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setBorder(null);
            }
        });
        controlsColumn.addButton("Cell Spacing -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setCellSpacing(new Extent(0, Extent.PX));
            }
        });
        controlsColumn.addButton("Cell Spacing -> 2px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setCellSpacing(new Extent(2, Extent.PX));
            }
        });
        controlsColumn.addButton("Cell Spacing -> 20px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setCellSpacing(new Extent(20, Extent.PX));
            }
        });
        controlsColumn.addButton("Insets -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setInsets(null);
            }
        });
        controlsColumn.addButton("Insets -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Insets -> 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Insets -> 10/20/30/40px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.setInsets(new Insets(10, 20, 30, 40));
            }
        });
        controlsColumn.addButton("Set Layout Data (of random item)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int componentCount = testColumn.getComponentCount();
                if (componentCount == 0) {
                    return;
                }
                Component component =  testColumn.getComponent((int) (Math.random() * componentCount));
                ColumnLayoutData columnLayoutData = new ColumnLayoutData();
                columnLayoutData.setAlignment(StyleUtil.randomAlignmentHV());
                columnLayoutData.setBackground(StyleUtil.randomBrightColor());
                columnLayoutData.setInsets(new Insets((int) (Math.random() * 30)));
                switch((int) (Math.random() * 7)) {
                case 0:
                     columnLayoutData.setBackgroundImage(Styles.BG_SHADOW_DARK_BLUE);
                     break;
                case 1:
                     columnLayoutData.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                     break;
                default:
                     columnLayoutData.setBackgroundImage(null);
                }
                
                component.setLayoutData(columnLayoutData);
            }
        });
        controlsColumn.addButton("Add Item, Randomize Column Insets", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testColumn.add(new Label("Added item [" + nextValue++ + "]"));
                testColumn.setInsets(new Insets((int) (Math.random() * 50)));
            }
        });
        controlsColumn.addButton("Toggle Test Inset", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getLayoutData() == null) {
                    testColumn.setLayoutData(insetLayoutData);
                } else {
                    testColumn.setLayoutData(null);
                }
            }
        });
    }
}
