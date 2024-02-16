/*
* Convert the following JS into an equivalent TS class
*
*
* */

import axios, {AxiosError} from "axios";
import {Logging} from "./Logging";
import path from "path";
import {promisify} from 'util';
import {exec} from "child_process";
import fs from "fs-extra";
import _ from "lodash";

const execAsync = promisify(exec);

/*
* INTENDED TO BE USED IN ELECTRON APP OR DOCKER CONTAINER
* NOT YET FINISHED - functionality was 'workable' on electron app, but UI is constantly ugly and not user friendly
* wasnt happy with it - havent worked on it since
* */


export interface IFactorioApiParams {
    username?: string;
    token?: string;       // no password! Dont be lazy - log in and get the damn token already. Mods wont work without token, and only headless can be downloaded without token
    dataPath: string;    // path to factorio data folder
}

export interface IFactorioApiVersionMigrateRecord {
    from: string;
    to: string;
}

export interface IFactorioApiVersionMap {
    experimental: IFactorioApiVersionRecord;
    stable: IFactorioApiVersionRecord;
}

export interface IFactorioApiVersionRecord {
    alpha: string;
    experimental: string;
    headless: string;
}

export interface IFactorioApiModListResult {
    pagination: IFactorioApiPagination;
    results: IFactorioApiModShortRecord[];
}

export interface IFactorioApiModReleaseRecord {
    download_url: string;
    file_name: string;
    info_json: {
        factorio_version: string
    }
    released_at: string;
    version: string;
}

export interface IFactorioApiModShortRecord {
    name: string;
    title: string;
    owner: string;
    summary: string;
    downloads_count: number;
    category: string;
    score: number;
    latest_release?: IFactorioApiModReleaseRecord;
}

export interface IFactorioApiModFullRecord extends IFactorioApiModShortRecord {
    thumbnail: string;
    changelog: string;
    created_at: string;
    description: string;
    source_url: string;
    homepage: string;
    tags: any[]
    license: any
}

export interface IFactorioApiPagination {
    count: number;
    page: number;
    page_count: number;
    page_size: number;
    links: {
        first: string | null;
        last: string | null;
        next: string | null;
        prev: string | null;
    }
}

export class FactorioApi {

    private static username: string;
    private static token: string;
    private static dataPath: string;

    static get downloadFolder(): string {
        return path.join(FactorioApi.dataPath, 'downloads');
    }

    static async loadUserFile(path: string, dataPath?: string) {
        Logging.log('info', `Loading user file from ${path}`);
        if (dataPath)
            FactorioApi.dataPath = dataPath;
        try {
            let fd = await fs.readJson(path, 'utf8')
            FactorioApi.username = fd.username;
            FactorioApi.token = fd.token;
        } catch (e) {
            Logging.log('error', `Could not load user file from ${path} - ${e.message}`);
        }
    }

    static async saveUserFile(path: string) {
        Logging.log('info', `Saving user file to ${path}`);
        // write to path the user file
        await fs.writeFile(path, JSON.stringify({
            username: FactorioApi.username,
            token: FactorioApi.token
        }))
    }

    static cachedModList: IFactorioApiModListResult;

    // Gets set to true if the user has successful calls using their token. False is linux headless only!!
    static isAuthenticated: boolean = false;
    static authError: AxiosError;

    static versionMap: Map<string, Array<IFactorioApiVersionMigrateRecord>> = new Map<string, Array<IFactorioApiVersionMigrateRecord>>();
    static latestVersion: IFactorioApiVersionMap

    static clear() {
        Logging.log('info', 'Clearing Factorio API data');
        FactorioApi.versionMap = new Map<string, Array<IFactorioApiVersionMigrateRecord>>();
        FactorioApi.latestVersion = undefined;
        FactorioApi.authError = undefined;
        FactorioApi.isAuthenticated = false;
    }

