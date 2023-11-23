$(document).ready(function() {
    $('.nav-link.dropdown-toggle').on('click', function(e) {
        e.preventDefault(); // Prevent the default behavior (link click)
        var selectedPage = $(this).attr('href');
        console.log('Navigating to: ' + selectedPage);
        window.location.href = selectedPage; // Navigate to the selected page
        $(this).dropdown('toggle'); // Open the dropdown menu programmatically
    });
});

// collapse navbar when anchor link is clicked in portfolio submenu
$('.dropdown-item').on('click', function(event) {
    $('.navbar-collapse').collapse('hide');
});