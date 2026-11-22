# SZLHOLDINGS/SZL-Reasoning-0.8B-v1

## Resumen

SZL-Reasoning-0.8B-v1 es un modelo de lenguaje de 873 millones de parámetros publicado por SZLHOLDINGS, un "estate" de IA gobernada que agrupa modelos, datasets y Spaces con resultados verificables mediante ficheros de recibo (receipts) auditables. El modelo se presenta como un artefacto de razonamiento afinado a partir de un modelo base propio de la misma organización (SZL-Reasoning deriva de `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`), construido sobre la arquitectura `qwen3_5` según la etiqueta del repositorio.

La propuesta del autor no es competir en benchmarks de frontera, sino ofrecer un modelo pequeño, con licencia Apache 2.0 y trazabilidad documental: cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un recibo fechado se marca explícitamente como UNKNOWN en la model card. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada, aunque la información pública disponible no detalla la torre visual ni el preprocesado de imagen.

Por su tamaño (0,8B) y su contexto de publicación, el modelo encaja en escenarios de despliegue en hardware modesto, prototipado de agentes con razonamiento multi-paso y pipelines donde la auditabilidad del artefacto importa tanto como el rendimiento bruto. La información publicada es deliberadamente escasa en cifras: no hay tabla de benchmarks, ni especificación de longitud de contexto, ni detalle del dataset de entrenamiento más allá de las referencias a los recibos del estate.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia `qwen3_5`, según tag del repo); detalles internos no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors, admite cuantización posterior con herramientas estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (inglés, según metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 |
| Tamaño del repositorio | 1,8 GB |
| Librería | transformers |
| Descargas | 582 |
| Likes | 0 |
| Fecha de creación | 2026-11-06 |
| Última actualización | 2026-11-20 |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5` del repositorio sitúa el modelo en la familia arquitectónica Qwen 3.5, es decir, un transformer decoder-only con los componentes habituales de atención multi-cabeza y capas feed-forward. El pipeline `image-text-to-text` indica que el artefacto acepta entrada de imagen además de texto, aunque la model card no describe la torre visual, el proyector multimodal ni la resolución de entrada. El recuento real de parámetros en safetensors (873.438.784) es coherente con un modelo de menos de mil millones de parámetros.

El entrenamiento se presenta como una cadena dentro de una "fábrica gobernada": el modelo parte de un SFT previo de la propia organización (`szl-receiptagent-qwen35-0.8b-sft-v3`) y se afina para razonamiento. No se publican en la card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o RL con verificación. El autor declara explícitamente que cualquier afirmación de entrenamiento o evaluación no respaldada por un recibo fechado debe considerarse UNKNOWN, y que no se afirma ningún número de benchmark más allá de lo medido en una auditoría con fecha. La innovación declarada no es algorítmica sino de gobernanza: SVG deterministas generados desde una instantánea de auditoría (2026-11-20T03:48:04Z, marcada como MEASURED) y un identificador de card verificable.

## Capacidades

- Generación de texto y razonamiento: el nombre del modelo y su linaje (afinado desde un SFT) apuntan a un ajuste orientado a tareas de razonamiento, aunque no se detallan modos explícitos de "thinking" ni presupuestos de cómputo.
- Procesamiento de imagen y texto: el pipeline `image-text-to-text` implica capacidad de recibir imágenes junto a instrucciones textuales; sin especificación pública de resolución, número de parches o tareas visuales soportadas.
- Multilingüismo: limitado al inglés según los metadatos del repositorio; no se declara soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no disponible en la información publicada.
- Agentes y razonamiento multi-paso: no se documenta un protocolo de agente, pero el linaje desde un modelo "receiptagent" sugiere un uso previsto en flujos con herramientas y verificación.
- Capacidades especiales (audio, vídeo, visión documental): no disponibles salvo la entrada de imagen implícita en el pipeline.

## Casos de uso

- Prototipado de agentes con verificación documental: el modelo puede integrarse en flujos donde cada paso genere un recibo auditable, aprovechando el linaje desde un modelo orientado a agentes de recibos y su licencia Apache 2.0 para modificación libre.
- Extracción de información de documentos con imagen: al aceptar entrada image-text, puede emplearse para leer capturas, formularios o tickets y devolver texto estructurado, siempre que se valide la calidad visual con datos propios, ya que no hay métricas publicadas.
- Despliegue en hardware de gama consumer: con 873M parámetros y pesos safetensors de 1,8 GB, cabe en GPUs de 8-12 GB en precisión completa y en 4-6 GB tras cuantización a 4 bits, lo que permite ejecutarlo en estaciones de trabajo sin aceleradores de datacenter.
- Filtrado y clasificación de contenido en pipelines ETL: su tamaño reducido permite procesar lotes grandes con latencia baja y coste contenido, usando el modelo como clasificador o generador de etiquetas antes de un modelo mayor.
- Base para fine-tuning específico de dominio: al ser un modelo pequeño con licencia permisiva, sirve como punto de partida para ajustes supervisados en dominios verticales (legal, financiero, soporte) con presupuestos de cómputo limitados.
- Evaluación de gobernanza y trazabilidad de modelos: útil como caso de estudio de model cards con recibos auditables, para equipos que necesitan demostrar procedencia y verificabilidad de artefactos en entornos regulados.
- Generación de borradores y resúmenes en inglés: adecuado para tareas de redacción asistida en inglés donde no se requiera un modelo de frontera, con la advertencia de que no se declara soporte de castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número más allá de lo medido en una auditoría fechada, y que los datos no respaldados por recibos se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16/bf16 (tamaño de los pesos), 3-4 GB con overhead de activaciones y KV cache para contextos moderados; en cuantización de 8 bits, en torno a 1 GB; en 4 bits, en torno a 0,5-0,7 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar el modelo en fp16 con holgura; en cuantización 4 bits cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050). Para despliegue en servidor, A100, H100 o L40S ofrecen margen para batching.
- Cabe en GPU consumer: sí, en todas las gamas mencionadas, incluso en iGPU con suficiente memoria compartida si se usa cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving con batching, llama.cpp/Ollama tras conversión a GGUF, y cuantización con bitsandbytes, AWQ o GPTQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Benchmark publicado |
|---|---|---|---|---|---|
| SZL-Reasoning-0.8B-v1 | 873M | no disponible | Apache 2.0 | Sí (image-text-to-text) | No |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | hasta 32K en variantes | Apache 2.0 | No (variantes VL aparte) | Sí, en model card |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | No (variante 11B vision aparte) | Sí, en model card |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | No | Sí, en model card |

La comparación se limita a datos públicos de cada familia; SZL-Reasoning-0.8B-v1 no publica cifras de contexto ni de rendimiento, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni de tareas multimodales, lo que impide estimar su calidad relativa frente a alternativas de tamaño similar.
- Idiomas: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente degradado.
- Contexto desconocido: no se especifica la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a modelos de este tamaño; sin evaluación publicada no puede acotarse su tasa de error factual.
- Capacidad multimodal no documentada: el pipeline image-text-to-text no viene acompañado de especificación de la torre visual, resolución de entrada ni tareas evaluadas.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o evaluación de seguridad.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el origen de los datos de entrenamiento ni sobre el cumplimiento de derechos de terceros en los pesos.
- Madurez del artefacto: 582 descargas y 0 likes en el momento de la consulta; es un modelo reciente (noviembre de 2026) sin validación independiente conocida.
- Dependencia de recibos externos: las afirmaciones de entrenamiento y evaluación remiten a ficheros de recibo del estate; si no se accede a ellos, la mayor parte de la información técnica queda como UNKNOWN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Reasoning-0.8B-v1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Repositorio de generación de cards: https://github.com/szl-holdings/estate-cards
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
