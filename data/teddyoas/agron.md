# teddyoas/Agron

## Resumen

Agron es un modelo de lenguaje de tipo LLaMA con aproximadamente 50,3 millones de parámetros (50.340.352 según los pesos en safetensors), publicado por el usuario teddyoas en HuggingFace. No es un modelo entrenado desde cero ni un modelo conversacional: se trata de un checkpoint de *continued pretraining* de dominio, resultado de una época completa adicional sobre código fuente, contenido de ciberseguridad y una pequeña mezcla de replay de WikiText-2 para mitigar el olvido catastrófico. El punto de partida fue un checkpoint previo de Agron ya publicado por el mismo autor.

Su relevancia es acotada pero clara: es un experimento reproducible y de coste muy bajo (una sola Tesla T4 en fp16, unos 61 minutos, 118,7 millones de tokens) que documenta de forma transparente la receta, las métricas de pérdida antes y después y los ficheros de evaluación. Sirve como caso de estudio de ajuste de dominio sobre un modelo pequeño, no como alternativa a modelos de propósito general.

Conviene subrayar que es un modelo base (*base model*), sin ajuste por instrucciones ni RLHF/DPO, entrenado únicamente con textos en inglés y con una longitud de secuencia de entrenamiento de 512 tokens. Su utilidad práctica está en la experimentación, la docencia y la generación de texto técnico especializado a pequeña escala, no en producción conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo LLaMA (etiqueta `llama` en el repo) |
| Parámetros totales | 50.340.352 (~50,3 M) |
| Parámetros activos | no aplica (no es MoE, es denso) |
| Longitud de contexto | no disponible en la información proporcionada; la longitud de secuencia usada en entrenamiento es 512 tokens |
| Tipos de cuantización | no se publican pesos cuantizados; al ser safetensors en fp16/fp32 se puede convertir a GGUF/INT8/INT4 con herramientas externas |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`, `generation_config.json` |
| Tokenizador | `tokenizer.json`, `tokenizer_config.json` (vocabulario no detallado) |
| Tokens de entrenamiento (esta época) | 118,7 M |
| Pasos | 7.246 (1 época completa), batch efectivo 32 (16 x 2 de acumulación) |
| Optimizador / LR | AdamW fused, 3e-4 con schedule coseno y warmup de 100 pasos |
| Hardware de entrenamiento | 1x NVIDIA Tesla T4 en fp16, ~61 minutos |
| Pérdida media de entrenamiento | 1,319 |
| Tamaño del repositorio | 4,5 GB (incluye artefactos de evaluación y curvas, no solo los pesos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo LLaMA, denso, de unos 50,3 M de parámetros. El autor no detalla en la model card el número de capas, dimensiones ocultas ni cabezas de atención, por lo que esos hiperparámetros figuran como no disponibles. Tampoco se especifica la longitud máxima de posiciones del checkpoint original, solo la longitud de secuencia empleada durante este entrenamiento (512 tokens).

El entrenamiento consiste en una época completa de *continued pretraining* sobre un corpus mezclado en tiempo de ejecución a partir de flujos planos de tokens: código mayoritario extraído de `codeparrot/github-code` filtrado por extensiones habituales (.py, .js, .ts, .java, .c, .cpp, .go, .rs, .cs, .sh, .sql, entre otras) con unos 150 M de caracteres; contenido de ciberseguridad de `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset` (formato system/user/assistant) con unos 120 M de caracteres; y replay de `Salesforce/wikitext-2-raw-v1` con unos 15 M de caracteres. El corpus se construye con el script `prepare_domain_corpus.py` del repositorio de GitHub. No se menciona uso de RLHF, DPO ni ninguna fase de alineación; tampoco innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada por prefijo (modelo base, sin formato instruccional).
- Continuación y autocompletado de código en lenguajes habituales (Python, JavaScript, TypeScript, Java, C, C++, Go, Rust, C#, shell, SQL), por el sesgo del corpus de preentrenamiento.
- Generación de texto técnico relacionado con ciberseguridad (descripciones, procedimientos, explicaciones), derivada del dataset de instrucciones incluido en el corpus.
- Modelo de dominio: la pérdida sobre código y ciberseguridad se reduce respecto al checkpoint anterior (ver sección de rendimiento).
- No soporta *tool calling* ni *function calling* de forma nativa: no hay plantilla de herramientas ni ajuste para ello en la información disponible.
- No soporta razonamiento multi-paso guiado ni modo *thinking*; no hay evidencia de capacidades de agente.
- Multilingüe: no. Solo inglés declarado; no se documenta transferencia a otros idiomas.
- Sin capacidades de visión, audio ni multimodales.

## Casos de uso

- Estudio de ajuste de dominio: reproducir la receta (corpus mezclado, LR 3e-4, coseno, 1 época) sobre un modelo de 50 M en una T4 para medir olvido catastrófico con y sin replay de WikiText. El repo incluye `eval_before.json`, `eval_history.json` y `report.json` para comparar.
- Docencia y cursos de LLM: ejemplo completo y de bajo coste de un pipeline de preentrenamiento continuado, desde la construcción del corpus (`prepare_domain_corpus.py`) hasta la evaluación held-out por dominio.
- Autocompletado de código en entornos con recursos mínimos: al ocupar del orden de 100 MB en fp16, puede ejecutarse en CPU o en GPUs integradas para sugerencias locales sin conexión, aceptando la limitación de 512 tokens de ventana de entrenamiento.
- Generación de texto auxiliar en herramientas de seguridad: borradores de descripciones de vulnerabilidades, resúmenes de procedimientos o texto de documentación técnica interna, siempre con revisión humana dada la tasa de alucinación esperable en un modelo de este tamaño.
- *Baseline* de comparación en experimentos de escalado: punto de referencia de 50 M de parámetros frente a modelos mayores para aislar el efecto del tamaño frente al del dominio en tareas de código.
- Pruebas de infraestructura de inferencia: banco de pruebas ligero para validar pipelines de transformers, conversión a GGUF o servicios de generación antes de desplegar modelos mayores.
- Generación de datos sintéticos a pequeña escala para filtrar o aumentar corpus de dominio, con validación posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta evaluación held-out en pérdida y perplejidad, antes y después del entrenamiento de dominio:

| Fuente | Antes (loss / PPL) | Después (loss / PPL) | Delta |
|---|---|---|---|
| Código | 1,453 / 4,28 | 1,245 / 3,47 | -0,208 |
| Ciberseguridad | 1,358 / 3,89 | 1,064 / 2,90 | -0,294 |
| Replay (WikiText-2) | 5,626 / 277,6 | 5,024 / 152,0 | -0,602 |

Datos de entrenamiento asociados: pérdida media 1,319 en 7.246 pasos, 118,7 M de tokens y 1 época. No se aportan métricas de generación (exactitud, pass@k) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~100 MB en fp16, ~200 MB en fp32, ~50 MB en INT8 y ~25-30 MB en INT4 para los pesos. El coste real de memoria lo dominan el contexto y el *runtime*, no los pesos.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM; una Tesla T4 es suficiente y fue el hardware usado para entrenar. Funciona también en RTX 4090, RTX 3060 o GPUs integradas sin problema.
- Cabe holgadamente en GPU de consumo (RTX 3050/4060, GTX 1660, etc.) y también en CPU; es viable incluso en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: `transformers` (referencia oficial, con `AutoModelForCausalLM`), conversión a GGUF para `llama.cpp`, uso en Ollama mediante Modelfile propio y despliegue con vLLM o TGI (soportado por el formato, aunque sobredimensionado para 50 M de parámetros).
- Latencia y throughput: no disponible. No se publican mediciones; en la práctica estará limitado por el tokenizador y el bucle de decodificación más que por el cómputo del modelo.
- Nota: el repositorio ocupa 4,5 GB, muy por encima de los ~100 MB de los pesos en fp16; probablemente incluye checkpoints intermedios y artefactos de evaluación. Conviene revisar los ficheros antes de descargar.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de Agron que permitan una comparación cuantitativa. La tabla recoge solo los campos verificables; el resto se marca como no disponible.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Benchmarks públicos |
|---|---|---|---|---|---|
| Agron (teddyoas) | ~50,3 M | no disponible (entrenado a 512) | Base de dominio: código + ciberseguridad | MIT | No disponibles (solo pérdida/PPL held-out) |
| SmolLM-135M (HuggingFace) | ~135 M | no contrastado en la información disponible | Base generalista pequeño | Apache 2.0 (según su model card) | No contrastados aquí |
| Qwen2.5-0.5B (Alibaba) | ~494 M | no contrastado en la información disponible | Base/instrucción multilingüe | Apache 2.0 (según su model card) | No contrastados aquí |
| TinyLlama-1.1B (proyecto comunitario) | ~1,1 B | no contrastado en la información disponible | Base/chat en inglés | Apache 2.0 (según su model card) | No contrastados aquí |

Los tres alternativos son entre 2,7 y 22 veces más grandes, por lo que la comparación realista es de orden de magnitud y de propósito: Agron es un experimento de dominio reproducible y de licencia MIT, mientras que los otros son modelos generalistas con ecosistema y evaluaciones publicadas. Los datos de los modelos alternativos no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni alineado (sin RLHF/DPO/SFT final): no debe esperarse comportamiento de chat ni seguimiento fiable de instrucciones.
- Tamaño muy reducido (50,3 M): coherencia limitada más allá de unas pocas decenas de tokens, razonamiento aritmético y lógico débil y alta tasa de alucinación en hechos concretos.
- Ventana de entrenamiento de 512 tokens; la longitud de contexto máxima del checkpoint no está documentada, por lo que usar contextos largos es arriesgado.
- Solo inglés: no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de sesgos heredados de los corpus utilizados: `codeparrot/github-code` (código público con posibles sesgos de estilo, licencias y calidad variable) y el dataset de ciberseguridad de Trendyol, que puede contener contenido ofensivo o procedimientos peligrosos.
- El corpus de ciberseguridad proviene de un dataset de *instruction tuning*, pero el modelo se entrena solo como preentrenamiento continuado; el formato system/user/assistant aparece en el texto, lo que puede inducir a generar respuestas que parezcan instrucciones sin serlo.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; aun así, la responsabilidad sobre las salidas generadas recae en el usuario.
- Advertencia sobre la información externa: los resultados de búsqueda web asociados a este nombre mezclan referencias no relacionadas (un supuesto sistema de agentes llamado "Agron" y el modelo propietario Gemini 4 Argon de Google). No deben atribuirse a este checkpoint.
- El autor no documenta hiperparámetros de arquitectura ni el checkpoint de partida exacto, lo que dificulta la replicación completa.
- No recomendado como componente crítico en producción sin una evaluación propia y sin supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teddyoas/Agron
- Repositorio de GitHub con el script de corpus: https://github.com/Njap-png/Agron/blob/main/prepare_domain_corpus.py
- Repositorio de GitHub (raíz): https://github.com/Njap-png/Agron
- Artefactos de evaluación citados en la model card: `report.json`, `eval_history.json`, `eval_before.json`, `samples.json` y `domain_pretraining_curve.png` (accesibles desde la raíz del repo en HuggingFace)
- Dataset de código: https://huggingface.co/datasets/codeparrot/github-code
- Dataset de ciberseguridad: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset de replay: https://huggingface.co/datasets/Salesforce/wikitext-2-raw-v1
- Paper, blog o demo oficial: no disponible en la información proporcionada
