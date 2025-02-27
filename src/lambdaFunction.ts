import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

class TaskService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const isLocal = process.env.LOCALSTACK === 'true';
    const client = new DynamoDBClient({
      endpoint: isLocal ? 'http://127.0.0.1:4566' : undefined,
      region: 'us-east-1',
    });
    // Create a DocumentClient from the low-level DynamoDB client
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.TASKS_TABLE || 'TasksTable';
  }

  public async getTasks(): Promise<Task[]> {
    const params = { TableName: this.tableName };
    try {
      // Send the scan command using the DocumentClient
      const result = await this.docClient.send(new ScanCommand(params));
      // Map the result to your Task type
      const tasks: Task[] = (result.Items || []).map(item => ({
        id: item.id,
        title: item.title,
        completed: item.completed,
      }));
      return tasks;
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error}`);
    }
  }
}

// Lambda handler function
export const handler = async (event: any = {}): Promise<any> => {
  const taskService = new TaskService();
  try {
    const tasks = await taskService.getTasks();
    return {
      statusCode: 200,
      body: JSON.stringify(tasks),
    };
  } catch (error) {
    let errorMessage = "Code failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
};

// If running directly
if (require.main === module) {
  handler({}).then(response => {
    console.log("Lambda Response:", response);
  }).catch(error => {
    console.error("Lambda Error:", error);
  });
}