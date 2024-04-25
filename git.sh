#!/bin/bash
branch_name=$(git rev-parse --abbrev-ref HEAD)

jira_name=$(echo "$branch_name" | grep -oE 'DIGIHUB-[0-9]+' | head -1)

commit_message="feat: $jira_name $@"

git commit -m "$commit_message"