/*
 *   Copyright (c) 2020
 *   All rights reserved.
 */
import * as vscode from "vscode";
import * as path from "path";
import { writeFileSync, readFileSync } from "fs";
import {
  ENV_SEPARATOR,
  COMMENT_SEPARATOR,
  FAMILY_SEPARATOR,
  UNMATCHED_VARS_MESSAGE,
  EXTENSION_NAME,
  TARGET_PATTERN_SETTING,
  TEMPLATE_FILENAME_SETTING,
  EXTENSION_SEPARATOR,
  DOT_ENV_FILE,
  UNIQUE_ENV_SUFFIX,
} from "./constants";

export const createFileManager = async () => {
  const templateName = vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .get(TEMPLATE_FILENAME_SETTING);
  const targetFilePattern = vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .get(TARGET_PATTERN_SETTING);

  // Setup
  return await vscode.workspace
    .findFiles(`**/${templateName}`, undefined, 1)
    .then(async (templateFile) => {
      if (templateFile.length === 0) {
        vscode.window.showWarningMessage(
          `Template file "${templateName}" not found in working directory`
        );
        return;
      }

      const targetFiles = await vscode.workspace.findFiles(
        `**/${targetFilePattern}`,
        DOT_ENV_FILE
      );
      if (targetFiles.length === 0) {
        vscode.window.showWarningMessage(
          `No files following the pattern "${targetFilePattern}" were found`
        );
        return;
      }

      return new FileManager(templateFile[0], targetFiles);
    });
};

export class FileManager {
  public readonly templateFile: vscode.Uri;
  public readonly targetFiles: vscode.Uri[];
  public readonly familyFiles: vscode.Uri[];

  constructor(templateFile: vscode.Uri, targetFiles: vscode.Uri[]) {
    this.templateFile = templateFile;
    this.targetFiles = targetFiles;
    this.familyFiles = this.getFamilyFiles(targetFiles);
  }

  private getFamilyFiles(targetFiles: vscode.Uri[]): vscode.Uri[] {
    return targetFiles.filter((targetFile) => {
      const fileName = path
        .basename(targetFile.fsPath)
        .split(EXTENSION_SEPARATOR)[0];
      return fileName && !fileName.includes(FAMILY_SEPARATOR);
    });
  }

  public updateSelectedTargetFile(
    targetFile: vscode.Uri,
    templateFile: vscode.Uri | undefined = undefined
  ) {
    const fileName = targetFile.fsPath;
    vscode.window.showInformationMessage("Syncing " + fileName);
    // 1. Extract content of existing
    const extractedContent = this.extractContentFromTargetFile(targetFile);

    // 2. Replace all content with template content
    const template = templateFile ? templateFile : this.templateFile;
    this.writeFile(targetFile, this.readFile(template));

    // 3. Populate new content with old keys if found
    this.populateFileWithValues(targetFile, extractedContent);
    vscode.window.showInformationMessage("File " + fileName + " is synced");
  }

  public updateAllTargetFiles() {
    this.updateAllFamilyFiles(this.targetFiles);
  }

  public updateAllFamilyFiles(
    familyFiles: vscode.Uri[],
    templateFile: vscode.Uri | undefined = undefined
  ) {
    familyFiles.forEach((targetFile) => {
      this.updateSelectedTargetFile(targetFile, templateFile);
    });
  }

  public generateEnvFileWithUniqueKeysFromTemplate(
    targetFile: vscode.Uri,
    templateFile: vscode.Uri | undefined = undefined
  ) {
    const fileName = targetFile.fsPath;
    vscode.window.showInformationMessage(
      "Generating env with unique keys: " + fileName
    );

    const template = templateFile ? templateFile : this.templateFile;

    // 1. Extract of files
    const targetExtractedContent =
      this.extractContentFromTargetFile(targetFile);
    const templateExtractedContent =
      this.extractContentFromTargetFile(template);
    const outputMap: VariableContentMap = {};

    // 2.
    Object.keys(templateExtractedContent).forEach((key) => {
      const templateValue = templateExtractedContent[key].value;
      const targetValue =
        key in targetExtractedContent ? targetExtractedContent[key].value : "";
      if (targetValue === templateValue) {
        outputMap[key] = { used: true, value: "" };
      } else {
        outputMap[key] = { used: true, value: targetValue };
      }
    });

    const outputFileUri = this.convertTargetFileToUniqueFileEnv(targetFile);

    // 3. Replace all content with template content
    this.writeFile(outputFileUri, this.readFile(template));

    // 4. Populate new content with keys if present
    this.populateFileWithValues(outputFileUri, outputMap, true);
    vscode.window.showInformationMessage(
      "File " + outputFileUri.fsPath + " was generated"
    );
  }

