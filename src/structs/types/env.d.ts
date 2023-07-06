declare namespace NodeJS {
    interface ProcessEnv {
        TOKEN: string,
        MONGO_URI: string,
        MONGO_DATABASE_NAME: string
    }
}