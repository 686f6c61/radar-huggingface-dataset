# zils-ai/z3-mini-soup-preview-2

## Resumen

z3-mini-soup-preview-2 es un checkpoint de tipo "model soup" publicado por zils-ai el 16 de noviembre de 2026. Se construye promediando uniformemente los pesos `language_model.*` de tres fine-tunes orientados a la toma de decisiones, todos ellos derivados de Qwen/Qwen3.5-4B: Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b. El resultado es un modelo de 4.539.265.536 parametros (4,54 mil millones) que hereda el tokenizador, la torre de vision, la capa de respuesta y el runtime de d3-mini (z3-mini v1).

El modelo no es una release oficial de z3-mini: es una vista previa del "soup" diario que la red Zils genera para cada tamano de modelo, promediando cuerpos de modelos de decision publicados por sus mineros y anadiendo un cuerpo solo cuando la media mejora la puntuacion. Su proposito es servir como modelo de decision (clasificacion/puntuacion de opciones en formato de pregunta-respuesta) y no como un modelo generativo de proposito general, aunque al estar construido sobre Qwen3.5-4B conserva la arquitectura transformer de ese modelo base con torre de vision.

La relevancia actual reside en que ilustra una practica emergente: la agregacion de pesos (weight averaging) como alternativa barata al reentrenamiento para combinar fine-tunes independientes. En las pruebas internas de Zils, el soup obtiene 58,1 en el conjunto sellado frente a 46,9 de d3-mini solo, lo que sugiere una mejora sustancial en la tarea de decision, aunque dichas puntuaciones no son benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) con torre de vision heredada de d3-mini; pesos `language_model.*` promediados |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 9,1 GB |
| Temperatura calibrada | 1,36 (ajustada por la red y almacenada en `model.json`) |
| Hash del soup | `4e9fcfd2642f6e7ee1c9d24bd362b388f85a5771af8a49c215e3794c3c2468c8` |

## Arquitectura y entrenamiento

El modelo no se entrena: se obtiene por promedio uniforme de pesos. Concretamente, los tensores `language_model.*` de los tres ingredientes se leen en bf16, se promedian en fp32 y se guardan de nuevo en bf16. El resto de componentes (torre de vision, capa de respuesta, tokenizador, prompt y runtime) se toman sin cambios de d3-mini; la capa de respuesta es byte a byte identica a la de d3-mini. Por tanto, la arquitectura subyacente es la de Qwen3.5-4B, un transformer de 4,54 B de parametros con capacidad de vision, sobre el que se anaden los artefactos de decision y el runtime `/v1/systemone` de la familia d3.

No hay datos de entrenamiento propios: Zils no entreno ninguno de los ingredientes ni audito sus datos. Segun las model cards de los ingredientes, sus cuerpos descienden de otros cuerpos de mineros y de modelos de decision abiertos, y sus items de entrenamiento se redactaron a partir de filas de datasets publicos, en parte generadas por otros modelos (Claude, GPT-5.4, DeepSeek y un modelo abierto local). Al menos un cuerpo de la linea de ascendencia se entreno con splits de validacion y test de datasets publicos. La innovacion tecnica destacable es el propio mecanismo de soup: agregacion diaria de cuerpos con criterio de aceptacion por puntuacion, mas el ajuste de temperatura (1,36) sobre items retenidos.

## Capacidades

