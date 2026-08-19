# vwdubb/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-FP8

## Resumen

El modelo `vwdubb/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-FP8` es un fine tune multi-etapa y multi-fusión del Qwen3.6-27B, desarrollado por vwdubb en colaboración con DavidAU, Nightmedia, TeichAI, armand0e y trohrbaugh. Está diseñado para aumentar la inteligencia general, el razonamiento y el seguimiento de instrucciones sin modificar el núcleo del modelo base, y se presenta como "uncensored" (abliterado) con soporte de visión (pipeline image-text-to-text). Con 27.781 millones de parámetros y licencia Apache 2.0, su relevancia radica en que, según sus autores, supera los 700 puntos ARC-C en cuantización de 8 y 4 bits, un umbral que asocian con modelos cerrados de OpenAI, Claude y Gemini.

Este repositorio contiene los pesos en FP8 (38,5 GB) y sirve como fuente para generar cuantizaciones GGUF (regulares y MTP) con NEO IMATRIX, disponibles en repositorios del autor. El modelo está pensado para hardware de consumo y cubre casos de uso generales: código, razonamiento, escritura creativa y procesamiento de imágenes, aunque su naturaleza sin censura requiere precaución en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.6-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (este repo); GGUF regular y MTP (NEO IMATRIX) en repos del autor |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (este repo); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B y ha sido sometido a un proceso de "multi-stage fine tune, multi-fine tune y multi-stage merge". Se emplearon los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, junto con trazas ligeras de "Fable" (de armand0e), razonamiento de Claude Opus, el dataset interno F451 y datos GPT5 (Polaris, no razonamiento). También se aplicó "heretic'ing" (abliteración de la censura) antes del ajuste. El entrenamiento se realizó en hardware de consumo mediante Unsloth, y cada etapa fue evaluada con pruebas humanas y benchmarks. No se especifican el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento avanzado, con mejoras en seguimiento de instrucciones y resolución de problemas.
- Soporte de visión: al ser image-text-to-text, puede procesar imágenes junto con texto (capturas, diagramas, etc.).
- Modo "thinking" mejorado para tareas de razonamiento multi-paso.
- Sin censura (abliterado): genera contenido que otros modelos rechazarían, incluyendo temas controvertidos.
- Multilingüe: inglés y chino.
- Creatividad en escritura (ficción, roleplaying, guiones), aunque no fue su objetivo principal.
- Compatible con cuantizaciones GGUF de baja precisión sin pérdida significativa de rendimiento, según el autor.

## Casos de uso

- Asistente de programación: puede generar, revisar y depurar código con razonamiento avanzado, integrándose en flujos de desarrollo locales o en CI/CD.
- Análisis de documentos con imágenes: al soportar visión, permite extraer información de capturas de pantalla, diagramas o formularios escaneados.
- Creación de contenido creativo: escritura de ficción, diálogos, roleplaying y guiones, con estilo "sin filtros" que puede resultar útil para autores que buscan tonos provocativos.
- Agente conversacional sin restricciones: para entornos controlados donde se requiere libertad de expresión (por ejemplo, investigación de sesgos o generación de contenido adulto), siempre con moderación posterior.
- Resolución de problemas complejos: matemáticas, lógica, planificación y tareas que exigen razonamiento multi-paso.
- Herramienta de investigación: para estudiar los efectos de la abliteración y el ajuste multi-etapa en modelos de 27B, comparando con el base y con variantes MoE.

## Benchmarks y rendimiento

La model card reporta que el modelo supera los 700 puntos ARC-C en cuantización de 8 y 4 bits (de ahí el "711" en el nombre). Según sus autores, supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y supera los 7 benchmarks de Qwen3.6-35B-A3B. No se proporcionan valores numéricos de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado |
|---|---|
| ARC-C (8 bit) | >700 (según el autor) |
| ARC-C (4 bit) | >700 (según el autor) |
| Comparación con Qwen3.6-27B base | Superior en 6/7 benchmarks, igual en 1/7 |
| Comparación con Qwen3.6-35B-A3B | Superior en 7/7 benchmarks |

## Requisitos de hardware

- FP8 (este repo): ~28 GB de VRAM para los pesos, más overhead de inferencia. Requiere GPU con al menos 32 GB (A100, H100, o RTX 4090 con 24 GB no es suficiente para FP8 completo).
- GGUF 4 bit: ~14-16 GB, cabe en GPUs de consumo como RTX 3090/4090 (24 GB).
- GGUF 8 bit: ~28-30 GB, requiere GPU de 32 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-C (según autor) | Licencia |
|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 27,8B | No disponible | >700 | Apache 2.0 |
| Qwen3.6-27B (base) | 27B | No disponible | Inferior (6/7 benchmarks) | Apache 2.0 |
| Qwen3.6-35B-A3B (MoE) | 35B total, 3B activos | No disponible | Inferior (7/7 benchmarks) | Apache 2.0 |

## Limitaciones y advertencias

- Al ser "uncensored" (abliterado), puede generar contenido ofensivo, ilegal o dañino. No es apto para producción sin moderación humana o filtros adicionales.
- Solo soporta inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas factuales.
- No se especifica la longitud de contexto, lo que limita su uso en tareas de contexto largo sin verificación previa.
- La abliteración puede degradar el rendimiento en tareas de seguridad o alineación, aunque los autores afirman que no afecta al núcleo.
- No hay benchmarks independientes verificados; los datos provienen del autor y no han sido replicados por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vwdubb/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-FP8
- Repo del partner (Nightmedia): https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451
- Quants GGUF NEO MAX (MTP y regulares): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
