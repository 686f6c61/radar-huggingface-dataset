# TanmayShah29/satquery-router-qwen2.5-1.5b-lora

## Resumen

satquery-router-qwen2.5-1.5b-lora es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct en formato MLX cuantizado a 4 bits, desarrollado por TanmayShah29. Su funcion no es la generacion de texto general, sino convertir una pregunta en lenguaje natural sobre imagenes de satelite en una decision de enrutamiento estructurada en JSON para el asistente SatQuery: intencion primaria, intenciones secundarias, categorias de entidades, rango temporal y si se requiere fusion SAR para atravesar nubes. Sustituye a un enrutador basado en expresiones regulares.

El modelo resuelve un problema acotado de clasificacion de intenciones dentro de un pipeline de teledeteccion. Con solo 1.500 millones de parametros y un adaptador de 5,3 millones de parametros, logra un exact match del 65,1 % sobre un conjunto de test de 189 consultas cuando se combina con el enrutador regex como respaldo, frente al 31,7 % del regex solo y el 16,9 % del modelo base sin ajustar con prompting. Es relevante como ejemplo de ajuste fino barato y local (entrenado en un Apple M1 de 8 GB en unos 92 minutos) para tareas de enrutamiento determinista y salida estructurada.

La arquitectura subyacente es un transformer decoder de Qwen2.5, sobre el que se aplica un adaptador LoRA de rango 8 en las ultimas 16 de 28 capas. El modelo esta pensado exclusivamente para Apple silicon mediante mlx-lm y no se ha evaluado en otras configuraciones ni con los pesos fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base) + 5,3 millones (adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct, no especificada en la informacion) |
| Tipos de cuantizacion | 4 bits (MLX); solo evaluado con el base 4-bit y el adaptador sin fusionar |
| Idiomas soportados | Ingles y hinglish en escritura latina |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA para mlx-lm); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre mlx-community/Qwen2.5-1.5B-Instruct-4bit, un transformer decoder denso de 28 capas. El LoRA tiene rango 8, escala 20, se inserta en las ultimas 16 capas y afecta a todas las proyecciones de atencion y MLP, sumando 5,3 millones de parametros entrenables. La generacion se hace con temperatura 0 y un prompt de sistema y usuario fijos que incluyen pistas estructuradas (presencia de par bitemporal o de par SAR) y la consulta.

El entrenamiento uso 677 ejemplos sinteticos de chat (split de entrenamiento del dataset TanmayShah29/satquery-router-decisions mas copias derivadas por reglas para el modo bitemporal), con optimizador Adam a 5e-5, batch efectivo de 8, aproximadamente 4,7 epocas y calculo de perdida solo sobre los tokens de respuesta. Se ejecuto con mlx-lm 0.32.2 en un Apple M1 de 8 GB durante unos 92 minutos, seleccionando el checkpoint por exact match en validacion. No se menciona RLHF ni DPO; el ajuste es supervisado sobre etiquetas plateadas generadas por dos LLM.

## Capacidades

- Clasificacion de intenciones de consultas sobre imagenes de satelite en cinco campos estructurados (intent, secondary_intents, entities, temporal, cloud_piercing_required).
- Generacion de JSON conforme a un esquema v1.0 con seis intenciones primarias: bitemporal_change, crossmodal_fusion, sar_vqa, visual_grounding, scene_captioning y optical_vqa.
- Deteccion de necesidad de fusion SAR para atravesar nubosidad (cloud_piercing_required).
- Extraccion de entidades de siete categorias: runway, launchpad, building, maritime, flood, excavation y vegetation.
- Interpretacion de rangos temporales expresados en lenguaje natural (por ejemplo, "March -> Now" o "Pre-Event -> Post-Event").
- Comprension de ingles y hinglish en alfabeto latino.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido; su unica funcion es el enrutamiento.

## Casos de uso

- Enrutamiento de consultas en un asistente de teledeteccion: el modelo recibe la pregunta del usuario y las pistas de disponibilidad de imagenes, y devuelve la intencion primaria para que el orquestador de SatQuery seleccione el pipeline adecuado (VQA optico, SAR, cambio bitemporal, etc.).
- Deteccion de peticiones que requieren fusion SAR: cuando la consulta menciona nubes que ocultan un objetivo, el modelo marca cloud_piercing_required y activa la rama de radar, como en el ejemplo de la model card con un avion en la apron bajo monzon.
- Clasificacion de peticiones de cambio temporal: consultas del tipo "ha menguado el embalse desde 2023" se traducen a intent bitemporal_change con el rango temporal correspondiente, lo que permite al backend emparejar las dos fechas de captura.
- Preprocesado de lotes de consultas para analitica: al ser un modelo de 1,5B en 4 bits, puede ejecutarse localmente en un portatil Apple para etiquetar grandes volumenes de preguntas historicas y construir estadisticas de intencion sin coste de API.
- Respaldo determinista en produccion: combinado con el enrutador regex, el adaptador mejora el exact match del 31,7 % al 65,1 %, por lo que puede desplegarse como primera opcion con caida a reglas cuando la salida JSON no valida contra el esquema (aproximadamente el 10 % de los casos en test).
- Prototipado de asistentes verticales: sirve como plantilla de bajo coste para equipos que quieran sustituir heuristicas regex por un clasificador ajustado en dominios acotados, reutilizando el pipeline de datos y evaluacion publicado en el repositorio de GitHub.
- Servicio local via mlx_lm.server: el autor documenta el arranque como servidor con temperatura 0, lo que permite integrarlo en un flujo interno sin dependencias de nube.

