


function isExtensionContextValid() {
    try {
        return chrome.runtime && chrome.runtime.id;
    } catch (error) {
        return false;
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.action === 'getSelectedText') {
            const selectedText = getSelectedText();
            sendResponse({ selectedText: selectedText });
        } else if (request.action === 'getEditorCode') {
            const editorCode = getEditorCode();
            sendResponse({ editorCode });
        } else if (request.action === 'getLeetCodeContext') {
            const selectedText = getSelectedText();
            const editorCode = getEditorCode();
            sendResponse({ selectedText, editorCode });
        }
    } catch (error) {
        console.log('Content script message error:', error);

    }
});


function getSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        return selection.toString().trim();
    }
    return '';
}


function getEditorCode() {
    try {

        if (window.monaco && window.monaco.editor && typeof window.monaco.editor.getModels === 'function') {
            const models = window.monaco.editor.getModels();
            if (models && models.length > 0) {
                const value = models[0].getValue();
                if (value && value.trim()) return value;
            }
        }
    } catch (_) {}

    try {

        const cmEl = document.querySelector('.CodeMirror');
        if (cmEl && cmEl.CodeMirror && typeof cmEl.CodeMirror.getValue === 'function') {
            const value = cmEl.CodeMirror.getValue();
            if (value && value.trim()) return value;
        }
    } catch (_) {}

    try {

        const ta = document.querySelector('textarea[aria-label="Code editor"], textarea');
        if (ta && ta.value && ta.value.trim()) return ta.value;
    } catch (_) {}

    return '';
}


document.addEventListener('mouseup', () => {
    const selectedText = getSelectedText();
    if (selectedText && selectedText.length > 10) {

        const existingIndicator = document.getElementById('code-assistant-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }


        const indicator = document.createElement('div');
        indicator.id = 'code-assistant-indicator';
        indicator.innerHTML = '🤖 Right-click to analyze code';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-family: 'Segoe UI', sans-serif;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
        `;


        if (!document.getElementById('code-assistant-styles')) {
            const style = document.createElement('style');
            style.id = 'code-assistant-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);


        try {
            const editorCode = getEditorCode();
            chrome.runtime.sendMessage({ 
                action: 'analyzeCode', 
                selectedText: selectedText,
                editorCode: editorCode
            });
        } catch (_) {}


        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 300);
            }
        }, 1500);


        indicator.addEventListener('click', () => {
            if (!isExtensionContextValid()) {
                indicator.remove();
                return;
            }
            try { chrome.runtime.sendMessage({ action: 'openPopup' }); } catch (_) { indicator.remove(); }
        });
    }
});


document.addEventListener('keydown', (event) => {

    if (event.ctrlKey && event.shiftKey && event.code === 'Space') {
        event.preventDefault();
        const selectedText = getSelectedText();
        if (selectedText) {
            if (!isExtensionContextValid()) {
                console.log('Extension context invalidated, keyboard shortcut failed');
                return;
            }
            try {
                chrome.runtime.sendMessage({ 
                    action: 'analyzeCode', 
                    selectedText: selectedText 
                });
            } catch (error) {
                console.log('Extension context invalidated, keyboard shortcut failed');
            }
        }
    }
});


function addCodeBlockButtons() {
    const codeBlocks = document.querySelectorAll('pre code, code, .highlight, .code-block');
    
    codeBlocks.forEach((block, index) => {
        if (block.dataset.analyzeButton) return; // Already has button
        
        const button = document.createElement('button');
        button.innerHTML = '🤖 Analyze';
        button.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;


        const parent = block.closest('pre') || block.parentElement;
        if (parent) {
            parent.style.position = 'relative';
            parent.appendChild(button);
            

            parent.addEventListener('mouseenter', () => {
                button.style.opacity = '1';
            });
            
            parent.addEventListener('mouseleave', () => {
                button.style.opacity = '0';
            });
            

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const codeText = block.textContent || block.innerText;
                if (!isExtensionContextValid()) {
                    console.log('Extension context invalidated, removing button');
                    button.remove();
                    return;
                }
                try {
                    chrome.runtime.sendMessage({ 
                        action: 'analyzeCode', 
                        selectedText: codeText 
                    });
                } catch (error) {
                    console.log('Extension context invalidated, button click failed');
                    button.remove();
                }
            });
            
            block.dataset.analyzeButton = 'true';
        }
    });
}


addCodeBlockButtons();


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            addCodeBlockButtons();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
