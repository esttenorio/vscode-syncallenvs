/*
 *   Copyright (c) 2020
 *   All rights reserved.
 */
import * as vscode from "vscode";
import * as path from "path";
import { createFileManager } from "./fileManager";
import { FAMILY_SEPARATOR, EXTENSION_SEPARATOR } from "./constants";

export const getEnvWithUniqueKeysFromTemplateAction = async () => {
  const fileManager = await createFileManager();

  if (fileManager) {
    const fileNames = fileManager.targetFiles.map((file) =>
      path.basename(file.fsPath)
    );

    const selectedEnv = await getQuickItemSelection(
      fileNames,
      fileManager.targetFiles,
      "Target .env file",
      "Select target file (a *-unique.env copy will be created)"
    );

    if (selectedEnv === undefined) {
      return;
    }

    const templateEnv = await getQuickItemSelection(
      fileNames,
      fileManager.targetFiles,
      "Reference .env file",
      "Select reference file to compare against"
    );

    if (templateEnv === undefined) {
      return;
    }

    fileManager.generateEnvFileWithUniqueKeysFromTemplate(
      selectedEnv.filePath,
      templateEnv.filePath
    );
  }
};

export const syncSelectedFileAction = async () => {
  const fileManager = await createFileManager();

  if (fileManager) {
    const fileNames = fileManager.targetFiles.map((file) =>
      path.basename(file.fsPath)
    );

    const selectedEnv = await getQuickItemSelection(
      fileNames,
      fileManager.targetFiles,
      "Target .env file",
      "Select target .env file"
    );

    if (selectedEnv === undefined) {
      return;
    }

    fileManager.updateSelectedTargetFile(selectedEnv.filePath);
  }
};

export const syncAllEnvFilesAction = async () => {
  const fileManager = await createFileManager();

  if (fileManager) {
    vscode.window.showInformationMessage("Syncing All your .env files!");
    fileManager.updateAllTargetFiles();
  }
};

export const syncEnvFamily = async () => {
  const fileManager = await createFileManager();

  if (fileManager) {
    const fileNames = fileManager.familyFiles.map((file) =>
      path.basename(file.fsPath)
    );

    if (fileNames.length === 0) {
      vscode.window.showWarningMessage(
        "No families found, feature cannot be used."
      );
      return;
    }

    const selectedEnv = await getQuickItemSelection(
      fileNames,
      fileManager.familyFiles,
      ".env family",
      "Select .env family file"
    );

    if (selectedEnv === undefined) {
      return;
    }

    const familyRootFile = selectedEnv.filePath;
    const familyFiles = getFamilyFiles(fileManager.targetFiles, familyRootFile);

    fileManager.updateAllFamilyFiles(familyFiles, familyRootFile);
  }
};

const getQuickItemSelection = async (
  fileNames: string[],
  fileNamesUri: vscode.Uri[],
  title: string | undefined = undefined,
  placeholder: string | undefined = undefined
): Promise<QuickPickItemExtended | undefined> => {
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

  const selectedEnv: QuickPickItemExtended | undefined =
    (await vscode.window.showQuickPick(envFileQuickPickList, {
      title: title,
      placeHolder: placeholder,
    })) as QuickPickItemExtended | undefined;

  return selectedEnv;
};

const getFamilyFiles = (
  files: vscode.Uri[],
  familyRootFile: vscode.Uri
): vscode.Uri[] => {
  const familyRootName = getFileBaseName(path.basename(familyRootFile.fsPath));

  return files.filter((targetFile) => {
    const fileName = path.basename(targetFile.fsPath);
    return (
      fileName.split(FAMILY_SEPARATOR).length >= 2 &&
      fileName.startsWith(familyRootName)
    );
  });
};

const getFileBaseName = (filename: string): string => {
  return filename.split(EXTENSION_SEPARATOR)[0];
};

export interface QuickPickItemExtended extends vscode.QuickPickItem {
  filePath: vscode.Uri;
}
