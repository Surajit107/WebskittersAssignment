export namespace ReqResTypes {
    export class ICredentials {
        email: string;
        password: string;
    }

    export class ILoginCredentials extends ICredentials { }

    export class IRegisterCredentials extends ICredentials {
        fullName: string;
    }

    export class PaginationQuery {
        page?: string;
        limit?: string;
    }

    export class HealthcheckResponse {
        host: Array<string>;
        message: string;
        status: boolean;
        time: Date;
    }

    export class HealthcheckApiResponse {
        response: HealthcheckResponse;
    }
}