import React, { useEffect, useState } from "react";
import NoSleep from "nosleep.js";

const Button: React.FC = () => {
  const [color, setColor] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [ws, setWs] = useState<WebSocket>();
  const [buttonText, setButtonText] = useState<string>("");

  var asignedColor = "";
  var cnt=0;
  // This will run one time after the component mounts
  useEffect(() => {
    var noSleep = new NoSleep();
    noSleep.enable();
    const onPageLoad = () => {
      if (cnt>0){
          return;
      }
      let w = new WebSocket("wss://agile-escarpment-87607.herokuapp.com/simon/button/");
      cnt++;
      setButtonText(cnt.toString());
      w.onmessage = function (event) {
        const js = JSON.parse(event.data);
        console.log(js);

        if (js.state === "BUTTON_PRESS") {
          setDisabled(false);
        } else {
          setDisabled(true);
        }

        if (js.type === "ASIGNED_COLOR") {
          setColor(js.msg);
          asignedColor = js.msg;
        }
        if (js.type === "LIGHT_UP") {
          setColor(asignedColor + "_LIGHT");
          setTimeout(() => setColor(asignedColor), 1000);
        }

        if (js.type === "END_GAME") {
          setButtonText(js.msg);
        } else {
          setButtonText("");
        }
      };

      setWs(w);
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => {
        window.removeEventListener("load", onPageLoad);
        if (ws) {
          ws.close();
        }
      };
    }
  }, []);

  

  const onClick = () => {
    const clickCmd = { command: "PRESS_BUTTON" };
    if (ws) {
      ws.send(JSON.stringify(clickCmd));
    }
  };
  const c = () => {};
  return (
    <button disabled={disabled} onClick={onClick} className={color}>
      {buttonText}
    </button>
  );
};

export default Button;
