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

import java.util.Locale;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Column;
import nextapp.echo.app.LayoutDirection;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

/**
 * An interactive test for <code>Label</code>s.
 */
public class LabelTest extends SplitPane {
    
    private interface Applicator {
        
        public void apply(Label label);
    }
    
    private Column testColumn;
    
    public LabelTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;
        
        Column controlGroupsColumn = new Column();
        controlGroupsColumn.setCellSpacing(new Extent(5));
        controlGroupsColumn.setStyleName("TestControlsColumn");
        add(controlGroupsColumn);
        
        testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);
        
        final Label iconLabel = new Label(Styles.ICON_LOGO);
        testColumn.add(iconLabel);
        
        final Label textLabel = new Label("Test Label");
        testColumn.add(textLabel);
        
        final Label iconTextLabel = new Label("Test Label", Styles.ICON_LOGO);
        testColumn.add(iconTextLabel);

        ButtonColumn controlsColumn;
        
        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);

        // Base Properties

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Base Properties"));
        controlsColumn.addButton("Toggle Container Cell Spacing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testColumn.getCellSpacing() == null) {
                    testColumn.setCellSpacing(new Extent(15));
                } else {
                    testColumn.setCellSpacing(null);
                }
            }
        });
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setForeground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setForeground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Color color = StyleUtil.randomColor();
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setBackground(color);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setBackground(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final Font font = StyleUtil.randomFont();
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setFont(font);
                    }
                });
            }
        });
        controlsColumn.addButton("Clear Font", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setFont(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Short", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        if (label.getText() != null) {
                            label.setText("Test Label");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Long", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        if (label.getText() != null) {
                            label.setText("This is a longer label.  The quick brown fox jumps over the lazy brown dog.");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = <HTML>", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        if (label.getText() != null) {
                            label.setText("<foo>\"foo!\" & foo!</foo>");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Text = Formatted", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        if (label.getText() != null) {
                            label.setText("This is a label that uses newlines, tabs and multiple spaces:\nThe\tquick   brown  fox jumps  over   the\tlazy   brown  dog.");
                        }
                    }
                });
            }
        });
        controlsColumn.addButton("Set Format Whitespace = true", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setFormatWhitespace(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Format Whitespace = false", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setFormatWhitespace(false);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Line Wrap = true", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLineWrap(true);
                    }
                });
            }
        });
        controlsColumn.addButton("Set Line Wrap = false", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLineWrap(false);
                    }
                });
            }
        });
        controlsColumn.addButton("Toggle ToolTip Text", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        if (label.getToolTipText() == null) {
                            label.setToolTipText("This is a tool tip.");
                        } else {
                            label.setToolTipText(null);
                        }
                    }
                });
            }
        });

        // Alignment & Positioning

        controlsColumn = new ButtonColumn();
        controlGroupsColumn.add(controlsColumn);
        
        controlsColumn.add(new Label("Alignment & Positioning"));
        controlsColumn.addButton("TextPosition = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(null);
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextPosition = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextPosition(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(null);
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.TOP));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Center(V)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.CENTER));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.DEFAULT, Alignment.BOTTOM));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.LEFT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Center (H)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.RIGHT, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Leading", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.LEADING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("TextAlignment = Trailing", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setTextAlignment(new Alignment(Alignment.TRAILING, Alignment.DEFAULT));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(null);
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(0));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 1px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(1));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 2px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(2));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 3px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(3));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 4px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(4));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(5));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 10px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(10));
                    }
                });
            }
        });
        controlsColumn.addButton("IconTextMargin = 1in", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setIconTextMargin(new Extent(1, Extent.IN));
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
                    public void apply(Label label) {
                        label.setLocale(null);
                    }
                });
            }
        });
        controlsColumn.addButton("Locale = US", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLocale(Locale.US);
                    }
                });
            }
        });
        controlsColumn.addButton("Locale = HEBREW (RTL)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLocale(new Locale("iw"));
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLayoutDirection(null);
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = LTR", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLayoutDirection(LayoutDirection.LTR);
                    }
                });
            }
        });
        controlsColumn.addButton("LayoutDirection = RTL", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                apply(new Applicator() {
                    public void apply(Label label) {
                        label.setLayoutDirection(LayoutDirection.RTL);
                    }
                });
            }
        });
    }

    public void apply(Applicator applicator) {
        Component[] components = testColumn.getComponents();
        for (int i = 0; i < components.length; ++i) {
            applicator.apply((Label) components[i]);
        }
    }
}
