import * as vscode from 'vscode';
import * as path from 'path';
import { createFileManager } from "./fileManager";


export const syncSelectedFileAction = async () => {
    const fileManager = await createFileManager();

    if (fileManager) {
        const envFileQuickPickList: vscode.QuickPickItem[] = [];
        const fileNames = fileManager.targetFiles.map(file => path.basename(file.fsPath));


        fileNames.forEach((file, index) => {
            const fileName = file.split(".")[0];
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



export interface QuickPickItemExtended extends vscode.QuickPickItem {
    filePath: vscode.Uri;
}