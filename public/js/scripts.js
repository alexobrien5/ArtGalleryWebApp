$(document).ready(function() {
    $('.nav-link.dropdown-toggle').on('click', function(e) {
        e.preventDefault(); // Prevent the default behavior (link click)
        var selectedPage = $(this).attr('href');
        console.log('Navigating to: ' + selectedPage);
        window.location.href = selectedPage; // Navigate to the selected page
        $(this).dropdown('toggle'); // Open the dropdown menu programmatically
    });
});

console.log('this script is running');

if (typeof jQuery == 'undefined') {
    console.log('jquery is not loaded');
} else {
    console.log('jquery is loaded');
}

if (jQuery) {
    console.log('jquery is loaded');
} else {
    console.log('not loaded');
}