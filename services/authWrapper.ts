import CrunchyrollAPI from "crunchyroll-js-api"

export class AuthWrapper {
    private api: any
    private isLoggedIn: boolean = false
    
    constructor() {
        this.api = CrunchyrollAPI
    }

    // optional login flow
    async startDeviceAuth(): Promise<{
        userCode: string
        deviceCode: string
        verificationUri: string
        interval: number
    } | null> {
        try {
            const deviceAuth = await this.api.auth.getDeviceAuth()
            return {
                userCode: deviceAuth.user_code,
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
            await this.api.api.auth.checkDeviceAuth(deviceCode)
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
            const defaultOptions = {
                locale: "en-US",
                categories: options.categories || [],
                sort_by: options.sort_by || "newly_added",
                start: options.start || 0,
                n: options.n || 36,
                ...options
            }
            console.log("[DEBUG] calling getBrowseAll with options", defaultOptions)

            const result = await this.api.api.discover.getBrowseAll(defaultOptions)
            console.log("[DEBUG] getBrowseAll result", result)
            return result
            
           } catch (error) {
            console.error("Failed to fetch anime list", error)
            throw error
           }
    }
    async searchAnime(query: string, options: any = {}): Promise<any> {
        try {
            const defaultOptions = {
                locale: "en-US",
                q: query,
                start: options.start || 0,
                n: options.n || 36,
                ...options
            }
            console.log("[DEBUG] calling search with options", defaultOptions)
            const result = await this.api.api.discover.search(defaultOptions)
            return result

        } catch (error) {
            console.error("Search failed", error)
            throw error
        }
    }
    // get filtering categories
    async getCategories() {
        try {
            const result = await this.api.api.discover.getCategories({
                locale: "en-US"
            })
            return result
        } catch (error) {
            console.error("Failed to get categories:", error)
            throw error
        }
    }

    // get home feed
    async getHomeFeed() {
        try {
            const result = await this.api.api.discover.getHomeFeed({
                locale: "en-US"
            })
            return result
        } catch (error) {
            console.error("Failed to get home feed :(", error)
            throw error
        }
    }

    logout(): void {
        this.isLoggedIn = false
        // try clearing stored tokens
        try {
            this.api.api.auth.revoke()
        } catch (error) {
            console.warn("Error during logout.")
        }
    }

    get loginStatus(): boolean {
        return this.isLoggedIn
    }
}