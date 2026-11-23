/* Admin panel (/admin): loads only on that page, and only for an admin account (adminPage() in app.js).
   It reads and changes data through /api/admin/*, which checks the account again on every request: hiding this file
   from someone protects nothing, the server does. Tabs: Reports, Teams, Users and Log. */
const ADM_TABS = [["reported", "Reports"], ["teams", "Teams"], ["users", "Users"], ["log", "Log"]];
const ADM_STATUSES = [["approved", "On the site"], ["removed", "Taken down"], ["pending", "Waiting (old queue)"], ["rejected", "Rejected (old queue)"]];
// What can be done to a team in each status, as [action, label]
const ADM_TEAM_ACTIONS = {
  approved: [["remove", "Take down"]],
  removed: [["restore", "Restore"]],
  pending: [["approve", "Approve"], ["reject", "Reject"]],
  rejected: [["restore", "Put on the site"]]
};
/* exported adminPanel */
const adm = { tab: "reported", status: "approved", q: "", data: null, loading: false, message: "" };

function adminPanel() {
  if (!adm.data && !adm.loading) admLoad();
  const tabs = ADM_TABS.map(([key, label]) => `<button class="tool${adm.tab === key ? " on" : ""}" data-adm-tab="${key}" aria-pressed="${adm.tab === key}">${t(label)}</button>`).join("");
  const status = adm.tab === "teams" ? `<select data-adm-status aria-label="${t("Status")}">${ADM_STATUSES.map(([v, label]) => `<option value="${v}"${v === adm.status ? " selected" : ""}>${t(label)}</option>`).join("")}</select>` : "";
  const search = ["teams", "users"].includes(adm.tab)
    ? `<input type="search" data-adm-q value="${esc(adm.q)}" placeholder="${esc(adm.tab === "users" ? t("Name or Discord id") : t("Team, page, author or number"))}" aria-label="${t("Search")}">` : "";
  return `<h1>${t("Admin panel")}</h1><p class="sub">${t("Every action here is recorded in the Log tab.")}</p>
    <div class="adm-bar"><div class="adm-tabs" role="group">${tabs}</div>${status}${search}</div>
    <p class="adm-message" role="status">${esc(adm.message)}</p>
    <div class="adm-body">${adm.loading || !adm.data ? `<p class="empty">${t("Loading...")}</p>` : admBody()}</div>`;
}
const admDraw = () => { if (location.pathname === "/admin") route(true); };

async function admLoad() {
  adm.loading = true;
  const q = encodeURIComponent(adm.q);
  const url = { reported: "/api/admin/teams?status=reported", teams: `/api/admin/teams?status=${adm.status}&q=${q}`, users: `/api/admin/users?q=${q}`, log: "/api/admin/log" }[adm.tab];
  const answer = await fetch(url).then(r => r.json()).catch(() => ({ error: "network" }));
  adm.loading = false;
  adm.data = answer.error ? { error: answer.error } : answer;
  admDraw();
}

const admDate = ms => ms ? new Date(ms).toLocaleString(loc("en-US"), { dateStyle: "medium", timeStyle: "short" }) : "";
function admBody() {
  if (adm.data.error) return `<p class="empty">${adm.data.error === "admin" ? t("Admins only.") : t("The list could not be loaded. Reload the page to try again.")}</p>`;
  if (adm.tab === "users") return admList(adm.data.users, admUser, "No accounts found.");
  if (adm.tab === "log") return admList(adm.data.log, admLogRow, "Nothing recorded yet.");
  return admList(adm.data.teams, admTeam, adm.tab === "reported" ? "No open reports." : "No teams found.");
}
const admList = (rows, row, none) => rows.length ? `<ul class="adm-list">${rows.map(row).join("")}</ul>${adm.data.more ? `<p class="sub">${t("Showing the newest {n}. Search to narrow it down.", { n: rows.length })}</p>` : ""}` : `<p class="empty">${t(none)}</p>`;

