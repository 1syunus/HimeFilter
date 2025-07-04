import CrunchyrollAPI from "crunchyroll-js-api"

export class AuthWrapper {
    private api: any
    private isLoggedIn: boolean = false
    
    constructor() {
        this.api = CrunchyrollAPI
    }

    // optional login flow
    async startDeviceAuth(): Promise<{
        useCode: string
        deviceCode: string
        verificationUri: string
        interval: number
    } | null> {
        try {
            const deviceAuth = await this.api.auth.getDeviceAuth()
            return {
                useCode: deviceAuth.user_code,
                deviceCode: deviceAuth.device_code,
                verificationUri: deviceAuth.verification_uri,
                interval: deviceAuth.interval
            }
        } catch (error) {
            console.warn("Device auth failed. Continuing without login.")
            return null
        }
    }

    async completeDeviceAuth(deviceCode: string): Promise<boolean> {
        try {
            await this.api.auth.checkDeviceAuth(deviceCode)
            this.isLoggedIn = true
            return true
        } catch (error) {
            console.warn("Login failed. Continuing without login.")
            return false
        }
    }

    // guest-safe api calls
    async getAnimeList(options: any = {}): Promise<any> {
        try {
            // try autheticated first if logged in
            return await this.api.discover.browse(options)
           } catch (error) {
            console.error("Failed to fetch anime list", error)
            throw error
           }
    }
    async searchAnime(query: string, options: any = {}): Promise<any> {
        try {
            return await this.api.discover.search(query, options)
        } catch (error) {
            console.error("Search failed", error)
            throw error
        }
    }

    logout(): void {
        this.isLoggedIn = false
        // try clearing stored tokens
        try {
            this.api.auth.revoke()
        } catch (error) {
            console.warn("Error during logout.")
        }
    }

    get loginStatus(): boolean {
        return this.isLoggedIn
    }
}