    static async queryApi(url: string, params: any = {}) {
        Logging.log('info', `Querying Factorio API at ${url}`)

        if (FactorioApi.isAuthenticated || (this.username && this.token))
            params = {
                ...params,
                username: this.username,
                token: this.token
            }

        try {
            let resp = await axios.get(url, {
                params
            });

            return resp.data;
        } catch (e) {
            if (e.response.status === 401) {
                FactorioApi.authError = e;
                FactorioApi.isAuthenticated = false;
                Logging.log('error', 'Factorio API credentials are invalid. Please check your username and token.');
                throw new Error(`Factorio API credentials are invalid. Please check your username and token. ${e.message}`)
            } else {
                Logging.log('error', e.message);
                throw new Error(e.message)
            }
        }

    }

    static async initialize(params: IFactorioApiParams) {
        FactorioApi.username = params.username;
        FactorioApi.token = params.token;
        FactorioApi.dataPath = params.dataPath;

        await fs.ensureDir(path.join(FactorioApi.dataPath, 'factory-storage'));

        if (!FactorioApi.username)
            await FactorioApi.loadUserFile(path.join(FactorioApi.dataPath, 'factory-storage', 'user.json'));

        Logging.log('info', 'Initializing Factorio API - Grabbing version information')

        // Any errors are handled upstream
        FactorioApi.versionMap = await FactorioApi.queryApi('https://factorio.com/get-available-versions');
        FactorioApi.latestVersion = await FactorioApi.queryApi('https://factorio.com/api/latest-releases');

        if (FactorioApi.versionMap['core-linux64']) {
            FactorioApi.isAuthenticated = true;
            Logging.log('info', `Successfully authenticated with user ${FactorioApi.username}`);
            await FactorioApi.saveUserFile(path.join(FactorioApi.dataPath, 'factory-storage', 'user.json'));
        } else {
            Logging.log('warn', `Not authenticated with Factorio API. Some features may be unavailable.`);
        }
        FactorioApi.cachedModList = await FactorioApi.listFactorioMods(undefined, 'max')
    }

    static async listFactorioMods(page: number = undefined, pageSize: number | 'max' = undefined,
                                  sort: 'name' | 'created_at' | 'updated_at' = undefined, sortOrder: 'asc' | 'desc' = undefined, namelist: string[] = undefined)
        : Promise<IFactorioApiModListResult> {
        // query parameters can be any of the following...
        /*
        * page integer,
        * page_size integer, or 'max',
        *  sort name, created_at, or updated_at,
        *  sort_order asc or desc,
        *  namelist array of strings - ONLY returns mods with given names,
        * */

        let params = {
            page: page == null ? undefined : page,
            page_size: pageSize == null ? undefined : pageSize,
            sort: sort == null ? undefined : sort,
            sort_order: sortOrder == null ? undefined : sortOrder,
            namelist: namelist == null ? undefined : namelist,
            version: FactorioApi.latestVersion.stable.headless
        }
        return await FactorioApi.queryApi('https://mods.factorio.com/api/mods', params);
    }

    static async getModInfo(name: string): Promise<IFactorioApiModFullRecord> {
        return await FactorioApi.queryApi(`https://mods.factorio.com/api/mods/${name}/full`);
    }

    static async getLatestModVersion(name: string): Promise<string> {
        const modInfo: any = await FactorioApi.queryApi(`https://mods.factorio.com/api/mods/${name}`);
        if (modInfo && modInfo.releases && modInfo.releases.length > 0) {
            return modInfo.releases[modInfo.releases.length - 1].version;
        } else
            throw new Error(`Could not find latest version of mod ${name}. If this mod is only local, specify the version manually`);
    }

