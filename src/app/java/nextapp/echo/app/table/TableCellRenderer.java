/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.app.table;

import java.io.Serializable;

import nextapp.echo.app.Component;
import nextapp.echo.app.Table;

/**
 * Renders an <code>Object</code> contained at a specific coordinate in 
 * a <code>TableModel</code> into a <code>Component</code> instance.
 */
public interface TableCellRenderer
extends Serializable {
    
    /**
     * Returns a component that will be displayed at the specified coordinate
     * in the table.
     *
     * @param table the <code>Table</code> for which the rendering is occurring
     * @param value the value retrieved from the <code>TableModel</code> for the
     *        specified coordinate
     * @param column the column index to render
     * @param row the row index to render
     * @return a component representation  of the value (This component must 
     *         be unique.  Returning a single instance of a component across
     *         multiple calls to this method will result in undefined 
     *         behavior.)
     */
    public Component getTableCellRendererComponent(Table table, Object value, int column, int row);
}