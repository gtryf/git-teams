#!/usr/bin/env node

/*
 * Copyright (c) George Tryfonas, all rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const program = require('commander');
const { spawnSync } = require('child_process');
const request = require('sync-request');

const config = require('./config');

program
    .description('git pre-push hook')
    .usage('[options]')
    .option('-n, --remote-name <name>', 'Remote name')
    .option('-r, --remote-ref <ref>', 'Remote ref')
    .parse(process.argv);

if (program.remoteRef && program.remoteName) {
    main(program.remoteName, program.remoteRef);
    process.exit();
}

if (config.hardFail) {
    process.exit(1);
} else {
    process.exit();
}

function notifyTeam(trigger) {
    const webHookUrl = config.webHookUrl;

    const userNameProc = spawnSync('git', ['config', '--get', 'user.name']);
    const userEmailProc = spawnSync('git', ['config', '--get', 'user.email']);

    let name, email;
    if (userNameProc.stderr.toString()) {
        name = "Someone";
    } else {
        name = userNameProc.stdout.toString().trim();
    }
    if (userEmailProc.stderr.toString()) {
        email = "unknown email";
    } else {
        email = userEmailProc.stdout.toString().trim();
    }

    const card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": config.themeColor,
        "summary": "A branch was pushed to a remote",
        "sections": [
            {
                "activityTitle": `${name} (${email}) has pushed changes to the CI branch`,
                "activitySubtitle": `On Project **${config.projectName}**`,
                "markdown": true
            }, 
            {
                "title": "Details",
                "facts": [
                    {
                        "name": "Committer",
                        "value": `${name} (${email})`
                    },
                    {
                        "name": "Project",
                        "value": config.projectName
                    },
                    {
                        "name": "Remote",
                        "value": trigger.remote
                    },
                    {
                        "name": "Branch Name",
                        "value": trigger.branchName
                    }
                ]
            }
        ]
    };

    if (config.activityImageUrl) {
        card.sections[0].activityImage = config.activityImageUrl;
    }
    if (trigger.detailsUrl) {
        card.potentialAction = [{
            "@type": "OpenUri",
            "name": "Go to build",
            "targets": [
                { "os": "default", "uri": `${trigger.detailsUrl}` }
            ]
        }];
    }

    const req = request('POST', webHookUrl, {
        json: card
    });
    const res = JSON.parse(req.getBody('utf8'));
}

function main(name, ref) {
    const triggers = config.triggers.filter(i => i.remote === name && ref.endsWith(i.branchName));
    if (triggers.length) {
        notifyTeam(triggers[0]);
    }
}