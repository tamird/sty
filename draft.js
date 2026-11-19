// An item can carry multiple replies to the same revision. Include the text
// in its address so an old link cannot open a replacement that needs review.
async function draftKey(draft) {
  const source = JSON.stringify([draft.kind, draft.head, draft.url, draft.title, draft.body, draft.replyBody]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  const hex = Array.from(new Uint8Array(digest, 0, 10), byte => byte.toString(16).padStart(2, "0")).join("");
  return draft.kind + "-" + hex;
}

async function draftURL(itemID, draft, currentURL) {
  const url = new URL(currentURL);
  url.pathname = new URL("draft.html", url).pathname;
  url.searchParams.set("draft", await draftKey(draft));
  url.hash = encodeURIComponent(itemID);
  return url;
}

function draftReturnURL(currentURL) {
  const url = new URL(currentURL);
  url.pathname = new URL("./", url).pathname;
  url.searchParams.delete("draft");
  return url;
}

async function findDraft(item, key) {
  if (!item || !key) return null;
  const drafts = [item.contributorReview, ...(item.additionalReviews || []), item.humanAction, ...(item.settledReviews || [])];
  for (const draft of drafts) {
    if (draft?.body && key.startsWith(draft.kind + "-") && await draftKey(draft) === key) return draft;
  }
  return null;
}