  private convertTargetFileToUniqueFileEnv(filePath: vscode.Uri) {
    const root = filePath.fsPath.split(".env")[0];
    return vscode.Uri.file(root + UNIQUE_ENV_SUFFIX);
  }

  private readFile(filePath: vscode.Uri): Buffer {
    return readFileSync(filePath.fsPath);
  }

  private getFileContentInLines(filePath: vscode.Uri) {
    return this.readFile(filePath).toString().split("\n");
  }

  private writeFile(fileUri: vscode.Uri, fileContent: Buffer) {
    writeFileSync(fileUri.fsPath, fileContent);
  }

  private extractContentFromTargetFile(
    targetFile: vscode.Uri
  ): VariableContentMap {
    const rawContent = this.getFileContentInLines(targetFile);

    const extractedContent: VariableContentMap = {};

    rawContent.forEach((line) => {
      const lineContent = this.getKeyAndValue(line);
      if (lineContent) {
        extractedContent[lineContent[0]] = {
          value: lineContent[1]!,
          used: true,
        };
      }
    });

    return extractedContent;
  }

  private getKeyAndValue(line: string): [string, string?] | undefined {
    const strippedLine = line.trim();
    if (this.isNotCommentLine(strippedLine)) {
      // Line contents information
      return this.extractKeyAndValue(strippedLine);
    }

    return undefined;
  }

  private isNotCommentLine(line: string): boolean {
    return (
      line.length > 0 &&
      (line[0] !== COMMENT_SEPARATOR || line.indexOf("\n") == 0)
    );
  }

  private populateFileWithValues(
    filePath: vscode.Uri,
    content: VariableContentMap,
    forceNewValue: boolean = false
  ) {
    const rawContent = this.getFileContentInLines(filePath);

    rawContent.forEach((line, index) => {
      const strippedLine = line.trim();
      if (this.isNotCommentLine(strippedLine)) {
        // Replace empty space with old content

        const result = this.extractKeyAndValue(strippedLine);
        const key = result[0];
        const newValue = result[1];
        const oldValue = content[key] ? content[key] : undefined;

        if (forceNewValue) {
          const lineEnvValue = oldValue?.value;
          rawContent[index] = lineEnvValue
            ? `${key}${ENV_SEPARATOR}${lineEnvValue}`
            : "";
        } else if (oldValue?.value) {
          // Replace content only if template doesnt have new value
          // Saving "used" state
          oldValue!.used = true;
          content[key] = oldValue;

          if (newValue?.length === 0) {
            // Replacing content
            rawContent[index] = line.replace(
              ENV_SEPARATOR,
              ENV_SEPARATOR + oldValue!.value
            );
          }
        }
      }
    });

    // Adding unmatched values to file

    const keys = Object.keys(content);

    const unmatchedValues = keys.filter((key) => {
      return !content[key]?.used && content[key].value;
    });

    if (unmatchedValues.length > 0) {
      rawContent.push(UNMATCHED_VARS_MESSAGE);

      unmatchedValues.forEach((key) => {
        rawContent.push(key + ENV_SEPARATOR + content[key].value);
      });
    }

    this.writeFile(filePath, Buffer.from(rawContent.join("\n")));
  }

  private extractKeyAndValue(line: string): [string, string?] {
    const entry = line.split(ENV_SEPARATOR);
    const key = entry[0];
    const value =
      entry.length > 1 ? entry.slice(1).join(ENV_SEPARATOR) : undefined;

    return [key, value];
  }
}

type VariableContentMap = { [key: string]: VariableContent };

interface VariableContent {
  value: string;
  used: boolean;
}
