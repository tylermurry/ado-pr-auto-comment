import tl = require('azure-pipelines-task-lib/task');
import { WebApi } from 'azure-devops-node-api';
import executeTask from './task';

jest.mock('azure-devops-node-api');
jest.mock('azure-pipelines-task-lib/task');

const gitApiMock = {
    getThreads: jest.fn(),
    createThread: jest.fn(),
};
(WebApi as any).mockImplementation(() => ({ getGitApi: () => gitApiMock }));

jest.setTimeout(10000000);

describe('Integration Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Inputs
        (tl.getInput as any).mockReturnValueOnce('some-token');
        process.env.SYSTEM_TEAMPROJECT = 'team-project';
        process.env.BUILD_REPOSITORY_NAME = 'some-repo';
        process.env.SYSTEM_PULLREQUEST_PULLREQUESTID = '123456';
        process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI = 'some-org-url';
    })

    it('should fail because no comments were provided', async () => {
        (tl.getInput as any)
            .mockReturnValueOnce(null)
        gitApiMock.getThreads.mockReturnValueOnce([]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });

    it('should skip comments that are just whitespace', async () => {
        (tl.getInput as any)
            .mockReturnValueOnce("comment one\n   \ncomment two")
        gitApiMock.getThreads.mockReturnValueOnce([]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });

    it('should add comments to a pr that has none', async () => {
        (tl.getInput as any)
            .mockReturnValueOnce("comment one\ncomment two")
        gitApiMock.getThreads.mockReturnValueOnce([]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });

    it('should add comments to a pr that already has some', async () => {
        (tl.getInput as any)
            .mockReturnValueOnce("new comment one\nnew comment two")
        gitApiMock.getThreads.mockReturnValueOnce([
            { comments: [{content: "existing comment one"}] },
            { comments: [{content: "existing comment two"}] },
        ]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });

    it('should ignore a comment that already exists and add the rest', async () => {
        (tl.getInput as any)
            .mockReturnValueOnce("existing comment one\nnew comment two")
        gitApiMock.getThreads.mockReturnValueOnce([
            { comments: [{content: "existing comment one"}] },
            { comments: [{content: "existing comment two"}] },
        ]);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });

    it('should use provided newCommentDelimiter to split comments', async () => {
        const newCommentDelimiter = "||";

        (tl.getInput as any)
            .mockReturnValueOnce(`comment one${newCommentDelimiter}comment   \n  two${newCommentDelimiter}comment\n\nthree`)
            .mockReturnValueOnce(newCommentDelimiter);

        await executeTask();

        expect(tl.setResult).toMatchSnapshot();
        expect(gitApiMock.createThread).toMatchSnapshot();
    });
});
