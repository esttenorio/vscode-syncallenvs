/*
 *   Copyright (c) 2020 
 *   All rights reserved.
 */
import * as vscode from 'vscode';
import { EXTENSION_NAME, SYNC_ALL_ENV_FILES_ACTION, SYNC_SELECTED_ENV_FILES_ACTION, SYNC_ENV_FAMILY_FILES_ACTION } from './constants'
import { syncSelectedFileAction, syncAllEnvFilesAction, syncEnvFamily } from './actions';

export async function activate(context: vscode.ExtensionContext) {
	console.log(`Extension "${EXTENSION_NAME}" is now active!`);

	// Actions
	let syncAllEnvFiles = vscode.commands.registerCommand(SYNC_ALL_ENV_FILES_ACTION, async () => {
		await syncAllEnvFilesAction();
	});

	let syncSelectedFile = vscode.commands.registerCommand(SYNC_SELECTED_ENV_FILES_ACTION, async () => {
		await syncSelectedFileAction()
	});

	let syncFamilyFiles = vscode.commands.registerCommand(SYNC_ENV_FAMILY_FILES_ACTION, async () => {
		await syncEnvFamily()
	});

	context.subscriptions.push(syncAllEnvFiles);
	context.subscriptions.push(syncSelectedFile);
	context.subscriptions.push(syncFamilyFiles);
}


export function deactivate() { }
