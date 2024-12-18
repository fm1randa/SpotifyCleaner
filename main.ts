import { SpotifyClient, SpotifyAuth } from '@spotify/web-api-ts-sdk';
import fs from 'fs';
import { SpotifyCleaner } from './cleaner';
import { Playlist } from './playlist';

interface Config {
    'client-id': string;
    'client-secret': string;
    'redirect-url': string;
}

function loadConfig(): Config {
    const data = fs.readFileSync('config.json', 'utf8');
    return JSON.parse(data);
}

async function getToken(username: string): Promise<string> {
    const config = loadConfig();
    const scope = 'playlist-modify-public playlist-read-private playlist-modify-private';
    const clientId = config['client-id'];
    const clientSecret = config['client-secret'];
    const redirectUri = config['redirect-url'];

    const auth = SpotifyAuth.withClientCredentials(clientId, clientSecret);
    const token = await auth.getAccessToken();
    return token;
}

async function main() {
    console.log('Welcome to Spotify Cleaner');
    const username = prompt('Please enter your Spotify username: ');
    const token = await getToken(username);
    const cleaner = new SpotifyCleaner(token);
    const playlists = await cleaner.getPlaylists();

    playlists.forEach((playlist: Playlist, index: number) => {
        console.log(`[${index + 1}] ${playlist.name}`);
    });

    let choice: number;
    while (true) {
        const input = prompt('Select a playlist: ');
        if (input && !isNaN(Number(input))) {
            choice = Number(input) - 1;
            if (choice >= 0 && choice < playlists.length) {
                break;
            }
        }
    }

    const playlist = playlists[choice];
    await cleaner.getSongs(playlist);
    const clean = await cleaner.cleanPlaylist(playlist);
    console.log(clean.url);
}

main().catch(console.error);
