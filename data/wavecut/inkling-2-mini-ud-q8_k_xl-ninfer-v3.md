# WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3

## Resumen

Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3 es un artefacto de cuantización y empaquetado del modelo Inkling 2 Mini de Thinking Machines, preparado por el usuario WaveCut para el motor de inferencia NInfer (rama `master` de `iamwavecut/ninfer-all`). El modelo base es un transformer con bucles (looped transformer) de arquitectura mixta de expertos (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token, e incluye una torre de visión tipo ViT y dos drafters de decodificación especulativa (DSpark y DFlash2).

El artefacto parte del GGUF UD-Q8_K_XL de Unsloth, la cuantización más grande de su catálogo y referencia de sus mediciones KL: BF16 en todas las matrices excepto los expertos enrutados de las capas 0-19, que van en NVFP4. La conversión no recuantiza el modelo: conserva los bloques ggml o las palabras BF16 byte a byte, salvo los expertos enrutados de las capas 20-23, cuyos valores BF16 se almacenan como filas MXFP8 (códigos E4M3 con una escala E8M0 por cada 32 valores) que reproducen cada valor de forma exacta.

El resultado es un único fichero `.ninfer` de 20.471.680.000 bytes (19,07 GiB) con 1.246 tensores, pensado para ejecutarse con NInfer en modo multimodal (image-text-to-text), con soporte de tool calling, razonamiento en bloques propios, salida estructurada y decodificación especulativa. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y mezcla de expertos (MoE); 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, núcleo 6-17 tres veces, coda 18-23); torre de visión ViT |
| Parametros totales | 26,4 mil millones |
| Parametros activos | 3,4 mil millones por token |
| Longitud de contexto | No disponible de forma explícita; la atención usa una tabla aprendida de 1.024 distancias y las capas 5, 11, 17 y 23 atienden sobre todas las posiciones, el resto sobre 1.024 |
| Tipos de cuantizacion | UD-Q8_K_XL (BF16 general, NVFP4 en expertos enrutados de capas 0-19); en este artefacto: MXFP8 en expertos de capas 20-23, Q8_0 en torre de visión y drafter DSpark, Q8_G32 en proyecciones del drafter DFlash2, FP32 en routers, convoluciones, normas y controladores |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer); derivado de GGUF (UD-Q8_K_XL de Unsloth) y de safetensors BF16 (drafter DFlash2 de incoai) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura de transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas, donde el núcleo (capas 6-17) se recorre tres veces con los mismos pesos y cada visita mantiene sus propias claves, valores e historiales de convolución. La atención usa 24 cabezas de consulta sobre 8 cabezas KV de dimensión 128, sin rotación posicional, con una tabla aprendida de 1.024 distancias y mecanismo de sinks; cuatro capas (5, 11, 17 y 23) atienden sobre todas las posiciones y el resto sobre una ventana de 1.024. La capa MoE contiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoid con sesgo de selección, activación SiTU sobre [gate; up] de anchura 1152 y sin experto compartido.

