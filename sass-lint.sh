#!/usr/bin/env bash
SASS_LINT_OUTPUT=$(node_modules/.bin/sass-lint -v)

if [ -n "$SASS_LINT_OUTPUT" ]; then
  echo "$SASS_LINT_OUTPUT"
  exit 1
fi