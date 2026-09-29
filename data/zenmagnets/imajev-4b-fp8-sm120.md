# zenmagnets/Imajev-4B-FP8-SM120

## Resumen

Imajev-4B-FP8-SM120 es una conversión comunitaria a FP8 del modelo Imajev-4B, un modelo de decisión tipada (typed-decision) desarrollado por mohit67890 sobre un backbone Qwen3.5-4B. No es un modelo de chat convencional: en lugar de generar texto libre, recibe un estado y un conjunto de preguntas estructuradas y devuelve una opción seleccionada junto con probabilidades calibradas y una probabilidad explícita de abstención. El paquete, publicado por el usuario zenmagnets, incluye tanto los pesos cuantizados como un runtime de servicio optimizado para GPUs NVIDIA Blackwell (SM120).

El componente cuantizado parte de los pesos BF16 fijados de Qwen3.5-4B y los convierte a FP8 E4M3 con bloques de pesos de 128x128 y escalas en FP32. Sobre esa base se cargan, sin modificar, el adaptador LoRA de fase 3 (rango 64) del Imajev original, su cabecera de decisión calibrada y los ficheros de calibración. La inferencia es de precisión mixta: visión, embeddings, normalizaciones y algunas proyecciones permanecen en BF16, mientras que el readout se mantiene en FP32. El total de parámetros declarado en safetensors es de 4.659.865.088, lo que sitúa el modelo en torno a 4,66 mil millones de parámetros.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de despliegue muy concreta (block-FP8 con FlashInfer/CUTLASS sobre SM120) con ganancias medidas de 1,48x a 1,75x en velocidad de scoring frente a la referencia BF16 guardada, en casos de hasta 4K tokens. Por otro, advierte de que se trata de una release experimental: el perfil optimizado obtuvo 258/340 en un subconjunto de decisión de 340 casos, frente a 259/340 del perfil FP8 de referencia y 263/340 de las predicciones BF16 guardadas, y consume más VRAM que la referencia. La licencia es apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5-4B) con adaptador LoRA de rango 64 y cabecera de decision calibrada (readout 256x2560 en FP32) |
| Parametros totales | 4.659.865.088 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el runtime declara un techo de 65.536 tokens procesados y usa CUDA graphs hasta 4.096 tokens |
| Tipos de cuantizacion | FP8 E4M3 con bloques de pesos 128x128 y escalas FP32; precision mixta con vision, embeddings, norms y proyecciones excluidas en BF16; LoRA distribuido en FP32 y casteado a BF16 en memoria; readout en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. La base es Qwen3.5-4B, convertida desde sus pesos BF16 fijados ("pinned") a FP8 E4M3 mediante bloques de peso de 128x128 con escalas en FP32. Sobre esa base se cargan los tensores oficiales del LoRA de fase 3 de Imajev (rango 64), la cabecera de decision y los ficheros de calibracion del proyecto original. El adaptador no se fusiona en la base FP8: se mantiene como modulo separado en FP32 en disco y el runtime optimizado castea las matrices LoRA a BF16 en memoria, mientras que el readout permanece siempre en FP32. La vision, los embeddings, las normalizaciones y determinadas proyecciones se mantienen en BF16, por lo que se trata de inferencia de precision mixta y no de un modelo enteramente FP8.

El autor declara explicitamente que no hubo entrenamiento adicional ni ajuste de calibracion en esta release. La innovacion tecnica esta en el runtime: el perfil `sm120` combina el GEMM block-FP8 de CUTLASS para SM120 integrado en FlashInfer con un cuantizador de activaciones Triton fusionado, y reutiliza activaciones cuantizadas. El resultado medido es de 1,48x a 1,75x mas velocidad de scoring que la referencia BF16 guardada en casos cortos hasta 4K tokens. Ambos perfiles (`sm120` optimizado y `reference` con FP8 original) comparten cuatro rotaciones de opciones, la calibracion original, el readout FP32 de 256x2560, el techo de 65.536 tokens procesados y CUDA graphs hasta 4.096 tokens. El servidor upstream procesa las peticiones de GPU de forma serial, de modo que las llamadas concurrentes se encolan en lugar de aprovechar continuous batching.

