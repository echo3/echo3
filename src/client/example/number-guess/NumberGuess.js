/**
 * Guess-a-number Tutorial Application.
 */
NumberGuessApp = Core.extend(EchoApp.Application, {

    $construct: function() {
        EchoApp.Application.call(this);
        this.startNewGame();
    },
    
    /**
     * Displays a congratulatory message to the user when s/he 
     * has guessed the correct number.
     * 
     * @param numberOfTries the number of tries it took the 
     *        user to guess the correct answer.
     */
    congratulate: function(numberOfTries) {
        this.rootComponent.removeAll();
        this.rootComponent.add(new NumberGuessApp.Congratulator(
                numberOfTries));
    },
    
    /**
     * Starts a new game:
     * Sets content of Window to a new Game
     */
    startNewGame: function() {
        this.rootComponent.removeAll();
        this.rootComponent.add(new NumberGuessApp.Game());
    }
});

/**
 * A Column which generates a random number and provides the
 * user opportunities to guess it.
 */
NumberGuessApp.Game = Core.extend(EchoApp.Column, {

    /** Randomly generated number between 1 and 100 inclusive. */
    _randomNumber: null,

    /** 
      * The current lowest sensible guess, based on previous 
      * guesses.
      */
    _lowerBound: 1,

    /**
     * The current highest sensible guess, based on previous
     * guesses. 
     */
    _upperBound: 100,

    /** The number of guesses made in the current game. */
    _numberOfTries: 0,

    /** TextField into which guesses are entered. */
    _guessEntryField: null,

    /** 
     * <code>Label</code> displaying the current "status".  
     * Initially blank, this label will inform the user whether
     * his/her last guess was too  high, too low, or simply 
     * invalid.
     */ 
    _statuslabel: null,

    /**
     * Label indicating the total number of guesses made so far.
     */
    _countLabel: null,

    /**
     * Label prompting the user to enter a new guess.  The text 
     * of this label will change as the user makes guesses to 
     * reflect the updated "sensible" range of possible guesses.
     */
    _promptLabel: null,

    $construct: function() {
        this._randomNumber = Math.floor(Math.random() * 100) + 1;
    
        EchoApp.Column.call(this, {
            insets: new EchoApp.Insets(30),
            cellSpacing: new EchoApp.Extent(10),
            children: [
                new EchoApp.Label({
                    icon: new EchoApp.ImageReference(
                            "TitleBanner.png")
                }),

                this._statusLabel = new EchoApp.Label(),
                this._countLabel = new EchoApp.Label(),
                this._promptLabel = new EchoApp.Label(),

                this._guessEntryField = new EchoApp.TextField({
                    background: new EchoApp.Color("#ffffff"),
                    foreground: new EchoApp.Color("#0000ff"),
                    layoutData: new EchoApp.LayoutData({
                        insets: new EchoApp.Insets(0, 20)
                    }),
                    events: {
                        action: Core.method(
                                this, this._processGuess)
                    }
                }),

                new EchoApp.Button({
                    text: "Submit Your Guess",
                    actionCommand: "submit guess",
                    foreground: new EchoApp.Color("#ffffff"),
                    background: new EchoApp.Color("#008f00"),
                    insets: new EchoApp.Insets(3, 10),
                    width: new EchoApp.Extent(200),
                    events: {
                        action: Core.method(this, 
                                this._processGuess)
                    }
                }),

                new EchoApp.Button({
                    text: "Start a New Game",
                    foreground: new EchoApp.Color("#ffffff"),
                    background: new EchoApp.Color("#8f0000"),
                    insets: new EchoApp.Insets(3, 10),
                    width: new EchoApp.Extent(200),
                    events: {
                        action: Core.method(this, 
                                this._startNewGame)
                    }
                })
            ]
        });
    },
    
    /**
     * Processes a user's guess.
     */
    _processGuess: function(e) {
        var guess = parseInt(
                this._guessEntryField.getProperty("text"));
        if (isNaN(guess)) {
            this._statusLabel.setProperty("text", 
                    "Your guess was not valid.");
            return;
        }
        
        ++this._numberOfTries;
        
        if (guess == this._randomNumber) {
            this.application.congratulate(this._numberOfTries);
            return;
        }
        
        if (guess < 1 || guess > 100) {
            this._statusLabel.setProperty("text", "Your guess, "
                    + guess + " was not between 1 and 100.");
        } else if (guess < this._randomNumber) {
            if (guess >= this._lowerBound) {
                this._lowerBound = guess + 1;
            }
            this._statusLabel.setProperty("text", "Your guess, "
                    + guess + " was too low.  Try again:");
        } else if (guess > this._randomNumber) {
            this._statusLabel.setProperty("text", "Your guess, " 
                    + guess + " was too high.  Try again:");
            if (guess <= this._upperBound) {
                this._upperBound = guess - 1;
            }
        }

        // Update number of tries label.
        if (this._numberOfTries == 1) {
            this._countLabel.setProperty("text", 
                    "You have made 1 guess.");
        } else {
            this._countLabel.setProperty("text", "You have made "
                    + this._numberOfTries + " guesses.");
        }
        
        // Update the prompt label to reflect the new sensible 
        // range of numbers.
        this._promptLabel.setProperty("text", 
                "Guess a number between " + this._lowerBound 
                + " and " + this._upperBound + ": ");

    },
    
    _startNewGame: function(e) {
        this.application.startNewGame();
    }
});

/**
 * A Column which presents a congratulatory message to the
 * player when the correct number has been guessed.
 */
NumberGuessApp.Congratulator = Core.extend(EchoApp.Column, {

    /**
     * A Column which presents a congratulatory message to the
     * player when the correct number has been guessed.
     */
    $construct: function(numberOfTries) {
        EchoApp.Column.call(this, {
            insets: new EchoApp.Insets(30),
            cellSpacing: new EchoApp.Extent(30),
            children: [
                new EchoApp.Label({
                    icon: new EchoApp.ImageReference(
                            "CongratulationsBanner.png")
                }),
                new EchoApp.Label({
                    text: "You got the correct answer in " 
                            + numberOfTries + (numberOfTries == 1
                            ? "try." : " tries.")
                }),
                new EchoApp.Button({
                    text: "Play Again",
                    foreground: new EchoApp.Color("#ffffff"),
                    background: new EchoApp.Color("#8f0000"),
                    width: new EchoApp.Extent(200),
                    events: {
                        action: Core.method(
                                this, this._startNewGame)
                    }
                })
            ]
        });
    },
    
    _startNewGame: function(e) {
        this.application.startNewGame();
    }
});

init = function() {
    WebCore.init();
    var app = new NumberGuessApp();
    var client = new EchoFreeClient(app, 
            document.getElementById("rootArea"));
    client.init();
};