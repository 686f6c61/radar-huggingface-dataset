# wenzhouwu/YoungAi-DeepSeek-V4.1-Flash

## Resumen

YoungAi-DeepSeek-V4.1-Flash es una distribucion cuantizada del modelo DeepSeek V4.1 Flash publicada por el usuario wenzhouwu dentro del proyecto YoungAi, un asistente personal que se ejecuta integramente en la maquina del usuario, sin enviar datos a la nube. El checkpoint oficial de DeepSeek V4.1 Flash ocupa unos 510 GB, mientras que esta version lo comprime a 113,6 GB en formato GGUF mediante cuantizacion vectorial, de modo que cabe en una unica estacion de trabajo con memoria unificada de 128 GB, en concreto una NVIDIA DGX Spark (GB10).

El modelo base es un Mixture-of-Experts de 552 mil millones de parametros totales y 8 mil millones de parametros activos por token, con una ventana de contexto de 1.000.000 de tokens y soporte multimodal nativo segun la ficha de NVIDIA NIM. La distribucion de YoungAi conserva esa ventana de contexto y anade una cadena de herramientas de agente (memoria persistente, ejecucion en sandbox, busqueda web, generacion de documentos ofimaticos, sintesis de video y notificaciones al telefono) junto con dos artefactos auxiliares: un sidecar de dominio de unos 40 MB y un archivo de post-entrenamiento que, segun el autor, se recalcula cada noche.

Es relevante ahora porque demuestra que un MoE de mas de 500.000 millones de parametros puede reducirse a poco mas de 110 GB y operarse en local con licencia MIT, algo que hasta hace poco requeria un cluster de GPUs. Su publicacion es reciente (24 de septiembre de 2026, actualizada el 14 de octubre de 2026) y tiene una traccion todavia muy baja: 54 descargas y 10 likes, sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, modelo base DeepSeek V4.1 Flash |
| Parametros totales | 552 mil millones en el modelo base segun NVIDIA NIM; el campo de metadatos safetensors del repo indica 485.283.840, cifra que no se corresponde con el tamano real del repositorio (115,2 GB) y que probablemente refleja solo un componente |
| Parametros activos | 8 mil millones por token |
| Longitud de contexto | 1.000.000 de tokens (1M) |
| Tipos de cuantizacion | GGUF con cuantizacion vectorial y q4k (nombre de archivo `vq8sh14-q4k-mtpnative`), con MTP nativo; pesos resultantes de 113,6 GB frente a los 510 GB del checkpoint oficial |
| Idiomas soportados | Ingles y chino (en, zh); el reconocimiento de voz integrado solo admite chino |
| Licencia | MIT |
| Formato de pesos | GGUF repartido en 40 fragmentos de 2,84 GB, mas un sidecar de dominio de ~40 MB y un archivo de post-entrenamiento |
| Tamano del repositorio | 115,2 GB |
| Fecha de creacion / actualizacion | 24 de septiembre de 2026 / 14 de octubre de 2026 |
| Descargas y likes | 54 descargas, 10 likes |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas Mixture-of-Experts: 552.000 millones de parametros almacenados, de los que solo 8.000 millones se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. El modelo base incorpora soporte multimodal nativo y una cache KV reducida segun la documentacion de NVIDIA NIM. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en DeepSeek V4.1 Flash ni en esta distribucion.

Lo especifico de esta publicacion no es el entrenamiento sino la cadena de compresion y despliegue. El autor aplica cuantizacion vectorial sobre los pesos y los empaqueta en GGUF, y los ejecuta con ds4, un motor de inferencia escrito en C99 mas CUDA (Metal en Apple Silicon) que se compila con un unico Makefile y no enlaza bibliotecas de terceros. Alrededor del motor hay una toolchain offline que incluye un codificador H.264/AAC propio para generar video, generacion de docx, pdf, pptx y xlsx sin depender de Microsoft Office, y un reconocedor de voz basado en moonshine-tiny-zh (27 M de parametros, 108 MB) reimplementado con kernels propios de C y GPU, sin Python ni ONNX. Ademas se menciona un proceso de post-entrenamiento que regenera un archivo cada noche y un sidecar de dominio de unos 40 MB, orientado a un caso de uso financiero.

## Capacidades

