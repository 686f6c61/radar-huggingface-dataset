# XiaomiMiMo/MiMo-V2.5

## Resumen

MiMo-V2.5 es un modelo omnímodal nativo desarrollado por Xiaomi, diseñado para comprender y procesar texto, imagen, vídeo y audio dentro de una arquitectura unificada. Se basa en el backbone de MiMo-V2-Flash, un modelo de lenguaje de tipo MoE (Mixture of Experts) con atención híbrida, al que se le añaden codificadores específicos de visión y audio. El modelo está pensado para tareas de razonamiento multimodal, comprensión de contexto largo y flujos de trabajo agénticos, destacando por su capacidad de procesar hasta 1 millón de tokens de contexto.

Con 310 mil millones de parámetros totales y 15 mil millones activos por token, MiMo-V2.5 logra un equilibrio entre capacidad y eficiencia computacional. Su entrenamiento se realizó con aproximadamente 48 billones de tokens usando precisión mixta FP8, e incorpora módulos de predicción multi-token (MTP) que aceleran la inferencia mediante decodificación especulativa. El modelo se distribuye bajo licencia MIT, lo que facilita su adopción tanto en investigación como en entornos comerciales.

La relevancia de MiMo-V2.5 radica en su naturaleza omnímodal nativa y su enfoque en capacidades agénticas, combinando percepción multimodal con razonamiento de largo alcance. Esto lo posiciona como una opción atractiva para desarrolladores que necesitan un modelo único para tareas que involucran múltiples modalidades, como análisis de vídeo, asistentes conversacionales avanzados o agentes autónomos que requieren comprensión contextual extensa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) con atención híbrida (Sliding Window Attention y Global Attention) |
| Parametros totales | 310.775.040.000 (310B) |
| Parametros activos | 15B (por token) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | No disponible (se menciona entrenamiento en FP8, pero no cuantizaciones de inferencia) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiMo-V2.5 utiliza una arquitectura de MoE dispersa con 48 capas (1 densa y 47 MoE), donde se intercalan capas de atención con ventana deslizante (SWA) y atención global (GA) en una proporción 5:1, con una ventana de 128 tokens. Este diseño reduce el almacenamiento de la caché KV en aproximadamente 6 veces, manteniendo el rendimiento en contextos largos mediante un sesgo de atención sink aprendible. El modelo incorpora codificadores dedicados: un Vision Transformer (ViT) de 729M de parámetros con atención híbrida de ventana, y un codificador de audio de 261M de parámetros inicializado desde MiMo-Audio. Además, incluye tres módulos ligeros de predicción multi-token (MTP) con FFN densas, que aceleran la inferencia mediante decodificación especulativa y mejoran la eficiencia del entrenamiento con RL.

El entrenamiento se realizó en dos fases. La primera consistió en un preentrenamiento sobre aproximadamente 48 billones de tokens usando precisión mixta FP8, con una ventana de contexto que soporta hasta 1M tokens. La segunda fase de post-entrenamiento combinó fine-tuning supervisado (SFT), RL agéntico a gran escala y destilación on-policy multi-maestro (MOPD), lo que permitió alcanzar un rendimiento sólido en tareas agénticas y benchmarks de comprensión multimodal.

## Capacidades

- Comprensión multimodal nativa: procesa texto, imagen, vídeo y audio en una única arquitectura, sin necesidad de módulos externos.
- Razonamiento de contexto largo: soporta hasta 1M tokens, lo que permite analizar documentos extensos, vídeos largos o conversaciones prolongadas.
- Capacidades agénticas: entrenado con RL agéntico y MOPD, puede ejecutar tareas autónomas de múltiples pasos, como planificación y uso de herramientas.
- Generación de código: el backbone de lenguaje hereda las capacidades de MiMo-V2-Flash, que incluyen generación y razonamiento de código.
- Razonamiento matemático y lógico: adecuado para problemas que requieren deducción y cálculo.
- Soporte multilingüe: optimizado para inglés y chino, con posible degradación en otros idiomas.
- Decodificación especulativa: los módulos MTP permiten una inferencia más rápida en comparación con modelos de tamaño similar.

