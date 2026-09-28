# XiaomiMiMo/MiMo-V2.6-Pro-MOPD

## Resumen

MiMo-V2.6-Pro-MOPD es un modelo multimodal de gran escala desarrollado por Xiaomi (organización XiaomiMiMo), publicado como evolución del checkpoint MiMo-V2.6-Pro-RL. Se trata de un transformer de tipo MoE disperso con 1,02 billones de parámetros totales y 42.000 millones de parámetros activos por token, capaz de procesar texto, imagen, vídeo y audio con una ventana de contexto de 1 millón de tokens. La variante MOPD incorpora una etapa adicional de destilación on-policy multi-profesor (MOPD2) que funde varios profesores especializados por dominio en un único estudiante.

El problema principal que aborda esta versión es un modo de fallo concreto detectado en agentes: la repetición de llamadas a herramientas (tool-call repetition), en la que el modelo emite invocaciones idénticas o muy similares de forma iterativa, consumiendo contexto y tiempo sin avanzar. El checkpoint MOPD mitiga este comportamiento mediante un entrenamiento corto con un profesor especializado, integrado en la pasada normal de MOPD.

Su relevancia actual radica en tres factores: escala (1,02T parámetros con solo 42B activos, eficiente en cómputo por token), multimodalidad nativa (visión, vídeo y audio con codificadores dedicados) y orientación explícita a cargas agénticas de horizonte largo. La licencia MIT permite uso comercial sin restricciones de atribución más allá de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts), transformer con backbone híbrido SWA/GA |
| Parametros totales | 1.024.216.603.392 (~1,02 billones) |
| Parametros activos | 42.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit y FP8 (según tags del repositorio); no se detallan variantes GGUF, AWQ o GPTQ en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas (total / SWA / GA) | 70 / 60 / 10 |
| Hidden size | 6144 |
| Cabeceras SWA (Q/KV) | 128 / 8 |
| Cabeceras GA (Q/KV) | no disponible |
| Codificador de vision | MiMo ViT de 681M parámetros (28 capas: 24 SWA + 4 Full) |
| Codificador de audio | AudioTokenizer de 308M + patch encoder de 127M |
| Decodificador especulativo | Multi-Token Prediction (MTP) de 5 capas |
| Tamano del repositorio | 573,5 GB |
| Descargas / likes | 307 / 16 |

## Arquitectura y entrenamiento

El backbone es un MoE disperso de 70 capas que combina atención de ventana deslizante (SWA) en 60 capas con atención global (GA) en 10 capas, con un tamaño oculto de 6144. Las capas SWA emplean 128 cabeceras de query y 8 de clave/valor, lo que reduce el coste de memoria KV en secuencias largas. La multimodalidad se resuelve con codificadores separados: un ViT MiMo de 681M parámetros (24 capas SWA + 4 Full) para imagen y vídeo, y un front-end de audio compuesto por un AudioTokenizer de 308M más un patch encoder de 127M. Para acelerar la decodificación incorpora un decodificador especulativo MTP de 5 capas.

El entrenamiento sigue un pipeline de RL mixto seguido de MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation). MOPD2 destila varios profesores especializados por dominio sobre el estudiante en política, con dos familias de profesores: profesores mixRL, entrenados en tareas verificables, y profesores SFT, entrenados sobre demostraciones sintéticas para dominios abiertos donde diseñar una recompensa fiable es difícil. La actualización combina tres flujos: MOPD estándar (los profesores mixRL supervisan rollouts autónomos completos), Teacher-Prefix OPD (los prefijos provienen de rollouts del profesor; una trayectoria con k turnos de asistente genera k prefijos de historial y el profesor puntúa cada turno nuevo contra ese historial) y SFT-Prefix OPD (los prefijos provienen de demostraciones SFT y el modelo escribe su propia continuación). Este esquema entrena puntos de decisión sin regenerar los turnos precedentes, lo que extiende la destilación a tareas de verificación difícil como desarrollo de videojuegos de horizonte largo, investigación científica e inteligencia corpórea.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1 millón de tokens.
- Comprensión y razonamiento sobre imagen y vídeo mediante el ViT MiMo de 681M parámetros.
- Procesamiento de audio: el modelo integra entrada de audio vía AudioTokenizer y patch encoder, y el ecosistema Xiaomi MiMo Studio referencia reproducción de voz.
- Razonamiento agéntico de múltiples pasos con llamadas a herramientas (tool calling / function calling).
- Mitigación específica de la repetición de llamadas a herramientas, con un profesor dedicado que converge en una pasada corta.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de idioma.
- Decodificación especulativa nativa mediante cabezas MTP de 5 capas para reducir la latencia de generación.
- Ejecución en 8-bit y FP8, lo que permite servir el modelo con pesos de menor precisión.

## Casos de uso

