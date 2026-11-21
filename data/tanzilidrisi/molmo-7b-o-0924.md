# tanzilidrisi/Molmo-7B-O-0924

## Resumen

Molmo 7B-O es un modelo de visión-lenguaje (image-text-to-text) desarrollado por el Allen Institute for AI (Ai2) como parte de la familia Molmo. Se construye sobre el modelo de lenguaje OLMo-7B-1024-preview y utiliza OpenAI CLIP ViT-L/14-336 como codificador visual. Con 7.665 millones de parámetros, está entrenado sobre PixMo, un conjunto de aproximadamente un millón de pares imagen-texto altamente curados, y se distribuye bajo licencia Apache 2.0, lo que lo convierte en una alternativa totalmente abierta a modelos propietarios de tamaño similar.

El modelo resuelve tareas multimodales de descripción, razonamiento visual y respuesta a preguntas sobre imágenes, y según la model card se sitúa entre GPT-4V y GPT-4o tanto en benchmarks académicos como en evaluación humana. La relevancia actual radica en su carácter completamente open source: pesos, dataset y código de entrenamiento forman parte del compromiso de reproducibilidad de Ai2.

Esta ficha corresponde a la réplica publicada por el usuario `tanzilidrisi` del checkpoint oficial `allenai/Molmo-7B-O-0924`. El repositorio no registra descargas ni interacciones, y el checkpoint es una versión preview de la release de Molmo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual CLIP ViT-L/14-336 + LLM OLMo-7B-1024-preview |
| Parametros totales | 7.665.032.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card menciona ejecucion en float32 y bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 30,7 GB |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Pipeline | image-text-to-text |
| Modelos base | openai/clip-vit-large-patch14-336, allenai/OLMo-7B-1124 |

## Arquitectura y entrenamiento

Molmo 7B-O combina un codificador visual CLIP ViT-L/14-336 de OpenAI con el modelo de lenguaje OLMo-7B-1024-preview de Ai2. La imagen se procesa mediante el codificador visual y sus representaciones se integran en el LLM para la generacion condicionada por imagen. El checkpoint se carga mediante clases de transformers con codigo remoto (`AutoModelForCausalLM` y `AutoProcessor` con `trust_remote_code=True`), e incluye un metodo especifico `generate_from_batch` para la generacion multimodal.

El entrenamiento se realizo sobre PixMo, un dataset de aproximadamente un millon de pares imagen-texto altamente curados por Ai2. La model card indica que los artefactos completos (dataset PixMo, codigo de entrenamiento, evaluaciones y checkpoints intermedios) se publicarian en una fecha posterior, por lo que en el momento de la release preview no estaban disponibles. No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion detallada de escenas, objetos, personas y contextos visuales.
- Respuesta a preguntas visuales (VQA) en ingles.
- Razonamiento visual sobre la imagen proporcionada.
- Conversacion multimodal multi-turno mediante el procesador y el tokenizador integrados.
- Capacidades de generacion de texto heredadas del LLM base OLMo-7B.
- Soporte de ejecucion en float32, bfloat16 y autocast con CUDA.
- Integracion con vLLM (se recomienda version <= 0.7.2 por un bug de preprocesamiento documentado).
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes, audio ni modo thinking explicito.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo genera descripciones detalladas de fotografias, util para alt-text en plataformas web y aplicaciones de lectores de pantalla, aprovechando su entrenamiento sobre pares imagen-texto curados.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios en plataformas, con salida textual que puede filtrarse por reglas.
- Asistencia en documentacion tecnica: subir capturas de pantalla, diagramas o esquemas y obtener explicaciones textuales en ingles para manuales y guias.
- Analisis de imagenes en investigacion: extraccion de descripciones estructuradas de datasets visuales para anotacion asistida o preetiquetado.
- Educacion y tutoria visual: responder preguntas sobre figuras, graficos o fotografias en entornos de aprendizaje, con contexto conversacional.
- Prototipado de productos multimodales: al ser Apache 2.0 y open source, sirve como base para experimentar con pipelines image-text-to-text sin dependencia de APIs propietarias.
- Generacion de catalogos y metadatos: descripcion automatica de productos en e-commerce a partir de fotografias, en ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de 11 benchmarks academicos y Elo de preferencia humana):

