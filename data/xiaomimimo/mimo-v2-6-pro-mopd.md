# XiaomiMiMo/MiMo-V2.6-Pro-MOPD

## Resumen

MiMo-V2.6-Pro-MOPD es un modelo de lenguaje multimodal de gran escala desarrollado por XiaomiMiMo, el equipo de investigación en IA de Xiaomi. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) dispersa que totaliza 1,02 billones de parámetros, de los cuales activa 42.000 millones por token. Integra codificadores para texto, imagen, vídeo y audio, y ofrece una ventana de contexto de 1 millón de tokens, lo que lo sitúa en la categoría de modelos frontera para tareas de agente y comprensión multimodal de contexto largo.

Este checkpoint concreto es la etapa MOPD (Multi-Teacher On-Policy Distillation) del modelo MiMo-V2.6-Pro-RL. La innovación principal de MOPD2 es la destilación on-policy de varios profesores especializados por dominio en un único modelo estudiante, cubriendo tanto tareas verificables (mixRL) como dominios de espacio abierto donde diseñar una recompensa fiable es difícil, como el desarrollo de videojuegos de largo horizonte, la investigación científica o la inteligencia encarnada. Además, esta versión corrige de forma específica el fallo de repetición de llamadas a herramientas (tool-call repetition) detectado en MiMo-V2.6, un modo de fallo en el que el modelo emite llamadas idénticas o muy similares de forma reiterada sin avanzar.

Su relevancia actual radica en tres factores: la licencia MIT (permisiva para uso comercial), la combinación de multimodalidad completa con contexto de 1M tokens y la orientación explícita a flujos agénticos con tool calling robusto. El modelo se distribuye en formato safetensors con pesos en 8 bits (FP8) y un repositorio de 573,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) con backbone híbrido SWA/GA, codificadores omni (visión y audio) y decodificador especulativo MTP |
| Parametros totales | 1.024.216.603.392 (1,02 T) |
| Parametros activos | 42 B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, FP8 (pesos publicados); no se detallan otras variantes en la información disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, librería transformers) |

## Arquitectura y entrenamiento

El backbone es un transformer MoE disperso de 70 capas, de las cuales 60 usan atención de ventana deslizante (SWA) y 10 usan atención global (GA), con un tamaño oculto de 6144. Las capas SWA emplean 128 cabezas de consulta y 8 cabezas de clave-valor, lo que reduce el coste de atención en contextos largos. El modelo incorpora tres componentes adicionales: un codificador visual MiMo ViT de 681 M de parámetros (28 capas: 24 SWA y 4 full), un codificador de audio compuesto por un AudioTokenizer de 308 M y un patch encoder de 127 M, y un decodificador especulativo Multi-Token Prediction (MTP) de 5 capas que acelera la generación.

El entrenamiento combina varias fases. Sobre la base del checkpoint MiMo-V2.6-Pro-RL, la etapa MOPD2 destila varios profesores especializados en el estudiante de forma on-policy, con tres flujos que contribuyen a una única actualización: MOPD estándar (profesores mixRL supervisan rollouts autónomos completos), Teacher-Prefix OPD (prefijos extraídos de rollouts del profesor, una puntuación por turno) y SFT-Prefix OPD (prefijos de demostraciones sintéticas donde el modelo escribe su propia continuación). Los profesores mixRL se entrenan en tareas verificables, mientras que los profesores SFT cubren dominios abiertos sin recompensa fiable. El informe técnico no detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de 1M tokens.
- Comprensión de imagen mediante el codificador MiMo ViT de 681 M de parámetros.
- Comprensión de vídeo (etiqueta `video-understanding` en la model card).
- Comprensión de audio mediante AudioTokenizer y patch encoder dedicados.
- Tool calling y function calling, con mitigación específica del fallo de repetición de llamadas.
- Flujos agénticos multi-paso y razonamiento de horizonte largo (desarrollo de videojuegos, investigación científica, inteligencia encarnada según los dominios de los profesores MOPD).
- Decodificación especulativa mediante MTP de 5 capas para acelerar la inferencia.
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso

