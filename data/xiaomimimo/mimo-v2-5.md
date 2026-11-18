# XiaomiMiMo/MiMo-V2.5

## Resumen

MiMo-V2.5 es un modelo omni-modal nativo desarrollado por XiaomiMiMo (Xiaomi), diseñado para comprender texto, imagen, vídeo y audio dentro de una única arquitectura. Se construye sobre el backbone de MiMo-V2-Flash, un modelo de mezcla de expertos (MoE) disperso, y añade codificadores dedicados de visión y audio. Con 310.000 millones de parámetros totales y 15.000 millones activados por token, se posiciona en la gama alta de modelos abiertos con capacidades agénticas y de contexto largo.

La innovación principal reside en su atención híbrida: intercala atención de ventana deslizante (SWA) y atención global en una proporción 5:1 con ventana de 128 tokens, lo que reduce el almacenamiento de la caché KV casi 6 veces manteniendo el rendimiento en contextos largos gracias a un sesgo de attention sink aprendible. El modelo soporta hasta 1 millón de tokens de contexto y fue preentrenado con aproximadamente 48 billones de tokens en precisión mixta FP8.

Su relevancia actual radica en combinar percepción multimodal nativa (vídeo y audio incluidos), razonamiento de contexto largo y capacidades agénticas en un único modelo con licencia MIT, lo que facilita su adopción tanto en investigación como en productos comerciales. La disponibilidad de una variante Base de 256K tokens y de la versión completa de 1M amplía los escenarios de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (1 capa densa + 47 capas MoE), atención híbrida SWA/Global 5:1 |
| Parametros totales | 310B |
| Parametros activos | 15B |
| Longitud de contexto | Hasta 1M tokens (variante Base: 256K) |
| Tipos de cuantizacion | FP8 (preentrenamiento en precisión mixta FP8); no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 315,7 GB) |
| Hidden size | 4096 |
| Numero de capas | 48 (1 densa + 47 MoE) |
| Capas de atención global | 9 |
| Capas SWA | 39 |
| Cabeceras de atención | 64 |
| Cabeceras KV | 8 (GQA) |
| Codificador de visión | ViT de 729M parámetros (28 capas: 24 SWA + 4 Full) |
| Codificador de audio | Transformer de 261M parámetros (24 capas: 12 SWA + 12 Full) |
| Multi-Token Prediction | 329M parámetros, 3 capas |
| Ventana deslizante | 128 tokens |
| Tokens de preentrenamiento | ~48T |

## Arquitectura y entrenamiento

El backbone lingüístico es un transformer MoE disperso con 48 capas (una densa y 47 MoE), hidden size de 4096, 64 cabeceras de atención y 8 cabeceras KV con GQA. La atención híbrida intercala 39 capas de ventana deslizante (ventana de 128 tokens) con 9 capas de atención global en proporción 5:1, lo que reduce el coste de la caché KV en aproximadamente 6 veces y permite sostener contextos de hasta 1M tokens mediante un sesgo de attention sink aprendible.

Sobre el backbone se añaden codificadores nativos: un ViT de 729M parámetros con atención de ventana híbrida para imagen y vídeo, y un codificador de audio de 261M parámetros inicializado desde los pesos de MiMo-Audio. El modelo incorpora tres módulos ligeros de Multi-Token Prediction (MTP) de 329M parámetros con FFN densas, que aceleran la inferencia mediante decodificación especulativa y mejoran la eficiencia del entrenamiento con RL. El preentrenamiento se realizó sobre ~48T tokens en FP8 de precisión mixta; el post-entrenamiento combina SFT, RL agéntico a gran escala y destilación on-policy multi-profesor (MOPD).

## Capacidades

