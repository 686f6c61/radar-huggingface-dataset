# wycliffeassociates/Pixtral-12B-2409

# Ficha tecnica: wycliffeassociates/Pixtral-12B-2409

## Resumen

wycliffeassociates/Pixtral-12B-2409 es un ajuste fino del modelo multimodal de pesos abiertos mistralai/Pixtral-12B-Base-2409, publicado por la organizacion wycliffeassociates en HuggingFace. Se trata de un modelo nativamente multimodal que combina un decodificador de aproximadamente 12.000 millones de parametros con un codificador de vision de 400 millones de parametros, capaz de procesar de forma conjunta texto e imagenes intercaladas.

El modelo hereda la arquitectura y las capacidades de la familia Pixtral de Mistral AI: ventana de contexto de 128.000 tokens, soporte para imagenes de tamano variable, entrenamiento con datos intercalados de imagen y texto y licencia Apache 2.0. Su interes practico esta en ofrecer comprension visual (documentos, graficos, diagramas) con un tamano contenido que permite desplegarlo en una sola GPU.

El punto critico es que la model card publicada por wycliffeassociates reproduce practicamente la informacion del modelo base de Mistral y no documenta el proceso de ajuste: se desconocen el conjunto de datos empleado, la metodologia (SFT, DPO, etc.) y cualquier evaluacion propia del finetune. Ademas, el repositorio registra cero descargas y cero valoraciones, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decodificador de 12B + codificador de vision de 400M |
| Parametros totales | ~12.000 millones (decodificador) + 400 millones (codificador de vision) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (segun la model card) |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 25,4 GB; no confirmado de forma explicita en la informacion disponible) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal nativo compuesto por un decodificador de 12.000 millones de parametros y un codificador de vision de 400 millones. El modelo fue entrenado con datos intercalados de imagen y texto, lo que le permite razonar sobre secuencias que alternan contenido textual y visual. Soporta imagenes de tamano variable, lo que evita el reescalado forzado a una resolucion fija y mejora el rendimiento en documentos y graficos con detalle fino. La model card tambien indica que el modelo mantiene un rendimiento de referencia en tareas exclusivamente de texto, ademas de las multimodales.

Este repositorio concreto es un finetune de mistralai/Pixtral-12B-Base-2409. La informacion disponible no detalla el numero de tokens de entrenamiento del ajuste, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas introducidas por el ajuste. Toda la descripcion de arquitectura y capacidades procede del modelo base de Mistral, no del finetune.

## Capacidades

- Generacion de texto y razonamiento sobre lenguaje natural.
- Comprension de imagenes: descripcion, analisis y respuesta a preguntas sobre contenido visual (VQAv2, MMMU).
- Procesamiento de documentos: lectura y extraccion de informacion de documentos escaneados (DocVQA).
- Comprension de graficos y tablas: interpretacion de diagramas y datos visuales (ChartQA).
- Razonamiento matematico con soporte visual (Mathvista, tarea Math).
- Generacion de codigo (HumanEval).
- Soporte de multiples imagenes por mensaje y conversaciones multiturno con contexto visual (documentado en los ejemplos de uso de vLLM).
- Capacidades multilingues en nueve idiomas: ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales: procesamiento de imagenes de tamano variable mediante el tokenizador mistral-common; no se documentan modos de pensamiento (thinking) ni entrada de audio.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede procesar facturas, formularios o contratos escaneados y devolver campos estructurados, apoyandose en su alto rendimiento en DocVQA (90,7 ANLS) y en el soporte de imagenes de tamano variable.
- Analisis de informes financieros con graficos: interpretacion de graficos de barras, lineas y tablas para extraer tendencias, aprovechando el resultado de 81,8 en ChartQA.
- Atencion al cliente multimodal: gestion de conversaciones multiturno donde el usuario adjunta capturas de pantalla o fotos, con margen para contexto largo gracias a los 128.000 tokens de ventana.
- Traduccion y transcripcion asistida: dado el perfil de la organizacion autora, el modelo puede emplearse en flujos de traduccion apoyados en contexto visual, cubriendo nueve idiomas declarados.
- Revision de codigo y generacion de fragmentos: con 72,0 en HumanEval, es utilizable como asistente de programacion, aunque no hay documentacion de soporte de tool calling para integrarlo en pipelines automatizados.
- Accesibilidad y descripcion de imagenes: generacion de descripciones textuales de contenido visual para aplicaciones de asistencia a personas con discapacidad visual.
- Procesamiento por lotes con vLLM: el modelo esta preparado para despliegues de alto rendimiento mediante la libreria vLLM, lo que permite servir multiples peticiones concurrentes con imagenes y texto.
- Analisis de material grafico educativo: resolucion de problemas matematicos y cientificos con diagramas, apoyandose en las capacidades de razonamiento visual.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion proceden de la model card y corresponden a la familia Pixtral-12B publicada por Mistral AI, evaluada con un pipeline comun. No hay datos de evaluacion especificos de este finetune de wycliffeassociates, por lo que deben interpretarse como una referencia del modelo base y no como una garantia del rendimiento de este ajuste.

Benchmarks multimodales:

| Benchmark | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MMMU (CoT) | 52,5 | 47,6 | 45,1 | 40,3 | 38,3 |
| Mathvista (CoT) | 58,0 | 54,4 | 36,1 | 36,4 | 39,3 |
| ChartQA (CoT) | 81,8 | 38,6 | 67,1 | 72,0 | 67,7 |
| DocVQA (ANLS) | 90,7 | 94,5 | 90,5 | 84,9 | 74,4 |
| VQAv2 (VQA Match) | 78,6 | 75,9 | 78,3 | 42,4 | 56,1 |

Seguimiento de instrucciones:

