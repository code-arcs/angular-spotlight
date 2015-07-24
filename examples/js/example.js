$(function() {
    var style = $('#angular-theme');

    $('.btn-theme').on('click', function(e) {
        e.stopPropagation();

        var theme = $(this).data('theme');
        var cssForTheme = getCssForTheme(theme);
        style.attr('href', cssForTheme.style);
        $('body').css('background-image', 'url(' + cssForTheme.background + ')')
    });

    function getCssForTheme(name) {
        var theme = {
            material: {
                style: 'css/materialTheme.min.css',
                background: 'img/materialBackground.png'
            },
            dark: {
                style: 'css/darkTheme.min.css',
                background: 'img/background.jpg'
            },
            light: {
                style: 'css/lightTheme.min.css',
                background: 'img/background.jpg'
            }
        };

        return theme[name] || theme['material'];
    }
});