La conversión a NInfer preserva la representación original: las matrices mantienen los bloques ggml o las palabras BF16 byte a byte, salvo los expertos enrutados de las capas 20-23, que se almacenan como filas MXFP8 que reproducen exactamente cada valor BF16. El artefacto incluye la torre de visión en Q8_0 (procedente del `mmproj-Inkling-2-Mini-Q8_0.gguf` de ggml-org), el drafter DSpark en Q8_0 (de Unsloth) y el drafter DFlash2 con proyecciones Q8_G32 y el resto en BF16 (de incoai). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento en bloques de pensamiento propios del modelo.
- Procesamiento de imágenes a texto mediante torre de visión ViT con hasta 4.096 posiciones por imagen, fusión 2x2 y proyector de dos capas.
- Tool calling: los bloques JSON de llamada a herramientas se devuelven como llamadas de herramienta en formato OpenAI, con argumentos estrictos y salida estructurada.
- Decisiones tipadas y reranking.
- Decodificación especulativa con el drafter DSpark (activo por defecto con una sola petición) o con el drafter DFlash2 (`--spec dflash2`), además de por búsqueda en contexto.
- Reutilización de prefijo de prompt y hasta ocho peticiones concurrentes.
- Ejecución de expertos enrutados en GPU, en memoria de host fijada (pinned) o leídos directamente del fichero.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla o fotografías junto con texto y responder en conversaciones multi-turno, aprovechando la torre de visión y la reutilización de prefijo para mantener contextos largos entre turnos.
- Automatización de tareas con herramientas: gracias a la devolución de bloques JSON como llamadas de herramienta en formato OpenAI, se puede integrar en orquestadores de agentes que encadenen búsquedas, consultas a API y escritura de ficheros con argumentos validados.
- Extracción de datos estructurados de documentos con imagen: la combinación de visión y salida estructurada permite convertir facturas, formularios o tablas escaneadas en JSON tipado.
- Reranking y clasificación en pipelines de recuperación: las capacidades de decisión tipada y reranking permiten puntuar candidatos en un sistema RAG sin un modelo adicional.
- Despliegue en servidores con VRAM limitada: con 3,4 mil millones de parámetros activos por token y la opción de mantener los expertos en memoria de host fijada o leerlos del fichero, el modelo puede servirse en GPUs de gama alta para consumidor con cuantización de 8 bits.
- Razonamiento multi-paso en entornos de desarrollo: el modo de razonamiento en bloques propios y la decodificación especulativa con DSpark o DFlash2 reducen la latencia en tareas de análisis de código y planificación.
- Procesamiento por lotes con concurrencia: el soporte de hasta ocho peticiones concurrentes con reutilización de prefijo lo hace adecuado para servicios de inferencia con prompts de sistema compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `.ninfer` ocupa 19,07 GiB; con overhead de contexto y estados de las visitas del transformer con bucles, se recomienda al menos 24 GB de VRAM si los expertos se mantienen en GPU, o menos si se descargan a memoria de host fijada o se leen del fichero.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para el modo con expertos en GPU; GPUs con 16 GB o menos pueden funcionar con expertos en host o leídos del fichero, a costa de latencia.
- Cabe en GPU de consumidor: sí, en RTX 4090 (24 GB) y previsiblemente en GPUs de 24 GB o más; en 16 GB requiere descarga parcial de expertos.
- Opciones de despliegue: exclusivamente el motor NInfer (rama `master` de `iamwavecut/ninfer-all`), en versiones posteriores a `2026-11-25.3`; las compilaciones anteriores fallan con `unknown tensor format: mxfp8`. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa con DSpark o DFlash2 está pensada para reducir la latencia de generación.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y motores |
|---|---|---|---|---|
| Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3 | 26,4 B / 3,4 B | No disponible (ventana de atención de 1.024 en la mayoría de capas) | Apache 2.0 | `.ninfer`, solo NInfer |
| Inkling-2-Mini (base, thinkingmachines) | 26,4 B / 3,4 B | No disponible | Apache 2.0 | safetensors, ecosistema Hugging Face |
| Inkling-2-Mini-UD-Q8_K_XL (Unsloth GGUF) | 26,4 B / 3,4 B | No disponible | Apache 2.0 | GGUF, llama.cpp y derivados |
| Inkling-2-Mini-DFlash2 (incoai) | 26,4 B / 3,4 B (drafter adicional) | No disponible | No disponible | safetensors BF16 |

## Limitaciones y advertencias

- El artefacto solo funciona con NInfer en versiones posteriores a `2026-11-25.3`; compilaciones anteriores rechazan el fichero por el formato MXFP8 de los expertos.
- No es compatible con llama.cpp, Ollama, vLLM ni TGI, lo que limita su portabilidad frente al GGUF original de Unsloth.
- El rendimiento real depende de la implementación del motor NInfer, no del ecosistema estándar; no hay benchmarks publicados que permitan comparar su calidad con el modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- Sesgos conocidos: no disponibles; al no documentarse la composición del dataset de entrenamiento, no se puede evaluar el sesgo del modelo base.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto incorpora componentes de terceros (torre de visión de ggml-org, drafter DSpark de Unsloth, drafter DFlash2 de incoai) cuyas condiciones conviene revisar en sus repositorios originales.
- El tamaño del repositorio (92,4 GB) incluye varias revisiones del fichero; la descarga completa no es necesaria si se selecciona la revisión correcta.

## Enlaces

- [Hugging Face: WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [GGUF de Unsloth: unsloth/Inkling-2-Mini-GGUF](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF)
- [Drafter DFlash2: incoai/Inkling-2-Mini-DFlash2](https://huggingface.co/incoai/Inkling-2-Mini-DFlash2)
- [Motor NInfer: Neroued/ninfer](https://github.com/Neroued/ninfer)
- [NInfer-all (rama master): iamwavecut/ninfer-all](https://github.com/iamwavecut/ninfer-all)
- [Variante UD-IQ1_M](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3)
- [Variante UD-Q2_K_XL](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3)
- [Variante UD-Q3_K_XL](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3)
- [Variante UD-IQ4_XS](https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3)
- [Variante APEX-I MiniPlus V2.1](https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3)
