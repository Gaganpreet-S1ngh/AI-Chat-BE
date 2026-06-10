import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export class DatabaseManager {
    private static _instance: DatabaseManager;
    private prisma: PrismaClient;
    private isConnected = false;
    private retryCount = 0;

    private constructor() {
        this.prisma = new PrismaClient({
            log: ["error", "warn"],
        });
    }

    static get instance(): DatabaseManager {
        if (!this._instance) {
            this._instance = new DatabaseManager();
        }

        return this._instance;
    }

    public get client(): PrismaClient {
        return this.prisma;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info("Database already connected");
            return;
        }

        try {
            await this.connectWithRetry();

            process.on("SIGINT", this.gracefulShutdown.bind(this));
            process.on("SIGTERM", this.gracefulShutdown.bind(this));

            this.isConnected = true;

            logger.info("Successfully connected to PostgreSQL");
        } catch (error) {
            logger.error("Database connection failed", error);
            throw error;
        }
    }

    private async connectWithRetry(): Promise<void> {
        const maxAttempts = 5;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.prisma.$connect();

                // verify connection
                await this.prisma.$queryRaw`SELECT 1`;

                this.retryCount = 0;

                logger.info("Database connection established");

                return;
            } catch (error) {
                logger.warn(
                    `Database connection attempt ${attempt}/${maxAttempts} failed`
                );

                if (attempt === maxAttempts) {
                    throw error;
                }

                await this.delay(5000);
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.prisma.$disconnect();

            this.isConnected = false;

            logger.info("Database disconnected");
        } catch (error) {
            logger.error("Database disconnect failed", error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async gracefulShutdown(): Promise<void> {
        logger.info("Shutting down database connection");

        await this.disconnect();

        process.exit(0);
    }
}