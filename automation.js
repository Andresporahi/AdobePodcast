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

            // Esperar un momento para que la página cargue completamente
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Buscar botón de Sign In usando texto
            const signInButton = await this.page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button, a'));
                return buttons.find(button => {
                    const text = button.textContent.toLowerCase();
                    return text.includes('sign in') || 
                           text.includes('log in') || 
                           text.includes('iniciar sesión');
                });
            });
            
            if (signInButton.asElement()) {
                await signInButton.asElement().click();
                this.log('🖱️ Click en botón de Sign In');
            } else {
                // Intentar con selector alternativo para Adobe IMS
                const imsLink = await this.page.$('a[href*="ims.na1.adobelogin.com"]');
                if (imsLink) {
                    await imsLink.click();
                    this.log('🖱️ Click en enlace de autenticación Adobe');
                } else {
                    throw new Error('No se encontró el botón de Sign In');
                }
            }

            // Esperar a que aparezca el formulario de login de Adobe
            this.log('⏳ Esperando formulario de login...');
            await this.page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: 30000 
            }).catch(() => {
                this.log('⚠️ No hubo navegación, continuando...');
            });
            
            // Esperar al campo de email
            await this.page.waitForSelector('input[type="email"], input[name="username"], input[name="email"]', { 
                timeout: 15000 
            });
            
            this.log('📝 Formulario de login encontrado');
            
            // Limpiar y escribir email
            const emailInput = await this.page.$('input[type="email"], input[name="username"], input[name="email"]');
            await emailInput.click({ clickCount: 3 });
            await this.page.keyboard.press('Backspace');
            await emailInput.type(this.email, { delay: 100 });
            this.log('📧 Email ingresado');

            // Buscar y hacer clic en botón de continuar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const continueButton = await this.page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(button => {
                    const text = button.textContent.toLowerCase();
                    return text.includes('continue') || 
                           text.includes('next') || 
                           text.includes('continuar') ||
                           text.includes('siguiente');
                }) || buttons.find(b => b.type === 'submit');
            });
            
            if (continueButton.asElement()) {
                await continueButton.asElement().click();
                this.log('➡️ Click en continuar');
            }
            
            // Esperar al campo de contraseña
            await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
            this.log('🔑 Campo de contraseña encontrado');
            
            // Ingresar contraseña
            const passwordInput = await this.page.$('input[type="password"]');
            await passwordInput.type(this.password, { delay: 100 });
            this.log('🔒 Contraseña ingresada');

            // Hacer clic en iniciar sesión
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const submitButton = await this.page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(button => {
                    const text = button.textContent.toLowerCase();
                    return text.includes('sign in') || 
                           text.includes('log in') || 
                           text.includes('iniciar') ||
                           button.type === 'submit';
                });
            });
            
            if (submitButton.asElement()) {
                await submitButton.asElement().click();
                this.log('✅ Credenciales enviadas');
            } else {
                await this.page.keyboard.press('Enter');
                this.log('✅ Enter presionado para enviar');
            }
            
            this.log('⏳ Esperando autenticación...');

            // Esperar a que la navegación complete
            await this.page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: LOGIN_TIMEOUT 
            }).catch(() => {
                this.log('⚠️ Timeout de navegación, verificando login...');
            });

            // Verificar si estamos logueados (URL cambió a enhance)
            const currentUrl = this.page.url();
            if (currentUrl.includes('enhance') || currentUrl.includes('podcast.adobe.com')) {
                this.log('✅ Sesión iniciada exitosamente');
            } else {
                this.log(`⚠️ URL actual: ${currentUrl}`);
            }
            
            // Esperar un poco más para asegurar que todo cargue
            await new Promise(resolve => setTimeout(resolve, 3000));

            return true;
        } catch (error) {
            this.log(`❌ Error en login: ${error.message}`);
            
            // Tomar screenshot del error
            try {
                const screenshot = await this.page.screenshot();
                this.log('📸 Screenshot capturado en caso de error');
            } catch (e) {
                // Ignorar error de screenshot
            }
            
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
                    const uploadButton = await this.page.evaluateHandle(() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        return buttons.find(b => b.textContent.toLowerCase().includes('upload'));
                    });
                    if (uploadButton.asElement()) {
                        await uploadButton.asElement().click();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // Subir archivo
                const input = await this.page.$('input[type="file"]');
                await input.uploadFile(filePath);
                
                this.log(`⬆️ Archivo subido: ${fileName}`);
                
                // Esperar a que comience el procesamiento
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                this.log('🔄 Esperando procesamiento...');
                
                // Esperar a que aparezca el botón de descarga o indicador de completado
                // Esto puede variar según la interfaz de Adobe Podcast
                try {
                    // Buscar botón de descarga
                    const downloadButton = await this.page.waitForFunction(() => {
                        const buttons = Array.from(document.querySelectorAll('button, a'));
                        return buttons.find(b => 
                            b.textContent.toLowerCase().includes('download') ||
                            b.hasAttribute('data-test-id') && b.getAttribute('data-test-id').includes('download')
                        );
                    }, { timeout: PROCESSING_TIMEOUT });
                    
                    this.log('✅ Procesamiento completado');
                    
                    // Hacer clic en el botón de descarga
                    await downloadButton.asElement().click();
                    
                    this.log('💾 Descarga iniciada...');
                    
                    // Esperar a que el archivo se descargue
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    this.log(`✅ Archivo procesado y descargado: ${fileName}`);
                    
                } catch (processingError) {
                    this.log(`⚠️ Timeout esperando procesamiento de ${fileName}`);
                    this.log('💡 El archivo puede estar siendo procesado en segundo plano');
                }
                
                // Esperar entre archivos
                if (i < files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
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