## Casos de uso

- Análisis de vídeo en tiempo real: el modelo puede procesar secuencias de vídeo junto con audio para generar resúmenes, detectar eventos o responder preguntas sobre el contenido, gracias a su ventana de contexto de 1M tokens que permite manejar vídeos largos sin segmentación.
- Asistentes virtuales multimodales: integración en aplicaciones de atención al cliente donde el usuario puede enviar imágenes, capturas de pantalla o mensajes de voz, y el modelo responde de forma coherente manteniendo el contexto de la conversación.
- Agentes autónomos de productividad: uso como núcleo de agentes que pueden leer documentos extensos, extraer información, interactuar con APIs y ejecutar tareas de oficina como redacción de informes o gestión de correos electrónicos.
- Generación y revisión de código en entornos de desarrollo: el modelo puede asistir en la escritura de código, explicar fragmentos existentes o sugerir correcciones, aprovechando su capacidad de razonamiento y su entrenamiento en código.
- Moderación de contenido multimodal: análisis de imágenes, vídeos y texto para detectar contenido inapropiado o ilegal, gracias a su comprensión conjunta de múltiples modalidades.
- Investigación académica en IA: uso como modelo base para fine-tuning en tareas específicas de visión-lenguaje o audio-lenguaje, dado su tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficos comparativos para benchmarks multimodales, de codificación y agénticos, así como de contexto largo, pero no se proporcionan valores concretos en el texto. Por tanto, no es posible presentar una tabla de resultados verificables.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Dado el tamaño del modelo (310B parámetros totales, 15B activos), se puede estimar que:

- Para inferencia en FP8 o cuantizaciones de 4 bits, se necesitaría al menos 80-100 GB de VRAM, lo que requiere GPUs de nivel profesional como A100 (80GB), H100 (80GB) o múltiples GPUs.
- En cuantizaciones más agresivas (por ejemplo, 4 bits), podría caber en una GPU de 48 GB como la A6000 o RTX 6000 Ada, pero con degradación de calidad.
- No es viable en GPUs de consumo (RTX 4090, 24 GB) sin cuantización extrema y pérdida significativa de rendimiento.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o la plataforma API de Xiaomi.
- La latencia y el throughput dependen en gran medida del hardware y la cuantización; no se dispone de datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. Se recomienda consultar benchmarks públicos como Open LLM Leaderboard o Artificial Analysis para comparar con alternativas de tamaño similar (por ejemplo, Mixtral 8x22B, Qwen2.5-MoE o DeepSeek-V3).

## Limitaciones y advertencias

- Idiomas limitados: el modelo está optimizado para inglés y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- Sesgos potenciales: al entrenarse con datos de internet, puede heredar sesgos sociales, culturales o de género presentes en el corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Contexto largo: aunque soporta 1M tokens, el rendimiento puede degradarse en los extremos de la ventana de contexto, y el coste computacional aumenta con la longitud.
- Licencia MIT: permite uso comercial y modificación, pero el usuario es responsable del cumplimiento de las leyes aplicables y de la gestión de datos sensibles.
- Requisitos de hardware elevados: la inferencia local requiere infraestructura de gama alta, lo que puede limitar su adopción en entornos con recursos limitados.
- Actualización de configuración: se recomienda descargar la versión más reciente de `config.json` y `tokenizer_config.json` para evitar degradación del rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.5
- Blog oficial: https://mimo.xiaomi.com/mimo-v2-5
- Plataforma API: https://platform.xiaomimimo.com
- Studio (demo): https://aistudio.xiaomimimo.com
- Repositorio GitHub (referencia): https://github.com/XiaomiMiMo/MiMo
- Página de MiMo-V2.5-Pro: https://mimo.xiaomi.com/mimo-v2-5-pro
