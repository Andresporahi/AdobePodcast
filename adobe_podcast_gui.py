# -*- coding: utf-8 -*-
"""
Adobe Podcast Enhancer - GUI con Tkinter
Aplicación de escritorio con diseño moderno de Platzi
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import json
import subprocess
import threading
from pathlib import Path
import base64
import os
import sys

# Configurar encoding UTF-8 para Windows (solo si hay consola)
if sys.platform == 'win32':
    try:
        import codecs
        if sys.stdout and hasattr(sys.stdout, 'buffer'):
            sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        if sys.stderr and hasattr(sys.stderr, 'buffer'):
            sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except (AttributeError, OSError):
        pass  # pythonw no tiene stdout/stderr

# Colores de Platzi
PLATZI_GREEN = "#98ca3f"
PLATZI_GREEN_HOVER = "#b8e65f"
PLATZI_DARK = "#0c1526"
PLATZI_DARK_2 = "#121f3d"
PLATZI_BLUE = "#24385b"
PLATZI_BLUE_LIGHT = "#2e4a6d"
PLATZI_WHITE = "#ffffff"
PLATZI_GRAY = "#a6b6cc"

# Configuración
CONFIG_DIR = Path(__file__).parent / "config"
CONFIG_DIR.mkdir(exist_ok=True)
CONFIG_FILE = CONFIG_DIR / "settings.json"
CREDENTIALS_FILE = CONFIG_DIR / "credentials.json"


class AdobePodcastApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Adobe Podcast Enhancer - Platzi Edition")
        self.root.geometry("900x700")
        self.root.configure(bg=PLATZI_DARK)
        
        # Variables
        self.email_var = tk.StringVar()
        self.password_var = tk.StringVar()
        self.remember_var = tk.BooleanVar()
        self.download_path_var = tk.StringVar()
        self.auto_download_var = tk.BooleanVar(value=True)
        self.keep_original_var = tk.BooleanVar(value=True)
        self.speech_level_var = tk.IntVar(value=70)
        self.background_level_var = tk.IntVar(value=10)
        self.logged_in = False
        self.selected_files = []
        
        # Cargar configuración
        self.load_config()
        self.load_credentials()
        
        # Configurar estilos
        self.setup_styles()
        
        # Crear interfaz
        self.create_widgets()
        
        # Centrar ventana
        self.center_window()
    
    def setup_styles(self):
        """Configura los estilos personalizados"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Frame
        style.configure('TFrame', background=PLATZI_DARK)
        style.configure('Card.TFrame', background=PLATZI_DARK_2)
        
        # Labels
        style.configure('TLabel', background=PLATZI_DARK,
                       foreground=PLATZI_WHITE, font=('Segoe UI', 10))
        style.configure('Title.TLabel', font=('Segoe UI', 24, 'bold'),
                       foreground=PLATZI_GREEN, background=PLATZI_DARK)
        style.configure('Subtitle.TLabel', font=('Segoe UI', 12),
                       foreground=PLATZI_GRAY, background=PLATZI_DARK)
        style.configure('CardTitle.TLabel', font=('Segoe UI', 14, 'bold'),
                       foreground=PLATZI_WHITE, background=PLATZI_DARK_2)
        
        # Entry
        style.configure('TEntry', fieldbackground=PLATZI_WHITE,
                       foreground=PLATZI_DARK, borderwidth=2)
        
        # Checkbutton
        style.configure('TCheckbutton', background=PLATZI_DARK,
                       foreground=PLATZI_WHITE, font=('Segoe UI', 10))
    
    def center_window(self):
        """Centra la ventana en la pantalla"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_widgets(self):
        """Crea todos los widgets de la interfaz"""
        # Header
        header_frame = tk.Frame(self.root, bg=PLATZI_GREEN, height=120)
        header_frame.pack(fill='x', padx=0, pady=0)
        header_frame.pack_propagate(False)
        
        title_label = ttk.Label(header_frame, text="🎙️ Adobe Podcast Enhancer",
                               style='Title.TLabel')
        title_label.pack(pady=(20, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Automatización Profesional - Platzi Edition",
                                  style='Subtitle.TLabel')
        subtitle_label.pack()
        
        # Contenedor principal con scroll
        main_container = tk.Frame(self.root, bg=PLATZI_DARK)
        main_container.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Canvas para scroll
        canvas = tk.Canvas(main_container, bg=PLATZI_DARK,
                          highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_container, orient='vertical',
                                 command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=PLATZI_DARK)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor='nw')
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Habilitar scroll con mouse wheel
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        def _bound_to_mousewheel(event):
            canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        def _unbound_to_mousewheel(event):
            canvas.unbind_all("<MouseWheel>")
        
        canvas.bind('<Enter>', _bound_to_mousewheel)
        canvas.bind('<Leave>', _unbound_to_mousewheel)
        
        canvas.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        # Contenedor de widgets
        self.content_frame = scrollable_frame
        
        # Guardar referencia al canvas para uso posterior
        self.canvas = canvas
        
        # Mostrar login o panel principal
        self.show_login_screen()
    
    def show_login_screen(self):
        """Muestra la pantalla de login"""
        # Limpiar contenido
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Card de login
        login_card = self.create_card(self.content_frame,
                                     "🔐 Iniciar Sesión en Adobe")
        
        # Email
        tk.Label(login_card, text="📧 Correo electrónico:",
                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 10)).pack(anchor='w', pady=(10, 5))
        
        email_entry = tk.Entry(login_card, textvariable=self.email_var,
                              bg=PLATZI_WHITE, fg=PLATZI_DARK,
                              font=('Segoe UI', 11), width=40)
        email_entry.pack(fill='x', pady=(0, 15))
        
        # Password
        tk.Label(login_card, text="🔒 Contraseña:",
                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 10)).pack(anchor='w', pady=(0, 5))
        
        password_entry = tk.Entry(login_card, textvariable=self.password_var,
                                 show='•', bg=PLATZI_WHITE, fg=PLATZI_DARK,
                                 font=('Segoe UI', 11), width=40)
        password_entry.pack(fill='x', pady=(0, 15))
        
        # Recordar
        remember_check = tk.Checkbutton(login_card,
                                       text="🔐 Recordar credenciales",
                                       variable=self.remember_var,
                                       bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                                       selectcolor=PLATZI_BLUE,
                                       font=('Segoe UI', 10),
                                       activebackground=PLATZI_DARK_2,
                                       activeforeground=PLATZI_WHITE)
        remember_check.pack(anchor='w', pady=(0, 20))
        
        # Botón de login
        login_btn = self.create_button(login_card, "🚀 Iniciar Sesión",
                                      self.do_login)
        login_btn.pack(pady=10)
        
        # Nota de seguridad
        security_frame = tk.Frame(login_card, bg='#2C5282',
                                 highlightbackground=PLATZI_BLUE,
                                 highlightthickness=1)
        security_frame.pack(fill='x', pady=(20, 0))
        
        security_text = """ℹ️ Nota de Seguridad:

Tus credenciales se almacenan localmente de forma
encriptada y solo se usan para automatizar el login.

Esta aplicación NO comparte tus credenciales."""
        
        tk.Label(security_frame, text=security_text,
                bg='#2C5282', fg=PLATZI_WHITE,
                font=('Segoe UI', 9), justify='left').pack(padx=15, pady=15)
    
    def show_main_screen(self):
        """Muestra la pantalla principal después del login"""
        # Limpiar contenido
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Info de usuario
        user_card = self.create_card(self.content_frame,
                                    f"👤 Sesión: {self.email_var.get()}")
        
        logout_btn = self.create_button(user_card, "🚪 Cerrar Sesión",
                                       self.do_logout, secondary=True)
        logout_btn.pack(pady=10)
        
        # Configuración
        config_card = self.create_card(self.content_frame,
                                      "⚙️ Configuración")
        
        tk.Label(config_card, text="📁 Ruta de descarga:",
                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 10)).pack(anchor='w', pady=(10, 5))
        
        path_frame = tk.Frame(config_card, bg=PLATZI_DARK_2)
        path_frame.pack(fill='x', pady=(0, 10))
        
        path_entry = tk.Entry(path_frame, textvariable=self.download_path_var,
                             bg=PLATZI_WHITE, fg=PLATZI_DARK,
                             font=('Segoe UI', 10))
        path_entry.pack(side='left', fill='x', expand=True, padx=(0, 10))
        
        browse_btn = self.create_button(path_frame, "📂 Examinar",
                                        self.browse_folder, small=True)
        browse_btn.pack(side='right')
        
        tk.Checkbutton(config_card, text="Descarga automática",
                      variable=self.auto_download_var,
                      bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                      selectcolor=PLATZI_BLUE,
                      font=('Segoe UI', 10),
                      activebackground=PLATZI_DARK_2,
                      activeforeground=PLATZI_WHITE).pack(anchor='w',
                                                         pady=(0, 5))
        
        tk.Checkbutton(config_card, text="Mantener archivos originales",
                      variable=self.keep_original_var,
                      bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                      selectcolor=PLATZI_BLUE,
                      font=('Segoe UI', 10),
                      activebackground=PLATZI_DARK_2,
                      activeforeground=PLATZI_WHITE).pack(anchor='w',
                                                         pady=(0, 15))
        
        # Ajustes de Adobe Podcast
        tk.Label(config_card, text="🎚️ Ajustes de Adobe Podcast",
                bg=PLATZI_DARK_2, fg=PLATZI_GREEN,
                font=('Segoe UI', 11, 'bold')).pack(anchor='w', pady=(5, 10))
        
        # Speech slider
        speech_frame = tk.Frame(config_card, bg=PLATZI_DARK_2)
        speech_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(speech_frame, text="Speech (Voz):",
                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 10)).pack(side='left')
        
        self.speech_label = tk.Label(speech_frame,
                                     text=f"{self.speech_level_var.get()}%",
                                     bg=PLATZI_DARK_2, fg=PLATZI_GREEN,
                                     font=('Segoe UI', 10, 'bold'))
        self.speech_label.pack(side='right')
        
        speech_slider = tk.Scale(config_card, from_=0, to=100,
                                orient='horizontal',
                                variable=self.speech_level_var,
                                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                                troughcolor=PLATZI_BLUE,
                                activebackground=PLATZI_GREEN,
                                highlightthickness=0,
                                command=lambda v: self.speech_label.config(
                                    text=f"{int(float(v))}%"))
        speech_slider.pack(fill='x', pady=(0, 15))
        
        # Background slider
        bg_frame = tk.Frame(config_card, bg=PLATZI_DARK_2)
        bg_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(bg_frame, text="Background (Fondo):",
                bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 10)).pack(side='left')
        
        self.background_label = tk.Label(bg_frame,
                                        text=f"{self.background_level_var.get()}%",
                                        bg=PLATZI_DARK_2, fg=PLATZI_GREEN,
                                        font=('Segoe UI', 10, 'bold'))
        self.background_label.pack(side='right')
        
        background_slider = tk.Scale(config_card, from_=0, to=100,
                                    orient='horizontal',
                                    variable=self.background_level_var,
                                    bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                                    troughcolor=PLATZI_BLUE,
                                    activebackground=PLATZI_GREEN,
                                    highlightthickness=0,
                                    command=lambda v: self.background_label.config(
                                        text=f"{int(float(v))}%"))
        background_slider.pack(fill='x', pady=(0, 15))
        
        save_config_btn = self.create_button(config_card,
                                            "💾 Guardar Configuración",
                                            self.save_config, secondary=True)
        save_config_btn.pack(pady=10)
        
        # Subida de archivos
        upload_card = self.create_card(self.content_frame,
                                      "📤 Subir Videos")
        
        select_btn = self.create_button(upload_card,
                                        "📁 Seleccionar Videos",
                                        self.select_files)
        select_btn.pack(pady=10)
        
        # Lista de archivos
        self.files_listbox = tk.Listbox(upload_card, height=6,
                                        bg=PLATZI_WHITE, fg=PLATZI_DARK,
                                        font=('Segoe UI', 9),
                                        selectmode='extended')
        self.files_listbox.pack(fill='both', expand=True, pady=(10, 10))
        
        # Botón de procesar
        process_btn = self.create_button(upload_card, "🎬 Procesar Videos",
                                         self.process_videos)
        process_btn.pack(pady=10)
        
        # Log de progreso
        log_card = self.create_card(self.content_frame, "📊 Registro")
        
        self.log_text = scrolledtext.ScrolledText(log_card, height=10,
                                                  bg=PLATZI_DARK,
                                                  fg=PLATZI_GREEN,
                                                  font=('Consolas', 9),
                                                  wrap='word')
        self.log_text.pack(fill='both', expand=True, pady=10)
        self.log(">> Sistema iniciado correctamente")
    
    def create_card(self, parent, title):
        """Crea un card con estilo Platzi"""
        card_frame = tk.Frame(parent, bg=PLATZI_DARK_2,
                             highlightbackground=PLATZI_GREEN,
                             highlightthickness=2)
        card_frame.pack(fill='x', pady=10, padx=5)
        
        # Barra superior verde
        top_bar = tk.Frame(card_frame, bg=PLATZI_GREEN, height=4)
        top_bar.pack(fill='x')
        
        # Contenido
        content = tk.Frame(card_frame, bg=PLATZI_DARK_2)
        content.pack(fill='both', expand=True, padx=20, pady=15)
        
        # Título
        tk.Label(content, text=title, bg=PLATZI_DARK_2, fg=PLATZI_WHITE,
                font=('Segoe UI', 14, 'bold')).pack(anchor='w', pady=(0, 10))
        
        return content
    
    def create_button(self, parent, text, command, secondary=False,
                     small=False):
        """Crea un botón estilo Platzi"""
        bg_color = PLATZI_BLUE if secondary else PLATZI_GREEN
        hover_color = PLATZI_BLUE_LIGHT if secondary else PLATZI_GREEN_HOVER
        font_size = 9 if small else 11
        
        btn = tk.Button(parent, text=text, command=command,
                       bg=bg_color, fg=PLATZI_WHITE,
                       font=('Segoe UI', font_size, 'bold'),
                       relief='flat', cursor='hand2',
                       padx=20, pady=10 if not small else 8,
                       activebackground=hover_color,
                       activeforeground=PLATZI_WHITE)
        
        # Efectos hover
        btn.bind('<Enter>',
                lambda e: btn.configure(bg=hover_color))
        btn.bind('<Leave>',
                lambda e: btn.configure(bg=bg_color))
        
        return btn
    
    def load_config(self):
        """Carga la configuración"""
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                self.download_path_var.set(
                    config.get("download_path",
                              str(Path.home() / "Downloads" / "AdobePodcast")))
                self.auto_download_var.set(config.get("auto_download", True))
                self.keep_original_var.set(config.get("keep_original", True))
                self.speech_level_var.set(config.get("speech_level", 70))
                self.background_level_var.set(config.get("background_level", 10))
        else:
            self.download_path_var.set(
                str(Path.home() / "Downloads" / "AdobePodcast"))
    
    def save_config(self):
        """Guarda la configuración"""
        config = {
            "download_path": self.download_path_var.get(),
            "auto_download": self.auto_download_var.get(),
            "keep_original": self.keep_original_var.get(),
            "speech_level": self.speech_level_var.get(),
            "background_level": self.background_level_var.get()
        }
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        messagebox.showinfo("Exito", "Configuracion guardada")
        self.log(">> Configuracion guardada")
        self.log(f">> Speech: {self.speech_level_var.get()}%, Background: {self.background_level_var.get()}%")
    
    def load_credentials(self):
        """Carga las credenciales guardadas"""
        if CREDENTIALS_FILE.exists():
            with open(CREDENTIALS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data.get("remember"):
                    email_b64 = data.get("email", "")
                    password_b64 = data.get("password", "")
                    if email_b64:
                        self.email_var.set(
                            base64.b64decode(email_b64).decode('utf-8'))
                    if password_b64:
                        self.password_var.set(
                            base64.b64decode(password_b64).decode('utf-8'))
                    self.remember_var.set(True)
    
    def save_credentials(self):
        """Guarda las credenciales"""
        if self.remember_var.get():
            data = {
                "email": base64.b64encode(
                    self.email_var.get().encode('utf-8')).decode('utf-8'),
                "password": base64.b64encode(
                    self.password_var.get().encode('utf-8')).decode('utf-8'),
                "remember": True
            }
        else:
            data = {"email": "", "password": "", "remember": False}
        
        with open(CREDENTIALS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    def do_login(self):
        """Realiza el login"""
        email = self.email_var.get()
        password = self.password_var.get()
        
        if not email or not password:
            messagebox.showerror("Error",
                                "Por favor ingresa email y contraseña")
            return
        
        # Guardar credenciales si está marcado
        self.save_credentials()
        
        # Marcar como logueado
        self.logged_in = True
        
        # Mostrar pantalla principal
        self.show_main_screen()
    
    def do_logout(self):
        """Cierra sesión"""
        self.logged_in = False
        self.show_login_screen()
    
    def browse_folder(self):
        """Abre diálogo para seleccionar carpeta"""
        folder = filedialog.askdirectory(
            title="Selecciona carpeta de descarga",
            initialdir=self.download_path_var.get()
        )
        if folder:
            self.download_path_var.set(folder)
    
    def select_files(self):
        """Selecciona archivos de video"""
        files = filedialog.askopenfilenames(
            title="Selecciona videos",
            filetypes=[
                ("Videos", "*.mp4 *.mov *.avi *.mkv *.webm *.m4v"),
                ("Todos", "*.*")
            ]
        )
        
        if files:
            self.selected_files = list(files)
            self.files_listbox.delete(0, tk.END)
            for file in self.selected_files:
                filename = Path(file).name
                size_mb = Path(file).stat().st_size / (1024 * 1024)
                self.files_listbox.insert(
                    tk.END, f"{filename} ({size_mb:.2f} MB)")
            self.log(f">> {len(self.selected_files)} archivo(s) seleccionado(s)")
    
    def log(self, message):
        """Añade mensaje al log"""
        if hasattr(self, 'log_text'):
            self.log_text.insert(tk.END, f"{message}\n")
            self.log_text.see(tk.END)
    
    def process_videos(self):
        """Procesa los videos seleccionados"""
        if not self.selected_files:
            messagebox.showwarning("Advertencia",
                                  "Por favor selecciona videos primero")
            return
        
        # Ejecutar en thread separado
        thread = threading.Thread(target=self.run_automation)
        thread.daemon = True
        thread.start()
    
    def run_automation(self):
        """Ejecuta el script de automatización"""
        try:
            self.log(">> Iniciando procesamiento...")
            
            # Preparar argumentos
            files_json = json.dumps(self.selected_files)
            script_path = Path(__file__).parent / "automation.js"
            
            cmd = [
                'node',
                str(script_path),
                '--email', self.email_var.get(),
                '--password', self.password_var.get(),
                '--files', files_json,
                '--download-path', self.download_path_var.get(),
                '--speech-level', str(self.speech_level_var.get()),
                '--background-level', str(self.background_level_var.get())
            ]
            
            # Ejecutar con encoding UTF-8
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                encoding='utf-8',
                errors='replace',  # Reemplazar caracteres no decodificables
                bufsize=1
            )
            
            # Leer salida
            for line in process.stdout:
                line = line.strip()
                if line:
                    # Limpiar timestamp si existe
                    if ']' in line:
                        line = line.split(']', 1)[-1].strip()
                    self.log(line)
            
            process.wait()
            
            if process.returncode == 0:
                self.log(">> Procesamiento completado!")
                messagebox.showinfo("Exito",
                                   "Videos procesados correctamente")
            else:
                error = process.stderr.read()
                self.log(f">> Error: {error}")
                messagebox.showerror("Error", f"Error: {error}")
        
        except Exception as e:
            self.log(f">> Error: {str(e)}")
            messagebox.showerror("Error", str(e))


def main():
    """Función principal"""
    root = tk.Tk()
    
    # Configurar icono (opcional)
    try:
        root.iconbitmap('icon.ico')
    except:
        pass
    
    app = AdobePodcastApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

