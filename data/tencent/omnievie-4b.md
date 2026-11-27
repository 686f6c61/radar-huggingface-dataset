# tencent/OmniEVIE-4B

## Resumen

OmniEVIE-4B es un modelo de recuperación (retrieval) multimodal y multi-vector desarrollado conjuntamente por el Tencent IMA Product Center y el Tencent Youtu Lab. Se construye sobre el modelo base Qwen/Qwen3.5-4B mediante ajuste fino y añade un cabezal de proyección y un mecanismo de compresión de tokens orientado a búsqueda semántica a gran escala, en lugar de generación de texto. Resuelve el problema de recuperar evidencia precisa (una celda de una tabla, un intervalo de vídeo, una cláusula enterrada en un documento) sobre corpus multimodales de millones de registros con latencias de milisegundos.

El modelo ocupa el primer puesto del MMEB-Leaderboard (excluyendo audio) en 190 tareas, según la model card, y lidera las categorías Visual Doc (84,70), Text (52,97) y Agent (54,14). Un único checkpoint ofrece dos modos de inferencia: Full, que conserva todos los tokens a 2048 dimensiones sin comprimir (puntuación 60,68), y Compressed, que destila cada documento en como máximo 128 vectores de 64 dimensiones en int8 (puntuación 60,06), con un índice de 8,82 GiB por millón de registros.

