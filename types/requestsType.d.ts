export namespace Types {
    export interface ICredentials {
        email: string;
        password: string;
    }

    // ILoginCredentials extending ICredentials
    export interface ILoginCredentials extends ICredentials { }

    // IRegisterCredentials extending ICredentials
    export interface IRegisterCredentials extends ICredentials {
        fullName: string;
    }
}