## Capacidades

- Decision tipada: responde preguntas estructuradas de tipo `choice` (opciones nombradas), `noul` (probabilidad para una proposicion) y `score` (criterios ordenados).
- Probabilidades calibradas: cada respuesta incluye la opcion seleccionada, sus probabilidades y una `unknown_probability` junto con el indicador `abstained`, lo que permite umbrales de abandono configurables.
- Vision-language: acepta imagenes como data URLs en una lista `images`, con soporte de hasta dos imagenes por peticion.
- Comparacion de dos imagenes: caso soportado explicitamente segun la model card.
- Entrada multimodal mixta: la misma peticion puede combinar estado textual y una o dos imagenes.
- API propia de decisiones: expone `GET /v1/models` y `POST /v1/systemone`; no expone `/v1/chat/completions`.
- Generacion de texto libre: no disponible como capacidad declarada (el modelo no se presenta como generador conversacional).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Triaje de tickets de soporte: enviando el texto del ticket como `state` y una pregunta `choice` con departamentos candidatos (facturacion, soporte tecnico, ventas), el modelo devuelve la opcion con mayor probabilidad y una `unknown_probability` que permite derivar a revision humana cuando la confianza es baja.
- Moderacion o clasificacion con abandono explicito: al usar preguntas `noul`, se obtiene una probabilidad para una proposicion concreta, y el campo `abstained` permite construir politicas que no actuen cuando el modelo no esta seguro.
- Priorizacion de colas: con preguntas de tipo `score` sobre criterios ordenados, se puede asignar un nivel de urgencia relativo a cada caso sin necesidad de etiquetas numericas externas.
- Verificacion visual de devoluciones: el ejemplo incluido en el repositorio compara una imagen de referencia del producto con la imagen devuelta por el cliente, lo que sirve para validar si el articulo recibido coincide con el enviado.
- Control de calidad en catalogo de producto: comparacion de dos imagenes para detectar discrepancias entre la foto oficial y la foto de la unidad fabricada.
- Enrutado en pipelines internos: al exponer una API de decisiones tipadas, el modelo encaja como componente determinista en un flujo mayor, donde otro sistema se encarga de la respuesta final al usuario.
- Auditoria con trazabilidad: las respuestas incluyen probabilidades y el repositorio distribuye checksums, resumenes de evaluacion e identificadores de filas de benchmark, lo que facilita reproducir la validacion de una decision concreta.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a un subconjunto de decision de 340 casos y a la comparacion de velocidad entre perfiles. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | sm120 (optimizado) | reference (FP8 original) | BF16 guardado |
|---|---|---|---|
| Subconjunto de decision (340 casos) | 258/340 | 259/340 | 263/340 |
| VRAM tras peticion larga | ~28,8 GiB | ~19,1 GiB | no disponible |
| Velocidad de scoring (casos cortos a 4K tokens) | 1,48x a 1,75x mas rapido que la referencia BF16 | linea base FP8 | referencia |

Nota: el autor indica que los resultados completos de benchmark pertenecen al perfil de referencia identificado por separado, y que el perfil optimizado paso ademas comprobaciones funcionales de vision.

## Requisitos de hardware

