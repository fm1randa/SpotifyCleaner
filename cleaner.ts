import { SpotifyWebApi } from 'spotify-web-api-ts';
import { Playlist } from './playlist';
import { Song } from './song';

function clear() {
    if (process.platform === 'win32') {
        process.stdout.write('\x1B[2J\x1B[0f');
    } else {
        process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
    }
}

export class SpotifyCleaner {
    private api: SpotifyWebApi;
    private userId: string;

    constructor(authToken: string) {
        this.api = new SpotifyWebApi({ accessToken: authToken });
        this.userId = '';
        this.initialize();
    }

    private async initialize() {
        const me = await this.api.users.getMe();
        this.userId = me.id;
    }

    async getPlaylists(): Promise<Playlist[]> {
        const result = await this.api.playlists.getMyPlaylists();
        const playlists: Playlist[] = [];
        for (const playlist of result.items) {
            playlists.push(new Playlist(playlist));
        }
        return playlists;
    }

    async getCleanPlaylist(name: string): Promise<Playlist | null> {
        const playlists = await this.getPlaylists();
        for (const playlist of playlists) {
            if (playlist.name === `${name} (Clean)`) {
                return playlist;
            }
        }
        return null;
    }

    async getSongs(playlist: Playlist): Promise<void> {
        const MAX_TRACKS = 100;
        const totalRuns = Math.ceil(playlist.trackCount / MAX_TRACKS);
        let tracksGotten = 0;
        for (let i = 0; i < totalRuns; i++) {
            const result = await this.api.playlists.getPlaylistTracks(playlist.id, { offset: tracksGotten });
            for (const song of result.items) {
                playlist.songs.push(new Song(song.track));
            }
            tracksGotten += MAX_TRACKS;
        }
    }

    async cleanPlaylist(playlist: Playlist): Promise<Playlist | null> {
        const MAX_TRACKS = 100;
        await this.api.playlists.createPlaylist(this.userId, `${playlist.name} (Clean)`, { public: playlist.isPublic });
        const cleanPlaylist = await this.getCleanPlaylist(playlist.name);
        if (cleanPlaylist) {
            let cleanSongs: string[] = [];
            let i = 1;
            let total = 0;
            for (const song of playlist.songs) {
                clear();
                console.log('Cleaning playlist... Large playlists can take a while');
                console.log(`Cleaning song ${i} of ${playlist.trackCount}`);
                if (cleanSongs.length === MAX_TRACKS) {
                    await this.api.playlists.addTracksToPlaylist(cleanPlaylist.id, cleanSongs);
                    cleanSongs = [];
                }
                if (!song.isLocal) {
                    if (song.isExplicit) {
                        const searches = await this.api.search.searchTracks(`${song.name} ${song.artist}`, { limit: 30 });
                        for (const searchedTrack of searches.items) {
                            const searchedSong = new Song(searchedTrack);
                            const isSameSong = song.compareSong(searchedSong);
                            if (isSameSong) {
                                total += 1;
                                cleanSongs.push(searchedSong.id);
                                break;
                            }
                        }
                    } else {
                        cleanSongs.push(song.id);
                        total += 1;
                    }
                }
                i += 1;
            }
            if (cleanSongs.length > 0) {
                await this.api.playlists.addTracksToPlaylist(cleanPlaylist.id, cleanSongs);
            }
            console.log(`Out of ${playlist.trackCount} songs, ${total} were cleaned`);
        }
        return cleanPlaylist;
    }
}