- Generación de texto y razonamiento de contexto largo hasta 1M tokens.
- Comprensión de imágenes mediante ViT dedicado de 729M parámetros.
- Comprensión de vídeo con el mismo codificador visual de ventana híbrida.
- Comprensión de audio con codificador dedicado de 261M parámetros inicializado desde MiMo-Audio.
- Capacidades agénticas: flujos multi-paso y razonamiento agéntico entrenado con RL a gran escala.
- Razonamiento y generación de código, con benchmarks específicos de coding y agentes publicados por el autor.
- Soporte multilingüe limitado a inglés y chino según la model card.
- Decodificación especulativa mediante módulos MTP para acelerar la inferencia.
- No se detalla en la información disponible soporte explícito de tool calling o function calling.

## Casos de uso

- Análisis de vídeo a gran escala: el codificador ViT de ventana híbrida permite procesar secuencias de vídeo junto con el backbone de 1M de tokens para resumir o extraer eventos en grabaciones largas.
- Transcripción y análisis de audio con contexto: el codificador de audio de 261M parámetros permite combinar audio con texto e imagen en una misma conversación, útil en actas de reuniones o análisis de llamadas.
- Agentes autónomos multi-paso: el entrenamiento con RL agéntico y MOPD lo hace adecuado para pipelines donde el modelo planifica, ejecuta y verifica tareas encadenadas.
- Asistentes de documentación técnica multimodal: con contexto de 1M tokens puede ingerir manuales, diagramas e imágenes y responder consultas cruzadas en inglés o chino.
- Generación y revisión de código en producción: los benchmarks de coding publicados por el autor lo sitúan como candidato para integración en pipelines de CI/CD y revisión automatizada.
- Razonamiento sobre grafos y documentos largos: los benchmarks de Graphwalks y contexto largo indican uso en análisis de bases de conocimiento y documentación extensa.
- Investigación en modelos omni-modales: la licencia MIT y la disponibilidad de la variante Base de 256K facilitan experimentación académica y ajuste fino.

## Benchmarks y rendimiento

El autor publica resultados en formato de imágenes (multimodal, coding/agent y Graphwalks) en la model card, pero no se proporcionan los valores numéricos en la información disponible. No se han publicado resultados de benchmarks en formato tabular en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 310B parámetros totales y 15B activos, el peso en FP8 ronda los 310 GB, por lo que se requiere hardware de centro de datos.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, se orienta a clústeres con GPUs de centro de datos (A100/H100 o superiores) en configuración multi-GPU.
- No cabe en GPUs de consumo (RTX 4090 y similares) por el tamaño total de parámetros y el repo de 315,7 GB.
- Opciones de despliegue: la model card indica compatibilidad con transformers y código personalizado (custom_code); no se detallan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa mediante MTP está diseñada para acelerar la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Multimodalidad |
|---|---|---|---|---|
| MiMo-V2.5 | 310B / 15B | 1M | MIT | Texto, imagen, vídeo, audio |
| MiMo-V2.5-Pro | 1,02T / 42B | no disponible | no disponible | no disponible |
| MiMo-V2.5-Base | no disponible | 256K | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks numéricos ni de otros modelos comparables de la misma categoría (omni-modales abiertos de ~300B) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los codificadores y pesos derivados (MiMo-Audio) citados en la model card.
- Aviso del autor: los archivos `config.json` y `tokenizer_config.json` se actualizaron tras el commit 4da2748; usar versiones antiguas puede degradar el rendimiento. Es necesario re-descargar ambos archivos.
- El tamaño del repo (315,7 GB) y los 310B parámetros totales implican requisitos de infraestructura elevados y costes de inferencia significativos.
- No se detalla soporte explícito de tool calling en la información disponible, lo que debe verificarse antes de usarlo en pipelines agénticos que dependan de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.5
- Variante Base: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Base
- ModelScope (Base): https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.5-Base
- ModelScope (V2.5): https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.5
- Blog: https://mimo.xiaomi.com/mimo-v2-5
- Plataforma API: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Repositorio MiMo-V2-Flash: https://github.com/XiaomiMiMo/MiMo-V2-Flash
- Repositorio MiMo: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Commit de actualización de config: https://huggingface.co/XiaomiMiMo/MiMo-V2.5/commit/4da2748fc0a0123d817280b1b0cd3682a487a161
