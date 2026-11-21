# TechnoBaptist/cactus

## Resumen

TechnoBaptist/cactus es un repositorio de Hugging Face que, a pesar de su identificador, no contiene pesos de un modelo de lenguaje, sino binarios precompilados del runtime Cactus Compute en su version 4.0.0. El runtime es un motor de inferencia unico que ejecuta localmente tareas de generacion de texto, reconocimiento automatico del habla (ASR) y comprension de imagen-texto, cargando los pesos de los modelos Needle 3, Whistle y Mirage, que residen en repositorios separados.

El paquete se distribuye con licencia Apache 2.0 y un tamano de repositorio de 0,4 GB, e incluye 17 carpetas de destino que cubren macOS Apple Silicon, Linux (x86-64, ARM64, ARMv7, RISC-V, MIPS32el), Windows (x64 y ARM64), Android (ARM64, ARMv7, RISC-V), iOS, tvOS, watchOS, navegador/Node.js (WASM) y WASI Preview 2. Cada destino incluye un ejecutable nativo o biblioteca estatica junto con la cabecera `cactus.h` para integracion en C y C++.

La relevancia de este repositorio es que permite desplegar inferencia multimodal en dispositivos de consumo y entornos embebidos sin depender de la nube, con artefactos verificables mediante checksums SHA-256 y una API Python (`cactus-compute`) que descarga automaticamente el motor y los pesos correspondientes en el primer uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia (motor Cactus Compute 4.0.0); no es un modelo con arquitectura propia |
| Parametros totales | no disponible (los pesos viven en repositorios separados: Needle 3, Whistle, Mirage) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el runtime carga pesos en formato `.cact`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (pesos nativos cargados por el runner en tiempo de ejecucion); binarios nativos, `.a`, `.h`, `.wasm`, `.component.wasm`, `.wit` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino el motor de inferencia Cactus Compute en su release 4.0.0. El motor es un runtime unificado que soporta tres modalidades (texto, voz e imagen) con un unico engine, y distribuye binarios nativos para 17 plataformas, ademas de bibliotecas estaticas (`libcactus.a`) y la cabecera `cactus.h` para aplicaciones en C y C++. Los pesos se cargan en tiempo de ejecucion desde ficheros `.cact`, y el paquete Python (`cactus-compute`) descarga el motor y los pesos correspondientes en el primer uso.

Los pesos de los modelos no estan incluidos en este repositorio: Needle 3 (texto), Whistle (ASR) y Mirage (imagen-texto) se alojan en repositorios independientes. El release incluye un manifiesto con checksums SHA-256 para descargas reproducibles (revision `1a028f5a3972b67dd8d8752f882113d475e7ec4c` o tag `v4.0.0`). El componente WASI exporta `cactus:runtime/engine@4.0.0` y tambien se publica como artefacto OCI firmado en `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0`. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO), ya que esta informacion corresponderia a los modelos y no al runtime.

## Capacidades

- Generacion de texto mediante el modelo Needle 3, cargado por el runtime.
- Reconocimiento automatico del habla (ASR) mediante el modelo Whistle.
- Comprension de imagen-texto mediante el modelo Mirage.
- Ejecucion local y offline de las tres modalidades con un unico motor.
- Integracion nativa en C y C++ mediante `libcactus.a` y `cactus.h`.
- Ejecucion en navegador y Node.js mediante WebAssembly (`cactus.js`, `cactus.wasm`).
- Soporte de WASI Preview 2 mediante componente WASM (`cactus.component.wasm`, `cactus.wit`).
- API Python a traves del paquete `cactus-compute` instalable desde PyPI.
- Descarga de runners nativos con modelo incluido mediante el comando `cactus download <plataforma> --model <needle3|whistle|mirage>`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, modo thinking ni soporte multilingue explicito.

## Casos de uso

