# WaveCut/gemma-4-26B-A4B-it-QAT-Q4_0-MTP-NInfer-v3

## Resumen

Gemma 4 26B-A4B it QAT Q4_0 con asistente MTP y visión es un artefacto empaquetado por WaveCut para NInfer, un motor de inferencia alternativo. Parte del modelo oficial de Google Gemma 4 26B-A4B it, entrenado con quantización consciente (QAT) en formato Q4_0, e incorpora tres componentes en un único fichero `.ninfer` de 14,75 GiB: el modelo de texto, un asistente de predicción multi-token (MTP) para decodificación especulativa y la torre de visión para entrada de imagen y vídeo.

El modelo base es un transformer con arquitectura MoE (mezcla de expertos) de 26.000 millones de parámetros totales y 4.000 millones activos por token, con 30 bloques (25 de ventana deslizante y 5 de atención completa) y 128 expertos enrutados por bloque. La innovación principal del artefacto es que no recuantiza nada: conserva los bloques ggml del release oficial byte a byte y el motor los multiplica en su sitio, añadiendo decodificación especulativa mediante el asistente MTP y codificación de imágenes y vídeo con la torre de visión.

Es relevante porque permite ejecutar un modelo multimodal MoE de 26B con contexto largo y tool calling en una sola RTX 3090, con soporte para hasta ocho peticiones concurrentes con reutilización de prefijo de prompt (incluidas imágenes), salida estructurada y razonamiento en canal separado. La revisión del 27 de noviembre de 2026 incorpora la corrección de tokens defectuosos ("glitch tokens") que Google aplicó a los tokenizers de Gemma 4 E2B, E4B y 12B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 30 bloques (25 sliding-window, 5 full-attention) y 128 expertos enrutados por bloque |
| Parametros totales | 26B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | 4B (aproximado, segun nomenclatura A4B) |
| Longitud de contexto | 40K tokens (segun ejemplo de ejecucion de la model card; no se especifica el maximo oficial) |
| Tipos de cuantizacion | Q4_0 (matrices principales y expertos), Q6_K (tabla de tokens y cabeza atada), BF16 (torre de vision y proyeccion de parches), FP32 (normas, router, escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | `.ninfer` (formato propietario de NInfer v3); los pesos subyacentes son bloques ggml Q4_0/Q6_K/BF16/FP32 |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B-A4B it emplea una arquitectura transformer con mezcla de expertos: 30 bloques, de los cuales 25 usan atención de ventana deslizante y 5 atención completa, con 128 expertos enrutados por bloque. Cada bloque contiene ademas un MLP denso. El artefacto conserva los bloques Q4_0 del release oficial de Google sin recuantizar, con la tabla de tokens y la cabeza atada en Q6_K, y normas, router y escalas en FP32. La torre de visión (componente `vision`) proviene del fichero `gemma-4-26B-it-mmproj.gguf` con proyector `gemma4v`: 27 bloques de anchura 1152 con matrices BF16 y normas FP32.

El entrenamiento original es de Google con quantización consciente (QAT) en Q4_0, lo que significa que el modelo fue entrenado teniendo en cuenta la quantización para minimizar la perdida de calidad. El asistente MTP es el modelo QAT de Google en Q4_0 (formato que su entrenamiento tiene como objetivo), con cuatro bloques de anchura 1024 que leen la propia cache KV del modelo y usan su tabla de tokens Q4_0 como cabeza. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable del artefacto es la decodificacion especulativa con el asistente MTP (`--spec mtp`) y la codificacion de imagenes y video con la torre (`--vision`), todo en un unico fichero.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (razonamiento en canal separado cuando la peticion lo activa).
- Procesamiento multimodal de imagen y video junto a texto (pipeline `image-text-to-text`).
- Tool calling: las llamadas a herramientas en el marcado de Gemma se devuelven como tool calls en formato OpenAI.
- Salida estructurada (structured output).
- Hasta ocho peticiones concurrentes con reutilizacion de prefijo de prompt, incluidas imagenes.
- Decodificacion especulativa mediante asistente MTP (dos borradores por ronda en el ejemplo de la model card).
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Tokenizer con la correccion de glitch tokens de Google: 298 merges de 260 tokens con embeddings colapsados eliminados y `𡉺` renombrado `<glitch_pruned_249788>`.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 40K tokens, con reutilizacion de prefijo de prompt para abaratar turnos sucesivos y soporte de hasta ocho peticiones concurrentes en una sola GPU.
- Generacion de codigo en produccion: el soporte de tool calling en formato OpenAI permite integrarlo en pipelines de CI/CD y en asistentes de codigo que invocan herramientas externas (ejecucion de tests, linters, APIs).
- Analisis de documentos con imagenes: la torre de vision permite procesar capturas, diagramas, tablas escaneadas o fotogramas de video junto a texto en la misma peticion.
- Transcripcion y descripcion de video: el componente de vision codifica video, adecuado para resumenes de contenido audiovisual o extraccion de informacion de grabaciones.
- Razonamiento multi-paso con thinking mode: activando el canal de razonamiento, el modelo es adecuado para tareas de analisis que requieren cadena de pensamiento antes de la respuesta final.
- Despliegue en estacion de trabajo con una RTX 3090: al caber en 24 GB de VRAM con el artefacto de 14,75 GiB, sirve para prototipado local de agentes y asistentes multimodales sin infraestructura cloud.
- Extraccion estructurada de datos: la salida estructurada permite generar JSON validado a partir de texto e imagenes, util para ingestion de documentos en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una medida cualitativa de la correccion de tokenizer: ante 30 cadenas con glitch tokens, esta revision reproduce 25 exactamente (greedy, thinking off) frente a 17 de la revision anterior.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 14,75 GiB (15.837.988.096 bytes); se necesita VRAM adicional para cache KV y contexto. Con contexto de 40K tokens y peticiones concurrentes, se requiere margen sobre los 14,75 GiB.
- GPU recomendadas: RTX 3090 (familia desarrollada y medida en esta GPU). Las builds para RTX 40 y RTX 50 compilan pero no estan medidas.
- Cabe en GPU consumer: si, en RTX 3090 (24 GB) segun la model card; no se confirma para GPUs con menos VRAM.
- Opciones de despliegue: NInfer-all (rama `master`, imagen Docker `ghcr.io/iamwavecut/ninfer-all:cuda13.4` o `cuda12.9` para Volta). Las builds estandar de NInfer rechazan este fichero; la familia Gemma 4 y los formatos `gguf_*` existen solo en esa linea, con la torre de vision desde el commit `877fe16e`.
- Requisitos del entorno: driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit.
- Latencia y throughput: no disponibles como cifras; la model card menciona cuatro peticiones concurrentes sobre contextos de 40K tokens con dos borradores por ronda como escenario de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B it QAT Q4_0 (este artefacto) | 26B totales / 4B activos (MoE) | 40K (ejemplo) | Apache 2.0 | NInfer-all | Incluye MTP y vision; 14,75 GiB |
| google/gemma-4-26B-A4B-it-qat-q4_0-gguf | 26B totales / 4B activos (MoE) | no disponible | Apache 2.0 | GGUF (llama.cpp y otros) | Release oficial QAT sin asistente MTP ni vision empaquetados |
| unsloth/gemma-4-26B-A4B-it-qat-GGUF | 26B totales / 4B activos (MoE) | no disponible | Apache 2.0 | GGUF | Incluye `mtp-gemma-4-26B-A4B-it.gguf` como fichero separado |

## Limitaciones y advertencias

- El fichero solo funciona con NInfer-all; las builds estandar de NInfer lo rechazan. Esto limita la portabilidad frente a GGUF estandar.
- El soporte para RTX 40 y RTX 50 compila pero no esta medido; el rendimiento en esas GPUs es desconocido.
- Requiere driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit para el despliegue Docker.
- No se especifican los idiomas soportados; el comportamiento multilingue no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La correccion de glitch tokens es parcial: 25 de 30 cadenas reproducidas exactamente, no 30.
- El maximo de contexto oficial no se indica; el ejemplo de 40K no debe interpretarse como limite garantizado.
- Licencia Apache 2.0 con enlace a la licencia especifica de Gemma 4; conviene revisar los terminos de uso comercial de Gemma antes de produccion.
- El artefacto depende de revisiones concretas de repositorios de terceros (Google, Unsloth) para su conversion; la reproducibilidad exige fijar esas revisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/gemma-4-26B-A4B-it-QAT-Q4_0-MTP-NInfer-v3
- Repositorio NInfer (motor base): https://github.com/Neroued/ninfer
- Repositorio NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Commit de la torre de vision: https://github.com/iamwavecut/ninfer-all/commit/877fe16eff19734d19e86083d2e227048608af8c
- Documentacion de conversion Gemma 4: https://github.com/iamwavecut/ninfer-all/blob/master/docs/gemma4.md#converting
- Imagen Docker: ghcr.io/iamwavecut/ninfer-all:cuda13.4
- Modelo base oficial QAT GGUF: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Asistente QAT sin cuantizar: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant
- Modelo base de texto: https://huggingface.co/google/gemma-4-26B-A4B-it
- GGUF de Unsloth con MTP: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