- Agentes autónomos de horizonte largo: el modelo está entrenado explícitamente para reducir la repetición de tool calls, por lo que es adecuado en bucles agénticos donde un fallo de este tipo degrada el tiempo y el consumo de contexto sin producir errores visibles.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con capturas de pantalla, imágenes o notas de voz gracias a sus codificadores de visión y audio y a la ventana de 1M tokens, manteniendo el historial completo de la sesión.
- Análisis de vídeo para soporte técnico o moderación: con el ViT de 681M parámetros y el contexto de 1M tokens permite resumir o localizar eventos en grabaciones extensas sin trocear el material.
- Automatización de oficina y ofimática: la integración anunciada con el ecosistema Kingsoft Office (WPS) apunta a usos de generación y edición asistida de documentos con reconocimiento multimodal.
- Investigación científica asistida por agente: la destilación MOPD2 incluye profesores para dominios de verificación difícil, lo que permite usarlo en pipelines de revisión de literatura, extracción de datos de figuras y tablas, y generación de hipótesis con trazabilidad de fuentes.
- Desarrollo de videojuegos de horizonte largo: el caso de uso citado explícitamente en la etapa MOPD, orientado a tareas de generación y verificación de contenido de juego mantenidas durante muchos turnos.
- Transcripción y enriquecimiento de reuniones: al aceptar audio de entrada y texto de salida, puede producir actas estructuradas con acciones derivadas a partir de la grabación completa.
- Despliegue como backend de agentes con herramientas en CI/CD: el soporte de function calling y la mitigación de repetición permiten integrarlo en pipelines que invocan APIs, ejecutan tests y aplican parches de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una figura cualitativa sobre la tasa de repetición de llamadas a herramientas (response-level repetition rate) comparando la etapa RL frente a este checkpoint MOPD, sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP8, aproximadamente 1,0 TB; en 8-bit, en el mismo orden. En BF16 superaría los 2 TB. El repositorio ocupa 573,5 GB, lo que sugiere una distribución parcial o mixta de pesos.
- No cabe en ninguna GPU de consumo. Ni siquiera en configuraciones multi-GPU de gama alta doméstica (4x RTX 4090 con 24 GB = 96 GB) se aproxima al requisito.
- GPU recomendadas: clúster multi-nodo con H100 80GB, H200 o B200. Como referencia mínima, FP8 requiere al menos 16 GPUs de 80 GB para alojar pesos y caché KV.
- Con 1M tokens de contexto, la memoria de caché KV se convierte en el factor dominante; las 60 capas SWA con 8 cabeceras KV reducen ese coste frente a un transformer denso equivalente, pero el dimensionamiento debe calcularse por despliegue.
- Opciones de despliegue: vLLM, SGLang o TGI con soporte de MoE y paralelismo tensor/pipeline multi-nodo. llama.cpp y Ollama no son viables a esta escala. Se requiere `custom_code` (el repositorio lo etiqueta como tal) y `trust_remote_code` en transformers.
- Latencia y throughput: no disponible para este checkpoint. El blog de Xiaomi menciona un modo "UltraSpeed" con más de 1000 TPS para MiMo-V2.5-Pro, pero corresponde a otro modelo y no debe extrapolarse a esta ficha.
- Modalidades adicionales: los codificadores de visión (681M) y audio (308M + 127M) añaden memoria y cómputo si se habilitan las entradas multimodales.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-MOPD | 1,02T / 42B | 1M tokens | Texto, imagen, vídeo, audio | MIT | HuggingFace, ModelScope |
| MiMo-V2.6-Pro-RL | 1,02T / 42B | 1M tokens | Texto, imagen, vídeo, audio | MIT | HuggingFace, ModelScope |
| MiMo-V2.6-Flash-MOPD | no disponible | no disponible | no disponible | MIT (heredada del proyecto) | HuggingFace, ModelScope |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | no disponible | MIT (heredada del proyecto) | HuggingFace, ModelScope |

La diferencia funcional entre MiMo-V2.6-Pro-MOPD y MiMo-V2.6-Pro-RL es la etapa MOPD2: el checkpoint RL es la base tras el RL mixto, mientras que MOPD añade la destilación multi-profesor con prefijos y la corrección específica de repetición de tool calls. No se dispone de datos de benchmarks ni de especificaciones de la familia Flash en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- Idiomas: los metadatos declaran únicamente inglés y chino. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información disponible.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad factual. En tareas multimodales (descripción de vídeo o audio) el riesgo es especialmente relevante por la ausencia de métricas.
- Repetición de tool calls: aunque este checkpoint la mitiga, la model card la describe como un problema recurrente en la versión RL; conviene instrumentar el bucle agéntico con detección de invocaciones duplicadas como salvaguarda en producción.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con conservación del aviso de copyright. No incluye cláusulas de uso aceptable, por lo que la responsabilidad sobre el uso recae en el desplegador.
- Requisitos de código: al estar etiquetado como `custom_code`, requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del repositorio.
- Coste de despliegue: la inferencia exige infraestructura multi-nodo; no existe una ruta práctica en hardware de consumo, lo que limita la reproducibilidad independiente.
- Repositorio de 573,5 GB: la descarga y el almacenamiento requieren planificación previa; verificar la integridad de los fragmentos antes de cargar el modelo.
- Fechas: los metadatos indican creación el 27 de septiembre de 2026, posterior a la fecha de referencia habitual en muchas herramientas; conviene comprobar la compatibilidad de las versiones de transformers, vLLM y SGLang con `mimo_v2`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Checkpoint base MiMo-V2.6-Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Modelo en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog técnico sobre repetición de tool calls: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub del proyecto: https://github.com/XiaomiMiMo/MiMo
- Organización en HuggingFace: https://huggingface.co/XiaomiMiMo
- Sitio principal de Xiaomi MiMo: https://mimo.xiaomi.com/
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
