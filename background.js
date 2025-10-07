


chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        id: 'analyzeCode',
        title: '🤖 Analyze Code',
        contexts: ['selection']
    });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'analyzeCode') {
        handleAnalyzeCode(tab, info.selectionText);
    }
});


chrome.commands.onCommand.addListener((command) => {
    if (command === 'analyze-code') {
        handleAnalyzeCode();
    }
});

async function handleAnalyzeCode(tab = null, selectedText = null, editorCodeIn = null) {
    try {
        if (!tab) {

            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tab = activeTab;
        }


        let editorCode = editorCodeIn || null;
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                func: () => {
                    function getSelected() {
                        try {
                            const sel = window.getSelection();
                            if (sel && sel.rangeCount > 0) return sel.toString();
                        } catch (_) {}
                        return '';
                    }
                    function getCode() {
                        try {
                            if (window.monaco && window.monaco.editor && typeof window.monaco.editor.getModels === 'function') {
                                const models = window.monaco.editor.getModels();
                                if (models && models.length > 0) {
                                    const val = models[0].getValue();
                                    if (val && val.trim()) return val;
                                }
                            }
                        } catch (_) {}
                        try {
                            const cmEl = document.querySelector('.CodeMirror');
                            if (cmEl && cmEl.CodeMirror) {
                                const val = cmEl.CodeMirror.getValue();
                                if (val && val.trim()) return val;
                            }
                        } catch (_) {}
                        try {
                            const ta = document.querySelector('textarea[aria-label="Code editor"], textarea');
                            if (ta && ta.value && ta.value.trim()) return ta.value;
                        } catch (_) {}
                        return '';
                    }
                    return { selected: getSelected(), code: getCode() };
                }
            });
            if (results && results.length) {
                for (const r of results) {
                    const { selected, code } = r.result || {};
                    if (!selectedText && selected && selected.trim().length > 20) selectedText = selected.trim();
                    if (!editorCode && code && code.trim().length > 0) editorCode = code.trim();
                }
            }
        } catch (error) {
            console.log('executeScript context fetch failed:', error);
        }


        if (!selectedText || !editorCode) {
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getLeetCodeContext' });
                selectedText = selectedText || response?.selectedText;
                editorCode = editorCode || response?.editorCode;
            } catch (_) {}
        }


        if (selectedText || editorCode) {

            await chrome.storage.local.set({ 
                selectedText: selectedText || '',
                editorCode: editorCode || '',
                timestamp: Date.now()
            });
        }


        chrome.action.openPopup();

    } catch (error) {
        console.error('Error handling analyze code:', error);
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeCode') {
        handleAnalyzeCode(sender.tab, request.selectedText, request.editorCode);
        sendResponse({ success: true });
    } else if (request.action === 'openPopup') {
        chrome.action.openPopup();
        sendResponse({ success: true });
    }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(() => {

        });
    }
});
