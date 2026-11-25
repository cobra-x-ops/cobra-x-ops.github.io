(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal blocks as they come on screen
  const reveal = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        reveal.unobserve(e.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("in") : reveal.observe(el)));
  if (reduce) return;

  const wait = (ms, run) => new Promise((ok) => setTimeout(() => ok(run.on), ms));

  // Each looping section only moves while it is on screen
  const loops = {
    rows(sec) {
      const rows = [...sec.querySelectorAll(".row")];
      let i = 0, hover = false;
      const paint = (k) => rows.forEach((r, j) => r.classList.toggle("hl", j === k));
      rows.forEach((r, k) => {
        r.addEventListener("mouseenter", () => { hover = true; paint(k); i = (k + 1) % rows.length; });
        r.addEventListener("mouseleave", () => { hover = false; });
      });
      paint(i); i = 1;
      const t = setInterval(() => { if (!hover) { paint(i); i = (i + 1) % rows.length; } }, 2200);
      return () => { clearInterval(t); paint(-1); };
    },
    tiles(sec) {
      const tiles = [...sec.querySelectorAll(".tiles li")];
      let i = 0;
      const t = setInterval(() => {
        tiles.forEach((x, k) => x.classList.toggle("on", k === i));
        i = (i + 1) % tiles.length;
      }, 450);
      return () => { clearInterval(t); tiles.forEach((x) => x.classList.remove("on")); };
    },
    steps(sec) {
      sec.classList.add("live-on");
      return () => sec.classList.remove("live-on");
    },
    term(sec) {
      const pre = sec.querySelector("pre");
      const full = pre.innerHTML;
      const session = [
        ["whoami", "yahya el bellarh — full-stack & mobile developer"],
        ["cat focus.txt", "computer science / it / machine learning"],
        ["ls ~/skills", "python  typescript  linux  ai  react-native"],
      ];
      const run = { on: true };
      const add = (cls, text) => {
        if (!run.on) throw new Error("stopped");
        const s = document.createElement("span");
        if (cls) s.className = cls;
        s.textContent = text;
        pre.insertBefore(s, cursor);
        return s;
      };
      const cursor = document.createElement("span");
      cursor.className = "cur";
      (async () => {
        try { while (run.on) {
          pre.textContent = "";
          pre.appendChild(cursor);
          if (!(await wait(500, run))) break;
          for (const [cmd, out] of session) {
            add("p", "yahya@cobra:~$ ");
            const c = add("", "");
            for (const ch of cmd) {
              c.textContent += ch;
              if (!(await wait(75, run))) break;
            }
            add("", "\n");
            if (!(await wait(350, run))) break;
            add("o", out + "\n");
            if (!(await wait(700, run))) break;
          }
          if (!run.on) break;
          add("p", "yahya@cobra:~$ ");
          if (!(await wait(6000, run))) break;
        } } catch (_) { /* stopped while typing */ }
      })();
      return () => { run.on = false; pre.innerHTML = full; };
    },
  };

  const active = new Map();
  const watch = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const sec = e.target;
      if (e.isIntersecting && !active.has(sec)) active.set(sec, loops[sec.dataset.loop](sec));
      else if (!e.isIntersecting && active.has(sec)) { active.get(sec)(); active.delete(sec); }
    }
  }, { threshold: 0.2 });
  document.querySelectorAll("[data-loop]").forEach((s) => watch.observe(s));
})();
