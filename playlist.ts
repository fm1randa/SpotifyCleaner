class Playlist {
    data: any;
    songs: any[];

    constructor(data: any) {
        this.data = data;
        this.songs = [];
    }

    get name(): string {
        return this.data["name"];
    }

    get id(): string {
        return this.data["id"];
    }

    get track_count(): number {
        return this.data["tracks"]["total"];
    }

    get url(): string {
        return this.data["external_urls"]["spotify"];
    }

    get is_public(): boolean {
        return this.data["public"];
    }
}
