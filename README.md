# PR Auto-Comment
An easy way to automatically add comments to an Azure DevOps pull request

## Why would I use this?
Sometimes there are things a team would like developers to consider during a pull request.
Putting these in the description can help but is easily overlooked or ignored.

By automatically adding comments to the PR, this puts the owner in control of acknowledging and responding to each item.
If used with a branch policy that enforces comment resolution, it can also help enforce certain team policies that are difficult to automate

Here are some examples:
* Have you tested this change in the dev environment?
* Are there any feature flags associated with this change? If so, please confirm the change was tested with the flag both on and off and that the production flag is set to the correct starting value.
* Does the documentation need to be updated due to this change?
* etc...

## Install the Task for Your Organization
1. Install the `PR Auto-Comment` extension in your organization. [More information here.](https://docs.microsoft.com/en-us/azure/devops/marketplace/install-extension?view=azure-devops&tabs=browser)
1. Add the task into your pull request build:

    ```yml
    steps:
    - task: pr-auto-comment@1
      inputs:
        comments: |
          Has this been tested in the dev environment?
          Does the documentation need to be updated due to this change?
    ```
    If you are using the `System.AccessToken` (default), be sure to set `persistCredentials` to `true` if it's not already:
    ```yml
    steps:
    - checkout: self
      persistCredentials: true
    ```  
1. Grant the build job user the `Contribute to pull requests` permission to allow it to add pull request comments. [More information here.](https://docs.microsoft.com/en-us/azure/devops/organizations/security/set-git-tfvc-repository-permissions?view=azure-devops#set-git-repository-permissions)
1. Now you're to automatically add comments! 💥

# Task Options
| Property               | Required | Default Value                       | Description                                                                 |
| -----------------------|----------|-------------------------------------|-----------------------------------------------------------------------------|
| `accessToken`          | Yes      | `$(System.AccessToken)`             | The access token used to retrieve and update comments on the pull requests  |
| `comments   `          | Yes      |                                     | Newline-delimited comments that should be added to each PR.                 |

# Contribution
Found an issue or see something cool that's missing? Pull requests and issues are warmly accepted!   
