# SusanHill/zils-mini-alr1

## Resumen

zils-mini-alr1 es un ajuste fino por LoRA de Qwen/Qwen3.5-4B publicado por el usuario SusanHill bajo el identificador SusanHill/zils-mini-alr1. El modelo se presenta como parte de la familia "zils" y, segun la model card, se ha entrenado sobre lo que el autor denomina "d3-mini soup", es decir, una mezcla de datos de decision que cubre tool calling, razonamiento, tareas artisticas (emocion, ironia, sarcasmo, sentimiento), tareas linguisticas (inferencia y similitud textual) y recuperacion de informacion. El objetivo declarado es especializar un modelo base de 4B en tareas de clasificacion y decision estructurada.

El modelo base es Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.539 millones de parametros (4,54B) segun los pesos en safetensors, con licencia Apache-2.0. El repositorio ocupa 9,1 GB y se distribuye en formato safetensors con codigo personalizado (tag custom_code), lo que implica que su carga requiere confiar en implementaciones no estandar incluidas en el repositorio. No se han publicado resultados de benchmarks, idiomas soportados ni detalles del proceso de entrenamiento mas alla de la lista de datasets.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no dispone de pipeline declarado y su model card es extremadamente escueta. Resulta adecuado para quien quiera explorar ajustes finos de Qwen3.5-4B orientados a tareas de decision, pero no como componente listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.5-4B, tag qwen3_5) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de 4,54B parametros. Sobre esa base se aplica un ajuste fino mediante LoRA, segun indica la model card, lo que implica que los pesos publicados incorporan la adaptacion al modelo base. El repositorio incluye la etiqueta custom_code, por lo que la arquitectura exacta y el codigo de carga dependen de implementaciones incluidas por el autor y no de una clase estandar de transformers.

El entrenamiento se realizo sobre lo que el autor llama "d3-mini soup", una mezcla de conjuntos publicos de la particion de entrenamiento: tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), tareas artisticas (emocion, ironia, sarcasmo, sentimiento), tareas linguisticas (MNLI, ANLI, RTE, STS-B) y recuperacion (20 Newsgroups, Banking77, QNLI, CLINC). No se especifican el numero de tokens, la composicion exacta de la mezcla, la presencia de RLHF/DPO ni hiperparametros del LoRA. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento basico heredados del modelo base Qwen3.5-4B.
- Tool calling / function calling, entrenado explicitamente con datos de Glaive.
- Razonamiento sobre sentido comun y matemáticas elementales (SIQA, PIQA, CSQA, GSM8K, BIG-bench).
- Clasificacion de emociones, ironia, sarcasmo y sentimiento.
- Inferencia textual y similitud semantica (MNLI, ANLI, RTE, STS-B).
- Recuperacion y clasificacion de intenciones en dominios especificos (20 Newsgroups, Banking77, QNLI, CLINC).
- Capacidades multilingues: no disponibles/documentadas.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Clasificacion de intenciones en atención al cliente: el ajuste sobre Banking77 y CLINC permite etiquetar consultas entrantes en categorias predefinidas, integrable en un enrutador previo a un sistema de respuesta.
- Deteccion de sentimiento y tono en resenas o redes sociales: el entrenamiento con datos de emocion, ironia y sarcasmo lo hace util para modular respuestas automaticas o alertas de reputacion.
- Enrutamiento de tickets de soporte: la combinacion de CLINC, Banking77 y 20 Newsgroups facilita asignar tickets a colas o equipos segun el dominio detectado.
- Tool calling en agentes ligeros: al haberse entrenado con Glaive, puede emitir llamadas a funciones en flujos de automatizacion con presupuesto de computo reducido (4,54B parametros).
- Clasificacion de pares de frases para moderacion o deduplicacion: los datos de MNLI, ANLI, RTE y STS-B permiten tareas de entailment y similitud semantica en pipelines de filtrado.
- Razonamiento basico en asistentes educativos: los datos de GSM8K y BIG-bench permiten resolver problemas aritmeticos y de sentido comun de dificultad baja-media en entornos con GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 12-16 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegue con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090/3090 en fp16 y en RTX 4070/4060 Ti o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son candidatos, pero al incluir custom_code y no estar integrado en transformers de forma estandar, la conversion a GGUF puede requerir trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| zils-mini-alr1 | 4,54B | No disponible | Apache-2.0 | Experimental, sin benchmarks ni descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible en la informacion | Apache-2.0 | Modelo base oficial, con soporte de la comunidad |
| Otros ajustes de Qwen3.5-4B para clasificacion | ~4B | No disponible | Variable | No disponible |

No se dispone de datos de rendimiento para comparar con alternativas; la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones, benchmarks ni validacion independiente; el rendimiento real es desconocido.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de mantenimiento del repositorio.
- La model card es minima y no documenta datos de sesgo, composicion del dataset ni proceso de evaluacion.
- Riesgo de alucinacion inherente a un modelo de 4B ajustado con LoRA; el ajuste en tareas de decision no elimina este comportamiento en generacion abierta.
- Idiomas soportados no documentados; el uso en castellano no esta garantizado.
- La etiqueta custom_code obliga a ejecutar codigo del autor al cargar el modelo, lo que supone un riesgo de seguridad en entornos de produccion.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- No hay garantias de compatibilidad con vLLM, TGI o llama.cpp sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-mini-alr1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
