# soyaakinohara/Qwen-3.8-flash-next-heretic-3.78bpw-gguf

## Resumen

Qwen-3.8-flash-next-heretic-3.78bpw-gguf es una cuantizacion GGUF de precision mixta (3,78 bits por peso efectivos) del modelo trohrbaugh/Qwen3.8-Flash-Next-heretic-2, un derivado MoE de la familia Qwen4Exp al que se le ha atenuado el comportamiento de rechazo (tecnica Heretic/abliterated). Lo publica el usuario soyaakinohara y su objetivo es hacer viable en hardware de consumo un modelo de aproximadamente 177.000 millones de parametros que en BF16 ocupa unos 360 GB, reduciendo el peso a unos 83,6 GB sin recurrir a una cuantizacion uniforme agresiva.

El modelo emplea una arquitectura qwen4exp de tipo Mixture of Experts con 48 capas (36 de atencion lineal GDN y 12 de atencion completa), 512 expertos por capa y top-10 enrutados por capa. Los metadatos de contexto del GGUF declaran 262.144 tokens. Es multimodal (entrada de imagen y texto) gracias a un proyector de vision CLIP en BF16 que se distribuye aparte, y esta etiquetado como modelo de razonamiento: las respuestas empiezan con `[Start thinking]` y cierran la traza con `[End thinking]` antes de la respuesta final.

Su relevancia practica es doble: por un lado demuestra que la cuantizacion mixta guiada por imatrix permite comprimir un MoE de este tamano manteniendo una generacion determinista aceptable; por otro, es un ejemplo de modelo "uncensored" con licencia Qwen Community 1.0, con las implicaciones de seguridad y de cumplimiento que eso conlleva. El autor documento una prueba comparativa: una variante hermana de 3,26 bpw fue descartada tras pruebas manuales por bucles de razonamiento y respuestas degradadas, mientras que esta de 3,78 bpw supero las mismas comprobaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE con atencion lineal GDN + atencion completa) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible (configuracion MoE: 512 expertos por capa, top-10 enrutados) |
| Capas | 48 (36 de atencion lineal, 12 de atencion completa) |
| Longitud de contexto | 262.144 tokens segun metadatos del GGUF |
| Tipos de cuantizacion | Mezcla a 3,78 bpw: Q2_0, Q4_0, Q4_K, Q5_K, Q5_0, Q6_K, Q8_0 y F32 (tensores de router) |
| Idiomas soportados | ja, en, multilingual |
| Licencia | Qwen Community License 1.0 (heredada del modelo fuente; en HF figura como `license:other`) |
| Formato de pesos | GGUF, 1224 tensores, en 2 fragmentos (~42 GiB cada uno) + proyector de vision mmproj GGUF (~0,9 GiB, CLIP BF16) |
| Tamano del repositorio | 84,5 GB |
| Entrada/salida | image-text-to-text (texto, imagen) |
| Autor de la cuantizacion | soyaakinohara |
| Modelo base | trohrbaugh/Qwen3.8-Flash-Next-heretic-2 (BF16, 34 safetensors, ~360 GB) |
| Revision del modelo fuente | 207cd22c347a81e8d60e2f536c955da885641afb |
| Cabecera MTP (decodificacion especulativa) | no incluida (llama.cpp descarta MTP para qwen4exp) |
| Fechas | creado el 2026-09-07, actualizado el 2026-09-18 |
| Descargas / likes | 2.760 / 6 |

## Arquitectura y entrenamiento

La arquitectura no es un transformer denso clasico: es un MoE de tipo qwen4exp que combina atencion lineal (capas GDN, Gated DeltaNet, con mezcladores `attn_gate/qkv` y `ssm_out`) con 12 capas de atencion completa, lo que reduce el coste cuadratico en la mayor parte de la pila. Cada capa MoE dispone de 512 expertos con enrutado top-10, ademas de expertos compartidos. Los tensores de enrutamiento se mantienen en F32 segun la politica de llama.cpp, y las proyecciones de hiper-conexion caen a Q8_0 cuando la forma de bloque de las K-quant no encaja. El modelo incorpora una capa PLE de embeddings n-grama que, en el GGUF, ocupa aproximadamente 102 GB en Q4_0, un componente poco habitual y determinante del tamano final.

