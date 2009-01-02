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

package chatclient;

import java.text.DateFormat;
import java.text.MessageFormat;
import java.util.Date;
import java.util.Locale;
import java.util.HashMap;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import nextapp.echo.app.ApplicationInstance;

/**
 * A utility class that provides resources for obtaining localized messages.
 */
public class Messages {
                                               
    private static final String BUNDLE_NAME = "chatclient.resource.localization.Messages";
    
    /**
     * A map which contains <code>DateFormat</code> objects for various 
     * locales.
     */
    private static final Map DATE_FORMAT_MEDIUM_MAP = new HashMap();
    
    /**
     * Formats a date with the specified locale.
     * 
     * @param date the date to be formatted.
     * @return a localized String representation of the date
     */
    public static final String formatDateTimeMedium(Date date) {
        Locale locale = ApplicationInstance.getActive().getLocale();
        DateFormat df = (DateFormat) DATE_FORMAT_MEDIUM_MAP.get(locale);
        if (df == null) {
            df = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.MEDIUM, locale);
            DATE_FORMAT_MEDIUM_MAP.put(locale, df);
        }
        return date == null ? null : df.format(date);
    }
    
    /**
     * Returns a localized formatted message.  This method conveniently wraps
     * a call to a MessageFormat object.
     * 
     * @param key the key of the message to be returned
     * @param arguments an array of arguments to be inserted into the message
     */
    public static String getFormattedString(String key, Object[] arguments) {
        Locale locale = ApplicationInstance.getActive().getLocale();
        String template = getString(key);
        MessageFormat messageFormat = new MessageFormat(template);
        messageFormat.setLocale(locale);
        return messageFormat.format(arguments, new StringBuffer(), null).toString();
    }
    
    /**
     * Returns localized text.
     * 
     * @param key the key of the text to be returned
     * @return the appropriate localized text (if the key is not defined, 
     *         the string "!key!" is returned)
     */
    public static String getString(String key) {
        try {
            Locale locale = ApplicationInstance.getActive().getLocale();
            ResourceBundle resource = ResourceBundle.getBundle(BUNDLE_NAME, locale);
            return resource.getString(key);
        } catch (MissingResourceException e) {
            return '!' + key + '!';
        }
    }

    /** Non-instantiable class. */
    private Messages() { }
}
