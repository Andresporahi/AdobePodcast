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
    .option('speech-level', {
        description: 'Nivel de Speech (0-100)',
        type: 'number',
        default: 70
    })
    .option('background-level', {
        description: 'Nivel de Background (0-100)',
        type: 'number',
        default: 10
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
    constructor(email, password, downloadPath, speechLevel = 70, backgroundLevel = 10) {
        this.email = email;
        this.password = password;
        this.downloadPath = downloadPath;
        this.speechLevel = speechLevel;
        this.backgroundLevel = backgroundLevel;
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

        // Obtener todas las páginas abiertas
        const pages = await this.browser.pages();
        
        // Usar la primera página existente en lugar de crear una nueva
        if (pages.length > 0) {
            this.page = pages[0];
            this.log('📄 Usando pestaña existente');
        } else {
            this.page = await this.browser.newPage();
            this.log('📄 Creando nueva pestaña');
        }
        
        // Cerrar otras pestañas vacías (about:blank)
        for (let i = 1; i < pages.length; i++) {
            const url = pages[i].url();
            if (url === 'about:blank' || url === '') {
                await pages[i].close();
                this.log('🗑️ Pestaña vacía cerrada');
            }
        }
        
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
            const finalUrl = this.page.url();
            if (finalUrl.includes('enhance') || finalUrl.includes('podcast.adobe.com')) {
                this.log('✅ Sesión iniciada exitosamente');
            } else {
                this.log(`⚠️ URL actual: ${finalUrl}`);
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
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Esperar a que aparezca indicador de procesamiento
                this.log('🔄 Procesamiento en curso... (esto puede tardar varios minutos)');
                
                // Detectar cuando el procesamiento termine - buscar botón de descarga
                let downloadSuccess = false;
                const maxAttempts = 180; // 15 minutos (5 segundos * 180)
                
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    try {
                        // Buscar botón de descarga cada 5 segundos
                        const downloadInfo = await this.page.evaluate(() => {
                            // MÉTODO 1: Buscar el botón "Download" específico (visible en la UI de Adobe)
                            // Este es el botón gris en la esquina superior derecha
                            let downloadBtn = null;
                            
                            // Buscar por texto exacto "Download"
                            const allButtons = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'));
                            downloadBtn = allButtons.find(btn => {
                                const text = (btn.textContent || '').trim();
                                return text === 'Download' || text.toLowerCase() === 'download';
                            });
                            
                            // MÉTODO 2: Buscar por aria-label
                            if (!downloadBtn) {
                                downloadBtn = allButtons.find(btn => {
                                    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                                    return ariaLabel.includes('download') || ariaLabel.includes('descargar');
                                });
                            }
                            
                            // MÉTODO 3: Búsqueda exhaustiva
                            if (!downloadBtn) {
                                const allElements = Array.from(document.querySelectorAll('*'));
                                
                                downloadBtn = allElements.find(el => {
                                    const tagName = el.tagName?.toLowerCase();
                                    if (!['button', 'a', 'div', 'span'].includes(tagName)) return false;
                                    
                                    const text = (el.textContent || '').toLowerCase().trim();
                                    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                                    const className = (el.className || '').toLowerCase();
                                    const id = (el.id || '').toLowerCase();
                                    const dataAttributes = Array.from(el.attributes)
                                        .filter(attr => attr.name.startsWith('data-'))
                                        .map(attr => attr.value.toLowerCase())
                                        .join(' ');
                                    
                                    // Buscar palabras clave de descarga
                                    const downloadKeywords = ['download', 'descargar'];
                                    const hasDownloadText = downloadKeywords.some(keyword => 
                                        text.includes(keyword) || 
                                        ariaLabel.includes(keyword) ||
                                        className.includes(keyword) ||
                                        id.includes(keyword) ||
                                        dataAttributes.includes(keyword)
                                    );
                                    
                                    return hasDownloadText;
                                });
                            }
                            
                            // Verificar si el botón encontrado está visible y habilitado
                            if (downloadBtn) {
                                const style = window.getComputedStyle(downloadBtn);
                                const isVisible = style.display !== 'none' && 
                                                 style.visibility !== 'hidden' &&
                                                 parseFloat(style.opacity) > 0;
                                
                                const isDisabled = downloadBtn.hasAttribute('disabled') || 
                                                 downloadBtn.getAttribute('aria-disabled') === 'true' ||
                                                 downloadBtn.classList.contains('disabled') ||
                                                 style.pointerEvents === 'none';
                                
                                if (isVisible && !isDisabled) {
                                    return {
                                        found: true,
                                        text: downloadBtn.textContent.trim(),
                                        tag: downloadBtn.tagName,
                                        className: downloadBtn.className,
                                        id: downloadBtn.id
                                    };
                                }
                            }
                            
                            // Debugging: mostrar todos los botones visibles
                            const visibleButtons = allButtons
                                .filter(b => {
                                    const style = window.getComputedStyle(b);
                                    return style.display !== 'none' && 
                                           style.visibility !== 'hidden' &&
                                           parseFloat(style.opacity) > 0;
                                })
                                .map(b => b.textContent.trim())
                                .filter(t => t.length > 0 && t.length < 50);
                            
                            return { found: false, availableButtons: visibleButtons.slice(0, 10) };
                        });
                        
                        if (downloadInfo.found) {
                            this.log(`✅ Procesamiento completado - Botón encontrado: "${downloadInfo.text}"`);
                            this.log(`📋 Detalles: Tag=${downloadInfo.tag}, Class=${downloadInfo.className}, ID=${downloadInfo.id}`);
                            
                            // Ajustar los sliders ANTES de descargar
                            this.log(`🎚️ Ajustando Speech a ${this.speechLevel}% y Background a ${this.backgroundLevel}%...`);
                            
                            await this.page.evaluate((speech, background) => {
                                // Buscar sliders por múltiples métodos
                                const sliders = Array.from(document.querySelectorAll('input[type="range"], [role="slider"]'));
                                
                                sliders.forEach(slider => {
                                    const label = slider.parentElement?.textContent?.toLowerCase() || 
                                                 slider.getAttribute('aria-label')?.toLowerCase() || '';
                                    
                                    if (label.includes('speech') || label.includes('voz')) {
                                        // Ajustar Speech
                                        slider.value = speech;
                                        slider.dispatchEvent(new Event('input', { bubbles: true }));
                                        slider.dispatchEvent(new Event('change', { bubbles: true }));
                                    } else if (label.includes('background') || label.includes('fondo')) {
                                        // Ajustar Background
                                        slider.value = background;
                                        slider.dispatchEvent(new Event('input', { bubbles: true }));
                                        slider.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                });
                            }, this.speechLevel, this.backgroundLevel);
                            
                            // Esperar a que los cambios se apliquen
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            this.log('✅ Ajustes aplicados');
                            
                            // Hacer clic en el botón de descarga
                            const clicked = await this.page.evaluate(() => {
                                // Buscar el botón "Download" y hacer click
                                const allButtons = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'));
                                
                                let downloadBtn = allButtons.find(btn => {
                                    const text = (btn.textContent || '').trim();
                                    return text === 'Download' || text.toLowerCase() === 'download';
                                });
                                
                                if (!downloadBtn) {
                                    downloadBtn = allButtons.find(btn => {
                                        const text = (btn.textContent || '').toLowerCase();
                                        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                                        return text.includes('download') || ariaLabel.includes('download');
                                    });
                                }
                                
                                if (downloadBtn && !downloadBtn.hasAttribute('disabled')) {
                                    downloadBtn.click();
                                    return true;
                                }
                                return false;
                            });
                            
                            if (clicked) {
                                this.log('💾 Click en botón de descarga ejecutado');
                                
                                // Esperar a que el archivo se descargue (más tiempo)
                                this.log('⏳ Esperando descarga del archivo...');
                                await new Promise(resolve => setTimeout(resolve, 10000));
                                
                                this.log(`✅ Archivo descargado: ${fileName}`);
                                downloadSuccess = true;
                                break;
                            } else {
                                this.log('⚠️ No se pudo hacer click en el botón');
                            }
                        }
                        
                        // Verificar si hay un error
                        const hasError = await this.page.evaluate(() => {
                            const errorKeywords = ['error', 'failed', 'unsuccessful', 'problema'];
                            const allText = document.body.textContent.toLowerCase();
                            
                            return errorKeywords.some(keyword => {
                                const index = allText.indexOf(keyword);
                                if (index !== -1) {
                                    // Verificar que no sea parte de otro texto normal
                                    const context = allText.substring(Math.max(0, index - 50), index + 50);
                                    return context.includes('processing') || 
                                           context.includes('upload') ||
                                           context.includes('enhance');
                                }
                                return false;
                            });
                        });
                        
                        if (hasError) {
                            this.log('❌ Error detectado en el procesamiento');
                            break;
                        }
                        
                        // Mostrar progreso cada 6 intentos (30 segundos)
                        if (attempt % 6 === 0 && attempt > 0) {
                            const seconds = attempt * 5;
                            const minutes = Math.floor(seconds / 60);
                            const remainingSeconds = seconds % 60;
                            this.log(`⏳ Aún procesando... (${minutes}m ${remainingSeconds}s)`);
                            
                            // Mostrar botones disponibles para debugging
                            if (downloadInfo.availableButtons && downloadInfo.availableButtons.length > 0) {
                                this.log(`🔍 Botones visibles: ${downloadInfo.availableButtons.join(', ')}`);
                            }
                        }
                        
                        // Esperar 5 segundos antes del siguiente intento
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        
                    } catch (err) {
                        this.log(`⚠️ Error en intento ${attempt}: ${err.message}`);
                        // Continuar con el siguiente intento
                    }
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
        argv['download-path'],
        argv['speech-level'],
        argv['background-level']
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