El proceso de cuantizacion consta de cuatro pasos documentados: conversion del BF16 original a GGUF BF16 (1224 tensores, ~354 GB) con `convert_hf_to_gguf.py`, junto con la conversion del proyector de vision (334 tensores); calibracion de una matriz de importancia con 80 fragmentos de 512 tokens, `--process-output`, sobre una mezcla con predominio de Wikipedia en japones, prosa en ingles y codigo (~2,8 MB); cuantizacion con `--imatrix` y un `--tensor-type-file` de nombres exactos (1224/1224 tensores mapeados, 97 fallbacks por forma, todos hacia mayor precision); y verificacion mediante histograma de tipos por tensor, generacion corta determinista y evaluacion manual de roleplay. La receta reparte la compresion de forma asimetrica: expertos enrutados de las 24 capas externas en Q4_0, los de las 24 capas centrales en Q2_0, embeddings PLE en Q4_0, mezcladores GDN en Q4_K, Q/O de atencion completa en Q5_K, expertos compartidos en Q5_0, embedding de tokens y salida en Q6_K y estado GDN (`ssm_alpha/beta`) en Q8_0.

No se detallan en la informacion disponible los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, si hubo RLHF o DPO), ni el metodo concreto de atenuacion de rechazo aplicado por el autor del modelo base. La model card indica que la preparacion, conversion, cuantizacion y validacion se realizaron con asistencia de "Hermes Agent", y el texto disponible aparece truncado en ese punto.

## Capacidades

- Generacion de texto conversacional en japones, ingles y otros idiomas (etiqueta `multilingual`).
- Razonamiento explicito en modo thinking: la salida comienza con `[Start thinking]` y cierra la traza con `[End thinking]` antes de la respuesta.
- Entrada multimodal de imagen y texto mediante el proyector de vision mmproj (CLIP en BF16), que debe cargarse junto al modelo de texto.
- Comportamiento de rechazo atenuado (derivado Heretic/abliterated): responde a peticiones que un modelo alineado convencional rechazaria.
- Uso como base para roleplay y generacion creativa, segun la verificacion manual declarada por el publicador.
- Contexto largo de hasta 262.144 tokens en metadatos, util para documentos extensos o conversaciones multi-turno prolongadas.
- Compatibilidad con llama.cpp upstream con soporte qwen4exp, tanto en `llama-cli` como en `llama-server`.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agente multi-paso en la informacion disponible.
- No se documenta decodificacion especulativa: la cabecera MTP se descarta en llama.cpp para esta arquitectura.

## Casos de uso

- Roleplay y narrativa interactiva: es el escenario para el que el autor verifico el modelo explicitamente, con pruebas manuales de roleplay; el rechazo atenuado y la ventana de 262.144 tokens permiten mantener personajes y contexto argumental durante sesiones largas.
- Procesamiento de documentacion tecnica en japones: con una imatrix calibrada sobre Wikipedia japonesa, el modelo esta optimizado para resumir, extraer y responder preguntas sobre manuales, normativa o informes extensos en ese idioma.
- Analisis de documentos con imagenes: gracias al mmproj se pueden enviar capturas de pantalla, diagramas o paginas escaneadas y pedir descripciones, extraccion de datos o traduccion combinando vision y texto.
- Generacion de codigo asistida en local: la calibracion incluye codigo y el modelo ofrece modo thinking para tareas de varios pasos; encaja en un servidor `llama-server` interno para autocompletado y explicacion de fragmentos sin enviar codigo a terceros.
- Traduccion y adaptacion de contenido ja-en: al estar etiquetado como multilingue con foco en japones e ingles, sirve para localizar documentacion, subtitulos o fichas de producto entre ambos idiomas.
- Asistente conversacional autoalojado para equipos tecnicos: desplegado como endpoint compatible con OpenAI mediante `llama-server`, permite montar un chatbot interno sobre datos propios sin depender de APIs externas.
- Investigacion sobre cuantizacion de MoE: el repositorio documenta la receta completa (imatrix, tensor-type-file, histograma de tipos) y sirve como caso de estudio reproducible para estudiar el impacto de bpw en calidad.
- Generacion creativa sin filtros editoriales: el modo uncensored resulta util en escritura de ficcion con tematicas sensibles, siempre bajo revision humana y con las advertencias legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, ni comparaciones numericas con modelos de referencia. La busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (los enlaces recuperados correspondian a guias turisticas de Washington DC), por lo que tampoco se pueden aportar datos externos.