- Toma de decisiones en formato texto: puntua y elige entre opciones en preguntas de decision, que es la tarea para la que se construyo y evaluo.
- Razonamiento y generacion de texto heredados de Qwen3.5-4B, aunque no documentados ni evaluados en esta ficha.
- Vision: incluye la torre de vision de d3-mini, pero las pruebas de Zils son solo de texto y no miden calidad de imagen, video ni bounding boxes.
- API compatible con `/v1/systemone` de d3-mini v3.1.0, con runtime incluido (`d3_runtime.py`, `d3_engine.py`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Puntuacion de decisiones en pipelines de clasificacion: el modelo puede recibir una pregunta con opciones y devolver una distribucion de probabilidad calibrada (temperatura 1,36), lo que permite umbralizar decisiones de forma controlada en lugar de usar generacion libre.
- Enrutamiento y triaje de tickets: dado un conjunto de categorias, el modelo puntua cada una y el sistema elige la de mayor probabilidad; su naturaleza de decision-model encaja mejor que un LLM generativo para este paso.
- Evaluacion comparativa de fine-tunes: sirve como referencia para medir si un nuevo cuerpo de minero mejora el soup, replicando el criterio de aceptacion de Zils.
- Investigacion sobre weight averaging: util como caso de estudio reproducible de model soup sobre Qwen3.5-4B, con hash y linaje documentados.
- Seleccion de respuestas en sistemas RAG: puntuar candidatos generados por otro modelo y elegir el mejor segun la probabilidad del decision-model.
- Moderacion o filtrado binario: clasificar contenido en categorias predefinidas con puntuaciones calibradas, siempre que se valide con datos propios.
- Prototipado rapido con vision: al conservar la torre de vision de d3-mini, permite experimentar con entradas mixtas texto-imagen, aunque sin garantias de calidad medida.

## Benchmarks y rendimiento

Las puntuaciones siguientes son examenes privados de Zils (Brier skill con temperatura ajustada, escala 0-100) y no son benchmarks publicos.

Conjunto sellado (25.008 preguntas):

| Modelo | Puntuacion |
|---|---|
| z3-mini-soup-preview-2 | 58,1 |
| d3-mini (z3-mini v1) solo | 46,9 |

Items de la ronda del 16 de noviembre de 2026 (modelos abiertos evaluados por separado):

| Modelo | Puntuacion |
|---|---|
| z3-mini-soup-preview-2 | 56,8 |
| torchcast-decision-4b solo | 48,3 |
| Matilda-Decision-v1-Mini solo | 47,6 |
| d3-mini (z3-mini v1) solo | 46,0 |
| pplx-decider-flash-v1.2 solo | 43,9 |

No se han publicado resultados de benchmarks publicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Con 4,54 B de parametros en bf16, el peso ocupa unos 9,1 GB; en fp16 serian los mismos 9,1 GB y en cuantizacion de 8 bits unos 4,5 GB (estimacion a partir del tamano, no dato del autor).
- GPU recomendadas: no disponible en la informacion. Por tamano, encaja en GPUs consumer con 12-16 GB o mas para bf16 (por ejemplo RTX 4070 Ti Super, RTX 4080, RTX 4090), y en A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: previsiblemente si en modelos con 12 GB o mas en bf16, y en 8 GB o menos con cuantizacion, aunque no hay datos oficiales de cuantizacion.
- Opciones de despliegue: runtime propio de d3-mini (`d3_runtime.py`, `d3_engine.py`) con API `/v1/systemone`; compatible con transformers (`custom_code`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion (examen Zils, escala 0-100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| z3-mini-soup-preview-2 | 4,54 B | No disponible | 58,1 (sellado) / 56,8 (ronda) | Apache-2.0 | Hugging Face (preview) |
| d3-mini (z3-mini v1) | No disponible | No disponible | 46,9 / 46,0 | No disponible en esta ficha | Hugging Face (release) |
| torchcast-decision-4b | No disponible | No disponible | 48,3 | No disponible | Hugging Face |
| Matilda-Decision-v1-Mini | No disponible | No disponible | 47,6 | No disponible | Hugging Face |
| pplx-decider-flash-v1.2 | No disponible | No disponible | 43,9 | No disponible | Hugging Face |

Las puntuaciones no son comparables con benchmarks publicos y proceden de examenes privados de Zils; otros evaluadores podrian ordenar los modelos de forma distinta.

## Limitaciones y advertencias

- Solo decisiones de texto: los examenes no miden calidad en imagen, video ni bounding boxes; la torre de vision es la de d3-mini y no se ha validado.
- Posible solapamiento con benchmarks: los ingredientes fueron entrenados por terceros, en parte con splits de validacion y test de datasets publicos, por lo que sus datos pueden solaparse con benchmarks publicos y las puntuaciones pueden estar infladas.
- No es una release: no ha pasado el release gate de Zils (sorteos sellados, sorteo de confirmacion y suite de adaptadores). Los adaptadores entrenados sobre z3-mini v1 no tienen garantia de funcionar.
- Datos no auditados: Zils no entreno ni audito los datos de los ingredientes, lo que impide conocer sesgos especificos de esos datasets.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de decision, el uso generativo libre no esta validado.
- Contexto e idiomas: no se documentan la longitud de contexto ni los idiomas soportados, lo que limita su uso en produccion multilingue o con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero se incluyen los NOTICE y licencias de los ingredientes (d3-mini, hm4, t2avg, m1113b y Qwen), que deben conservarse; no hay afiliacion ni aval implicito de los autores de los ingredientes, de Qwen ni de Alibaba Cloud.
- Sin garantias de calidad fuera de la tarea de decision: el resto de capacidades heredadas de Qwen3.5-4B no se han medido en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zils-ai/z3-mini-soup-preview-2
- Preview anterior del soup: https://huggingface.co/zils-ai/z3-mini-soup-preview
- Ingrediente zils-mini-hm4: https://huggingface.co/Zayaan/zils-mini-hm4/tree/435f73e951051d388fd0e59cbc9a7d0fd1de95c3
- Ingrediente zils-mini-decision-t2avg: https://huggingface.co/qhoenix/zils-mini-decision-t2avg/tree/886ea9516e22f45ad7f017cf72a1bdc64f7066ef
- Ingrediente zils-mini-m1113b: https://huggingface.co/joamCriff123/zils-mini-m1113b/tree/6ac7e4acc340a5b3b2a642e0c6fb82151b14ed58
- Instrucciones de uso de d3-mini v3.1.0: https://huggingface.co/vllm-sr/d3-mini/blob/a475367de0d8133a3c1a2a0dc12303d89cfa2ab4/README.md
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
