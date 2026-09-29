# vogel61/MiMo-V2.6-Flash-MOPD-oQ4e-mtp

## Resumen
MiMo-V2.6-Flash-MOPD-oQ4e-mtp es una cuantizacion de 4 bits, subida por el usuario vogel61, del checkpoint oficial MiMo-V2.6-Flash-MOPD desarrollado por Xiaomi (organizacion XiaomiMiMo). El modelo base es un MoE disperso nativamente omnimodal de 309B parametros totales (15B activos) con una ventana de contexto de 1M tokens que procesa texto, imagen, video y audio. La version MOPD incorpora una etapa de destilacion on-policy (MOPD2) que fusiona varios profesores especializados por dominio y corrige el fallo de repeticion de tool calls detectado en la version RL previa.

Esta ficha describe el repositorio cuantizado a 4 bits, cuyo proposito es reducir los 172,3 GB de pesos originales para facilitar el despliegue en infraestructura con memoria agregada. No se dispone de informacion sobre el proceso exacto de cuantizacion aplicado por el autor del repo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (Mixture of Experts), backbone hibrido SWA + Global Attention, con codificadores multimodales y decodificador especulativo MTP |
| Parametros totales | 309.766.601.088 (309B) |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 4-bit (etiqueta "oQ4e" en el nombre del repo); el checkpoint base se publica ademas en 8-bit fp8 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento
El backbone LLM consta de 48 capas en total, de las cuales 39 usan sliding window attention (SWA) y 9 usan atencion global (GA). El tamano oculto es 4096, con 64 cabezas de consulta y 8 de clave/valor en las capas SWA. La pila multimodal incluye un codificador de vision MiMo ViT de 681M parametros (28 capas: 24 SWA y 4 full), un AudioTokenizer de 308M y un codificador de parches de audio de 127M. Incorpora un decodificador especulativo Multi-Token Prediction (MTP) de 5 capas. Esta variante anade el sufijo "mtp" en su denominacion, coherente con ese bloque.

El entrenamiento del checkpoint base combina dos familias de profesores en la etapa MOPD2: profesores mixRL, entrenados sobre tareas verificables, y profesores SFT, entrenados sobre demostraciones sinteticas para dominios abiertos donde la recompensa fiable es dificil de disenar. La actualizacion agrega tres flujos: MOPD estandar (supervision de rollouts autonomos completos), Teacher-Prefix OPD (prefijos extraidos de rollouts del profesor, una puntuacion por turno) y SFT-Prefix OPD (prefijos procedentes de demostraciones SFT sobre los que el modelo escribe su propia continuacion). El objetivo declarado de esta etapa es mitigar la repeticion de tool calls, un modo de fallo en el que el modelo emite llamadas identicas o muy similares sin progresar, consumiendo contexto y tiempo sin fallar de forma explicita. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades
- Generacion de texto y conversacion multi-turno con contexto de hasta 1M tokens.
- Comprension de imagen, video y audio gracias a los codificadores multimodal (ViT, AudioTokenizer y patch encoder).
- Razonamiento de multiples pasos y uso en entornos de agentes.
- Soporte de tool calling / function calling, con la mitigacion de repeticion de llamadas introducida en esta version MOPD.
- Capacidades vision-language y video-understanding declaradas en las etiquetas del repositorio.
- Decodificacion especulativa mediante Multi-Token Prediction (MTP) para acelerar la generacion.
- Soporte bilingue limitado a ingles y chino (en, zh).
- Modo de precision de 4 bits (variante cuantizada de este repositorio).

