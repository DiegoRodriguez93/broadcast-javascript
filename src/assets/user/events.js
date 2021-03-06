import helpers from "./helpers.js";

window.addEventListener("load", () => {
  //When the chat icon is clicked
  document
    .querySelector("#toggle-chat-panel")
    .addEventListener("click", (e) => {
      let chatElem = document.querySelector("#chat-panel");
      let mainSecElem = document.querySelector("#main-section");

      if (chatElem.classList.contains("chat-opened")) {
        chatElem.setAttribute("hidden", true);
        mainSecElem.classList.remove("col-md-9");
        mainSecElem.classList.add("col-md-12");
        chatElem.classList.remove("chat-opened");
      } else {
        chatElem.attributes.removeNamedItem("hidden");
        mainSecElem.classList.remove("col-md-12");
        mainSecElem.classList.add("col-md-9");
        chatElem.classList.add("chat-opened");
        try {
          document.getElementById("chat-input").focus();
        } catch {}
      }

      //remove the 'New' badge on chat icon (if any) once chat is opened.
      setTimeout(() => {
        if (
          document
            .querySelector("#chat-panel")
            .classList.contains("chat-opened")
        ) {
          helpers.toggleChatNotificationBadge();
        }
      }, 300);
    });

  //When the 'Enter room' button is clicked.
  document.getElementById("enter-room").addEventListener("click", (e) => {
    e.preventDefault();

    let name = document.querySelector("#username").value;

    if (name) {
      //remove error message, if any
      document.querySelector("#err-msg-username").innerHTML = "";

      //save the user's name in localStorage
      try {
        localStorage.setItem("username", name);
      } catch (error) {
        Swal.fire(
          "error",
          "No puede participar en el chat si no tiene las cookies activadas, tampoco podra ver si el emisor comparte pantalla, si esta en una pestaña de incognito pruebe salir e ingresar de modo no incognito, en caso contrario contacte un administrador soporte@ajedrezlatino.com",
          "error"
        );
        console.log("Cookies are disabled");
      }

      //reload room
      location.reload();
    } else {
      document.querySelector("#err-msg-username").innerHTML =
        "Por favor ingresa tu nombre";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("expand-remote-video")) {
      helpers.maximiseStream(e);
    } else if (e.target && e.target.classList.contains("mute-remote-mic")) {
      helpers.singleStreamToggleMute(e);
    } else if (e.target && e.target.classList.contains("stop-remote-video")) {
      helpers.singleStreamTogglePlay(e);
    }
  });
});