    /*
    * Downloads a given mod, returning the full path to the downloaded file. just returns path if already downloaded
    * */
    static async downloadMod(name: string, version: string = 'latest'): Promise<string> {
        Logging.log('info', `Beginning download process for mod ${name}_${version}`)
        /*First, check our filesystem to see if we have that file*/
        // if version is 'latest', we need to query the API to find the latest version, THEN we can state filepath
        let dlPath: string;
        let modPath: string;

        // Get the factorio mods together - query the API to find the latest version, then download it
        const modInfo: any = await FactorioApi.queryApi(`https://mods.factorio.com/api/mods/${name}`);

        if (modInfo && modInfo.releases && modInfo.releases.length > 0) {
            let dlRelease;
            if (version === 'latest')
                dlRelease = modInfo.releases[modInfo.releases.length - 1]
            else
                dlRelease = _.find(modInfo.releases, (r) => {
                    return r.version === version;
                });

            if (!dlRelease)
                throw new Error(`Could not find a release for mod ${name} with version ${version}`);

            dlPath = 'https://mods.factorio.com' + dlRelease.download_url;
            modPath = path.join(FactorioApi.dataPath, 'mods-cache', `${name}_${dlRelease.version}.zip`);
        } else
            throw new Error(`Could not mod ${name} with version ${version}`);


        if (fs.existsSync(modPath)) {
            Logging.log('info', `Found existing download of ${name} ${version} - skipping download`);
        } else {
            Logging.log('info', `Downloading mod ${name}_${version} from ${dlPath}...`);
            await FactorioApi.downloadFile(dlPath, modPath);
        }
        return modPath
    }

    // Function used for downloading a given file once we have a URL generated. Piping is best for larger downloads like we have.
    private static async downloadFile(url: string, outputLocationPath: string): Promise<string> {

        Logging.log('info', `Downloading ${url} to ${outputLocationPath}`);

        // Alright axios - you do NOT like to follow instructions on downloading a stream, huh?
        // keeps on stopping after 16.9kb written for any alpha version, but headless works perfectly
        // No idea why! So instead, we're changing this to use CURL instead - cross platform, and works perfectly for anything we need
        // Example working command...
        // curl -G "https://www.factorio.com/get-download/1.1.87/alpha/linux64?username=CharacterOverflow&token=<TOKENHERE>" -L --silent --output test.tar.xz
        // if the output file at the end is less than a kb (really, if its less than like 1mb) then we know something went wrong
        let dlCommand: string;
        if (FactorioApi.isAuthenticated) {
            dlCommand = `curl -G "${url}?username=${FactorioApi.username}&token=${FactorioApi.token}" -L --silent --output "${outputLocationPath}"`;
        } else
            dlCommand = `curl -G "${url}" -L --silent --output "${outputLocationPath}"`;

        // Run the download command, and wait for it to finish.
        // Times out after FACTORIO_DL_TIMEOUT, if set. Otherwise, will run forever!
        // If you have a very fast download speed / drives, you may want to set FACTORIO_DL_TIMEOUT to something like 60000 (60 seconds) as a safety measure
        await execAsync(dlCommand, {
            cwd: FactorioApi.downloadFolder,
            timeout: process.env.FACTORIO_DL_TIMEOUT ? parseInt(process.env.FACTORIO_DL_TIMEOUT) : 0,
            killSignal: 'SIGKILL'
        });

        // Now we need to check filesize - as far as I'm concerned, if the file is less than 1mb, something went wrong
        let stats = await fs.stat(outputLocationPath);

        // if size is under 10kb, throw error. Frankly, if you're trying to download a file under 10k, grab it via axios
        if (stats && stats.size < 10000) {
            Logging.log('error', `Download of ${url} failed - `);
            throw new Error(`Download of ${url} failed - file size is less than 10kb. Something went wrong. Are your credentials correct?`)
        }

        // May change this to return the filesize, for now this works
        return outputLocationPath;
    }

    static async downloadGame(version: string, build: string, distro: string) {

        let downloadArchive = `${this.downloadFolder}/factorio-${version}_${build}_${distro}.tar.xz`;

        // First, check if the file exists and is greater than 10mb. If so, no download needed!
        // we ONLY use existing downloads on first run through - if there are issues installing, we clear download and try again
        if (fs.existsSync(downloadArchive) && fs.statSync(downloadArchive).size > 10000000) {
            Logging.log('info', `Found existing download of Factorio ${version} ${build} ${distro} - skipping download`);
            return downloadArchive;
        } else
            await fs.remove(downloadArchive)

        await FactorioApi.downloadFile(
            `https://www.factorio.com/get-download/${version}/${build}/${distro}`,
            downloadArchive)
        return downloadArchive;
    }
}
