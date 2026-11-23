# vyshnavi511/Micro-OS

## Resumen

Micro-OS (publicado internamente como VyshOS) no es un modelo de inteligencia artificial, sino un sistema operativo bare-metal de 64 bits escrito íntegramente en Rust (`no_std`) que arranca directamente desde firmware UEFI y ofrece un escritorio gráfico funcional. El proyecto lo desarrolla Yeddula Vyshnavi en el marco de la asignatura de Sistemas Operativos de la Facultad de Ingeniería y Tecnología de la Universidad JAIN (India), y se publica en Hugging Face bajo licencia MIT como repositorio de código y binarios, no como pesos de red neuronal.

Su relevancia es divulgativa y educativa: demuestra una implementación completa de un microkernel didáctico con gestor de framebuffer GOP a 1080p, driver PS/2 de ratón y touchpad, reloj RTC por CMOS y un conjunto de aplicaciones de escritorio (shell interactiva, calculadora, visor de red, diagnósticos de hardware). El repositorio incluye una ISO arrancable de 4,48 MB y scripts de construcción para generar imágenes VDI de VirtualBox.

Conviene subrayar que no contiene parámetros, pesos, tokenizador ni pipeline de inferencia; los campos propios de una ficha de modelo (contexto, cuantización, benchmarks) no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Microkernel bare-metal x86_64 UEFI, escrito en Rust (`#![no_std]`, `#![no_main]`) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible (no es un modelo de IA) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz y shell en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio contiene codigo fuente Rust, ISO UEFI (`Micro-OS.iso`, 4,48 MB) e imagenes VDI de VirtualBox |
| Target de compilacion | `x86_64-unknown-uefi` |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se compila como binario freestanding para el target `x86_64-unknown-uefi` y se ejecuta sin sistema operativo subyacente. Invoca los servicios de arranque y de runtime de UEFI mediante punteros a funciones con ABI EFI nativa, consulta el Graphics Output Protocol (GOP) y selecciona el modo de mayor resolucion soportado, hasta 1920x1080. La gestion del raton y del touchpad se hace por ensamblador en linea sobre el controlador 8042 en los puertos de E/S `0x60` y `0x64`, decodificando paquetes estandar de 3 bytes para desplazamiento y clics.

El cursor se dibuja con un buffer dedicado (`MouseCursorBuffer`) que guarda y restaura 256 pixeles bajo un puntero de 16x16, de modo que solo se repinta la region del cursor en lugar del fondo completo de dos millones de pixeles; esto elimina el tearing y el parpadeo. El reloj de la barra de tareas se sincroniza con el CMOS/RTC y con `GetTime` de los servicios de runtime UEFI, actualizandose cada minuto sin bloquear la interfaz. No hay datos de entrenamiento, RLHF ni proceso de ajuste: el proyecto no entrena ningun modelo.

## Capacidades

- Arranque directo desde firmware UEFI en maquinas fisicas y en VirtualBox, VMware y QEMU.
- Inicializacion de framebuffer lineal de alta resolucion mediante GOP (hasta 1920x1080).
- Driver nativo de raton y touchpad PS/2 con decodificacion de paquetes de 3 bytes.
- Cursor por hardware con buffer de rectangulo sucio y repintado selectivo sin parpadeo.
- Shell interactiva `vysh-sh` con historial de comandos y utilidades: `help`, `wifi scan`, `wifi connect`, `wifi status`, `ping`, `ipconfig`, `whoami`, `ls`/`dir`, `time`, `date`, `uname -a` y `clear`.
- Calculadora cientifica de cuatro funciones con botones en pantalla y soporte de teclado numerico fisico.
- Centro de punto de acceso Wi-Fi 802.11 con conexion en un clic (segun la model card; no se detalla la pila de red subyacente).
- Aplicaciones de diagnostico de hardware (CPU y RAM) y de configuracion del sistema.
- Visor de articulos de investigacion sobre planificacion de CPU y arquitectura de microkernel.
- Generacion automatizada de imagenes de disco: particion FAT16 EFI, VDI e ISO hibrida El Torito mediante `cargo run --bin builder` y `build_iso.py`.

## Casos de uso

