# TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator

## Resumen

Qwen3.5-4B-Danbooru-Prompt-Generator es un ajuste fino del modelo Qwen3.5-4B (a traves de la variante cuantizada de techwithsergiu) especializado en la expansion de etiquetas de Danbooru en prompts completos para generacion de imagenes anime. Lo desarrolla el usuario TRYZER01 y resuelve un problema muy concreto: convertir un puñado de tags semilla en una lista extensa y coherente de etiquetas Danbooru listas para un codificador de prompts de Stable Diffusion o Flux. Es relevante para la comunidad de generacion de imagenes anime porque integra sintaxis especifica del dominio (negacion semantica, control de rating) y se distribuye junto con un nodo para ComfyUI.

El modelo es un transformer decoder-only de 4.205.751.296 parametros (4,2 mil millones), derivado de la familia Qwen3.5, con licencia Apache 2.0. Se ofrece en dos formatos: safetensors en BF16 para Transformers y un GGUF de aproximadamente 2,7 GB para inferencia ligera. Es un modelo exclusivamente de texto: no procesa imagenes como entrada.

Su interes practico radica en la especializacion: no es un modelo generalista, sino una herramienta de nicho que entiende la gramatica de Danbooru (tags con guiones bajos, negaciones con prefijo `-`, control explicito de rating) y que se puede desplegar en local con LM Studio o Transformers sin infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors), GGUF (build incluido, ~2,7 GB) |
| Idiomas soportados | no disponible (entrada/salida basada en tags en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint techwithsergiu/Qwen3.5-text-4B-bnb-4bit, que a su vez deriva de Qwen/Qwen3.5-4B. La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con 4,2 mil millones de parametros. El autor publica el modelo como un merge en BF16 (no como adaptador LoRA), de modo que los pesos resultantes son directamente cargables con Transformers y exportables a GGUF.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO. Si se indica que los datos de entrenamiento fueron mayoritariamente NSFW, lo que explica el sesgo del modelo hacia contenido explicito. El ajuste incorpora una plantilla de chat propia que debe usarse con el modo thinking desactivado: con razonamiento activado, el modelo escribe los tags dentro del bloque de razonamiento y la respuesta final queda vacia. La innovacion tecnica mas destacable no es arquitectonica sino de interfaz: la negacion semantica mediante prefijo `-`, que hace que el modelo evite un concepto y sus tags relacionados, y el control de rating mediante sintaxis `rating:general` / `rating:explicit`.

## Capacidades

- Generacion de prompts Danbooru: expande un conjunto reducido de tags semilla en una lista completa de etiquetas separadas por comas con guiones bajos en tags multi-palabra.
- Negacion semantica: un tag prefijado con `-` (por ejemplo `-nude`) hace que el modelo evite ese concepto y tags relacionados.
- Control de rating: acepta `rating:general` y `rating:explicit` para orientar el contenido generado.
- Generacion de texto autoregresiva con plantilla de chat conversacional (rol usuario).
- Integracion con ComfyUI mediante un nodo que se comunica por HTTP con un servidor de modelo (LM Studio).
- Salida compatible con codificadores de prompts positivos de pipelines de difusion.
- No soporta vision, audio ni entrada multimodal: es exclusivamente de texto.
- No se documenta soporte de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Generacion de prompts para imagenes anime en ComfyUI: el nodo incluido envia los tags semilla al servidor LM Studio, recibe la expansion y conecta `formatted_prompt` directamente al codificador de prompt positivo. Es el flujo para el que el modelo fue disenado.
- Prototipado rapido de personajes: a partir de `1girl, long_hair, school_uniform` el modelo produce variaciones de tags coherentes para explorar disenos antes de fijar un prompt final.
- Control de contenido en pipelines SFW: usando `rating:general` junto con negaciones como `-nude`, el modelo sirve para generar prompts orientados a contenido seguro, con revision manual posterior dado que no garantiza SFW.
- Generacion de prompts explicito controlado: con `rating:explicit` el modelo produce tags alineados con contenido para adultos, util en flujos de trabajo con audiencia y filtros definidos por el operador.
- Automatizacion de lotes de imagenes: integrado en un servidor LM Studio accesible por red, el nodo puede alimentar generaciones por lotes en ComfyUI sin cargar el modelo en el proceso de ComfyUI.
- Herramienta de asistencia para artistas: expansion de ideas vagas en vocabulario Danbooru canonico, reduciendo el tiempo de busqueda manual de tags en el sitio de Danbooru.
- Despliegue ligero en hardware de consumo: el GGUF de ~2,7 GB permite ejecutar el modelo en equipos sin GPU dedicada de gran capacidad mediante LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,4 GB solo para pesos, mas la cache KV; el autor recomienda el build GGUF para menor consumo de memoria.
- GGUF: fichero de aproximadamente 2,7 GB, adecuado para equipos con VRAM limitada o inferencia en CPU.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 sobran para BF16, y el GGUF cabe en GPUs consumer de gama media.
- Cabe en GPU consumer: si, especialmente con el build GGUF; en BF16 requiere al menos ~10 GB efectivos contando cache KV.
- Opciones de despliegue: Transformers (>=5.5.0) con accelerate y safetensors; LM Studio para el GGUF con servidor local compatible con la API de OpenAI; integracion con ComfyUI mediante el nodo incluido.
- Latencia y throughput: no disponibles.
- Requisito de API para el nodo: ademas de `POST /v1/chat/completions`, el servidor debe exponer `GET /api/v1/models` y `POST /api/v1/models/load`; un endpoint compatible con OpenAI por si solo no basta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator | 4,2 B | no disponible | Prompts Danbooru anime | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen3.5-4B (base) | 4 B (aproximado, segun denominacion) | no disponible | Proposito general | no disponible en la informacion | no disponible |
| techwithsergiu/Qwen3.5-text-4B-bnb-4bit | no disponible | no disponible | Proposito general cuantizado | no disponible en la informacion | bnb-4bit |

No se dispone de datos de benchmarks ni de otros ajustes Danbooru comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgo hacia contenido NSFW: los datos de entrenamiento fueron mayoritariamente explicitos, por lo que el modelo tiende a generar contenido para adultos incluso con instrucciones SFW; las negaciones y `rating:general` no garantizan salida segura.
- Riesgo de alucinacion de tags: puede generar etiquetas que no existen en Danbooru; el autor recomienda preferir tags que existan en el sitio.
- Modo thinking obligatoriamente desactivado: con razonamiento activado la respuesta final queda vacia, lo que puede romper integraciones que no controlen ese parametro.
- Modelo solo texto: no acepta imagenes como entrada.
- Idiomas: no se documenta soporte multilingue; la sintaxis de entrada y salida esta en ingles (tags Danbooru).
- Longitud de contexto: no documentada, lo que dificulta planificar conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a las politicas de la plataforma de generacion de imagenes y a la legislacion aplicable sobre contenido para adultos.
- Contenido para adultos: el modelo esta marcado como `not-for-all-audiences`; su uso en produccion requiere controles de acceso y filtrado propios.
- Dependencia de LM Studio para el nodo ComfyUI: el contrato de API exige endpoints de gestion de modelos que no todos los servidores compatibles con OpenAI implementan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator
- Modelo base intermedio: https://huggingface.co/techwithsergiu/Qwen3.5-text-4B-bnb-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Danbooru (referencia de tags): https://danbooru.donmai.us/tags
