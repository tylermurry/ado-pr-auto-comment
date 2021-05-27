import tl = require('azure-pipelines-task-lib/task');
import PullRequestService from './pull-request-service';

export default async () => {
    try {
        const accessToken = tl.getInput('accessToken', true);
        const commentsInput = tl.getInput('comments', true);
        const newCommentDelimiter = tl.getInput('newCommentDelimiter', true);

        if (!accessToken) throw Error('accessToken must be provided');
        if (!commentsInput) throw Error('comments must be provided');
        if (!newCommentDelimiter) throw Error('newCommentDelimiter must be provided');

        if (!process.env.SYSTEM_TEAMPROJECT) throw Error('System.TeamProject must be provided');
        if (!process.env.BUILD_REPOSITORY_NAME) throw Error('Build.Repository.Name must be provided');
        if (!process.env.SYSTEM_PULLREQUEST_PULLREQUESTID) throw Error('System.PullRequest.PullRequestId must be provided');
        if (!process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI) throw Error('System.TeamFoundationCollectionUri must be provided');

        const project = process.env.SYSTEM_TEAMPROJECT;
        const repo = process.env.BUILD_REPOSITORY_NAME;
        const pullRequestId = parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTID);
        const orgURL = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
        const comments = commentsInput.split(newCommentDelimiter);

        const pullRequestService = new PullRequestService(accessToken, project, orgURL);
        const threads = await pullRequestService.getThreads(repo, pullRequestId);

        // Get all comments that are not already added to the PR
        const threadsContent = threads.map(t => t.comments[0].content);
        const commentsToAdd = comments.filter(c => !threadsContent.includes(c));

        for (const comment of commentsToAdd) {
            if (comment?.trim()) {
                await pullRequestService.addThread(repo, pullRequestId, comment);
            }
        }

        tl.setResult(tl.TaskResult.Succeeded, 'All comments have been added');
    }
    catch (err) {
        console.log(err);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