- Inferencia de texto en dispositivos de consumo: el runtime carga los pesos de Needle 3 en formato `.cact` y ejecuta generacion de texto localmente en macOS Apple Silicon, Windows o Linux sin conexion a la nube, lo que encaja en aplicaciones de escritorio con requisitos de privacidad.
- Transcripcion de audio en movil: mediante el runner de Android ARM64 o iOS ARM64 y los pesos de Whistle, se puede transcribir audio en el propio dispositivo usando el comando `cactus --model whistle.cact --audio clip.wav`, sin enviar grabaciones a servidores externos.
- Descripcion de imagenes en el navegador: el destino WASM (`cactus.js` y `cactus.wasm`) permite ejecutar el modelo Mirage de imagen-texto dentro de una pagina web o en Node.js, util para accesibilidad o etiquetado de imagenes en cliente.
- Integracion en aplicaciones C/C++ embebidas: la biblioteca estatica `libcactus.a` y la cabecera `cactus.h` permiten enlazar el motor en firmware o aplicaciones nativas sobre Linux ARMv7, RISC-V o MIPS32el, orientado a dispositivos con recursos limitados.
- Despliegue en wearables y TV: los destinos watchOS ARM64, tvOS ARM64 e iOS Simulator ARM64 permiten incorporar inferencia local en aplicaciones de reloj, television y pruebas en simulador.
- Procesamiento por componentes WASI: el componente `cactus.component.wasm` con interfaz `cactus:runtime/engine@4.0.0` permite integrar el motor en entornos serverless o runtimes WASI Preview 2 con aislamiento y portabilidad.
- Automatizacion reproducible en CI: el manifiesto con checksums SHA-256 y la revision fijada permiten descargar artefactos verificables en pipelines de integracion continua para pruebas de regresion del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de los pesos de Needle 3, Whistle o Mirage, no incluidos en este repositorio).
- GPU recomendadas: no disponible; el runtime esta orientado a ejecucion en CPU y dispositivos de consumo, con destinos para Apple Silicon, x86-64, ARM64, ARMv7, RISC-V, MIPS32el y WASM.
- Compatibilidad con GPU de consumo: no se documenta soporte de CUDA ni de aceleracion GPU en la informacion disponible.
- Plataformas de despliegue soportadas: macOS Apple Silicon, Linux x86-64, Linux ARM64, Linux ARMv7, Linux RISC-V, Linux MIPS32el, Windows x64, Windows ARM64, Android ARM64, Android ARMv7, Android RISC-V, iOS ARM64, iOS Simulator ARM64, tvOS ARM64, watchOS ARM64, navegador/Node.js (WASM) y WASI Preview 2.
- Opciones de despliegue: ejecutable nativo `cactus`, biblioteca estatica `libcactus.a` con `cactus.h`, paquete Python `cactus-compute` desde PyPI, modulo WASM para navegador y Node.js, y componente WASI publicado como artefacto OCI en `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Criterio | TechnoBaptist/cactus (runtime Cactus 4.0.0) | llama.cpp | ONNX Runtime | Ollama |
|---|---|---|---|---|
| Tipo | Runtime de inferencia multimodal (texto, ASR, imagen-texto) | Runtime de inferencia de LLM | Runtime de inferencia general | Gestor y runtime de LLM |
| Formatos de pesos | `.cact` | GGUF | ONNX | GGUF |
| Plataformas | 17 destinos, incluidos iOS, watchOS, tvOS, Android, WASM y WASI | Multiples plataformas de escritorio y servidor | Multiples plataformas | Escritorio y servidor |
| Soporte de audio y vision | Si (Whistle y Mirage) | Vision en algunos modelos; audio limitado | Si, segun modelo | Vision en algunos modelos |
| Licencia | Apache 2.0 | MIT | MIT | MIT |
| Parametros y contexto | no disponible | no aplica (depende del modelo) | no aplica (depende del modelo) | no aplica (depende del modelo) |
| Rendimiento | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: para generar texto, transcribir audio o procesar imagenes es necesario descargar Needle 3, Whistle o Mirage desde sus repositorios respectivos.
- El identificador del repositorio (`TechnoBaptist/cactus`) no coincide con la organizacion oficial `Cactus-Compute`, por lo que conviene verificar la procedencia y los checksums antes de usarlo en produccion.
- El repositorio figura con 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- No se dispone de datos de benchmarks, latencia ni throughput que permitan estimar el rendimiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los pesos de Needle 3, Whistle y Mirage deben verificarse en sus propios repositorios.
- La integracion mediante `libcactus.a` requiere compilar y enlazar codigo nativo; no es un reemplazo directo de APIs de servidores de inferencia convencionales.
- El soporte de aceleracion por GPU no esta documentado; el rendimiento dependera de la CPU y la plataforma de destino.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TechnoBaptist/cactus
- Repositorio oficial del runtime: https://huggingface.co/Cactus-Compute/cactus
- Pesos de Needle 3: https://huggingface.co/Cactus-Compute/needle3
- Pesos de Whistle: https://huggingface.co/Cactus-Compute/whistle
- Pesos de Mirage: https://huggingface.co/Cactus-Compute/mirage
- Codigo fuente: https://github.com/cactus-compute/cactus
- Pagina de Needle: https://cactuscompute.com/needle
- Blog de Whistle: https://cactuscompute.com/blog/whistle
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Guia de despliegue: https://cactuscompute.com/blog/needle-supported-devices
- Manifiesto de release 4.0.0: https://huggingface.co/Cactus-Compute/cactus/blob/1a028f5a3972b67dd8d8752f882113d475e7ec4c/releases/4.0.0/manifest.json
- Artefacto OCI del componente WASI: ghcr.io/cactus-compute/cactus-runtime-component:4.0.0
