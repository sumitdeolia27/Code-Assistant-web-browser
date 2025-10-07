

const ctx = {
    inputText: null,
    tabs: null,
    panels: null,
    analyzeBtn: null,
    clearBtn: null,
    copyBtn: null,
    collapseBtn: null,
    statusText: null,
    spinner: null
};

(() => {

    ctx.inputText = document.getElementById("inputText");
    ctx.tabs = Array.from(document.querySelectorAll(".tab"));
    ctx.panels = Array.from(document.querySelectorAll(".panel"));
    ctx.analyzeBtn = document.getElementById("analyzeBtn");
    ctx.clearBtn = document.getElementById("clearBtn");
    ctx.copyBtn = document.getElementById("copyBtn");
    ctx.collapseBtn = document.getElementById("collapseBtn");
    ctx.statusText = document.getElementById("statusText");
    ctx.spinner = document.getElementById("spinner");


    chrome.storage.local.get(["selectedText"], (res) => {
        if (res?.selectedText) {
            ctx.inputText.value = res.selectedText;
            autoFillAllTabs(res.selectedText);
        }
    });


    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        if (changes.selectedText) {
            const newText = changes.selectedText.newValue || "";
            ctx.inputText.value = newText;
            autoFillAllTabs(newText);
        }
    });


    window.addEventListener("message", (ev) => {
        if (!ev.data || ev.data.type !== "selection") return;
        const text = ev.data.text || "";
        ctx.inputText.value = text;
        autoFillAllTabs(text);
        expandSidebar(); // request parent to expand

        chrome.storage.local.set({ selectedText: text, selectedAt: Date.now() });
    });


    ctx.tabs.forEach(t => {
        t.addEventListener("click", () => {
            ctx.tabs.forEach(tb => tb.classList.remove("active"));
            t.classList.add("active");
            const target = t.getAttribute("data-tab");
            ctx.panels.forEach(p => {
                p.classList.toggle("active", p.getAttribute("data-panel") === target);
            });
        });
    });


    ctx.clearBtn.addEventListener("click", () => {
        ctx.inputText.value = "";
        autoFillAllTabs("");
        chrome.storage.local.set({ selectedText: "" });
    });

    ctx.copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(ctx.inputText.value);
            setStatus("Copied input", 1500);
        } catch (e) {
            setStatus("Copy failed", 2000);
        }
    });


    ctx.collapseBtn.addEventListener("click", () => {
        const root = document.getElementById("sidebar-root");
        if (root.classList.contains("collapsed")) {
            root.classList.remove("collapsed");
            parent.postMessage({ source: "code-analyzer-iframe", type: "expand" }, "");
        } else {
            root.classList.add("collapsed");
            parent.postMessage({ source: "code-analyzer-iframe", type: "collapse" }, "");
        }
    });


    document.querySelectorAll(".copy-result").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const panel = e.target.closest(".panel");
            const pre = panel.querySelector(".result-area");
            try {
                await navigator.clipboard.writeText(pre.innerText);
                setStatus("Copied result", 1500);
            } catch {
                setStatus("Copy failed", 1500);
            }
        });
    });

    document.querySelectorAll(".clear-result").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const panel = e.target.closest(".panel");
            const pre = panel.querySelector(".result-area");
            pre.innerText = "";
        });
    });


    ctx.analyzeBtn.addEventListener("click", async () => {
        const text = ctx.inputText.value.trim();
        if (!text) {
            setStatus("No input to analyze", 1800);
            return;
        }

        setLoading(true);
        setStatus("Analyzing...");

        try {

            const PYTHON_API_URL = "https://example.com/analyze"; // <-- change me
            const payload = {
                text,
                tabs: ["hints", "suggestions", "explanation", "clean", "solutions", "errors"]
            };

            const resp = await fetch(PYTHON_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",

                },
                body: JSON.stringify(payload),

            });

            if (!resp.ok) {
                const textErr = await resp.text().catch(() => resp.statusText);
                throw new Error(`Server error: ${resp.status} ${textErr}`);
            }

            const json = await resp.json();





            setPanelText("hints", json.hints || json.hint || "No hints returned.");
            setPanelText("suggestions", json.suggestions || "No suggestions returned.");
            setPanelText("explanation", json.explanation || "No explanation returned.");
            setPanelText("clean", json.clean || "No clean code returned.");
            setPanelText("solutions", json.solutions || "No solutions returned.");
            setPanelText("errors", json.errors || "No error fixes returned.");


            chrome.storage.local.set({ lastAnalysis: { at: Date.now(), input: text, result: json } });

            setStatus("Done", 2000);
        } catch (err) {
            console.error(err);
            setStatus("Error: " + (err.message || "unknown"), 5000);
        } finally {
            setLoading(false);
        }

    });


    function autoFillAllTabs(text) {
        const preview = text.length > 500 ? text.slice(0, 500) + "…" : text;
        const now = new Date().toLocaleString();
        setPanelText("hints", `Auto-loaded selection (${now}): \n\n${preview}`);
        setPanelText("suggestions", `Auto-loaded selection (${now}): \n\nTry to optimize loops, variable names...`);
        setPanelText("explanation", `Auto-loaded selection (${now}): \n\nStep-by-step explanation placeholder.`);
        setPanelText("clean", `Auto-loaded selection (${now}): \n\nClean code suggestion placeholder.`);
        setPanelText("solutions", `Auto-loaded selection (${now}): \n\nPotential solutions placeholder.`);
        setPanelText("errors", `Auto-loaded selection (${now}): \n\nNo obvious runtime errors detected.`);
    }

    function setPanelText(panelKey, text) {
        const panel = document.querySelector(`[data-panel="${panelKey}"]`);
        if (!panel) return;
        const pre = panel.querySelector(".result-area");
        pre.innerText = text || "";
    }

    function setStatus(msg, hideAfterMs) {
        ctx.statusText.innerText = msg;
        if (hideAfterMs) {
            setTimeout(() => {
                ctx.statusText.innerText = "Idle";
            }, hideAfterMs);
        }
    }

    function setLoading(on) {
        ctx.spinner.classList.toggle("hidden", !on);
        ctx.analyzeBtn.disabled = on;
    }

    function expandSidebar() {
        parent.postMessage({ source: "code-analyzer-iframe", type: "expand" }, "*");
    }


    window.__codeAnalyzer = {
        autoFillAllTabs,
        setPanelText
    };
})();