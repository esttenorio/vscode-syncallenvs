// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EXTENSION_NAME, TEMPLATE_FILENAME_SETTING, TARGET_PATTERN_SETTING, SYNC_ALL_ENV_FILES_ACTION } from './constants'
import { FileManager, createFileManager } from './fileManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log(`Extension "${EXTENSION_NAME}" is now active!`);

	// Actions
	let findAllEnvFiles = vscode.commands.registerCommand(SYNC_ALL_ENV_FILES_ACTION, async () => {
		
		const fileManager = await createFileManager();
		
		if (fileManager) {
			vscode.window.showInformationMessage('Syncing All your .env files!');
			fileManager.updateAllTargetFiles();
		}
	});

	context.subscriptions.push(findAllEnvFiles);
}

// this method is called when your extension is deactivated
export function deactivate() { }