- Generacion de texto y razonamiento general, con contexto de hasta 1.000.000 de tokens.
- Uso de herramientas (tool calling) sobre un conjunto fijo y documentado de funciones, sin prompts especificos por escenario.
- Memoria persistente mediante las herramientas `remember` y `forget`, almacenada en texto plano bajo `~/.ds4/assistant/memory/`.
- Gestion de archivos: lectura, listado, busqueda, escritura y edicion dentro de un espacio de trabajo, con confirmacion del usuario si se accede a rutas externas.
- Ejecucion de programas en un sandbox del kernel sin red y con escritura limitada al espacio de trabajo (`run`), usando soffice, pandoc o python3 si estan instalados.
- Busqueda web y lectura de paginas mediante Firefox en modo headless (`web_search`, `visit_page`).
- Generacion de documentos ofimaticos: Markdown a docx, pdf y pptx, y JSON a xlsx con formulas calculadas.
- Creacion de video: el modelo escribe una animacion HTML y el sistema la renderiza y codifica en mp4 con narracion opcional.
- Geolocalizacion y busqueda de lugares cercanos (`locate`, `nearby`), con resultados reales si se dispone de clave de AMap.
- Integracion con el dispositivo movil: compartir, copiar texto, navegar, llamar, abrir URL y abrir aplicaciones (Douyin, WeChat, DingTalk, Alipay, Meituan, Ele.me).
- Tareas con seguimiento autonomo: el modelo decide cuando volver a comprobar el estado de un trabajo (`task_check_in`, `task_done`) y envia notificaciones push.
- Sistema de habilidades extensible mediante carpetas con un archivo `SKILL.md` en formato Agent Skills, sin scripts.
- Herramientas de telefono en la nube (`phone_*`) solo en modo de riesgo.
- Entrada de voz mediante pulsar y hablar, con reconocimiento ejecutado en la GPU local; limite de 30 segundos y cancelacion deslizando hacia arriba. Solo chino.
- Capacidades multilingues limitadas a ingles y chino.
- Segun la ficha de NVIDIA NIM, el modelo base dispone de soporte multimodal nativo, aunque este paquete cuantizado no documenta el uso de vision.

## Casos de uso

- Asistente personal en local: el modelo gestiona conversaciones multi-turno con memoria persistente en texto plano y contexto de 1M de tokens, de modo que recuerda preferencias del usuario (por ejemplo, su ciudad de residencia) y las aplica a planes posteriores sin enviar datos fuera del equipo.
- Agente de investigacion web end-to-end: con `web_search` y `visit_page`, el modelo busca, lee fuentes y redacta un informe en docx. El propio autor documenta una ejecucion real que localizo la DGX Spark mas barata en 16 minutos, 12 rondas y 43 llamadas a herramientas.
- Automatizacion documental en empresa: conversion de Markdown a docx, pdf y pptx y de JSON a xlsx con formulas ya calculadas, sin necesidad de tener Office instalado, lo que simplifica despliegues en servidores o entornos restringidos.
- Analisis de datos tabulares: lectura de CSV y generacion de un xlsx con formulas a partir de una instruccion en lenguaje natural, util para informes periodicos que deban consultarse desde el movil.
- Generacion de video corto de producto: el modelo escribe la animacion HTML y el codificador H.264/AAC propio produce un mp4 con narracion reproducible en cualquier telefono, sin herramientas externas de edicion.
- Vigilancia de precios y alertas: creacion de una tarea que decide por si misma cuando volver a comprobar y que notifica al usuario por Web Push cuando se cumple la condicion.
- Asistente movil manos libres: entrada de voz pulsar y hablar con transcripcion en la GPU local (51 ms para una locucion de 3,4 segundos en la DGX Spark) y posterior ejecucion de acciones sobre aplicaciones instaladas en el telefono.
- Despliegue como base para ajuste fino: al estar publicado en GGUF con licencia MIT y separar base, sidecar de dominio y archivo de post-entrenamiento, sirve como punto de partida para adaptaciones verticales por sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones para DeepSeek V4.1 Flash ni para esta cuantizacion. Los unicos datos de rendimiento documentados son operativos:

| Metrica | Valor |
|---|---|
| Transcripcion de una locucion de 3,4 s (moonshine-tiny-zh, DGX Spark) | 51 ms |
| Tarea de agente "buscar la DGX Spark mas barata" | 16 minutos, 12 rondas, 43 llamadas a herramientas |
| Tasa de error de caracteres del ASR en conjuntos dificiles | 29-36 % segun el articulo del modelo de voz |
| Tokens por segundo en inferencia del LLM | no disponible |

## Requisitos de hardware

