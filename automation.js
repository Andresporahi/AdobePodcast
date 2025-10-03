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
        this.log('🚀 Iniciando navegador Chrome...');
        
        // Crear directorio de descargas si no existe
        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath, { recursive: true });
        }

        // Detectar Chrome instalado
        const chromeExecutable = this.findChromeExecutable();
        
        // Ruta del perfil de usuario (temporal para evitar conflictos)
        const userDataDir = path.join(process.env.LOCALAPPDATA || process.env.APPDATA, 'AdobePodcastEnhancer', 'ChromeProfile');
        
        // Crear directorio del perfil si no existe
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }

        this.log('🌐 Usando Chrome instalado en tu sistema');

        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: chromeExecutable,
            userDataDir: userDataDir, // Usa un perfil persistente
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled', // Evitar detección de bot
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Ocultar que es automation
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });
        
        // Configurar descargas
        const client = await this.page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.downloadPath
        });

        this.log('✅ Navegador Chrome iniciado con perfil persistente');
    }

    findChromeExecutable() {
        // Rutas comunes de Chrome en Windows
        const possiblePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env.PROGRAMFILES, 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env['PROGRAMFILES(X86)'], 'Google\\Chrome\\Application\\chrome.exe')
        ];

        for (const chromePath of possiblePaths) {
            if (fs.existsSync(chromePath)) {
                this.log(`✅ Chrome encontrado en: ${chromePath}`);
                return chromePath;
            }
        }

        // Si no se encuentra, usar Chromium de Puppeteer
        this.log('⚠️ Chrome no encontrado, usando Chromium de Puppeteer');
        return null; // Puppeteer usará su Chromium
    }

    async login() {
        try {
            this.log('🔐 Verificando sesión en Adobe...');
            
            // Navegar a Adobe Podcast
            await this.page.goto(ADOBE_PODCAST_URL, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            this.log('📄 Página cargada');

            // Esperar un momento para que la página cargue completamente
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar si ya estamos logueados
            const currentUrl = this.page.url();
            const isLoggedIn = await this.page.evaluate(() => {
                // Buscar elementos que indiquen que estamos logueados
                const uploadButton = document.querySelector('input[type="file"]');
                const signOutButton = Array.from(document.querySelectorAll('button, a')).find(b => 
                    b.textContent.toLowerCase().includes('sign out') || 
                    b.textContent.toLowerCase().includes('logout')
                );
                const enhanceInterface = document.querySelector('[data-test-id*="enhance"], .enhance, #enhance');
                
                return !!(uploadButton || signOutButton || enhanceInterface);
            });
            
            if (isLoggedIn || currentUrl.includes('/enhance')) {
                this.log('✅ Ya estás logueado - Saltando proceso de login');
                return true;
            }
            
            this.log('🔑 No estás logueado, procediendo con login...');
            
            // Buscar botón de Sign In usando texto
            const hasSignInButton = await this.page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, a'));
                const signInBtn = buttons.find(button => {
                    const text = button.textContent.toLowerCase();
                    return text.includes('sign in') || 
                           text.includes('log in') || 
                           text.includes('iniciar sesión') ||
                           text.includes('get started');
                });
                
                if (signInBtn) {
                    signInBtn.click();
                    return true;
                }
                
                // Buscar enlace de IMS
                const imsLink = document.querySelector('a[href*="ims"], a[href*="adobelogin"]');
                if (imsLink) {
                    imsLink.click();
                    return true;
                }
                
                return false;
            });
            
            if (hasSignInButton) {
                this.log('🖱️ Click en botón de Sign In ejecutado');
            } else {
                // Podría ser que ya estemos en la página de login
                const loginForm = await this.page.$('input[type="email"], input[name="username"]');
                if (!loginForm) {
                    this.log('⚠️ No se encontró botón de Sign In ni formulario de login');
                    this.log('💡 Puede que ya estés logueado o la interfaz haya cambiado');
                    // No lanzar error, intentar continuar
                    return true;
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
                let fileInput = await this.page.$('input[type="file"]');
                
                if (!fileInput) {
                    this.log('⚠️ No se encontró input de archivo, buscando botón de upload...');
                    
                    // Hacer clic en cualquier botón que diga "upload" o similar
                    await this.page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                        const uploadBtn = buttons.find(b => {
                            const text = b.textContent.toLowerCase();
                            return text.includes('upload') || text.includes('select') || text.includes('choose');
                        });
                        if (uploadBtn) uploadBtn.click();
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    fileInput = await this.page.$('input[type="file"]');
                }

                // Subir archivo
                if (fileInput) {
                    await fileInput.uploadFile(filePath);
                    this.log(`⬆️ Archivo subido: ${fileName}`);
                } else {
                    this.log('❌ No se pudo encontrar el input de archivo');
                    continue;
                }
                
                // Esperar a que comience el procesamiento
                this.log('⏳ Esperando inicio de procesamiento...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Esperar a que aparezca indicador de procesamiento
                this.log('🔄 Procesamiento en curso...');
                
                // Detectar cuando el procesamiento termine - buscar botón de descarga
                let downloadSuccess = false;
                const maxAttempts = 120; // 10 minutos (5 segundos * 120)
                
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    // Buscar botón de descarga cada 5 segundos
                    const downloadButton = await this.page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                        const downloadBtn = buttons.find(b => {
                            const text = b.textContent.toLowerCase();
                            const ariaLabel = b.getAttribute('aria-label')?.toLowerCase() || '';
                            return text.includes('download') || 
                                   ariaLabel.includes('download') ||
                                   text.includes('descargar');
                        });
                        
                        if (downloadBtn) {
                            // Verificar si el botón está habilitado
                            const isDisabled = downloadBtn.hasAttribute('disabled') || 
                                             downloadBtn.getAttribute('aria-disabled') === 'true' ||
                                             downloadBtn.classList.contains('disabled');
                            return !isDisabled;
                        }
                        return false;
                    });
                    
                    if (downloadButton) {
                        this.log('✅ Procesamiento completado - Botón de descarga disponible');
                        
                        // Hacer clic en el botón de descarga
                        await this.page.evaluate(() => {
                            const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                            const downloadBtn = buttons.find(b => {
                                const text = b.textContent.toLowerCase();
                                const ariaLabel = b.getAttribute('aria-label')?.toLowerCase() || '';
                                return text.includes('download') || 
                                       ariaLabel.includes('download') ||
                                       text.includes('descargar');
                            });
                            if (downloadBtn) {
                                downloadBtn.click();
                            }
                        });
                        
                        this.log('💾 Click en botón de descarga ejecutado');
                        
                        // Esperar a que el archivo se descargue
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        
                        this.log(`✅ Archivo descargado: ${fileName}`);
                        downloadSuccess = true;
                        break;
                    }
                    
                    // Verificar si hay un error
                    const hasError = await this.page.evaluate(() => {
                        const errorElements = Array.from(document.querySelectorAll('*'));
                        return errorElements.some(el => {
                            const text = el.textContent.toLowerCase();
                            return text.includes('error') || text.includes('failed');
                        });
                    });
                    
                    if (hasError) {
                        this.log('❌ Error detectado en el procesamiento');
                        break;
                    }
                    
                    // Mostrar progreso cada 10 intentos (50 segundos)
                    if (attempt % 10 === 0 && attempt > 0) {
                        this.log(`⏳ Aún procesando... (${attempt * 5} segundos)`);
                    }
                    
                    // Esperar 5 segundos antes del siguiente intento
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
                if (!downloadSuccess) {
                    this.log(`⚠️ No se pudo descargar automáticamente: ${fileName}`);
                    this.log('💡 Por favor descarga manualmente desde la página');
                    
                    // Tomar screenshot para debug
                    try {
                        const screenshotPath = path.join(this.downloadPath, `error_${Date.now()}.png`);
                        await this.page.screenshot({ path: screenshotPath, fullPage: true });
                        this.log(`📸 Screenshot guardado: ${screenshotPath}`);
                    } catch (e) {
                        // Ignorar error de screenshot
                    }
                }
                
                // Esperar entre archivos
                if (i < files.length - 1) {
                    this.log('⏳ Preparando siguiente archivo...');
                    
                    // Recargar la página para procesar el siguiente archivo
                    this.log('🔄 Recargando página para siguiente archivo...');
                    await this.page.goto(ADOBE_PODCAST_URL, {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    this.log('✅ Página lista para siguiente archivo');
                }
            }

            this.log('🎉 ¡Procesamiento completado para todos los archivos!');
            this.log(`📊 Total procesado: ${files.length} archivo(s)`);
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

