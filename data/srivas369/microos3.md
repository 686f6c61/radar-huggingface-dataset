# Srivas369/microOS3

## Resumen

MicroOS v1.0 no es un modelo de inteligencia artificial, sino un sistema operativo x86_64 de 64 bits, ultraligero y arrancable, publicado en Hugging Face bajo el identificador `Srivas369/microOS3` por el autor Srivas369. El proyecto se presenta como un SO independiente construido desde cero con el objetivo de mantenerse por debajo de un techo estricto de 50 MB por imagen ISO, y distribuye dos ediciones arrancables: una edición de escritorio grafico y una edicion de terminal CLI.

La edicion grafica ocupa 3,63 MB en formato ISO y 5,24 MB en disco virtual VDI de VirtualBox, e incluye un gestor de ventanas nativo, compositor con doble buffer, barra de tareas, menu de inicio, panel de telemetria y gestion de red Wi-Fi 6. La edicion CLI ocupa 12,77 MB e integra un kernel Linux 6.6 LTS, shell BusyBox ash, arquitectura de gestor de paquetes APT compatible con Debian Bookworm glibc y ocho juegos de terminal en C.

Su relevancia es de nicho y muy especifica: resulta de interes para desarrolladores de sistemas operativos (osdev), entusiastas del minimalismo, entornos de arranque en vivo sobre hardware modesto o maquinas virtuales, y como material didactico sobre arranque BIOS/UEFI, gestion de framebuffer y controladores de bajo nivel. No debe confundirse con un modelo de lenguaje: no procesa texto de forma generativa, no tiene pesos neuronales ni ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (sistema operativo x86_64; no es un modelo neuronal). Kernel Linux 6.6 LTS en la edicion CLI; componentes bare-metal y kernel Linux en la edicion grafica |
| Parametros totales | No disponible (no es un modelo de IA) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponibles (interfaz en ingles segun la model card) |
| Licencia | MIT |
| Formato de pesos | No disponible (artefactos distribuidos como ISO y VDI; no hay pesos) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal. La arquitectura del sistema se organiza en capas: un shell de escritorio grafico con barra de tareas, menu de inicio, arrastre de ventanas y sombras; aplicaciones nativas (terminal Bash, ajustes de Wi-Fi, panel del SO, benchmark de arranque, Snake, gestor de archivos, gestor APT, simulador de concurrencia); un gestor de ventanas y compositor con doble buffer, apilamiento Z-order y controles de minimizar/cerrar sobre un framebuffer lineal de 800x600 a 32 bpp TrueColor con rasterizador software; controladores de kernel y hardware (doble raton PS/2 con interrupciones STI en puertos 0x64/0x60, decodificador de scancodes PS/2 set 1 para teclado US de 104 teclas, escaner de bus PCI, controlador AHCI SATA sobre /dev/sda, graficos VBox SVGA y controlador Realtek RTL8852BE Wi-Fi 6); y una capa de arranque basada en firmware BIOS/UEFI, GRUB 2 y kernel Linux o bare-metal.

El repositorio incluye directorios de configuracion y scripts de construccion (`boot/` para GRUB 2 BIOS y UEFI, `kernel/` para configuracion y build del kernel Linux 6.6 LTS, y `rootfs/` para el overlay de BusyBox). No se documentan datos de entrenamiento, datasets, RLHF ni DPO, ya que no aplican. La innovacion tecnica destacable es la disciplina de tamano: ambas imagenes quedan muy por debajo del limite de 50 MB declarado, con la edicion grafica en 3,63 MB y la CLI en 12,77 MB.

## Capacidades

- Arranque en vivo desde ISO en firmware BIOS/UEFI mediante GRUB 2, y arranque desde disco virtual VDI en VirtualBox.
- Entorno grafico nativo sin navegador ni Electron: gestor de ventanas con arrastre flotante, apilamiento Z-order, titulos activos y controles de minimizar y cerrar.
- Barra de tareas multitarea con menu de inicio, reloj y puntero de raton.
- Terminal Bash con prompt `srivas@microos:~$` e identidad de usuario dinamica (`whoami` devuelve `srivas`).
- Suite de comandos: `whoami`, `user`, `id`, `uname -a`, `hostname`, `pwd`, `cd`, `ls -la`, `cat`, `date`, `uptime`, `free`, `df`, `ps`, `top`, `sysinfo`, `hardware`, `disks`, `wifi`, `ping`, `apt`, `neofetch`, `clear`, `help`, `history`.
- Deteccion de hardware Wi-Fi 6 del host (Realtek RTL8852BE) y de SSIDs del entorno con gestion interactiva de conexion.
- Doble control de entrada: raton PS/2 con interrupciones en puerto auxiliar y navegacion completa por teclado.
- Ocho juegos de arcade en C para terminal: `snake`, `tetris`, `pong`, `mines`, `2048`, `guess`, `tictactoe`, `spaceinvaders`.
- Arquitectura APT compatible con Debian Bookworm glibc sobre almacenamiento persistente.
- Panel de telemetria en tiempo real, descubrimiento de hardware y benchmark de arranque.
- No dispone de generacion de texto, razonamiento, codigo generativo, matematicas, vision, tool calling, function calling ni capacidades de agentes.

## Casos de uso

