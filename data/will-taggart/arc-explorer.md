# will-taggart/ARC-Explorer

## Resumen

ARC Explorer v0.1 no es un modelo de inteligencia artificial, sino una aplicacion de escritorio nativa para macOS que actua como front end del sistema de computacion de alto rendimiento (HPC) Virginia Tech Advanced Research Computing (ARC). Desarrollada por will-taggart y distribuida con licencia MIT, ofrece un espacio de trabajo unificado para gestionar conexiones SSH, recursos, trabajos Slurm, sesiones interactivas y documentacion de ayuda desde una unica interfaz. El repositorio de Hugging Face tiene un tamano de 0.0 GB y no contiene pesos de modelo: distribuye software de escritorio, tal y como el propio autor indica explicitamente en la model card.

La aplicacion esta construida con frameworks nativos de Apple y utiliza el cliente SSH del sistema, sin requerir una instalacion local de Python ni un navegador externo para el espacio de trabajo nativo. El paquete comprimido ocupa aproximadamente 1.9 MB, esta firmado con Developer ID, notarizado por Apple y stapled, y requiere un Mac con Apple Silicon y macOS 15 o superior. No se incluyen binarios para Intel.

La relevancia de esta ficha es acotada: se trata de una herramienta para desarrolladores e investigadores que trabajan con los clusters TinkerCliffs, Falcon y Owl de Virginia Tech, no de un modelo de lenguaje. La unica funcionalidad relacionada con IA es un asistente LLM opcional alojado en ARC, al que la aplicacion envia unicamente la pregunta escrita y una instruccion general de ayuda a un endpoint HTTPS; no se adjuntan archivos, logs ni credenciales, y las respuestas nunca ejecutan comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; aplicacion nativa macOS con frameworks de Apple y SSH del sistema) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye un ZIP de aplicacion macOS arm64, no pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual de un modelo de IA: no hay transformer, MoE, SSM ni proceso de entrenamiento con tokens, RLHF o DPO. La aplicacion es un cliente de escritorio nativo para macOS construido con frameworks de Apple que integra el cliente SSH del sistema y una biblioteca de terminal (SwiftTerm, cuyo codigo fuente completo y licencia se incluyen vendorizados en el proyecto). El paquete distribuible se firma con hardened runtime, se somete a notarizacion de Apple, se le aplica staple al ticket y se verifica con Gatekeeper antes de empaquetarse en ZIP.

La unica innovacion tecnica destacable documentada es la separacion estricta de responsabilidades en materia de seguridad: el asistente LLM opcional solo envia la pregunta tecleada y una instruccion general de ayuda a un endpoint HTTPS seleccionado, sin adjuntar archivos, logs ni credenciales SSH; las respuestas nunca ejecutan comandos. Ademas, los controles de GitHub y Hugging Face generan scripts de recuperacion revisables que comprueban el origen del checkout y las modificaciones locales, y no ejecutan automaticamente el codigo de setup de un repositorio. Las credenciales nunca se incluyen en el repositorio de codigo fuente.

## Capacidades

- Gestion de conexiones SSH: perfiles guardados para TinkerCliffs, Falcon, Owl y perfiles personalizados, con autenticacion por clave/agente o contrasena mas Duo, prompts nativos y modos claro y oscuro.
- Monitorizacion de recursos: disponibilidad en vivo, informes de asignacion y cuota, contabilidad de trabajos filtrada por fecha, dashboards de ARC, navegador de archivos remoto, subida y descarga, y un editor UTF-8 ligero.
- Gestion de trabajos y software: solicitudes explicitas de GPU, CPU, memoria, tiempo y cuenta; scripts editables; guardado en el Mac o en ARC; envio y monitorizacion en Slurm; logs y cancelacion; scripts de recuperacion desde GitHub y Hugging Face; descubrimiento de modulos.
- Sesiones: terminal interactiva a pantalla completa en el nodo de login, vistas embebidas de Web y Jupyter, marcadores, opcion de navegador del sistema y tuneles SSH loopback hacia servicios existentes en nodos de computo.
- Ayuda: referencia de comandos copiables y asistencia opcional mediante un LLM alojado en ARC, con descubrimiento de modelos en vivo y almacenamiento opcional de la clave API en el llavero de macOS.
- Capacidades multilingues: la interfaz y la documentacion estan en ingles unicamente.
- Capacidades especiales: no incluye vision, audio ni modo de razonamiento propios; el asistente LLM es una funcionalidad externa opcional sujeta a la disponibilidad y permisos de cuenta determinados por ARC.

## Casos de uso

