$(document).ready(function () {
  $(".nav-link.dropdown-toggle").on("click", function (e) {
    e.preventDefault(); // Prevent the default behavior (link click)
    var selectedPage = $(this).attr("href");
    console.log("Navigating to: " + selectedPage);
    window.location.href = selectedPage; // Navigate to the selected page
    $(this).dropdown("toggle"); // Open the dropdown menu programmatically
  });
});

// collapse navbar when anchor link is clicked in portfolio submenu
$(".dropdown-item").on("click", function (event) {
  $(".navbar-collapse").collapse("hide");
});

// modal scripts
document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("editModal");

  function openEditModal() {
    modal.style.display = "block";
    // Add event listener to close modal on click outside
    document.addEventListener("mousedown", outsideClick);
  }

  function outsideClick(event) {
    if (!modal.contains(event.target)) {
      closeEditModal();
    }
  }

  function closeEditModal() {
    modal.style.display = "none";
    // Remove the event listener after closing the modal
    document.removeEventListener("mousedown", outsideClick);
  }
});

// modal for updating painting entries
function openEditModal(
  id,
  name,
  dimensions,
  classification,
  mediaType,
  location,
  availability
) {
  var modal = document.getElementById("editModal");
  var modalContent = modal.querySelector(".modal-content");

  document.getElementById("editName").value = name;
  document.getElementById("editDimensions").value = dimensions;
  document.getElementById("editClassification").value = classification;
  document.getElementById("editMediaType").value = mediaType;
  document.getElementById("editLocation").value = location;

  // Set the painting ID in the form action
  document.getElementById("editForm").action = `/paintings/update/${id}`;

  // Select the correct radio button based on availability
  var availableRadio = document.getElementById("editAvailable");
  var soldRadio = document.getElementById("editSold");

  // Set the value attribute of the radio buttons
  availableRadio.value = 1;
  soldRadio.value = 0;

  // Check the radio button based on availability
  availableRadio.checked = availability == 1;
  soldRadio.checked = availability == 0;

  modal.style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

// ADJUSTING ORDER
async function moveOrderUp(paintingId) {
  try {
    const response = await fetch(`/paintings/move-order/${paintingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ direction: "up" }),
    });

    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function moveOrderDown(paintingId) {
  try {
    const response = await fetch(`/paintings/move-order/${paintingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ direction: "down" }),
    });

    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  } catch (error) {
    console.error("Error:", error);
  }
}

// delete painting
function deletePainting(id) {
  if (confirm("Are you sure you want to delete this painting?")) {
    fetch(`/paintings/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        // Assuming data.success is a boolean indicating whether the deletion was successful
        if (data.success) {
          // Reload the page or update the UI as needed
          location.reload();
        } else {
          console.error("Failed to delete painting");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
