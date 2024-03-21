const fs = require('fs');
const path = require('path');
const axios = require('axios');
const m3u8 = require('m3u8-parser');

//m3u8 File URL
const m3u8Url = 'https://video03.logicahost.com.br/brtvnetwork/brtvnetwork/playlist.m3u8';

// Función para obtener la lista de videos desde un archivo JSON
async function fetchVideoList(jsonPath) {
    const jsonContent = fs.readFileSync(jsonPath);
    return JSON.parse(jsonContent);
}

// Función para obtener el contenido del archivo m3u8
async function fetchM3U8(url) {
    const response = await axios.get(url);
    return response.data;
}

// Función para generar el archivo de URL
function generateURLFile(outputFolder, fileName, m3u8Url) {
    const url = `${m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1)}${fileName}.m3u8`;
    const filePath = path.join(outputFolder, 'url.txt');
    fs.writeFileSync(filePath, url);
}

// Función para modificar el archivo m3u8 con los videos mp4 en posiciones específicas
function insertVideos(m3u8Content, videoUrls, interval) {
    const parser = new m3u8.Parser();
    parser.push(m3u8Content);
    parser.end();

    const parsedPlaylist = parser.manifest;

    // Calcular la duración total de los videos mp4
    const totalDuration = videoUrls.length * interval;

    // Insertar los videos mp4 en intervalos regulares
    for (let i = 0; i < videoUrls.length; i++) {
        const videoUrl = videoUrls[i];
        const startTime = i * interval;
        const endTime = (i + 1) * interval;
        parsedPlaylist.segments.push({ uri: videoUrl, duration: interval, title: `Video ${i + 1}`, startTime, endTime });
    }

    // Actualizar la duración total del archivo m3u8
    parsedPlaylist.totalDuration = totalDuration;

    // Generar el contenido m3u8 modificado
    const modifiedM3U8 = parser.manifest.toString();

    return modifiedM3U8;
}

function getOutputFolder() {
    const now = new Date();
    const folderName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}__${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
    return path.join(__dirname, 'output', folderName);
}

// Función principal
async function main() {
    
    const jsonPath = 'videos.json';
    const interval = 10; // Intervalo en segundos entre cada video

    try {
        // Obtener la lista de videos desde el archivo JSON
        const videoList = await fetchVideoList(jsonPath);

        // Obtener el contenido del archivo m3u8
        const m3u8Content = await fetchM3U8(m3u8Url);

        // Insertar los videos en el archivo m3u8
        const modifiedM3U8 = insertVideos(m3u8Content, videoList.videos, interval);

        // Crear la carpeta de salida si no existe
        const outputFolder = getOutputFolder();
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        // Generar el archivo de URL
        generateURLFile(outputFolder, 'new_playlist', m3u8Url);

        // Guardar el archivo m3u8 modificado
        const outputFilePath = path.join(outputFolder, 'modified_playlist.m3u8');
        fs.writeFileSync(outputFilePath, modifiedM3U8);

        console.log('Archivo m3u8 modificado generado correctamente en:', outputFilePath);
    } catch (error) {
        console.error('Error al procesar el archivo m3u8:', error);
    }
}

// Ejecutar la función principal
main();