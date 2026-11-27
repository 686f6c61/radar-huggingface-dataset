# tencent/Hy4-flash-FP8

## Resumen

Hy4-flash-FP8 es la versión cuantizada en FP8 de Hy4 Flash, un modelo multimodal de generación de texto desarrollado por Tencent dentro de su familia Hunyuan. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 220.260 millones de parámetros totales según los pesos en safetensors, de los cuales solo se activan aproximadamente 11,3 mil millones por token en texto (más 0,43 mil millones en visión). Acepta de forma nativa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

El modelo se presenta como la variante más eficiente en coste de la familia Hy hasta la fecha. Su columna vertebral lingüística consta de 42 capas (1 densa y 41 MoE) con conexiones residuales de identidad (iHC) y atención híbrida que intercala atención dispersa (IndexPool) y atención de ventana deslizante (SWA). Incorpora además un codificador visual adaptado de SigLIP2-So400m-Patch16-Res512, un proyector MLP y un drafter de 5 capas llamado DFly2 (0,85B parámetros) para decodificación especulativa de bajo coste en contextos largos.

La relevancia de esta ficha radica en que combina un contexto extremadamente largo (1M tokens), multimodalidad nativa y una eficiencia de activación muy agresiva (12B activos sobre 220B totales), lo que lo sitúa en la categoría de modelos de gran escala optimizados para despliegue en producción. La versión FP8 reduce el peso del repositorio a 287,1 GB, lo que facilita su servicio en infraestructuras con memoria limitada en comparación con los pesos en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (dispersa + ventana deslizante) y MLA |
| Parametros totales | 220.260.270.502 (220,26B); 155,5B excluyendo Engram, ViT y DFly2 |
| Parametros activos | Texto 11,3B + Visión 0,43B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta variante); existen pesos GGUF publicados por terceros |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | Safetensors (transformers); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

La columna vertebral del modelo tiene 42 capas: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE dispone de 512 expertos enrutados más un experto compartido, y cada token activa 16 expertos enrutados. Los expertos operan en un espacio latente de dimensión 1.536 (LatentMoE), lo que reduce el coste computacional frente a un MoE convencional. El tamaño oculto es de 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida y se distribuye en 12 capas de atención dispersa y 30 de ventana deslizante, con un patrón de 2 capas dispersas seguidas de 10 bloques de (3 SWA → 1 dispersa). La formulación es Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512; las capas dispersas usan 32 cabezas y las SWA 64. La atención dispersa selecciona hasta 2.048 tokens mediante selección a nivel de grupo (IndexPool), mientras que la SWA emplea una ventana causal de 512 tokens (511 previos más el actual). El codificado posicional multimodal usa MRoPE intercalado, con bases RoPE de 10.000.000 en capas dispersas y 10.000 en SWA.