## Casos de uso
- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, lo que permite conservar todo el contexto de una sesion sin truncar.
- Agentes de automatizacion con tool calling: la correccion de la repeticion de llamadas lo hace adecuado para pipelines donde el agente invoca herramientas externas de forma iterativa sin quedarse en bucles improductivos.
- Analisis de video: la comprension de video soportada permite transcripcion, resumen y extraccion de eventos en flujos de vigilancia o catalogacion de contenido.
- Procesamiento de audio y voz: la integracion del AudioTokenizer y el codificador de parches permite tareas de transcripcion, diarizacion o analisis de audio directamente en el mismo modelo.
- Investigacion cientifica asistida: la etapa MOPD2 se entreno especificamente para dominios como investigacion cientifica, desarrollo de videojuegos de largo horizonte e inteligencia encarnada, por lo que encaja en asistentes de laboratorio que manejen documentos extensos.
- Documentacion tecnica de gran volumen: con 1M tokens de contexto se pueden analizar repositorios completos o conjuntos de documentacion en una sola pasada.
- Despliegue en infraestructura con memoria agregada: al tratarse de una cuantizacion de 4 bits, esta pensado para servirse en nodos con memoria unificada o multiples GPU, como los escenarios documentados con DGX Spark.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye una figura sobre la tasa de repeticion de tool calls antes y despues de la etapa MOPD, pero no se proporcionan valores numericos de MMLU, HumanEval, GSM8K ni de otras evaluaciones.

## Requisitos de hardware
- Tamano del repositorio: 172,3 GB en safetensors, dato que marca el minimo de almacenamiento para los pesos (los ficheros de inferencia pueden requerir menos o mas segun formato).
- VRAM estimada: la cuantizacion a 4 bits de 309B parametros ocupa del orden de 155 GB solo en pesos, sin margen para cache KV ni estados de activacion. No cabe en ninguna GPU de consumo actual.
- GPU recomendadas: no disponible en la informacion. La referencia encontrada describe el despliegue con SGLang sobre dos DGX Spark (GB10, SM121, 121,7 GiB de memoria unificada cada uno) enlazados por ConnectX-7 RoCE, lo que da una idea del orden de recursos necesarios.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090, 3090, etc.) por el volumen de parametros, incluso a 4 bits.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), SGLang segun la implementacion de referencia encontrada, y un endpoint compatible con OpenAI en el escenario de doble DGX Spark.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD-oQ4e-mtp (este repo) | 309B / 15B | 1M | Texto, imagen, video, audio | MIT | Safetensors 4-bit, 172,3 GB |
| MiMo-V2.6-Flash-RL | 309B / 15B (arquitectura compartida) | 1M | Texto, imagen, video, audio | MIT | HuggingFace y ModelScope, sin corregir la repeticion de tool calls |
| MiMo-V2.6-Flash-MOPD | 309B / 15B | 1M | Texto, imagen, video, audio | MIT | HuggingFace y ModelScope, version oficial sin cuantizar |
| MiMo-V2.6-Pro-MOPD | no disponible (gama superior) | 1M | Texto, imagen, video, audio | MIT | HuggingFace y ModelScope |

## Limitaciones y advertencias
- Repositorio con 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- La cuantizacion a 4 bits no es oficial: la ha publicado el usuario vogel61 sobre el checkpoint de Xiaomi, por lo que puede introducir degradacion respecto al modelo original.
- No se documenta en la informacion disponible la metodologia de cuantizacion ni las metricas de perdida de calidad asociadas.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos, no caracterizado en los datos disponibles.
- La repeticion de tool calls esta mitigada, no necesariamente eliminada, segun la propia documentacion del autor.
- La licencia MIT permite uso comercial, pero el repositorio no ofrece garantias sobre el proceso de cuantizacion aplicado.
- Se requiere infraestructura con memoria agregada muy superior a la de una GPU de consumo, lo que limita su uso a entornos de servidor.
- No se publican resultados de benchmarks para esta variante cuantizada concretamente.

## Enlaces
- Repositorio cuantizado: https://huggingface.co/vogel61/MiMo-V2.6-Flash-MOPD-oQ4e-mtp
- Modelo base oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Checkpoint RL previo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Modelo Pro RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Modelo Pro MOPD: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Informe tecnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog de Xiaomi MiMo: https://mimo.xiaomi.com/mimo-v2-6
- Blog sobre la repeticion de tool calls: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Repositorio GitHub de MiMo: https://github.com/XiaomiMiMo/MiMo
- Implementacion de referencia en 2x DGX Spark: https://github.com/MiaAI-Lab/MiMo-V2.6-Flash-2x-DGX-Sparks
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
