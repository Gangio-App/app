import { connectToDatabase, getCollection } from '../lib/db';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function purgeServers(): Promise<void> {
  try {
    const dbInstance = await connectToDatabase(); // connectToDatabase returns Db instance directly
    const serversCollection = getCollection(dbInstance, 'servers');

    const count = await serversCollection.countDocuments();
    if (count === 0) {
      console.log('The \'servers\' collection is already empty.');
      return;
    }

    console.log(`The 'servers' collection currently contains ${count} documents.`);

    const answer = await new Promise<string>(resolve => {
      rl.question('Are you ABSOLUTELY SURE you want to delete ALL documents from the \'servers\' collection? This is IRREVERSIBLE. Type \'yes\' to confirm: ', resolve);
    });

    if (answer.toLowerCase() === 'yes') {
      console.log('Proceeding with deletion...');
      const result = await serversCollection.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} documents from the 'servers' collection.`);
    } else {
      console.log('Operation cancelled by user.');
    }
  } catch (error) {
    console.error('Error purging servers collection:', error);
  } finally {
    // The MongoClient is managed by lib/db.ts and is not exposed for external closing here.
    // The connection will close when the script process ends or based on pooling settings.
    rl.close();
  }
}

purgeServers();
