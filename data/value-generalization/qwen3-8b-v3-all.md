# value-generalization/qwen3-8b-v3-all

## Resumen

qwen3-8b-v3-all es un ajuste fino completo por DPO (Direct Preference Optimization) del modelo Qwen3-8B, desarrollado por el grupo de investigación value-generalization. Parte del checkpoint SFT neutro en valores `value-generalization/neutral-sft-v3-qwen3-8b` y se entrena sobre la unión completa del conjunto de preferencias `value-generalization/constitution-v3-dpo`: 196.000 pares de preferencia que cubren los 49 "tenets" (principios) de la constitución v3, con 4.000 pares por principio y un par por prompt.

El modelo no es un asistente de propósito general optimizado para producto, sino un artefacto de investigación. Se etiqueta explícitamente como "RQ3 upper bound": representa la cota superior de la pregunta de investigación 3, es decir, qué ocurre cuando se entrena un único modelo con todos los datos de alineación disponibles de golpe, en lugar de construir una rejilla de modelos orientables por valor individual. Sirve como referencia contra la que comparar estrategias de steerability y de entrenamiento desagregado por valores.

Técnicamente es un transformer denso de 8.190.735.360 parámetros (8,19B), sin mezcla de expertos, con pesos en safetensors y bf16 (16,4 GB de repositorio). La relevancia actual está en el ámbito de la alineación de valores y la evaluación de constituciones: proporciona un punto de comparación reproducible para estudiar si un único modelo multi-valor iguala o supera a modelos especializados por principio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); sin MoE |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos heredados del modelo base Qwen3-8B; el entrenamiento DPO se ejecuto con max_length 2048 y la model card no documenta ampliacion posterior |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors en bf16. No hay GGUF, AWQ ni GPTQ de este fine-tune |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3-8B cubre mas de 100 idiomas, pero el dataset de preferencias no documenta su composicion linguistica |
| Licencia | other (etiquetada como "other" en HuggingFace; no se detallan terminos en la informacion disponible) |
| Formato de pesos | safetensors (bf16), 16,4 GB de repositorio |
| Modelo base | value-generalization/neutral-sft-v3-qwen3-8b (commit f1550fe714e01e2116cc4fdf3a1d510f8fd379c7) |
| Formato de chat | qwen_chatml, plantilla fijada mas EOS en valuegen_chat_format.json |
| Dataset de entrenamiento | value-generalization/constitution-v3-dpo (196.000 pares de preferencia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B: un transformer decoder-only denso con atención por consultas agrupadas (GQA) y RoPE, sin componentes de mezcla de expertos ni capas de estado recurrente. El ajuste no modifica la topología, sino todos los pesos mediante fine-tuning completo, no LoRA.

El entrenamiento consiste en un único epoch de DPO con objetivo sigmoide y beta 0,1 sobre los 196.000 pares de preferencia del conjunto `constitution-v3-dpo`, mezclados con semilla 42. Se ejecutaron 12.250 pasos con batch efectivo de 16, tasa de aprendizaje 5e-6 con decaimiento coseno, warmup del 0,1, longitud máxima de 2.048 tokens, precisión mixta bf16 y paralelismo FSDP full-shard sobre 8 GPU. La receta está en `configs/experiments/dpo_v3_all_qwen3.yaml` y el lanzador en `scripts/0918/train_v3_all.sbatch`, con procedencia del repositorio value-generalization en el commit `669a6d8`. No se documenta RLHF, ni fase adicional de RL, ni decodificación especulativa.

La innovación metodológica no está en la arquitectura, sino en el diseño experimental: cada uno de los 49 principios constitucionales aporta exactamente 4.000 pares con un único par por prompt, de modo que el modelo ve todos los valores una sola vez y en la misma proporción. Eso lo convierte en la cota superior de "entrenar con todos los datos de alineación" frente a alternativas de entrenamiento por valor.

## Capacidades

- Generacion de texto conversacional multi-turno en formato ChatML de Qwen, con plantilla fijada y token EOS propio del export.
- Razonamiento y matematicas: capacidades heredadas del Qwen3-8B, no reevaluadas tras el DPO.
- Generacion de codigo: capacidad heredada del modelo base, sin datos especificos de codigo en el pipeline DPO documentado.
- Tool calling / function calling: el modelo base Qwen3 lo soporta mediante su plantilla de herramientas; este fine-tune no documenta un ajuste especifico ni la preservacion de esa plantilla.
- Modo thinking: Qwen3-8B dispone de modos de razonamiento explicito; la model card de este fine-tune no confirma su conservacion ni su comportamiento tras el DPO.
- Multilingue: no documentado en la model card; depende del modelo base y del idioma dominante del dataset de preferencias.
- Alineacion multi-valor: respuesta condicionada por los 49 principios de la constitucion v3, con 4.000 pares de preferencia por principio.
- Reproducibilidad experimental: receta, semilla, commits y lanzador publicados, lo que permite replicar el ajuste.
- No documentado: vision, audio, agentes multi-paso y uso de herramientas externas.

## Casos de uso

- Cota superior en estudios de alineacion de valores: sirve como referencia "train on all the alignment data" contra la que medir si rejillas de modelos orientables por valor igualan a un unico modelo multi-valor; su valor esta en la comparacion controlada, no en el despliegue.
- Evaluacion de steerability: comparar la respuesta del modelo ante los 49 principios con la del grid por valor permite cuantificar si el entrenamiento conjunto diluye la orientabilidad o la preserva.
- Generacion de pares de preferencia sinteticos: con 196.000 pares de entrenamiento como referencia, el modelo puede producir candidatos de respuesta para ampliar el dataset de constitucion y alimentar rondas posteriores de DPO.
- Red-teaming y analisis de tensiones entre valores: al haber visto los 49 principios a la vez, es util para localizar principios que entran en conflicto y estudiar como resuelve el modelo dilemas entre ellos.
- Destilacion y generacion de datos para modelos menores: se puede usar como profesor para producir respuestas anotadas por valor y entrenar modelos mas pequenos con el mismo marco constitucional.
- Auditoria de sesgos por principio: permite analizar si alguno de los 49 tenets recibe sistematicamente respuestas mas restrictivas o mas permisivas que el resto.
- Asistente conversacional interno de investigacion (solo en ingles o idioma dominante del dataset documentado, y tras validacion propia): conversaciones de contexto medio (hasta 2.048 tokens en entrenamiento) en tareas de analisis textual y resumen.
- Reproduccion de experimentos: base para reejecutar la receta DPO con variaciones de beta, semilla o subconjuntos de principios, manteniendo este modelo como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la receta de entrenamiento y la procedencia de los datos, pero no incluye tablas de MMLU, GSM8K, HumanEval, MT-Bench ni evaluaciones especificas de alineacion de valores para este checkpoint. Tampoco hay resultados de comparacion con el modelo base ni con los modelos por valor.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16,4 GB solo de pesos; con cache KV y activaciones, el minimo practico ronda 20-24 GB. Entra ajustado en una RTX 4090 (24 GB) y con holgura en A100 40 GB, L40S 48 GB o H100.
- Cuantizacion a 8 bits (Q8): alrededor de 8,7 GB de pesos; viable en RTX 4080/4090, L4 o A10G.
- Cuantizacion a 4 bits (Q4_K_M): alrededor de 5 GB de pesos; viable en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), con perdida de calidad no medida en este fine-tune.
- GPU recomendadas por escenario: A100 80 GB o H100 para servicio bf16 con concurrencia alta; A100 40 GB o L40S para servicio bf16 de una sola peticion; RTX 4090 para desarrollo y evaluacion en bf16.
- Despliegue: vLLM y TGI son las opciones naturales para safetensors en bf16; llama.cpp y Ollama requieren convertir previamente a GGUF, conversion que no se ha publicado para este checkpoint. Es obligatorio respetar la plantilla qwen_chatml y el EOS de valuegen_chat_format.json para evitar degradacion en la generacion.
- Latencia y throughput: no disponibles. Cualquier cifra depende del motor, la cuantizacion y el hardware, y no hay mediciones publicadas por el autor.
- Nota de contexto: aunque el modelo base soporta contextos largos, el entrenamiento DPO uso max_length 2048, por lo que el comportamiento mas alla de esa longitud no esta validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| qwen3-8b-v3-all | 8,19B denso | 32.768 nativos (entrenado a 2.048) | DPO completo sobre 196k pares, 49 principios | other | HuggingFace, safetensors bf16 | No |
| value-generalization/neutral-sft-v3-qwen3-8b | 8,19B denso | 32.768 nativos | SFT neutro en valores (modelo base del anterior) | no disponible | HuggingFace | No |
| Qwen3-8B (base/instruct) | 8,19B denso | 32.768 nativos, ampliable con YaRN | Preentrenamiento + post-entrenamiento general | Apache 2.0 (segun el modelo original) | HuggingFace, GGUF, AWQ, GPTQ | Si, publicados por el autor original |
| Llama-3.1-8B-Instruct | 8,03B denso | 128.000 | SFT + RLHF de proposito general | Meta Llama 3.1 Community License | HuggingFace, GGUF, multiples cuantizaciones | Si, publicados por el autor original |

