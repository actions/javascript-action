# Slatify
This is Slack Notification for GitHub Actions.<br>
Generated from [actions/javascript-template](https://github.com/actions/javascript-template).

# Feature
- Notify the result of GitHub Actions

# How to use
First of all, you need to set GitHub secrets for SLACK_WEBHOOK that is Incoming Webhook URL.<br>
You can customize the following parameters:

|with parameter|required/optional|description|
|:--:|:--:|:--|
|type|required|GitHub Actions job is success or failure<br>This parameter value must contain 'success' or 'fail'<br>We recommend using ${{ job.status }}|
|job_name|required|Means slack notification title|
|icon_emoji|optional|Slack icon<br>default: github|
|username|optional|Slack username<br>default: Github Actions|
|channel|optional|Slack channel name<br>default: #general|

Please refer `action.yml` for more details.

## Example
```..github/workflows/main.yml
- name: Slack Notification
  uses: homoluctus/slatify@master
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Lint Check*'
    channel: '#random'
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

# Slack UI
## success

<img src="./github_actions_success.png" alt="github actions success pattern">

## failure

<img src="./github_actions_failure.png" alt="github actions failure pattern">

## Preview

<img src="./preview.png" alt="Notification Preview">