- Docencia de sistemas operativos: el codigo fuente y los informes academicos adjuntos permiten estudiar paso a paso el arranque UEFI, la transicion a modo grafico y la gestion de interrupciones en un entorno real.
- Practicas de desarrollo bare-metal en Rust: sirve como plantilla para compilar con `no_std`, enlazar contra la ABI EFI y depurar en QEMU o VirtualBox sin hardware dedicado.
- Prototipado de interfaces graficas minimas: el esquema de cursor con rectangulo sucio y el framebuffer GOP son reutilizables en quioscos o paneles informativos de bajo nivel.
- Investigacion sobre planificacion de CPU: los articulos incluidos (estudio empirico en Linux sobre seleccion de politica de planificacion segun la carga) documentan una metodologia replicable con las herramientas del repositorio.
- Laboratorio de drivers: el driver PS/2 sobre el controlador 8042 es un ejemplo compacto para ensenar E/S por puertos y ensamblador en linea.
- Distribucion de demos arrancables: la ISO de 4,48 MB se puede grabar con Rufus o montar en un hipervisor para demostraciones sin instalacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de latencia, throughput ni comparaciones cuantitativas con otros sistemas operativos.

## Requisitos de hardware

- Plataforma x86_64 con firmware UEFI (no se menciona soporte de BIOS legacy ni de ARM).
- Framebuffer compatible con GOP; la resolucion objetivo es 1920x1080, con degradacion al modo soportado mas alto.
- Raton o touchpad PS/2; en VirtualBox debe configurarse `--mouse ps2`.
- Espacio en disco minimo: la ISO ocupa 4,48 MB y la imagen VDI se genera con el binario `builder`.
- No requiere GPU dedicada ni VRAM mas alla del framebuffer del firmware.
- Despliegue: VirtualBox, VMware, QEMU, grabacion con Rufus o arranque en PC UEFI fisico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Lenguaje | Arranque | Interfaz grafica | Licencia | Notas |
|---|---|---|---|---|---|
| Micro-OS (VyshOS) | Rust (`no_std`) | UEFI x86_64 | Si, GOP 1080p | MIT | ISO de 4,48 MB incluida; orientado a docencia |
| Redox OS | Rust | BIOS/UEFI | Si (Orbital) | MIT | Sistema tipo Unix completo con driver stack amplio |
| Theseus OS | Rust | UEFI | Limitada | MIT | Enfocado en estado del sistema y cell-based OS |
| SerenityOS | C++ | BIOS/UEFI | Si | BSD-2-Clause | Proyecto comunitario de gran escala con navegador propio |

No se dispone de datos de rendimiento comparativos entre estos proyectos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; cualquier uso como modelo de IA es inviable.
- Proyecto academico de un unico autor, sin historial de mantenimiento ni versionado publicado; la API interna puede cambiar sin aviso.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion externa.
- La model card afirma funciones de red Wi-Fi (`wifi scan`, `wifi connect`, `ping`) sin detallar la pila de red ni los drivers subyacentes; conviene verificar su funcionamiento real antes de asumirlas.
- Dependencia de UEFI y de PS/2: sin soporte declarado de BIOS legacy, USB HID o arquitecturas distintas de x86_64.
- Interfaz y documentacion solo en ingles; no hay localizacion.
- Riesgo de inestabilidad en hardware fisico no probado, al tratarse de codigo bare-metal sin suite de pruebas publicada.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero sin garantias de ningun tipo.
- Los PDF academicos incluidos contienen datos personales del autor (nombre completo y numero de registro universitario).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vyshnavi511/Micro-OS
- ISO arrancable: https://huggingface.co/vyshnavi511/Micro-OS/blob/main/Micro-OS.iso
- Informe de ingenieria de sistemas Linux (CA-5): https://huggingface.co/vyshnavi511/Micro-OS/blob/main/25BTRCL294_Y_Vyshnavi_Linux.pdf
- Informe de investigacion sobre planificacion de CPU (CA-4): https://huggingface.co/vyshnavi511/Micro-OS/blob/main/25BTRCL294_Y.VYSHNAVI_investigation_report.pdf
- Articulo de investigacion sobre planificacion consciente de la carga: https://huggingface.co/vyshnavi511/Micro-OS/blob/main/25BTRCL294_Y.VYSHNAVI_research_writeup.pdf
- Informe de laboratorio de sistemas operativos: https://huggingface.co/vyshnavi511/Micro-OS/blob/main/25BTRCL294_Y.VYSHNAVI_lab%20report.pdf