| Modelo | Media en 11 benchmarks academicos | Elo de preferencia humana |
|---|---|---|
| Molmo 72B | 81,2 | 1077 |
| Molmo 7B-D | 77,3 | 1056 |
| Molmo 7B-O (este modelo) | 74,6 | 1051 |
| MolmoE 1B | 68,6 | 1032 |
| GPT-4o | 78,5 | 1079 |
| GPT-4V | 71,1 | 1041 |
| Gemini 1.5 Pro | 78,3 | 1074 |
| Gemini 1.5 Flash | 75,1 | 1054 |
| Claude 3.5 Sonnet | 76,7 | 1069 |
| Claude 3 Opus | 66,4 | 971 |
| Claude 3 Haiku | 65,3 | 999 |
| Qwen VL2 72B | 79,4 | no disponible en la informacion proporcionada |

No se desglosan en la informacion proporcionada los resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 30,7 GB, por lo que se necesita una GPU con al menos 32 GB de VRAM para inferencia en precision completa. En bfloat16 el requisito se reduce a unos 16 GB, y con autocast se mantiene la memoria de los pesos en float32 pero se acelera el computo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 32 GB o mas para float32. Para bfloat16, una RTX 4090 (24 GB) puede ser suficiente, aunque la model card advierte que bfloat16 puede alterar las salidas respecto a float32.
- Consumer GPU: cabe en RTX 4090 en bfloat16; en GPUs de 16 GB o menos no cabria en float32 y requeriria cuantizacion, para la que no se documentan opciones en la informacion proporcionada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo oficial documentado), vLLM (version <= 0.7.2 por un bug de preprocesamiento), y ejecucion con autocast en CUDA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 11 benchmarks | Elo humano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Molmo 7B-O | 7,665 mil millones | no disponible | 74,6 | 1051 | Apache 2.0 | Pesos abiertos en HF |
| Molmo 7B-D | no disponible | no disponible | 77,3 | 1056 | Apache 2.0 | Pesos abiertos en HF |
| GPT-4V | no disponible | no disponible | 71,1 | 1041 | Propietaria | Solo API |
| Gemini 1.5 Flash | no disponible | no disponible | 75,1 | 1054 | Propietaria | Solo API |
| Qwen VL2 72B | 72 mil millones (aproximado por nombre) | no disponible | 79,4 | no disponible | no disponible | Pesos abiertos en HF |

Molmo 7B-O supera a GPT-4V en la media de benchmarks academicos (74,6 frente a 71,1) y en Elo humano (1051 frente a 1041), y se queda ligeramente por debajo de Gemini 1.5 Flash (75,1 y 1054). Frente a Qwen VL2 72B, con un orden de magnitud mas de parametros, la diferencia en benchmarks academicos es de 4,8 puntos.

## Limitaciones y advertencias

- Modelo entrenado y evaluado principalmente en ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion en descripciones visuales: como todo modelo generativo, puede inventar detalles no presentes en la imagen.
- La model card no detalla sesgos conocidos del dataset PixMo ni del LLM base OLMo; se recomienda evaluar sesgos demograficos y culturales antes de desplegar en produccion.
- La ejecucion en bfloat16 puede cambiar las salidas respecto a float32, segun advierte la propia model card.
- vLLM presenta un bug de preprocesamiento documentado; se recomienda usar version <= 0.7.2 hasta que se corrija.
- Es un checkpoint preview: los artefactos completos de entrenamiento y evaluacion no estaban disponibles en el momento de la release.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base OLMo y CLIP tienen sus propias condiciones que conviene revisar.
- Este repositorio concreto es una replica de terceros (`tanzilidrisi`) sin descargas ni validacion de la comunidad; para produccion se recomienda usar el checkpoint oficial `allenai/Molmo-7B-O-0924`.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/tanzilidrisi/Molmo-7B-O-0924
- Checkpoint oficial: https://huggingface.co/allenai/Molmo-7B-O-0924
- Coleccion de la familia Molmo: https://huggingface.co/collections/allenai/molmo-66f379e6fe3b8ef090a8ca19
- Blog de anuncio: https://molmo.allenai.org/blog
- Paper: https://huggingface.co/papers/2409.17146
- PDF del paper: https://molmo.allenai.org/paper.pdf
- Demo: https://molmo.allenai.org/
- Modelo base OLMo: https://huggingface.co/allenai/OLMo-7B-1024-preview
- Codificador visual CLIP: https://huggingface.co/openai/clip-vit-large-patch14-336
- Incidencia de vLLM: https://github.com/vllm-project/vllm/issues/26451
