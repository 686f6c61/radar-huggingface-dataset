# tencent/Hy-SimulMT-30B-A3B-FP8

## Resumen

Hy-SimulMT-30B-A3B-FP8 es la variante cuantizada en FP8 del modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan. A diferencia de los modelos de traducción por turnos, Hy-SimulMT consume un flujo de audio continuo y va emitiendo la traducción mientras el hablante sigue hablando, generando tanto texto como voz, e incorporando clonación de voz en tiempo real para conservar el timbre del interlocutor original.

El modelo se distribuye con arquitectura etiquetada como `hy_v3` y 30.394.794.496 parámetros totales (30,4 B); la nomenclatura "30B-A3B" del identificador indica un diseño de mezcla de expertos con aproximadamente 3 B de parámetros activos por token, lo que reduce el coste de cómputo por paso de decodificación, algo crítico en un escenario de baja latencia. Los pesos de este repositorio están en FP8 y el conjunto ocupa 32,2 GB, lo que abarata el despliegue frente a una versión en BF16.

Su relevancia actual radica en que ataca el compromiso clásico entre calidad y latencia en interpretación simultánea: en la evaluación de audio largo RealSI obtiene un StreamLAAL de aproximadamente 3 segundos, el más bajo de la comparativa publicada, con una puntuación GEMBA superior a la de los modelos abiertos comparados y a cuatro de las cinco APIs comerciales incluidas. La licencia Apache-2.0 facilita su adopción comercial, y el repositorio de GitHub asociado publica las herramientas SimulInfer (servicio de inferencia) y SimulTrain (entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta de arquitectura `hy_v3` |
| Parametros totales | 30.394.794.496 (30,4 B) |
| Parametros activos | Aproximadamente 3 B, segun la nomenclatura "30B-A3B" del identificador |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta variante); no se documentan otras en la informacion disponible |
| Idiomas soportados | 36 idiomas en los metadatos: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug. La model card describe traduccion bidireccional chino-ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), libreria transformers |

## Arquitectura y entrenamiento

