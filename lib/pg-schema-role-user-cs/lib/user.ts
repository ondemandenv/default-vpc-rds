import {Base} from "./base";
import {CloudFormationCustomResourceEvent} from "aws-lambda";
import {CloudFormationCustomResourceResponse} from "aws-lambda/trigger/cloudformation-custom-resource";
import {
    CreateSecretCommand,
    DeleteSecretCommand,
    SecretsManagerClient
} from "@aws-sdk/client-secrets-manager";

export class User extends Base {

    public async handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
        const {
            roleType,
            userName
        } = event.ResourceProperties

        if (!['app', 'readonly', 'migrate'].includes(roleType)) {
            throw `input role name has to be one of 'app', 'readonly', 'migrate', but found ${roleType}`
        }

        const roleName = this.all3roles.find(r => r.endsWith(roleType))!
        if (!roleName) {
            throw new Error(`role type: ${roleType} can't find it's name !`)
        }

        if (this.adminUsername == userName) {
            throw new Error("can't operate on admin user")
        }

        let PhysicalResourceId: string
        const Data = {} as { [k: string]: string; }

        if (event.RequestType == 'Create') {
            const stackIdId = event.StackId.split('/')
            const cred = {username: userName, password: this.generateRandomString(16)};
            const sm = new SecretsManagerClient({})
            const created = await sm.send(new CreateSecretCommand({
                Name: process.env.secretPath! + '/' + userName + stackIdId[stackIdId.length - 1] + new Date().getTime(),
                SecretString: JSON.stringify(cred)
            }))

            PhysicalResourceId = created.Name!
            Data['userSecretId'] = created.Name!

            await this.pgClient.query(`create user "${userName}" with password '${cred.password}'`)
            console.log(`>>>::::grant ${roleName} to ${userName}`)
            const tt = await this.pgClient.query(`grant ${roleName} to "${userName}"`)
            console.log(`<<<::::grant ${roleName} to ${userName}`)
            console.log(JSON.stringify(tt))

            await this.pgClient.query(`grant "${userName}" to "${this.adminUsername}"`)
            await this.postCreatingUser(userName)
        } else {
            PhysicalResourceId = event.PhysicalResourceId
            Data['userSecretId'] = PhysicalResourceId
            const userSecretId = PhysicalResourceId

            if (event["RequestType"] == 'Delete') {
                await this.deleteUsrRole(userName);
                const sm = new SecretsManagerClient({})
                await sm.send(new DeleteSecretCommand({SecretId: userSecretId}))
            } else if (event["RequestType"] == 'Update') {
                const oldRoleName = this.all3roles.find(r => r.endsWith(event.OldResourceProperties['roleType']))!
                const oldUsr = event.OldResourceProperties['userName'];
                if (oldRoleName != roleName || oldUsr != userName) {
                    await this.pgClient.query(`revoke ${oldRoleName} from "${oldUsr}"`)
                    await this.pgClient.query(`grant ${roleName} to "${userName}"`)
                }
                if (userSecretId != event.OldResourceProperties.userSecretId) {
                    const cred = await this.userPass(userSecretId)
                    if (userName != cred.username) {
                        throw new Error("userName from secret is not same as input!")
                    }
                    await this.pgClient.query(`ALTER USER "${userName}" WITH PASSWORD "${cred.password}"`)
                }
            } else {
                throw new Error('N/A')
            }
        }
        return {
            PhysicalResourceId,
            StackId: event.StackId,
            RequestId: event.RequestId,
            Data,
            Status: "SUCCESS",
            LogicalResourceId: event.LogicalResourceId
        }
    }

    protected async deleteUsrRole(userName: any) {
        console.log(`deleting user: ${userName}`)
        await this.pgClient.query(`REASSIGN OWNED BY "${userName}" TO ${this.migRoleName}`)
        await this.preDeletingUser(userName)
        await this.pgClient.query(`drop user "${userName}"`)
        console.log(`deleted user: ${userName}`)
    }

    protected async postCreatingUser(username: string) {
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" GRANT insert, select, update, delete ON TABLES TO ${this.appRoleName}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO  ${this.appRoleName}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" GRANT select ON TABLES TO ${this.readonlyRoleName}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO ${this.migRoleName}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" GRANT all privileges ON TABLES TO ${this.migRoleName}`)
    }

    protected async preDeletingUser(username: string) {
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" REVOKE all ON TABLES from  ${this.appRoleName}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" REVOKE all ON SEQUENCES from  ${this.appRoleName}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" REVOKE all ON TABLES from  ${this.readonlyRoleName}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" REVOKE all ON SEQUENCES from ${this.migRoleName}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES for USER "${username}" IN SCHEMA "${this.schemaName}" REVOKE all ON TABLES from ${this.migRoleName}`)

    }

    private generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

}