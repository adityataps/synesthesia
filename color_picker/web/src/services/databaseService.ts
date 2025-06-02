import { v7 as uuidv7 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

let ddbClient: DynamoDBClient;

async function connect() {
  if (!ddbClient) {
    ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  }
  return ddbClient;
}

async function saveSampleToDatabase({
  phrase,
  tokens,
  colors,
}: {
  phrase: string;
  tokens: string[];
  colors: string[];
}) {
  const documentId = uuidv7();
  const putItemPayload = {
    TableName: process.env.AWS_DDB_TABLE_NAME ?? "",
    Item: {
      Id: { S: documentId },
      Timestamp: { N: `${Date.now()}` },
      Phrase: { S: phrase },
      Tokens: { L: tokens.map((token) => ({ S: token })) },
      Colors: { L: colors.map((color) => ({ S: color })) },
    },
  };
  console.debug(`Saving sample to database: ${JSON.stringify(putItemPayload)}`);

  try {
    await ddbClient.send(new PutItemCommand(putItemPayload));
    console.debug(`Saved sample to database with document ID: '${documentId}'`);
  } catch (e) {
    console.error(`Could not save sample to database: ${(e as Error).message}`);
    throw e;
  }
}

export { connect, saveSampleToDatabase };
