window.addEventListener('DOMContentLoaded', () => {
    const player = videojs('myvideo', {});
}) 

document.getElementById('generateM3u8').addEventListener('click', () => {
    const m3u8Content = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10.0,\nhttps://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4`;

    // Crea un Blob con el contenido del nuevo archivo M3U8
    const blob = new Blob([m3u8Content], { type: 'application/x-mpegURL' });

    // Crea un objeto URL para el Blob
    const url = URL.createObjectURL(blob);

    // Configura el enlace de descarga para que apunte al Blob
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = 'new_video.m3u8';

    // Muestra el enlace de descarga
    downloadLink.style.display = 'block';
});

document.getElementById('loadM3u8').addEventListener('click', () => {
    const m3u8Url = document.getElementById('m3u8Input').value;
    if (m3u8Url) {
        const player = videojs('myvideo');
        player.src({
            src: m3u8Url,
            type: 'application/x-mpegURL'
        });
        player.play();
    } else {
        alert('Por favor, ingresa una URL válida del archivo M3U8.');
    }
});