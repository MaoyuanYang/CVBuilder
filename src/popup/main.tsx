import { render } from "preact";
import { Popup } from "./Popup";
import "../shared/theme.css";
import "./popup.css";

render(<Popup />, document.getElementById("app") as HTMLElement);
