ArcTest = { };

/**
 * TestComponent component.
 */
ArcTest.TestComponent = Core.extend(Echo.Component, {

    componentType: "ArcTestComponent",
    
    $load: function() {
        Echo.ComponentFactory.registerType("ArcTestComponent", this);
    }
});

/**
 * TestContainer component.
 */
ArcTest.TestContainer = Core.extend(Echo.Component, {

    componentType: "ArcTestContainer",

    $load: function() {
        Echo.ComponentFactory.registerType("ArcTestContainer", this);
    }
});

/**
 * TestPane component.
 */
ArcTest.TestPane = Core.extend(Echo.Component, {

    componentType: "ArcTestPane",

    $load: function() {
        Echo.ComponentFactory.registerType("ArcTestPane", this);
    }
});

ArcTest.ComponentSync = { };

/**
 * Component rendering peer: TestComponent
 */
ArcTest.ComponentSync.TestComponent = Core.extend(Echo.Arc.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("ArcTestComponent", this);
    },

    $construct: function() { },

    createComponent: function() {
        var label = new Echo.Label();
        label.set("text", "This is a freeclient label: " + this.component.render("text"));
        return label;
    }
});

/**
 * Component rendering peer: TestContainer
 */
ArcTest.ComponentSync.TestContainer = Core.extend(Echo.Arc.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("ArcTestContainer", this);
    },

    $construct: function() { },
    
    createComponent: function() {
        var contentPane = new Echo.ContentPane();
        for (var i = 0; i < this.component.children.length; ++i) {
            var windowPane = new Echo.WindowPane({
                positionX: 120 * (i % 4),
                positionY: 120 * parseInt(i / 4),
                width: 100,
                height: 100
            });
            contentPane.add(windowPane);
            
            var childContainer = new Echo.Arc.ChildContainer({
                component: this.component.children[i]
            });
            windowPane.add(childContainer);
        }
        return contentPane;
    },
    
    getDomainElement: function() {
        return this._divElement;
    },
    
    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        this._divElement.style.cssText 
                = "position:relative; width:100%; height:450px; background-color: #3f3f6f; border: 1px #3f3f6f outset";
        parentElement.appendChild(this._divElement);
    },
    
    renderDispose: function(update) {
        Echo.Arc.ComponentSync.prototype.renderDispose.call(this, update);
        this._divElement = null;
    }
});

/**
 * Component rendering peer: TestPane
 */
ArcTest.ComponentSync.TestPane = Core.extend(Echo.Arc.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("ArcTestPane", this);
    },

    $construct: function() {
        this._addedLabelCount = 0;
    },

    createComponent: function() {
        var contentPane = new Echo.ContentPane();
        
        var windowPane = new Echo.WindowPane();
        windowPane.set("title", "A FreeClient WindowPane");
        contentPane.add(windowPane);
        
        var mainColumn = new Echo.Column();
        mainColumn.set("cellSpacing", 5);
        mainColumn.set("insets", 10);
        windowPane.add(mainColumn);
        
        var controlsRow = new Echo.Row();
        controlsRow.set("cellSpacing", 10);
        mainColumn.add(controlsRow);
        
        var addButton = new Echo.Button();
        addButton.set("text", "Add Label");
        addButton.set("background", "#00ff00");
        addButton.addListener("action", Core.method(this, this._processAddButton));
        controlsRow.add(addButton);
    
        var removeButton = new Echo.Button();
        removeButton.set("text", "Remove Label");
        removeButton.set("background", "#ff0000");
        removeButton.addListener("action", Core.method(this, this._processRemoveButton));
        controlsRow.add(removeButton);
        
        this._testColumn = new Echo.Column();
        mainColumn.add(this._testColumn);
    
        return contentPane;
    },
    
    getDomainElement:  function() {
        return this._divElement;
    },
    
    _processAddButton: function(e) {
        var label = new Echo.Label();
        label.set("text", "Added Label " + ++this._addedLabelCount);
        this._testColumn.add(label);
    },
    
    _processRemoveButton: function(e) {
        var count = this._testColumn.getComponentCount();
        if (count > 0) {
            this._testColumn.remove(count - 1);
        }
    },
    
    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        this._divElement.style.cssText 
                = "position:relative; width:100%; height:450px; background-color: #3f3f6f; border: 1px #3f3f6f outset";
        parentElement.appendChild(this._divElement);
    },
    
    renderDispose: function(update) {
        Echo.Arc.ComponentSync.prototype.renderDispose.call(this, update);
        this._testColumn = null;
        this._divElement = null;
    }
});