- Atención al cliente automatizada: la ventana de 1M tokens permite mantener historiales de conversación muy extensos y adjuntar documentación completa sin truncar, con respuestas multi-turno coherentes.
- Agentes autónomos de desarrollo de software: el soporte de tool calling y la corrección de la repetición de llamadas lo hacen adecuado para pipelines de CI/CD donde el agente debe invocar herramientas de forma productiva y no entrar en bucles.
- Análisis de vídeo a gran escala: gracias al codificador visual y la etiqueta de comprensión de vídeo, puede resumir o indexar grabaciones largas junto con su transcripción de audio en una sola pasada de contexto.
- Investigación científica asistida: la destilación MOPD2 incluye profesores de investigación científica, lo que orienta al modelo a tareas de razonamiento abierto donde no existe una recompensa verificable trivial.
- Transcripción y análisis de reuniones: combinando audio y texto, puede procesar la grabación y generar actas estructuradas con contexto de conversaciones previas de la organización.
- Asistencia en robótica e inteligencia encarnada: el dominio de embodied intelligence cubierto por los profesores MOPD2 permite usarlo como planificador de alto nivel que interpreta instrucciones y genera secuencias de acciones.
- Procesamiento de corpus documentales extensos: con 1M tokens de contexto puede realizar preguntas y respuestas sobre libros técnicos, expedientes o bases de conocimiento completas sin recuperación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una figura comparativa de la tasa de repetición de llamadas a herramientas antes y después de la etapa MOPD, sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,02 T de parámetros en FP8 (8 bits), los pesos ocupan aproximadamente 1 TB; no cabe en ninguna GPU individual comercial actual y requiere despliegue multi-GPU o multi-nodo.
- GPU recomendadas: clústeres de H100 (80 GB), H200 o B200; se necesitan del orden de 13-16 GPU H100 solo para alojar los pesos en FP8, más memoria adicional para caché KV con contexto de 1M tokens.
- No cabe en GPU de consumo (RTX 4090, 5090 ni similares).
- Opciones de despliegue: al usar `custom_code` y transformers, la integración con vLLM, TGI o llama.cpp no está confirmada en la información disponible; la model card no detalla backends de serving.
- Latencia y throughput: no disponibles. El decodificador especulativo MTP de 5 capas está diseñado para reducir la latencia de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-MOPD | 1,02 T | 42 B | 1M | Texto, imagen, vídeo, audio | MIT |
| MiMo-V2.6-Pro-RL | 1,02 T | 42 B | 1M | Texto, imagen, vídeo, audio | MIT |
| MiMo-V2.6-Flash-MOPD | no disponible | no disponible | no disponible | no disponible | MIT |

La información disponible no permite comparar con modelos de otros fabricantes (parámetros, contexto o rendimiento), por lo que la comparativa se limita a las variantes publicadas por el mismo equipo. La diferencia funcional entre Pro-MOPD y Pro-RL es la etapa de destilación multi-profesor y la mitigación de la repetición de llamadas; Flash es una variante presumiblemente más ligera, pero sus especificaciones no se detallan.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino según la model card; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: no se publican evaluaciones de factualidad; como modelo generativo de gran escala, es susceptible de inventar datos, especialmente en dominios sin recompensa verificable.
- Repetición de llamadas a herramientas: aunque esta versión la mitiga, el fallo se describe como un modo de fallo que puede pasar desapercibido porque nada falla de forma explícita; conviene monitorizar los agentes en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Requisitos de infraestructura: el tamaño de 1,02 T de parámetros y 573,5 GB de repositorio hacen inviable el despliegue en hardware de consumo y encarecen la inferencia.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican términos adicionales de responsabilidad ni cláusulas de uso aceptable más allá de la licencia estándar.
- Contexto de 1M tokens: aunque soportado, el coste de memoria de la caché KV a esa longitud es muy elevado y puede degradar el throughput; no se documenta la degradación de calidad a longitudes extremas.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Checkpoint base RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Variante Flash RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Variante Flash MOPD: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog técnico sobre repetición de llamadas: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