Una innovación destacable es el módulo Engram (N-gram embedding): la columna vertebral se aumenta con representaciones aprendidas de bigramas y trigramas recuperadas mediante búsquedas hash multi-cabeza. Se inserta en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden de n-grama, un vocabulario hash de 10,3M por cabeza y una dimensión de embedding de 768 por orden (8 cabezas × 96 dimensiones), sumando 63,4B parámetros en tablas de embedding. El codificador visual tiene 27 capas, tamaño oculto 1.152, tamaño intermedio 4.304, 16 cabezas de atención, parches de 16×16, embedding posicional de 128×128 y fusión de características visuales 2×2. El drafter DFly2 de 5 capas (0,85B parámetros) reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de coste constante en contextos largos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto con razonamiento y contexto extremadamente largo (hasta 1M tokens).
- Entrada multimodal nativa de texto e imagen, con salida de texto (pipeline image-text-to-text).
- Procesamiento de imágenes mediante codificador SigLIP2 adaptado con fusión de parches 2×2.
- Modo instructivo y conversacional (etiquetas instruct y conversational).
- Soporte de API compatible con OpenAI, según la sección Quickstart de la model card.
- Decodificación especulativa integrada mediante DFly2 para acelerar la inferencia en contextos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque la model card menciona validación interna de código y agentes (BPB) sin detallar resultados.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto, el modelo puede ingerir manuales técnicos, expedientes completos o libros enteros en una sola pasada y responder preguntas sobre ellos sin necesidad de fragmentación ni recuperación externa.
- Procesamiento de informes con imágenes: al aceptar entradas de imagen y texto de forma nativa, resulta adecuado para extraer información de capturas, gráficos o diagramas junto con el texto que los acompaña en flujos de auditoría o revisión documental.
- Asistentes conversacionales de largo recorrido: la ventana de 1M tokens permite mantener conversaciones multi-turno muy largas con memoria completa del historial, útil en atención al cliente especializada o soporte técnico.
- Generación de código en pipelines: la model card incluye validación interna de código y agentes (BPB), lo que sugiere uso en tareas de generación y revisión de código; puede integrarse en herramientas de desarrollo mediante la API compatible con OpenAI.
- Resumen y síntesis de corpus grandes: para equipos de investigación que necesitan condensar decenas de artículos o transcripciones en un único resumen coherente, el contexto de 1M tokens evita perder información entre fragmentos.
- Despliegue en producción con coste controlado: con solo 12B parámetros activos por token y pesos FP8 de 287,1 GB, es viable servirlo en clústeres de GPUs de gama alta con vLLM o SGLang, manteniendo un coste por token inferior al de un modelo denso de 220B.
- Búsqueda y análisis multimodal en catálogos: combinación de imágenes de producto con descripciones textuales para tareas de clasificación, extracción de atributos o generación de fichas descriptivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona una sección de resultados de benchmarks (apéndice) y métricas de bits-per-byte (BPB) sobre validación interna de código y agentes, pero los valores concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 287,1 GB en el repositorio; se necesita al menos esa cantidad de memoria agregada, más espacio para caché KV y activaciones. En FP8, el modelo no cabe en una sola GPU de 80 GB.
- GPU recomendadas: clústeres con múltiples A100 80 GB, H100 80 GB o H200; el despliegue típico requerirá varias GPUs en paralelo (tensor parallelism).
- GPU de consumo: no cabe en GPUs consumer (RTX 4090 de 24 GB, etc.) en FP8 completa; sería necesario recurrir a cuantizaciones GGUF de menor precisión o a versiones reducidas no incluidas en esta ficha.
- Opciones de despliegue: transformers, vLLM, SGLang, API compatible con OpenAI; también existen pesos GGUF para llama.cpp/Ollama publicados por terceros (AngelSlim/Hy4-flash-GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DFly2 está diseñada para reducir la latencia en contextos largos con coste constante.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada para establecer una comparación rigurosa. A modo orientativo, se compara con alternativas de la misma categoría (MoE de gran escala con contexto largo), indicando solo los datos disponibles:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-FP8 (este) | 220,26B | ~12B | 1M | Tencent Hy License | Hugging Face, ModelScope, AtomGit |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo entrenado por un fabricante chino, es previsible un sesgo cultural y lingüístico hacia datos en chino e inglés, aunque no se confirma.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de gran escala, puede producir contenido plausible pero incorrecto, especialmente en contextos muy largos.
- Idiomas soportados: no se detallan; la ausencia de esta información impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del chino e inglés.
- Licencia: Tencent Hy License (license: other), no es una licencia open source estándar; es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de uso, atribución o límites de escala.
- Contexto: aunque la ventana es de 1M tokens, el rendimiento efectivo en el extremo superior puede degradarse; la atención dispersa selecciona hasta 2.048 tokens, lo que puede implicar pérdida de información en documentos muy largos.
- Producción: el tamaño de 287,1 GB en FP8 exige infraestructura multi-GPU; el coste de memoria y el aprovisionamiento deben planificarse con cuidado.
- Multimodalidad limitada a entrada de imagen y salida de texto; no se documenta soporte de audio ni de vídeo.
- No se dispone de información sobre tool calling ni sobre evaluación de agentes, lo que limita su uso en pipelines que dependan de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-flash-FP8
- Modelo base (sin cuantizar): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/README_CN.md
- Sitio oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
