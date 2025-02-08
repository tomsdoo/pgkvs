import eslintJs from "@eslint/js";
import importPlugin from 'eslint-plugin-import';
import globals from "globals";
import stylisticTs from '@stylistic/eslint-plugin-ts';
import nodePlugin from "eslint-plugin-n";
import promisePlugin from "eslint-plugin-promise";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import parserTs from '@typescript-eslint/parser';
import love from "eslint-config-love";
import { resolve as tsResolver } from 'eslint-import-resolver-typescript';

export default [
  eslintJs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  nodePlugin.configs["flat/recommended-script"],
  promisePlugin.configs["flat/recommended"],
  {
    ignores: [
      "dist/*",
      "eslint.config.js",
      "*.d.ts",
      "vitest.config.ts",
      "vitest.local.config.ts",
      "vitest.setup.ts",
      "vitest.workspace.ts",
    ],
  },
  {
    files: ["*.ts"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  {
    ...love,
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    settings: {
      "import/resolver": {
        node: true,
        typescript: {
          typescript: tsResolver,
          project: ["./tsconfig.json"],
        },
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs["recommended-type-checked"].rules,
      ...typescriptEslint.configs.strict.rules,
      ...typescriptEslint.configs["strict-type-checked"].rules,
      ...typescriptEslint.configs.stylistic.rules,
      "n/no-unpublished-import": "off",
      "n/no-missing-import": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/array-type": ["error", {
        default: "array-simple",
        readonly: "array-simple",
      }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    ...love,
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    files: ["__test__/**/*.test.ts"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    settings: {
      "import/resolver": {
        node: true,
        typescript: {
          typescript: tsResolver,
          project: ["./tsconfig.json"],
        },
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs["recommended-type-checked"].rules,
      ...typescriptEslint.configs.strict.rules,
      ...typescriptEslint.configs["strict-type-checked"].rules,
      ...typescriptEslint.configs.stylistic.rules,
      "n/no-unpublished-import": "off",
      "n/no-missing-import": "off",
      "@typescript-eslint/array-type": ["error", {
        default: "array-simple",
        readonly: "array-simple",
      }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    plugins: {
      "@stylistic/ts": stylisticTs,
    },
    files: ["*.ts"],
    languageOptions: {
      parser: parserTs,
    },
    rules: {
      "@stylistic/ts/indent": "off",
    },
  },
  eslintConfigPrettier,
];
