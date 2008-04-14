HelloWorldApp = Core.extend(Echo.Application, {

    $construct: function() {
        Echo.Application.call(this);
        var label = new Echo.Label({
            text: "Hello, world!"
        });
        this.rootComponent.add(label);
    }
});

init = function() {
    var app = new HelloWorldApp();
    var client = new Echo.FreeClient(app, document.getElementById("rootArea"));
    client.init();
};