La comparacion con modelos de proposito general es solo estructural: este checkpoint persigue un objetivo de investigacion en alineacion de valores y no compite en tareas de asistente generalista. No hay datos de rendimiento comparables publicados para este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, evaluaciones humanas ni analisis de regresion frente al modelo base, por lo que se desconoce si el DPO ha degradado capacidades generales como codigo, matematicas o tool calling.
- Riesgo de alucinacion: es un modelo de 8B sin verificacion factual; el ajuste por preferencias no incorpora mecanismos de grounding ni de citacion de fuentes.
- Sesgos: el modelo se alinea con una constitucion de 49 principios concreta, definida por el equipo de investigacion. Esa cosmologia de valores introduce un sesgo normativo explicito, no neutral, y puede no coincidir con las politicas de uso de un producto real.
- Desequilibrio de datos: 4.000 pares por principio es un reparto uniforme artificial que no refleja la frecuencia real de los dilemas en produccion.
- Contexto limitado en entrenamiento: max_length 2048 en el DPO, muy por debajo de la ventana nativa del modelo base; el comportamiento en contextos largos no esta validado.
- Idioma: no se documenta la composicion linguistica del dataset de preferencias, por lo que el rendimiento fuera del idioma dominante es incierto.
- Licencia: etiquetada como "other" sin terminos detallados en la informacion disponible. Antes de cualquier uso comercial hay que consultar los terminos del repositorio y, adicionalmente, respetar la licencia del Qwen3-8B original. No se puede asumir uso comercial libre.
- Adopcion nula: cero descargas y cero "me gusta" en el momento de la consulta, lo que implica ausencia de validacion externa.
- Formato de chat no estandar: requiere la plantilla y el token EOS del directorio exportado (`valuegen_chat_format.json`); usar plantillas genericas de Qwen puede degradar las respuestas.
- Repositorio sin cuantizaciones: no hay GGUF, AWQ ni GPTQ, de modo que desplegarlo en hardware de consumo exige convertir los pesos, con el riesgo de perdida de calidad no medida.
- Uso previsto: artefacto de investigacion. No deberia ponerse en produccion de cara al usuario sin una evaluacion propia de seguridad, sesgo y calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-generalization/qwen3-8b-v3-all
- Modelo base (SFT neutro en valores): https://huggingface.co/value-generalization/neutral-sft-v3-qwen3-8b
- Dataset de preferencias: https://huggingface.co/datasets/value-generalization/constitution-v3-dpo
- Repositorio de codigo value-generalization (recetas y lanzadores; commit de procedencia 669a6d8, receta configs/experiments/dpo_v3_all_qwen3.yaml, lanzador scripts/0918/train_v3_all.sbatch): no se ha encontrado la URL publica en la informacion disponible
- Qwen3-8B original: no se ha incluido la URL en la informacion proporcionada
- Resultados de busqueda web: las consultas realizadas devolvieron unicamente resultados no relacionados (calculadoras de valores de videojuegos y diccionarios de traduccion), sin papers, blogs ni demos pertinentes a este modelo.
