import { v7 as uuidv7 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { iColor } from "../types";

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
  colors: iColor[];
}) {
  const documentId = uuidv7();
  const marshalledItem = marshall({
    phrase,
    tokens,
    colors,
    id: documentId,
    timestamp: Date.now(),
  });

  const putItemPayload = {
    TableName: process.env.AWS_DDB_TABLE_NAME ?? "",
    Item: marshalledItem,
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
