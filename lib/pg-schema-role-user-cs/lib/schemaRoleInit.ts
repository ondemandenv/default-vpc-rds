import {Base} from "./base";
import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceUpdateEvent} from "aws-lambda";
import {CloudFormationCustomResourceResponse} from "aws-lambda/trigger/cloudformation-custom-resource";


//https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/
export class SchemaRoleInit extends Base {

    public async handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
        await super.handler(event)

        if (event.RequestType == 'Create') {
            try {
                await this.pgClient.query(`create schema IF NOT EXISTS "${this.schemaName}"`)

                await this.pgClient.query(`BEGIN`)

                await this.createAppRole()
                await this.createMigrateRole()
                await this.createReadonlyRole()
                await this.changeExistingTableOwner()
                await this.createTrigger()
                await this.pgClient.query(`COMMIT`)
            } catch (e) {
                await this.pgClient.query(`ROLLBACK`)
                throw e
            }
        } else if (event.RequestType == 'Delete') {
            await this.deleteAll();
        } else {
            const updateEvent = event as CloudFormationCustomResourceUpdateEvent
            if (this.databaseName != updateEvent.OldResourceProperties.databaseName) {
                throw new Error(`No database name Change( ${updateEvent.OldResourceProperties.databaseName} -> ${this.databaseName} ) allowed!`)
            }
            if (this.schemaName != updateEvent.OldResourceProperties.schemaName) {
                throw new Error(`No schema name Change( ${updateEvent.OldResourceProperties.schemaName} -> ${this.schemaName} ) allowed!`)
            }
        }
        await this.printUsrRoleStatus();

        return {
            PhysicalResourceId: `rds-schema-${this.schemaName}`,
            StackId: event.StackId,
            RequestId: event.RequestId,
            Data: {},
            Status: "SUCCESS",
            LogicalResourceId: event.LogicalResourceId
        }
    }

    private async deleteAll() {

        for (const roleName of this.all3roles) {
            try {
                console.log(`deleting role:${roleName}`)
                await this.pgClient.query(`REASSIGN OWNED BY ${roleName} TO "${this.adminUsername}"`)
                await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" revoke all privileges ON TABLES from ${roleName}`)
                await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" revoke USAGE ON SEQUENCES from ${roleName}`)
                await this.pgClient.query(`revoke usage on all sequences in schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges on all tables in schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges on schema "${this.schemaName}" from ${roleName}`)
                await this.pgClient.query(`revoke all privileges ON DATABASE "${this.databaseName}" from ${roleName}`)
                await this.pgClient.query(`drop role ${roleName}`)
                console.log(`deleted role:${roleName}`)
            } catch (e) {
                console.error(`error deleting role:${roleName}` + e)
            }
        }

        try {
            await this.pgClient.query(`drop schema "${this.schemaName}"`)
        } catch (e) {
            console.info('deleting schema fails when there is data:' + e)
        }
    }


    protected async createRoleGrantDBSchema(roleName: string) {
        if (!this.all3roles.includes(roleName)) {
            throw new Error(`illegal role name: ${roleName}`)
        }
        await this.pgClient.query(`create role ${roleName}`)
        await this.pgClient.query(`grant connect, temp on database "${this.databaseName}" to ${roleName}`)
        await this.pgClient.query(`grant usage on schema "${this.schemaName}" to ${roleName}`)
    }

    protected async createAppRole() {
        const postgresRole = this.appRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant insert, select, update, delete on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`GRANT USAGE ON ALL SEQUENCES IN SCHEMA  "${this.schemaName}" to ${postgresRole}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT insert, select, update, delete ON TABLES TO ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO ${postgresRole}`)
    }


    protected async createReadonlyRole() {
        const postgresRole = this.readonlyRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant select on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT select ON TABLES TO ${postgresRole}`)
    }

    protected async createMigrateRole() {
        const postgresRole = this.migRoleName
        await this.createRoleGrantDBSchema(postgresRole);
        await this.pgClient.query(`grant all privileges on all tables in schema "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`GRANT USAGE ON ALL SEQUENCES IN SCHEMA  "${this.schemaName}" to ${postgresRole}`)

        await this.pgClient.query(`grant all PRIVILEGES ON SCHEMA "${this.schemaName}" to ${postgresRole}`)
        await this.pgClient.query(`grant all PRIVILEGES ON database "${this.databaseName}" to ${postgresRole}`)

        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT USAGE ON SEQUENCES TO ${postgresRole}`)
        await this.pgClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA "${this.schemaName}" GRANT all privileges ON TABLES TO ${postgresRole}`)
    }


    protected async createTrigger() {
        await this.pgClient.query(`
CREATE OR REPLACE FUNCTION change_owner_function()
    RETURNS event_trigger AS
$$
DECLARE
    obj RECORD;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE' and schema_name="${this.schemaName}"
        LOOP
            EXECUTE format('ALTER TABLE %s OWNER TO ${this.migRoleName}', obj.object_identity);
        END LOOP;
END;
$$
    LANGUAGE plpgsql;
`)

        await this.pgClient.query(`
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'change_table_owner_on_created') THEN
            CREATE EVENT TRIGGER change_table_owner_on_created ON ddl_command_end WHEN TAG in ('CREATE TABLE')
            EXECUTE FUNCTION change_owner_function();
        end if;
    END;
$$;
`)
    }

    protected async changeExistingTableOwner() {
        await this.pgClient.query(`
DO $$
    DECLARE
        text TEXT;
    BEGIN
        FOR text IN
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = '${this.schemaName}'
              AND tableowner <> '${this.migRoleName}'
            LOOP
                EXECUTE format('ALTER TABLE %I.%I OWNER TO ${this.migRoleName}', ${this.schemaName}, text);
            END LOOP;
    END $$;
`)
    }
}