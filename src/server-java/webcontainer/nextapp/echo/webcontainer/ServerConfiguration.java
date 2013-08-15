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

package nextapp.echo.webcontainer;

import java.util.Map;

/**
 * Holds configuration values that are read from system properties and from servlet
 * init parameters. System properties have precedence over init parameters.
 */
public class ServerConfiguration {
    /**
     * Debug mode
     */
    public static boolean DEBUG;

    /**
     * Flag indicating whether client/server messages should be dumped to console.
     */
    public static boolean DEBUG_PRINT_MESSAGES_TO_CONSOLE;

    /**
     * Toggle to enable GZIP compression for MS IE Browser via property 'echo.allowiecompression'
     */
    public static boolean ALLOW_IE_COMPRESSION;

    /**
     * Toggle to disable JavaScript compression via property 'echo.javascript.compression'
     */
    public static boolean JAVASCRIPT_COMPRESSION_ENABLED;

    /**
     * Include the meta tag http-equiv"X-UA-Compatible" content="IE=edge", which tells IE to always use
     * the latest rendering engine available, instead of compatibility mode.
     */
    public static boolean IE_EDGE_MODE;

    /**
     * Message to display when the browser does not have JavaScript enabled.
     */
    public static String NOSCRIPT_MESSAGE;

    /**
     * URL to display as link following the message when JavaScript is disabled.
     */
    public static String NOSCRIPT_URL;

    static {
        // Initialize configuration with System properties, if available
        readConfiguration(null);
    }

    /**
     * Reads the configuration from system properties and servlet init parameters.
     *
     * @param initParameters optional servlet init parameters
     */
    private static void readConfiguration(Map initParameters) {
        DEBUG = getConfigValue("echo.debug", initParameters, false);
        DEBUG_PRINT_MESSAGES_TO_CONSOLE = getConfigValue("echo.syncdump", initParameters, false);
        ALLOW_IE_COMPRESSION = getConfigValue("echo.allowiecompression", initParameters, false);
        JAVASCRIPT_COMPRESSION_ENABLED = getConfigValue("echo.javascript.compression", initParameters, false);
        IE_EDGE_MODE = getConfigValue("echo.ie-edge-mode", initParameters, true);
        NOSCRIPT_MESSAGE = getConfigValue("echo.noscript.message", initParameters, "This site only works with JavaScript " +
                "enabled. Please enable JavaScript and reload the page. Hints how to enable JavaScript can be found at: ");
        NOSCRIPT_URL = getConfigValue("echo.noscript.url", initParameters, "http://www.enable-javascript.com/");
    }

    /**
     * Update configuration with servlet init parameters
     * @param initParameters
     */
    public static void adoptServletConfiguration(Map initParameters) {
        readConfiguration(initParameters);
    }

    /**
     * Returns the configuration value for the given name.
     *
     * @param name name of the configuration value
     * @param initParameters map of servlet init parameters
     * @param defaultValue default value, if neither a system property nor a servlet init parameter exists
     * @return the value of the configuration parameter with the given name
     */
    private static String getConfigValue(String name, Map initParameters, String defaultValue) {
        if (System.getProperties().containsKey(name)) {
            return System.getProperty(name);
        }
        else if (initParameters != null && initParameters.containsKey(name)) {
            return (String)initParameters.get(name);
        }
        return defaultValue;
    }

    private static boolean getConfigValue(String name, Map initParameters, boolean defaultValue) {
        return Boolean.valueOf(getConfigValue(name, initParameters, String.valueOf(defaultValue))).booleanValue();
    }
}