- Gestion de trabajos Slurm desde el escritorio: un investigador configura cuenta permitida, particion de GPU, wall time, numero de GPUs, CPUs y memoria, revisa el script generado y lo envia sin salir de la aplicacion; despues inspecciona logs y cancela trabajos. Es adecuado porque integra solicitud de recursos, envio y monitorizacion en un unico flujo.
- Monitorizacion de cuotas y asignaciones: el usuario consulta informes de asignacion y cuota y contabilidad de trabajos filtrada por fecha antes de lanzar campanas de computo, lo que evita solicitudes rechazadas por falta de asignacion o particion.
- Edicion de archivos remotos pequenos: modificacion de scripts y ficheros de configuracion UTF-8 de hasta 1 MiB con comprobacion de cambios remotos antes de guardar; util para ajustes rapidos sin abrir un editor completo en el cluster.
- Transferencia acotada de datos: subida y descarga de archivos de hasta 8 MiB por fichero para mover scripts, resultados pequenos o configuraciones; no esta pensado como cliente de transferencia masiva.
- Sesiones interactivas y Jupyter: apertura de vistas Web o Jupyter embebidas y creacion de tuneles SSH loopback hacia servicios ya existentes en nodos de computo, lo que permite acceder a dashboards o notebooks sin exponer puertos publicamente.
- Recuperacion controlada de repositorios: generacion de scripts revisables para clonar repositorios de GitHub o Hugging Face con comprobacion de origen y modificaciones locales, sin ejecutar automaticamente el codigo de setup, adecuado para entornos donde la trazabilidad importa.
- Consulta de comandos y ayuda: uso de la referencia copiable de comandos y, opcionalmente, del asistente LLM alojado en ARC para resolver dudas operativas, sabiendo que solo se envia la pregunta tecleada y que las respuestas no ejecutan comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K. La model card menciona un informe tecnico y documentacion de validacion, pero no incluye cifras de rendimiento, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo ni inferencia local.
- GPU recomendadas: no aplica; la aplicacion es un cliente de escritorio. Los trabajos de computo se ejecutan en los recursos asignados en ARC (clusters TinkerCliffs, Falcon y Owl), no en el Mac.
- Compatibilidad con hardware de consumo: requiere un Mac con Apple Silicon y macOS 15 o superior; no se incluyen binarios para Intel.
- Espacio en disco: aproximadamente 1.9 MB comprimido para el paquete de la aplicacion.
- Opciones de despliegue: aplicacion nativa macOS distribuida como ZIP firmado y notarizado; el codigo fuente se compila con `bash build.sh dist/ARC-Explorer.app` y las pruebas se ejecutan con `python3 -m unittest discover -s Tests -p 'test_*.py' -v` y `swift test --build-system native -c release --filter TerminalTests`.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: cuenta de ARC y acceso de red (VPN de VT cuando sea necesario), asignacion Slurm y acceso a particion para los trabajos, Python 3 remoto para el helper de gestion acotado, Git y Git LFS remotos para operaciones de repositorio, y clave API opcional de ARC para la ayuda LLM.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada herramientas comparables de la misma categoria (front ends nativos de macOS para HPC con integracion de Slurm y SSH). La comparacion con modelos de IA no procede porque ARC Explorer no es un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: el repositorio de Hugging Face distribuye software de escritorio, no pesos; no debe evaluarse como modelo de lenguaje.
- El nodo de login no es para trabajos intensivos: el terminal integrado es un shell real de nodo de login y no solicita GPU; el trabajo intensivo debe ejecutarse en recursos de computo asignados. El helper de gestion remoto se ejecuta brevemente en el host de login y la politica del sitio sigue siendo la autoridad.
- Guardar un script nunca lo envia: los ajustes de recursos se configuran por separado del texto guardado del script.
- Cerrar la aplicacion no cancela los trabajos de Slurm; cerrar un tunel SSH no detiene el servicio subyacente ni la asignacion.
- Limites de archivos: el editor admite archivos UTF-8 propios de hasta 1 MiB y comprueba cambios remotos antes de guardar; la subida y descarga esta limitada a 8 MiB por fichero y no es un cliente de transferencia masiva. El editor rechaza enlaces y metadatos no soportados en lugar de descartarlos silenciosamente.
- Repositorios privados: requieren credenciales en ARC; los tokens locales no se copian alli.
- Asistente LLM: solo envia la pregunta tecleada y una instruccion general de ayuda al endpoint HTTPS seleccionado; no adjunta archivos, logs ni credenciales SSH, y las respuestas nunca ejecutan comandos. La disponibilidad del modelo y los permisos de cuenta los determina ARC.
- Idioma: la interfaz y la documentacion estan solo en ingles.
- Plataforma: requiere Apple Silicon y macOS 15 o superior; sin soporte para Intel.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; el codigo de terceros vendorizado (SwiftTerm) tiene su propia licencia recogida en THIRD_PARTY.md.
- Firma: la compilacion ordinaria esta firmada ad hoc para desarrollo; para distribucion hay que usar un certificado Developer ID Application propio y un perfil de notarytool existente.
- Sesgos y alucinacion: no aplica al software; el asistente LLM externo podria producir respuestas incorrectas y no debe usarse como sustituto de la documentacion oficial de ARC.

## Enlaces

- Hugging Face: https://huggingface.co/will-taggart/ARC-Explorer
- Descarga directa (GitHub Releases): https://github.com/FL2744/ARC-Explorer/releases/download/v0.1/ARC-Explorer-v0.1-macOS-arm64.zip
- Mirror en Hugging Face: https://huggingface.co/will-taggart/ARC-Explorer/resolve/main/downloads/ARC-Explorer-v0.1-macOS-arm64.zip?download=true
- Todos los archivos de la release: https://github.com/FL2744/ARC-Explorer/releases/tag/v0.1
- Checksums: https://github.com/FL2744/ARC-Explorer/releases/download/v0.1/SHA256SUMS.txt
- Documentacion de ARC: https://www.docs.arc.vt.edu/
- Guia de uso de ARC sobre uso abusivo: https://www.docs.arc.vt.edu/usage/abuse.html
- Dashboards de ARC: https://dashboard.arc.vt.edu/dashboards?kiosk