| Metrica | Resultado |
|---|---|
| MMLU / MMLU-Pro | no disponible |
| HumanEval / MBPP | no disponible |
| GSM8K / MATH | no disponible |
| Evaluaciones multimodales | no disponible |
| Velocidad de generacion reportada por el autor | 4,4 tokens/s en generacion corta en japones con `-ngl 10` (offload parcial) |

## Requisitos de hardware

- VRAM estimada para inferencia a maxima precision de archivo: el peso completo ocupa unos 84,5 GB (dos fragmentos de ~42 GiB mas el mmproj), por lo que el offload total exige del orden de 84-90 GB de VRAM sumando cache KV.
- Configuracion probada por el autor: 2x NVIDIA GeForce RTX 5060 Ti de 16 GB (32 GB de VRAM en total) con `-ngl 10`, `--tensor-split 1,1` y `--split-mode layer`, sobre Ubuntu 24.04 con 64 GB de RAM mas 23 GB de swap. El modelo completo de 83 GB excede esa VRAM, de ahi el offload parcial.
- GPU recomendadas para servirlo completo en GPU: no hay una recomendacion publicada; por capacidad de memoria, un unico acelerador de 80 GB no bastaria para el peso mas cache KV, por lo que se necesitarian dos unidades de 80 GB o un nodo con memoria unificada.
- GPU de consumo: cabe parcialmente en tarjetas de 16-24 GB (RTX 5060 Ti 16 GB, RTX 4090 24 GB, RTX 5090 32 GB) siempre que se acepte offload a CPU y RAM suficiente; el rendimiento dependera del numero de capas descargadas a la GPU.
- RAM del sistema: el autor uso 64 GB mas 23 GB de swap con offload parcial; para offload mayoritario conviene bastante mas RAM, ya que el peso del modelo debe caber en memoria accesible.
- Opciones de despliegue: `llama.cpp` upstream con soporte qwen4exp (commit de referencia `ca3d5a3e1`), mediante `llama-cli` y `llama-server`; este ultimo expone un endpoint HTTP. `llama.cpp` resuelve automaticamente el segundo fragmento al indicar el primero. Para entrada de imagen hay que anadir `--mmproj Qwen-3.8-flash-next-heretic-mmproj.gguf`.
- Compatibilidad con vLLM, TGI u Ollama: no confirmada en la informacion disponible.
- Latencia y throughput: 4,4 tokens/s reportados en generacion corta en japones con offload parcial. El propio autor advierte que la velocidad real depende de la longitud de contexto y del prompt, del muestreo, de la version de CUDA y llama.cpp y de la carga de fondo.
- Presupuesto de tokens: al ser un modelo de razonamiento, el autor recomienda `max_tokens` de 1024 o mas; con 200 tokens el presupuesto se consume solo en la traza de pensamiento.
- Exposicion en red: el autor recomienda anadir autenticacion, cortafuegos y controles de acceso propios antes de exponer `llama-server` fuera de una LAN de confianza.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables identificados en la informacion proporcionada. La unica comparacion documentada es interna a la propia familia de cuantizaciones de este repositorio:

