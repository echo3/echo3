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

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.CheckBox;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.DecimalExtent;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.LayoutDirection;
import nextapp.echo.app.RadioButton;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.button.AbstractButton;
import nextapp.echo.app.button.ButtonGroup;
import nextapp.echo.app.button.ToggleButton;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;
import nextapp.echo.testapp.interactive.TestGrid;

/**
 * Interactive test module for <code>AbstractButton</code>-derived components.
 */
public class ButtonTest 
extends SplitPane {

    /**
     * Interface used to apply style information to all test components.
     */
    private interface Applicator {
        
        /**
         * Applies style information.
         * 
         * @param button the target button
         */
        public void apply(AbstractButton button);
    }
    
    private List buttonList;
    
    /**
     * Writes <code>ActionEvent</code>s to console.
     */
    private ActionListener actionListener = new ActionListener() {

        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent e) {
            ((InteractiveApp) getApplicationInstance()).consoleWrite(e.toString());
        }
    };
    
    /**
     * Writes <code>ChangeEvent</code>s to console.
     */
    private ChangeListener changeListener = new ChangeListener() {

        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            ((InteractiveApp) getApplicationInstance()).consoleWrite(e.toString());
        }
    };
    
    public ButtonTest() {
        super();
        setStyleName("TestControls");

        SplitPaneLayoutData splitPaneLayoutData;
        
        Column controlGroupsColumn = new Column();
        controlGroupsColumn.setCellSpacing(new Extent(5));
        controlGroupsColumn.setStyleName("TestControlsColumn");
        add(controlGroupsColumn);

        final TestGrid testGrid = new TestGrid();
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testGrid.setLayoutData(splitPaneLayoutData);
        add(testGrid);
        
        buttonList = new ArrayList();
        
        Button button;
        testGrid.addHeaderRow("Button");
        
        button = new Button();
        testGrid.addTestRow("No Content", button);
        buttonList.add(button);

        button = new Button("Test Button");
        testGrid.addTestRow("Text", button);
        buttonList.add(button);
        
        button = new Button(Styles.ICON_LOGO);
        testGrid.addTestRow("Icon", button);
        buttonList.add(button);
        
        button = new Button("Test Button", Styles.ICON_LOGO);
        testGrid.addTestRow("Text and Icon", button);
        buttonList.add(button);

        CheckBox checkBox;
        testGrid.addHeaderRow("CheckBox");

        checkBox = new CheckBox();
        testGrid.addTestRow("No Content", checkBox);
        buttonList.add(checkBox);

        checkBox = new CheckBox("Test CheckBox");
        testGrid.addTestRow("Text", checkBox);
        buttonList.add(checkBox);
        
        checkBox = new CheckBox(Styles.ICON_LOGO);
        testGrid.addTestRow("Icon", checkBox);
        buttonList.add(checkBox);
        
        checkBox = new CheckBox("Test CheckBox", Styles.ICON_LOGO);
        testGrid.addTestRow("Text and Icon", checkBox);
        buttonList.add(checkBox);
        
        RadioButton radioButton;
        testGrid.addHeaderRow("RadioButton");
        
        ButtonGroup buttonGroup = new ButtonGroup();

        radioButton = new RadioButton();
        radioButton.setGroup(buttonGroup);
        testGrid.addTestRow("No Content", radioButton);
        buttonList.add(radioButton);

        radioButton = new RadioButton("Test RadioButton");
        radioButton.setGroup(buttonGroup);
        testGrid.addTestRow("Text", radioButton);
        buttonList.add(radioButton);
        
        radioButton = new RadioButton(Styles.ICON_LOGO);
        radioButton.setGroup(buttonGroup);
        testGrid.addTestRow("Icon", radioButton);
        buttonList.add(radioButton);
        
        radioButton = new RadioButton("Test RadioButton", Styles.ICON_LOGO);
        radioButton.setGroup(buttonGroup);
        testGrid.addTestRow("Text and Icon", radioButton);
        buttonList.add(radioButton);

        buttonGroup = new ButtonGroup();
        Grid radioGrid = new Grid();
        radioGrid.setInsets(new Insets(10));
        for (int i = 1; i <= 4; ++i) {
            radioButton = new RadioButton(Integer.toString(i));
            radioButton.setGroup(buttonGroup);
            radioGrid.add(radioButton);
            buttonList.add(radioButton);
        }
        testGrid.addTestRow("Separate ButtonGroup", radioGrid);
        
        radioButton = new RadioButton("Test");
        buttonList.add(radioButton);
        testGrid.addTestRow("Null ButtonGroup", radioButton);
        
        ButtonColumn controlsColumn;
        
        // Create 'AbstractButton Controls Group'
        
        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("General Settings"));
        
        controlsColumn.addButton("Toggle Container Cell Spacing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testGrid.getInsets() != null && testGrid.getInsets().getTop().equals(new Extent(5))) {
                    testGrid.setInsets(new Insets(0));
                } else {
                    testGrid.setInsets(new Insets(5));
                }
            }
        });
        controlsColumn.addButton("Container Width = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testGrid.setWidth(null);
            }
        });
        controlsColumn.addButton("Container Width = 500px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testGrid.setWidth(new Extent(500));
            }
        });
        controlsColumn.addButton("Container Width = 100%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testGrid.setWidth(new Extent(100, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Add ActionListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.addActionListener(actionListener);
                    }
                });
            }
        });
        controlsColumn.addButton("Remove ActionListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.removeActionListener(actionListener);
                    }
                });
            }
        });
        controlsColumn.addButton("Add ChangeListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).addChangeListener(changeListener);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Remove ChangeListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).removeChangeListener(changeListener);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set StyleName = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setStyleName(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set StyleName = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setStyleName("Default");
                    }
                });
            }
        });
        controlsColumn.addButton("Four-sided Border Rollover/renderClear", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(new Border(new Border.Side[]{
                           new Border.Side(1, Color.BLUE, Border.STYLE_SOLID),
                           new Border.Side(1, Color.CYAN, Border.STYLE_SOLID),
                           null,
                           null
                        }));
                        button.setRolloverBorder(new Border(new Border.Side[]{
                           new Border.Side(1, Color.RED, Border.STYLE_SOLID),
                           null,
                           new Border.Side(1, Color.YELLOW, Border.STYLE_SOLID),
                           null
                        }));
                        button.setRolloverEnabled(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Empty String", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getText() != null) {
                            button.setText("");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Short", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getText() != null) {
                            button.setText("Test Button");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Long", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getText() != null) {
                            button.setText("This button has a longer label.  The quick brown fox jumps over the lazy brown dog.");
                        }
                    }
                });
            }
        });
        
        controlsColumn.addButton("Toggle ToolTip Text", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getToolTipText() == null) {
                            button.setToolTipText("This is a tool tip.");
                        } else {
                            button.setToolTipText(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Toggle Enabled State", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setEnabled(!button.isEnabled());
                    }
                });
            }
        });
        controlsColumn.addButton("Toggle Enabled State (Container)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testGrid.setEnabled(!testGrid.isEnabled());
            }
        });

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("AbstractButton Controls"));
        
        // Base Settings
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setForeground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setForeground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBackground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBackground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Font font = StyleUtil.randomFont();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setFont(font);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setFont(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBackgroundImage(Styles.BUTTON_BACKGROUND_IMAGE);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBackgroundImage(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(StyleUtil.randomBorder());
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (4pt groove red)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(new Border(new Extent(4, Extent.PT), Color.RED, Border.STYLE_GROOVE));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (1em solid red)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(new Border(new DecimalExtent(1, Extent.EM), Color.RED, Border.STYLE_SOLID));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (1.5em solid red)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(new Border(new DecimalExtent(1.5, Extent.EM), Color.RED, Border.STYLE_SOLID));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (2em solid red)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(new Border(new DecimalExtent(2, Extent.EM), Color.RED, Border.STYLE_SOLID));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border (All, Individual Sides)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(StyleUtil.randomMultisidedBorder());
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        Border border = button.getBorder();
                        if (border == null) {
                            border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                        }
                        button.setBorder(new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle()));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        Border border = button.getBorder();
                        if (border == null) {
                            border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                        }
                        button.setBorder(StyleUtil.nextBorderSize(button.getBorder()));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        Border border = button.getBorder();
                        if (border == null) {
                            border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                        }
                        button.setBorder(StyleUtil.nextBorderStyle(button.getBorder()));
                    }
                });
            }
        });
        controlsColumn.addButton("Remove Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setBorder(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Line Wrap = true", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLineWrap(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Line Wrap = false", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLineWrap(false);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Width = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setWidth(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Width = 300px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setWidth(new Extent(300, Extent.PX));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Width = 50%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setWidth(new Extent(50, Extent.PERCENT));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Height = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setHeight(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Height = 100px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setHeight(new Extent(100, Extent.PX));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Insets = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setInsets(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Insets = 10/5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setInsets(new Insets(10, 5));
                    }
                });
            }
        });
        controlsColumn.addButton("Set Insets = 30px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setInsets(new Insets(30, 30));
                    }
                });
            }
        });

        // Rollover Effect Settings

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Rollover Effects"));

        controlsColumn.addButton("Enable Rollover Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverEnabled(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Disable Rollover Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverEnabled(false);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Rollover Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setRolloverIcon(Styles.ROLLOVER_ICON_LOGO);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Rollover Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setRolloverIcon(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Rollover Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverForeground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Rollover Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverForeground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Rollover Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverBackground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Rollover Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverBackground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Rollover Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Font font = StyleUtil.randomFont();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverFont(font);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Rollover Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverFont(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Rollover Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverBackgroundImage(Styles.BUTTON_ROLLOVER_BACKGROUND_IMAGE);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Rollover Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setRolloverBackgroundImage(null);
                    }
                });
            }
        });
        
        // Pressed Effect Settings

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Pressed Effects"));

        controlsColumn.addButton("Enable Pressed Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedEnabled(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Disable Pressed Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedEnabled(false);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Pressed Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setPressedIcon(Styles.PRESSED_ICON_LOGO);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Pressed Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setPressedIcon(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Pressed Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedForeground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Pressed Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedForeground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Pressed Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedBackground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Pressed Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedBackground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Pressed Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Font font = StyleUtil.randomFont();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedFont(font);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Pressed Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedFont(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Pressed Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedBackgroundImage(Styles.BUTTON_PRESSED_BACKGROUND_IMAGE);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Pressed Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setPressedBackgroundImage(null);
                    }
                });
            }
        });
        
        // Disabled Effect Settings

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Disabled Effects"));

        controlsColumn.addButton("Set Disabled Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setDisabledIcon(Styles.DISABLED_ICON_LOGO);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Disabled Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button.getIcon() != null) {
                            button.setDisabledIcon(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Disabled Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledForeground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Disabled Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledForeground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Disabled Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledBackground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Disabled Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledBackground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Disabled Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Font font = StyleUtil.randomFont();
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledFont(font);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Disabled Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledFont(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Disabled Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledBackgroundImage(Styles.BUTTON_DISABLED_BACKGROUND_IMAGE);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Disabled Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setDisabledBackgroundImage(null);
                    }
                });
            }
        });
        
        // Text Position

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Text Position"));

        controlsColumn.addButton("TextPosition = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(null);
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextPosition(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                    }
                });
            }
        });
        
        // Text Alignment

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Text Alignment"));

        controlsColumn.addButton("TextAlignment = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(null);
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Center (V)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.CENTER));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Center (H)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setTextAlignment(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                    }
                });
            }
        });
        
        // Alignment

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Alignment"));

        controlsColumn.addButton("Alignment = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Alignment = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("Alignment = Center (H)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("Alignment = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("Alignment = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("Alignment = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setAlignment(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                    }
                });
            }
        });
        
        // Icon/Text Margin

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Icon/Text Margin"));

        controlsColumn.addButton("IconTextMargin = default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(null);
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(new Extent(0));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 1px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(new Extent(1));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 2px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(new Extent(2));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 10px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(new Extent(10));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 1in", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setIconTextMargin(new Extent(1, Extent.IN));
                    }
                });
            }
        });

        // Create 'ToggleButton Controls Group'
        
        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("General ToggleButton Controls"));
        
        controlsColumn.addButton("Selected = False", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setSelected(false);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Selected = True", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setSelected(true);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Custom State Icons", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ToggleButton toggleButton = (ToggleButton) button;
                            toggleButton.setStateIcon(Styles.RG_STATE_ICON);
                            toggleButton.setSelectedStateIcon(Styles.RG_SELECTED_STATE_ICON);
                            toggleButton.setPressedStateIcon(Styles.RG_PRESSED_STATE_ICON);
                            toggleButton.setPressedSelectedStateIcon(Styles.RG_PRESSED_SELECTED_STATE_ICON);
                            toggleButton.setRolloverStateIcon(Styles.RG_ROLLOVER_STATE_ICON);
                            toggleButton.setRolloverSelectedStateIcon(Styles.RG_ROLLOVER_SELECTED_STATE_ICON);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Custom State Icons", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ToggleButton toggleButton = (ToggleButton) button;
                            toggleButton.setStateIcon(null);
                            toggleButton.setSelectedStateIcon(null);
                            toggleButton.setPressedStateIcon(null);
                            toggleButton.setPressedSelectedStateIcon(null);
                            toggleButton.setRolloverStateIcon(null);
                            toggleButton.setRolloverSelectedStateIcon(null);
                        }
                    }
                });
            }
        });
        
        // ToggleButton State Position

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("ToggleButton State Position"));
        
        controlsColumn.addButton("StatePosition = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StatePosition = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStatePosition(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        
        // ToggleButton State Alignment

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("ToggleButton State Alignment"));
        
        controlsColumn.addButton("StateAlignment = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Center (V)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.DEFAULT, Alignment.CENTER));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Center (H)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateAlignment = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateAlignment(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                        }
                    }
                });
            }
        });

        
        // State Margin

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("State Margin"));

        controlsColumn.addButton("StateMargin = default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(null);
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateMargin = 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(new Extent(0));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateMargin = 1px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(new Extent(1));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateMargin = 2px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(new Extent(2));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateMargin = 10px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(new Extent(10));
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("StateMargin = 1in", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        if (button instanceof ToggleButton) {
                            ((ToggleButton) button).setStateMargin(new Extent(1, Extent.IN));
                        }
                    }
                });
            }
        });

        // Localization

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Localization"));
        
        controlsColumn.addButton("Locale = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLocale(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Locale = US", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLocale(Locale.US);
                    }
                });
            }
        });
        controlsColumn.addButton("Locale = HEBREW (RTL)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLocale(new Locale("iw"));
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLayoutDirection(null);
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = LTR", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLayoutDirection(LayoutDirection.LTR);
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = RTL", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(AbstractButton button) {
                        button.setLayoutDirection(LayoutDirection.RTL);
                    }
                });
            }
        });
    }
    
    public void apply(Applicator applicator) {
        AbstractButton[] buttons = (AbstractButton[]) buttonList.toArray(new AbstractButton[buttonList.size()]);
        for (int i = 0; i < buttons.length; ++i) {
            applicator.apply(buttons[i]);
        }
    }
}
