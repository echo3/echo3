HelloWorldApp = Core.extend(EchoApp.Application, {

    $construct: function() {
        EchoApp.Application.call(this);
        var label = new EchoApp.Label({
            text: "Hello, world!"
        });
        this.rootComponent.add(label);
    }
});

init = function() {
    var app = new HelloWorldApp();
    var client = new EchoFreeClient(app, document.getElementById("rootArea"));
    client.init();
};
