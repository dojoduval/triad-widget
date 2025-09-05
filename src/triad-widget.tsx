import React from "react";
import { createRoot } from "react-dom/client";
import TripleTriadLite from "./TripleTriadLite";

class TriadWidget extends HTMLElement {
  root?: ReturnType<typeof createRoot>;

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    mount.style.height = "100%";
    shadow.appendChild(mount);

    // minimal isolate styles
    const style = document.createElement("style");
    style.textContent = `:host{display:block;font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;color:#fff}`;
    shadow.appendChild(style);

    this.root = createRoot(mount);
    this.root.render(<TripleTriadLite />);
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}

customElements.define("triad-widget", TriadWidget);