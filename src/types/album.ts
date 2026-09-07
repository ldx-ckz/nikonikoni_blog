export interface Photo {
	id: string;
	src: string;
	alt: string;
	title?: string;
	description?: string;
	thumbnail?: string;
	tags: string[];
	date: string;
	location?: string;
	width?: number;
	height?: number;
	camera?: string;
	lens?: string;
	settings?: string;
}

export interface AlbumGroup {
	id: string;
	title: string;
	description: string;
	cover: string;
	date: string;
	location: string;
	tags: string[];
	layout: "grid" | "masonry";
	columns: number;
	photos: Photo[];
}