- Arranque en vivo en hardware modesto o maquinas virtuales: la ISO grafica de 3,63 MB se puede escribir en un USB pequeno o montar en VirtualBox y arrancar en segundos, lo que la hace adecuada para pruebas rapidas de hardware sin instalacion.
- Formacion en desarrollo de sistemas operativos: el repositorio separa `boot/`, `kernel/` y `rootfs/`, de modo que estudiantes pueden estudiar la configuracion de GRUB 2, el arranque BIOS/UEFI y la construccion de un kernel Linux 6.6 LTS reducido.
- Practica de controladores de bajo nivel: el codigo de raton PS/2 con interrupciones STI en los puertos 0x64/0x60 y el decodificador de scancodes set 1 sirven como referencia concreta para implementar entrada en modo protegido.
- Desarrollo de interfaces graficas sin compositor externo: el rasterizador software sobre framebuffer lineal de 800x600 a 32 bpp y el compositor con doble buffer son un caso de estudio para construir un gestor de ventanas minimo sin dependencias de Electron ni navegador.
- Entorno de recuperacion o diagnostico de red: la deteccion de Wi-Fi 6 con gestion interactiva de SSIDs y los comandos `ping`, `wifi`, `hardware`, `disks` y `sysinfo` permiten inspeccionar conectividad y hardware desde una imagen de arranque de pocos megabytes.
- Simulacion y pruebas de concurrencia: el simulador de concurrencia y el benchmark de arranque incluidos en el escritorio permiten observar comportamiento de multitarea en un entorno controlado y reproducible en VirtualBox.
- Distribucion de software ligero con APT: la arquitectura APT compatible con Debian Bookworm glibc sobre almacenamiento persistente facilita instalar paquetes en un sistema minimo, util para crear imagenes de appliance o entornos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara tamanos de artefacto (ISO grafica de 3.638.272 bytes, VDI de 5.242.880 bytes, ISO CLI de 12.769.280 bytes) y el cumplimiento del limite de 50.000.000 bytes, sin metricas de latencia, throughput ni comparaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el framebuffer grafico es de 800x600 a 32 bpp, aproximadamente 1,92 MB por buffer, y el compositor usa doble buffer (unos 3,84 MB en total).
- GPU recomendadas: no se requiere GPU; la edicion grafica usa el adaptador VBox SVGA en VirtualBox y renderizado software.
- Cabe en hardware consumer: si, con margen amplio; el disco de la edicion grafica ocupa 5,24 MB y la CLI 12,77 MB, y el kernel es Linux 6.6 LTS con BusyBox.
- Opciones de despliegue: Oracle VirtualBox con el VDI incluido o arranque desde ISO en BIOS/UEFI mediante GRUB 2; no se documentan soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un sistema operativo.
- Latencia y throughput: no disponible; solo se menciona un benchmark de arranque como aplicacion del escritorio, sin cifras publicadas.

## Comparativa con modelos similares

| Sistema | Tipo | Tamano de imagen | Kernel / base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MicroOS v1.0 (GUI) | SO x86_64 con escritorio propio | 3,63 MB ISO / 5,24 MB VDI | Linux 6.6 LTS y componentes bare-metal | MIT | Hugging Face (`Srivas369/microOS3`) |
| MicroOS v1.0 (CLI) | SO x86_64 de terminal | 12,77 MB ISO | Linux 6.6 LTS + BusyBox ash + APT Debian Bookworm | MIT | Hugging Face (`Srivas369/microOS3`) |
| Tiny Core Linux | Distribucion Linux minima | No disponible en la informacion | Kernel Linux + BusyBox | No disponible en la informacion | Distribucion publica |
| Alpine Linux | Distribucion Linux ligera | No disponible en la informacion | Kernel Linux + musl + BusyBox | No disponible en la informacion | Distribucion publica |

La comparacion con Tiny Core Linux y Alpine Linux se ofrece a titulo orientativo de categoria (distribuciones minimas); no se dispone de datos de rendimiento ni de tamanos verificados en la informacion proporcionada para establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa imagenes; cualquier evaluacion como modelo de lenguaje carece de sentido.
- La model card esta redactada integramente en ingles y no declara idiomas de interfaz distintos del ingles (teclado US de 104 teclas).
- El soporte de hardware esta acotado a lo documentado: raton y teclado PS/2, bus PCI, AHCI SATA, graficos VBox SVGA y Wi-Fi Realtek RTL8852BE; otros adaptadores de red o graficos pueden no funcionar.
- La deteccion de Wi-Fi se describe sobre el hardware del host en VirtualBox; el comportamiento en hardware fisico distinto no esta verificado en la informacion disponible.
- Riesgo de inestabilidad propio de un proyecto de sistemas operativos con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar el codigo y los artefactos antes de desplegarlos en entornos reales.
- El limite de 50 MB y los tamanos declarados son cifras del autor; no se han verificado de forma independiente en la informacion proporcionada.
- No se documentan politicas de sesgo, alucinacion ni seguridad, ya que no aplican a un sistema operativo; si aplican consideraciones de seguridad de arranque y de integridad de las imagenes descargadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srivas369/microOS3
- ISO de la edicion grafica: https://huggingface.co/Srivas369/microOS3/resolve/main/release/microos-gui.iso
- Disco virtual VDI para VirtualBox: https://huggingface.co/Srivas369/microOS3/resolve/main/release/microos-gui.vdi
- ISO de la edicion CLI: https://huggingface.co/Srivas369/microOS3/resolve/main/release/microos.iso