- Memoria: el paquete de pesos ocupa 113,6 GB, por lo que requiere un sistema con al menos 128 GB de memoria unificada o agregada. El escenario de referencia es una unica NVIDIA DGX Spark (GB10, 128 GB de memoria unificada).
- GPU recomendadas: NVIDIA DGX Spark GB10 como plataforma objetivo documentada; tambien hay soporte CUDA en la toolchain (binarios aarch64 CUDA) y soporte Metal para Apple Silicon.
- Apple Silicon: el proyecto incluye kernels Metal y las pruebas de transcripcion se han realizado en un Mac, aunque no se detalla si los 113,6 GB de pesos del LLM caben y funcionan en equipos de consumo con memoria unificada.
- GPU de consumo: no es viable en tarjetas con 24 GB o 48 GB de VRAM. No se documenta soporte multi-GPU ni reparto de pesos entre varias tarjetas.
- Opciones de despliegue: motor propio ds4 (C99 + CUDA, Metal en Apple Silicon, compilado con un Makefile y sin dependencias externas). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, pese a que el formato de pesos sea GGUF.
- Latencia y throughput del LLM: no disponibles. Solo se conoce la latencia del subsistema de voz (51 ms) y la duracion de una ejecucion de agente completa (16 minutos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YoungAi-DeepSeek-V4.1-Flash (esta ficha) | 552B MoE, 8B activos (base) | 1M tokens | GGUF, 113,6 GB, 40 fragmentos | MIT | HuggingFace, 54 descargas |
| DeepSeek V4.1 Flash (checkpoint oficial) | 552B MoE, 8B activos | 1M tokens | Pesos originales, ~510 GB | no disponible en la informacion | deepseek-ai y NVIDIA NIM |
| Otras cuantizaciones GGUF de DeepSeek V4.1 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas on-device comparables de tamano y contexto similares, ni de datos de rendimiento que permitan una comparacion cuantitativa entre esta cuantizacion y el checkpoint oficial.

## Limitaciones y advertencias

- No hay ningun benchmark publicado, de modo que no puede verificarse la perdida de calidad introducida por la cuantizacion vectorial q4k respecto al checkpoint de 510 GB.
- La traccion del repositorio es minima (54 descargas, 10 likes) y la validacion por parte de terceros es practicamente inexistente.
- El reconocimiento de voz integrado solo funciona en chino y su tasa de error de caracteres se situa entre el 29 % y el 36 % en conjuntos de prueba dificiles con acentos marcados; no es apto para dictado profesional.
- La entrada de voz requiere HTTPS o localhost en el navegador; accediendo por `http://<IP-de-LAN>` el microfono no esta disponible.
- El campo de parametros totales de los metadatos safetensors (485.283.840) no cuadra con el tamano del repositorio ni con los 552B del modelo base, lo que indica que la metadata del repo no es fiable para dimensionar el modelo.
- Los datos de licencia se declaran como MIT, pero conviene verificar la licencia del checkpoint original de DeepSeek V4.1 Flash antes de un uso comercial, ya que la informacion disponible no la detalla.
- Riesgo de alucinacion: inherente a los modelos generativos; ademas, las herramientas de busqueda web devuelven texto de paginas sin verificacion de fuentes, por lo que los informes generados deben revisarse antes de usarse en decisiones.
- Las herramientas de ejecucion (`run`) operan en un sandbox sin red y con escritura limitada al espacio de trabajo, pero las rutas externas requieren aprobacion explicita del usuario; un mal uso de esa aprobacion amplia la superficie de riesgo.
- Existe un conjunto de herramientas `phone_*` de telefono en la nube que la propia documentacion etiqueta como modo de riesgo; no deberian habilitarse en entornos corporativos sin auditoria.
- El modelo esta orientado a ingles y chino; no se documenta un rendimiento fiable en castellano.
- La memoria persistente se guarda en texto plano bajo `~/.ds4/assistant/memory/`, sin cifrado documentado.
- El proyecto declara no enlazar bibliotecas de terceros y compilarse con un Makefile, lo que simplifica la auditoria pero implica que el soporte de despliegue depende del autor y no de ecosistemas estandar como vLLM u Ollama.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash
- Archivos del repositorio: https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash/tree/main
- Repositorio GitHub del proyecto YoungAi: https://github.com/fodelf/YoungAi
- Notas tecnicas del proyecto: https://github.com/fodelf/YoungAi/blob/restructure/docs/TECHNICAL.md
- README en chino: https://github.com/fodelf/YoungAi/blob/restructure/README.zh-CN.md
- Web y guia de usuario: https://fodelf.github.io/YoungAi/
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Ficha de DeepSeek V4.1 Flash en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash
- Modelo de reconocimiento de voz moonshine-tiny-zh: https://huggingface.co/moonshine-ai/moonshine-tiny-zh
- Ficha de terceros con indice de popularidad: https://free2aitools.com/model/wenzhouwu/youngai-deepseek-v4.1-flash
