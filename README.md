# Microsoft Teams Git Push Notifier

This small Git hook notifies a Microsoft Teams channel as soon as a push is done to a certain remote branch. It can be used to cover the common scenario where a particular remmote branch is used to trigger a project build/deployment using a CI/CD platform such as TeamCity or Jenkins. We chose to provide this feature as a `pre-push` hook instead of a `post-update` or similar because not all Git services support server side hooks. Of course, the CI scenario is optional. You can use this hook just to notify your team whenever changes get pushed to a remote branch so that e.g. other team members can simply pull them.

## Setting Up

First of all, you will need to set up an *Incoming Webhook* connector on your Microsoft Teams channel. You can choose to use a single channel for all such updates, or have a separate channel per project. In any case you will need to [set up a custom incoming webhook][link-setup-webhook] on your channel(s). As soon as you have done this, for each of your Git repositories you wish to monitor, you will need to:

1. Copy the contents of the `src` directory into your `.git/hooks` directory (make sure you don't already have a `pre-push` hook in place);
2. Make sure the `.git/hooks/pre-push` file has execute permissions (you can `chmod 774 .git/hooks/pre-push` from `bash` to make sure of this);
3. In folder `.git/hooks/pre-push.d` create a `config.js` file using the `config.js.sample` file as an example;
4. In folder `.git/hooks/pre-push.d` run `npm install`.

## Configuring

The `config.js` file has the following options:

* `projectName` (string): you should put the name of your project here, as it will appear on the Teams message card
* `hardFail` (boolean): if `true`, push will fail if the Teams channel cannot be notified
* `themeColor` (hex color): the theme color of the Teams message card (the colored stripe appearing on its left)
* `activityImageUrl` (url, optional): the URL to an image that gets displayed to the left of the Teams message card title
* `webHookUrl` (url): the webhook URL obtained when you created the connector on your Teams channel
* `triggers` (array): a list of triggers (described below) - when any one of them fires, the Teams channel is notified

Each trigger can have three fields:

* `remote` (string): the name of the remote to which changes are pushed
* `branchName` (string): the name of the branch that gets pushed
* `detailsUrl` (url, optional): a URL to redirect the user from the Teams card (for example, containing details on the CI build that got initiated)

The trigger fires whenever a push is done to its `remote` for branch `branchName`.

## License

The project is licensed under the MIT license. See the LICENSE file for details.

[link-setup-webhook]: https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/connectors/connectors-using#setting-up-a-custom-incoming-webhook