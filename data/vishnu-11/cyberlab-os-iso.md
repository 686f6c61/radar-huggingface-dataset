# vishnu-11/CyberLab-OS-ISO

## Resumen

CyberLab-OS-ISO no es un modelo de inteligencia artificial, sino una imagen ISO arrancable de una distribucion Linux de escritorio en vivo de 32 bits, publicada en Hugging Face bajo el identificador `vishnu-11/CyberLab-OS-ISO`. El artefacto lo firma Vishnu C, estudiante de tercer semestre de B.Tech en IA y ML en JAIN (Deemed-to-be University), como entrega de la asignatura 25PCCS201 de Sistemas Operativos. El repositorio pesa 0,2 GB y contiene un unico binario, `cyberlab-os.iso`, de aproximadamente 182 MB.

El sistema esta construido sobre SliTaz con entorno grafico Openbox y X11, arranca con auto-login del usuario `tux` y contrasena de root `root`. Incluye un terminal Sakura que se abre centrado, una suite de escaneo Wi-Fi en `/usr/bin/wifi`, un icono de escritorio "Wi-Fi Center", TazPanel como gestor de paquetes y un motor de benchmarks de planificacion de CPU llamado `cyberlab-research` que compara FCFS, SJF y Round Robin sobre 50 ensayos estocasticos emparejados.

Su relevancia es exclusivamente academica y docente: sirve como material reproducible para practicas de ingenieria de sistemas operativos y como ejemplo de empaquetado de una Live ISO. No contiene pesos, tokenizador, configuracion de transformer ni pipeline de inferencia, por lo que las secciones habituales de esta ficha (parametros, contexto, cuantizacion, benchmarks de lenguaje) no son aplicables y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Distribucion Linux Live de 32 bits (x86) sobre SliTaz con Openbox/X11; no es un modelo neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Imagen ISO arrancable (`cyberlab-os.iso`, ~182 MB) |
| Tamano del repositorio | 0,2 GB |
| Version de kernel | no disponible |
| Entorno de escritorio | SliTaz / Openbox X11 |
| Usuario por defecto | `tux` (auto-login) |
| Contrasena de root | `root` |
| Gestor de paquetes | TazPanel (descrito en la model card como "Snap Store") |
| Hipervisor documentado | Oracle VirtualBox (tipo Linux, version "Other Linux (32-bit)") |
| RAM recomendada | 2048 MB (o 4096 MB) |
| vCPU recomendadas | 2 |
| VRAM de video | 128 MB, controlador VBoxSVGA |
| Red | Adaptador puente sobre NIC inalambrica fisica (p. ej. Realtek 8852BE) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una imagen de sistema operativo generada mediante el sistema de construccion de SliTaz, con un escritorio Openbox y un conjunto de scripts y utilidades anadidos por el autor. La model card documenta los componentes anadidos: el terminal Sakura con arranque centrado, la suite `/usr/bin/wifi` para telemetria de la NIC Realtek 8852BE (canal 149 en 5 GHz, 1201 Mbps, WPA3-Personal) y escaneo de puntos de acceso cercanos, el icono "Wi-Fi Center", y el motor `cyberlab-research` para benchmarks de planificacion de CPU.

La innovacion tecnica declarada es ese motor de investigacion: ejecuta FCFS, SJF y Round Robin sobre 50 ensayos estocasticos emparejados para medir el compromiso entre equidad y throughput en la planificacion de CPU. El resto de la pila es software de distribucion estandar (kernel Linux, X11, TazPanel, `ping` nativo sobre interfaz puenteada). No se documentan datos de entrenamiento, dataset, RLHF, DPO ni tecnicas de decodificacion, porque no existen en este contexto.

## Capacidades

- Arranque en vivo desde ISO sin instalacion en disco, en maquina virtual o en hardware de 32 bits.
- Escritorio grafico X11 con Openbox y terminal Sakura abierto automaticamente y centrado.
- Shell con privilegios de usuario (`tux`) y de root (contrasena `root`).
- Suite de diagnostico Wi-Fi: telemetria de la NIC Realtek 8852BE y escaneo de puntos de acceso cercanos.
- Ventana dedicada "Wi-Fi Center" accesible desde el escritorio.
- Conectividad IP verificada mediante `ping` ICMP con 0 % de perdida de paquetes sobre interfaz puenteada.
- Gestion de paquetes mediante TazPanel.
- Motor de benchmarks de planificacion de CPU (`cyberlab-research`) con FCFS, SJF y Round Robin sobre 50 ensayos emparejados.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Docencia de sistemas operativos: reparto de la ISO a los alumnos para que experimenten con planificacion de CPU usando `cyberlab-research` y comparen equidad frente a throughput en FCFS, SJF y Round Robin con datos reproducibles.
- Practicas de redes inalambricas: el alumnado puede lanzar `/usr/bin/wifi` para inspeccionar la telemetria de la NIC y el entorno de puntos de acceso, y contrastar los resultados con `ping` sobre red puenteada.
- Laboratorio de virtualizacion: sirve como imagen de referencia para practicar la creacion de maquinas VirtualBox con tipo "Other Linux (32-bit)", 2 vCPU, 2-4 GB de RAM y VBoxSVGA, documentando cada parametro.
- Entorno de recuperacion o kiosco ligero: al ocupar ~182 MB y arrancar en vivo, es util para equipos antiguos de 32 bits o para sesiones de diagnostico sin tocar el disco.
- Demostracion de empaquetado de distribuciones: el repositorio de GitHub asociado permite estudiar como se compone una Live ISO de SliTaz con scripts propios y un escritorio preconfigurado.
- Reproducibilidad academica: al publicarse la ISO junto al codigo fuente en GitHub, otro investigador puede reconstruir el entorno y repetir los 50 ensayos estocasticos del motor de benchmarks.
- Formacion en seguridad ofensiva basica: el nombre y la inclusion de herramientas de red lo hacen util como banco de pruebas aislado, siempre que se ejecute en red segmentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje en la informacion disponible. El unico benchmark descrito es interno al sistema operativo: el motor `cyberlab-research` ejecuta FCFS, SJF y Round Robin sobre 50 ensayos estocasticos emparejados para medir equidad frente a throughput, pero la model card no incluye cifras de resultados.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K y similares | no disponible (no aplica) |
| Planificacion de CPU (FCFS, SJF, Round Robin, 50 ensayos) | no disponible (el motor existe, pero no se publican cifras) |
| Conectividad ICMP (`ping`) | 0 % de perdida de paquetes declarada por el autor |
| Enlace Wi-Fi medido | 1201 Mbps, canal 149 en 5 GHz, WPA3-Personal (telemetria de la NIC, no benchmark) |

