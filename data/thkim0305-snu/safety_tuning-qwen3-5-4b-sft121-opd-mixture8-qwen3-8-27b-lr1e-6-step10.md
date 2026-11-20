# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10 es un checkpoint de investigación derivado de Qwen3.5-4B, publicado por el usuario thkim0305-SNU. Se trata de un ajuste fino orientado a seguridad (safety tuning) mediante destilación on-policy (OPD, on-policy distillation) con divergencia KL inversa, usando Qwen3.8-27B como modelo profesor. El resultado es un modelo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) con pesos en safetensors y licencia Apache 2.0.

El checkpoint representa únicamente 10 actualizaciones del optimizador OPD (iteración Megatron basada en cero: 9), contadas desde la inicialización de esta rama y no desde el entrenamiento SFT previo. La inicialización es el modelo thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121, sobre el que se aplica una tasa de aprendizaje constante de 1e-6, lotes de 30 prompts por 4 respuestas, límites de generación de 32.768 tokens y de secuencia de 65.536 tokens, muestreo con temperatura 1.0 y semilla 42.

Su relevancia es acotada: no es un modelo listo para producción ni un lanzamiento oficial de Qwen, sino un artefacto de investigación que documenta un paso intermedio de un pipeline de destilación on-policy para alineamiento de seguridad. La model card indica que el repositorio contiene solo pesos de inferencia, tokenizador y configuración; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; el entrenamiento usa límite de secuencia de 65.536 tokens y de generación de 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5 (tag `qwen3_5`), con arquitectura transformer y aproximadamente 4,66 mil millones de parámetros. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base incorpora componentes multimodales; sin embargo, la model card aclara que los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada, de modo que el repositorio no documenta un entrenamiento multimodal propio.

El entrenamiento consiste en destilación on-policy (OPD) con objetivo de divergencia KL inversa, usando Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) como profesor. Se parte de la revisión `453e22ff2b024f7d8e41f9e4e6d67e0ac174f682` del modelo SFT de inicialización. La configuración concreta: tasa de aprendizaje constante 1e-6, lote de 30 prompts × 4 respuestas, límites de 32.768 tokens de generación y 65.536 de secuencia, muestreo con temperatura 1.0 y semilla 42, sobre un pool de prompts formado por la mezcla más reciente de ocho datasets preservando el orden original de cada fuente. El profesor emplea un sistema específico por dataset: instrucciones de seguridad (Spec) en prompts dañinos o difíciles y sin Spec añadido en prompts benignos. La ejecución se denomina `opd-postdpo-sft121-20261118-v1`. No se especifican el número de tokens de entrenamiento ni la composición detallada de los ocho datasets.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Ajuste orientado a seguridad: el entrenamiento busca alinear respuestas en prompts dañinos o difíciles mediante destilación del profesor.
- Procesamiento image-text-to-text según el pipeline declarado, aunque los tensores multimodales se heredan de la inicialización y no se detalla su estado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking, visión o audio: no disponible como capacidad documentada; solo el pipeline multimodal genérico.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint sirve para estudiar la evolución de las respuestas ante prompts dañinos a lo largo de las actualizaciones OPD, comparando con la inicialización SFT y con checkpoints posteriores.
- Reproducción de pipelines de destilación on-policy: permite validar recetas con profesor de mayor tamaño (27B) y estudiante de 4B, con KL inversa y parámetros concretos de lote, temperatura y semilla.
- Evaluación de robustez frente a jailbreaks: al estar entrenado con un sistema de Spec en prompts dañinos, es útil para medir la tasa de rechazo y la calidad de las negativas en un banco de pruebas controlado.
- Análisis de la brecha profesor-estudiante: comparar las salidas del estudiante de 4,66B con las del profesor Qwen3.8-27B en el mismo pool de prompts de ocho datasets.
- Punto de partida para ajustes posteriores: al ser un checkpoint intermedio (10 pasos), puede utilizarse como inicialización de experimentos de continuación con otras tasas de aprendizaje o mezclas de datos.
- Docencia y formación técnica: ilustra de forma tangible cómo se estructura un artefacto de investigación con metadatos de revisión, profesor, objetivo y límites de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 9,3 GB de repositorio y 4,66B parámetros, la inferencia en fp16 requiere en torno a 9-10 GB de VRAM para los pesos, más memoria para caché KV según la longitud de contexto; en cuantizaciones de 8 bits o 4 bits bajaría sustancialmente, aunque no se publican versiones cuantizadas.
- GPU recomendadas: para fp16, GPU con 16-24 GB o más (RTX 4090, A100, H100); para contextos largos cercanos a los 65.536 tokens de entrenamiento, se recomienda A100/H100 por memoria y ancho de banda.
- ¿Cabe en consumer GPU?: sí, en fp16 en tarjetas de 16 GB o más (por ejemplo RTX 4090 de 24 GB); en GPUs de 8-12 GB sería necesario cuantizar, opción no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT121-OPD (este) | 4.659.865.088 | no disponible (entrenamiento con 65.536) | apache-2.0 | Hugging Face, 0 descargas, 0 likes | Checkpoint de investigación, 10 pasos OPD |
| Qwen3.5-4B Base SFT Mixture8 (inicialización) | no disponible | no disponible | no disponible | Hugging Face (repo del autor) | Punto de partida del ajuste |
| Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | Hugging Face (Qwen) | Modelo profesor usado en la destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación con solo 10 actualizaciones del optimizador; no debe tratarse como un modelo final ni validado para producción.
- No se han publicado benchmarks, evaluaciones de seguridad cuantitativas ni tasas de rechazo, por lo que su eficacia en alineamiento de seguridad no está verificada de forma independiente.
- Riesgo de alucinación inherente a modelos de 4,66B; no hay datos específicos de evaluación.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto efectiva no documentada como spec del modelo; los 65.536 tokens corresponden al límite de secuencia de entrenamiento, no a una garantía de calidad en contextos largos.
- Los tensores de visión y MTP se copian de la inicialización, no se entrenan en esta fase; el rendimiento multimodal no está validado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5 y conviene revisar las condiciones del modelo base original antes de explotación comercial.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad que haya validado su comportamiento.
- La model card está redactada como nota de laboratorio, con jerga interna (arm, Spec, MTP) que dificulta la reproducibilidad sin acceso al código de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10
- Modelo de inicialización: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121
- Modelo profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
