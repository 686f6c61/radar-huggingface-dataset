# zai-org/glm-4-9b-chat

## Resumen

GLM-4-9B-Chat es la version alineada con preferencias humanas del modelo preentrenado GLM-4-9B, desarrollado por Zhipu AI (publicado en HuggingFace bajo la organizacion zai-org y THUDM). Se trata de un transformer decoder-only de aproximadamente 9.400 millones de parametros (9.399.951.392 segun los pesos en safetensors) disenado para conversacion multi-turno y tareas de razonamiento, matematicas y generacion de codigo. Su relevancia radica en que, con un tamano contenido, iguala o supera a Llama-3-8B-Instruct en benchmarks de razonamiento, matematicas y codigo, y se acerca a gpt-4-turbo-2024-04-09 en capacidad de llamada a funciones.

Este repositorio concreto soporta una longitud de contexto de 128.000 tokens (con una variante separada, GLM-4-9B-Chat-1M, que alcanza 1.000.000 de tokens). El modelo incorpora capacidades avanzadas como navegacion web, ejecucion de codigo, llamada a funciones personalizadas y razonamiento sobre contextos largos. Aunque los metadatos declaran idiomas zh y en, el autor afirma soporte para 26 idiomas, incluyendo japones, coreano y aleman.

El modelo se publico el 4 de junio de 2024 y se actualizo por ultima vez el 13 de marzo de 2025. Acumula mas de 87.000 descargas y 771 likes en HuggingFace. Su licencia es la "glm-4", una licencia personalizada de tipo "other" que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GLM-4) |
| Parametros totales | 9.399.951.392 (aprox. 9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (variante 1M: GLM-4-9B-Chat-1M) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos nativos en bfloat16) |
| Idiomas soportados | Metadatos: zh, en. El autor declara soporte para 26 idiomas (incluye ja, ko, de, entre otros) |
| Licencia | glm-4 (license: other, license_name: glm-4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-4-9B-Chat es un modelo de la familia GLM-4 basado en una arquitectura transformer decoder-only, con implementacion personalizada (etiqueta custom_code en HuggingFace), por lo que requiere `trust_remote_code=True` para cargarse. El modelo parte de un preentrenamiento a gran escala y posteriormente se somete a un proceso de alineacion con preferencias humanas (el autor lo describe como version "human preference aligned"). No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

Una de las innovaciones tecnicas destacadas es el trabajo de escalado de contexto largo, documentado por el autor en un informe tecnico especifico (GLM-Long: scaling pre-trained model contexts to millions). Esto permite que la variante estandar maneje 128K tokens y que la variante 1M alcance aproximadamente dos millones de caracteres chinos de contexto, con buen rendimiento en la prueba de "aguja en un pajar" a 1M de contexto. No se indica en la informacion proporcionada si se empleo RLHF, DPO u otra tecnica de alineacion concreta.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles principalmente, con soporte declarado para 26 idiomas.
- Razonamiento, matematicas y conocimiento general (evaluado en MMLU, MATH, GSM8K, C-Eval).
- Generacion de codigo (evaluado en HumanEval y NCB).
- Llamada a funciones y herramientas personalizadas (function calling), con resultados de primer nivel en el Berkeley Function Calling Leaderboard.
- Razonamiento sobre contextos largos de hasta 128K tokens (1M en la variante especifica), incluyendo tareas de recuperacion de informacion.
- Capacidades de agente y razonamiento multi-paso, incluida navegacion web y ejecucion de codigo segun el autor.
- Alineacion con preferencias humanas para respuestas conversacionales (AlignBench-v2, MT-Bench).
- Capacidades multilingues evaluadas en M-MMLU, FLORES, MGSM, XWinograd, XStoryCloze y XCOPA.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) en chino e ingles, recordando el historial de la interaccion y consultando informacion previa sin perder el hilo.
- Integracion de agentes con herramientas: gracias a su function calling de alto rendimiento, puede orquestar APIs externas, bases de datos o servicios internos, encadenando varias llamadas en un mismo flujo de trabajo.
- Asistente de generacion de codigo: con soporte para ejecucion de codigo y buenos resultados en HumanEval, puede integrarse en editores o pipelines de CI/CD para sugerir parches, generar tests o revisar cambios.
- Analisis de documentos extensos: con 128K tokens de contexto puede procesar informes largos, contratos o expedientes completos y responder preguntas sobre su contenido sin fragmentacion excesiva.
- Razonamiento matematico asistido: util para tutoria, resolucion paso a paso de problemas y verificacion de calculos (GSM8K 79,6, MATH 50,6).
- Navegacion web y extraccion de informacion: el modelo puede emplearse como agente que consulta paginas web y resume o extrae datos estructurados.
- Traduccion y asistencia multilingue: con soporte declarado de 26 idiomas y resultados en FLORES, MGSM o XCOPA, es adecuado para tareas de traduccion y procesamiento multilingue, especialmente en combinaciones con el chino.
- Chatbot de dominio especifico con contexto largo: desplegable en entornos con documentacion tecnica extensa que deba mantenerse en la ventana de contexto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | AlignBench-v2 | MT-Bench | IFEval | MMLU | C-Eval | GSM8K | MATH | HumanEval | NCB |
|---|---|---|---|---|---|---|---|---|---|
| Llama-3-8B-Instruct | 5,12 | 8,00 | 68,58 | 68,4 | 51,3 | 79,6 | 30,0 | 62,2 | 24,7 |
| ChatGLM3-6B | 3,97 | 5,50 | 28,1 | 66,4 | 69,0 | 72,3 | 25,7 | 58,5 | 11,3 |
| GLM-4-9B-Chat | 6,61 | 8,35 | 69,0 | 72,4 | 75,6 | 79,6 | 50,6 | 71,8 | 32,2 |

