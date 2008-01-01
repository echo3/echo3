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

package nextapp.echo.testapp.interactive;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.layout.GridLayoutData;

/**
 * A layout component based on a <code>Grid</code> which provides a two column
 * layout, with labels in each left-hand cell describing test content in the
 * right-hand cells. 
 */
public class TestGrid extends Grid {
    
    private static final Color HEADER_CELL_BACKGROUND = new Color(0x9f9fcf);
    private static final Color DESCRIPTOR_CELL_BACKGROUND = new Color(0xffffcf);
    private static final Border BORDER = new Border(2, new Color(0xcfcfff), Border.STYLE_GROOVE);
    
    /**
     * Creates a new <code>TestGrid</code>.
     */
    public TestGrid() {
        super(2);
        setInsets(new Insets(10, 5));
        setBorder(BORDER);
    }
    
    /**
     * Adds a header row to the <code>TestGrid</code>.
     * 
     * @param text the header text
     */
    public void addHeaderRow(String text) {
        Label label = new Label(text);
        GridLayoutData layoutData = new GridLayoutData();
        layoutData.setBackground(HEADER_CELL_BACKGROUND);
        layoutData.setColumnSpan(2);
        label.setLayoutData(layoutData);
        add(label);
    }
    
    /**
     * Adds a test item row cell to the <code>TestGrid</code>
     * 
     * @param descriptor a description of the item
     * @param testComponent the item <code>Component</code>
     */
    public void addTestRow(String descriptor, Component testComponent) {
        Label label = new Label(descriptor);
        GridLayoutData layoutData = new GridLayoutData();
        layoutData.setBackground(DESCRIPTOR_CELL_BACKGROUND);
        label.setLayoutData(layoutData);
        add(label);
        add(testComponent);
    }

}
