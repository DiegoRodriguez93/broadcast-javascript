import h from "./helpers.js";

window.addEventListener("load", () => {
  const room = h.getQString(location.href, "room");
  var username = () => {
    let result = `anonimo_${h.generateRandomString()}`;

    try {
      result = localStorage.getItem("username");
    } catch (error) {
      console.log("The cookies are disabled");
    }

    return result;
  };

  if (!room) {
    document.querySelector("#room-create").attributes.removeNamedItem("hidden");
  } else if (!username()) {
    document
      .querySelector("#username-set")
      .attributes.removeNamedItem("hidden");
  } else {
    let commElem = document.getElementsByClassName("room-comm");

    for (let i = 0; i < commElem.length; i++) {
      commElem[i].attributes.removeNamedItem("hidden");
    }

    var pc = [];

    let socket = io("/stream");

    var socketId = "";
    var randomNumber = `__${h.generateRandomString()}__${h.generateRandomString()}__`;
    var myStream = "";
    var screen = "";
    var recordedStream = [];
    var mediaRecorder = "";

    //Get user video by default
    getAndSetUserStream();

    socket.on("connect", () => {
      //set socketId
      socketId = socket.io.engine.id;

      socket.emit("subscribe", {
        room: room,
        socketId: socketId,
      });

      // list of users START
      socket.emit("online", {
        socketId,
        username: username(),
      });

      socket.on("disconnecting", () => {
        socket.emit("offline", {
          socketId,
        });
      });

      socket.on("disconnect", () => {
        socket.emit("offline", {
          socketId,
        });
      });

      socket.on("listOfUsers", (list) => {
        document.getElementById("numberOfConnected").innerHTML = Object.keys(
          list
        ).length;
      });

      socket.on("banUser", ({ senderSocketId }) => {
        if (socketId == senderSocketId) {
          try {
            localStorage.setItem("whosyourdaddy", true);
          } catch {}
        }
      });
      // list of users END

      socket.on("new user", (data) => {
        socket.emit("newUserStart", { to: data.socketId, sender: socketId });
        pc.push(data.socketId);
        init(true, data.socketId);
      });

      socket.on("newUserStart", (data) => {
        pc.push(data.sender);
        init(false, data.sender);
      });

      socket.on("ice candidates", async (data) => {
        data.candidate
          ? await pc[data.sender].addIceCandidate(
              new RTCIceCandidate(data.candidate)
            )
          : "";
      });

      socket.on("sdp", async (data) => {
        if (data.description.type === "offer") {
          data.description
            ? await pc[data.sender].setRemoteDescription(
                new RTCSessionDescription(data.description)
              )
            : "";

          //save my stream
          myStream = h.getUserFullMedia();

          h.getUserFullMedia()
            .getTracks()
            .forEach((track) => {
              pc[data.sender].addTrack(track, stream);
            });

          let answer = await pc[data.sender].createAnswer();

          try {
            await pc[data.sender].setLocalDescription(answer);
          } catch (e) {}

          socket.emit("sdp", {
            description: pc[data.sender].localDescription,
            to: data.sender,
            sender: socketId,
          });
        }
      });

      socket.on("chat", (data) => {
        h.addChat(data, "remote");
      });
    });

    setInterval(() => {
      // if we don't have video try to get the state of the transmision  state == 1 ? online : offline
      if (document.getElementsByTagName("video").length === 0) {
        fetch('https://ajedrezlatino.com/api/broadcast/api/state.php', {method: 'POST'})
          .then((response) => response.json())
          .then((res) => {
            if (res.error) {
              console.error(res.error);
            } else if (res.result) {
              if (res.result == 1) {
                location.reload();
              } else {
                if (!document.getElementById("trans-err-message")) {
                  document.getElementById("spinner-container").innerHTML = `
                  <div>
                    <h1 id="trans-err-message" style="position: fixed;width: 100%;bottom: 50%;text-align: center;">
                      No se han encontrado transmisiones activas
                    </h1>
                  </div>`;
                }
              }
            }
          })
          .catch(() =>
            console.error("Error on req to get state of transmition")
          );
      }
    }, 22000);

    function getAndSetUserStream() {
      //save my stream
      myStream = h.getUserFullMedia();
    }

    function sendMsg(msg) {
      let data = {
        room: room,
        msg: msg,
        sender: `${username()}`,
        admin: false,
        senderSocketId: socketId,
      };

      //emit chat message
      socket.emit("chat", data);

      //add localchat
      h.addChat(data, "local");
    }

    function init(createOffer, partnerName) {
      pc[partnerName] = new RTCPeerConnection(h.getIceServer());

      if (screen && screen.getTracks().length) {
        screen.getTracks().forEach((track) => {
          pc[partnerName].addTrack(track, screen); //should trigger negotiationneeded event
        });
      } else {
        //save my stream
        myStream = h.getUserFullMedia();

        h.getUserFullMedia()
          .getTracks()
          .forEach((track) => {
            pc[partnerName].addTrack(track, stream); //should trigger negotiationneeded event
          });
      }

      //create offer
      if (createOffer) {
        pc[partnerName].onnegotiationneeded = async () => {
          let offer = await pc[partnerName].createOffer();

          await pc[partnerName].setLocalDescription(offer);

          socket.emit("sdp", {
            description: pc[partnerName].localDescription,
            to: partnerName,
            sender: socketId,
          });
        };
      }

      //send ice candidate to partnerNames
      pc[partnerName].onicecandidate = ({ candidate }) => {
        socket.emit("ice candidates", {
          candidate: candidate,
          to: partnerName,
          sender: socketId,
        });
      };

      //add
      pc[partnerName].ontrack = (e) => {
        let str = e.streams[0];
        if (document.getElementById(`${partnerName}-video`)) {
          let myVideoEl = document.getElementById(`${partnerName}-video`);
          myVideoEl.srcObject = str;

          var isPlaying =
            myVideoEl.currentTime > 0 &&
            !myVideoEl.paused &&
            !myVideoEl.ended &&
            myVideoEl.readyState > myVideoEl.HAVE_CURRENT_DATA;

          if (!isPlaying) {
            myVideoEl.play();
          }
        } else {
          // TODO : add a control here to avoid duplicated windows.
          //video elem
          let newVid = document.createElement("video");
          newVid.id = `${partnerName}-video`;
          newVid.srcObject = str;
          newVid.autoplay = true;
          newVid.controls = true;
          newVid.muted = true;
          newVid.className = "remote-video";

          //video controls elements
          let controlDiv = document.createElement("div");
          controlDiv.className = "remote-video-controls";

          //create a new div for card
          let cardDiv = document.createElement("div");
          cardDiv.className = "card card-sm";
          cardDiv.id = partnerName;
          cardDiv.appendChild(newVid);
          cardDiv.appendChild(controlDiv);

          // clean the videos div
          document.getElementById("videos").innerHTML = "";
          //put div in main-section elem
          document.getElementById("videos").appendChild(cardDiv);

          h.adjustVideoElemSize();
        }
      };

      pc[partnerName].onconnectionstatechange = (d) => {
        switch (pc[partnerName].iceConnectionState) {
          case "disconnected":
          case "failed":
            h.closeVideo(partnerName);
            break;

          case "closed":
            h.closeVideo(partnerName);
            break;
        }
      };

      pc[partnerName].onsignalingstatechange = (d) => {
        switch (pc[partnerName].signalingState) {
          case "closed":
            console.log("Signalling state is 'closed'");
            h.closeVideo(partnerName);
            break;
        }
      };
    }

    document.getElementById("send_message").addEventListener("click", (e) => {
      const message = document.getElementById("chat-input").value;

      if (message.trim() !== "") {
        sendMsg(message.trim());

        setTimeout(() => {
          document.getElementById("chat-input").value = "";
        }, 50);
      }
    });
    //Chat textarea
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.which === 13 && e.target.value.trim()) {
        e.preventDefault();

        sendMsg(e.target.value);

        setTimeout(() => {
          e.target.value = "";
        }, 50);
      }
    });
  }
});
