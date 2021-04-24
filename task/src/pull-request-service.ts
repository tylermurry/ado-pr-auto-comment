import {getPersonalAccessTokenHandler, WebApi} from 'azure-devops-node-api';
import {CommentThreadStatus, GitPullRequestCommentThread} from "azure-devops-node-api/interfaces/GitInterfaces";

export default class PullRequestService {
    private readonly token: string;
    private readonly project: string;
    private readonly orgUrl: string;
    private readonly connection: WebApi;

    public constructor(token: string, project: string, orgUrl: string) {
        this.token = token;
        this.project = project;
        this.orgUrl = orgUrl;
        this.connection = new WebApi(orgUrl, getPersonalAccessTokenHandler(token));
    }

    public async getThreads(repoName: string, pullRequestId: number): Promise<GitPullRequestCommentThread[]> {
        console.log(`Getting active threads for ${repoName}/${pullRequestId}...`);
        const gitApi = await this.connection.getGitApi();

        return await gitApi.getThreads(repoName, pullRequestId, this.project);
    }

    public async addThread(repoName: string, pullRequestId: number, comment: string): Promise<void> {
        console.log(`Adding thread to pull request ${pullRequestId}: ${comment}...`);

        const gitApi = await this.connection.getGitApi();
        await gitApi.createThread({ status: CommentThreadStatus.Active, comments: [{ content: comment }]}, repoName, pullRequestId, this.project);
    }
}
