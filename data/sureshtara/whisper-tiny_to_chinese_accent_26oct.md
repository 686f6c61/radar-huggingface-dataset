# sureshtara/whisper-tiny_to_chinese_accent_26oct

## Resumen

Whisper tiny Chinese es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` realizado por el usuario sureshtara sobre el conjunto de datos Chinese_english. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder de Whisper, con 37,7 millones de parametros totales y un tamano de repositorio de 0,3 GB. El objetivo declarado es adaptar el modelo base, entrenado originalmente por OpenAI, a un dominio concreto de habla inglesa con acento chino.

El modelo es relevante como ejemplo de adaptacion ligera de Whisper a dominios especificos con recursos minimos: el entrenamiento se realizo en 2000 pasos con un batch de 2 y una tasa de aprendizaje de 1e-5. La model card es practicamente autocontenida y generada de forma automatica por el Trainer, sin documentacion adicional sobre composicion del dataset ni casos de uso previstos.

Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de transcripcion. No obstante, el modelo tiene un alcance muy limitado: solo declara soporte para ingles, esta especializado en un unico dominio acustico y no cuenta con validacion independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper tiny) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con 37,7 millones de parametros disenado para transcripcion de audio. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autorregresiva. En este ajuste fino no se introduce ninguna modificacion arquitectonica: se reutiliza la topologia original y solo se actualizan los pesos mediante entrenamiento supervisado sobre el dataset Chinese_english.

El entrenamiento se realizo con el optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup, 2000 pasos totales, batch de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y tasa de aprendizaje 1e-5. La model card no documenta el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o RLHF/DPO. Las versiones de framework utilizadas fueron Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles con acento chino.
- Transcripcion de audio en ventanas de hasta 30 segundos, segun el diseno de Whisper tiny.
- Generacion de texto a partir de audio mediante decodificacion autorregresiva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio de entrada adicional): no disponible.

## Casos de uso

- Transcripcion de reuniones y clases con hablantes angloparlantes de origen chino: el ajuste sobre Chinese_english busca mejorar la tasa de error en este perfil acustico concreto, alli donde el Whisper tiny original comete mas errores.
- Subtitulado automatico de contenido audiovisual en ingles con acento chino: el modelo puede generar transcripciones base para postprocesado humano, con un coste computacional muy bajo.
- Prototipado de pipelines ASR en entornos con recursos limitados: sus 37,7 millones de parametros permiten ejecutarlo en CPU o en GPUs de gama baja para validar flujos de trabajo antes de escalar a modelos mayores.
- Preprocesado de audio para sistemas de analitica de voz: transcripcion de llamadas o grabaciones en ingles con acento chino como paso previo a busqueda, indexacion o mineria de texto.
- Evaluacion comparativa de estrategias de fine-tuning de Whisper: sirve como referencia de ajuste ligero (2000 pasos, batch 2) para investigadores que estudien la adaptacion a dominios con pocos datos.
- Integracion en aplicaciones de accesibilidad: transcripcion en tiempo casi real de audio en ingles para personas con discapacidad auditiva, siempre que el dominio acustico coincida con el de entrenamiento.
- Experimentacion docente: ejemplo reproducible de fine-tuning de un modelo ASR con la libreria Transformers y publicacion automatica de la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Chinese | Chinese English (split test) | WER | 13,328 % |
| Whisper tiny Chinese (checkpoint paso 1000) | Chinese English (validacion) | WER | 14,186 % |
| Whisper tiny Chinese (checkpoint paso 2000) | Chinese English (validacion) | WER | 13,328 % |
| Whisper tiny Chinese (checkpoint paso 2000) | Chinese English (validacion) | Loss | 0,3069 |

No se han publicado en la informacion disponible resultados comparativos con el modelo base `openai/whisper-tiny` ni con otros modelos ASR en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,15 GB solo para pesos; con activaciones y buffers de audio, menos de 1 GB en la practica.
- VRAM estimada en fp16: en torno a 0,08 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, GTX 1660 o superiores son mas que suficientes. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM (soporte ASR limitado), llama.cpp no aplica (no es un modelo de texto puro), TGI con soporte Whisper, y ONNX Runtime para despliegue en CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera inferencia en tiempo real o superior en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| sureshtara/whisper-tiny_to_chinese_accent_26oct | 37,7 M | 30 s (Whisper tiny) | en | apache-2.0 | 13,33 % (Chinese English) |
| openai/whisper-tiny | 39 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |

La comparacion directa con el modelo base no es posible con los datos disponibles, ya que no se ha publicado el WER de `openai/whisper-tiny` sobre el mismo split del dataset Chinese_english. El modelo ajustado es sustancialmente mas pequeno que whisper-base y whisper-small, por lo que se espera una precision inferior en dominios generales, compensada potencialmente en el dominio especifico de acento chino.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre un unico dataset de acento chino, el modelo puede degradarse en otros acentos o variedades del ingles.
- Riesgo de alucinacion: Whisper es propenso a generar texto plausible en segmentos de silencio o ruido; este ajuste fino no documenta mitigaciones.
- Limitaciones de contexto o idioma: solo declara ingles; no se garantiza un comportamiento correcto en otros idiomas. La ventana de audio efectiva es de 30 segundos por segmento, propia de Whisper tiny.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de licencia y atribucion.
- Caveat de produccion: el WER de 13,33 % no esta verificado de forma independiente y procede de un unico split de evaluacion; la model card no documenta el tamano ni la composicion del dataset Chinese_english.
- El modelo se genero de forma automatica con el Trainer y la model card no ha sido revisada manualmente; faltan secciones de usos previstos, limitaciones y datos de entrenamiento.
- El numero de descargas (24) y de likes (0) es muy bajo, lo que sugiere escasa validacion por parte de la comunidad.
- No se documenta el rendimiento en audio con ruido de fondo, multiples hablantes o grabaciones telefonicas, escenarios habituales en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sureshtara/whisper-tiny_to_chinese_accent_26oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Dataset Chinese_english: no disponible en la informacion proporcionada