La informacion disponible confirma una arquitectura denominada `hy_v3` con 30,4 B de parametros totales y una nomenclatura que sugiere mezcla de expertos con ~3 B activos. No se detallan en la model card el numero de expertos, el ratio de activacion, el mecanismo de atencion ni si se emplea atencion lineal o alguna variante eficiente; tampoco se especifica la longitud de contexto soportada. El modelo pertenece al pipeline `translation` de transformers y se distribuye en formato safetensors, con la etiqueta `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia estandar.

El aspecto tecnico diferencial no esta en un modulo aislado, sino en el regimen de operacion: el modelo esta disenado para recibir audio en streaming y emitir traduccion de forma incremental, equilibrando la informacion disponible en cada instante con la necesidad de responder pronto. La evaluacion se realiza con dos metricas complementarias, StreamLAAL (retardo de traduccion en streaming, en segundos, menor es mejor) y GEMBA (calidad de traduccion, mayor es mejor). Para la salida de voz y la clonacion del hablante se requiere un servicio TTS configurado externamente. El repositorio de GitHub del proyecto publica SimulInfer para el servicio de inferencia y SimulTrain para el entrenamiento; no se han publicado en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Traduccion simultanea bidireccional chino-ingles a partir de audio en streaming, con salida de texto y de voz.
- Traduccion de voz a voz (speech-to-speech) con clonacion de voz en tiempo real, preservando las caracteristicas vocales del hablante.
- Generacion de texto traducido de forma incremental mientras llega el audio, sin esperar al final del turno.
- Capacidad multilingue declarada en metadatos para 36 idiomas, incluidos espanol, frances, portugues, aleman, italiano, japones, coreano, arabe, hindi, ruso, turco y vietnamita, entre otros.
- Orientado a entradas de audio de larga duracion (charlas, entrevistas, reuniones) segun la evaluacion RealSI de audio largo.
- Integracion como servicio de inferencia mediante SimulInfer, con soporte de endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, vision o audio de entrada mas alla del audio de traduccion: no disponible en la informacion proporcionada.

## Casos de uso

- Interpretacion simultanea en reuniones internacionales: el modelo consume el audio de la sala y emite la traduccion con un retardo medio de unos 3 segundos (StreamLAAL), lo que permite seguir una reunion bilingue chino-ingles sin interprete humano dedicado.
- Subtitulado en directo de charlas y ponencias: la salida de texto incremental puede alimentar un sistema de subtitulos para streaming o eventos presenciales, manteniendo la sincronia con el hablante gracias a su baja latencia de traduccion.
- Doblaje en tiempo real con preservacion de voz: la clonacion de voz permite emitir la traduccion con el timbre del ponente, util en retransmisiones, webinars y formacion corporativa multilingue.
- Soporte telefónico o por videollamada bilingue: integrado en un pipeline de telefonia (necesita un servicio TTS para la voz de salida), traduce la conversacion en ambos sentidos mientras el cliente y el agente hablan, sin turnos de espera.
- Entrevistas y ruedas de prensa: el modelo esta evaluado especificamente en audio largo, por lo que encaja en escenarios de decenas de minutos donde la coherencia entre fragmentos y la puntualidad de la informacion son relevantes.
- Accesibilidad para personas con discapacidad auditiva en entornos multilingues: transcripcion traducida en tiempo real de clases, conferencias o actos publicos, con la ventaja de no requerir esperar al cierre de frase.
- Analisis de contenido audiovisual en directo: traduccion de emisiones en vivo para monitorizacion de medios o generacion de versiones localizadas de un flujo continuo.

## Benchmarks y rendimiento

Evaluacion en cuatro benchmarks publicos de audio corto (puntuaciones mas altas son mejores):

| API / Modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88,4 | 82,1 | 80,5 | 84,4 |
| Hy-SimulMT | 90,3 | 75,5 | 81,2 | 84,7 |
| Gemini3.5-LiveTranslate | 92,4 | 74,4 | 82,6 | 82,2 |
| Confucius4 R2T2 -> T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

En la evaluacion de audio largo RealSI, el modelo alcanza un StreamLAAL de aproximadamente 3 segundos, el valor mas bajo de los sistemas comparados, y una puntuacion GEMBA superior a la de los modelos abiertos incluidos y a cuatro de las cinco APIs comerciales. La model card advierte de que StreamLAAL no equivale al tiempo hasta la primera salida de voz. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K, ni datos de throughput.

## Requisitos de hardware

- Peso de los pesos: 32,2 GB en FP8 para 30,4 B de parametros; el repositorio completo ocupa 32,2 GB.
- VRAM estimada para inferencia: en torno a 34-40 GB considerando pesos FP8 mas cache KV y overhead del runtime; con contexto largo o lotes mayores, 48 GB o mas.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para una sola GPU. En 2 x RTX 4090 de 24 GB es viable con reparto de pesos (tensor parallel), pero el margen es ajustado.
- GPU de consumo: no cabe en una unica GPU de 24 GB en FP8; seria necesario sharding entre varias o una cuantizacion adicional no publicada en este repositorio.
- Opciones de despliegue: la libreria indicada es transformers y el modelo esta marcado como `endpoints_compatible`; el proyecto proporciona SimulInfer como servicio de inferencia. La disponibilidad de vLLL, TGI, Ollama o llama.cpp (GGUF) no esta confirmada en la informacion proporcionada.
- Dependencia adicional: la salida de voz y la clonacion requieren un servicio TTS configurado aparte.
- Latencia: StreamLAAL de aproximadamente 3 segundos en RealSI. Throughput (tokens o segundos de audio por segundo) no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | FLEURS | CoVoST2 | Latencia (StreamLAAL) | Licencia |
|---|---|---|---|---|---|---|
| Hy-SimulMT-30B-A3B-FP8 | 30,4 B totales / ~3 B activos | Traduccion simultanea audio-texto-audio zh<->en con clonacion de voz | 90,3 | 75,5 | ~3 s | Apache-2.0 |
| SeamlessStreaming | no disponible | Traduccion en streaming | 72,8 | 60,9 | no disponible | no disponible |
| SimulS2ST-Omni | no disponible | Speech-to-speech simultaneo | 78,6 | 66,6 | no disponible | no disponible |
| Qwen3.8-LiveTranslate | no disponible | Traduccion en vivo | 88,4 | 82,1 | no disponible | no disponible |
| GPT-Realtime-Translate (API) | no disponible | API comercial de traduccion en tiempo real | 77,7 | 50,8 | no disponible | propietaria |

Hy-SimulMT combina el mejor FLEURS de la comparativa abierta (90,3) y el mejor resultado en RealSI-Sentence (84,7), aunque cede en CoVoST2 frente a Qwen3.8-LiveTranslate (75,5 frente a 82,1) y en FLEURS y ACL6060 frente a Gemini3.5-LiveTranslate. Los datos de parametros, contexto y licencia de los sistemas comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura idiomatica: la model card describe explicitamente traduccion bidireccional chino-ingles; los 36 idiomas de los metadatos no tienen validacion publicada en la informacion disponible.
- Dependencia de servicios externos: la salida de voz y la clonacion requieren un servicio TTS configurado, de modo que el rendimiento percibido depende de ese componente.
- Riesgo de alucinacion: como todo modelo generativo aplicado a traduccion, puede producir contenido no presente en el audio original, especialmente con ruido, solapamiento de hablantes o audio de baja calidad.
- Metricas de latencia: StreamLAAL mide el retardo de traduccion en streaming y no el tiempo hasta la primera salida de voz; no debe interpretarse como latencia extremo a extremo del sistema completo.
- Evaluacion mayoritariamente interna: los resultados de RealSI de audio largo proceden del propio autor; los benchmarks cortos incluidos no cubren todos los pares de idiomas.
- Idiomas de bajos recursos: la lista incluye idiomas como bo, ug, mn o km sin evidencia publica de calidad.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la clonacion de voz exige consentimiento explicito del hablante y cumple la normativa aplicable de proteccion de datos y sintesis de voz.
- Produccion: no hay datos publicados de throughput ni de comportamiento con lotes concurrentes, por lo que la planificacion de capacidad debe validarse con pruebas propias.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos demograficos o dialectales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B-FP8
- Coleccion Hy-SimulMT en HuggingFace: https://huggingface.co/collections/tencent/hy-simulmt
- Repositorio GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- Coleccion en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Sitio corporativo de Tencent: https://www.tencent.com/