## Requisitos de hardware

- RAM: 2048 MB como minimo segun la model card, con 4096 MB recomendados.
- CPU: 2 vCPU asignadas en VirtualBox; al ser una distribucion de 32 bits, funciona en hardware x86 antiguo.
- VRAM de video: 128 MB con controlador VBoxSVGA.
- Almacenamiento: la ISO ocupa ~182 MB; no requiere instalacion en disco para el modo live.
- Red: adaptador puente sobre la NIC inalambrica fisica (el autor cita Realtek 8852BE Wireless LAN WiFi 6 PCI-E) para que funcionen la suite Wi-Fi y el `ping` ICMP.
- Cabe en cualquier PC convencional y en maquinas virtuales ligeras; no requiere GPU dedicada ni aceleracion de inferencia.
- Despliegue: Oracle VirtualBox es el hipervisor documentado; no se mencionan QEMU, VMware, Proxmox ni arranque en hardware real, aunque al ser una ISO estandar de SliTaz deberia poder arrancarse desde USB o CD.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La categoria correcta no es la de modelos de lenguaje, sino la de distribuciones Linux live ligeras orientadas a docencia o recuperacion. La informacion proporcionada no incluye comparaciones directas del autor, por lo que los datos de las alternativas se marcan como no disponibles salvo la licencia y el enfoque general.

| Proyecto | Tipo | Tamano tipico | Escritorio | Licencia | Enfoque |
|---|---|---|---|---|---|
| CyberLab-OS-ISO | Live ISO 32 bits sobre SliTaz | ~182 MB | Openbox/X11 | MIT | Docencia de SO y benchmarks de planificacion |
| SliTaz GNU/Linux | Live ISO base | no disponible | Openbox/JWM | no disponible | Distribucion ultraligera |
| Tiny Core Linux | Live ISO base | no disponible | Varios (minimo) | no disponible | Minimo funcional, modular |
| Puppy Linux | Live ISO base | no disponible | Varios | no disponible | Facilidad de uso en hardware antiguo |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa imagenes. Cualquier expectativa en ese sentido es un error de categoria.
- Seguridad por defecto debil: root con contrasena `root` y auto-login del usuario `tux`; no debe exponerse a redes no confiables ni usarse como estacion de trabajo real.
- Arquitectura de 32 bits: limita el uso de memoria y descarta software moderno que solo se distribuye para x86_64.
- La model card describe TazPanel como "Snap Store", lo que es inexacto: TazPanel es el panel de gestion de SliTaz y no tiene relacion con Snap.
- Trazabilidad de las cifras Wi-Fi: los datos de la NIC (Vishnu's iPhone, canal 149, 1201 Mbps, WPA3) son telemetria del entorno del autor en un momento concreto y no se reproducen necesariamente en otro hardware.
- Sin resultados publicados del motor `cyberlab-research`: no se pueden validar las conclusiones sobre equidad y throughput sin ejecutarlo.
- Proyecto academico con 0 descargas y 0 likes en el momento de la consulta: sin comunidad, sin mantenimiento documentado y sin historial de issues.
- Sin datos de idiomas soportados en la interfaz ni de localizacion.
- La licencia MIT cubre el repositorio, pero la ISO incorpora software de terceros de SliTaz y otros proyectos cuyas licencias deben verificarse por separado antes de un uso comercial.
- Fecha de creacion registrada como 2026-11-23, posterior a la fecha habitual de consulta: conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vishnu-11/CyberLab-OS-ISO
- Codigo fuente en GitHub: https://github.com/vc544086-prog/CyberLab-OS
- SliTaz GNU/Linux (distribucion base): no disponible en la informacion proporcionada
- Oracle VirtualBox (hipervisor documentado): no disponible en la informacion proporcionada
