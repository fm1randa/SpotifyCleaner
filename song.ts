class Song {
    data: any;

    constructor(data: any) {
        this.data = data;
        if (this.data.track) {
            this.data = this.data.track;
        }
    }

    compareSong(cmpSong: Song): boolean {
        if (this.name === cmpSong.name) {
            if (this.artistId === cmpSong.artistId) {
                if (!cmpSong.isExplicit) {
                    return true;
                }
            }
        }
        return false;
    }

    get name(): string {
        return this.data.name;
    }

    get artist(): string {
        return this.data.artists[0].name;
    }

    get artistId(): string {
        return this.data.artists[0].id;
    }

    get album(): string {
        return this.data.album.name;
    }

    get id(): string {
        return this.data.id;
    }

    get isExplicit(): boolean {
        return this.data.explicit;
    }

    get isLocal(): boolean {
        return this.data.is_local;
    }
}
