/*
 *   Copyright (c) 2020 
 *   All rights reserved.
 */
import * as vscode from 'vscode';
import * as path from 'path';
import { createFileManager, FileManager } from "./fileManager";
import { FAMILY_SEPARATOR, EXTENSION_SEPARATOR } from './constants';


export const syncSelectedFileAction = async () => {
    const fileManager = await createFileManager();

    if (fileManager) {
        const fileNames = fileManager.targetFiles.map(file => path.basename(file.fsPath));

        const selectedEnv = await getQuickItemSelection(fileNames, fileManager.targetFiles);

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
        const fileNames = fileManager.familyFiles.map(file => path.basename(file.fsPath));

        if (fileNames.length === 0) {
            vscode.window.showWarningMessage('No families found, feature cannot be used.');
            return;
        }

        const selectedEnv = await getQuickItemSelection(fileNames, fileManager.familyFiles);

        if (selectedEnv === undefined) {
            return;
        }

        const familyRootFile = selectedEnv.filePath;
        const familyFiles = getFamilyFiles(fileManager.targetFiles, familyRootFile)

        fileManager.updateAllFamilyFiles(familyFiles, familyRootFile);
    }
}

const getQuickItemSelection = async (fileNames: string[], fileNamesUri: vscode.Uri[]): Promise<QuickPickItemExtended | undefined> => {
    const envFileQuickPickList: vscode.QuickPickItem[] = [];

    fileNames.forEach((file, index) => {
        const fileName = getFileBaseName(file);
        const filePath = fileNamesUri[index];
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

    return selectedEnv;
}

const getFamilyFiles = (files: vscode.Uri[], familyRootFile: vscode.Uri): vscode.Uri[] => {

    const familyRootName = getFileBaseName(path.basename(familyRootFile.fsPath));

    return files.filter((targetFile) => {
        const fileName = path.basename(targetFile.fsPath);
        if (fileName.split(FAMILY_SEPARATOR).length >= 2 && fileName.startsWith(familyRootName)) {
            return true;
        }
    });
}

const getFileBaseName = (filename: string): string => {
    return filename.split(EXTENSION_SEPARATOR)[0];
}

export interface QuickPickItemExtended extends vscode.QuickPickItem {
    filePath: vscode.Uri;
}