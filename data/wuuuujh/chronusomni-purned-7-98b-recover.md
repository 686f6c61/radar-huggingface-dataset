# WuuuuJH/ChronusOmni-Purned-7.98b-recover

## Resumen

ChronusOmni-Purned-7.98b-recover es un checkpoint podado y recuperado de ChronusOmni, un modelo omni-modal de gran tamaño diseñado para mejorar la conciencia temporal en tareas de anclaje temporal audiovisual (video-temporal grounding). El modelo original, propuesto en el artículo arXiv 2512.09841, intercala tokens de timestamp basados en texto con representaciones visuales y de audio en cada unidad de tiempo, lo que permite un modelado temporal unificado entre modalidades. Este repositorio concreto contiene una versión podada estructuralmente (poda de ancho MLP) que reduce el tamaño del modelo a 7.984 mil millones de parámetros, seguida de una recuperación de precisión mediante LoRA/SFT y un refinamiento adicional con GRPO de IoU temporal.

El desarrollo corre a cargo de WuuuuJH, que mantiene el código fuente, los scripts de poda, entrenamiento e inferencia en el repositorio GitHub Multi-scale-Omni-Aggregation-Model. La relevancia de este checkpoint radica en que permite ejecutar un modelo multimodal de gran tamaño con un coste computacional reducido, manteniendo capacidades de razonamiento temporal sobre video y audio. El modelo soporta inglés y chino, y su pipeline es video-text-to-text. El repositorio ocupa 57.3 GB e incluye los pesos del modelo, los codificadores de audio (BEATs y Whisper large-v3) y utilidades de validación y parcheo de rutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (omni-modal) con codificadores de audio (BEATs, Whisper large-v3) y vision, intercalacion de tokens de timestamp |
| Parametros totales | 7.984 mil millones (modelo podado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint nativo en formato .pt) |
| Idiomas soportados | ingles, chino |
| Licencia | other (no especificada) |
| Formato de pesos | Checkpoint nativo .pt (formato chronusomni-native-mlp-pruning-v2) |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura de ChronusOmni, un LLM omni-modal que intercala tokens de timestamp textuales con representaciones visuales y de audio en cada unidad de tiempo, logrando un modelado temporal unificado entre modalidades. El modelo original emplea codificadores especializados: BEATs para audio y Whisper large-v3 para habla, junto con un vision tower. La version podada aplica una poda estructural nativa sobre el ancho de las capas MLP, reduciendo el numero de parametros a 7.984B. Posteriormente se realiza una recuperacion de precision mediante LoRA/SFT, y finalmente un refinamiento con GRPO de IoU temporal para mejorar la precision de las predicciones de timestamps. Los datos de entrenamiento, el numero de tokens y la composicion del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Anclaje temporal de video (video-temporal grounding): localiza intervalos temporales en video a partir de consultas audiovisuales, produciendo predicciones en formato "inicio-fin" (por ejemplo, "10.03-11.80").
- Procesamiento multimodal: integra video, audio y texto en una unica representacion temporal unificada.
- Generacion de timestamps: emite predicciones de intervalos temporales en formato compacto JSONL.
- Multilingue: soporta ingles y chino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo de pensamiento explicito.

## Casos de uso

- Anotacion automatica de video: generar timestamps de eventos en secuencias de video para etiquetado automatico de datasets, usando el script de inferencia con un archivo JSON de consultas y obteniendo predicciones en formato "inicio-fin".
- Busqueda temporal en video: localizar momentos concretos dentro de un video a partir de descripciones textuales o consultas audiovisuales, util para motores de busqueda de contenido multimedia.
- Subtitulado temporal: asociar transcripciones o descripciones a intervalos de tiempo precisos, facilitando la generacion de subtitulos sincronizados.
- Analisis de contenido audiovisual: extraer la linea temporal de eventos relevantes en grabaciones largas (vigilancia, entrevistas, documentales) para resumen automatico.
- Moderacion de contenido: detectar y marcar segmentos temporales especificos que requieran revision, basandose en criterios audiovisuales.
- Investigacion en eficiencia de modelos: servir como caso de estudio para tecnicas de poda estructural y recuperacion con LoRA/GRPO en modelos multimodales de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 7.984B parametros en precision FP16, se estima un consumo minimo de 16-24 GB solo para los pesos, mas el overhead de los codificadores de audio y vision, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizo con 2 GPUs, lo que sugiere que la inferencia puede requerir al menos una GPU de gama alta (por ejemplo, A100, RTX 4090 o superior), pero no se especifica.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del checkpoint y los codificadores adicionales, es probable que necesite una GPU con al menos 24 GB de VRAM.
- Opciones de despliegue: el modelo no es compatible con frameworks estandar como vLLM, Ollama o llama.cpp. Requiere el script de inferencia especifico de ChronusOmni (chronusomni_pruned_infer.py) del repositorio GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos omni-modales con anclaje temporal y poda estructural). El checkpoint es una version podada de ChronusOmni, pero no se proporcionan datos de rendimiento relativo frente a otras alternativas.

## Limitaciones y advertencias

- Licencia "other" no especificada: no se detallan los terminos de uso, lo que genera incertidumbre sobre su uso comercial o modificacion.
- Formato propietario: el checkpoint no es un modelo Qwen generico ni compatible con cargadores estandar; requiere los scripts especificos de ChronusOmni del repositorio GitHub.
- Rutas absolutas en config.json: el archivo de configuracion contiene rutas de maquina especificas que deben parchearse tras la descarga mediante los scripts de validacion y parcheo incluidos.
- Idiomas limitados: solo ingles y chino; no se garantiza rendimiento en otros idiomas.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta evaluar su calidad frente a otros modelos.
- Riesgo de alucinacion en predicciones temporales: al ser un modelo generativo, puede producir timestamps inexactos o inventados, especialmente en entradas ambiguas.
- Tamano del repositorio: 57.3 GB, lo que requiere un ancho de banda y almacenamiento considerables para su descarga.

## Enlaces

- HuggingFace: https://huggingface.co/WuuuuJH/ChronusOmni-Purned-7.98b-recover
- Repositorio GitHub (codigo, scripts, documentacion): https://github.com/Q-if/Multi-scale-Omni-Aggregation-Model
- Articulo arXiv (ChronusOmni original): https://arxiv.org/abs/2512.09841