La relevancia actual reside en su combinación de precisión de recuperación y eficiencia de almacenamiento: permite búsqueda sobre un millón de registros en 54,2 ms en un solo hilo de CPU, con localización espacial (región de página) o temporal (segundo de vídeo) directamente desde el resultado del `argmax`, sin necesidad de modelos OCR o de captioning externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con capas de atención bidireccional completa; cabezal Prefix-MRL y compresión ST-HAC |
| Parametros totales | 4.544.510.464 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos principales); índices de recuperación en int8 (vectores comprimidos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `query_gate.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y sustituye el comportamiento generativo por un codificador de embeddings con atención bidireccional completa, adecuado para representaciones de secuencia completa. Incorpora tres componentes técnicos destacables: una proyección Prefix-MRL que permite dimensiones elásticas en tiempo de ejecución ({64, 128, 256, 512, 1024, 2048}) desde un único cabezal; un pipeline de clustering espacio-temporal Ward (ST-HAC) que agrupa tokens en hasta 128 centroides por documento, con renormalización esférica de centroides; y una puerta de saliencia de consulta aprendida (`query_gate.safetensors`, con umbral τ = 0,6 y margen de ruido θ = 0,38) que pondera qué tokens de la consulta contribuyen a la coincidencia.

El entrenamiento se realizó sobre los conjuntos TIGER-Lab/MMEB-V2 y vidore/vidore_benchmark_v3, según los metadatos del repositorio. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona la compresión a vectores int8 de 64 dimensiones (K128×d64 o K32×d64) como parte del pipeline de inferencia, no como un paso de cuantización de pesos.

## Capacidades

- Recuperación multimodal unificada: texto, imagen natural, documento visual (páginas, tablas, gráficos), vídeo nativo y agentes/herramientas/GUI/memoria.
- Interacción tardía multi-vector (estilo ColBERT) con coincidencia a nivel de token.
- Dimensiones elásticas en tiempo de ejecución mediante Prefix-MRL (64 a 2048 dimensiones).
- Compresión de documentos a un máximo de 128 × 64D en int8, con localización de evidencia (bounding box de página o intervalo temporal de vídeo) directamente desde el `argmax`.
- Recuperación de documentos visuales de alta densidad (tablas, gráficos, formularios) sin OCR externo.
- Localización de momentos en vídeo nativo (intervalos y marcas de tiempo) sin modelos de captioning.
- Soporte de tareas de agente: recuperación sobre trayectorias, herramientas, GUI y memoria.
- No es un modelo generativo: no produce texto libre ni razonamiento conversacional; su salida son representaciones vectoriales.

## Casos de uso

- Búsqueda documental empresarial: indexación de millones de páginas escaneadas con recuperación de la región exacta de la página que contiene la respuesta, útil en auditoría y compliance donde se exige citar la fuente visual.
- Recuperación en vídeo largo: localización del instante exacto (marca de tiempo) en clips de varios minutos a partir de una consulta textual, aplicable a archivos audiovisuales, vigilancia o análisis de reuniones.
- Atención al cliente con base de conocimiento multimodal: recuperación de fragmentos de manuales, tablas de precios o capturas de pantalla relevantes para alimentar un sistema RAG, con latencia de milisegundos sobre corpus grandes.
- Búsqueda en documentación técnica y financiera: localización de cláusulas o cifras enterradas en tablas densas, con coincidencia a nivel de token y compresión int8 que reduce el coste de almacenamiento a 8,82 GiB por millón de registros.
- Agentes autónomos con memoria: recuperación de trayectorias previas, estados de GUI y herramientas usadas en tareas multi-paso, gracias al track Agent del MMEB (54,14).
- Moderación y descubrimiento de contenido visual: búsqueda de imágenes o fotogramas similares a una descripción textual a escala de millones de elementos con un solo hilo de CPU.
- Sistemas de recomendación multimodal: emparejamiento entre consultas textuales y catálogos de imágenes o vídeo con dimensión de embedding ajustable según el presupuesto de latencia.

## Benchmarks y rendimiento

Datos publicados en la model card (MMEB-Leaderboard, instantánea del 2026-11-24):

| Metrica | Full (2048D) | Compressed (≤128 × 64D int8) |
|---|---|---|
| Puntuación global MMEB (no audio) | 60,68 | 60,06 |
| Visual Doc | 84,70 | no disponible |
| Text | 52,97 | no disponible |
| Agent | 54,14 | no disponible |
| Latencia de búsqueda (1M registros, 1 hilo CPU) | no disponible | 54,2 ms |
| Latencia de búsqueda (5M registros, 1 hilo CPU) | no disponible | 120,2 ms |
| Huella de índice por 1M registros | no disponible | 8,82 GiB (K128×d64) / 2,15 GiB (K32×d64) |

Resultados adicionales de localización en vídeo (QVHighlights val, 1.083 consultas): 78,0 % de acierto del pico dentro del segmento, 94,3 % de intersección de intervalo, con un 18 % de duración media del intervalo. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 9,1 GB (tamaño del repositorio), por lo que se recomienda un mínimo de 10-12 GB de VRAM para el checkpoint completo, más memoria para activaciones.
- GPU recomendadas: A100, H100 o L40S para indexación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para el modelo completo en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM en BF16; con cuantización adicional (no documentada oficialmente) podría reducirse el requisito.
- Opciones de despliegue: la librería indicada es `sentence-transformers`; el repositorio incluye CLI y código en github.com/Tencent/OmniEVIE. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de embeddings y no generativo.
- Latencia y throughput: búsqueda de 54,2 ms sobre 1M registros y 120,2 ms sobre 5M en un solo hilo de CPU con el índice comprimido; no se dispone de datos de throughput de codificación por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| OmniEVIE-4B | 4,54B | no disponible | Texto, imagen, documento visual, vídeo, agente | Apache-2.0 | Top 1 MMEB no audio; compresión int8 con localización de evidencia |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Texto | no disponible | Modelo generativo base; no es un recuperador multimodal |
| Alternativas multimodales de recuperación de ~9,4B | ~9,4B | no disponible | Multimodal | no disponible | La model card indica que OmniEVIE-4B supera a baselines de 9,4B en el MMEB |

No se dispone en la información proporcionada de especificaciones detalladas de modelos comparables adicionales (por ejemplo, variantes de ColBERT multimodales o recuperadores visuales de otros laboratorios) para completar una comparativa más amplia.

## Limitaciones y advertencias

- No es un modelo generativo: no debe emplearse para chat, razonamiento libre ni generación de código.
- Riesgo de alucinación no aplica en el sentido generativo, pero la recuperación puede devolver coincidencias espurias en corpus ruidosos; la puerta de saliencia y el margen de ruido mitigan pero no eliminan este riesgo.
- Idiomas soportados no documentados explícitamente; la model card menciona capacidades cross-lingual en la localización, pero sin lista oficial de idiomas.
- Longitud de contexto no especificada; el rendimiento en documentos o vídeos muy largos puede degradarse fuera de los rangos evaluados (clips de 150 segundos en QVHighlights).
- La compresión int8 a 128 × 64D implica una pérdida mínima de puntuación (60,68 → 60,06), pero puede afectar a casos de recuperación muy fina no cubiertos por los benchmarks.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `LICENSE.txt` y las condiciones de los datasets de entrenamiento (MMEB-V2, ViDoRe) para cumplimiento en producción.
- Los benchmarks reportados provienen de la propia model card; no se han verificado de forma independiente en la información disponible.
- El despliegue en producción requiere infraestructura de indexación vectorial (índices int8 multi-vector) que no se detalla en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/OmniEVIE-4B
- Repositorio GitHub: https://github.com/Tencent/OmniEVIE
- Informe técnico (arXiv): https://arxiv.org/abs/2611.32203
- Leaderboard MMEB: https://huggingface.co/spaces/TIGER-Lab/MMEB-Leaderboard
- Dataset MMEB-V2: https://huggingface.co/datasets/TIGER-Lab/MMEB-V2
- Dataset ViDoRe Benchmark v3: https://huggingface.co/datasets/vidore/vidore_benchmark_v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