## Benchmarks y rendimiento

Resultados sobre 189 consultas de test reservadas, ejecucion unica, etiquetas plateadas (dos LLM etiquetaron a ciegas y solo se conservaron los acuerdos completos):

| Enrutador | Exact match [IC 95 %] |
|---|---|
| Este adaptador + respaldo regex | 65,1 [58,2, 72,0] |
| Este adaptador solo | 59,8 [52,4, 66,7] |
| Qwen2.5-3B con reglas + 12 ejemplos | 47,1 [40,2, 54,0] |
| Enrutador regex | 31,7 [24,9, 38,1] |
| Mismo modelo base con reglas + 12 ejemplos | 16,9 [12,2, 22,8] |

Exact match significa acertar los cinco campos. El conjunto de test es probablemente mas facil que el trafico real porque el filtro de acuerdos elimina consultas ambiguas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Requiere Apple silicon; el autor lo entreno y evaluo en un Apple M1 de 8 GB.
- VRAM/unified memory estimada: el base 4-bit de 1,5B ocupa aproximadamente 1 GB en pesos, mas overhead de mlx-lm; cabe holgadamente en cualquier Mac con 8 GB o mas.
- GPU recomendadas: no aplica en el sentido CUDA; el formato MLX no se ejecuta en A100, H100 ni RTX 4090 sin conversion a otro runtime, y esa conversion no fue evaluada.
- Cabe en GPU de consumo solo si se convierte a otro formato (por ejemplo GGUF o safetensors), opcion no validada por el autor; fusionar o recuantizar degrada el rendimiento (un hermano de 3B perdio entre 9 y 21 puntos).
- Despliegue: mlx-lm (libreria y servidor `mlx_lm.server`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| satquery-router-qwen2.5-1.5b-lora | 1,5B + 5,3M LoRA | no disponible | Enrutamiento JSON para SatQuery | Apache 2.0 | HuggingFace (MLX) |
| Qwen2.5-3B-Instruct (prompted) | 3B | no disponible | Clasificacion por prompting con reglas y 12 ejemplos | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct base (prompted) | 1,5B | no disponible | Clasificacion por prompting con reglas y 12 ejemplos | Apache 2.0 | HuggingFace |
| Enrutador regex de SatQuery | no aplica | no aplica | Heuristicas por expresiones regulares | no disponible | Repositorio GitHub |

El adaptador supera al modelo de 3B prompted en 18 puntos de exact match (65,1 frente a 47,1) y al base sin ajustar en 48,2 puntos (65,1 frente a 16,9), con un coste de entrenamiento de 92 minutos en hardware de consumo.

## Limitaciones y advertencias

- Etiquetas plateadas: generadas por dos LLM sin revision humana; el conjunto de test excluye consultas ambiguas y probablemente sobreestima el rendimiento en trafico real.
- Consultas sinteticas y escritas por maquina; no evaluado con usuarios reales.
- Solo ingles y hinglish en escritura latina; no cubre otros idiomas ni otras escrituras.
- Sobrepredice entidades: solo 8 de 20 consultas de test sin entidades devolvieron lista vacia, y a menudo anade una categoria extra (por ejemplo, "has the reservoir shrunk since 2023?" devuelve ["flood", "vegetation"] cuando la guia indica ["flood"]).
- Falla con nubosidad implicita y con peticiones compuestas: "describe the port and box every tanker" se clasifica como optical_vqa en lugar de visual_grounding con scene_captioning secundario.
- Rendimiento mas debil en parafrasis.
- Especifico del esquema de SatQuery; no es un clasificador de intenciones general.
- Aproximadamente el 10 % de las salidas de test no validaron contra el esquema; es obligatorio validar el JSON y caer al enrutador regex.
- Solo se ha evaluado la combinacion base 4-bit MLX con el adaptador sin fusionar; fusionar o recuantizar altera el modelo y degrada el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluacion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TanmayShah29/satquery-router-qwen2.5-1.5b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/TanmayShah29/satquery-router-decisions
- Codigo, pipeline de datos, evaluacion y write-up: https://github.com/TanmayShah29/llm-query-router
- Proyecto SatQuery: https://github.com/TanmayShah29/SATQuery-AI
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Guias de etiquetado: docs/router-ft/GUIDELINES.md dentro del repositorio llm-query-router
