import * as fs from 'fs';
import * as path from 'path';
import { KeystoreFile } from './keyManagement/keyStorage'; 
import { createTransaction } from './transactions/transaction';
import { signTransaction, SignedTransaction } from './transactions/signer';
import { verifySignedTransaction, VerificationResult } from './transactions/verifier';

//THIS CLASS WORKS AS THE MAIN INTERFACE BETWEEN THE GUI AND THE COLD WALLET, MAKE US ABLE TO CREATE DIFFERENTE INSTANCES OF WALLETS AND GIVE THE METHDOS TO MAKE THEM INTERACT
//I WILL PUT THE ARCHITECTURE DIAGRAM LATER
export class Wallet {
    // Public identity of the user/wallet
    public readonly address: string;
    public readonly publicKeyBase64: string;
    
    // Paths of the system file for this instance of the object
    public readonly rootDir: string;
    public readonly inboxPath: string;
    public readonly outboxPath: string;

    // We make a must use create, so we can use  ASYNC to build the object || ASYNC CAN'T BE INSIDE THE CONSTRUCTOR OF A CLASS
    private constructor(address: string, publicKeyBase64: string, rootDir: string) {
        this.address = address;
        this.publicKeyBase64 = publicKeyBase64;
        this.rootDir = rootDir;
        
        this.inboxPath = path.join(rootDir, 'inbox');
        this.outboxPath = path.join(rootDir, 'outbox');
        
        this.ensureDirectories(); //doublecheck that the file system of this wallet was created
    }

    /**
     * This method generates a pair ok keys, and with this create the identity of the wallet. Generates a new instance of a wallet in the PC
     * 
     * @remark We're using the FACTORY pattern to build the functionality of the constructor in a static method and outside the constructor, due that we need ASYNC
     * 
     * @param passphrase - password of the wallet in a string
     * @param rootDirectory - Directory determinated by the GUI or the main class to creae  a "network" between the instances of wallet
     * @returns - a complete Wallet object
     * 
     */
    static async create(passphrase: string, rootDirectory: string): Promise<Wallet> {
        if (!fs.existsSync(rootDirectory)) {
            fs.mkdirSync(rootDirectory, { recursive: true });
        }

        const keystorePath = path.join(rootDirectory, 'keystore.json'); //Create the path for the keystore file
        console.log(`Creating wallet at ${keystorePath}...`);
        
        const { address, pubkey } = await KeystoreFile.create(passphrase, keystorePath); //creation of the pair of keys and the identity of the wallet

        return new Wallet(address, pubkey, rootDirectory);
    }
    
    /**
     * I don't know if this method is going to be used bu if a Keystore file exists, this methods can build a instance of wallet using a created keystore file instead of building one file.
     * 
     * @remark We're using the FACTORY pattern to build the functionality of the constructor in a static method and outside the constructor, due that we need ASYNC
     * 
     * @param passphrase - password of the wallet in a string
     * @param rootDirectory - Directory provided by the user to find the KeyStore file
     * @returns - a complete Wallet object
     * 
     */
    static async load(passphrase: string, rootDirectory: string): Promise<Wallet> {
        const keystorePath = path.join(rootDirectory, 'keystore.json');
        
        const keys = await KeystoreFile.load(passphrase, keystorePath);//using the password load the pair of keys from the vault
        keys.secretKey.fill(0); //zeroize the private key because we just need the public for load the identity of the wallet

        const pubKeyStr = Buffer.from(keys.publicKey).toString('base64');
        
        return new Wallet(keys.address, pubKeyStr, rootDirectory);
    }

    /**
     * This method use the transactions module to create a transacton file, sign it and send it to the receiver
     * 
     * @param toAddress -  addres from the public key of the receiver, is a string
     * @param amount - amount to send of crypto money
     * @param passphrase - password for load the private key from the vault and sign it, is a string
     * @param receiverInboxPath - where to send the message, is a string
     * @returns - the filename of the created transaction
     */
    async sendTransaction(
        toAddress: string, 
        amount: number | string, 
        passphrase: string, 
        receiverInboxPath?: string
    ): Promise<string> {
        console.log(`\nBeginning the transaction: ${this.address} -> ${toAddress}`);

        // We create the transaction
        const nonce = Date.now().toString(); //Only used this for tests, change for a crypto nonce 
        
        const { tx } = createTransaction({
            from: this.address,
            to: toAddress,
            value: amount,
            nonce: nonce
        });

        // Loads the private key to  sign
        const keystorePath = path.join(this.rootDir, 'keystore.json');
        const keys = await KeystoreFile.load(passphrase, keystorePath);
        const signedTx = await signTransaction(keys.secretKey, tx, keys.publicKey);
    
        keys.secretKey.fill(0); //Zeorize the secret after sign

        //Saves the transaction in the outbox of the sender
        const filename = `tx_${nonce}.json`;
        const myOutboxFile = path.join(this.outboxPath, filename);
        
        fs.writeFileSync(myOutboxFile, JSON.stringify(signedTx, null, 2));
        console.log(`Saved in local outbox: ${myOutboxFile}`);

        // SIMULATION OF TRANSACTION, stoarge the same transaction in the inbox of the receiver. The "network" (simulated directions) are managed outside the class
        if (receiverInboxPath && fs.existsSync(receiverInboxPath)) {
            const destFile = path.join(receiverInboxPath, filename);
            fs.copyFileSync(myOutboxFile, destFile);
            console.log(`Saved on the receiver inbox: ${destFile}`);
        } else {
            console.warn(`The transaction in  ${receiverInboxPath} was not completed.`);
        }

        return filename;
    }

    /**
     * This method use the transactions module to verify a received transaction file
     * 
     * @remarks You can´t use this method without using the getInboxFiles in the simulation, for testts you can just write the names of the transactions searching in the file system
     * 
     * @param filename - a string filename of the transaction obtained from get and choose some of the inbox files
     * @returns - true or false dependenfing if the transaction is valid, boolean
     */
    async verifyInboxFile(filename: string): Promise<VerificationResult> {
        const filePath = path.join(this.inboxPath, filename);
        
        if (!fs.existsSync(filePath)) {
            return { valid: false, reason: "The file doesn't exists in the inbox" };
        }

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');//Read the transatcion
            const signedTx: SignedTransaction = JSON.parse(fileContent);

            console.log(`\nVerifiying the sign in the transaction:: ${filename}...`);
            const result = await verifySignedTransaction(signedTx);
            
            return result;

        } catch (error: any) {
            return { valid: false, reason: `Error in the transaction file: ${error.message}` };
        }
    }

    /**
     * This method monitors the inbox of the instance to get the new transactions received
     * 
     * @remarks This method works together with the verifyInboxFile methods, is public beacuse is needed to create the simulation
     * 
     * @returns - an array with the file names of the transactions in inbox
     */
    getInboxFiles(): string[] {
        if (!fs.existsSync(this.inboxPath)) return [];
        return fs.readdirSync(this.inboxPath).filter(f => f.endsWith('.json'));
    }
    
        /**
     * This method is just a support of the constructor to ensure that the filesystem of the wallet was properly created 
     * 
     * @returns - true or false depnding if the directory exists, boolean
     */
    private ensureDirectories() {
        if (!fs.existsSync(this.inboxPath)) fs.mkdirSync(this.inboxPath, { recursive: true });
        if (!fs.existsSync(this.outboxPath)) fs.mkdirSync(this.outboxPath, { recursive: true });
    }
}