- VRAM minima recomendada: al menos 32 GiB libres para la carga de trabajo probada; el perfil `sm120` retuvo unos 28,8 GiB tras una peticion larga y el perfil `reference` unos 19,1 GiB.
- GPU probada: una RTX PRO 6000 Blackwell Workstation Edition (SM120, 96 GB) con limite de potencia de 395 W, en Linux x86-64. El launcher no modifica la potencia de la GPU.
- Otras arquitecturas: no cualificadas. La model card indica explicitamente que otras arquitecturas de GPU y tarjetas de 32 GB no fueron validadas.
- Cabe en GPU de consumo: no disponible; no se declara soporte para RTX 4090 ni tarjetas de 24 GB, y el requisito de 32 GiB libres lo aleja de ese segmento.
- Software: Docker con NVIDIA Container Toolkit, driver compatible con CUDA 13.0 y Python 3.11 o superior para los scripts de verificacion y ejemplos.
- Despliegue: receta Docker incluida con dos perfiles (`sm120` y `reference`). El perfil optimizado usa FlashInfer con GEMM block-FP8 CUTLASS para SM120 y cuantizador de activaciones Triton fusionado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Arranque: la primera ejecucion descarga un kernel fijado de Hugging Face y compila kernels de GPU; las siguientes pueden reutilizar la cache y funcionar en modo offline con `HF_HUB_OFFLINE=1`.
- Throughput: no disponible. El servidor procesa peticiones de GPU de forma serial y las llamadas concurrentes se encolan, sin continuous batching.
- Latencia: la unica referencia disponible es la mejora relativa de 1,48x a 1,75x en scoring frente a la referencia BF16 guardada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imajev-4B-FP8-SM120 | 4,66 B | no disponible (techo de 65.536 tokens procesados en runtime) | FP8 E4M3 mixto con LoRA FP32/BF16 y readout FP32 | apache-2.0 | HuggingFace, repositorio de 6,2 GB |
| Imajev-4B (mohit67890/imajev-4b) | no disponible | no disponible | BF16 con LoRA de rango 64 | no disponible | HuggingFace |
| Qwen3.5-4B (Qwen/Qwen3.5-4B) | no disponible (backbone del modelo) | no disponible | BF16 | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, mas alla de la comparacion interna entre los perfiles `sm120`, `reference` y las predicciones BF16 guardadas del mismo modelo.

## Limitaciones y advertencias

- Estado experimental: la model card etiqueta la release como experimental; el perfil optimizado obtuvo 258/340 frente a 263/340 del BF16 guardado, es decir, una perdida de acierto respecto a la referencia sin cuantizar.
- Mayor consumo de VRAM en el perfil optimizado: unos 28,8 GiB tras peticiones largas frente a 19,1 GiB del perfil FP8 de referencia.
- Cobertura de hardware muy limitada: solo se valido una RTX PRO 6000 Blackwell (SM120); otras arquitecturas y tarjetas de 32 GB no estan cualificadas.
- API restringida: no expone `/v1/chat/completions`, solo `POST /v1/systemone`, por lo que no sirve como sustituto directo de un endpoint conversacional.
- Sin batching continuo: el procesamiento es serial y las peticiones concurrentes se encolan, lo que limita el rendimiento en produccion con carga alta.
- Idioma: solo ingles declarado, sin soporte multilingue documentado.
- Riesgo de calibracion: aunque el modelo devuelve probabilidades calibradas y una `unknown_probability`, no se han publicado curvas de fiabilidad ni estudios de sesgo en la informacion disponible; las probabilidades deben validarse en el dominio concreto antes de usarse como umbrales automaticos.
- Alucinacion: la propia naturaleza de decision tipada reduce la generacion libre, pero el autor no documenta evaluaciones especificas de robustez ante entradas adversarias o fuera de distribucion.
- Sin entrenamiento adicional: no hubo ajuste de calibracion ni fine-tuning en esta conversion, por lo que hereda las limitaciones del Imajev original.
- Independencia del autor original: el paquete es una conversion comunitaria y se declara independiente de los autores originales de Imajev, lo que implica que las actualizaciones del proyecto upstream no se reflejan automaticamente.
- Licencia: apache-2.0, sin restricciones comerciales indicadas en la informacion disponible, aunque conviene verificar las condiciones del modelo base y del adaptador original.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/zenmagnets/Imajev-4B-FP8-SM120
- Modelo base en HuggingFace: https://huggingface.co/mohit67890/imajev-4b
- Repositorio GitHub del proyecto Imajev: https://github.com/mohit67890/imajev
- Especificacion de la API (playground-spec): https://github.com/mohit67890/imajev/blob/6ee8a2c555ca6a3d1de9eceb33f1bd1cfeb268a2/docs/playground-spec.md
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Validacion de la release (en el repositorio): benchmarks/release-validation.json
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de busqueda web disponibles.
