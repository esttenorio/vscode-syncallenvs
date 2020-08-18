/*
 *   Copyright (c) 2020 
 *   All rights reserved.
 */
import * as vscode from 'vscode';
import * as path from 'path';
import { createFileManager } from "./fileManager";
import { FAMILY_SEPARATOR, EXTENSION_SEPARATOR } from './constants';


export const syncSelectedFileAction = async () => {
    const fileManager = await createFileManager();

    if (fileManager) {
        const envFileQuickPickList: vscode.QuickPickItem[] = [];
        const fileNames = fileManager.targetFiles.map(file => path.basename(file.fsPath));


        fileNames.forEach((file, index) => {
            const fileName = file.split(EXTENSION_SEPARATOR)[0];
            const filePath = fileManager.targetFiles[index];
            const envFileQuickPick: QuickPickItemExtended = {
                label: fileName,
                description: `${filePath.fsPath}`,
                filePath: filePath,
            };

            envFileQuickPickList.push(envFileQuickPick);
        });

        const selectedEnv: QuickPickItemExtended | undefined = (await vscode.window.showQuickPick(
            envFileQuickPickList,
        )) as QuickPickItemExtended | undefined;

        if (selectedEnv === undefined) {
            return;
        }

        fileManager.updateSelectedTargetFile(selectedEnv.filePath);
    }
}

export const syncAllEnvFilesAction = async () => {
    const fileManager = await createFileManager();

    if (fileManager) {
        vscode.window.showInformationMessage('Syncing All your .env files!');
        fileManager.updateAllTargetFiles();
    }
}

export const syncEnvFamily = async () => {
    const fileManager = await createFileManager();

    if (fileManager) {
        const envFileQuickPickList: vscode.QuickPickItem[] = [];
        const fileNames = fileManager.familyFiles.map(file => path.basename(file.fsPath));

        if (fileNames.length === 0) {
            vscode.window.showWarningMessage('No families found, feature cannot be used.');
            return;
        }


        fileNames.forEach((file, index) => {
            const fileName = file.split(EXTENSION_SEPARATOR)[0];
            const filePath = fileManager.familyFiles[index];
            const envFileQuickPick: QuickPickItemExtended = {
                label: fileName,
                description: `${filePath.fsPath}`,
                filePath: filePath,
            };

            envFileQuickPickList.push(envFileQuickPick);
        });

        const selectedEnv: QuickPickItemExtended | undefined = (await vscode.window.showQuickPick(
            envFileQuickPickList,
        )) as QuickPickItemExtended | undefined;

        if (selectedEnv === undefined) {
            return;
        }

        const familyMainFile = selectedEnv.filePath;
        const familyRootName = path.basename(familyMainFile.fsPath).split(EXTENSION_SEPARATOR)[0];
        const familyFiles = fileManager.targetFiles.filter((targetFile) => {
            const fileName = path.basename(targetFile.fsPath);

            if (fileName.split(FAMILY_SEPARATOR).length >= 2 && fileName.startsWith(familyRootName)) {
                return true;
            }
        });

        fileManager.updateAllFamilyFiles(familyFiles, familyMainFile);
    }
}



export interface QuickPickItemExtended extends vscode.QuickPickItem {
    filePath: vscode.Uri;
}