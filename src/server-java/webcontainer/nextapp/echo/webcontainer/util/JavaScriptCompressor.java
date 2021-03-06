/*
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
 * 
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.webcontainer.util;

/**
 * Compresses a String containing JavaScript by removing comments and 
 * whitespace.
 */
public class JavaScriptCompressor {

    private static final char LINE_FEED = '\n';
    private static final char CARRIAGE_RETURN = '\r';
    private static final char SPACE = ' ';
    private static final char TAB = '\t';

    /**
     * Compresses a String containing JavaScript by removing comments and 
     * whitespace.
     * 
     * @param script the String to compress
     * @return a compressed version
     */
    public static String compress(String script) {
        JavaScriptCompressor jsc = new JavaScriptCompressor(script);
        return jsc.outputBuffer.toString();
    }

    /** Original JavaScript text. */
    private String script;
    
    /** 
     * Compressed output buffer.
     * This buffer may only be modified by invoking the <code>append()</code>
     * method.
     */
    private StringBuffer outputBuffer;
    
    /** Current parser cursor position in original text. */
    private int pos;
    
    /** Character at parser cursor position. */
    private char ch;
    
    /** Last character appended to buffer. */
    private char lastAppend;

    /** Flag indicating if end-of-buffer has been reached. */
    private boolean endReached;

    /** Flag indicating whether content has been appended after last identifier. */
    private boolean contentAppendedAfterLastIdentifier = true;

    /**
     * Creates a new <code>JavaScriptCompressor</code> instance.
     * 
     * @param script
     */
    private JavaScriptCompressor(String script) {
        this.script = script;
        outputBuffer = new StringBuffer(script.length());
        nextChar();

        while (!endReached) {
            if (Character.isJavaIdentifierStart(ch)) {
                renderIdentifier();
            } else if (ch == ' ') {
                skipWhiteSpace();
            } else if (isWhitespace()) {
                // Compress whitespace
                skipWhiteSpace();
            } else if (ch == '\\') {
                // Skip backslash and subsequent character.
                append(ch);
                nextChar();
                append(ch);
                nextChar();
            } else if ((ch == '"') || (ch == '\'')) {
                // Handle strings
                renderString();
            } else if (ch == '/') {
                // Handle comments
                nextChar();
                if (ch == '/') {
                    nextChar();
                    skipLineComment();
                } else if (ch == '*') {
                    nextChar();
                    skipBlockComment();
                } else {
                    append('/');
                }
            } else {
                append(ch);
                nextChar();
            }
        }
    }

    /**
     * Append character to output.
     * 
     * @param ch the character to append
     */
    private void append(char ch) {
        lastAppend = ch;
        outputBuffer.append(ch);
        contentAppendedAfterLastIdentifier = true;
    }
    
    /**
     * Determines if current character is whitespace.
     * 
     * @return true if the character is whitespace
     */
    private boolean isWhitespace() {
        return ch == CARRIAGE_RETURN || ch == SPACE || ch == TAB || ch == LINE_FEED;        
    }

    /**
     * Load next character.
     */
    private void nextChar() {
        if (!endReached) {
            if (pos < script.length()) {
                ch = script.charAt(pos++);
            } else {
                endReached = true;
                ch = 0;
            }
        }
    }

    /**
     * Adds an identifier to output.
     */
    private void renderIdentifier() {
        if (!contentAppendedAfterLastIdentifier)
            append(SPACE);
        append(ch);
        nextChar();
        while (Character.isJavaIdentifierPart(ch)) {
            append(ch);
            nextChar();
        }
        contentAppendedAfterLastIdentifier = false;
    }

    /**
     * Adds quoted String starting at current character to output.
     */
    private void renderString() {
        char startCh = ch; // Save quote char
        append(ch);
        nextChar();
        while (true) {
            if ((ch == LINE_FEED) || (ch == CARRIAGE_RETURN) || (endReached)) {
                // JavaScript error: string not terminated
                return;
            } else {
                if (ch == '\\') {
                    append(ch);
                    nextChar();
                    if ((ch == LINE_FEED) || (ch == CARRIAGE_RETURN) || (endReached)) {
                        // JavaScript error: string not terminated
                        return;
                    }
                    append(ch);
                    nextChar();
                } else {
                    append(ch);
                    if (ch == startCh) {
                        nextChar();
                        return;
                    }
                    nextChar();
                }
            }
        }
    }

    /**
     * Moves cursor past a line comment.
     */
    private void skipLineComment() {
        while ((ch != CARRIAGE_RETURN) && (ch != LINE_FEED)) {
            if (endReached) {
                return;
            }
            nextChar();
        }
    }

    /**
     * Moves cursor past a block comment.
     */
    private void skipBlockComment() {
        while (true) {
            if (endReached) {
                return;
            }
            if (ch == '*') {
                nextChar();
                if (ch == '/') {
                    nextChar();
                    return;
                }
            } else
                nextChar();
        }
    }
    
    /**
     * Renders a new line character, provided previously rendered character 
     * is not a newline.
     */
    private void renderNewLine() {
        if (lastAppend != '\n' && lastAppend != '\r') {
            append('\n');
        }
    }
    
    /**
     * Moves cursor past white space (including newlines).
     */
    private void skipWhiteSpace() {
        if (ch == LINE_FEED || ch == CARRIAGE_RETURN) {
            renderNewLine();
        } else {
            append(ch);
        }
        nextChar();
        while (ch == LINE_FEED || ch == CARRIAGE_RETURN || ch == SPACE || ch == TAB) {
            if (ch == LINE_FEED || ch == CARRIAGE_RETURN) {
                renderNewLine();
            }
            nextChar();
        }
    }
}
