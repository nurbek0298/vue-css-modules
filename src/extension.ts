import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const provider = vscode.languages.registerCompletionItemProvider(
		'vue',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const lineText = document.lineAt(position).text;
				if (!hasPrefix(lineText)) {
					return undefined;
				}

				const completionItem = createCompletionItem(lineText, position);

				return [
					completionItem
				];
			}
		},
		'$'
	);

	context.subscriptions.push(provider);
}

function hasPrefix(text: string) {
	return text.trim().startsWith('$');
}

function createCompletionItem(lineText: string, position: vscode.Position): vscode.CompletionItem {
	const className = getClassName(lineText);

    const completionItem = new vscode.CompletionItem(`$${className}`);
    completionItem.insertText = new vscode.SnippetString(getSnippetString(className));
    
	// Remove the prefix after the completion
    const editRange = new vscode.Range(
        position.line,
        lineText.length - lineText.trim().length,
        position.line,
        lineText.length - lineText.trim().length + 1
    );

    completionItem.additionalTextEdits = [vscode.TextEdit.delete(editRange)];

	completionItem.detail = 'add <div> with class binding';

    return completionItem;
}

function getClassName(text: string) {
	return text.trim().slice(1);
}

function getSnippetString(className: string) {
	const defaultSnippetString = `<div :class="\\$style.${className}">$0</div>`;
	const multiWordClassNameSnippetString = `<div :class="\\$style['${className}']">$0</div>`;

	if (hasSpecialCharacters(className)) {
		return multiWordClassNameSnippetString;
	}

	return defaultSnippetString;
}

function hasSpecialCharacters(text: string) {
	return /[^a-zA-Z0-9]/.test(text);
}