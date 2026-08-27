import { render } from "preact";
import { App } from "./App";
import "../shared/theme.css";
import "./styles.css";

render(<App />, document.getElementById("app") as HTMLElement);
