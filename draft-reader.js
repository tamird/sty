"use strict";

async function readDraft() {
  const url = new URL(location.href);
  const back = document.getElementById("return-to-card");
  back.href = draftReturnURL(url).href;
  const previous = document.referrer && new URL(document.referrer);
  if (history.length > 1 && previous && previous.origin === url.origin && previous.pathname === new URL(back.href).pathname) {
    back.addEventListener("click", event => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.back();
    });
  }
  const heading = document.getElementById("draft-title");
  const body = document.getElementById("draft-body");
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.defaultPrevented && !window.getSelection()?.toString()) back.click();
  });
  try {
    const response = await fetch("registry.json", { cache: "no-cache" });
    if (!response.ok) throw Error("Could not load the work map. Reload to try again.");
    const data = await response.json();
    const id = decodeURIComponent(url.hash.slice(1));
    const item = [...data.nodes, ...(data.investigations || [])].find(node => node.id === id);
    const draft = await findDraft(item, url.searchParams.get("draft"));
    if (!draft) throw Error("This version of the draft is no longer available. Open its card for the current work.");
    const labels = { issue: "Issue", reply: "Reply", review: "Review", proposal: "Pull request", amendment: "PR amendment", submission: "Pull request" };
    const kind = labels[draft.kind] || "Draft";
    document.getElementById("draft-context").textContent = [kind, item.repo || item.title].join(" · ");
    heading.textContent = draft.title || item.title;
    document.title = heading.textContent + " · sty work map";

    // Registry text is Markdown for a public post. Disable embedded HTML and
    // use the renderer’s URL validation on both inline and reference links.
    const markdown = markdownit({ html: false, linkify: true });
    body.innerHTML = markdown.render(draft.body);
    if (draft.replyBody) {
      const subheading = document.createElement("h2");
      subheading.textContent = "Reply to reviewer";
      body.append(subheading);
      body.insertAdjacentHTML("beforeend", markdown.render(draft.replyBody));
    }
    const source = document.getElementById("draft-source");
    const destination = new URL(draft.url);
    if (destination.protocol === "https:") {
      if (draft.kind === "issue") {
        destination.searchParams.set("title", draft.title);
        destination.searchParams.set("body", draft.body);
      }
      source.href = destination.href;
      source.textContent = draft.kind === "issue" ? "Open prefilled issue ↗" : "Open source ↗";
      source.hidden = false;
    }
  } catch (err) {
    heading.textContent = "Draft unavailable";
    body.textContent = err.message;
  }
  heading.focus({ preventScroll: true });
}

readDraft();
