import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CloudFormationCustomResourceResponse} from "aws-lambda/trigger/cloudformation-custom-resource";
import {Client, ClientConfig} from "pg";
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

export abstract class Base {
    private _pgClient: Client

    get pgClient(): Client {
        return this._pgClient;
    }

    protected databaseName: string
    protected schemaName: string
    protected adminUsername: string

    protected get appRoleName(): string {
        return this.schemaName + '_app'
    }

    protected get migRoleName(): string {
        return this.schemaName + '_mig'
    }

    protected get readonlyRoleName(): string {
        return this.schemaName + '_readonly'
    }

    protected get all3roles() {
        return [this.appRoleName, this.migRoleName, this.readonlyRoleName];
    }

    public async handler(event: CloudFormationCustomResourceEvent): Promise<void | CloudFormationCustomResourceResponse> {
        console.log(`>>>base.handle>>>>`)

        const {
            schemaName,
        } = event.ResourceProperties
        this.schemaName = schemaName
        this.databaseName = process.env.databaseName!

        const adminSecretId = process.env.adminSecretId!;

        const admin = await this.userPass(adminSecretId)
        this.adminUsername = admin.username

        const pgClientConfig = {
            host: process.env.postgresHostname!,
            port: Number(process.env.postgresHostport!),
            user: admin.username,
            password: admin.password,
            database: this.databaseName,
            connectionTimeout: 300000,
            ssl: {
                rejectUnauthorized: false,
                requestCert: true
            }
        } as ClientConfig;

        const cp = {...pgClientConfig}
        cp.password = '***'

        console.log('pgClientConfig:' + JSON.stringify(cp))
        this._pgClient = new Client(pgClientConfig)
        await this._pgClient.connect()
        this._pgClient.on("drain", console.log)
        this._pgClient.on("error", console.error)
        this._pgClient.on("notice", console.log)
        this._pgClient.on("notification", console.warn)
        this._pgClient.on("end", console.log)
        console.log(`<<<base.handle<<<<`)
    }

    protected async userPass(secretId: string): Promise<{ username: string; password: string }> {

        const sm = new SecretsManagerClient({})

        for (let attemp = 0; attemp <= 9; attemp++) {
            try {
                const sv = await sm.send(new GetSecretValueCommand({SecretId: secretId}));

                return JSON.parse(sv.SecretString!) as { username: string, password: string }
            } catch (error: any) {
                if (error.code === 'AccessDeniedException') {
                    console.error(attemp + ', Access Denied:', error.message);
                    await new Promise(resolve => setTimeout(resolve, 1000))
                } else {
                    throw error
                }
            }
        }
        throw new Error('retry exhausted lookup for access denied: ')
    }


    protected async printUsrRoleStatus() {
        const rolePrvlg = await this._pgClient.query(`
            SELECT r.rolname,
                   r.rolsuper,
                   r.rolinherit,
                   r.rolcreaterole,
                   r.rolcreatedb,
                   r.rolcanlogin,
                   r.rolconnlimit,
                   r.rolvaliduntil,
                   ARRAY(SELECT b.rolname
             FROM pg_catalog.pg_auth_members m
                      JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
             WHERE m.member = r.oid) as memberof,
                   r.rolreplication,
                   r.rolbypassrls
            FROM pg_catalog.pg_roles r
            ORDER BY 1;`)
        console.log(JSON.stringify(rolePrvlg))

        const userOfRole = await this._pgClient.query(`
            SELECT r.rolname,
                   ARRAY(SELECT b.rolname
                        FROM pg_catalog.pg_auth_members m
                            JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
                        WHERE m.member = r.oid
                       ) as memberof
            FROM pg_catalog.pg_roles r
            ORDER BY 1;
        `)
        console.log(JSON.stringify(userOfRole))
    }

}
