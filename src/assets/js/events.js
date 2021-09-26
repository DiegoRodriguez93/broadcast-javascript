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

  //When the video frame is clicked. This will enable picture-in-picture
  document.getElementById("local").addEventListener("click", () => {
    if (!document.pictureInPictureElement) {
      document
        .getElementById("local")
        .requestPictureInPicture()
        .catch((error) => {
          // Video failed to enter Picture-in-Picture mode.
          console.error(error);
        });
    } else {
      document.exitPictureInPicture().catch((error) => {
        // Video failed to leave Picture-in-Picture mode.
        console.error(error);
      });
    }
  });

  //When the 'Create room" is button is clicked
  document.getElementById("create-room").addEventListener("click", (e) => {
    e.preventDefault();

    /* let roomName = document.querySelector("#room-name").value; */
    let roomName = "a";
    let yourName = document.getElementById("your-name").value;
    // TODO: Improve this
    let password = document.getElementById('your-password').value;

    if (roomName && yourName && password === 'Ajedrezlatino2021') {
      //remove error message, if any
      document.querySelector("#err-msg").innerHTML = "";

      //save the user's name in sessionStorage
      sessionStorage.setItem("username", yourName);

      //create room link
      let roomLink = `${location.origin}?room=${roomName.trim()}`;
      /* .replace( ' ', '_' ) }_${ helpers.generateRandomString() */

      //show message with link to room
      document.querySelector(
        "#room-created"
      ).innerHTML = `Se ha creado la sala de transmisión correctamente. Click <a href='${roomLink}'>aquí</a> para ingresar.`;

      //empty the values
      document.querySelector("#room-name").value = "";
      document.querySelector("#password").value = "";
    } else {

      if(!yourName || !password){
        document.querySelector("#err-msg").innerHTML = "Todos los campos son requeridos";
      } else if(password !== 'Ajedrezlatino2021'){
        document.querySelector("#err-msg").innerHTML = "Contraseña incorrecta";
      }
     
    }
  });

  //When the 'Enter room' button is clicked.
  document.getElementById("enter-room").addEventListener("click", (e) => {
    e.preventDefault();

    let name = document.querySelector("#username").value;
     // TODO: Improve this
    let password = document.getElementById('password').value;

    if (name) {
      //remove error message, if any
      document.querySelector("#err-msg-username").innerHTML = "";

      //save the user's name in sessionStorage
      sessionStorage.setItem("username", name);

      //reload room
      location.reload();
    } else {

        if(!name || !password){
          document.querySelector("#err-msg-username").innerHTML = "Todos los campos son requeridos";
        } else if(password !== 'Ajedrezlatino2021'){
          document.querySelector("#err-msg-username").innerHTML = "Contraseña incorrecta";
        }
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("expand-remote-video")) {
      helpers.maximiseStream(e);
    } else if (e.target && e.target.classList.contains("mute-remote-mic")) {
      helpers.singleStreamToggleMute(e);
    }
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    helpers.toggleModal("recording-options-modal", false);
  });
});
