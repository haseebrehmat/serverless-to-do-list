# Serverless To-Do API

This project implements a serverless API for a to-do list application using AWS Lambda, Node.js, and TypeScript. The API fetches a list of tasks from a DynamoDB table (named `TasksTable`) and returns a JSON response containing an array of tasks. It is designed using OOP principles, with asynchronous operations and proper error handling.

## Project Structure

```
serverless-todo-api/
├── package.json           # Project configuration and dependency management
├── serverless.yml         # Serverless Framework configuration for deployment on LocalStack
├── tsconfig.json          # TypeScript configuration
└── src
    └── lambdaFunction.ts  # AWS Lambda function implementation
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for running LocalStack)
- [Serverless Framework](https://www.serverless.com/) (installed globally)

## Setup Instructions

1. **Clone the Repository & Navigate to the Project Directory**

   ```bash
   git clone https://github.com/haseebrehmat/serverless-to-do-list
   cd serverless-todo-api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure TypeScript**

   Your `tsconfig.json` is already set up to compile your TypeScript files. To build the project, run:

   ```bash
   npm run build
   ```

4. **Run Locally**

   You can test your Lambda function locally using `ts-node`:

   ```bash
   npm run start
   ```

   This command will execute `src/lambdaFunction.ts` and simulate a Lambda invocation.

## LocalStack Setup

LocalStack simulates AWS services locally. To deploy and test your function on LocalStack:

1. **Start LocalStack**

   Run LocalStack via Docker:

   ```bash
   docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
   ```

2. **Set Environment Variables**

   In a new terminal window, export the following variables to use dummy AWS credentials and ensure LocalStack endpoints are used:

   ```bash
   export AWS_ACCESS_KEY_ID="dummy"
   export AWS_SECRET_ACCESS_KEY="dummy"
   export AWS_REGION="us-east-1"
   export LOCALSTACK="true"
   export AWS_ENDPOINT_URL="http://127.0.0.1:4566"
   export AWS_STS_ENDPOINT="http://127.0.0.1:4566"
   export SLS_SKIP_REQUEST_ACCOUNT_ID=1
   ```

3. **Create the DynamoDB Table**

   Use the AWS CLI (targeting LocalStack) to create the `TasksTable`:

   ```bash
   aws --endpoint-url=http://127.0.0.1:4566 dynamodb create-table \
       --table-name TasksTable \
       --attribute-definitions AttributeName=id,AttributeType=S \
       --key-schema AttributeName=id,KeyType=HASH \
       --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

## Deployment to LocalStack with Serverless Framework

1. **Ensure Serverless Framework and Plugin Are Installed**

   If you haven’t installed the Serverless Framework globally, run:

   ```bash
   npm install -g serverless
   ```

   The `serverless-localstack` plugin is included as a dev dependency in your project.

2. **Review the `serverless.yml` File**

   Your `serverless.yml` is configured to deploy your function to LocalStack (using IPv4):

   ```yaml
   service: serverless-todo-api

   provider:
     name: aws
     runtime: nodejs14.x
     region: us-east-1
     environment:
       TASKS_TABLE: TasksTable
       LOCALSTACK: "true"

   plugins:
     - serverless-localstack

   custom:
     localstack:
       host: "127.0.0.1"
       edgePort: 4566
       stages:
         - local

   functions:
     lambda:
       handler: lambdaFunction.handler
       events:
         - http:
             path: tasks
             method: get
   ```

3. **Deploy to LocalStack**

   Run the following command:

   ```bash
   sls deploy --stage local
   ```

   This command packages and deploys your Lambda function to LocalStack.

4. **Test the Deployed Function**

   You can invoke the function directly using:

   ```bash
   sls invoke -f lambda --stage local
   ```

   Or, if your function is triggered via HTTP (configured in `serverless.yml`), use the endpoint URL provided in the deploy output:

   ```bash
   curl <endpoint-url>/tasks
   ```

## Code Overview

- **`lambdaFunction.ts`:**  
  Contains the Lambda function and a `TaskService` class that encapsulates the logic for fetching tasks from DynamoDB. It uses the AWS SDK v3 (DynamoDBClient and DynamoDBDocumentClient) along with async/await.

- **Error Handling:**  
  Errors are caught and returned as HTTP 500 responses with descriptive error messages.

- **OOP Principles:**  
  The `TaskService` class encapsulates the interaction with DynamoDB, making the code modular and maintainable.

## License

[MIT License](LICENSE)