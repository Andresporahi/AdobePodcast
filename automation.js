/**
 * Adobe Podcast Enhancer - Automatización con Puppeteer
 * Script de automatización para subir, procesar y descargar videos de Adobe Podcast
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parsear argumentos
const argv = yargs(hideBin(process.argv))
    .option('email', {
        alias: 'e',
        description: 'Email de Adobe',
        type: 'string',
        demandOption: true
    })
    .option('password', {
        alias: 'p',
        description: 'Contraseña de Adobe',
        type: 'string',
        demandOption: true
    })
    .option('files', {
        alias: 'f',
        description: 'Archivos a procesar (JSON array)',
        type: 'string',
        demandOption: true
    })
    .option('download-path', {
        alias: 'd',
        description: 'Ruta de descarga',
        type: 'string',
        demandOption: true
    })
    .help()
    .alias('help', 'h')
    .argv;

// Constantes
const ADOBE_PODCAST_URL = 'https://podcast.adobe.com/enhance';
const LOGIN_TIMEOUT = 60000;
const UPLOAD_TIMEOUT = 300000;
const PROCESSING_TIMEOUT = 600000;

class AdobePodcastAutomation {
    constructor(email, password, downloadPath) {
        this.email = email;
        this.password = password;
        this.downloadPath = downloadPath;
        this.browser = null;
        this.page = null;
    }

    log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    async init() {
        this.log('🚀 Iniciando navegador...');
        
        // Crear directorio de descargas si no existe
        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath, { recursive: true });
        }

        this.browser = await puppeteer.launch({
            headless: false, // Cambiar a true para ejecución sin interfaz
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Configurar descargas
        const client = await this.page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.downloadPath
        });

        this.log('✅ Navegador iniciado');
    }

    async login() {
        try {
            this.log('🔐 Iniciando sesión en Adobe...');
            
            // Navegar a Adobe Podcast
            await this.page.goto(ADOBE_PODCAST_URL, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            this.log('📄 Página cargada, buscando botón de login...');

            // Esperar y hacer clic en el botón de Sign In
            await this.page.waitForSelector('button, a[href*="ims"]', { timeout: 10000 });
            
            // Buscar el botón de Sign In (puede variar el selector)
            const signInButton = await this.page.$('button:has-text("Sign in"), a:has-text("Sign in"), button:has-text("Sign In"), a:has-text("Sign In")');
            
            if (signInButton) {
                await signInButton.click();
                this.log('🖱️ Click en botón de Sign In');
            } else {
                // Intentar con selector alternativo
                await this.page.click('button, a[href*="ims"]');
                this.log('🖱️ Click en botón de autenticación');
            }

            // Esperar a que aparezca el formulario de login de Adobe
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            
            this.log('📝 Formulario de login cargado');

            // Esperar al campo de email
            await this.page.waitForSelector('input[type="email"], input[name="username"]', { timeout: 10000 });
            
            // Ingresar email
            await this.page.type('input[type="email"], input[name="username"]', this.email, { delay: 100 });
            this.log('📧 Email ingresado');

            // Hacer clic en continuar/siguiente
            await this.page.click('button[type="submit"], button[type="button"]');
            
            // Esperar al campo de contraseña
            await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
            
            // Ingresar contraseña
            await this.page.type('input[type="password"]', this.password, { delay: 100 });
            this.log('🔒 Contraseña ingresada');

            // Hacer clic en iniciar sesión
            await this.page.click('button[type="submit"]');
            
            this.log('⏳ Esperando autenticación...');

            // Esperar a que la navegación complete (puede tomar tiempo)
            await this.page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: LOGIN_TIMEOUT 
            });

            this.log('✅ Sesión iniciada exitosamente');
            
            // Esperar un poco más para asegurar que todo cargue
            await this.page.waitForTimeout(3000);

            return true;
        } catch (error) {
            this.log(`❌ Error en login: ${error.message}`);
            throw error;
        }
    }

    async uploadAndProcess(videoFiles) {
        try {
            const files = JSON.parse(videoFiles);
            this.log(`📤 Subiendo ${files.length} archivo(s)...`);

            for (let i = 0; i < files.length; i++) {
                const filePath = files[i];
                const fileName = path.basename(filePath);
                
                this.log(`📁 Procesando archivo ${i + 1}/${files.length}: ${fileName}`);

                // Buscar el input de archivo (puede estar oculto)
                const fileInput = await this.page.$('input[type="file"]');
                
                if (!fileInput) {
                    this.log('⚠️ No se encontró input de archivo, buscando área de drop...');
                    // Intentar hacer clic en el área de drop/upload
                    await this.page.click('[data-test-id="upload-area"], .upload-area, button:has-text("Upload")');
                    await this.page.waitForTimeout(1000);
                }

                // Subir archivo
                const input = await this.page.$('input[type="file"]');
                await input.uploadFile(filePath);
                
                this.log(`⬆️ Archivo subido: ${fileName}`);
                
                // Esperar a que comience el procesamiento
                await this.page.waitForTimeout(5000);
                
                this.log('🔄 Esperando procesamiento...');
                
                // Esperar a que aparezca el botón de descarga o indicador de completado
                // Esto puede variar según la interfaz de Adobe Podcast
                try {
                    await this.page.waitForSelector(
                        'button:has-text("Download"), a:has-text("Download"), [data-test-id="download"]',
                        { timeout: PROCESSING_TIMEOUT }
                    );
                    
                    this.log('✅ Procesamiento completado');
                    
                    // Hacer clic en el botón de descarga
                    await this.page.click('button:has-text("Download"), a:has-text("Download"), [data-test-id="download"]');
                    
                    this.log('💾 Descarga iniciada...');
                    
                    // Esperar a que el archivo se descargue
                    await this.page.waitForTimeout(10000);
                    
                    this.log(`✅ Archivo procesado y descargado: ${fileName}`);
                    
                } catch (processingError) {
                    this.log(`⚠️ Timeout esperando procesamiento de ${fileName}`);
                    this.log('💡 El archivo puede estar siendo procesado en segundo plano');
                }
                
                // Esperar entre archivos
                if (i < files.length - 1) {
                    await this.page.waitForTimeout(2000);
                }
            }

            this.log('✅ Todos los archivos procesados');
            return true;

        } catch (error) {
            this.log(`❌ Error en procesamiento: ${error.message}`);
            throw error;
        }
    }

    async downloadAll() {
        try {
            this.log('📥 Verificando descargas...');
            
            // Listar archivos en el directorio de descargas
            const files = fs.readdirSync(this.downloadPath);
            
            this.log(`📊 Total de archivos descargados: ${files.length}`);
            
            files.forEach(file => {
                this.log(`  📄 ${file}`);
            });

            return files;

        } catch (error) {
            this.log(`❌ Error verificando descargas: ${error.message}`);
            return [];
        }
    }

    async close() {
        if (this.browser) {
            this.log('🔒 Cerrando navegador...');
            await this.browser.close();
            this.log('✅ Navegador cerrado');
        }
    }

    async run(videoFiles) {
        try {
            await this.init();
            await this.login();
            await this.uploadAndProcess(videoFiles);
            const downloads = await this.downloadAll();
            
            this.log('🎉 Proceso completado exitosamente');
            
            return {
                success: true,
                downloads: downloads
            };

        } catch (error) {
            this.log(`❌ Error general: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await this.close();
        }
    }
}

// Ejecutar
(async () => {
    const automation = new AdobePodcastAutomation(
        argv.email,
        argv.password,
        argv['download-path']
    );

    const result = await automation.run(argv.files);
    
    if (result.success) {
        console.log('✅ SUCCESS');
        process.exit(0);
    } else {
        console.error('❌ FAILED');
        process.exit(1);
    }
})();

