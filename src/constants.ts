/*
 *   Copyright (c) 2020
 *   All rights reserved.
 */
export const ENV_SEPARATOR = "=";
export const COMMENT_SEPARATOR = "#";
export const EXTENSION_SEPARATOR = ".";
export const FAMILY_SEPARATOR = "-";

export const DOT_ENV_FILE = `${EXTENSION_SEPARATOR}env`;

export const EXTENSION_NAME = "syncallenvs";

export const UNIQUE_ENV_SUFFIX = "-unique.env";

// Settings
export const TEMPLATE_FILENAME_SETTING = "templateFilename";
export const TARGET_PATTERN_SETTING = "targetFilenamePattern";

// Actions
export const SYNC_ALL_ENV_FILES_ACTION = `${EXTENSION_NAME}.syncAllEnvFiles`;
export const SYNC_SELECTED_ENV_FILES_ACTION = `${EXTENSION_NAME}.syncSelectedEnvFile`;
export const SYNC_ENV_FAMILY_FILES_ACTION = `${EXTENSION_NAME}.syncEnvFamily`;
export const GEN_UNIQUE_KEYS_ENV_FROM_TEMPLATE = `${EXTENSION_NAME}.generateEnvWithUniqueKeysOnly`;

// Text
export const UNMATCHED_VARS_MESSAGE =
  "#====================\n# Unmatched strings\n#====================";