Capacidad multilingue (seleccion de idiomas por dataset):

| Dataset | Llama-3-8B-Instruct | GLM-4-9B-Chat |
|---|---|---|
| M-MMLU | 49,6 | 56,6 |
| FLORES | 25,0 | 28,8 |
| MGSM | 54,0 | 65,3 |
| XWinograd | 61,7 | 73,1 |
| XStoryCloze | 84,7 | 90,7 |
| XCOPA | 73,3 | 80,1 |

Llamada a funciones (Berkeley Function Calling Leaderboard):

| Modelo | Overall Acc. | AST Summary | Exec Summary | Relevance |
|---|---|---|---|---|
| Llama-3-8B-Instruct | 58,88 | 59,25 | 70,01 | 45,83 |
| gpt-4-turbo-2024-04-09 | 81,24 | 82,14 | 78,61 | 88,75 |
| ChatGLM3-6B | 57,88 | 62,18 | 69,78 | 5,42 |
| GLM-4-9B-Chat | 81,00 | 80,26 | 84,40 | 87,92 |

Tambien se reportan resultados del experimento de "aguja en un pajar" a 1M de contexto y en LongBench-Chat, presentados graficamente por el autor (no se incluyen valores numericos en la informacion disponible).

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 9,4 B de parametros):
  - bfloat16/fp16: en torno a 19-20 GB, mas memoria para KV cache.
  - int8: en torno a 10-11 GB.
  - int4: en torno a 5-6 GB.
- Con contexto de 128K tokens, la KV cache puede crecer de forma notable y exigir GPUs con VRAM amplia.
- GPUs recomendadas: A100 (40/80 GB) o H100 para despliegues con contexto largo; en consumer cabe con cuantizacion int4 en tarjetas con 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070) y con bfloat16 en RTX 4090 (24 GB) para contextos moderados.
- El ejemplo oficial de vLLM usa `max_model_len=131072` y `tensor_parallel_size=1` para la variante 128K, y `max_model_len=1048576` con `tp_size=4` para la variante 1M.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM. No se confirman en la informacion disponible soportes especificos de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Function calling (Overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| GLM-4-9B-Chat | 9,4 B | 128K (1M en variante) | 72,4 | 71,8 | 81,00 | glm-4 (other) | HuggingFace (zai-org / THUDM) |
| Llama-3-8B-Instruct | 8 B | 8K (segun version) | 68,4 | 62,2 | 58,88 | Llama 3 (propietaria) | HuggingFace / Meta |
| ChatGLM3-6B | 6 B | no disponible en la informacion | 66,4 | 58,5 | 57,88 | glm-3 | HuggingFace (THUDM) |
| gpt-4-turbo-2024-04-09 | no disponible | no disponible | no disponible | no disponible | 81,24 | propietaria | API de OpenAI |

GLM-4-9B-Chat destaca frente a Llama-3-8B-Instruct en MMLU (72,4 vs 68,4), MATH (50,6 vs 30,0), HumanEval (71,8 vs 62,2) y en function calling (81,00 vs 58,88), y se aproxima a gpt-4-turbo en esta ultima tarea. La comparacion de contexto con Llama-3-8B-Instruct depende de la version concreta de este ultimo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; como cualquier modelo entrenado con datos web, es susceptible de sesgos sociales y culturales, especialmente en idiomas con menor representacion.
- Riesgo de alucinacion: presente como en la mayoria de LLM; los resultados de benchmarks no garantizan veracidad en dominios especializados.
- Limitacion de contexto: la variante estandar soporta 128K tokens; para ventanas cercanas a 1M es necesario usar GLM-4-9B-Chat-1M, que puede requerir mayor paralelismo y VRAM.
- Idiomas: los metadatos oficiales solo declaran zh y en, aunque el autor afirma soporte para 26 idiomas; conviene validar la calidad real en cada idioma antes de produccion.
- Licencia: la licencia "glm-4" es personalizada (license: other) y debe revisarse en detalle antes de cualquier uso comercial; puede imponer restricciones adicionales.
- Codigo personalizado: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo proporcionado por el autor al cargarlo.
- Compatibilidad: el autor recomienda `transformers>=4.46.0` con el repositorio `glm-4-9b-chat-hf` para evitar problemas de compatibilidad en actualizaciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zai-org/glm-4-9b-chat
- Repositorio alternativo recomendado: https://huggingface.co/THUDM/glm-4-9b-chat-hf
- Licencia: https://huggingface.co/THUDM/glm-4-9b-chat/blob/main/LICENSE
- Repositorio GitHub (inferencia y dependencias): https://github.com/THUDM/GLM-4
- Requisitos de dependencias: https://github.com/THUDM/GLM-4/blob/main/basic_demo/requirements.txt
- Articulo (arXiv:2406.12793): https://arxiv.org/abs/2406.12793
- Informe tecnico sobre contexto largo (GLM-Long): https://medium.com/@ChatGLM/glm-long-scaling-pre-trained-model-contexts-to-millions-caa3c48dea85
- Script de evaluacion "aguja en un pajar": https://github.com/LargeWorldModel/LWM/blob/main/scripts/eval_needle.py
- Berkeley Function Calling Leaderboard: https://github.com/ShishirPatil/gorilla/tree/main/berkeley-function-call-leaderboard
- Plataforma del desarrollador: https://z.ai/
