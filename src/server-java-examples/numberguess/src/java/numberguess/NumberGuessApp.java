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

package numberguess;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.Column;
import nextapp.echo.app.TextField;
import nextapp.echo.app.Window;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.ColumnLayoutData;

/**
 * Guess-a-number Tutorial Application.
 */
public class NumberGuessApp extends ApplicationInstance {

    private Window window;
    
    /**
     * Displays a congratulatory message to the user when s/he has guessed
     * the correct number.
     * 
     * @param numberOfTries the number of tries it took the user to guess the
     *        correct answer.
     */
    void congratulate(int numberOfTries) {
        window.setContent(new CongratulationsPane(numberOfTries));
    }
    
    /**
     * @see nextapp.echo.app.ApplicationInstance#init()
     */
    public Window init() {
        window = new Window();
        window.setTitle("Echo Guess-A-Number");
        startNewGame();
        return window;
    }

    /**
     * Starts a new game:
     * Sets content of Window to a new <code>GamePane</code>.
     */
    void startNewGame() {
        // Set the content to be a new GamePane, so the 
        window.setContent(new GamePane());
    }
}

/**
 * A <code>ContentPane</code> which generates a random number and provides the
 * user opportunities to guess it.
 */
class GamePane extends ContentPane 
implements ActionListener {

    /** Randomly generated number between 1 and 100 inclusive. */
    private int randomNumber = ((int) Math.floor(Math.random() * 100)) + 1;
    
    /** The current lowest sensible guess, based on previous guesses. */
    private int lowerBound = 1;

    /** The current highest sensible guess, based on previous guesses. */
    private int upperBound = 100;
    
    /** The number of guesses made in the current game. */
    private int numberOfTries = 0;
    
    /** <code>TextField</code> into which guesses are entered. */
    private TextField guessEntryField;
    
    /** 
     * <code>Label</code> displaying the current "status".  Initially blank, 
     * this label will inform the user whether his/her last guess was too 
     * high, too low, or simply invalid.
     */ 
    private Label statusLabel = new Label();
    
    /**
     * <code>Label</code> indicating the total number of guesses made so far.
     */
    private Label countLabel = new Label("You have made no guesses.");
    
    /**
     * <code>Label</code> prompting the user to enter a new guess.  The text of
     * this label will change as the user makes guesses to reflect the updated
     * "sensible" range of possible guesses.
     */
    private Label promptLabel = new Label(
            "Guess a number between 1 and 100: ");
    
    /**
     * Creates a new <code>GamePane</code>.
     */
    GamePane() {
        super();
        
        Column layoutColumn = new Column();
        layoutColumn.setInsets(new Insets(30));
        layoutColumn.setCellSpacing(new Extent(10));
        add(layoutColumn);
        
        layoutColumn.add(new Label(
                new ResourceImageReference("/numberguess/TitleBanner.png")));
        layoutColumn.add(statusLabel);
        layoutColumn.add(countLabel);
        layoutColumn.add(promptLabel);
        
        guessEntryField = new TextField();
        guessEntryField.setForeground(Color.WHITE);
        guessEntryField.setBackground(Color.BLUE);
        ColumnLayoutData columnLayoutData = new ColumnLayoutData();
        columnLayoutData.setInsets(new Insets(20, 0));
        guessEntryField.setLayoutData(columnLayoutData);
        guessEntryField.setActionCommand("submit guess");
        guessEntryField.addActionListener(this);
        layoutColumn.add(guessEntryField);
        
        Button submitButton = new Button("Submit Your Guess");
        submitButton.setActionCommand("submit guess");
        submitButton.setForeground(Color.BLACK);
        submitButton.setBackground(Color.GREEN);
        submitButton.setWidth(new Extent(200));
        submitButton.addActionListener(this);
        layoutColumn.add(submitButton);
        
        Button newGameButton  = new Button("Start a New Game");
        newGameButton.setActionCommand("new game");
        newGameButton.setForeground(Color.WHITE);
        newGameButton.setBackground(Color.RED);
        newGameButton.setWidth(new Extent(200));
        newGameButton.addActionListener(this);
        layoutColumn.add(newGameButton);
    }
    
    /**
     * @see nextapp.echo.app.event.ActionListener#actionPerformed(
     *      nextapp.echo.app.event.ActionEvent)
     */
    public void actionPerformed(ActionEvent e) {
        if (e.getActionCommand().equals("new game")) {
            ((NumberGuessApp) ApplicationInstance.getActive()).startNewGame();
        } else if (e.getActionCommand().equals("submit guess")) {
            processGuess();
        }
    }
    
    /**
     * Processes a user's guess.
     */
    private void processGuess() {
        
        int guess;
        try {
            guess = Integer.parseInt(guessEntryField.getDocument().getText());
        } catch (NumberFormatException ex) {
            statusLabel.setText("Your guess was not valid.");
            return;
        }

        ++numberOfTries;

        if (guess == randomNumber) {
            ((NumberGuessApp) ApplicationInstance.getActive())
                    .congratulate(numberOfTries);
            return;
        }
        
        if (guess < 1 || guess > 100) {
            statusLabel.setText("Your guess, " + guess 
                    + " was not between 1 and 100.");
        } else if (guess < randomNumber) {
            if (guess >= lowerBound) {
                lowerBound = guess + 1;
            }
            statusLabel.setText("Your guess, " + guess 
                    + " was too low.  Try again:");
        } else if (guess > randomNumber) {
            statusLabel.setText("Your guess, " + guess 
                    + " was too high.  Try again:");
            if (guess <= upperBound) {
                upperBound = guess - 1;
            }
        }

        // Update number of tries label.
        if (numberOfTries == 1) {
            countLabel.setText("You have made 1 guess.");
        } else {
            countLabel.setText("You have made " + numberOfTries + " guesses.");
        }
        
        // Update prompt label to reflect the new sensible range of numbers.
        promptLabel.setText("Guess a number between " + lowerBound + " and " 
                + upperBound + ": ");
    }
}

/**
 * A <code>ContentPane</code> which presents a congratulatory message to the
 * player when the correct number has been guessed.
 */
class CongratulationsPane extends ContentPane
implements ActionListener {

    /**
     * Creates a new <code>CongratulationsPane</code>.
     * 
     * @param numberOfTries the number of tries it took the user to guess the
     *        correct answer.
     */
    CongratulationsPane(int numberOfTries) {
        Column layoutColumn = new Column();
        layoutColumn.setInsets(new Insets(30));
        layoutColumn.setCellSpacing(new Extent(30));
        add(layoutColumn);
        
        layoutColumn.add(new Label(new ResourceImageReference(
                "/numberguess/CongratulationsBanner.png")));
        layoutColumn.add(new Label("You got the correct answer in " 
                + numberOfTries + (numberOfTries == 1 ? " try." : " tries.")));

        Button button = new Button("Play Again");
        button.setForeground(Color.WHITE);
        button.setBackground(Color.RED);
        button.setWidth(new Extent(200));
        button.addActionListener(this);
        layoutColumn.add(button);
    }

    /**
     * @see nextapp.echo.app.event.ActionListener
     *      #actionPerformed(nextapp.echo.app.event.ActionEvent)
     */
    public void actionPerformed(ActionEvent e) {
        ((NumberGuessApp) ApplicationInstance.getActive()).startNewGame();
    }
}