| Modelo | Parametros | Contexto | Precision / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.8-flash-next-heretic-3.78bpw-gguf | ~177B (MoE, 512 expertos, top-10) | 262.144 tokens | 3,78 bpw, ~83,6 GB de pesos, GGUF | Qwen Community License 1.0 | Publicado en HuggingFace, 2.760 descargas |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 (modelo fuente) | ~177B | no disponible en detalle | BF16, 34 safetensors, ~360 GB | Qwen Community License 1.0 | Publicado en HuggingFace |
| Variante hermana de 3,26 bpw (descartada) | ~177B | no disponible | 3,26 bpw | Qwen Community License 1.0 | Construida y rechazada por el autor; no se ofrece como release |

Comparativa con alternativas de otros desarrolladores: no disponible, ya que la busqueda web no devolvio resultados pertinentes.

## Limitaciones y advertencias

- Modelo con rechazo atenuado de forma deliberada (Heretic/abliterated): puede generar contenido que otros modelos rechazarian. Requiere moderacion y politica de uso propia antes de cualquier despliegue orientado al publico.
- Riesgo de alucinacion inherente a la cuantizacion agresiva: el autor reconoce que una cuantizacion mas apretada provoca bucles de razonamiento y respuestas degradadas, y que este build de 3,78 bpw supero las pruebas solo tras descartar el de 3,26 bpw. Si aparecen bucles, recomienda subir la precision de los expertos de las capas centrales o servir con el razonamiento desactivado.
- Degradacion de calidad ligada al idioma: la imatrix se calibro con predominio de japones (Wikipedia), prosa en ingles y codigo, por lo que el rendimiento en otros idiomas, incluido el espanol, no esta verificado y puede ser inferior.
- Sin cabecera MTP: no se puede aplicar decodificacion especulativa con el borrador nativo en llama.cpp para esta arquitectura, lo que limita las ganancias de throughput.
- Rendimiento bajo en configuraciones de consumo: 4,4 tokens/s con offload parcial en 2x RTX 5060 Ti es insuficiente para aplicaciones interactivas con muchos usuarios concurrentes o contextos largos.
- Huella de recursos elevada: 84,5 GB de repositorio y necesidades de RAM mas swap importantes hacen inviable el despliegue en portatiles o equipos sin GPU dedicada.
- Compatibilidad limitada: requiere una version de llama.cpp con soporte qwen4exp; no se confirma funcionamiento en vLLM, TGI ni Ollama. La cuantizacion se valido en un solo build de llama.cpp (commit `ca3d5a3e1`) y en una unica maquina.
- Licencia: Qwen Community License 1.0, heredada del modelo fuente. Es una licencia con condiciones especificas, no una licencia de codigo abierto permisiva; hay que revisar el texto completo antes de cualquier uso comercial y, en particular, las clausulas de atribucion y de uso aceptable.
- Modelo derivado y no oficial: no procede de Qwen directamente ni del autor del modelo base, sino de una cuantizacion de terceros; no hay garantia de soporte ni de mantenimiento.
- Documentacion incompleta: la model card disponible aparece truncada y no detalla datos de entrenamiento del modelo original, composicion del dataset, proceso de alineacion ni evaluaciones objetivas.
- Contenido multimodal sin verificar: la model card no aporta evaluaciones de calidad del proyector de vision mas alla de su generacion como mmproj.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyaakinohara/Qwen-3.8-flash-next-heretic-3.78bpw-gguf
- Modelo base (trohrbaugh/Qwen3.8-Flash-Next-heretic-2): https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Texto completo de la licencia Qwen Community License 1.0: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2/resolve/main/LICENSE
- Repositorio de llama.cpp (runtime compatible, soporte qwen4exp en upstream): https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios o demos adicionales: no disponible; la busqueda web no devolvio resultados relevantes sobre este modelo.