// A team as the admin needs to judge it: who made it, its texts (the only free text in a team), and its reports
function admTeam(row) {
  const team = row.team, href = buildHref(row.page, `c-${row.id}`);
  const name = row.status === "approved" ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(team.name)}</a>` : esc(team.name);
  const texts = team.cards.flatMap(c => [c.desc && `<p><b>${esc(c.char)} · ${t("Notes")}</b> ${esc(c.desc)}</p>`, c.rotation && `<p><b>${esc(c.char)} · ${t("Rotation")}</b> ${esc(c.rotation)}</p>`]).filter(Boolean);
  const actions = [...(ADM_TEAM_ACTIONS[row.status] || []), ...(row.reports.length ? [["dismiss", "Keep it, close the reports"]] : [])]
    .map(([action, label]) => `<button class="tool${action === "remove" ? " ed-danger" : ""}" data-adm-team="${row.id}" data-adm-action="${action}">${t(label)}</button>`);
  if (row.user_id && !row.banned) actions.push(`<button class="tool ed-danger" data-adm-user="${esc(row.user_id)}" data-adm-action="ban">${t("Ban the author")}</button>`);
  return `<li class="adm-item"><div class="adm-head"><strong>#${row.id} ${name}</strong>
      <small>${esc(row.page)} · ${t("by {name}", { name: esc(row.author || "?") })}${row.banned ? ` · <i class="adm-tag">${t("banned")}</i>` : ""} · ${admDate(row.created)} · ♥ ${row.likes}</small></div>
    <p class="adm-chars">${team.cards.map(c => esc(c.char)).join(" · ")}${team.order ? ` · ${esc(team.order)}` : ""}</p>
    ${row.reports.length ? `<ul class="adm-reports">${row.reports.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
    ${texts.length ? `<details><summary>${t("Texts of the team")}</summary>${texts.join("")}</details>` : ""}
    ${row.reason && row.status !== "approved" ? `<p class="sub">${esc(row.reason)}</p>` : ""}
    <div class="adm-actions">${actions.join("")}</div></li>`;
}
function admUser(user) {
  const self = user.id === account.user?.id, actions = [];
  if (!user.owner && !self) actions.push(user.banned ? ["unban", "Unban"] : ["ban", "Ban"]);
  if (!user.banned) {
    if (!user.admin) actions.push(["promote", "Make admin"]);
    else if (!user.owner && !self) actions.push(["demote", "Remove admin"]);
  }
  const tags = [user.owner && t("owner"), user.admin && t("admin"), user.banned && t("banned"), self && t("you")].filter(Boolean).map(tag => `<i class="adm-tag">${tag}</i>`).join(" ");
  return `<li class="adm-item"><div class="adm-head"><strong>${esc(user.name)}</strong> ${tags}
      <small>Discord ${esc(user.id)} · ${tn(user.teams, "{n} team")} · ${tn(user.reported, "{n} report")} · ${t("last login {date}", { date: admDate(user.seen) })}</small></div>
    <div class="adm-actions">${actions.map(([action, label]) => `<button class="tool${["ban", "demote"].includes(action) ? " ed-danger" : ""}" data-adm-user="${esc(user.id)}" data-adm-action="${action}">${t(label)}</button>`).join("")}</div></li>`;
}
const admLogRow = row => `<li class="adm-item adm-log"><small>${admDate(row.created)}</small> <strong>${esc(row.admin)}</strong> ${esc(row.action)} ${esc(row.target)}${row.detail ? ` <small>(${esc(row.detail)})</small>` : ""}</li>`;

async function admAct(kind, id, action) {
  let body = { id: kind === "team" ? Number(id) : id, action };
  if (action === "ban") {
    if (!confirm(t("Ban this account? It is logged out everywhere and can't log in again until unbanned."))) return;
    body = { ...body, removeTeams: confirm(t("Also take all of this account's teams off the site?")) };
  } else if (["remove", "demote", "reject"].includes(action) && !confirm(t("Are you sure?"))) return;
  const result = await postJson(`/api/admin/${kind === "team" ? "teams" : "users"}`, body);
  adm.message = result.ok ? t("Done.") : { state: t("Someone changed this first. The list was loaded again."), owner: t("The owner's account can't be changed."), self: t("You can't do that to your own account.") }[result.error] || t("That did not work. Try again.");
  if (result.ok) markFresh();
  admLoad();
}

$("#main").addEventListener("click", e => {
  const tab = e.target.closest("[data-adm-tab]"), act = e.target.closest("[data-adm-action]");
  if (tab) {
    adm.tab = tab.dataset.admTab;
    adm.q = "";
    adm.message = "";
    adm.data = null;
    admDraw();
  }
  if (act) admAct(act.dataset.admTeam ? "team" : "user", act.dataset.admTeam || act.dataset.admUser, act.dataset.admAction);
});
$("#main").addEventListener("change", e => {
  if (!e.target.matches("[data-adm-status]")) return;
  adm.status = e.target.value;
  adm.data = null;
  admDraw();
});
// The search runs when typing stops
let admTimer;
$("#main").addEventListener("input", e => {
  if (!e.target.matches("[data-adm-q]")) return;
  clearTimeout(admTimer);
  admTimer = setTimeout(() => { adm.q = e.target.value.trim(); admLoad(); }, 350);
});
