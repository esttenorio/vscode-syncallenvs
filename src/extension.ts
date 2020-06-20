// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DEFAULT_TEMPLATE_NAME, TARGET_FILE_PATTERN  } from './constants'
import { FileManager } from './fileManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "syncallenvs" is now active!');

	let findAllEnvFiles = vscode.commands.registerCommand('syncallenvs.syncAllEnvFiles', async () => {
		// TODO: Add support for changing template and target files on settings
		const fileManager = await vscode.workspace
			.findFiles(`**/'${DEFAULT_TEMPLATE_NAME}`, undefined, 1)
			.then(async templateFile => 
			{
				if (templateFile.length === 0)
				{
					vscode.window.showWarningMessage(`Template file "${DEFAULT_TEMPLATE_NAME}" not found in working directory`);
					return;
				}

				const targetFiles = await vscode.workspace.findFiles(`**/${TARGET_FILE_PATTERN}`, ".env");
				if (targetFiles.length === 0)
				{
					vscode.window.showWarningMessage(`No files following the pattern "${TARGET_FILE_PATTERN}" were found`);
					return;
				}

				return new FileManager(templateFile[0], targetFiles);
			});

		if (fileManager){
			vscode.window.showInformationMessage('Syncing All your .env files!');
			fileManager.updateAllTargetFiles();
		}
	});

	context.subscriptions.push(findAllEnvFiles);
}

// this method is called when your extension is deactivated
export function deactivate() {}
