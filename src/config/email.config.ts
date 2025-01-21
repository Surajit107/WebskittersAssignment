class EmailConfig {
    private static APP_PASSWORD: string = "jzdopiidpbxquuzo";
    private static EMAIL_ID: string = "justhired.mern@gmail.com";
    private static EMAIL_HOST: string = "smtp.gmail.com";
    private static EMAIL_PORT: number = 587;

    // Method to retrieve email configuration
    public static getConfig() {
        return {
            appPassword: this.APP_PASSWORD,
            emailId: this.EMAIL_ID,
            emailHost: this.EMAIL_HOST,
            emailPort: this.EMAIL_PORT,
        };
    }
}

export default EmailConfig;