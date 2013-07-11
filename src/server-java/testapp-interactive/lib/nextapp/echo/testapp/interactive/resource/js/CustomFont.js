function initCustomFont() {
    var newStyle = document.createElement('style');
    var fontFace = 
        "@font-face {" +
            "font-family: 'AlexBrush';" +
            "src: url('?sid=AlexBrushFont') format('woff');" +
        "}";
    var textNode = document.createTextNode(fontFace);
    newStyle.appendChild(textNode);
    document.head.appendChild(newStyle); 
};
initCustomFont();