| Benchmark | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MM MT-Bench | 6,05 | 5,43 | 4,12 | 3,70 | 4,46 |
| Text MT-Bench | 7,68 | 6,41 | 6,94 | 6,27 | 6,31 |
| MM IF-Eval | 52,7 | 38,9 | 42,5 | 41,2 | 31,4 |
| Text IF-Eval | 61,3 | 50,1 | 51,4 | 50,9 | 47,4 |

Benchmarks de texto:

| Benchmark | Pixtral 12B | Qwen2 7B VL | LLaVA-OV 7B | Phi-3 Vision | Phi-3.5 Vision |
|---|---|---|---|---|---|
| MMLU (5-shot) | 69,2 | 68,5 | 67,9 | 63,5 | 63,6 |
| Math (Pass@1) | 48,1 | 27,8 | 38,6 | 29,2 | 28,4 |
| Human Eval (Pass@1) | 72,0 | 64,6 | 65,9 | 48,8 | 49,4 |

Comparacion con modelos cerrados y de mayor tamano:

| Benchmark | Pixtral 12B | Claude-3 Haiku | Gemini-1.5 Flash 8B (0827) | LLaVA-OV 72B | GPT-4o | Claude-3.5 Sonnet |
|---|---|---|---|---|---|---|
| MMMU (CoT) | 52,5 | 50,4 | 50,7 | 54,4 | 68,6 | 68,0 |
| Mathvista (CoT) | 58,0 | 44,8 | 56,9 | 57,2 | 64,6 | 64,4 |
| ChartQA (CoT) | 81,8 | 69,6 | 78,0 | 66,9 | 85,1 | 87,6 |
| DocVQA (ANLS) | 90,7 | 74,6 | 79,5 | 91,6 | 88,9 | 90,3 |
| VQAv2 (VQA Match) | 78,6 | 68,4 | 65,5 | 83,8 | 77,8 | 70,7 |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 25 GB solo para los pesos (12B x 2 bytes mas el codificador de vision). El KV cache del contexto largo anade una cantidad adicional considerable, por lo que la ventana completa de 128k exige reservar mas memoria.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 13-14 GB para pesos (estimacion; el repositorio no publica versiones cuantizadas).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 7-9 GB para pesos (estimacion; no confirmada en la informacion disponible).
- GPU recomendadas: A100 (40 o 80 GB) o H100 (80 GB) para produccion con contexto amplio; una RTX 4090 o RTX 3090 (24 GB) es suficiente para bf16 con contexto reducido o para versiones cuantizadas.
- Cabe en GPU de consumo: si, en GPUs de 24 GB (RTX 3090, RTX 4090) con contexto limitado en precision completa o con cuantizacion para contexto amplio.
- Opciones de despliegue: vLLM (recomendado por el autor, version >= 0.6.2) junto con mistral_common >= 1.4.4; existe una imagen Docker oficial vllm/vllm-openai. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La tabla compara este finetune con las alternativas multimodales de tamano comparable que aparecen en los benchmarks. Los datos de parametros y contexto de los modelos comparados no se detallan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pixtral-12B-2409 (este finetune) | 12B + 400M | 128k | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen2-VL 7B | ~7B (segun denominacion) | no disponible | no disponible | Pesos abiertos |
| LLaVA-OV 7B | ~7B (segun denominacion) | no disponible | no disponible | Pesos abiertos |
| Phi-3.5 Vision | no disponible | no disponible | no disponible | Pesos abiertos |

En rendimiento multimodal, Pixtral 12B supera a Qwen2 7B VL y a LLaVA-OV 7B en MMMU, Mathvista, ChartQA, VQAv2 y en las metricas de seguimiento de instrucciones, mientras que queda por debajo de Qwen2 7B VL en DocVQA. Frente a modelos cerrados y de mayor tamano (GPT-4o, Claude-3.5 Sonnet), se mantiene competitivo en DocVQA y ChartQA, pero queda claramente por debajo en MMMU.

## Limitaciones y advertencias

- Ausencia de documentacion del finetune: no se especifican dataset, metodo de ajuste ni evaluacion propia, lo que impide saber en que se diferencia este repositorio del modelo base de Mistral.
- Los benchmarks presentados corresponden a la familia Pixtral-12B de Mistral AI y no a este ajuste concreto; no garantizan el rendimiento real del finetune.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar contenido, especialmente en OCR y documentos con texto poco legible o grafias ambiguas.
- Sesgos: no hay informacion sobre la composicion del dataset de ajuste ni sobre sesgos conocidos.
- Limitaciones de idioma: los nueve idiomas declarados proceden de la model card; el rendimiento real en idiomas distintos del ingles no esta cuantificado en la informacion disponible.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial. Sin embargo, la model card del repositorio incluye una clausula de control de acceso (gated) que remite a la politica de privacidad de Mistral, por lo que conviene revisar las condiciones de acceso antes de reutilizarlo.
- Metadatos adversos para produccion: el repositorio indica `inference: false`, lo que sugiere que no esta preparado para la Inference API de HuggingFace.
- Validacion comunitaria nula: cero descargas y cero valoraciones en el momento de la consulta, sin garantias de calidad aportadas por terceros.
- El punto de truncamiento del contexto util puede diferir del maximo nominal de 128k; el ejemplo de uso de vLLM limita `max_model_len` a 32768 en GPUs de VRAM reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wycliffeassociates/Pixtral-12B-2409
- Modelo base: https://huggingface.co/mistralai/Pixtral-12B-Base-2409
- Blog de lanzamiento de Pixtral-12B (Mistral AI): https://mistral.ai/news/pixtral-12b/
- Demo de chat: https://chat.mistral.ai/chat
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Imagen Docker vllm/vllm-openai: https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39
- Politica de privacidad de Mistral (referenciada en la model card): https://mistral.ai/terms/
